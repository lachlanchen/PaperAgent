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

PaperAgent là một không gian làm việc web local-first cho việc viết bài nghiên cứu: chỉnh sửa LaTeX và mã nguồn ngay trên trình duyệt, chạy Python/R và biên dịch LaTeX ở backend, đồng thời xem trước PDF kèm log tại một nơi duy nhất.

## Tầm nhìn

PaperAgent được xây dựng để giải phóng mọi người khỏi các công việc nghiên cứu lặp lại, hướng tới “Only Ideas”.  
Mục tiêu rất đơn giản: giữ phần tư duy cho con người và để hệ thống xử lý phần việc lặp đi lặp lại.  
Bạn tập trung vào ý tưởng và mạch kể; PaperAgent xử lý các vòng lặp thực thi.

## Triết lý

- Local-first, privacy-first: dữ liệu và quá trình thực thi mặc định ở trên máy của bạn.
- Quy trình idea-first: đi từ khái niệm đến một bài viết có thể chạy với ma sát tối thiểu.
- Các bước nhỏ, có thể đảo ngược: mọi thay đổi đều minh bạch và dễ hoàn tác.
- Công cụ phải giảm việc: tự động hóa tồn tại để xóa việc lặt vặt, không phải tạo thêm.

## Logic (cách hoạt động)

1. Chat -> Edit: mô tả thay đổi, PaperAgent chỉnh sửa đúng tệp.
2. Run -> Compile: chạy Python/R, biên dịch LaTeX, tạo hình.
3. Preview -> Iterate: kiểm tra PDF + log, sửa nhanh, lặp lại.

## Tổng quan

PaperAgent tập trung vào `webterm/`, một server Tornado + WebSocket vận hành không gian làm việc PWA trên trình duyệt:

- Streaming terminal PTY (`/ws`) cho tác vụ shell tương tác.
- Codex Bridge WebSocket/API (`/codex/ws`, `/api/codex/*`) cho quy trình agent theo phiên.
- API file, cây thư mục và PDF (`/api/file`, `/api/tree`, `/api/pdf`) để chỉnh sửa và xem trước trong trình duyệt.
- Lưu trữ tùy chọn dựa trên Postgres cho người dùng, dự án, metadata git và lịch sử Codex.
- Thực thi shell Docker tùy chọn qua `webterm/docker-shell.sh`.

### Nhìn nhanh

| Khu vực | Cung cấp gì |
|---|---|
| Workspace | Terminal trình duyệt + editor + cây tệp + khung PDF |
| Vòng lặp tự động hóa | Chỉnh sửa theo prompt, compile, kiểm tra log, lặp |
| Runtime | Mặc định shell host, tùy chọn shell Docker |
| Lưu trữ | Mặc định stateless; tùy chọn lịch sử/metadata dùng Postgres |
| Tài liệu/i18n | Bộ README đa ngôn ngữ và thư mục `i18n/` trong repo |

## Những gì bạn nhận được

- Web terminal kết nối tới Docker sandbox
- Scaffold dự án LaTeX và biên dịch chỉ với một cú nhấp
- Thực thi Python/R cho hình và thí nghiệm
- Xem trước PDF kèm log
- Giao diện PWA gọn gàng, tối giản

## Tính năng

- Terminal trình duyệt hỗ trợ thay đổi kích thước PTY và điều khiển quy trình làm việc bền vững.
- Bảng điều khiển dự án để tạo workspace, khởi tạo LaTeX và luồng biên dịch.
- Cây tệp + CodeMirror editor với lưu tệp và polling watch/reload tùy chọn.
- Pipeline xem trước PDF cho `/home/<user>/Projects/<project>/latex/<file>.pdf`.
- Codex Bridge với bắt đầu/khôi phục phiên, đồng bộ trạng thái và ghi log DB tùy chọn.
- Công cụ Git/SSH trong UI (lưu định danh, điền sẵn remote, tạo/kiểm tra SSH key).
- Vận hành lệnh/tệp có nhận biết Docker với cơ chế fallback sang shell/hệ tệp host.

### Bản đồ tính năng

| Năng lực | Chi tiết |
|---|---|
| Terminal | Luồng PTY WebSocket qua `/ws`, quy trình shell tương tác |
| Agent bridge | Điều phối phiên qua `/codex/ws` + `/api/codex/*` |
| Tệp | Đọc/ghi qua `/api/file`, duyệt cấu trúc qua `/api/tree` |
| Xem trước PDF | Phục vụ artifact đã biên dịch qua `/api/pdf` |
| Điều khiển | Tạo dự án, khởi tạo LaTeX, compile, thiết lập Git/SSH |

## Trạng thái dự án

- PWA workspace: web terminal, PDF preview, editor.
- Project Controls: tạo workspace, khởi tạo LaTeX, compile, công cụ hỗ trợ Git/SSH.
- Codex Bridge: khôi phục phiên, danh sách lịch sử DB, bật/tắt đồng bộ `/status`.
- Cây tệp + CodeMirror editor với save/watch.
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

## Điều kiện tiên quyết

- OS: khuyến nghị Linux (mong đợi có Docker và công cụ shell).
- Python: dùng Conda env hiện có (`paperagent`) khi khả dụng.
- Dependencies:
  - `tornado`
  - `psycopg[binary]` (tùy chọn nhưng nên có cho các tính năng dùng DB)
- Dịch vụ runtime tùy chọn:
  - Docker (cho sandbox shell và đường dẫn dự án trong container)
  - PostgreSQL (cho lưu bền người dùng/dự án/lịch sử phiên Codex)
- Toolchain tùy chọn trong sandbox/container:
  - LaTeX (`latexmk` và các gói TeX)
  - Python, R
  - Node + `@openai/codex`

### Ma trận phụ thuộc

| Loại | Thành phần |
|---|---|
| Bắt buộc | Python + `tornado` |
| Khuyến nghị | `psycopg[binary]` cho năng lực dùng DB |
| Dịch vụ tùy chọn | Docker, PostgreSQL |
| Toolchain tùy chọn | LaTeX (`latexmk`), Python/R, Node + `@openai/codex` |

## Cài đặt

### 1) Clone repository (kèm submodule)

```bash
git clone --recurse-submodules https://github.com/lachlanchen/PaperAgent.git
cd PaperAgent
```

Nếu đã clone trước đó mà chưa có submodule:

```bash
git submodule update --init --recursive
```

### 2) Môi trường Python và gói phụ thuộc

```bash
conda activate paperagent
pip install tornado "psycopg[binary]"
```

Cách khác (nếu không ở trong env):

```bash
conda run -n paperagent pip install tornado "psycopg[binary]"
```

### 3) Cấu hình môi trường

```bash
cp .env.example .env
```

Chỉnh sửa `.env` theo máy của bạn (thông tin DB, mặc định Codex, v.v.).

### 4) Khởi tạo cơ sở dữ liệu (tùy chọn)

```bash
./scripts/init_db.sh
```

Lệnh này tạo/cập nhật role + DB và áp dụng `scripts/db_schema.sql`.

### 5) Khởi tạo Docker sandbox (tùy chọn)

```bash
./scripts/setup_docker_env.sh
```

Thiết lập host NVIDIA (nếu cần):

```bash
./scripts/install_nvidia_host.sh
```

## Sử dụng

### Chạy cục bộ (mặc định khuyến nghị)

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

### Chế độ dev tự động reload

```bash
cd webterm
python server.py --host 127.0.0.1 --port 8765 --dev
```

Trong chế độ `--dev`, cache service worker bị tắt để tránh tài nguyên cũ.

### Luồng thao tác UI điển hình

1. Nhập user + project trong bảng điều khiển.
2. Nhấn **Create Project + cd** để tạo:
   `/home/<user>/Projects/<project>/{code,data,figures,latex/latex_figures,artifacts}`
3. Nhấn **Init LaTeX** để scaffold `latex/main.tex`.
4. Nhấn **Compile LaTeX** (`latexmk`) và làm mới/mở PDF preview.
5. Chỉnh sửa tệp trong CodeMirror qua cây tệp rồi lưu.
6. Dùng Codex Bridge để chỉnh sửa theo prompt và khôi phục phiên.

### Tuyến API nhanh

| Endpoint | Mục đích |
|---|---|
| `/api/tree` | Truy vấn cây thư mục dự án cho panel editor |
| `/api/file` | Đọc/ghi tệp dự án |
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

### Một số cờ hữu ích khác

- `CODEX_AUTO_RESTORE=1`: tạo lại session ID bị thiếu và phát lại lịch sử đã lưu.
- `PROJECT_DB=1`: bật lưu bền metadata dự án dựa trên DB.
- `WEBTERM_QUIET_LOGS=1`: ẩn log polling/truy cập static gây nhiễu.
- `CODEX_CMD=codex`: lệnh thực thi Codex.
- `CODEX_CWD=/workspace`: thư mục làm việc fallback khi không có đường dẫn user/project.
- `WEBTERM_CONTAINER=<name>`: ghi đè tên container được phát hiện.

## Ví dụ

### Khởi chạy và kiểm tra terminal

```bash
cd webterm
python server.py --host 127.0.0.1 --port 8765
# in browser terminal:
pwd
```

### Truy vấn API cây dự án

```bash
curl "http://127.0.0.1:8765/api/tree?user=paperagent&project=demo-paper&depth=4"
```

### Lấy PDF (sau khi compile)

```bash
curl -o main.pdf "http://127.0.0.1:8765/api/pdf?user=paperagent&project=demo-paper&file=main.pdf"
```

### Đọc tệp qua API

```bash
curl "http://127.0.0.1:8765/api/file?user=paperagent&project=demo-paper&path=latex/main.tex"
```

## Ghi chú phát triển

- Quy ước mã nguồn:
  - Python: thụt lề 4 dấu cách, hàm nhỏ và trực tiếp.
  - Frontend: thụt lề 2 dấu cách, tên lớp CSS dạng kebab-case.
- Chưa có bộ kiểm thử tự động chính thức; kiểm tra thủ công là chủ yếu.
- Kiểm tra thủ công:
  - Tải PWA, kết nối terminal, chạy `pwd`.
  - Xác minh tạo dự án và compile LaTeX từ UI.
- Nếu cập nhật tài sản PWA, hãy tăng tên cache service worker trong `webterm/static/sw.js`.
- Xem `codex/` và `overleaf/` là submodule; tránh sửa trực tiếp tại đây trừ khi có chủ đích.

## Khắc phục sự cố

### Docker shell báo permission denied

Nếu truy cập docker thất bại, hãy đảm bảo shell của bạn có quyền trong docker-group:

```bash
newgrp docker
cd webterm
python server.py --host 0.0.0.0 --port 8766
```

### Không thấy PDF trong preview

- Xác nhận compile đã hoàn tất thành công trong terminal.
- Xác nhận tệp tồn tại tại `/home/<user>/Projects/<project>/latex/main.pdf`.
- Làm mới panel PDF hoặc dùng nút **Open**.

### Tính năng DB không khả dụng

- Kiểm tra thông tin DB trong `.env`.
- Đảm bảo Postgres đang chạy và có thể truy cập.
- Cài driver: `pip install "psycopg[binary]"`.
- Nếu cần, chạy `./scripts/init_db.sh` rồi khởi động lại server.

### Không tìm thấy lệnh Codex

- Cài Codex qua trình cài đặt trong UI (NVM + Node LTS + `@openai/codex`) hoặc cài thủ công.
- Đảm bảo `CODEX_CMD` và `CODEX_NVM_DIR` được đặt đúng cho ngữ cảnh runtime của bạn.

### An toàn khi bind LAN

`--host 0.0.0.0` chỉ dành cho mạng tin cậy. Không public ra internet nếu chưa có auth/TLS.

## Lộ trình

Định hướng đã lên kế hoạch và đang triển khai (xem `references/roadmap-blueprint.md` và tài liệu liên quan):

- Cải thiện vòng lặp tự động hóa bài viết nhiều bước và quy trình tái lập kết quả.
- Mở rộng độ tin cậy và khả năng quan sát của phiên Codex Bridge.
- Cứng hóa các luồng thiết lập sandbox/runtime (biến thể CPU/GPU).
- Cải thiện project controls và trải nghiệm editor.
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

## Quyên góp

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

Sự ủng hộ của bạn giúp duy trì nghiên cứu, phát triển và vận hành của tôi để tôi có thể tiếp tục chia sẻ nhiều dự án mở và cải tiến hơn.

## Đóng góp

Hoan nghênh mọi đóng góp.

- Mở issue mô tả vấn đề/đề xuất.
- Giữ thay đổi tập trung và nhỏ gọn.
- Theo phong cách commit của repo này: `Add ...`, `Update ...`, `Expand ...`.
- Với thay đổi frontend/UI, hãy thêm ảnh chụp màn hình hoặc GIF trong PR.
- Nếu cập nhật README, hãy giữ đồng bộ mọi biến thể ngôn ngữ (`README.*.md`).

Lưu ý: chính sách đóng góp cho submodule được định nghĩa upstream trong chính repository của chúng (`codex/`, `overleaf/`).

## Giấy phép

Hiện tại cây thư mục gốc chưa có tệp giấy phép ở cấp repository.

- Giả định: dự án này có thể đang được chia sẻ khi chưa chốt tệp giấy phép cấp cao nhất.
- Hãy xác nhận ý định cấp phép trước khi phân phối lại các phiên bản đã chỉnh sửa đáng kể.
- Submodule có giấy phép upstream riêng (ví dụ: `overleaf/LICENSE`).

## Lời cảm ơn

- [Overleaf](https://github.com/overleaf/overleaf) cho các ý tưởng hạ tầng và thành phần nền tảng LaTeX cộng tác.
- [OpenAI Codex CLI](https://github.com/openai/codex) cho quy trình terminal agentic.
- Toàn bộ hệ sinh thái `the-art-of-lazying` cho tầm nhìn sản phẩm và tích hợp liên dự án.
