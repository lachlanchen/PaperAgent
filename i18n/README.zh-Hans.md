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

PaperAgent 是一个本地优先的论文写作 Web 工作区：你可以在浏览器中编辑 LaTeX 和代码，在后端运行 Python/R 并编译 LaTeX，并在同一界面查看 PDF 与日志。

## 愿景

PaperAgent 的构建目标是把所有人从研究中的繁琐事务里解放出来，回到“Only Ideas”。  
目标很简单：让人类专注思考，让系统处理重复劳动。  
你只需关注想法与叙事，PaperAgent 负责执行闭环。

## 理念

- 本地优先、隐私优先：默认情况下，数据与执行都留在你的机器上。
- 想法优先工作流：以最小摩擦从概念走向可运行论文。
- 小步可回退：每次变更都透明且易于撤销。
- 工具应减少工作：自动化应消除重复劳动，而不是制造更多负担。

## 逻辑（工作方式）

1. Chat -> Edit：描述改动，PaperAgent 自动编辑正确文件。
2. Run -> Compile：执行 Python/R、编译 LaTeX、生成图表。
3. Preview -> Iterate：查看 PDF + 日志，快速修复并迭代。

## 概览

PaperAgent 以 `webterm/` 为核心，这是一个 Tornado + WebSocket 服务器，支撑基于浏览器的 PWA 工作区：

- PTY 终端流（`/ws`），用于交互式 shell 工作。
- Codex Bridge WebSocket/API（`/codex/ws`, `/api/codex/*`），用于基于会话的代理工作流。
- 文件、目录树和 PDF API（`/api/file`, `/api/tree`, `/api/pdf`），用于浏览器内编辑与预览。
- 可选的 Postgres 持久化，用于用户、项目、Git 元数据和 Codex 历史。
- 可选的 Docker shell 执行，通过 `webterm/docker-shell.sh`。

### 一览表

| 区域 | 提供内容 |
|---|---|
| 工作区 | 浏览器终端 + 编辑器 + 文件树 + PDF 面板 |
| 自动化循环 | Prompt 驱动编辑、编译、日志检查与迭代 |
| 运行时 | 默认主机 shell，可选 Docker shell |
| 持久化 | 默认无状态；可选 Postgres 历史/元数据存储 |
| 文档/i18n | 多语言 README 及仓库内 `i18n/` 目录 |

## 你将获得

- 连接到 Docker 沙箱的 Web 终端
- LaTeX 项目脚手架与一键编译
- 用于图表和实验的 Python/R 执行能力
- 带日志的 PDF 预览
- 简洁、轻量的 PWA 界面

## 功能

- 浏览器终端，支持 PTY 尺寸调整与持久化工作流控制。
- 项目控制面板，用于工作区创建、LaTeX 初始化与编译流程。
- 文件树 + CodeMirror 编辑器，支持保存与可选 watch/reload 轮询。
- 面向 `/home/<user>/Projects/<project>/latex/<file>.pdf` 的 PDF 预览管线。
- Codex Bridge，支持会话启动/恢复、状态同步与可选数据库日志。
- UI 内 Git/SSH 辅助（身份保存、远端预填、SSH 密钥生成/检查）。
- 识别 Docker 的命令/文件操作，并在需要时回退到主机 shell/文件系统。

### 功能映射

| 能力 | 说明 |
|---|---|
| 终端 | 通过 `/ws` 的 WebSocket PTY 流，支持交互式 shell 工作流 |
| 代理桥接 | `/codex/ws` + `/api/codex/*` 会话编排 |
| 文件 | `/api/file` 读写，`/api/tree` 结构浏览 |
| PDF 预览 | `/api/pdf` 提供编译产物 |
| 控制 | 创建项目、初始化 LaTeX、编译、Git/SSH 设置 |

## 项目状态

- PWA 工作区：Web 终端、PDF 预览、编辑器。
- 项目控制：创建工作区、初始化 LaTeX、编译、Git/SSH 辅助。
- Codex Bridge：会话恢复、数据库历史列表、`/status` 同步开关。
- 文件树 + CodeMirror 编辑器，支持保存/watch。
- 可选 Docker 支撑执行环境，含 LaTeX/Python/R 工具链。

## 演示

![PaperAgent demo](demos/demo-full.png)

## 项目结构

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

## 前置要求

- 操作系统：推荐 Linux（预期可用 Docker 与 shell 工具链）。
- Python：优先使用现有 Conda 环境（`paperagent`）。
- 依赖：
  - `tornado`
  - `psycopg[binary]`（可选，但推荐用于数据库功能）
- 可选运行时服务：
  - Docker（用于沙箱 shell 与容器化项目路径）
  - PostgreSQL（用于持久化 users/projects/Codex 会话历史）
- 沙箱/容器内可选工具链：
  - LaTeX（`latexmk` 与 TeX 包）
  - Python, R
  - Node + `@openai/codex`

### 依赖矩阵

| 类型 | 组件 |
|---|---|
| 必需 | Python + `tornado` |
| 推荐 | `psycopg[binary]`（用于数据库能力） |
| 可选服务 | Docker, PostgreSQL |
| 可选工具链 | LaTeX（`latexmk`）、Python/R、Node + `@openai/codex` |

## 安装

### 1) 克隆仓库（含子模块）

```bash
git clone --recurse-submodules https://github.com/lachlanchen/PaperAgent.git
cd PaperAgent
```

如果此前克隆时未包含子模块：

```bash
git submodule update --init --recursive
```

### 2) Python 环境与包

```bash
conda activate paperagent
pip install tornado "psycopg[binary]"
```

替代方式（未进入环境时）：

```bash
conda run -n paperagent pip install tornado "psycopg[binary]"
```

### 3) 环境配置

```bash
cp .env.example .env
```

根据你的机器编辑 `.env`（数据库凭据、Codex 默认值等）。

### 4) 可选数据库初始化

```bash
./scripts/init_db.sh
```

此脚本会创建/更新角色与数据库，并应用 `scripts/db_schema.sql`。

### 5) 可选 Docker 沙箱初始化

```bash
./scripts/setup_docker_env.sh
```

NVIDIA 主机配置（如需要）：

```bash
./scripts/install_nvidia_host.sh
```

## 使用

### 本地运行（默认推荐）

```bash
cd webterm
python server.py --host 127.0.0.1 --port 8765
```

打开：`http://127.0.0.1:8765`

### 以 Docker shell 作为目标运行

```bash
cd webterm
python server.py --host 0.0.0.0 --port 8766 --shell ./docker-shell.sh
```

### 开发自动重载模式

```bash
cd webterm
python server.py --host 127.0.0.1 --port 8765 --dev
```

在 `--dev` 模式下，会禁用 service worker 缓存以避免静态资源陈旧。

### 典型 UI 流程

1. 在控制面板输入 user + project。
2. 点击 **Create Project + cd** 创建：
   `/home/<user>/Projects/<project>/{code,data,figures,latex/latex_figures,artifacts}`
3. 点击 **Init LaTeX** 生成 `latex/main.tex`。
4. 点击 **Compile LaTeX**（`latexmk`）并刷新/打开 PDF 预览。
5. 在文件树中用 CodeMirror 编辑并保存。
6. 使用 Codex Bridge 进行 Prompt 驱动编辑和会话恢复。

### API 快速路由

| Endpoint | 用途 |
|---|---|
| `/api/tree` | 为编辑面板查询项目目录树 |
| `/api/file` | 读写项目文件 |
| `/api/pdf` | 获取渲染后的 PDF 产物 |
| `/api/codex/*` | 会话生命周期、历史、状态同步 |
| `/codex/ws` | Codex bridge 事件的 WebSocket 通道 |

## 配置

PaperAgent 从 `.env`（或 `ENV_FILE`）以及进程环境读取环境变量。

### 核心数据库设置

```bash
DB_HOST=localhost
DB_PORT=5432
DB_NAME=paperagent_db
DB_USER=lachlan
DB_PASSWORD=change_me
```

### Codex 默认值

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

- `CODEX_AUTO_RESTORE=1`：重建缺失的会话 ID 并回放已存历史。
- `PROJECT_DB=1`：启用数据库驱动的项目元数据持久化。
- `WEBTERM_QUIET_LOGS=1`：抑制轮询/静态访问的噪声日志。
- `CODEX_CMD=codex`：Codex 可执行命令。
- `CODEX_CWD=/workspace`：当 user/project 路径不可用时的后备工作目录。
- `WEBTERM_CONTAINER=<name>`：覆盖自动检测的容器名称。

## 示例

### 启动并验证终端

```bash
cd webterm
python server.py --host 127.0.0.1 --port 8765
# in browser terminal:
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

## 开发说明

- 代码风格：
  - Python：4 空格缩进，函数保持小而直接。
  - 前端：2 空格缩进，CSS 类名使用 kebab-case。
- 目前还没有正式的自动化测试套件；以手动检查为主。
- 手动检查：
  - 加载 PWA，连接终端，运行 `pwd`。
  - 验证 UI 中的项目创建与 LaTeX 编译动作。
- 若更新了 PWA 资源，请在 `webterm/static/sw.js` 中提升 service worker cache name。
- `codex/` 与 `overleaf/` 作为子模块处理；除非有明确目的，否则避免在此直接修改。

## 故障排查

### Docker shell permission denied

如果 Docker 访问失败，请确认当前 shell 已加入 docker 组：

```bash
newgrp docker
cd webterm
python server.py --host 0.0.0.0 --port 8766
```

### PDF 预览找不到文件

- 确认终端中编译已成功完成。
- 确认文件存在于 `/home/<user>/Projects/<project>/latex/main.pdf`。
- 刷新 PDF 面板或使用 **Open** 按钮。

### 数据库功能不可用

- 检查 `.env` 中的数据库凭据。
- 确认 Postgres 正在运行且可连接。
- 安装驱动：`pip install "psycopg[binary]"`。
- 如有需要，运行 `./scripts/init_db.sh` 后重启服务。

### 找不到 Codex 命令

- 通过 UI 安装器安装 Codex（NVM + Node LTS + `@openai/codex`），或手动安装。
- 确保在当前运行环境中正确设置了 `CODEX_CMD` 与 `CODEX_NVM_DIR`。

### LAN 绑定安全性

`--host 0.0.0.0` 仅建议用于受信任网络。未启用认证/TLS 时请勿对公网暴露。

## 路线图

规划中与进行中的方向（见 `references/roadmap-blueprint.md` 及相关文档）：

- 改进多步骤论文自动化循环与可复现实验流程。
- 增强 Codex Bridge 会话可靠性与可观测性。
- 加固沙箱/运行时配置路径（CPU/GPU 变体）。
- 提升项目控制与编辑器易用性。
- 持续推进多语言文档与网站对齐。

## 主项目

- https://github.com/lachlanchen/the-art-of-lazying

## 生态链接

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

## 捐赠

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

你的支持将持续支撑我的研究、开发与运维，让我能够继续分享更多开源项目与改进。

## 贡献

欢迎贡献。

- 提交 issue 描述问题或提案。
- 变更保持聚焦且小步。
- 遵循本仓库的提交风格：`Add ...`、`Update ...`、`Expand ...`。
- 前端/UI 改动请在 PR 中附截图或 GIF。
- 若更新 README 内容，请保持所有语言版本同步（`README.*.md`）。

说明：子模块的贡献策略由其上游仓库定义（`codex/`、`overleaf/`）。

## 许可证

当前仓库根目录未提供仓库级许可证文件。

- 假设：该项目目前可能尚未提供最终的顶级许可证文件。
- 在重新分发大幅修改版本前，请先确认许可证意图。
- 子模块遵循各自上游许可证（例如 `overleaf/LICENSE`）。

## 致谢

- [Overleaf](https://github.com/overleaf/overleaf)：提供协作式 LaTeX 平台基础设施思路与组件。
- [OpenAI Codex CLI](https://github.com/openai/codex)：提供代理式终端工作流能力。
- 更广泛的 `the-art-of-lazying` 生态：提供产品愿景与跨项目集成支持。
