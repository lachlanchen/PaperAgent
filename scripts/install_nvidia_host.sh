#!/usr/bin/env bash
set -euo pipefail

log() {
  printf "[gpu] %s\n" "$*"
}

if [[ "$(uname -s)" != "Linux" ]]; then
  log "This script targets Linux (Ubuntu/Debian)."
  exit 1
fi

if ! command -v sudo >/dev/null 2>&1; then
  log "sudo not found; run as root."
  exit 1
fi

log "Installing NVIDIA driver (Ubuntu/Debian)."
sudo apt-get update
sudo apt-get install -y ubuntu-drivers-common
sudo ubuntu-drivers autoinstall || true

log "Installing NVIDIA Container Toolkit."
sudo apt-get install -y ca-certificates curl gnupg
distribution=$(. /etc/os-release; echo "${ID}${VERSION_ID}")
curl -fsSL https://nvidia.github.io/libnvidia-container/gpgkey | \
  sudo gpg --dearmor -o /usr/share/keyrings/nvidia-container-toolkit-keyring.gpg
curl -fsSL "https://nvidia.github.io/libnvidia-container/${distribution}/libnvidia-container.list" | \
  sed 's#deb https://#deb [signed-by=/usr/share/keyrings/nvidia-container-toolkit-keyring.gpg] https://#' | \
  sudo tee /etc/apt/sources.list.d/nvidia-container-toolkit.list >/dev/null
sudo apt-get update
sudo apt-get install -y nvidia-container-toolkit

if command -v nvidia-ctk >/dev/null 2>&1; then
  sudo nvidia-ctk runtime configure --runtime=docker || true
fi
sudo systemctl restart docker || true

log "Done. Reboot if nvidia-smi does not work."
