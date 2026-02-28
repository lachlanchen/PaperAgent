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

PaperAgent는 로컬 우선(local-first) 방식의 논문 작성 웹 워크스페이스입니다. 브라우저에서 LaTeX와 코드를 편집하고, 백엔드에서 Python/R 실행 및 LaTeX 컴파일을 수행하며, PDF와 로그를 한 곳에서 미리 볼 수 있습니다.

## 비전

PaperAgent는 연구 과정의 반복적인 잡무에서 사람을 해방해 "Only Ideas"에 집중하도록 설계되었습니다.  
목표는 단순합니다. 사고는 사람이 맡고, 반복 작업은 시스템이 맡는 것.  
사용자는 아이디어와 서사에 집중하고, PaperAgent는 실행 루프를 담당합니다.

## 철학

- 로컬 우선, 프라이버시 우선: 데이터와 실행은 기본적으로 사용자 머신에 머뭅니다.
- 아이디어 우선 워크플로: 개념에서 실행 가능한 논문까지의 마찰을 최소화합니다.
- 작고 되돌릴 수 있는 단계: 모든 변경은 투명하며 쉽게 롤백할 수 있습니다.
- 도구는 일을 줄여야 함: 자동화의 목적은 일을 추가하는 것이 아니라 반복 노동을 제거하는 것입니다.

## 로직 (동작 방식)

1. Chat -> Edit: 변경 사항을 설명하면 PaperAgent가 적절한 파일을 수정합니다.
2. Run -> Compile: Python/R을 실행하고, LaTeX를 컴파일하며, 그림을 생성합니다.
3. Preview -> Iterate: PDF + 로그를 확인하고 빠르게 수정한 뒤 반복합니다.

<a id="overview"></a>

## 개요

PaperAgent는 브라우저 기반 PWA 워크스페이스를 제공하는 Tornado + WebSocket 서버인 `webterm/`를 중심으로 구성됩니다.

- 상호작용형 셸 작업을 위한 PTY 터미널 스트리밍 (`/ws`).
- 세션 기반 에이전트 워크플로를 위한 Codex Bridge WebSocket/API (`/codex/ws`, `/api/codex/*`).
- 브라우저 편집/미리보기를 위한 파일, 트리, PDF API (`/api/file`, `/api/tree`, `/api/pdf`).
- 사용자/프로젝트/git 메타데이터/Codex 이력을 위한 선택적 Postgres 영속화.
- `webterm/docker-shell.sh`를 통한 선택적 Docker shell 실행.

### 한눈에 보기

| 영역 | 제공 기능 |
|---|---|
| Workspace | 브라우저 터미널 + 에디터 + 파일 트리 + PDF 패널 |
| Automation loop | 프롬프트 기반 편집, 컴파일, 로그 확인, 반복 |
| Runtime | 기본은 호스트 셸, Docker 셸은 선택 사항 |
| Persistence | 기본은 상태 비저장 모드, 선택적으로 Postgres 기반 이력/메타데이터 |
| Docs/i18n | 다국어 README 세트 및 저장소 내 `i18n/` 디렉터리 |

## 얻을 수 있는 것

- Docker 샌드박스에 연결되는 웹 터미널
- LaTeX 프로젝트 스캐폴딩 및 원클릭 컴파일
- 그림/실험을 위한 Python/R 실행
- 로그 포함 PDF 미리보기
- 깔끔하고 미니멀한 PWA 인터페이스

<a id="features"></a>

## 기능

- PTY 리사이즈 지원과 지속형 워크플로 제어를 갖춘 브라우저 터미널.
- 워크스페이스 생성, LaTeX 초기화, 컴파일 흐름을 위한 프로젝트 제어 패널.
- 저장 및 선택적 감시/리로드 폴링을 지원하는 파일 트리 + CodeMirror 에디터.
- `/home/<user>/Projects/<project>/latex/<file>.pdf`를 대상으로 하는 PDF 미리보기 파이프라인.
- 세션 시작/재개, 상태 동기화, 선택적 DB 로깅을 지원하는 Codex Bridge.
- UI 내 Git/SSH 도우미(아이덴티티 저장, 원격 저장소 미리 채움, SSH 키 생성/확인).
- Docker 인지형 명령/파일 작업 및 호스트 셸/파일시스템 폴백.

### 기능 맵

| 기능 | 세부 사항 |
|---|---|
| Terminal | `/ws`를 통한 WebSocket PTY 스트림, 상호작용형 셸 워크플로 |
| Agent bridge | `/codex/ws` + `/api/codex/*` 세션 오케스트레이션 |
| Files | `/api/file` 읽기/쓰기, `/api/tree` 구조 탐색 |
| PDF preview | `/api/pdf`를 통한 컴파일 결과 제공 |
| Controls | 프로젝트 생성, LaTeX 초기화, 컴파일, Git/SSH 설정 |

## 프로젝트 상태

- PWA 워크스페이스: 웹 터미널, PDF 미리보기, 에디터.
- Project Controls: 워크스페이스 생성, LaTeX 초기화, 컴파일, Git/SSH 도우미.
- Codex Bridge: 세션 재개, DB 히스토리 목록, /status 동기화 토글.
- 저장/감시 기능이 있는 파일 트리 + CodeMirror 에디터.
- LaTeX/Python/R 툴체인을 갖춘 Docker 기반 실행(선택 사항).

## 데모

![PaperAgent demo](demos/demo-full.png)

## 프로젝트 구조

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

<a id="prerequisites"></a>

## 사전 요구사항

- OS: Linux 권장(Docker 및 셸 도구 사용을 전제로 함).
- Python: 가능하면 기존 Conda 환경(`paperagent`)을 사용하세요.
- 의존성:
  - `tornado`
  - `psycopg[binary]` (선택 사항이지만 DB 기반 기능에는 권장)
- 선택적 런타임 서비스:
  - Docker (샌드박스 셸 및 컨테이너 기반 프로젝트 경로)
  - PostgreSQL (사용자/프로젝트/Codex 세션 이력 영속화)
- 샌드박스/컨테이너 내부 선택적 툴체인:
  - LaTeX (`latexmk` 및 TeX 패키지)
  - Python, R
  - Node + `@openai/codex`

### 의존성 매트릭스

| 유형 | 구성 요소 |
|---|---|
| 필수 | Python + `tornado` |
| 권장 | DB 기반 기능을 위한 `psycopg[binary]` |
| 선택적 서비스 | Docker, PostgreSQL |
| 선택적 툴체인 | LaTeX (`latexmk`), Python/R, Node + `@openai/codex` |

## 설치

### 1) 저장소 클론 (서브모듈 포함)

```bash
git clone --recurse-submodules https://github.com/lachlanchen/PaperAgent.git
cd PaperAgent
```

이미 클론했지만 서브모듈이 없다면:

```bash
git submodule update --init --recursive
```

### 2) Python 환경 및 패키지

```bash
conda activate paperagent
pip install tornado "psycopg[binary]"
```

대안 (환경 내부가 아닌 경우):

```bash
conda run -n paperagent pip install tornado "psycopg[binary]"
```

### 3) 환경 설정

```bash
cp .env.example .env
```

사용 중인 머신에 맞게 `.env`를 수정하세요(DB 자격 증명, Codex 기본값 등).

### 4) 선택적 데이터베이스 부트스트랩

```bash
./scripts/init_db.sh
```

이 스크립트는 role + DB를 생성/업데이트하고 `scripts/db_schema.sql`을 적용합니다.

### 5) 선택적 Docker 샌드박스 부트스트랩

```bash
./scripts/setup_docker_env.sh
```

NVIDIA 호스트 설정이 필요한 경우:

```bash
./scripts/install_nvidia_host.sh
```

## 사용법

### 로컬 실행 (권장 기본값)

```bash
cd webterm
python server.py --host 127.0.0.1 --port 8765
```

접속: `http://127.0.0.1:8765`

### Docker shell 타깃으로 실행

```bash
cd webterm
python server.py --host 0.0.0.0 --port 8766 --shell ./docker-shell.sh
```

### 개발용 자동 리로드 모드

```bash
cd webterm
python server.py --host 127.0.0.1 --port 8765 --dev
```

`--dev` 모드에서는 오래된 에셋 문제를 피하기 위해 서비스 워커 캐시를 비활성화합니다.

### 일반적인 UI 흐름

1. 제어 패널에 user + project를 입력합니다.
2. **Create Project + cd**를 눌러 다음을 생성합니다:
   `/home/<user>/Projects/<project>/{code,data,figures,latex/latex_figures,artifacts}`
3. **Init LaTeX**를 눌러 `latex/main.tex`를 스캐폴딩합니다.
4. **Compile LaTeX**(`latexmk`)를 실행하고 PDF 미리보기를 새로고침/열기합니다.
5. 파일 트리에서 CodeMirror로 파일을 편집하고 저장합니다.
6. 프롬프트 기반 편집 및 세션 재개를 위해 Codex Bridge를 사용합니다.

### API 빠른 경로

| Endpoint | 용도 |
|---|---|
| `/api/tree` | 에디터 패널용 프로젝트 디렉터리 트리 조회 |
| `/api/file` | 프로젝트 파일 읽기/쓰기 |
| `/api/pdf` | 렌더링된 PDF 산출물 가져오기 |
| `/api/codex/*` | 세션 라이프사이클, 이력, 상태 동기화 |
| `/codex/ws` | Codex bridge 이벤트용 WebSocket 채널 |

## 설정

PaperAgent는 `.env`(또는 `ENV_FILE`)와 프로세스 환경변수에서 env 값을 읽습니다.

### 핵심 DB 설정

```bash
DB_HOST=localhost
DB_PORT=5432
DB_NAME=paperagent_db
DB_USER=lachlan
DB_PASSWORD=change_me
```

### Codex 기본값

```bash
CODEX_LOG_DB=1
CODEX_LOG_OUTPUT=1
CODEX_USERNAME=lachlan
CODEX_PROJECT=demo-paper
CODEX_ARGS="-s danger-full-access -a never"
CODEX_NVM_DIR=/root/.nvm
CODEX_HISTORY_MESSAGES=1000
```

### 추가로 유용한 토글

- `CODEX_AUTO_RESTORE=1`: 누락된 세션 ID를 재생성하고 저장된 이력을 재생합니다.
- `PROJECT_DB=1`: DB 기반 프로젝트 메타데이터 영속화를 활성화합니다.
- `WEBTERM_QUIET_LOGS=1`: 폴링/정적 파일 접근 로그의 과도한 출력을 줄입니다.
- `CODEX_CMD=codex`: Codex 실행 명령.
- `CODEX_CWD=/workspace`: user/project 경로를 사용할 수 없을 때의 대체 작업 디렉터리.
- `WEBTERM_CONTAINER=<name>`: 감지된 컨테이너 이름을 수동으로 덮어씁니다.

## 예시

### 실행 후 터미널 확인

```bash
cd webterm
python server.py --host 127.0.0.1 --port 8765
# in browser terminal:
pwd
```

### 프로젝트 트리 API 조회

```bash
curl "http://127.0.0.1:8765/api/tree?user=paperagent&project=demo-paper&depth=4"
```

### PDF 가져오기 (컴파일 후)

```bash
curl -o main.pdf "http://127.0.0.1:8765/api/pdf?user=paperagent&project=demo-paper&file=main.pdf"
```

### API를 통한 파일 읽기

```bash
curl "http://127.0.0.1:8765/api/file?user=paperagent&project=demo-paper&path=latex/main.tex"
```

## 개발 노트

- 코드 스타일:
  - Python: 4칸 들여쓰기, 작고 직관적인 함수.
  - Frontend: 2칸 들여쓰기, kebab-case CSS 클래스명.
- 아직 정식 자동화 테스트 스위트는 없고, 수동 점검이 기본입니다.
- 수동 점검:
  - PWA를 열고 터미널에 연결한 뒤 `pwd` 실행.
  - UI에서 프로젝트 생성 및 LaTeX 컴파일 동작 확인.
- PWA 자산을 수정했다면 `webterm/static/sw.js`의 서비스 워커 캐시 이름을 갱신하세요.
- `codex/`와 `overleaf/`는 서브모듈이므로, 의도적인 경우가 아니면 직접 수정을 피하세요.

## 문제 해결

### Docker shell permission denied

Docker 접근이 실패하면 현재 셸이 docker 그룹 멤버십을 반영했는지 확인하세요.

```bash
newgrp docker
cd webterm
python server.py --host 0.0.0.0 --port 8766
```

### PDF not found in preview

- 터미널에서 컴파일이 성공적으로 완료됐는지 확인하세요.
- `/home/<user>/Projects/<project>/latex/main.pdf`에 파일이 존재하는지 확인하세요.
- PDF 패널을 새로고침하거나 **Open** 버튼을 사용하세요.

### DB features not available

- `.env`의 DB 자격 증명을 확인하세요.
- Postgres가 실행 중이며 접근 가능한지 확인하세요.
- 드라이버 설치: `pip install "psycopg[binary]"`.
- 필요하면 `./scripts/init_db.sh`를 실행한 뒤 서버를 재시작하세요.

### Codex command not found

- UI 설치기(NVM + Node LTS + `@openai/codex`) 또는 수동 설치로 Codex를 설치하세요.
- 런타임 컨텍스트에 맞게 `CODEX_CMD`와 `CODEX_NVM_DIR`가 설정되어 있는지 확인하세요.

### LAN binding safety

`--host 0.0.0.0`는 신뢰할 수 있는 네트워크에서만 사용하세요. 인증/TLS 없이 공용 인터넷에 노출하면 안 됩니다.

## 로드맵

계획 및 진행 중인 방향(`references/roadmap-blueprint.md` 및 관련 문서 참고):

- 다단계 논문 자동화 루프와 재현성 워크플로 개선.
- Codex Bridge 세션 신뢰성 및 가시성 확장.
- 샌드박스/런타임 설정 경로 강화(CPU/GPU 변형 포함).
- 프로젝트 컨트롤과 에디터 사용성 개선.
- 다국어 문서 및 웹사이트 정합성 지속 개선.

## 메인 프로젝트

- https://github.com/lachlanchen/the-art-of-lazying

## 에코시스템 링크

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

## 후원

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

여러분의 지원은 제가 연구, 개발, 운영을 지속하고 더 많은 오픈 프로젝트와 개선 사항을 공유할 수 있게 해줍니다.

## 기여

기여를 환영합니다.

- 문제/제안을 설명하는 이슈를 열어 주세요.
- 변경은 작고 집중적으로 유지해 주세요.
- 이 저장소의 커밋 스타일(`Add ...`, `Update ...`, `Expand ...`)을 따라 주세요.
- 프론트엔드/UI 변경 시 PR에 스크린샷 또는 GIF를 포함해 주세요.
- README를 수정할 때는 모든 언어 변형(`README.*.md`)도 함께 맞춰 주세요.

참고: 서브모듈 기여 정책은 각 상위 저장소(`codex/`, `overleaf/`)에서 정의됩니다.

<a id="license"></a>

## 라이선스

현재 저장소 루트 트리에는 저장소 수준의 라이선스 파일이 없습니다.

- 가정: 이 프로젝트는 아직 최종 확정된 최상위 라이선스 파일 없이 공유되고 있을 수 있습니다.
- 큰 규모의 수정본을 재배포하기 전에 라이선스 의도를 확인하세요.
- 서브모듈은 각자의 상위 라이선스를 따릅니다(예: `overleaf/LICENSE`).

## 감사의 말

- 협업 LaTeX 플랫폼 인프라 아이디어와 구성요소를 제공한 [Overleaf](https://github.com/overleaf/overleaf).
- 에이전트형 터미널 워크플로를 제공한 [OpenAI Codex CLI](https://github.com/openai/codex).
- 제품 비전 및 프로젝트 간 통합을 이끄는 광범위한 `the-art-of-lazying` 에코시스템.
