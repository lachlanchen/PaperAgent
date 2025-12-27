# PaperAgent Web Terminal (Tornado + PWA)

A minimal web terminal served by Tornado with a PWA shell. It runs a local shell via PTY and streams it to the browser over WebSocket.

## Install

Activate your environment, then install Tornado:

```
conda activate paperagent
pip install tornado
```

## Run

```
cd webterm
python server.py --host 127.0.0.1 --port 8765
```

Open http://127.0.0.1:8765 in your browser.

## Dev auto-reload

Start the server with `--dev` to auto-reload the browser when code changes:

```
python server.py --host 127.0.0.1 --port 8765 --dev
```

In dev mode, the PWA service worker is disabled to avoid stale assets.

## Notes

- If `webterm/docker-shell.sh` exists and is executable, the server will use it by default (Docker shell).
- To force the host shell, pass `--shell /bin/bash` (or your preferred shell).
- The server binds to localhost by default. Keep it that way unless you add auth and TLS.
- The terminal runs the shell from your current working directory. Use `--cwd` to change.
- Resize events are forwarded to the PTY so full-screen tools behave correctly.
- The PDF preview panel fetches `/api/pdf?user=<user>&project=<project>&file=main.pdf` and streams it from the container.
- The editor panel uses CodeMirror (loaded from CDN) and reads/writes files via `/api/file`.

## LAN access (unsafe unless you trust the network)

Bind to all interfaces and open the LAN IP in your browser:

```
python server.py --host 0.0.0.0 --port 8766
```

Find your LAN IP with:

```
hostname -I
```

Then open `http://<LAN_IP>:8766`. Do not expose this to the internet without auth/TLS.

## Docker shell permissions

If the Docker shell fails with "permission denied", make sure the web server is started from a shell that has Docker group access:

```
newgrp docker
cd webterm
python server.py --host 0.0.0.0 --port 8766
```

If you do not want to log out, `newgrp docker` starts a new shell with the right group membership.
