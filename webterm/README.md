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

## Notes

- The server binds to localhost by default. Keep it that way unless you add auth and TLS.
- The terminal runs the shell from your current working directory. Use `--cwd` to change.
- Resize events are forwarded to the PTY so full-screen tools behave correctly.

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
