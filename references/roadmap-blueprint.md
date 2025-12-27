# PaperAgent Roadmap & Blueprint

## Overview

PaperAgent is a local-first research workspace that compresses the paper-writing loop into a single system: chat to edit, run code, compile LaTeX, and preview PDFs with logs. The guiding idea is “Only Ideas”: researchers keep the thinking, the system automates execution and iteration.

## Product Goals

- Minimize friction from idea → runnable paper.
- Make execution deterministic and auditable.
- Keep privacy and data local by default.
- Provide a clean, fast UI that mirrors real research workflows.

## Core User Flows

1) **Idea → Draft**
   - User describes a paper outline or section in chat.
   - System edits `latex/` and `refs.bib`.
   - Compile; show PDF + errors.

2) **Experiment → Figure**
   - User asks for a plot or analysis.
   - System edits `code/`, runs Python/R, outputs `figures/`.
   - LaTeX updates to include the new figure.

3) **Iterate → Finalize**
   - Edit + compile cycles are fast and reversible.
   - Logs highlight file/line errors for quick fixes.

## Architecture Blueprint

```
Browser (PWA)
  - UI: editor, buttons, log panel, terminal
  - Terminal: xterm.js over WebSocket
  - PWA: offline shell, cached assets
        |
        v
Tornado Host
  - WebSocket PTY bridge
  - Session management
  - Job control (compile/run)
        |
        v
Sandbox Runner (Docker)
  - /workspace mount
  - Python/R execution
  - LaTeX compile
  - Artifacts: PDF/logs/figures
```

### Frontend (PWA)
- **Left panel**: project controls, scaffold buttons, quick actions.
- **Right panel**: live terminal view.
- **Future**: embedded PDF viewer and file explorer.

### Backend (Tornado)
- **PTY WebSocket**: terminal stream via `pty` and WebSocket.
- **Shell targeting**: default to Docker shell if `webterm/docker-shell.sh` exists.
- **Job semantics** (future): typed endpoints for compile/run.

### Sandbox (Docker)
- **Per-project workspace**:
  - `/home/<user>/Projects/<project>/`
  - `code/`, `data/`, `figures/`, `latex/latex_figures`, `artifacts/`
- **Tools**: `latexmk`, `xelatex`, `python3`, `R`.

## Roadmap Phases

### Phase 0 — Foundation (Done)
- Tornado web terminal with PTY.
- PWA shell and layout with project controls.
- Docker sandbox + wrapper shell.

### Phase 1 — Paper Loop (Next)
- **LaTeX scaffold** button (already added).
- **Compile results** parsed into a panel (error line links).
- **PDF viewer** embedded in the PWA.

### Phase 2 — Code Loop
- Python/R run button with logs + artifacts.
- Figure auto-placement into `latex/`.
- Simple job history for reruns.

### Phase 3 — Structured Tools
- Replace raw shell calls with structured jobs:
  - `compile_latex`, `run_python`, `run_r`.
- Add guardrails and safe path restrictions.

### Phase 4 — Collaboration
- Optional multi-user sessions (Yjs/ShareDB).
- Shared cursor, shared compile state.

### Phase 5 — MCP Host
- Tool registry and policy engine.
- Connect MCP servers for Git/FS/Compile tools.

## Non-Goals (for now)

- Cloud hosting by default.
- Full Overleaf feature parity.
- Arbitrary remote execution without auth.

## Security Model

- Default to localhost or LAN with clear warnings.
- Docker sandbox for isolation.
- No public exposure without auth/TLS.
- Explicit directory mounts only.

## Implementation Notes

- **Service worker cache** must be bumped when UI assets change.
- Use `latexmk -pdf -interaction=nonstopmode -halt-on-error`.
- Consider smaller TeX Live packages to avoid long installs.

## Risks & Mitigations

- **Long TeX installs**: use minimal packages or prebuilt image.
- **Docker permissions**: ensure user is in `docker` group.
- **LAN exposure**: add auth before public use.

## Success Metrics

- < 60s from idea to compiled PDF.
- 1-click project scaffolding + compile.
- Stable terminal experience without desync.

