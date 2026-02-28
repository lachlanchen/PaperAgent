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

PaperAgent là một môi trường làm việc web local-first để viết bài nghiên cứu: chỉnh sửa LaTeX và mã trực tiếp trong trình duyệt, chạy Python/R và biên dịch LaTeX ở backend, rồi xem trước PDF cùng logs tại một nơi.

## Tầm nhìn

PaperAgent được tạo ra để giải phóng mọi người khỏi công việc nghiên cứu lặp đi lặp lại, giúp tập trung vào "Only Ideas".
Mục tiêu rất rõ: giữ phần sáng tạo cho con người, để hệ thống lo phần việc lặp lại.
Bạn tập trung vào ý tưởng và câu chuyện; PaperAgent lo các vòng lặp thực thi.

## Triết lý

- Local-first, privacy-first: dữ liệu và quá trình thực thi được giữ trên máy của bạn theo mặc định.
- Ý tưởng trước tiên: chuyển từ một khái niệm đến bản thảo có thể chạy được với ma sát tối thiểu.
- Các bước nhỏ, có thể đảo ngược: mỗi thay đổi minh bạch và dễ hoàn tác.
- Công cụ cần giảm tải công việc: tự động hóa để loại bỏ lặp lại, không tạo thêm việc rườm rà.

## 🛠️ Cách hoạt động

1. Chat -> Chỉnh sửa: mô tả thay đổi, PaperAgent sẽ chỉnh đúng file.
2. Chạy -> Biên dịch: thực thi Python/R, biên dịch LaTeX, sinh biểu đồ.
3. Xem trước -> Lặp lại: kiểm tra PDF + logs, sửa nhanh, rồi lặp.

## Tổng quan

PaperAgent xoay quanh `webterm/`, máy chủ Tornado + WebSocket vận hành không gian PWA trong trình duyệt:

- Streaming terminal PTY (`/ws`) cho thao tác shell tương tác.
- Codex Bridge WebSocket/API (`/codex/ws`, `/api/codex/*`) cho luồng làm việc theo phiên của agent.
- API file, cây thư mục và PDF (`/api/file`, `/api/tree`, `/api/pdf`) cho chỉnh sửa và xem trước trong trình duyệt.
- Lưu trữ có thể bật qua Postgres cho người dùng, dự án, metadata Git và lịch sử Codex.
- Thực thi shell qua Docker (tùy chọn) bằng `webterm/docker-shell.sh`.

### Tóm tắt nhanh

| Khu vực | Chức năng |
|---|---|
| Workspace | Terminal trình duyệt + editor + cây file + panel PDF |
| Vòng lặp tự động hóa | Chỉnh sửa theo prompt, biên dịch, xem logs, lặp nhanh |
| Runtime | Mặc định shell máy chủ, tùy chọn shell Docker |
| Lưu trữ | Mặc định stateless; lịch sử/metadata có thể lưu bằng Postgres |
| Tài liệu/i18n | Bộ README đa ngôn ngữ và thư mục `i18n/` trong repo |

## Mục tiêu đạt được

- Web terminal kết nối với sandbox Docker
- Khởi tạo dự án LaTeX và biên dịch chỉ với một lần nhấn
- Chạy Python/R cho biểu đồ và thí nghiệm
- Xem trước PDF kèm logs
- Giao diện PWA gọn và tối giản

## Tính năng

- Terminal trên trình duyệt có hỗ trợ resize PTY và điều khiển luồng làm việc lâu dài.
- Bảng điều khiển dự án để tạo workspace, khởi tạo LaTeX và các luồng biên dịch.
- Cây file + CodeMirror editor với lưu file và cơ chế watch/reload tùy chọn.
- Pipeline xem trước PDF cho `/home/<user>/Projects/<project>/latex/<file>.pdf`.
- Codex Bridge với khởi tạo/tiếp tục phiên, đồng bộ trạng thái và ghi log DB tùy chọn.
- Các tiện ích Git/SSH trong UI (lưu danh tính, điền sẵn remote, tạo/kiểm tra SSH key).
- Thao tác command/file có nhận biết Docker với fallback về shell/hệ thống file host.

### Bản đồ tính năng

| Năng lực | Chi tiết |
|---|---|
| Terminal | Luồng PTY WebSocket qua `/ws`, luồng shell tương tác |
| Agent bridge | Điều phối phiên qua `/codex/ws` + `/api/codex/*` |
| Files | Đọc/ghi qua `/api/file`, duyệt cây qua `/api/tree` |
| PDF preview | Phục vụ artifact đã biên dịch qua `/api/pdf` |
| Controls | Tạo dự án, khởi tạo LaTeX, biên dịch, thiết lập Git/SSH |

## Tình trạng dự án

- Workspace PWA: web terminal, xem trước PDF, editor.
- Điều khiển dự án: tạo workspace, khởi tạo LaTeX, biên dịch, hỗ trợ Git/SSH.
- Codex Bridge: tiếp tục phiên, danh sách lịch sử DB, bật/tắt đồng bộ `/status`.
- Cây file + CodeMirror editor có save/watch.
- Thực thi dựa trên Docker (tùy chọn) với toolchain LaTeX/Python/R.

## Demo

![PaperAgent demo](demos/demo-full.png)

## Cấu trúc dự án

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

## Điều kiện cần

- Hệ điều hành: khuyến nghị Linux (Docker và công cụ shell thường được dùng).
- Python: dùng Conda env có sẵn (`paperagent`) khi có thể.
- Dependencies:
  - `tornado`
  - `psycopg[binary]` (tùy chọn nhưng nên cài cho tính năng DB)
- Dịch vụ runtime tùy chọn:
  - Docker (cho sandbox shell và đường dẫn dự án trong container)
  - PostgreSQL (cho users/projects/lịch sử phiên Codex được lưu)
- Toolchain tùy chọn trong sandbox/container:
  - LaTeX (`latexmk` và gói TeX)
  - Python, R
  - Node + `@openai/codex`

### Ma trận dependency

| Loại | Thành phần |
|---|---|
| Bắt buộc | Python + `tornado` |
| Khuyến nghị | `psycopg[binary]` cho khả năng DB-backed |
| Dịch vụ tùy chọn | Docker, PostgreSQL |
| Toolchain tùy chọn | LaTeX (`latexmk`), Python/R, Node + `@openai/codex` |

## Cài đặt

### 1) Clone repository (cùng submodule)

```bash
git clone --recurse-submodules https://github.com/lachlanchen/PaperAgent.git
cd PaperAgent
```

Nếu repo đã clone mà chưa có submodule:

```bash
git submodule update --init --recursive
```

### 2) Thiết lập Python environment và package

```bash
conda activate paperagent
pip install tornado "psycopg[binary]"
```

Thay thế (nếu không ở trong env):

```bash
conda run -n paperagent pip install tornado "psycopg[binary]"
```

### 3) Cấu hình môi trường

```bash
cp .env.example .env
```

Chỉnh sửa `.env` cho máy của bạn (thông tin DB, mặc định Codex, v.v.).

### 4) Khởi tạo cơ sở dữ liệu (tùy chọn)

```bash
./scripts/init_db.sh
```

Lệnh này sẽ tạo/cập nhật role + DB rồi áp dụng `scripts/db_schema.sql`.

### 5) Chuẩn bị Docker sandbox (tùy chọn)

```bash
./scripts/setup_docker_env.sh
```

Nếu cần thiết lập NVIDIA host:

```bash
./scripts/install_nvidia_host.sh
```

## Cách dùng

### Chạy local (mặc định đề xuất)

```bash
cd webterm
python server.py --host 127.0.0.1 --port 8765
```

Mở: `http://127.0.0.1:8765`

### Chạy với Docker shell target

```bash
cd webterm
python server.py --host 0.0.0.0 --port 8766 --shell ./docker-shell.sh
```

### Chế độ dev auto-reload

```bash
cd webterm
python server.py --host 127.0.0.1 --port 8765 --dev
```

Trong chế độ `--dev`, cache service worker sẽ bị tắt để tránh dùng tài nguyên cũ.

### Luồng UI điển hình

1. Nhập user + project ở control panel.
2. Nhấn **Create Project + cd** để tạo:
   `/home/<user>/Projects/<project>/{code,data,figures,latex/latex_figures,artifacts}`
3. Nhấn **Init LaTeX** để scaffold `latex/main.tex`.
4. Nhấn **Compile LaTeX** (`latexmk`) rồi refresh/open PDF preview.
5. Chỉnh sửa file trong CodeMirror qua cây file và lưu.
6. Dùng Codex Bridge để chỉnh sửa theo prompt và tiếp tục phiên.

### API nhanh

| Endpoint | Mục đích |
|---|---|
| `/api/tree` | Truy vấn cây thư mục dự án cho panel editor |
| `/api/file` | Đọc/ghi file dự án |
| `/api/pdf` | Lấy PDF artifact đã render |
| `/api/codex/*` | Vòng đời phiên, lịch sử, đồng bộ trạng thái |
| `/codex/ws` | Kênh WebSocket cho sự kiện Codex bridge |

## Cấu hình

PaperAgent đọc biến môi trường từ `.env` (hoặc `ENV_FILE`) và môi trường process.

### Thiết lập DB cốt lõi

```bash
DB_HOST=localhost
DB_PORT=5432
DB_NAME=paperagent_db
DB_USER=lachlan
DB_PASSWORD=change_me
```

### Mặc định Codex

```bash
CODEX_LOG_DB=1
CODEX_LOG_OUTPUT=1
CODEX_USERNAME=lachlan
CODEX_PROJECT=demo-paper
CODEX_ARGS="-s danger-full-access -a never"
CODEX_NVM_DIR=/root/.nvm
CODEX_HISTORY_MESSAGES=1000
```

### Các công tắc hữu ích khác

- `CODEX_AUTO_RESTORE=1`: tạo lại session ID thiếu và phát lại lịch sử đã lưu.
- `PROJECT_DB=1`: bật lưu metadata dự án theo DB.
- `WEBTERM_QUIET_LOGS=1`: ẩn log polling/static gây ồn.
- `CODEX_CMD=codex`: lệnh thực thi Codex.
- `CODEX_CWD=/workspace`: working directory dự phòng khi thiếu đường dẫn user/project.
- `WEBTERM_CONTAINER=<name>`: ghi đè tên container được phát hiện.

## Ví dụ

### Khởi chạy và kiểm tra terminal

```bash
cd webterm
python server.py --host 127.0.0.1 --port 8765
# in browser terminal:
pwd
```

### Query cây dự án qua API

```bash
curl "http://127.0.0.1:8765/api/tree?user=paperagent&project=demo-paper&depth=4"
```

### Lấy PDF (sau khi compile)

```bash
curl -o main.pdf "http://127.0.0.1:8765/api/pdf?user=paperagent&project=demo-paper&file=main.pdf"
```

### Đọc file qua API

```bash
curl "http://127.0.0.1:8765/api/file?user=paperagent&project=demo-paper&path=latex/main.tex"
```

## Ghi chú phát triển

- Quy ước code:
  - Python: thụt lề 4 spaces, hàm gọn và trực tiếp.
  - Frontend: thụt lề 2 spaces, tên class CSS dạng kebab-case.
- Chưa có bộ test tự động chính thức; các kiểm tra thủ công vẫn là chính.
- Kiểm tra thủ công:
  - Mở PWA, kết nối terminal, chạy `pwd`.
  - Kiểm chứng tạo project và biên dịch LaTeX qua UI.
- Khi cập nhật tài sản PWA, hãy bump tên cache trong `webterm/static/sw.js`.
- Xử lý `codex/` và `overleaf/` như submodule; tránh sửa trực tiếp nếu không chủ đích.

## Khắc phục sự cố

### Docker shell báo permission denied

Nếu truy cập Docker bị lỗi, đảm bảo shell của bạn có quyền thuộc nhóm docker:

```bash
newgrp docker
cd webterm
python server.py --host 0.0.0.0 --port 8766
```

### Không tìm thấy PDF trong preview

- Xác nhận compile đã chạy xong thành công trong terminal.
- Kiểm tra file tồn tại tại `/home/<user>/Projects/<project>/latex/main.pdf`.
- Refresh panel PDF hoặc bấm **Open**.

### Tính năng DB không khả dụng

- Kiểm tra credentials DB trong `.env`.
- Đảm bảo PostgreSQL đang chạy và có thể kết nối.
- Cài driver: `pip install "psycopg[binary]"`.
- Nếu cần, chạy `./scripts/init_db.sh` rồi khởi động lại server.

### Không tìm thấy lệnh Codex

- Cài Codex qua installer UI (NVM + Node LTS + `@openai/codex`) hoặc thủ công.
- Đảm bảo `CODEX_CMD` và `CODEX_NVM_DIR` được cấu hình đúng cho ngữ cảnh runtime của bạn.

### An toàn khi bind LAN

`--host 0.0.0.0` dành cho mạng nội bộ đã tin cậy. Không public lên internet nếu chưa có auth/TLS.

## Lộ trình

Hướng phát triển dự kiến và đang triển khai (xem `references/roadmap-blueprint.md` và tài liệu liên quan):

- Cải thiện vòng lặp tự động hóa nhiều bước cho bài viết và tái lập quy trình.
- Mở rộng độ tin cậy và khả năng quan sát của Codex Bridge session.
- Cứng hóa các thiết lập sandbox/runtime (biến thể CPU/GPU).
- Cải thiện project controls và ergonomics của editor.
- Tiếp tục đồng bộ tài liệu đa ngôn ngữ và website.

## Dự án chính

- https://github.com/lachlanchen/the-art-of-lazying

## Liên kết hệ sinh thái

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

## Đóng góp

Mọi đóng góp đều được chào đón.

- Mở issue mô tả vấn đề/đề xuất.
- Giữ thay đổi tập trung và ở quy mô nhỏ.
- Tuân theo style commit của repo: `Add ...`, `Update ...`, `Expand ...`.
- Với thay đổi giao diện/frontend, thêm ảnh chụp màn hình hoặc GIF trong PR.
- Nếu cập nhật nội dung README, giữ đồng bộ tất cả biến thể ngôn ngữ (`README.*.md`).

Lưu ý: chính sách đóng góp submodule được định nghĩa upstream trong repository gốc của chúng (`codex/`, `overleaf/`).

## Giấy phép

Tệp giấy phép cấp repository hiện chưa có trong cây gốc của repo này.

- Giả định: dự án có thể hiện đang được chia sẻ khi chưa có file giấy phép cấp cao nhất.
- Xác nhận rõ mục đích cấp phép trước khi phân phối lại các bản đã chỉnh sửa đáng kể.
- Các submodule có giấy phép riêng của upstream (ví dụ: `overleaf/LICENSE`).

## Lời cảm ơn

- [Overleaf](https://github.com/overleaf/overleaf) cho ý tưởng hạ tầng và các thành phần nền tảng cho LaTeX cộng tác.
- [OpenAI Codex CLI](https://github.com/openai/codex) cho quy trình terminal có tính agentic.
- Hệ sinh thái `the-art-of-lazying` rộng hơn cho tầm nhìn sản phẩm và tích hợp liên dự án.


## ❤️ Support

| Donate | PayPal | Stripe |
| --- | --- | --- |
| [![Donate](https://camo.githubusercontent.com/24a4914f0b42c6f435f9e101621f1e52535b02c225764b2f6cc99416926004b7/68747470733a2f2f696d672e736869656c64732e696f2f62616467652f446f6e6174652d4c617a79696e674172742d3045413545393f7374796c653d666f722d7468652d6261646765266c6f676f3d6b6f2d6669266c6f676f436f6c6f723d7768697465)](https://chat.lazying.art/donate) | [![PayPal](https://camo.githubusercontent.com/d0f57e8b016517a4b06961b24d0ca87d62fdba16e18bbdb6aba28e978dc0ea21/68747470733a2f2f696d672e736869656c64732e696f2f62616467652f50617950616c2d526f6e677a686f754368656e2d3030343537433f7374796c653d666f722d7468652d6261646765266c6f676f3d70617970616c266c6f676f436f6c6f723d7768697465)](https://paypal.me/RongzhouChen) | [![Stripe](https://camo.githubusercontent.com/1152dfe04b6943afe3a8d2953676749603fb9f95e24088c92c97a01a897b4942/68747470733a2f2f696d672e736869656c64732e696f2f62616467652f5374726970652d446f6e6174652d3633354246463f7374796c653d666f722d7468652d6261646765266c6f676f3d737472697065266c6f676f436f6c6f723d7768697465)](https://buy.stripe.com/aFadR8gIaflgfQV6T4fw400) |
