[English](../README.md) · [العربية](README.ar.md) · [Español](README.es.md) · [Français](README.fr.md) · [日本語](README.ja.md) · [한국어](README.ko.md) · [Tiếng Việt](README.vi.md) · [中文 (简体)](README.zh-Hans.md) · [中文（繁體）](README.zh-Hant.md) · [Deutsch](README.de.md) · [Русский](README.ru.md)


<p align="center">
  <img src="https://raw.githubusercontent.com/lachlanchen/lachlanchen/main/logos/banner.png" alt="PaperAgent banner" width="100%">
</p>

[![Main Project](https://img.shields.io/badge/Main%20Project-the--art--of--lazying-0f766e?style=for-the-badge)](https://github.com/lachlanchen/the-art-of-lazying) [![Main Website](https://img.shields.io/badge/Main%20Website-lazying.art-0f766e?style=for-the-badge)](https://lazying.art)

# PaperAgent

[![Local First](https://img.shields.io/badge/Local--First-Yes-0f766e?style=flat-square)](#overview)
[![PWA](https://img.shields.io/badge/PWA-Enabled-2563eb?style=flat-square)](#overview)
[![Backend](https://img.shields.io/badge/Backend-Tornado-7c3aed?style=flat-square)](#overview)
[![Terminal](https://img.shields.io/badge/PTY-WebSocket-0891b2?style=flat-square)](#features)
[![Docker Optional](https://img.shields.io/badge/Docker-Optional-0ea5e9?style=flat-square)](#prerequisites)
[![Postgres Optional](https://img.shields.io/badge/PostgreSQL-Optional-1d4ed8?style=flat-square)](#prerequisites)
[![License](https://img.shields.io/badge/License-Pending-lightgrey?style=flat-square)](#license)

PaperAgent 是一個 local-first 的論文寫作網頁工作空間：你可以在瀏覽器編輯 LaTeX 與程式碼、在後端執行 Python/R 並編譯 LaTeX，且在同一處預覽 PDF 與檢視日誌。

## Vision

PaperAgent 的建立目標，是把每個人從研究中的繁瑣雜務解放到「Only Ideas」。  
核心目標很簡單：保留人類的思考，把重複性工作交給系統。  
你專注在想法與敘事，PaperAgent 負責執行迴圈。

## Philosophy

- Local-first、privacy-first：資料與執行預設都留在你的機器上。
- Idea-first workflow：以最小摩擦，從概念走到可執行的論文。
- 小步且可逆：每次變更都透明、容易回復。
- 工具應該減少工作：自動化是為了消除苦工，不是增加負擔。

## Logic (how it works)

1. Chat -> Edit：描述變更需求，PaperAgent 會編輯正確的檔案。
2. Run -> Compile：執行 Python/R、編譯 LaTeX、產生圖表。
3. Preview -> Iterate：檢視 PDF + 日誌，快速修正，反覆迭代。

## Overview

PaperAgent 以 `webterm/` 為核心，這是一個 Tornado + WebSocket 伺服器，提供瀏覽器中的 PWA 工作空間：

- PTY terminal 串流（`/ws`）用於互動式 shell 工作。
- Codex Bridge WebSocket/API（`/codex/ws`、`/api/codex/*`）用於以 session 為基礎的 agent 工作流程。
- 檔案、目錄樹與 PDF API（`/api/file`、`/api/tree`、`/api/pdf`）用於瀏覽器內編輯與預覽。
- 可選的 Postgres 持久化，儲存使用者、專案、git 中繼資料與 Codex 歷史。
- 可透過 `webterm/docker-shell.sh` 啟用可選的 Docker-shell 執行模式。

### At a glance

| Area | What it provides |
|---|---|
| Workspace | Browser terminal + editor + file tree + PDF panel |
| Automation loop | Prompt-driven edits, compile, inspect logs, iterate |
| Runtime | Host shell by default, Docker shell optional |
| Persistence | Stateless mode by default; optional Postgres-backed history/metadata |
| Docs/i18n | Multi-language README set and `i18n/` directory in repo |

## What you get

- 連接 Docker sandbox 的網頁終端機
- LaTeX 專案骨架與一鍵編譯
- 用於圖表與實驗的 Python/R 執行
- 含日誌的 PDF 預覽
- 乾淨、極簡的 PWA 介面

## Features

- 支援 PTY resize 的瀏覽器終端機與持久化工作流程控制。
- 用於工作空間建立、LaTeX 初始化與編譯流程的專案控制面板。
- 檔案樹 + CodeMirror 編輯器，支援儲存與可選的 watch/reload 輪詢。
- 對應 `/home/<user>/Projects/<project>/latex/<file>.pdf` 的 PDF 預覽管線。
- Codex Bridge，支援 session start/resume、狀態同步與可選 DB 記錄。
- UI 內建 Git/SSH 輔助（身分設定保存、remote 預填、SSH 金鑰產生/檢查）。
- 可感知 Docker 的命令/檔案操作，並可回退到 host shell/filesystem。

### Feature map

| Capability | Details |
|---|---|
| Terminal | WebSocket PTY stream via `/ws`, interactive shell workflow |
| Agent bridge | `/codex/ws` + `/api/codex/*` session orchestration |
| Files | `/api/file` read/write, `/api/tree` structure browsing |
| PDF preview | `/api/pdf` serving compiled artifacts |
| Controls | Create project, init LaTeX, compile, Git/SSH setup |

## Project status

- PWA workspace：web terminal、PDF 預覽、編輯器。
- Project Controls：建立工作空間、初始化 LaTeX、編譯、Git/SSH 輔助。
- Codex Bridge：session 恢復、DB 歷史清單、/status sync 切換。
- 具備 save/watch 的檔案樹 + CodeMirror 編輯器。
- 可選的 Docker-backed 執行，包含 LaTeX/Python/R 工具鏈。

## Demo

![PaperAgent demo](demos/demo-full.png)

## Project Structure

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

## Prerequisites

- OS：建議 Linux（預期使用 Docker 與 shell 工具鏈）。
- Python：可用時請使用既有 Conda 環境（`paperagent`）。
- 相依套件：
  - `tornado`
  - `psycopg[binary]`（可選但建議，用於 DB-backed 功能）
- 可選執行服務：
  - Docker（用於 sandbox shell 與容器化專案路徑）
  - PostgreSQL（用於持久化 users/projects/Codex session history）
- 容器/sandbox 內可選工具鏈：
  - LaTeX（`latexmk` 與 TeX 套件）
  - Python、R
  - Node + `@openai/codex`

### Dependency matrix

| Type | Components |
|---|---|
| Required | Python + `tornado` |
| Recommended | `psycopg[binary]` for DB-backed capabilities |
| Optional services | Docker, PostgreSQL |
| Optional toolchains | LaTeX (`latexmk`), Python/R, Node + `@openai/codex` |

## Installation

### 1) Clone repository (with submodules)

```bash
git clone --recurse-submodules https://github.com/lachlanchen/PaperAgent.git
cd PaperAgent
```

如果先前 clone 時沒有帶 submodules：

```bash
git submodule update --init --recursive
```

### 2) Python environment and packages

```bash
conda activate paperagent
pip install tornado "psycopg[binary]"
```

替代方式（若你不在 env 內）：

```bash
conda run -n paperagent pip install tornado "psycopg[binary]"
```

### 3) Environment configuration

```bash
cp .env.example .env
```

依你的機器設定編輯 `.env`（DB 憑證、Codex 預設值等）。

### 4) Optional database bootstrap

```bash
./scripts/init_db.sh
```

這會建立/更新 role + DB，並套用 `scripts/db_schema.sql`。

### 5) Optional Docker sandbox bootstrap

```bash
./scripts/setup_docker_env.sh
```

NVIDIA 主機設定（若需要）：

```bash
./scripts/install_nvidia_host.sh
```

## Usage

### Run locally (recommended default)

```bash
cd webterm
python server.py --host 127.0.0.1 --port 8765
```

開啟：`http://127.0.0.1:8765`

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

在 `--dev` 模式下，會停用 service worker 快取以避免舊資產殘留。

### Typical UI flow

1. 在控制面板輸入 user + project。
2. 點擊 **Create Project + cd** 建立：
   `/home/<user>/Projects/<project>/{code,data,figures,latex/latex_figures,artifacts}`
3. 點擊 **Init LaTeX** 產生 `latex/main.tex`。
4. 點擊 **Compile LaTeX**（`latexmk`）並重新整理/開啟 PDF 預覽。
5. 透過檔案樹在 CodeMirror 編輯檔案並儲存。
6. 使用 Codex Bridge 進行 prompt-driven 編輯與 session 恢復。

### API quick routes

| Endpoint | Purpose |
|---|---|
| `/api/tree` | Query project directory tree for editor panel |
| `/api/file` | Read/write project files |
| `/api/pdf` | Fetch rendered PDF artifacts |
| `/api/codex/*` | Session lifecycle, history, status sync |
| `/codex/ws` | WebSocket channel for Codex bridge events |

## Configuration

PaperAgent 會從 `.env`（或 `ENV_FILE`）及程序環境讀取環境變數。

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

- `CODEX_AUTO_RESTORE=1`：重建遺失的 session IDs 並重播已儲存歷史。
- `PROJECT_DB=1`：啟用 DB-backed 專案中繼資料持久化。
- `WEBTERM_QUIET_LOGS=1`：抑制輪詢/靜態資源存取等較雜訊的日誌。
- `CODEX_CMD=codex`：Codex 可執行命令。
- `CODEX_CWD=/workspace`：當 user/project 路徑不可用時的回退工作目錄。
- `WEBTERM_CONTAINER=<name>`：覆寫自動偵測的容器名稱。

## Examples

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

## Development Notes

- 程式碼風格：
  - Python：4 個空白縮排，函式小而直接。
  - Frontend：2 個空白縮排，CSS class 採 kebab-case。
- 目前尚無正式自動化測試套件；以手動檢查為主。
- 手動檢查：
  - 載入 PWA、連線 terminal、執行 `pwd`。
  - 驗證 UI 的專案建立與 LaTeX 編譯動作。
- 若你更新了 PWA 資產，請在 `webterm/static/sw.js` bump service worker cache name。
- `codex/` 與 `overleaf/` 為 submodule；除非有明確需求，避免直接在此處修改。

## Troubleshooting

### Docker shell permission denied

如果 docker 存取失敗，請確認目前 shell 具有 docker 群組成員資格：

```bash
newgrp docker
cd webterm
python server.py --host 0.0.0.0 --port 8766
```

### PDF not found in preview

- 確認 terminal 中編譯已成功完成。
- 確認檔案存在於 `/home/<user>/Projects/<project>/latex/main.pdf`。
- 重新整理 PDF 面板或使用 **Open** 按鈕。

### DB features not available

- 檢查 `.env` 中的 DB 憑證。
- 確認 Postgres 正在執行且可連線。
- 安裝 driver：`pip install "psycopg[binary]"`。
- 如有需要，執行 `./scripts/init_db.sh` 後重啟 server。

### Codex command not found

- 透過 UI installer（NVM + Node LTS + `@openai/codex`）或手動方式安裝 Codex。
- 確認 `CODEX_CMD` 與 `CODEX_NVM_DIR` 已依執行環境正確設定。

### LAN binding safety

`--host 0.0.0.0` 僅適用於受信任網路。未加上 auth/TLS 前請勿公開暴露。

## Roadmap

規劃中與進行中的方向（見 `references/roadmap-blueprint.md` 與相關文件）：

- 改善多步驟論文自動化迴圈與可重現性工作流程。
- 擴充 Codex Bridge 的 session 可靠性與可觀測性。
- 強化 sandbox/runtime 設定路徑（CPU/GPU 變體）。
- 改善專案控制與編輯器操作體驗。
- 持續推進多語文件與網站內容對齊。

## Main project

- https://github.com/lachlanchen/the-art-of-lazying

## Ecosystem links

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

## Donate

<div align="center">
<table style="margin:0 auto; text-align:center; border-collapse:collapse;">
  <tr>
    <td style="text-align:center; vertical-align:middle; padding:6px 12px;">
      <a href="https://chat.lazying.art/donate">https://chat.lazying.art/donate</a>
    </td>
    <td style="text-align:center; vertical-align:middle; padding:6px 12px;">
      <a href="https://chat.lazying.art/donate"><img src="https://raw.githubusercontent.com/lachlanchen/the-art-of-lazying/main/figs/donate_button.svg" alt="Donate" height="44"></a>
    </td>
  </tr>
  <tr>
    <td style="text-align:center; vertical-align:middle; padding:6px 12px;">
      <a href="https://paypal.me/RongzhouChen">
        <img src="https://img.shields.io/badge/PayPal-Donate-003087?logo=paypal&logoColor=white" alt="Donate with PayPal">
      </a>
    </td>
    <td style="text-align:center; vertical-align:middle; padding:6px 12px;">
      <a href="https://buy.stripe.com/aFadR8gIaflgfQV6T4fw400">
        <img src="https://img.shields.io/badge/Stripe-Donate-635bff?logo=stripe&logoColor=white" alt="Donate with Stripe">
      </a>
    </td>
  </tr>
  <tr>
    <td style="text-align:center; vertical-align:middle; padding:6px 12px;"><strong>WeChat</strong></td>
    <td style="text-align:center; vertical-align:middle; padding:6px 12px;"><strong>Alipay</strong></td>
  </tr>
  <tr>
    <td style="text-align:center; vertical-align:middle; padding:6px 12px;"><img alt="WeChat QR" src="https://raw.githubusercontent.com/lachlanchen/the-art-of-lazying/main/figs/donate_wechat.png" width="240"/></td>
    <td style="text-align:center; vertical-align:middle; padding:6px 12px;"><img alt="Alipay QR" src="https://raw.githubusercontent.com/lachlanchen/the-art-of-lazying/main/figs/donate_alipay.png" width="240"/></td>
  </tr>
</table>
</div>

你的支持能持續支撐我的研究、開發與營運，讓我能分享更多開源專案與改進成果。

## Contributing

歡迎貢獻。

- 開 issue 說明問題或提案。
- 讓變更維持聚焦且小步。
- 遵循此 repo 的 commit 風格：`Add ...`、`Update ...`、`Expand ...`。
- Frontend/UI 變更請在 PR 附上截圖或 GIF。
- 若更新 README 內容，請保持所有語言版本一致（`README.*.md`）。

註：submodule 的貢獻規範由其上游倉庫各自定義（`codex/`、`overleaf/`）。

## License

目前根目錄樹中沒有 repository-level 授權檔。

- 假設：此專案目前可能以尚未定稿的頂層授權狀態分享。
- 在重新散布大量修改版本前，請先確認授權意圖。
- Submodule 仍遵循各自上游授權（例如 `overleaf/LICENSE`）。

## Acknowledgements

- [Overleaf](https://github.com/overleaf/overleaf)：提供協作式 LaTeX 平台基礎設施理念與元件。
- [OpenAI Codex CLI](https://github.com/openai/codex)：提供 agentic terminal workflow。
- 更廣泛的 `the-art-of-lazying` 生態系：提供產品願景與跨專案整合。
