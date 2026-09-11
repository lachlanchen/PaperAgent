[English](../README.md) · [العربية](README.ar.md) · [Español](README.es.md) · [Français](README.fr.md) · [日本語](README.ja.md) · [한국어](README.ko.md) · [Tiếng Việt](README.vi.md) · [中文 (简体)](README.zh-Hans.md) · [中文（繁體）](README.zh-Hant.md) · [Deutsch](README.de.md) · [Русский](README.ru.md)


[![LazyingArt banner](https://github.com/lachlanchen/lachlanchen/raw/main/figs/banner.png)](https://github.com/lachlanchen/lachlanchen/blob/main/figs/banner.png)

[![Main Project](https://img.shields.io/badge/Main%20Project-the--art--of--lazying-0f766e?style=for-the-badge)](https://github.com/lachlanchen/the-art-of-lazying) [![Main Website](https://img.shields.io/badge/Main%20Website-lazying.art-0f766e?style=for-the-badge)](https://lazying.art)
[![GitHub stars](https://img.shields.io/github/stars/lachlanchen/PaperAgent?style=for-the-badge&label=Stars&color=0f766e)](https://github.com/lachlanchen/PaperAgent/stargazers)
[![GitHub issues](https://img.shields.io/github/issues/lachlanchen/PaperAgent?style=for-the-badge&label=Issues&color=7c3aed)](https://github.com/lachlanchen/PaperAgent/issues)
[![Docs](https://img.shields.io/badge/Docs-README-2563eb?style=for-the-badge)](README.md)

# PaperAgent

[![Local First](https://img.shields.io/badge/Local--First-Yes-0f766e?style=flat-square)](#обзор)
[![PWA](https://img.shields.io/badge/PWA-Enabled-2563eb?style=flat-square)](#обзор)
[![Backend](https://img.shields.io/badge/Backend-Tornado-7c3aed?style=flat-square)](#обзор)
[![Terminal](https://img.shields.io/badge/Terminal-PTY-WebSocket-0891b2?style=flat-square)](#функции)
[![Docker Optional](https://img.shields.io/badge/Docker-Optional-0ea5e9?style=flat-square)](#предварительные-требования)
[![Postgres Optional](https://img.shields.io/badge/PostgreSQL-Optional-1d4ed8?style=flat-square)](#предварительные-требования)
[![License](https://img.shields.io/badge/License-Pending-lightgrey?style=flat-square)](#лицензия)

PaperAgent — это локальное веб-пространство для написания научных работ: редактирование LaTeX и кода в браузере, запуск Python/R и компиляция LaTeX на backend, а также предпросмотр PDF с логами в одном месте.

## Помощь со сборкой рукописи

Хотите запускать PaperAgent самостоятельно? Начните с этого репозитория. Если для одной рукописи нужна чистая сборка LaTeX и проверяемая версия с правками, [спринт с фиксированным объёмом за 250 USD](https://lazying.art/manuscript-sprint/?utm_source=github&utm_medium=repository&utm_campaign=manuscript_sprint_pilot&utm_content=paperagent_readme) показывает пример, объём и исключения до бесплатной проверки соответствия.

## 💡 Видение

PaperAgent создан, чтобы освобождать исследователей от рутинной суеты и возвращать фокус к «Only Ideas».  
Цель простая: оставить мышление за человеком, а рутину сделать задачей системы.  
Вырабатывайте идеи и нарратив, а PaperAgent будет закрывать циклы исполнения.

## 🧭 Философия

- Local-first, privacy-first: по умолчанию данные и выполнение остаются на вашем компьютере.
- Идеи прежде всего: переход от концепции к рабочему черновику статьи с минимальным трением.
- Небольшие обратимые шаги: каждое изменение прозрачно и его легко откатить.
- Инструменты должны убирать работу, а не добавлять: автоматизация нужна, чтобы сокращать ручной труд.

## 🛠️ Логика (как это работает)

1. Chat -> Edit: опишите изменение, и PaperAgent отредактирует нужные файлы.
2. Run -> Compile: запускайте Python/R, компилируйте LaTeX, генерируйте фигуры.
3. Preview -> Iterate: смотрите PDF и логи, быстро исправляйте и повторяйте.

## 📚 Обзор

PaperAgent построен вокруг `webterm/`: сервера Tornado + WebSocket, который обеспечивает PWA-рабочее пространство в браузере:

- Потоковый PTY-терминал (`/ws`) для интерактивной работы в shell.
- Codex Bridge WebSocket/API (`/codex/ws`, `/api/codex/*`) для сессионных агентских потоков.
- API файлов, дерева и PDF (`/api/file`, `/api/tree`, `/api/pdf`) для редактирования и предпросмотра в браузере.
- Необязательное хранение в Postgres для пользователей, проектов, git-метаданных и истории Codex.
- Необязательное выполнение через `webterm/docker-shell.sh` в Docker.

### Взгляд по существу

| Область | Что предоставляет |
|---|---|
| Рабочее пространство | Browser terminal + editor + file tree + PDF-панель |
| Цикл автоматизации | правки по prompt, компиляция, просмотр логов, итерация |
| Runtime | По умолчанию host shell, Docker shell по желанию |
| Хранение | Stateless-режим по умолчанию; опционально история/метаданные в Postgres |
| Документация/i18n | Мультиязычный комплект README и директория `i18n/` в репозитории |

## 🎯 Что вы получаете

- Web terminal, подключенный к Docker sandbox
- Подготовка LaTeX-проекта и компиляция в один клик
- Запуск Python/R для построения графиков и экспериментов
- Предпросмотр PDF вместе с логами
- Чистый, минималистичный интерфейс PWA

## ⚙️ Функции

- Браузерный терминал с поддержкой изменения размера PTY и сохранённым управлением потоком.
- Панель управления проектом для создания рабочего пространства, инициализации LaTeX и компиляции.
- Файловое дерево + редактор CodeMirror с сохранением и опциональным watch/reload.
- Конвейер предпросмотра PDF для `/home/<user>/Projects/<project>/latex/<file>.pdf`.
- Codex Bridge с запуском и возобновлением сессий, синхронизацией статуса и опциональным логированием в БД.
- Git/SSH-инструменты в UI (сохранение identity, автозаполнение remote, генерация/проверка SSH-ключей).
- Docker-aware команды и файловые операции с fallback на host shell/filesystem.

### Карта функций

| Возможность | Детали |
|---|---|
| Terminal | Поток PTY через WebSocket `/ws`, интерактивный shell-воркфлоу |
| Agent bridge | Оркестрация сессий через `/codex/ws` + `/api/codex/*` |
| Files | Просмотр структуры через `/api/tree`, чтение/запись через `/api/file` |
| PDF preview | Отдача собранных артефактов через `/api/pdf` |
| Controls | Создание проекта, инициализация LaTeX, компиляция, настройка Git/SSH |

## 📈 Статус проекта

- PWA workspace: web terminal, PDF preview, editor.
- Project Controls: создание workspace, инициализация LaTeX, компиляция, Git/SSH помощники.
- Codex Bridge: возобновление сессии, список истории из БД, переключатель синхронизации `/status`.
- Файловое дерево и редактор CodeMirror с сохранением и watch.
- Выполнение через Docker (опционально) с toolchain LaTeX/Python/R.

## 🎬 Демонстрация

![Демонстрация PaperAgent](demos/demo-full.png)

## 🗂️ Структура проекта

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

## 🧪 Предварительные требования

- ОС: рекомендуется Linux (ожидаются Docker и shell-инструменты).
- Python: при наличии используйте существующее conda-окружение (`paperagent`).
- Зависимости:
  - `tornado`
  - `psycopg[binary]` (необязательно, но рекомендуется для возможностей, зависящих от БД)
- Необязательные runtime-сервисы:
  - Docker (для sandbox shell и контейнеризованных путей проектов)
  - PostgreSQL (для сохранения пользователей, проектов и истории сессий Codex)
- Необязательные toolchain внутри sandbox/container:
  - LaTeX (`latexmk` и пакеты TeX)
  - Python, R
  - Node + `@openai/codex`

### Матрица зависимостей

| Тип | Компоненты |
|---|---|
| Обязательные | Python + `tornado` |
| Рекомендуемые | `psycopg[binary]` для функций на базе БД |
| Необязательные сервисы | Docker, PostgreSQL |
| Необязательные toolchain | LaTeX (`latexmk`), Python/R, Node + `@openai/codex` |

## 🚀 Установка

### 1) Клонирование репозитория (с submodules)

```bash
git clone --recurse-submodules https://github.com/lachlanchen/PaperAgent.git
cd PaperAgent
```

Если репозиторий уже клонирован без submodules:

```bash
git submodule update --init --recursive
```

### 2) Настройка окружения Python и пакетов

```bash
conda activate paperagent
pip install tornado "psycopg[binary]"
```

Альтернатива (если вы не в окружении):

```bash
conda run -n paperagent pip install tornado "psycopg[binary]"
```

### 3) Конфигурация окружения

```bash
cp .env.example .env
```

Отредактируйте `.env` под вашу машину (учётные данные БД, значения по умолчанию для Codex и т.д.).

### 4) Необязательная инициализация базы данных

```bash
./scripts/init_db.sh
```

Эта команда создаёт/обновляет роль и БД и применяет `scripts/db_schema.sql`.

### 5) Необязательная инициализация Docker sandbox

```bash
./scripts/setup_docker_env.sh
```

Для настройки NVIDIA-host (при необходимости):

```bash
./scripts/install_nvidia_host.sh
```

## 🧑‍💻 Использование

### Локальный запуск (рекомендуемый по умолчанию)

```bash
cd webterm
python server.py --host 127.0.0.1 --port 8765
```

Откройте: `http://127.0.0.1:8765`

### Запуск с Docker shell target

```bash
cd webterm
python server.py --host 0.0.0.0 --port 8766 --shell ./docker-shell.sh
```

### Режим авто-перезагрузки (`--dev`)

```bash
cd webterm
python server.py --host 127.0.0.1 --port 8765 --dev
```

В режиме `--dev` кэширование service worker отключено, чтобы избежать устаревших ассетов.

### Типичный UI-поток

1. Укажите пользователя и проект в control panel.
2. Нажмите **Create Project + cd**, чтобы создать:
   `/home/<user>/Projects/<project>/{code,data,figures,latex/latex_figures,artifacts}`
3. Нажмите **Init LaTeX** для scaffolding `latex/main.tex`.
4. Нажмите **Compile LaTeX** (`latexmk`) и обновите/откройте предпросмотр PDF.
5. Редактируйте файлы в CodeMirror через file tree и сохраняйте.
6. Используйте Codex Bridge для правок по prompt и возобновления сессий.

### Быстрые API-маршруты

| Endpoint | Назначение |
|---|---|
| `/api/tree` | Запрос дерева каталога проекта для панели редактора |
| `/api/file` | Чтение/запись файлов проекта |
| `/api/pdf` | Получение рендеров PDF-артефактов |
| `/api/codex/*` | Жизненный цикл сессии, история, синхронизация статуса |
| `/codex/ws` | WebSocket-канал событий Codex bridge |

## 🔧 Конфигурация

PaperAgent читает переменные окружения из `.env` (или `ENV_FILE`) и переменных процесса.

### Базовые настройки БД

```bash
DB_HOST=localhost
DB_PORT=5432
DB_NAME=paperagent_db
DB_USER=lachlan
DB_PASSWORD=change_me
```

### Значения по умолчанию Codex

```bash
CODEX_LOG_DB=1
CODEX_LOG_OUTPUT=1
CODEX_USERNAME=lachlan
CODEX_PROJECT=demo-paper
CODEX_ARGS="-s danger-full-access -a never"
CODEX_NVM_DIR=/root/.nvm
CODEX_HISTORY_MESSAGES=1000
```

### Дополнительные полезные переключатели

- `CODEX_AUTO_RESTORE=1`: пересоздаёт отсутствующие session ID и воспроизводит сохранённую историю.
- `PROJECT_DB=1`: включает persistence метаданных проекта в БД.
- `WEBTERM_QUIET_LOGS=1`: подавляет шумные polling/static access логи.
- `CODEX_CMD=codex`: команда запуска Codex.
- `CODEX_CWD=/workspace`: резервный рабочий каталог, если путь user/project недоступен.
- `WEBTERM_CONTAINER=<name>`: переопределяет определённое автоматически имя контейнера.

## 📦 Примеры

### Запуск и проверка терминала

```bash
cd webterm
python server.py --host 127.0.0.1 --port 8765
# in browser terminal:
pwd
```

### Запрос дерева проекта через API

```bash
curl "http://127.0.0.1:8765/api/tree?user=paperagent&project=demo-paper&depth=4"
```

### Получение PDF (после компиляции)

```bash
curl -o main.pdf "http://127.0.0.1:8765/api/pdf?user=paperagent&project=demo-paper&file=main.pdf"
```

### Чтение файла через API

```bash
curl "http://127.0.0.1:8765/api/file?user=paperagent&project=demo-paper&path=latex/main.tex"
```

## 🧪 Примечания по разработке

- Стиль кода:
  - Python: отступ в 4 пробела, короткие и понятные функции.
  - Frontend: отступ в 2 пробела, классы CSS в `kebab-case`.
- Формальной автоматизированной тестовой системы пока нет; основной упор на ручные проверки.
- Ручные проверки:
  - Загрузите PWA, подключите терминал, выполните `pwd`.
  - Проверьте создание проекта и компиляцию LaTeX из UI.
- Если обновляете PWA-ресурсы, измените имя кэша service worker в `webterm/static/sw.js`.
- Рассматривайте `codex/` и `overleaf/` как submodule; не редактируйте их напрямую без явной причины.

## 🩺 Устранение неполадок

### Отказано в доступе к Docker shell

Если доступ к Docker не работает, проверьте, есть ли у вашего shell членство в группе docker:

```bash
newgrp docker
cd webterm
python server.py --host 0.0.0.0 --port 8766
```

### PDF не найден в предпросмотре

- Убедитесь, что компиляция в терминале завершилась успешно.
- Убедитесь, что файл есть по пути `/home/<user>/Projects/<project>/latex/main.pdf`.
- Обновите PDF-панель или используйте кнопку **Open**.

### Функции БД недоступны

- Проверьте учётные данные БД в `.env`.
- Убедитесь, что Postgres запущен и доступен.
- Установите драйвер: `pip install "psycopg[binary]"`.
- При необходимости выполните `./scripts/init_db.sh` и перезапустите сервер.

### Команда Codex не найдена

- Установите Codex через UI installer (NVM + Node LTS + `@openai/codex`) или вручную.
- Убедите, что `CODEX_CMD` и `CODEX_NVM_DIR` корректно заданы для вашего runtime-контекста.

### Безопасность LAN binding

`--host 0.0.0.0` подходит только для доверенных сетей. Не публикуйте публично без auth/TLS.

## 🗺️ Дорожная карта

Планируемое направление и текущие задачи (см. `references/roadmap-blueprint.md` и связанные документы):

- Улучшение многошагового цикла автоматизации написания статей и воспроизводимости.
- Расширение надёжности и наблюдаемости сессий Codex Bridge.
- Укрепление путей настройки sandbox/runtime (варианты CPU/GPU).
- Улучшение project controls и эргономики редактора.
- Продолжение развития мультиязычной документации и согласования с сайтом.

## 🌐 Основной проект

- https://github.com/lachlanchen/the-art-of-lazying

## 🔗 Ссылки экосистемы

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

## 🤝 Участие в разработке

Вклады приветствуются.

- Откройте issue с описанием проблемы или предложения.
- Держите изменения сфокусированными и небольшими.
- Соблюдайте стиль коммитов, принятый в репозитории: `Add ...`, `Update ...`, `Expand ...`.
- Для frontend/UI изменений добавляйте скриншоты или GIF в PR.
- При обновлении README поддерживайте выравнивание всех языковых вариантов (`README.*.md`).

Note: политики по внесению изменений в submodule определены в их upstream-репозиториях (`codex/`, `overleaf/`).

## 📜 Лицензия

Файл лицензии на уровне репозитория в корне текущего дерева отсутствует.

- Предположение: проект может временно распространяться без финализованного корневого файла лицензии.
- Подтвердите лицензионные намерения перед распространением существенно изменённых версий.
- Submodule используют собственные upstream-лицензии (например, `overleaf/LICENSE`).

## 🙏 Благодарности

- [Overleaf](https://github.com/overleaf/overleaf) за идеи инфраструктуры для совместной работы с LaTeX и отдельные компоненты.
- [OpenAI Codex CLI](https://github.com/openai/codex) за терминальные агентные workflow.
- Более широкую экосистему `the-art-of-lazying` за продуктовую видение и межпроектную интеграцию.


## ❤️ Support

| Donate | PayPal | Stripe |
| --- | --- | --- |
| [![Donate](https://camo.githubusercontent.com/24a4914f0b42c6f435f9e101621f1e52535b02c225764b2f6cc99416926004b7/68747470733a2f2f696d672e736869656c64732e696f2f62616467652f446f6e6174652d4c617a79696e674172742d3045413545393f7374796c653d666f722d7468652d6261646765266c6f676f3d6b6f2d6669266c6f676f436f6c6f723d7768697465)](https://chat.lazying.art/donate) | [![PayPal](https://camo.githubusercontent.com/d0f57e8b016517a4b06961b24d0ca87d62fdba16e18bbdb6aba28e978dc0ea21/68747470733a2f2f696d672e736869656c64732e696f2f62616467652f50617950616c2d526f6e677a686f754368656e2d3030343537433f7374796c653d666f722d7468652d6261646765266c6f676f3d70617970616c266c6f676f436f6c6f723d7768697465)](https://paypal.me/RongzhouChen) | [![Stripe](https://camo.githubusercontent.com/1152dfe04b6943afe3a8d2953676749603fb9f95e24088c92c97a01a897b4942/68747470733a2f2f696d672e736869656c64732e696f2f62616467652f5374726970652d446f6e6174652d3633354246463f7374796c653d666f722d7468652d6261646765266c6f676f3d737472697065266c6f676f436f6c6f723d7768697465)](https://buy.stripe.com/aFadR8gIaflgfQV6T4fw400) |
