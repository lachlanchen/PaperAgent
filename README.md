[English](README.md) · [العربية](i18n/README.ar.md) · [Español](i18n/README.es.md) · [Français](i18n/README.fr.md) · [日本語](i18n/README.ja.md) · [한국어](i18n/README.ko.md) · [Tiếng Việt](i18n/README.vi.md) · [中文 (简体)](i18n/README.zh-Hans.md) · [中文（繁體）](i18n/README.zh-Hant.md) · [Deutsch](i18n/README.de.md) · [Русский](i18n/README.ru.md)


[![LazyingArt banner](https://github.com/lachlanchen/lachlanchen/raw/main/figs/banner.png)](https://github.com/lachlanchen/lachlanchen/blob/main/figs/banner.png)

[![Main Project](https://img.shields.io/badge/Main%20Project-the--art--of--lazying-0f766e?style=for-the-badge)](https://github.com/lachlanchen/the-art-of-lazying) [![Main Website](https://img.shields.io/badge/Main%20Website-lazying.art-0f766e?style=for-the-badge)](https://lazying.art)
[![GitHub stars](https://img.shields.io/github/stars/lachlanchen/PaperAgent?style=for-the-badge&label=Stars&color=0f766e)](https://github.com/lachlanchen/PaperAgent/stargazers)
[![GitHub issues](https://img.shields.io/github/issues/lachlanchen/PaperAgent?style=for-the-badge&label=Issues&color=7c3aed)](https://github.com/lachlanchen/PaperAgent/issues)
[![Docs](https://img.shields.io/badge/Docs-README-2563eb?style=for-the-badge)](README.md)

# PaperAgent

[![Local First](https://img.shields.io/badge/Local--First-Yes-0f766e?style=flat-square)](#overview)
[![PWA](https://img.shields.io/badge/PWA-Enabled-2563eb?style=flat-square)](#overview)
[![Backend](https://img.shields.io/badge/Backend-Tornado-7c3aed?style=flat-square)](#overview)
[![Terminal](https://img.shields.io/badge/PTY-WebSocket-0891b2?style=flat-square)](#features)
[![Docker Optional](https://img.shields.io/badge/Docker-Optional-0ea5e9?style=flat-square)](#prerequisites)
[![Postgres Optional](https://img.shields.io/badge/PostgreSQL-Optional-1d4ed8?style=flat-square)](#prerequisites)
[![License](https://img.shields.io/badge/License-Pending-lightgrey?style=flat-square)](#license)

PaperAgent is a local-first web workspace for writing papers: edit LaTeX and code in the browser, run Python/R and compile LaTeX on the backend, and preview PDFs with logs in one place.

## 💡 Vision

PaperAgent is built to liberate everyone from research busy-work to “Only Ideas.”  
The goal is simple: keep the thinking human and make the system do the repetitive work.  
You focus on the idea and the narrative; PaperAgent handles the execution loops.

## 🧭 Philosophy

- Local-first, privacy-first: data and execution stay on your machine by default.
- Idea-first workflow: move from a concept to a runnable paper with minimal friction.
- Small, reversible steps: every change is transparent and easy to undo.
- Tools should remove work: automation exists to delete toil, not add it.

## 🛠️ Logic (how it works)

1. Chat -> Edit: describe the change, and PaperAgent edits the right files.
2. Run -> Compile: execute Python/R, compile LaTeX, generate figures.
3. Preview -> Iterate: inspect PDF + logs, fix fast, repeat.

## 📚 Overview

PaperAgent is centered on `webterm/`, a Tornado + WebSocket server that powers a browser-based PWA workspace:

- PTY terminal streaming (`/ws`) for interactive shell work.
- Codex Bridge WebSocket/API (`/codex/ws`, `/api/codex/*`) for session-based agent workflows.
- File, tree, and PDF APIs (`/api/file`, `/api/tree`, `/api/pdf`) for in-browser editing and preview.
- Optional Postgres-backed persistence for users, projects, git metadata, and Codex history.
- Optional Docker-shell execution via `webterm/docker-shell.sh`.

### At a glance

| Area | What it provides |
|---|---|
| Workspace | Browser terminal + editor + file tree + PDF panel |
| Automation loop | Prompt-driven edits, compile, inspect logs, iterate |
| Runtime | Host shell by default, Docker shell optional |
| Persistence | Stateless mode by default; optional Postgres-backed history/metadata |
| Docs/i18n | Multi-language README set and `i18n/` directory in repo |

## 🎯 What You Get

- Web terminal connected to a Docker sandbox
- LaTeX project scaffolding and one-click compile
- Python/R execution for figures and experiments
- PDF preview with logs
- A clean, minimal PWA interface

## ⚙️ Features

- Browser terminal with PTY resize support and persistent workflow controls.
- Project control panel for workspace creation, LaTeX init, and compile flows.
- File tree + CodeMirror editor with save and optional watch/reload polling.
- PDF preview pipeline for `/home/<user>/Projects/<project>/latex/<file>.pdf`.
- Codex Bridge with session start/resume, status sync, and optional DB logging.
- Git/SSH helpers in UI (identity save, remote prefill, SSH key generation/check).
- Docker-aware command/file operations with fallback to host shell/filesystem.

### Feature map

| Capability | Details |
|---|---|
| Terminal | WebSocket PTY stream via `/ws`, interactive shell workflow |
| Agent bridge | `/codex/ws` + `/api/codex/*` session orchestration |
| Files | `/api/file` read/write, `/api/tree` structure browsing |
| PDF preview | `/api/pdf` serving compiled artifacts |
| Controls | Create project, init LaTeX, compile, Git/SSH setup |

## 📈 Project Status

- PWA workspace: web terminal, PDF preview, editor.
- Project Controls: create workspace, init LaTeX, compile, Git/SSH helpers.
- Codex Bridge: session resume, DB history list, /status sync toggle.
- File tree + CodeMirror editor with save/watch.
- Docker-backed execution (optional) with LaTeX/Python/R toolchain.

## 🎬 Demo

![PaperAgent demo](demos/demo-full.png)

## 🗂️ Project Structure

```text
PaperAgent/
├─ README.md
├─ README.{ar,es,fr,ja,ko,vi,zh-Hans,zh-Hant}.md
├─ AGENTS.md
├─ .env.example
├─ .github/FUNDING.yml
├─ webterm/
│  ├─ server.py
│  ├─ README.md
│  ├─ docker-shell.sh
│  └─ static/
├─ scripts/
│  ├─ setup_docker_env.sh
│  ├─ init_db.sh
│  ├─ db_schema.sql
│  └─ install_nvidia_host.sh
├─ references/
│  ├─ database-setup.md
│  ├─ sandbox-tutorial.md
│  ├─ webterm-project-controls.md
│  ├─ roadmap-blueprint.md
│  └─ ...
├─ docs/
├─ demos/
├─ figs/
├─ logos/
├─ i18n/
├─ codex/      (git submodule)
└─ overleaf/   (git submodule)
```

## 🧪 Prerequisites

- OS: Linux recommended (Docker and shell tooling expected).
- Python: use the existing Conda env (`paperagent`) when available.
- Dependencies:
  - `tornado`
  - `psycopg[binary]` (optional but recommended for DB-backed features)
- Optional runtime services:
  - Docker (for sandbox shell and containerized project paths)
  - PostgreSQL (for persisted users/projects/Codex session history)
- Optional toolchains inside sandbox/container:
  - LaTeX (`latexmk` and TeX packages)
  - Python, R
  - Node + `@openai/codex`

### Dependency matrix

| Type | Components |
|---|---|
| Required | Python + `tornado` |
| Recommended | `psycopg[binary]` for DB-backed capabilities |
| Optional services | Docker, PostgreSQL |
| Optional toolchains | LaTeX (`latexmk`), Python/R, Node + `@openai/codex` |

## 🚀 Installation

### 1) Clone repository (with submodules)

```bash
git clone --recurse-submodules https://github.com/lachlanchen/PaperAgent.git
cd PaperAgent
```

If already cloned without submodules:

```bash
git submodule update --init --recursive
```

### 2) Python environment and packages

```bash
conda activate paperagent
pip install tornado "psycopg[binary]"
```

Alternative (if not inside env):

```bash
conda run -n paperagent pip install tornado "psycopg[binary]"
```

### 3) Environment configuration

```bash
cp .env.example .env
```

Edit `.env` for your machine (DB credentials, Codex defaults, etc.).

### 4) Optional database bootstrap

```bash
./scripts/init_db.sh
```

This creates/updates role + DB and applies `scripts/db_schema.sql`.

### 5) Optional Docker sandbox bootstrap

```bash
./scripts/setup_docker_env.sh
```

For NVIDIA host setup (if needed):

```bash
./scripts/install_nvidia_host.sh
```

## 🧑‍💻 Usage

### Run locally (recommended default)

```bash
cd webterm
python server.py --host 127.0.0.1 --port 8765
```

Open: `http://127.0.0.1:8765`

### Run with Docker shell target

```bash
cd webterm
python server.py --host 0.0.0.0 --port 8766 --shell ./docker-shell.sh
```

### Dev auto-reload mode

```bash
cd webterm
python server.py --host 127.0.0.1 --port 8765 --dev
```

In `--dev` mode, service worker caching is disabled to avoid stale assets.

### Typical UI flow

1. Enter user + project in the control panel.
2. Click **Create Project + cd** to create:
   `/home/<user>/Projects/<project>/{code,data,figures,latex/latex_figures,artifacts}`
3. Click **Init LaTeX** to scaffold `latex/main.tex`.
4. Click **Compile LaTeX** (`latexmk`) and refresh/open PDF preview.
5. Edit files in CodeMirror via file tree and save.
6. Use Codex Bridge for prompt-driven edits and session resume.

### API quick routes

| Endpoint | Purpose |
|---|---|
| `/api/tree` | Query project directory tree for editor panel |
| `/api/file` | Read/write project files |
| `/api/pdf` | Fetch rendered PDF artifacts |
| `/api/codex/*` | Session lifecycle, history, status sync |
| `/codex/ws` | WebSocket channel for Codex bridge events |

## 🔧 Configuration

PaperAgent reads env vars from `.env` (or `ENV_FILE`) and process environment.

### Core DB settings

```bash
DB_HOST=localhost
DB_PORT=5432
DB_NAME=paperagent_db
DB_USER=lachlan
DB_PASSWORD=change_me
```

### Codex defaults

```bash
CODEX_LOG_DB=1
CODEX_LOG_OUTPUT=1
CODEX_USERNAME=lachlan
CODEX_PROJECT=demo-paper
CODEX_ARGS="-s danger-full-access -a never"
CODEX_NVM_DIR=/root/.nvm
CODEX_HISTORY_MESSAGES=1000
```

### Additional useful toggles

- `CODEX_AUTO_RESTORE=1`: recreate missing session IDs and replay stored history.
- `PROJECT_DB=1`: enable DB-backed project metadata persistence.
- `WEBTERM_QUIET_LOGS=1`: suppress noisy polling/static access logs.
- `CODEX_CMD=codex`: Codex executable command.
- `CODEX_CWD=/workspace`: fallback working directory when user/project path is unavailable.
- `WEBTERM_CONTAINER=<name>`: override detected container name.

## 📦 Examples

### Launch and verify terminal

```bash
cd webterm
python server.py --host 127.0.0.1 --port 8765
# in browser terminal:
pwd
```

### Query project tree API

```bash
curl "http://127.0.0.1:8765/api/tree?user=paperagent&project=demo-paper&depth=4"
```

### Fetch PDF (after compile)

```bash
curl -o main.pdf "http://127.0.0.1:8765/api/pdf?user=paperagent&project=demo-paper&file=main.pdf"
```

### Read file through API

```bash
curl "http://127.0.0.1:8765/api/file?user=paperagent&project=demo-paper&path=latex/main.tex"
```

## 🧪 Development Notes

- Code style:
  - Python: 4-space indentation, small direct functions.
  - Frontend: 2-space indentation, kebab-case CSS class names.
- No formal automated test suite yet; manual checks are primary.
- Manual checks:
  - Load PWA, connect terminal, run `pwd`.
  - Verify project creation and LaTeX compile actions from UI.
- If you update PWA assets, bump service worker cache name in `webterm/static/sw.js`.
- Treat `codex/` and `overleaf/` as submodules; avoid direct edits here unless intentional.

## 🩺 Troubleshooting

### Docker shell permission denied

If docker access fails, ensure your shell has docker-group membership:

```bash
newgrp docker
cd webterm
python server.py --host 0.0.0.0 --port 8766
```

### PDF not found in preview

- Confirm compile completed successfully in terminal.
- Confirm file exists at `/home/<user>/Projects/<project>/latex/main.pdf`.
- Refresh PDF panel or use **Open** button.

### DB features not available

- Check `.env` DB credentials.
- Ensure Postgres is running and reachable.
- Install driver: `pip install "psycopg[binary]"`.
- If needed, run `./scripts/init_db.sh` and restart server.

### Codex command not found

- Install Codex via UI installer (NVM + Node LTS + `@openai/codex`) or manually.
- Ensure `CODEX_CMD` and `CODEX_NVM_DIR` are set correctly for your runtime context.

### LAN binding safety

`--host 0.0.0.0` is for trusted networks only. Do not expose publicly without auth/TLS.

## 🗺️ Roadmap

Planned and in-progress direction (see `references/roadmap-blueprint.md` and related docs):

- Improve multi-step paper automation loop and reproducibility workflows.
- Expand Codex Bridge session reliability and observability.
- Harden sandbox/runtime setup paths (CPU/GPU variants).
- Improve project controls and editor ergonomics.
- Continue multilingual docs and website alignment.

## 🌐 Main project

- https://github.com/lachlanchen/the-art-of-lazying

## 🔗 Ecosystem links

- https://lazying.art 🎨 <img src="https://img.shields.io/badge/Main-Visit-0f766e?style=flat-square" alt="Main site">
- https://onlyideas.art 💡 <img src="https://img.shields.io/badge/Ideas-Visit-0f766e?style=flat-square" alt="OnlyIdeas">
- https://chat.lazying.art 🧠
- https://paper.lazying.art 📄
- https://coin.lazying.art 🪙
- https://earn.lazying.art 💸
- https://learn.lazying.art 📚
- https://robot.lazying.art 🤖
- https://glass.lazying.art 👓
- https://ideas.onlyideas.art 🧪

## 🤝 Contributing

Contributions are welcome.

- Open an issue describing the problem/proposal.
- Keep changes focused and small.
- Follow commit style used in this repo: `Add ...`, `Update ...`, `Expand ...`.
- For frontend/UI changes, include screenshots or GIFs in PRs.
- If updating README content, keep all language variants aligned (`README.*.md`).

Note: submodule contribution policies are defined upstream in their own repositories (`codex/`, `overleaf/`).

## ❤️ Support

| Donate | PayPal | Stripe |
| --- | --- | --- |
| [![Donate](https://camo.githubusercontent.com/24a4914f0b42c6f435f9e101621f1e52535b02c225764b2f6cc99416926004b7/68747470733a2f2f696d672e736869656c64732e696f2f62616467652f446f6e6174652d4c617a79696e674172742d3045413545393f7374796c653d666f722d7468652d6261646765266c6f676f3d6b6f2d6669266c6f676f436f6c6f723d7768697465)](https://chat.lazying.art/donate) | [![PayPal](https://camo.githubusercontent.com/d0f57e8b016517a4b06961b24d0ca87d62fdba16e18bbdb6aba28e978dc0ea21/68747470733a2f2f696d672e736869656c64732e696f2f62616467652f50617950616c2d526f6e677a686f754368656e2d3030343537433f7374796c653d666f722d7468652d6261646765266c6f676f3d70617970616c266c6f676f436f6c6f723d7768697465)](https://paypal.me/RongzhouChen) | [![Stripe](https://camo.githubusercontent.com/1152dfe04b6943afe3a8d2953676749603fb9f95e24088c92c97a01a897b4942/68747470733a2f2f696d672e736869656c64732e696f2f62616467652f5374726970652d446f6e6174652d3633354246463f7374796c653d666f722d7468652d6261646765266c6f676f3d737472697065266c6f676f436f6c6f723d7768697465)](https://buy.stripe.com/aFadR8gIaflgfQV6T4fw400) |

## 📜 License

Repository-level license file is not present at the root in the current tree.

- Assumption: this project may currently be shared without a finalized top-level license file.
- Confirm licensing intent before redistributing substantial modified versions.
- Submodules carry their own upstream licenses (for example, `overleaf/LICENSE`).

## 🙏 Acknowledgements

- [Overleaf](https://github.com/overleaf/overleaf) for collaborative LaTeX platform infrastructure ideas and components.
- [OpenAI Codex CLI](https://github.com/openai/codex) for agentic terminal workflows.
- The broader `the-art-of-lazying` ecosystem for product vision and cross-project integration.
