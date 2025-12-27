#!/usr/bin/env bash
set -euo pipefail

log() {
  printf "[setup] %s\n" "$*"
}

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

CONTAINER_NAME="${CONTAINER_NAME:-paperagent-sandbox}"
IMAGE="${IMAGE:-ubuntu:22.04}"
CONTAINER_USER="${CONTAINER_USER:-root}"
PROJECT_USER="${PROJECT_USER:-paperagent}"
PROJECT_ID="${PROJECT_ID:-demo-paper}"
CREATE_PROJECT_LAYOUT="${CREATE_PROJECT_LAYOUT:-1}"
TEXLIVE_PROFILE="${TEXLIVE_PROFILE:-full}"
USE_HOST_NETWORK="${USE_HOST_NETWORK:-auto}"
MOUNT_HOME="${MOUNT_HOME:-1}"
CODEX_USER="${CODEX_USER:-root}"
INSTALL_NVIDIA="${INSTALL_NVIDIA:-0}"
USE_GPU="${USE_GPU:-0}"
INSTALL_CUDA="${INSTALL_CUDA:-0}"
CUDA_PACKAGE="${CUDA_PACKAGE:-nvidia-cuda-toolkit}"

if [[ "$(uname -s)" != "Linux" ]]; then
  USE_HOST_NETWORK="0"
fi

SUDO=""
if [[ "$(id -u)" -ne 0 ]]; then
  if command -v sudo >/dev/null 2>&1; then
    SUDO="sudo"
  else
    log "Error: sudo not found; run this script as root."
    exit 1
  fi
fi

install_docker() {
  if command -v docker >/dev/null 2>&1; then
    log "Docker already installed."
    return
  fi
  log "Installing Docker (docker.io)..."
  $SUDO apt-get update
  $SUDO apt-get install -y docker.io
}

install_nvidia_host() {
  if [[ "$INSTALL_NVIDIA" != "1" ]]; then
    return
  fi
  if [[ "$(uname -s)" != "Linux" ]]; then
    log "Skipping NVIDIA driver install (non-Linux host)."
    return
  fi
  if command -v nvidia-smi >/dev/null 2>&1; then
    log "NVIDIA driver already installed."
  else
    log "Installing NVIDIA driver (may require reboot)."
    $SUDO apt-get update
    $SUDO apt-get install -y ubuntu-drivers-common
    $SUDO ubuntu-drivers autoinstall || true
  fi

  log "Installing NVIDIA Container Toolkit."
  $SUDO apt-get update
  $SUDO apt-get install -y ca-certificates curl gnupg
  distribution="$(
    . /etc/os-release
    echo "${ID}${VERSION_ID}"
  )"
  curl -fsSL https://nvidia.github.io/libnvidia-container/gpgkey | \
    $SUDO gpg --dearmor -o /usr/share/keyrings/nvidia-container-toolkit-keyring.gpg
  curl -fsSL "https://nvidia.github.io/libnvidia-container/${distribution}/libnvidia-container.list" | \
    sed 's#deb https://#deb [signed-by=/usr/share/keyrings/nvidia-container-toolkit-keyring.gpg] https://#' | \
    $SUDO tee /etc/apt/sources.list.d/nvidia-container-toolkit.list >/dev/null
  $SUDO apt-get update
  $SUDO apt-get install -y nvidia-container-toolkit
  if command -v nvidia-ctk >/dev/null 2>&1; then
    $SUDO nvidia-ctk runtime configure --runtime=docker || true
  fi
  $SUDO systemctl restart docker || true
}

ensure_docker_running() {
  if command -v systemctl >/dev/null 2>&1; then
    $SUDO systemctl enable --now docker || true
  fi
}

ensure_docker_group() {
  if [[ "$(id -u)" -eq 0 ]]; then
    return
  fi
  if id -nG "$USER" | tr ' ' '\n' | grep -qx docker; then
    return
  fi
  log "Adding $USER to the docker group (requires re-login or newgrp)."
  $SUDO usermod -aG docker "$USER" || true
}

pick_docker_cmd() {
  DOCKER_BIN=(docker)
  if ! "${DOCKER_BIN[@]}" ps >/dev/null 2>&1; then
    if command -v sudo >/dev/null 2>&1; then
      DOCKER_BIN=(sudo docker)
    else
      log "Error: Docker is installed but not accessible. Run with sudo or add user to docker group."
      exit 1
    fi
  fi
}

create_container() {
  if "${DOCKER_BIN[@]}" ps -a --format '{{.Names}}' | grep -qx "$CONTAINER_NAME"; then
    log "Container $CONTAINER_NAME already exists. Starting it."
    "${DOCKER_BIN[@]}" start "$CONTAINER_NAME" >/dev/null
    return
  fi

log "Creating container $CONTAINER_NAME from $IMAGE."
  network_args=()
  if [[ "$USE_HOST_NETWORK" != "0" ]]; then
    network_args=(--network host)
  fi

  gpu_args=()
  if [[ "$USE_GPU" == "1" ]]; then
    gpu_args=(--gpus all)
  fi

  mount_args=(-v "$PROJECT_ROOT":/workspace -w /workspace)
  if [[ "$MOUNT_HOME" == "1" ]]; then
    mount_args+=(-v "$HOME":/host-home)
  fi

  "${DOCKER_BIN[@]}" run -d --name "$CONTAINER_NAME" \
    "${network_args[@]}" \
    "${gpu_args[@]}" \
    "${mount_args[@]}" \
    -it "$IMAGE" sleep infinity
}

install_container_packages() {
  log "Installing toolchain inside container."
  if [[ "$TEXLIVE_PROFILE" == "full" ]]; then
    texlive_packages="texlive-full"
  else
    texlive_packages="texlive-latex-extra texlive-bibtex-extra texlive-fonts-recommended texlive-xetex"
  fi

  cuda_packages=""
  if [[ "$INSTALL_CUDA" == "1" ]]; then
    cuda_packages="$CUDA_PACKAGE"
  fi

  "${DOCKER_BIN[@]}" exec -u 0 "$CONTAINER_NAME" bash -lc \
    "export DEBIAN_FRONTEND=noninteractive && \
    apt-get update && \
    apt-get install -y \
      ${texlive_packages} \
      latexmk \
      python3 python3-pip \
      r-base \
      git \
      make \
      curl \
      ca-certificates \
      ${cuda_packages} && \
    rm -rf /var/lib/apt/lists/*"
}

ensure_container_user() {
  if [[ "$CONTAINER_USER" == "root" ]]; then
    return
  fi
  "${DOCKER_BIN[@]}" exec -u 0 "$CONTAINER_NAME" bash -lc \
    "id -u ${CONTAINER_USER} >/dev/null 2>&1 || useradd -m -s /bin/bash ${CONTAINER_USER}"
}

ensure_project_user() {
  "${DOCKER_BIN[@]}" exec -u 0 "$CONTAINER_NAME" bash -lc \
    "id -u ${PROJECT_USER} >/dev/null 2>&1 || useradd -m -s /bin/bash ${PROJECT_USER}"
}

create_project_layout() {
  if [[ "$CREATE_PROJECT_LAYOUT" != "1" ]]; then
    return
  fi
  log "Creating project layout in /home/${PROJECT_USER}/Projects/${PROJECT_ID}."
  "${DOCKER_BIN[@]}" exec -u 0 "$CONTAINER_NAME" bash -lc \
    "mkdir -p /home/${PROJECT_USER}/Projects/${PROJECT_ID}/{code,data,figures,latex/latex_figures,artifacts} && \
     chown -R ${PROJECT_USER}:${PROJECT_USER} /home/${PROJECT_USER}/Projects/${PROJECT_ID}"
}

install_codex() {
  log "Installing NVM + Node LTS + Codex for user ${CODEX_USER}."
  if [[ "$CODEX_USER" == "root" ]]; then
    codex_home="/root"
  else
    codex_home="/home/${CODEX_USER}"
  fi

  "${DOCKER_BIN[@]}" exec -u "$CODEX_USER" \
    -e HOME="$codex_home" \
    -e NVM_DIR="$codex_home/.nvm" \
    "$CONTAINER_NAME" bash -lc \
    "set -e && \
     export NVM_DIR=\"$codex_home/.nvm\" && \
     if [ ! -s \"\$NVM_DIR/nvm.sh\" ]; then \
       curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash; \
     fi && \
     . \"\$NVM_DIR/nvm.sh\" && \
     nvm install --lts && \
     nvm use --lts && \
     npm install -g @openai/codex && \
     hash -r && \
     command -v codex >/dev/null 2>&1 && codex --version || true"
}

main() {
  install_docker
  install_nvidia_host
  ensure_docker_running
  ensure_docker_group
  pick_docker_cmd
  create_container
  install_container_packages
  ensure_container_user
  ensure_project_user
  create_project_layout
  install_codex

  log "Done."
  log "Container: $CONTAINER_NAME"
  log "Workspace mount: $PROJECT_ROOT -> /workspace"
  if [[ "$USE_GPU" == "1" ]]; then
    log "GPU: enabled (--gpus all). Ensure NVIDIA driver + toolkit are installed."
  fi
  log "Tip: run 'newgrp docker' or re-login if docker group was just added."
}

main "$@"
