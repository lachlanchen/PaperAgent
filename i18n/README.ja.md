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

PaperAgent は、論文執筆のためのローカルファーストな Web ワークスペースです。ブラウザで LaTeX とコードを編集し、バックエンドで Python/R 実行や LaTeX コンパイルを行い、PDF とログを一か所で確認できます。

## Vision

PaperAgent は、研究における雑務からすべての人を解放し、「Only Ideas」に集中できるように設計されています。  
目標はシンプルです。思考は人間が担い、反復作業はシステムに任せること。  
あなたはアイデアと物語に集中し、PaperAgent は実行ループを処理します。

## Philosophy

- ローカルファースト、プライバシーファースト: 既定ではデータと実行はあなたのマシン上に留まります。
- アイデアファーストなワークフロー: 構想から実行可能な論文までを最小限の摩擦で進めます。
- 小さく可逆なステップ: すべての変更は透明で、簡単に元に戻せます。
- ツールは作業を減らすべき: 自動化は手間を増やすためでなく、雑務を消すためにあります。

## Logic (how it works)

1. Chat -> Edit: 変更内容を説明すると、PaperAgent が適切なファイルを編集します。
2. Run -> Compile: Python/R を実行し、LaTeX をコンパイルし、図を生成します。
3. Preview -> Iterate: PDF とログを確認し、すばやく修正し、繰り返します。

## Overview

PaperAgent の中心は `webterm/` で、Tornado + WebSocket サーバーによりブラウザベースの PWA ワークスペースを提供します。

- 対話型シェル作業のための PTY ターミナルストリーミング (`/ws`)。
- セッションベースのエージェントワークフロー向け Codex Bridge WebSocket/API (`/codex/ws`, `/api/codex/*`)。
- ブラウザ内編集とプレビュー向けのファイル・ツリー・PDF API (`/api/file`, `/api/tree`, `/api/pdf`)。
- ユーザー、プロジェクト、Git メタデータ、Codex 履歴のための任意の Postgres 永続化。
- `webterm/docker-shell.sh` を使った任意の Docker シェル実行。

### At a glance

| Area | What it provides |
|---|---|
| Workspace | ブラウザターミナル + エディタ + ファイルツリー + PDF パネル |
| Automation loop | プロンプト駆動の編集、コンパイル、ログ確認、反復 |
| Runtime | 既定はホストシェル、任意で Docker シェル |
| Persistence | 既定はステートレス; 任意で Postgres による履歴/メタデータ保持 |
| Docs/i18n | 多言語 README 群とリポジトリ内の `i18n/` ディレクトリ |

## What you get

- Docker サンドボックスに接続された Web ターミナル
- LaTeX プロジェクト雛形の作成とワンクリックコンパイル
- 図表生成や実験のための Python/R 実行
- ログ付き PDF プレビュー
- クリーンでミニマルな PWA インターフェース

## Features

- PTY リサイズ対応のブラウザターミナルと永続的なワークフロー制御。
- ワークスペース作成、LaTeX 初期化、コンパイルフローのためのプロジェクトコントロールパネル。
- 保存と任意の watch/reload ポーリングに対応したファイルツリー + CodeMirror エディタ。
- `/home/<user>/Projects/<project>/latex/<file>.pdf` 向け PDF プレビューパイプライン。
- セッション開始/再開、状態同期、任意の DB ログを備えた Codex Bridge。
- UI の Git/SSH 補助機能（ID 保存、リモート事前入力、SSH キー生成/確認）。
- Docker 対応のコマンド/ファイル操作（ホストシェル/ファイルシステムへのフォールバックあり）。

### Feature map

| Capability | Details |
|---|---|
| Terminal | `/ws` 経由の WebSocket PTY ストリーム、対話型シェルワークフロー |
| Agent bridge | `/codex/ws` + `/api/codex/*` セッションオーケストレーション |
| Files | `/api/file` 読み書き、`/api/tree` 構造ブラウズ |
| PDF preview | `/api/pdf` でコンパイル済み成果物を配信 |
| Controls | プロジェクト作成、LaTeX 初期化、コンパイル、Git/SSH セットアップ |

## Project status

- PWA ワークスペース: Web ターミナル、PDF プレビュー、エディタ。
- Project Controls: ワークスペース作成、LaTeX 初期化、コンパイル、Git/SSH 補助。
- Codex Bridge: セッション再開、DB 履歴一覧、`/status` 同期トグル。
- 保存/watch 対応のファイルツリー + CodeMirror エディタ。
- LaTeX/Python/R ツールチェーン付きの Docker 実行（任意）。

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

- OS: Linux 推奨（Docker とシェルツール利用を想定）。
- Python: 利用可能な場合は既存の Conda 環境 (`paperagent`) を使用。
- 依存関係:
  - `tornado`
  - `psycopg[binary]`（任意だが DB バックエンド機能には推奨）
- 任意のランタイムサービス:
  - Docker（サンドボックスシェルとコンテナ化プロジェクトパス向け）
  - PostgreSQL（ユーザー/プロジェクト/Codex セッション履歴の永続化向け）
- サンドボックス/コンテナ内での任意ツールチェーン:
  - LaTeX（`latexmk` と TeX パッケージ）
  - Python, R
  - Node + `@openai/codex`

### Dependency matrix

| Type | Components |
|---|---|
| Required | Python + `tornado` |
| Recommended | DB バックエンド機能向け `psycopg[binary]` |
| Optional services | Docker, PostgreSQL |
| Optional toolchains | LaTeX (`latexmk`), Python/R, Node + `@openai/codex` |

## Installation

### 1) Clone repository (with submodules)

```bash
git clone --recurse-submodules https://github.com/lachlanchen/PaperAgent.git
cd PaperAgent
```

サブモジュールなしでクローン済みの場合:

```bash
git submodule update --init --recursive
```

### 2) Python environment and packages

```bash
conda activate paperagent
pip install tornado "psycopg[binary]"
```

別案（env 内でない場合）:

```bash
conda run -n paperagent pip install tornado "psycopg[binary]"
```

### 3) Environment configuration

```bash
cp .env.example .env
```

あなたの環境に合わせて `.env` を編集します（DB 認証情報、Codex 既定値など）。

### 4) Optional database bootstrap

```bash
./scripts/init_db.sh
```

このスクリプトはロール + DB を作成/更新し、`scripts/db_schema.sql` を適用します。

### 5) Optional Docker sandbox bootstrap

```bash
./scripts/setup_docker_env.sh
```

NVIDIA ホスト設定（必要な場合）:

```bash
./scripts/install_nvidia_host.sh
```

## Usage

### Run locally (recommended default)

```bash
cd webterm
python server.py --host 127.0.0.1 --port 8765
```

開く: `http://127.0.0.1:8765`

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

`--dev` モードでは、古いアセットが残らないよう service worker キャッシュが無効になります。

### Typical UI flow

1. コントロールパネルに user と project を入力します。
2. **Create Project + cd** をクリックして以下を作成:
   `/home/<user>/Projects/<project>/{code,data,figures,latex/latex_figures,artifacts}`
3. **Init LaTeX** をクリックして `latex/main.tex` を生成します。
4. **Compile LaTeX** (`latexmk`) を実行し、PDF プレビューを更新/表示します。
5. ファイルツリー経由で CodeMirror 上のファイルを編集して保存します。
6. Codex Bridge を使ってプロンプト駆動編集とセッション再開を行います。

### API quick routes

| Endpoint | Purpose |
|---|---|
| `/api/tree` | エディタパネル向けプロジェクトディレクトリツリーを照会 |
| `/api/file` | プロジェクトファイルの読み書き |
| `/api/pdf` | レンダリング済み PDF 成果物を取得 |
| `/api/codex/*` | セッションライフサイクル、履歴、状態同期 |
| `/codex/ws` | Codex ブリッジイベント用 WebSocket チャネル |

## Configuration

PaperAgent は `.env`（または `ENV_FILE`）とプロセス環境から環境変数を読み込みます。

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

- `CODEX_AUTO_RESTORE=1`: 失われたセッション ID を再作成し、保存済み履歴を再生します。
- `PROJECT_DB=1`: DB バックエンドのプロジェクトメタデータ永続化を有効化。
- `WEBTERM_QUIET_LOGS=1`: ノイズの多いポーリング/静的アクセスログを抑制。
- `CODEX_CMD=codex`: Codex 実行コマンド。
- `CODEX_CWD=/workspace`: user/project パスが使えない場合のフォールバック作業ディレクトリ。
- `WEBTERM_CONTAINER=<name>`: 自動検出されたコンテナ名を上書き。

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

- コードスタイル:
  - Python: 4 スペースインデント、小さく直接的な関数。
  - Frontend: 2 スペースインデント、kebab-case の CSS クラス名。
- まだ正式な自動テストスイートはありません。手動確認が中心です。
- 手動確認:
  - PWA を開き、ターミナル接続後に `pwd` を実行。
  - UI からのプロジェクト作成と LaTeX コンパイル動作を確認。
- PWA アセットを更新した場合は、`webterm/static/sw.js` の service worker キャッシュ名を更新してください。
- `codex/` と `overleaf/` はサブモジュールとして扱い、意図がない限り直接編集を避けてください。

## Troubleshooting

### Docker shell permission denied

docker へのアクセスに失敗する場合は、シェルが docker グループに所属しているか確認してください。

```bash
newgrp docker
cd webterm
python server.py --host 0.0.0.0 --port 8766
```

### PDF not found in preview

- ターミナル上でコンパイルが正常完了したか確認。
- `/home/<user>/Projects/<project>/latex/main.pdf` にファイルが存在するか確認。
- PDF パネルを更新するか **Open** ボタンを使用。

### DB features not available

- `.env` の DB 認証情報を確認。
- Postgres が起動し、到達可能か確認。
- ドライバをインストール: `pip install "psycopg[binary]"`。
- 必要に応じて `./scripts/init_db.sh` を実行し、サーバーを再起動。

### Codex command not found

- UI インストーラ（NVM + Node LTS + `@openai/codex`）または手動で Codex をインストール。
- 実行コンテキストに対して `CODEX_CMD` と `CODEX_NVM_DIR` が正しいか確認。

### LAN binding safety

`--host 0.0.0.0` は信頼できるネットワーク専用です。認証/TLS なしで公開しないでください。

## Roadmap

計画中および進行中の方向性（`references/roadmap-blueprint.md` と関連ドキュメントを参照）:

- 論文自動化ループの多段化と再現性ワークフローの改善。
- Codex Bridge セッション信頼性と可観測性の拡張。
- サンドボックス/ランタイム設定経路（CPU/GPU バリアント）の強化。
- プロジェクトコントロールとエディタ操作性の改善。
- 多言語ドキュメントと Web サイト整合の継続。

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

ご支援は、私の研究・開発・運用を継続する力になります。今後もより多くのオープンプロジェクトと改善を共有していきます。

## Contributing

コントリビューションを歓迎します。

- 問題提起や提案内容を記した issue を作成してください。
- 変更は焦点を絞って小さく保ってください。
- このリポジトリのコミットスタイルに従ってください: `Add ...`, `Update ...`, `Expand ...`。
- フロントエンド/UI の変更では、PR にスクリーンショットまたは GIF を添付してください。
- README を更新する場合は、全言語版（`README.*.md`）の整合を保ってください。

注: サブモジュールのコントリビューション方針は、それぞれの上流リポジトリ（`codex/`, `overleaf/`）で定義されています。

## License

現在のツリーでは、リポジトリ直下にプロジェクトレベルのライセンスファイルは存在しません。

- 想定: 現時点ではトップレベルのライセンスが未確定のまま共有されている可能性があります。
- 大幅な改変版を再配布する前に、ライセンス方針を確認してください。
- サブモジュールには各上流のライセンスが適用されます（例: `overleaf/LICENSE`）。

## Acknowledgements

- [Overleaf](https://github.com/overleaf/overleaf): 協調 LaTeX プラットフォームのインフラ設計とコンポーネントに関する着想。
- [OpenAI Codex CLI](https://github.com/openai/codex): エージェント型ターミナルワークフロー。
- `the-art-of-lazying` エコシステム全体: プロダクトビジョンとプロジェクト横断統合。
