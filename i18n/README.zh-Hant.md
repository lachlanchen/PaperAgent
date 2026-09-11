[English](../README.md) · [العربية](README.ar.md) · [Español](README.es.md) · [Français](README.fr.md) · [日本語](README.ja.md) · [한국어](README.ko.md) · [Tiếng Việt](README.vi.md) · [中文 (简体)](README.zh-Hans.md) · [中文（繁體）](README.zh-Hant.md) · [Deutsch](README.de.md) · [Русский](README.ru.md)


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

PaperAgent 是一個本地優先的論文寫作網頁工作區：你可以在瀏覽器中編輯 LaTeX 與程式碼，在後端執行 Python/R 並編譯 LaTeX，並在同一頁面預覽 PDF 與日誌。

## 論文建置協助

想自行執行 PaperAgent，可以直接從本儲存庫開始。如果一篇論文需要乾淨的 LaTeX 建置和可審閱的修訂對照，[固定範圍的 250 美元服務](https://lazying.art/manuscript-sprint/?utm_source=github&utm_medium=repository&utm_campaign=manuscript_sprint_pilot&utm_content=paperagent_readme)會在免費適配檢查之前先說明範例、範圍與不包含的工作。

## 💡 Vision

PaperAgent 的設計目的是要把研究者從繁瑣雜務中解放，回到「Only Ideas」。
核心目標很簡單：保留人類的思考，讓系統處理重複性工作。
你專注於想法與敘事，PaperAgent 負責執行循環。

## 🧭 Philosophy

- 本地優先、隱私優先：資料與執行預設都保留在你的機器上。
- 想法優先的工作流程：以最小摩擦從概念走到可執行的論文。
- 小步可逆：每次變更都透明、容易回復。
- 工具應該減少工作：自動化是為了消除苦工，而不是增加負擔。

## 🛠️ Logic (how it works)

1. Chat -> Edit：描述要修改的內容，PaperAgent 會幫你編輯對應檔案。
2. Run -> Compile：執行 Python/R、編譯 LaTeX、產生圖表。
3. Preview -> Iterate：檢視 PDF 與日誌，快速修正並反覆迭代。

## 📚 Overview

PaperAgent 以 `webterm/` 為核心，這是一個以 Tornado + WebSocket 驅動的瀏覽器端 PWA 工作區：

- PTY 終端串流（`/ws`）用於互動式 shell 作業。
- Codex Bridge WebSocket/API（`/codex/ws`, `/api/codex/*`）用於以 session 為基礎的代理工作流程。
- 檔案、目錄樹與 PDF API（`/api/file`, `/api/tree`, `/api/pdf`）用於瀏覽器內編輯與預覽。
- 可選的 Postgres 持久化，儲存使用者、專案、Git 中繼資料與 Codex 歷史。
- 可選的 Docker-shell 執行，透過 `webterm/docker-shell.sh`。

### 一覽

| 區域 | 提供內容 |
|---|---|
| 工作區 | 瀏覽器終端 + 編輯器 + 檔案樹 + PDF 面板 |
| 自動化循環 | 以 prompt 驅動的編輯、編譯、檢查日誌、反覆迭代 |
| 執行時環境 | 預設為 host shell，可選 Docker shell |
| 持久化 | 預設為無狀態；可選 PostgreSQL 持久化歷史與中繼資料 |
| 文件與 i18n | 倉庫中的多語 README 集與 `i18n/` 目錄 |

## 🎯 你會得到

- 連接到 Docker 沙箱的網頁終端
- LaTeX 專案骨架與一鍵編譯
- 可用於繪圖與實驗的 Python/R 執行
- 含日誌的 PDF 預覽
- 乾淨、輕量的 PWA 介面

## ⚙️ 功能特性

- 支援 PTY 終端縮放的瀏覽器終端，並具備持續性的工作流程控制。
- 專案控制面板，支援建立工作區、LaTeX 初始化與編譯流程。
- 檔案樹 + CodeMirror 編輯器，支援儲存與可選 watch/reload 輪詢。
- 針對 `/home/<user>/Projects/<project>/latex/<file>.pdf` 的 PDF 預覽流程。
- Codex Bridge 提供 session 啟動/恢復、狀態同步與可選資料庫紀錄。
- UI 內建 Git/SSH 輔助（身份資訊儲存、remote 預填、SSH 金鑰產生與驗證）。
- Docker 感知的命令／檔案操作，必要時回退到 host shell 與檔案系統。

### 功能對照表

| 能力 | 說明 |
|---|---|
| 終端 | 透過 `/ws` 提供 WebSocket PTY 串流，供互動式 shell 工作流 |
| 代理橋接 | `/codex/ws` + `/api/codex/*` 的 session 編排 |
| 檔案 | `/api/file` 讀寫、`/api/tree` 結構瀏覽 |
| PDF 預覽 | `/api/pdf` 提供已編譯成果 |
| 控制 | 建立專案、初始化 LaTeX、編譯、Git/SSH 設定 |

## 📈 專案狀態

- PWA 工作區：Web terminal、PDF 預覽、編輯器。
- 專案控制：建立工作區、初始化 LaTeX、編譯、Git/SSH 輔助。
- Codex Bridge：session 恢復、資料庫歷史清單、`/status` 同步開關。
- 檔案樹 + CodeMirror 編輯器，支援 save/watch。
- 可選 Docker-backed 執行，包含 LaTeX/Python/R 工具鏈。

## 🎬 Demo

![PaperAgent demo](demos/demo-full.png)

## 🗂️ 專案架構

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

## 🧪 前置條件

- 作業系統：建議 Linux（預期支援 Docker 與 shell 工具鏈）。
- Python：若有現成 Conda 環境，優先使用 `paperagent`。
- 依賴套件：
  - `tornado`
  - `psycopg[binary]`（可選，但建議用於 DB 持久化功能）
- 可選執行服務：
  - Docker（用於 sandbox shell 與容器化專案路徑）
  - PostgreSQL（用於持久化使用者／專案／Codex session 歷史）
- 容器/沙箱中的可選工具鏈：
  - LaTeX（`latexmk` 與 TeX 套件）
  - Python、R
  - Node + `@openai/codex`

### 依賴矩陣

| 類型 | 元件 |
|---|---|
| 必要 | Python + `tornado` |
| 建議 | `psycopg[binary]`（用於 DB 後端能力） |
| 可選服務 | Docker、PostgreSQL |
| 可選工具鏈 | LaTeX（`latexmk`）、Python/R、Node + `@openai/codex` |

## 🚀 安裝

### 1) Clone repository（含子模組）

```bash
git clone --recurse-submodules https://github.com/lachlanchen/PaperAgent.git
cd PaperAgent
```

如果已經 clone 但未含子模組：

```bash
git submodule update --init --recursive
```

### 2) Python 環境與套件

```bash
conda activate paperagent
pip install tornado "psycopg[binary]"
```

替代方式（若你未進入 Conda 環境）：

```bash
conda run -n paperagent pip install tornado "psycopg[binary]"
```

### 3) 環境設定

```bash
cp .env.example .env
```

編輯 `.env` 以符合你的機器設定（資料庫憑證、Codex 預設值等）。

### 4) 可選資料庫初始化

```bash
./scripts/init_db.sh
```

這個指令會建立或更新 role 與 DB，並套用 `scripts/db_schema.sql`。

### 5) 可選 Docker 沙箱初始化

```bash
./scripts/setup_docker_env.sh
```

如需 NVIDIA 主機設定：

```bash
./scripts/install_nvidia_host.sh
```

## 🧑‍💻 使用方式

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

在 `--dev` 模式下，會關閉 service worker 快取，避免舊資產殘留。

### Typical UI flow

1. 在控制面板輸入使用者與專案名稱。
2. 點擊 **Create Project + cd** 建立：
   `/home/<user>/Projects/<project>/{code,data,figures,latex/latex_figures,artifacts}`
3. 點擊 **Init LaTeX** 生成 `latex/main.tex`。
4. 點擊 **Compile LaTeX**（`latexmk`）並重新整理／開啟 PDF 預覽。
5. 透過檔案樹在 CodeMirror 編輯檔案並儲存。
6. 使用 Codex Bridge 進行 prompt 驅動編輯與 session 恢復。

### API quick routes

| Endpoint | 用途 |
|---|---|
| `/api/tree` | 查詢編輯器面板的專案目錄樹 |
| `/api/file` | 讀取／寫入專案檔案 |
| `/api/pdf` | 取得已渲染的 PDF 成果 |
| `/api/codex/*` | session 生命週期、歷史、狀態同步 |
| `/codex/ws` | Codex 橋接事件的 WebSocket 通道 |

## 🔧 組態設定

PaperAgent 會從 `.env`（或 `ENV_FILE`）以及執行環境變數讀取設定。

### 核心資料庫設定

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

### 其他實用開關

- `CODEX_AUTO_RESTORE=1`：在 session ID 缺失時重建並回放已儲存歷史。
- `PROJECT_DB=1`：啟用以資料庫為基礎的專案中繼資料持久化。
- `WEBTERM_QUIET_LOGS=1`：抑制高頻輪詢與靜態資源存取噪音日誌。
- `CODEX_CMD=codex`：Codex 執行命令。
- `CODEX_CWD=/workspace`：當 user/project 路徑不可用時的回退工作目錄。
- `WEBTERM_CONTAINER=<name>`：覆寫自動偵測的容器名稱。

## 📦 範例

### 啟動並驗證終端

```bash
cd webterm
python server.py --host 127.0.0.1 --port 8765
# 在瀏覽器終端：
pwd
```

### 查詢專案樹 API

```bash
curl "http://127.0.0.1:8765/api/tree?user=paperagent&project=demo-paper&depth=4"
```

### 取得 PDF（編譯後）

```bash
curl -o main.pdf "http://127.0.0.1:8765/api/pdf?user=paperagent&project=demo-paper&file=main.pdf"
```

### 透過 API 讀取檔案

```bash
curl "http://127.0.0.1:8765/api/file?user=paperagent&project=demo-paper&path=latex/main.tex"
```

## 🧪 開發說明

- 代碼風格：
  - Python：4 空格縮排，函式保持小而直接。
  - Frontend：2 空格縮排，CSS class 使用 kebab-case。
- 目前尚未建立正式自動化測試；以手動檢查為主。
- 手動檢查：
  - 載入 PWA，連接終端，執行 `pwd`。
  - 驗證 UI 的專案建立與 LaTeX 編譯。
- 若更新 PWA 資源，請在 `webterm/static/sw.js` 中更新 service worker 快取名稱。
- 將 `codex/` 與 `overleaf/` 視為子模組；除非刻意需要，避免直接修改。

## 🩺 疑難排解

### Docker shell 權限不足

若 Docker 權限不足，請確認 shell 有 docker 群組資格：

```bash
newgrp docker
cd webterm
python server.py --host 0.0.0.0 --port 8766
```

### PDF 預覽中找不到檔案

- 確認終端中已順利完成編譯。
- 確認檔案存在於 `/home/<user>/Projects/<project>/latex/main.pdf`。
- 重新整理 PDF 面板或使用 **Open** 按鈕。

### DB 功能無法使用

- 檢查 `.env` 中的資料庫憑證。
- 確保 PostgreSQL 正常運行且可連線。
- 安裝 driver：`pip install "psycopg[binary]"`。
- 如有需要，執行 `./scripts/init_db.sh` 後重新啟動伺服器。

### 找不到 Codex 指令

- 透過 UI 安裝器（NVM + Node LTS + `@openai/codex`）或手動安裝 Codex。
- 確認 `CODEX_CMD` 與 `CODEX_NVM_DIR` 已依你的執行環境正確設定。

### LAN 綁定安全

`--host 0.0.0.0` 僅適用於可信任網路。未經授權與 TLS 前請勿公開對外開放。

## 🗺️ 開發規劃

規劃與進行中方向（見 `references/roadmap-blueprint.md` 與相關文件）：

- 改進多步驟論文自動化循環與可重現性流程。
- 擴充 Codex Bridge 的 session 可靠性與可觀測性。
- 強化 sandbox/runtime 設定路徑（CPU/GPU 變體）。
- 改善專案控制與編輯器的人機操作體驗。
- 持續推進多語言文件與網站內容對齊。

## 🌐 主專案

- https://github.com/lachlanchen/the-art-of-lazying

## 🔗 生態鏈結

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

## 🤝 貢獻

歡迎提交貢獻。

- 開一個 issue 說明問題或提案。
- 讓變更維持聚焦且小步。
- 遵循此專案的提交約定：`Add ...`、`Update ...`、`Expand ...`。
- 前端/UI 變更請在 PR 附上截圖或 GIF。
- 若更新 README，請保持所有語言版本一致（`README.*.md`）。

註：子模組的貢獻規範由其上游儲存庫個別定義（`codex/`、`overleaf/`）。

## 📜 授權

目前目錄樹上尚未提供 repository-level 的授權檔案。

- 假設：此專案目前可能仍未最終確定頂層授權內容。
- 在散佈大量修改版本前，請先確認授權意圖。
- 子模組仍遵循各自上游授權（例如 `overleaf/LICENSE`）。

## 🙏 鳴謝

- [Overleaf](https://github.com/overleaf/overleaf)：提供協作式 LaTeX 平台架構構想與元件。
- [OpenAI Codex CLI](https://github.com/openai/codex)：提供代理式終端工作流。
- `the-art-of-lazying` 生態中的產品願景與跨專案整合。


## ❤️ Support

| Donate | PayPal | Stripe |
| --- | --- | --- |
| [![Donate](https://camo.githubusercontent.com/24a4914f0b42c6f435f9e101621f1e52535b02c225764b2f6cc99416926004b7/68747470733a2f2f696d672e736869656c64732e696f2f62616467652f446f6e6174652d4c617a79696e674172742d3045413545393f7374796c653d666f722d7468652d6261646765266c6f676f3d6b6f2d6669266c6f676f436f6c6f723d7768697465)](https://chat.lazying.art/donate) | [![PayPal](https://camo.githubusercontent.com/d0f57e8b016517a4b06961b24d0ca87d62fdba16e18bbdb6aba28e978dc0ea21/68747470733a2f2f696d672e736869656c64732e696f2f62616467652f50617950616c2d526f6e677a686f754368656e2d3030343537433f7374796c653d666f722d7468652d6261646765266c6f676f3d70617970616c266c6f676f436f6c6f723d7768697465)](https://paypal.me/RongzhouChen) | [![Stripe](https://camo.githubusercontent.com/1152dfe04b6943afe3a8d2953676749603fb9f95e24088c92c97a01a897b4942/68747470733a2f2f696d672e736869656c64732e696f2f62616467652f5374726970652d446f6e6174652d3633354246463f7374796c653d666f722d7468652d6261646765266c6f676f3d737472697065266c6f676f436f6c6f723d7768697465)](https://buy.stripe.com/aFadR8gIaflgfQV6T4fw400) |
