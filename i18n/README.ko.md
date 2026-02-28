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

PaperAgent는 로컬 우선(local-first) 방식의 논문 작성 웹 워크스페이스입니다. 브라우저에서 LaTeX와 코드를 편집하고, 백엔드에서 Python/R 실행 및 LaTeX 컴파일을 수행하며, PDF와 로그를 한 곳에서 미리 볼 수 있습니다.

## 💡 Vision

PaperAgent는 연구의 반복적인 번거로운 일을 해소해 모두가 **Only Ideas**에 집중할 수 있도록 만들어졌습니다.\
목표는 단순합니다. 사고는 사람이 담당하고, 반복 작업은 시스템이 처리하는 것입니다.\
사용자는 아이디어와 서사에 집중하고, PaperAgent는 실행 루프를 담당합니다.

## 🧭 Philosophy

- 로컬 우선, 프라이버시 우선: 기본적으로 데이터와 실행이 사용자의 로컬 머신에 있습니다.
- 아이디어 우선 워크플로: 개념에서 실행 가능한 논문으로 가는 마찰을 최소화합니다.
- 작고 되돌릴 수 있는 단계: 모든 변경이 투명하며 쉽게 되돌릴 수 있습니다.
- 도구는 일을 줄여야 함: 자동화는 노동을 줄이기 위해 존재해야지, 추가하기 위해서는 안 됩니다.

## 🛠️ Logic (how it works)

1. Chat -> Edit: 변경할 내용을 설명하면 PaperAgent가 적절한 파일을 수정합니다.
2. Run -> Compile: Python/R 실행, LaTeX 컴파일, 그림 생성.
3. Preview -> Iterate: PDF + 로그를 확인하고 빠르게 수정해 반복합니다.

## 📚 Overview

PaperAgent는 `webterm/`를 중심으로 구성되어 있으며, 이는 Tornado + WebSocket 서버로 브라우저 기반 PWA 워크스페이스를 구동합니다.

- PTY 터미널 스트리밍 (`/ws`)으로 대화형 쉘 작업을 지원합니다.
- Codex Bridge WebSocket/API (`/codex/ws`, `/api/codex/*`)로 세션 기반 에이전트 워크플로를 제공합니다.
- 파일/트리/PDF API (`/api/file`, `/api/tree`, `/api/pdf`)로 브라우저 내 편집과 미리보기를 지원합니다.
- 사용자, 프로젝트, git 메타데이터, Codex 이력을 위한 선택적 PostgreSQL 기반 영속성.
- `webterm/docker-shell.sh`를 통한 선택적 Docker 셸 실행.

### At a glance

| Area | What it provides |
|---|---|
| Workspace | 브라우저 터미널 + 에디터 + 파일 트리 + PDF 패널 |
| Automation loop | 프롬프트 기반 편집, 컴파일, 로그 점검, 반복 |
| Runtime | 기본은 호스트 셸, Docker 셸은 선택 사항 |
| Persistence | 기본은 무상태 모드; 선택적으로 PostgreSQL 기반 이력/메타데이터 사용 |
| Docs/i18n | 다국어 README 세트와 저장소 내 `i18n/` 디렉터리 |

## 🎯 What You Get

- Docker 샌드박스와 연결된 웹 터미널
- LaTeX 프로젝트 스캐폴딩 및 원클릭 컴파일
- 그림/실험을 위한 Python/R 실행
- 로그가 함께 표시되는 PDF 미리보기
- 깔끔하고 최소화된 PWA 인터페이스

## ⚙️ Features

- PTY 크기 조정 지원과 지속형 워크플로 제어를 갖춘 브라우저 터미널.
- 작업 공간 생성, LaTeX 초기화, 컴파일 흐름을 위한 프로젝트 제어 패널.
- 저장 및 선택적 watch/reload 폴링을 지원하는 파일 트리 + CodeMirror 에디터.
- `/home/<user>/Projects/<project>/latex/<file>.pdf`용 PDF 미리보기 파이프라인.
- 세션 시작/재개, 상태 동기화, 선택적 DB 로깅을 지원하는 Codex Bridge.
- UI 내 Git/SSH 도우미(아이덴티티 저장, 원격 주소 미리 채움, SSH 키 생성/확인).
- Docker 인지형 명령/파일 작업과 호스트 셸/파일시스템 폴백.

### Feature map

| Capability | Details |
|---|---|
| Terminal | `/ws`를 통한 WebSocket PTY 스트림, 대화형 셸 워크플로 |
| Agent bridge | `/codex/ws` + `/api/codex/*` 세션 오케스트레이션 |
| Files | `/api/file` 읽기/쓰기, `/api/tree` 구조 브라우징 |
| PDF preview | `/api/pdf`로 컴파일 아티팩트 제공 |
| Controls | 프로젝트 생성, LaTeX 초기화, 컴파일, Git/SSH 설정 |

## 📈 Project Status

- PWA 워크스페이스: 웹 터미널, PDF 미리보기, 에디터.
- Project Controls: 작업 공간 생성, LaTeX 초기화, 컴파일, Git/SSH 도우미.
- Codex Bridge: 세션 재개, DB 이력 목록, `/status` 동기화 토글.
- 저장/감시 기능이 있는 파일 트리 + CodeMirror 에디터.
- Docker 기반 실행(선택 사항)으로 LaTeX/Python/R 툴체인 제공.

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

- OS: Linux 권장 (Docker 및 쉘 도구를 사용할 수 있어야 함).
- Python: 가능하면 기존 Conda 환경(`paperagent`) 사용.
- 의존성:
  - `tornado`
  - `psycopg[binary]` (선택 사항이지만 DB 기반 기능에는 권장)
- 선택적 런타임 서비스:
  - Docker (샌드박스 셸 및 컨테이너 기반 프로젝트 경로)
  - PostgreSQL (사용자/프로젝트/Codex 세션 이력 영속화)
- 샌드박스/컨테이너 내부의 선택적 툴체인:
  - LaTeX (`latexmk` 및 TeX 패키지)
  - Python, R
  - Node + `@openai/codex`

### Dependency matrix

| Type | Components |
|---|---|
| Required | Python + `tornado` |
| Recommended | DB 기반 기능을 위한 `psycopg[binary]` |
| Optional services | Docker, PostgreSQL |
| Optional toolchains | LaTeX (`latexmk`), Python/R, Node + `@openai/codex` |

## 🚀 Installation

### 1) Clone repository (with submodules)

```bash
git clone --recurse-submodules https://github.com/lachlanchen/PaperAgent.git
cd PaperAgent
```

이미 서브모듈 없이 클론한 경우:

```bash
git submodule update --init --recursive
```

### 2) Python environment and packages

```bash
conda activate paperagent
pip install tornado "psycopg[binary]"
```

대안 (환경 내부가 아닌 경우):

```bash
conda run -n paperagent pip install tornado "psycopg[binary]"
```

### 3) Environment configuration

```bash
cp .env.example .env
```

사용 중인 머신 환경에 맞게 `.env`를 수정하세요 (DB 자격 증명, Codex 기본값 등).

### 4) Optional database bootstrap

```bash
./scripts/init_db.sh
```

역할(role) + DB를 생성/업데이트하고 `scripts/db_schema.sql`을 적용합니다.

### 5) Optional Docker sandbox bootstrap

```bash
./scripts/setup_docker_env.sh
```

NVIDIA 호스트 설정이 필요한 경우:

```bash
./scripts/install_nvidia_host.sh
```

## 🧑‍💻 Usage

### Run locally (recommended default)

```bash
cd webterm
python server.py --host 127.0.0.1 --port 8765
```

열기: `http://127.0.0.1:8765`

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

`--dev` 모드에서는 오래된 자산 사용으로 인한 문제를 피하기 위해 서비스 워커 캐시가 비활성화됩니다.

### Typical UI flow

1. 제어 패널에서 사용자명과 프로젝트명을 입력합니다.
2. **Create Project + cd**를 클릭해 다음을 생성합니다: 
   `/home/<user>/Projects/<project>/{code,data,figures,latex/latex_figures,artifacts}`
3. **Init LaTeX**를 클릭해 `latex/main.tex`를 스캐폴딩합니다.
4. **Compile LaTeX**(`latexmk`)를 실행하고 PDF 미리보기를 새로고침/열기합니다.
5. 파일 트리를 통해 CodeMirror에서 파일을 편집하고 저장합니다.
6. Codex Bridge로 프롬프트 기반 편집과 세션 재개를 수행합니다.

### API quick routes

| Endpoint | Purpose |
|---|---|
| `/api/tree` | 에디터 패널용 프로젝트 디렉터리 트리 조회 |
| `/api/file` | 프로젝트 파일 읽기/쓰기 |
| `/api/pdf` | 렌더링된 PDF 산출물 조회 |
| `/api/codex/*` | 세션 라이프사이클, 이력, 상태 동기화 |
| `/codex/ws` | Codex bridge 이벤트용 WebSocket 채널 |

## 🔧 Configuration

PaperAgent는 `.env`(또는 `ENV_FILE`)와 프로세스 환경에서 env 변수를 읽습니다.

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

- `CODEX_AUTO_RESTORE=1`: 누락된 세션 ID를 다시 생성하고 저장된 이력을 재생합니다.
- `PROJECT_DB=1`: DB 기반 프로젝트 메타데이터 영속화 사용.
- `WEBTERM_QUIET_LOGS=1`: 폴링/정적 접근 로그를 억제합니다.
- `CODEX_CMD=codex`: Codex 실행 명령어.
- `CODEX_CWD=/workspace`: 사용자/프로젝트 경로가 없을 때 대체 작업 디렉터리.
- `WEBTERM_CONTAINER=<name>`: 탐지된 컨테이너 이름을 덮어쓰기.

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

- 코드 스타일:
  - Python: 4칸 들여쓰기, 작고 직접적인 함수.
  - Frontend: 2칸 들여쓰기, kebab-case CSS 클래스명.
- 정식 자동 테스트 스위트는 아직 없습니다. 수동 검증이 주입니다.
- 수동 확인 항목:
  - PWA를 열고 터미널에 연결한 뒤 `pwd`를 실행.
  - UI에서 프로젝트 생성과 LaTeX 컴파일 동작 확인.
- PWA 에셋을 업데이트하면 `webterm/static/sw.js`에서 서비스 워커 캐시 이름을 갱신하세요.
- `codex/`와 `overleaf/`는 서브모듈입니다. 의도되지 않은 직접 수정은 피하세요.

## 🩺 Troubleshooting

### Docker shell permission denied

Docker 접근이 실패하면 현재 쉘이 docker 그룹 멤버십을 갖고 있는지 확인하세요:

```bash
newgrp docker
cd webterm
python server.py --host 0.0.0.0 --port 8766
```

### PDF not found in preview

- 터미널에서 컴파일이 정상 완료되었는지 확인하세요.
- `/home/<user>/Projects/<project>/latex/main.pdf` 경로에 파일이 존재하는지 확인하세요.
- PDF 패널을 새로 고치거나 **Open** 버튼을 사용하세요.

### DB features not available

- `.env`의 DB 자격 증명을 점검하세요.
- PostgreSQL이 실행 중이고 접근 가능한지 확인하세요.
- 드라이버를 설치하세요: `pip install "psycopg[binary]"`.
- 필요한 경우 `./scripts/init_db.sh`를 실행하고 서버를 재시작하세요.

### Codex command not found

- UI 설치기(NVM + Node LTS + `@openai/codex`) 또는 수동으로 Codex를 설치하세요.
- 런타임 환경에 맞게 `CODEX_CMD`와 `CODEX_NVM_DIR`가 올바르게 설정되었는지 확인하세요.

### LAN binding safety

`--host 0.0.0.0`는 신뢰할 수 있는 네트워크에서만 사용하세요. 인증/TLS 없이 공개 인터넷에 노출하지 마세요.

## 🗺️ Roadmap

계획 및 진행 방향(`references/roadmap-blueprint.md` 등 관련 문서 참고):

- 다단계 논문 자동화 루프와 재현성 워크플로 개선.
- Codex Bridge 세션 신뢰성 및 관측 가능성 향상.
- 샌드박스/런타임 설정 경로 강화(CPU/GPU 변형 포함).
- 프로젝트 제어와 에디터 사용성 개선.
- 다국어 문서와 웹사이트 정렬을 계속 확장.

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

기여를 환영합니다.

- 문제나 제안을 설명하는 이슈를 열어 주세요.
- 변경은 작고 집중해서 진행하세요.
- 이 저장소의 커밋 스타일(`Add ...`, `Update ...`, `Expand ...`)을 따라 주세요.
- 프론트엔드/UI 변경 시 PR에 스크린샷이나 GIF를 포함하세요.
- README를 갱신할 때는 모든 언어 버전(`README.*.md`)을 정렬해 주세요.

참고: 서브모듈 기여 정책은 각 상위 저장소(`codex/`, `overleaf/`)에서 정의됩니다.

## ❤️ Support

| Donate | PayPal | Stripe |
| --- | --- | --- |
| [![Donate](https://camo.githubusercontent.com/24a4914f0b42c6f435f9e101621f1e52535b02c225764b2f6cc99416926004b7/68747470733a2f2f696d672e736869656c64732e696f2f62616467652f446f6e6174652d4c617a79696e674172742d3045413545393f7374796c653d666f722d7468652d6261646765266c6f676f3d6b6f2d6669266c6f676f436f6c6f723d7768697465)](https://chat.lazying.art/donate) | [![PayPal](https://camo.githubusercontent.com/d0f57e8b016517a4b06961b24d0ca87d62fdba16e18bbdb6aba28e978dc0ea21/68747470733a2f2f696d672e736869656c64732e696f2f62616467652f50617950616c2d526f6e677a686f754368656e2d3030343537433f7374796c653d666f722d7468652d6261646765266c6f676f3d70617970616c266c6f676f436f6c6f723d7768697465)](https://paypal.me/RongzhouChen) | [![Stripe](https://camo.githubusercontent.com/1152dfe04b6943afe3a8d2953676749603fb9f95e24088c92c97a01a897b4942/68747470733a2f2f696d672e736869656c64732e696f2f62616467652f5374726970652d446f6e6174652d3633354246463f7374796c653d666f722d7468652d6261646765266c6f676f3d737472697065266c6f676f436f6c6f723d7768697465)](https://buy.stripe.com/aFadR8gIaflgfQV6T4fw400) |

## 📜 License

현재 저장소 루트에는 저장소 수준의 라이선스 파일이 없습니다.

- 가정: 이 프로젝트는 아직 최종 확정된 최상위 라이선스 파일 없이 공유되고 있을 수 있습니다.
- 대규모 수정본을 재배포하기 전에 라이선스 의도를 확인하세요.
- 서브모듈은 자체 상위 라이선스를 따릅니다(예: `overleaf/LICENSE`).

## 🙏 Acknowledgements

- [Overleaf](https://github.com/overleaf/overleaf)에게 협업형 LaTeX 플랫폼 인프라 아이디어와 컴포넌트에 대한 영감을 받았습니다.
- 에이전트형 터미널 워크플로를 제공하는 [OpenAI Codex CLI](https://github.com/openai/codex).
- 제품 비전과 프로젝트 간 통합을 이끄는 더 큰 `the-art-of-lazying` 생태계.
