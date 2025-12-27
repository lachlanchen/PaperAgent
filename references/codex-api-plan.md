# Codex CLI API Bridge Plan

## Goal

Expose Codex CLI as a backend service so the PWA can:
- start or resume a Codex session
- send prompts without entering the interactive CLI
- stream responses back to the browser

## Proposed architecture

### Backend

- Add a **CodexSessionManager** in `webterm/server.py`.
- Each session owns:
  - a PTY master fd
  - a Codex process (spawned via `docker exec` if container mode)
  - a ring buffer of recent output (for reconnect/resume)
- Session key is a short ID (client-provided or server-generated).

### Transport

- Add a new WebSocket: `/codex/ws?session=<id>`
- When a client connects:
  - if session exists: attach and stream output
  - if not: spawn a new Codex process and stream output
- WebSocket messages:
  - `{type: "prompt", text: "..."}`
  - `{type: "control", action: "new" | "stop"}`

### Codex command

- Default command (override via env):
  - `CODEX_CMD=codex`
  - `CODEX_ARGS="-s danger-full-access -a never"`
- If Docker shell is active, wrap with:
  - `docker exec -it paperagent-sandbox bash -lc "cd /workspace && codex ..."`

### Frontend

- Add a **Codex panel** below the editor:
  - session id input + New/Resume buttons
  - prompt input (multiline)
  - output stream window
  - Send (Ctrl/Cmd+Enter)
- Store the session id in `localStorage` to resume after refresh.

## Edge cases

- If Docker permission is missing, surface a clear error in the Codex panel.
- If the Codex process exits, mark session as closed and allow re-create.
- If output is large, keep a fixed-size buffer (e.g., last 4–8k lines).

## Implementation steps

1) Add Codex session manager + `/codex/ws` endpoint in `webterm/server.py`.
2) Add Codex UI panel + WebSocket client in `webterm/static/`.
3) Update docs in `webterm/README.md` and `references/`.
4) Bump service worker cache version.
