# Repository Guidelines

## Project Structure & Module Organization

- `webterm/`: Tornado server and PWA frontend.
  - `webterm/server.py`: WebSocket PTY bridge (host or Docker shell).
  - `webterm/static/`: PWA assets (HTML/CSS/JS, icons, service worker).
- `references/`: Design notes and operational guides (e.g., sandbox, project controls).
- `README*.md`: Multi-language documentation.
- `codex/` and `overleaf/`: Git submodules (do not edit directly here).

## Build, Test, and Development Commands

- `conda activate paperagent`: Use the project Python environment.
- `pip install tornado "psycopg[binary]"`: Install backend dependencies in the env (preferred for Python 3.13+).
- `conda run -n paperagent pip install tornado "psycopg[binary]"`: Use this when you are not inside the env.
- `cd webterm && python server.py --host 127.0.0.1 --port 8765`: Run the PWA locally.
- `python server.py --host 0.0.0.0 --port 8766 --shell ./docker-shell.sh`: Run against Docker shell.

## Coding Style & Naming Conventions

- Python: 4-space indentation, keep functions small and direct.
- Frontend: 2-space indentation, use `kebab-case` for CSS class names.
- Use ASCII text unless a file already uses Unicode (e.g., localized READMEs).
- Prefer small, readable patches over large refactors.

## Testing Guidelines

- No automated test suite yet.
- Manual checks:
  - Load the PWA, connect terminal, run a simple command (e.g., `pwd`).
  - Verify buttons create project folders and LaTeX compile runs in terminal.

## Commit & Pull Request Guidelines

- Commit messages follow short, imperative style: `Add ...`, `Update ...`, `Expand ...`.
- Keep commits focused (one feature or doc update per commit).
- PRs should include:
  - Clear description of changes.
  - UI screenshots/GIFs for frontend updates.
  - Notes on any new runtime dependencies or ports.
- When code changes are requested and completed, commit and push by default unless the requester says otherwise.

## Security & Configuration Tips

- Default to localhost binding unless LAN access is required.
- Docker access requires the `docker` group or `sudo`.
- Avoid exposing the web terminal to the public internet without auth/TLS.

## Agent-Specific Notes

- If updating READMEs, maintain all language variants.
- When updating PWA assets, bump the service worker cache name to invalidate stale assets.
