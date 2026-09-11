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

PaperAgent 是一个本地优先的论文写作 Web 工作区：你可以在浏览器里编辑 LaTeX 和代码，在后端执行 Python/R 并编译 LaTeX，同时在同一页面预览 PDF 和日志。

## 论文构建协助

想自己运行 PaperAgent，可以直接从本仓库开始。如果一篇论文需要干净的 LaTeX 构建和可审阅的修订对照，[固定范围的 250 美元服务](https://lazying.art/manuscript-sprint/?utm_source=github&utm_medium=repository&utm_campaign=manuscript_sprint_pilot&utm_content=paperagent_readme)会在免费适配检查之前先说明样例、范围和不包含的工作。

## 💡 远景

PaperAgent 的设计目标是把研究中的重复性事务减到最低，让你回到“Only Ideas”。
核心目标很简单：人负责思考，系统负责重复执行。
你专注于观点与叙事，PaperAgent 负责执行闭环。

## 🧭 理念

- 本地优先、隐私优先：默认情况下，数据和执行都保留在你的机器上。
- 以想法为先的工作流：从概念到可运行论文，尽量减少摩擦。
- 小步可逆：每次变更都清晰可追溯、易于回滚。
- 工具应减负：自动化存在的目的在于移除重复劳动，而不是增加负担。

## 🛠️ 逻辑（工作方式）

1. Chat -> Edit：说明你要改什么，PaperAgent 会编辑正确的文件。
2. Run -> Compile：执行 Python/R、编译 LaTeX、生成图表。
3. Preview -> Iterate：查看 PDF 与日志，快速修复并迭代。

## 📚 概览

PaperAgent 以 `webterm/` 为核心，这是一个由 Tornado + WebSocket 提供服务的浏览器端 PWA 工作区：

- PTY 终端流（`/ws`），用于交互式 shell 操作。
- Codex Bridge WebSocket/API（`/codex/ws`, `/api/codex/*`），用于基于会话的代理式工作流。
- 文件、树形结构与 PDF API（`/api/file`, `/api/tree`, `/api/pdf`），用于浏览器内编辑和预览。
- 可选的 Postgres 持久化，用于用户、项目、Git 元数据与 Codex 历史。
- 可选的 Docker-shell 执行路径：`webterm/docker-shell.sh`。

### 一览

| 区域 | 提供内容 |
|---|---|
| 工作区 | 浏览器终端 + 编辑器 + 文件树 + PDF 面板 |
| 自动化循环 | Prompt 驱动的编辑、编译、检查日志、反复迭代 |
| 运行时 | 默认主机 shell，可选 Docker shell |
| 持久化 | 默认无状态；可选 Postgres 持久化历史和元数据 |
| 文档与 i18n | 仓库中的多语言 README 与 `i18n/` 目录 |

## 🎯 你会获得

- 连接到 Docker 沙箱的 Web 终端
- LaTeX 项目脚手架与一键编译
- 可用于绘图和实验的 Python/R 执行
- 带日志的 PDF 预览
- 干净、轻量的 PWA 界面

## ⚙️ 功能特性

- 支持 PTY 终端尺寸调整的浏览器终端，并内置持久化的工作流控制。
- 项目控制面板可用于创建工作区、初始化 LaTeX 和编译流程。
- 文件树 + CodeMirror 编辑器，支持保存，并可选启用 watch/reload 轮询。
- 面向 `/home/<user>/Projects/<project>/latex/<file>.pdf` 的 PDF 预览流水线。
- Codex Bridge 提供会话启动/恢复、状态同步和可选的数据库日志。
- UI 中提供 Git/SSH 辅助（身份信息保存、远程配置预填、SSH 密钥生成与校验）。
- 支持 Docker 感知的命令/文件操作，并在必要时回退到主机 shell 与文件系统。

### 功能映射

| 能力 | 详情 |
|---|---|
| 终端 | 通过 `/ws` 提供 WebSocket PTY 流，支持交互式 shell 工作流 |
| 代理桥接 | `/codex/ws` 与 `/api/codex/*` 进行会话编排 |
| 文件 | `/api/file` 读写、`/api/tree` 结构浏览 |
| PDF 预览 | `/api/pdf` 提供已编译产物 |
| 控制 | 创建项目、初始化 LaTeX、编译、Git/SSH 设置 |

## 📈 项目状态

- PWA 工作区：Web 终端、PDF 预览、编辑器。
- 项目控制：创建工作区、初始化 LaTeX、编译、Git/SSH 辅助。
- Codex Bridge：会话恢复、数据库历史列表、`/status` 同步开关。
- 文件树 + CodeMirror 编辑器，支持保存/watch。
- 可选 Docker 驱动的执行环境，含 LaTeX/Python/R 工具链。

## 🎬 演示

![PaperAgent demo](demos/demo-full.png)

## 🗂️ 项目结构

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

## 🧪 前置条件

- 操作系统：推荐 Linux（Docker 和 shell 工具链已按预期可用）。
- Python：若有现成 Conda 环境请使用（`paperagent`）。
- 依赖：
  - `tornado`
  - `psycopg[binary]`（可选，但推荐用于数据库持久化功能）
- 可选运行时服务：
  - Docker（用于沙箱 shell 与容器化项目路径）
  - PostgreSQL（用于持久化用户/项目/Codex 会话历史）
- 容器/沙箱内可选工具链：
  - LaTeX（`latexmk` 与 TeX 套件）
  - Python、R
  - Node + `@openai/codex`

### 依赖矩阵

| 类型 | 组件 |
|---|---|
| 必需 | Python + `tornado` |
| 推荐 | `psycopg[binary]`（用于数据库相关能力） |
| 可选服务 | Docker、PostgreSQL |
| 可选工具链 | LaTeX（`latexmk`）、Python/R、Node + `@openai/codex` |

## 🚀 安装

### 1) 克隆仓库（含子模块）

```bash
git clone --recurse-submodules https://github.com/lachlanchen/PaperAgent.git
cd PaperAgent
```

如果已克隆但未包含子模块：

```bash
git submodule update --init --recursive
```

### 2) Python 环境与依赖

```bash
conda activate paperagent
pip install tornado "psycopg[binary]"
```

替代方案（未进入环境时）：

```bash
conda run -n paperagent pip install tornado "psycopg[binary]"
```

### 3) 配置环境变量

```bash
cp .env.example .env
```

根据你的机器修改 `.env`（数据库凭据、Codex 默认配置等）。

### 4) 可选数据库引导

```bash
./scripts/init_db.sh
```

该脚本会创建/更新角色与数据库，并应用 `scripts/db_schema.sql`。

### 5) 可选 Docker 沙箱引导

```bash
./scripts/setup_docker_env.sh
```

如需 NVIDIA 主机设置：

```bash
./scripts/install_nvidia_host.sh
```

## 🧑‍💻 使用方式

### 本地运行（推荐默认）

```bash
cd webterm
python server.py --host 127.0.0.1 --port 8765
```

打开：`http://127.0.0.1:8765`

### 使用 Docker shell 运行

```bash
cd webterm
python server.py --host 0.0.0.0 --port 8766 --shell ./docker-shell.sh
```

### 开发热重载模式

```bash
cd webterm
python server.py --host 127.0.0.1 --port 8765 --dev
```

在 `--dev` 模式下，会禁用 service worker 缓存以避免资源过期。

### 常见 UI 流程

1. 在控制面板输入用户和项目。
2. 点击 **Create Project + cd** 创建：
   `/home/<user>/Projects/<project>/{code,data,figures,latex/latex_figures,artifacts}`
3. 点击 **Init LaTeX** 生成 `latex/main.tex`。
4. 点击 **Compile LaTeX**（`latexmk`）并刷新/打开 PDF 预览。
5. 通过文件树在 CodeMirror 里编辑文件并保存。
6. 使用 Codex Bridge 进行 Prompt 驱动编辑与会话恢复。

### API 快速路由

| Endpoint | 用途 |
|---|---|
| `/api/tree` | 查询编辑面板的项目目录树 |
| `/api/file` | 读取/写入项目文件 |
| `/api/pdf` | 获取已渲染的 PDF 产物 |
| `/api/codex/*` | 会话生命周期、历史、状态同步 |
| `/codex/ws` | Codex 桥接事件的 WebSocket 通道 |

## 🔧 配置

PaperAgent 会从 `.env`（或 `ENV_FILE`）以及进程环境读取环境变量。

### 核心数据库配置

```bash
DB_HOST=localhost
DB_PORT=5432
DB_NAME=paperagent_db
DB_USER=lachlan
DB_PASSWORD=change_me
```

### Codex 默认配置

```bash
CODEX_LOG_DB=1
CODEX_LOG_OUTPUT=1
CODEX_USERNAME=lachlan
CODEX_PROJECT=demo-paper
CODEX_ARGS="-s danger-full-access -a never"
CODEX_NVM_DIR=/root/.nvm
CODEX_HISTORY_MESSAGES=1000
```

### 其他实用开关

- `CODEX_AUTO_RESTORE=1`：在会话 ID 缺失时重建并回放历史。
- `PROJECT_DB=1`：启用基于数据库的项目元数据持久化。
- `WEBTERM_QUIET_LOGS=1`：减少轮询与静态访问日志噪音。
- `CODEX_CMD=codex`：Codex 可执行命令。
- `CODEX_CWD=/workspace`：当用户/项目路径不可用时的回退工作目录。
- `WEBTERM_CONTAINER=<name>`：覆盖自动检测的容器名。

## 📦 示例

### 启动并验证终端

```bash
cd webterm
python server.py --host 127.0.0.1 --port 8765
# 在浏览器终端中：
pwd
```

### 查询项目树 API

```bash
curl "http://127.0.0.1:8765/api/tree?user=paperagent&project=demo-paper&depth=4"
```

### 获取 PDF（编译后）

```bash
curl -o main.pdf "http://127.0.0.1:8765/api/pdf?user=paperagent&project=demo-paper&file=main.pdf"
```

### 通过 API 读取文件

```bash
curl "http://127.0.0.1:8765/api/file?user=paperagent&project=demo-paper&path=latex/main.tex"
```

## 🧪 开发说明

- 代码风格：
  - Python：4 空格缩进，函数保持小而直接。
  - 前端：2 空格缩进，CSS 类名使用 kebab-case。
- 当前尚无正式自动化测试套件；以手工校验为主。
- 手工检查：
  - 加载 PWA，连接终端，执行 `pwd`。
  - 验证 UI 中的项目创建与 LaTeX 编译。
- 如果更新了 PWA 资源，请在 `webterm/static/sw.js` 中更新 service worker 缓存名。
- 将 `codex/` 与 `overleaf/` 视作子模块；除非有意，不要直接改动其中内容。

## 🩺 故障排查

### Docker shell 权限不足

如果 Docker 访问失败，请确保当前 shell 用户在 docker 组中：

```bash
newgrp docker
cd webterm
python server.py --host 0.0.0.0 --port 8766
```

### PDF 未在预览中显示

- 确认终端编译流程执行成功。
- 确认文件确实存在于 `/home/<user>/Projects/<project>/latex/main.pdf`。
- 刷新 PDF 面板，或使用 **Open** 按钮。

### DB 功能不可用

- 检查 `.env` 中数据库凭据。
- 确保 PostgreSQL 正在运行并可访问。
- 安装数据库驱动：`pip install "psycopg[binary]"`。
- 如有需要，运行 `./scripts/init_db.sh` 并重启服务。

### 未找到 Codex 命令

- 通过 UI 安装程序安装 Codex（NVM + Node LTS + `@openai/codex`）或手动安装。
- 确保 `CODEX_CMD` 与 `CODEX_NVM_DIR` 在你的运行环境中配置正确。

### LAN 绑定安全性

`--host 0.0.0.0` 仅用于可信网络。请勿在无认证与 TLS 的情况下公开暴露。

## 🗺️ 路线图

参考：`references/roadmap-blueprint.md` 及相关文档。

- 改进多步论文自动化闭环与可复现性流程。
- 扩展 Codex Bridge 的会话稳定性与可观测性。
- 强化沙箱/运行时配置路径（CPU/GPU 场景）。
- 改进项目控制与编辑器操作体验。
- 持续推进多语言文档与网站内容对齐。

## 🌐 主项目

- https://github.com/lachlanchen/the-art-of-lazying

## 🔗 生态系统链接

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

## 🤝 贡献

欢迎提交贡献。

- 打开 issue 描述你要解决的问题或提案。
- 保持改动聚焦且小步迭代。
- 遵循仓库约定的提交风格：`Add ...`、`Update ...`、`Expand ...`。
- 对前端/UI 变更，请在 PR 中附上截图或 GIF。
- 若更新 README，请保持所有语言版本同步（`README.*.md`）。

注：子模块有各自的贡献规范，由其上游仓库定义（`codex/`、`overleaf/`）。

## 📜 许可证

当前仓库树根目录暂无仓库级许可证文件。

- 假设：当前项目可能尚未确认并发布最终顶层许可证文件。
- 在分发大量修改版本前，请先确认许可证意图。
- 子模块遵循其各自上游许可证（例如 `overleaf/LICENSE`）。

## 🙏 鸣谢

- [Overleaf](https://github.com/overleaf/overleaf) 为协作式 LaTeX 平台的架构思路与组件提供灵感。
- [OpenAI Codex CLI](https://github.com/openai/codex) 提供代理式终端工作流能力。
- `the-art-of-lazying` 生态中的产品愿景与跨项目协作能力。


## ❤️ Support

| Donate | PayPal | Stripe |
| --- | --- | --- |
| [![Donate](https://camo.githubusercontent.com/24a4914f0b42c6f435f9e101621f1e52535b02c225764b2f6cc99416926004b7/68747470733a2f2f696d672e736869656c64732e696f2f62616467652f446f6e6174652d4c617a79696e674172742d3045413545393f7374796c653d666f722d7468652d6261646765266c6f676f3d6b6f2d6669266c6f676f436f6c6f723d7768697465)](https://chat.lazying.art/donate) | [![PayPal](https://camo.githubusercontent.com/d0f57e8b016517a4b06961b24d0ca87d62fdba16e18bbdb6aba28e978dc0ea21/68747470733a2f2f696d672e736869656c64732e696f2f62616467652f50617950616c2d526f6e677a686f754368656e2d3030343537433f7374796c653d666f722d7468652d6261646765266c6f676f3d70617970616c266c6f676f436f6c6f723d7768697465)](https://paypal.me/RongzhouChen) | [![Stripe](https://camo.githubusercontent.com/1152dfe04b6943afe3a8d2953676749603fb9f95e24088c92c97a01a897b4942/68747470733a2f2f696d672e736869656c64732e696f2f62616467652f5374726970652d446f6e6174652d3633354246463f7374796c653d666f722d7468652d6261646765266c6f676f3d737472697065266c6f676f436f6c6f723d7768697465)](https://buy.stripe.com/aFadR8gIaflgfQV6T4fw400) |
