# Overleaf 风格 Web 论文工作台（Web 终端 + 后端编译）设计逻辑与开源方案

你要做的是一个“Web 版 Overleaf + Web 版终端 + 后端真实执行”的统一工作台：
- 浏览器里写 LaTeX / 代码
- 浏览器里看终端
- 后端真实运行（LaTeX 编译 / Python / R）
- 浏览器里看 PDF 和日志

## 1) 设计逻辑：三条闭环

### A. 编辑回路（Web 编辑器）
- 浏览器里编辑 `paper.tex / refs.bib / code.py / code.R`
- 保存到后端 workspace（建议挂载到容器）
- 前端：Monaco 或 CodeMirror

### B. 执行回路（终端 + Job）
- Web 终端连接到后端执行环境（容器内 shell）
- 点击按钮触发“编译 / 运行”变成 Job
- Job 可排队、可取消、有日志

### C. 产物回路（PDF 预览）
- `paper.pdf` 生成后自动刷新预览（pdf.js 或 iframe）
- 编译日志可点击跳转到编辑器行号
- PDF 与 log 作为 artifact 带版本时间戳

## 2) 推荐架构（接近 Overleaf 的做法）

每个用户/项目一个隔离执行环境（推荐）：
- workspace 挂载到容器 `/workspace`
- 工具链：TeX Live + Python + R
- 限资源：CPU/内存/进程

两条通道：
- **Web Terminal 通道**：浏览器 ↔ WebSocket ↔ 容器 shell
- **Job 通道**：浏览器按钮 ↔ API ↔ 容器执行 ↔ 日志/产物回传

## 3) 关键模块（按重要性）

1) **Session Router**
- 登录后分配 project container
- 管理容器状态、工作目录、连接

2) **Terminal Gateway**
- 前端 xterm.js
- 后端 node-pty / ttyd / wetty

3) **Build/Run Service**
- LaTeX: `latexmk -pdf -interaction=nonstopmode -halt-on-error`
- Python/R: `python` / `Rscript`
- 输出 stdout/stderr -> 日志流
- 生成 artifact: pdf/png/csv

4) **PDF Viewer**
- pdf.js 渲染
- hash/时间戳避免缓存问题

5) **协作（可选）**
- Yjs / ShareDB
- CRDT 状态落盘

## 4) 开源拼装方案

### 方案 A：基于 Overleaf CE 改（最像 Overleaf）
- 优点：论文写作与编译链路成熟
- 你要加：嵌入终端面板（xterm + ttyd）
- 缺点：工程大，改动需谨慎

### 方案 B：用 Web IDE 做壳 + 自写 LaTeX 编译服务
- 壳：`code-server` 或 `Eclipse Theia`
- 你补：compile_latex / run_python / run_r + PDF 面板
- 优点：代码体验好，扩展性强
- 缺点：PDF/编译错误跳转需要插件或旁路

### 方案 C：JupyterLab 为壳（偏科研流）
- 自带终端 + 文件管理
- 加 LaTeX 编译服务 + PDF 面板
- 优点：数据实验顺
- 缺点：纯 LaTeX 写作体验弱，协作更复杂

## 5) 组件清单（可直接复用）

- **编辑器**：Monaco Editor / CodeMirror 6
- **Web 终端**：xterm.js + node-pty / ttyd / wetty
- **PDF 预览**：pdf.js
- **协作**：Yjs / ShareDB
- **执行隔离**：Docker（或更严格的 sandbox）

## 6) 最快落地路线（建议）

如果你觉得 Codex 已够用：
1. 选壳：`code-server`（最快得到 Web 编辑器 + 终端）
2. 每项目一个容器：texlive + python + r-base
3. API：
   - `POST /compile-latex` → latexmk → log + pdf
   - `POST /run` → python/R → log + artifacts
4. 前端加 PDF 页签（pdf.js + 自动刷新）
5. 解析编译日志，错误行可跳转到编辑器

做到这一步，你已经拥有：
- Web 终端
- 论文编辑
- 后端编译
- PDF 预览
- 代码运行

## 7) 选择建议（需要你定方向）

二选一：
- **更像 Overleaf**：基于 Overleaf CE 改 + 嵌入终端
- **更像科研工作台**：code-server/Theia 做壳 + 你实现编译/运行 + PDF 面板

如果你告诉我方向，我可以继续细化：
- 目录结构
- Docker 镜像（texlive + python + r）
- 编译/运行 API 设计
- WebSocket 终端方案
- PDF 自动刷新与错误跳转方案

