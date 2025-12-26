# Sandbox Tutorial (Docker, with near-full access)

This tutorial gives you a "soft sandbox" that still has almost full network and filesystem access. The idea is simple:

- Run your shell inside a Docker container.
- Mount your project into the container.
- Keep networking open (host network on Linux, default bridge on macOS/Windows).

This is not a hard security boundary. It is mainly for clean dependencies, process isolation, and repeatability.

## What you will get

- A container that runs your shell and tools.
- Full access to your project files (via bind mounts).
- Almost full network access (outbound network works; host networking on Linux).
- A web terminal that connects to that container.

## What to install

- Docker Engine (or Podman)
- Optional: `docker compose`

## Install Docker

### Ubuntu/Debian

```
sudo apt-get update
sudo apt-get install -y docker.io
sudo usermod -aG docker $USER
newgrp docker
```

### macOS (Docker Desktop)

1. Install Docker Desktop from docker.com.
2. Open Docker Desktop once to finish setup.
3. Confirm:

```
docker version
```

### Windows (Docker Desktop + WSL2)

1. Install Docker Desktop and enable WSL2.
2. In WSL, confirm:

```
docker version
```

## Step 1: Create a long-running sandbox container

From your project root:

```
docker run -d --name paperagent-sandbox \
  --network host \
  -v "$PWD":/workspace \
  -v "$HOME":/host-home \
  -w /workspace \
  -it ubuntu:22.04 sleep infinity
```

Notes:
- `--network host` only works on Linux. On macOS/Windows, remove it and use the default bridge network.
- `-v "$PWD":/workspace` exposes your project files inside the container.
- `-v "$HOME":/host-home` is optional and gives access to your home directory.

If you are on macOS/Windows, use this instead:

```
docker run -d --name paperagent-sandbox \
  -v "$PWD":/workspace \
  -v "$HOME":/host-home \
  -w /workspace \
  -it ubuntu:22.04 sleep infinity
```

## Step 2: Install tools inside the container (optional but recommended)

If you want LaTeX, Python, and R inside the sandbox:

```
docker exec -it paperagent-sandbox bash
apt-get update
apt-get install -y \
  texlive-full \
  latexmk \
  python3 python3-pip \
  r-base \
  git \
  make
exit
```

This makes the container heavy but complete. If you want a smaller image, install only what you need.

## Step 3: Connect the web terminal to the container

Option A: use a wrapper script (recommended for the web terminal)

```
cat > webterm/docker-shell.sh <<'EOF'
#!/usr/bin/env bash
exec docker exec -it paperagent-sandbox bash
EOF
chmod +x webterm/docker-shell.sh
```

Run the web terminal using the wrapper:

```
cd webterm
python server.py --host 0.0.0.0 --port 8766 --shell ./docker-shell.sh
```

Option B: manual attach (debug or ad-hoc use)

```
docker exec -it paperagent-sandbox bash
```

## Step 4: LAN access (optional)

If you want LAN access to the web terminal:

```
python server.py --host 0.0.0.0 --port 8766 --shell ./docker-shell.sh
```

Open `http://<LAN_IP>:8766` from another device.

Warning: this exposes your shell to anyone on your LAN. Add auth before exposing beyond trusted networks.

## Diagram: host vs container filesystem

```
Host filesystem                       Container filesystem
-----------------                     ----------------------
~/ProjectsLFS/PaperAgent  <----bind---->  /workspace
~/.ssh (host)            (only if you mount it)

Image layer (ubuntu:22.04) + container writable layer
exists only inside the container unless you mount paths.
```

Summary:
- The container has its own filesystem by default.
- Host files are only visible inside the container if you bind-mount them (`-v host:container`).
- Changes under `/workspace` are shared with the host because of the bind mount.

## Share this setup with others (Dockerfile)

You can make a reusable Docker image so others can run the same toolchain.

Example `Dockerfile` (save as `Dockerfile.sandbox`):

```
FROM ubuntu:22.04

ENV DEBIAN_FRONTEND=noninteractive

RUN apt-get update && apt-get install -y \
  texlive-full \
  latexmk \
  python3 python3-pip \
  r-base \
  git \
  make \
  && rm -rf /var/lib/apt/lists/*

WORKDIR /workspace
```

Build and run:

```
docker build -t paperagent-sandbox -f Dockerfile.sandbox .
docker run -d --name paperagent-sandbox \
  --network host \
  -v "$PWD":/workspace \
  -w /workspace \
  -it paperagent-sandbox sleep infinity
```

Now anyone can build the image and run the same environment.

## Troubleshooting: common errors

### Error: `No such container: paperagent-sandbox`

This means the container was never created or is stopped. Create it first:

```
cd ~/ProjectsLFS/PaperAgent
docker run -d --name paperagent-sandbox \
  --network host \
  -v "$PWD":/workspace \
  -v "$HOME":/host-home \
  -w /workspace \
  -it ubuntu:22.04 sleep infinity
```

If it already exists but is stopped:

```
docker start paperagent-sandbox
```

### Error: apt lock or permission denied

This happens when you ran `apt-get` on the host (not inside the container) or without root.

Fix it by entering the container and running `apt-get` as root:

```
docker exec -it paperagent-sandbox bash
apt-get update
apt-get install -y texlive-full latexmk python3 python3-pip r-base git make
exit
```

If you want to avoid confusion, run it as a single command:

```
docker exec -u 0 paperagent-sandbox bash -lc "apt-get update && apt-get install -y texlive-full latexmk python3 python3-pip r-base git make"
```

### Error: `permission denied` running Docker

You are not in the `docker` group or need to re-login. Options:

```
sudo usermod -aG docker $USER
newgrp docker
```

Or just prefix Docker commands with `sudo`.

If you still get permission denied, the Docker daemon may not be running:

```
sudo systemctl enable --now docker
```

If you ran `newgrp docker` and later see permission denied again, you may have exited the subshell. Run `newgrp docker` again or open a new terminal after logging out/in.

If you are still stuck, use `sudo docker ...` to proceed immediately, then fix group membership later.

## File ownership gotcha

If the container runs as root, files created in your project may become root-owned. You can fix this by running as your user:

```
docker run -d --name paperagent-sandbox \
  --network host \
  --user "$(id -u):$(id -g)" \
  -v "$PWD":/workspace \
  -w /workspace \
  -it ubuntu:22.04 sleep infinity
```

If you need to install packages, temporarily `docker exec` as root.

## Clean up

```
docker rm -f paperagent-sandbox
```

## How sandboxed is this?

This is a soft sandbox:
- Process isolation: yes
- Filesystem isolation: partial (you explicitly mount host paths)
- Network isolation: no (host networking on Linux, full outbound network on others)

If you want stricter isolation later, remove host networking and mount only the project directory.
