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

PaperAgent は、論文作成のためのローカルファースト Web ワークスペースです。ブラウザで LaTeX とコードを編集し、バックエンドで Python/R を実行して LaTeX をコンパイルし、PDF とログをひとつの画面でプレビューできます。

## 💡 ビジョン

PaperAgent は、研究者の雑務から人を解放し「Only Ideas」を実現するために作られました。  
目標はシンプルで、
考えるのは人間、反復作業はシステムが担います。  
あなたはアイデアと物語に集中し、PaperAgent が実行ループを回します。

## 🧭 哲学

- ローカルファースト、プライバシーファースト: データと実行は既定でローカルマシン内に留まります。
- アイデアファーストのワークフロー: 構想から実行可能な論文へ、最小限の摩擦で進めます。
- 小さく、可逆的なステップ: すべての変更は透明で、簡単に元に戻せます。
- ツールは作業を減らすべき: 自動化は作業量を増やすためではなく、手作業を削減するためにあります。

## 🛠️ ロジック（動作イメージ）

1. Chat -> Edit: 変更内容を伝えると、PaperAgent が適切なファイルを編集します。
2. Run -> Compile: Python/R を実行し、LaTeX をコンパイルし、図を生成します。
3. Preview -> Iterate: PDF とログを確認し、素早く修正を繰り返します。

## 📚 概要

PaperAgent の中核は `webterm/` で、Tornado + WebSocket サーバーを使ったブラウザベースの PWA ワークスペースです。

- 対話型シェル作業向け PTY ターミナルストリーミング (`/ws`)
- セッションベースのエージェントワークフロー向け Codex Bridge WebSocket/API (`/codex/ws`, `/api/codex/*`)
- ブラウザ内編集とプレビュー向けファイル／ツリー／PDF API (`/api/file`, `/api/tree`, `/api/pdf`)
- ユーザー、プロジェクト、Git メタデータ、Codex 履歴向けに任意で利用可能な Postgres 永続化
- `webterm/docker-shell.sh` による任意の Docker シェル実行

### 一目でわかる概要

| 領域 | 提供内容 |
|---|---|
| ワークスペース | ブラウザターミナル + エディタ + ファイルツリー + PDF パネル |
| 自動化ループ | プロンプト駆動の編集、コンパイル、ログ確認、反復 |
| 実行基盤 | 既定はホストシェル、任意で Docker シェル |
| 永続化 | 既定はステートレス。任意で Postgres を使った履歴・メタデータ保存 |
| Docs/i18n | 多言語 README 一式とリポジトリ内 `i18n/` ディレクトリ |

## 🎯 得られること

- Web ターミナル（Docker サンドボックス連携）
- LaTeX プロジェクトの初期セットアップとワンクリックコンパイル
- 図や実験のための Python/R 実行
- ログ付き PDF プレビュー
- シンプルでミニマルな PWA インターフェース

## ⚙️ 機能

- PTY リサイズ対応のブラウザターミナルと永続的ワークフロー制御。
- ワークスペース作成、LaTeX 初期化、コンパイルフローのためのプロジェクト制御パネル。
- 保存と任意の watch/reload ポーリングに対応したファイルツリー + CodeMirror エディタ。
- `/home/<user>/Projects/<project>/latex/<file>.pdf` 用の PDF プレビュー配信パイプライン。
- セッション開始／再開、ステータス同期、任意の DB ログを備えた Codex Bridge。
- UI での Git/SSH 補助機能（ID 保存、リモート値の事前入力、SSH キー生成／検証）。
- Docker 対応のコマンド／ファイル操作とホストシェル／ファイルシステムへのフォールバック。

### 機能マップ

| 機能 | 詳細 |
|---|---|
| ターミナル | `/ws` 経由の WebSocket PTY ストリーム、対話型シェルワークフロー |
| エージェントブリッジ | `/codex/ws` + `/api/codex/*` によるセッション制御 |
| ファイル | `/api/file` 読み書き、`/api/tree` による構造閲覧 |
| PDF プレビュー | `/api/pdf` によるコンパイル成果物の配信 |
| 制御 | プロジェクト作成、LaTeX 初期化、コンパイル、Git/SSH 設定 |

## 📈 プロジェクトステータス

- PWA ワークスペース: web ターミナル、PDF プレビュー、エディタ |
- Project Controls: ワークスペース作成、LaTeX 初期化、コンパイル、Git/SSH 補助 |
- Codex Bridge: セッション再開、DB 履歴一覧、/status 同期トグル |
- 保存/watch 対応のファイルツリー + CodeMirror エディタ |
- LaTeX/Python/R ツールチェーンを備えた Docker 実行（任意） |

## 🎬 デモ

![PaperAgent demo](demos/demo-full.png)

## 🗂️ プロジェクト構成

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

## 🧪 前提条件

- OS: Linux 推奨（Docker やシェル系ツールが前提）
- Python: 利用可能であれば既存の Conda 環境 (`paperagent`) を使用します。
- 依存関係:
  - `tornado`
  - `psycopg[binary]`（任意だが DB バックエンド機能には推奨）
- 任意のランタイムサービス:
  - Docker（サンドボックスシェルとコンテナ化プロジェクトパス向け）
  - PostgreSQL（ユーザー／プロジェクト／Codex セッション履歴の永続化向け）
- サンドボックス／コンテナ内で任意で使うツールチェーン:
  - LaTeX（`latexmk` と TeX パッケージ）
  - Python, R
  - Node + `@openai/codex`

### 依存関係マトリクス

| 種別 | 構成 |
|---|---|
| 必須 | Python + `tornado` |
| 推奨 | DB バックエンド機能向け `psycopg[binary]` |
| 任意サービス | Docker, PostgreSQL |
| 任意ツールチェーン | LaTeX (`latexmk`), Python/R, Node + `@openai/codex` |

## 🚀 インストール

### 1) リポジトリをクローン（サブモジュール付き）

```bash

git clone --recurse-submodules https://github.com/lachlanchen/PaperAgent.git
cd PaperAgent
```

既にサブモジュールなしでクローン済みの場合:

```bash
git submodule update --init --recursive
```

### 2) Python 環境とパッケージ

```bash
conda activate paperagent
pip install tornado "psycopg[binary]"
```

別案（env 外で実行する場合）:

```bash
conda run -n paperagent pip install tornado "psycopg[binary]"
```

### 3) 環境変数ファイルの設定

```bash
cp .env.example .env
```

自分の環境に合わせて `.env` を編集します（DB 認証情報、Codex のデフォルト値など）。

### 4) 任意のデータベース初期化

```bash
./scripts/init_db.sh
```

このコマンドでロールと DB の作成/更新を行い、`scripts/db_schema.sql` を適用します。

### 5) 任意の Docker サンドボックス初期化

```bash
./scripts/setup_docker_env.sh
```

NVIDIA ホストの設定が必要な場合:

```bash
./scripts/install_nvidia_host.sh
```

## 🧑‍💻 使用方法

### ローカル実行（既定・推奨）

```bash
cd webterm
python server.py --host 127.0.0.1 --port 8765
```

開く: `http://127.0.0.1:8765`

### Docker シェルを使って実行

```bash
cd webterm
python server.py --host 0.0.0.0 --port 8766 --shell ./docker-shell.sh
```

### 開発用オートリロードモード

```bash
cd webterm
python server.py --host 127.0.0.1 --port 8765 --dev
```

`--dev` モードでは、サービスワーカーのキャッシュを無効化し、古いアセットの再利用を防ぎます。

### 典型的な UI 操作

1. コントロールパネルにユーザー名とプロジェクト名を入力します。
2. **Create Project + cd** をクリックして以下を作成:
   `/home/<user>/Projects/<project>/{code,data,figures,latex/latex_figures,artifacts}`
3. **Init LaTeX** をクリックして `latex/main.tex` を初期化します。
4. **Compile LaTeX** (`latexmk`) を実行し、PDF プレビューを更新／開く。
5. ファイルツリー経由で CodeMirror を使って編集し保存します。
6. Codex Bridge でプロンプト駆動編集とセッション再開を行います。

### API クイックルート

| エンドポイント | 目的 |
|---|---|
| `/api/tree` | エディタパネル向けのプロジェクトディレクトリツリーを取得 |
| `/api/file` | プロジェクトファイルの読み書き |
| `/api/pdf` | コンパイル済み PDF 成果物を取得 |
| `/api/codex/*` | セッションライフサイクル、履歴、ステータス同期 |
| `/codex/ws` | Codex ブリッジイベント用 WebSocket チャネル |

## 🔧 設定

PaperAgent は `.env`（または `ENV_FILE`）とプロセス環境変数から設定を読み込みます。

### コア DB 設定

```bash
DB_HOST=localhost
DB_PORT=5432
DB_NAME=paperagent_db
DB_USER=lachlan
DB_PASSWORD=change_me
```

### Codex の既定値

```bash
CODEX_LOG_DB=1
CODEX_LOG_OUTPUT=1
CODEX_USERNAME=lachlan
CODEX_PROJECT=demo-paper
CODEX_ARGS="-s danger-full-access -a never"
CODEX_NVM_DIR=/root/.nvm
CODEX_HISTORY_MESSAGES=1000
```

### 追加の便利トグル

- `CODEX_AUTO_RESTORE=1`: 欠落したセッション ID を再作成し、保存済み履歴を再生します。
- `PROJECT_DB=1`: DB バックエンドでのプロジェクトメタデータ永続化を有効化します。
- `WEBTERM_QUIET_LOGS=1`: ノイズの多いポーリング／静的アクセスログを抑制します。
- `CODEX_CMD=codex`: Codex 実行コマンド。
- `CODEX_CWD=/workspace`: user/project パスが利用不可のときの代替作業ディレクトリ。
- `WEBTERM_CONTAINER=<name>`: 検出済みコンテナ名を上書きします。

## 📦 使用例

### ターミナル起動と確認

```bash
cd webterm
python server.py --host 127.0.0.1 --port 8765
# ブラウザ側ターミナルで:
pwd
```

### プロジェクトツリー API の確認

```bash
curl "http://127.0.0.1:8765/api/tree?user=paperagent&project=demo-paper&depth=4"
```

### コンパイル後に PDF を取得

```bash
curl -o main.pdf "http://127.0.0.1:8765/api/pdf?user=paperagent&project=demo-paper&file=main.pdf"
```

### API でファイルを読み取り

```bash
curl "http://127.0.0.1:8765/api/file?user=paperagent&project=demo-paper&path=latex/main.tex"
```

## 🧪 開発ノート

- コードスタイル:
  - Python: 4 スペースインデント、短く直接的な関数。
  - フロントエンド: 2 スペースインデント、CSS クラス名は kebab-case。
- まだ正式な自動テストスイートはありません。主に手動チェックです。
- 手動チェック項目:
  - PWA を読み込んでターミナルを接続し `pwd` を実行。
  - UI からプロジェクト作成と LaTeX コンパイルを確認。
- PWA アセットを更新した場合は `webterm/static/sw.js` の service worker キャッシュ名を更新してください。
- `codex/` と `overleaf/` はサブモジュールとして扱い、意図がない限り直接編集しないでください。

## 🩺 トラブルシューティング

### Docker shell の permission denied

Docker へのアクセスに失敗する場合は、シェルが docker グループに所属しているか確認します。

```bash
newgrp docker
cd webterm
python server.py --host 0.0.0.0 --port 8766
```

### プレビューで PDF が見つからない

- ターミナル上でコンパイルが成功したか確認します。
- ファイルが `/home/<user>/Projects/<project>/latex/main.pdf` に存在するか確認します。
- PDF パネルを更新するか、**Open** ボタンを使います。

### DB 機能が使えない

- `.env` の DB 認証情報を確認します。
- PostgreSQL が起動していて到達可能かを確認します。
- ドライバをインストールします: `pip install "psycopg[binary]"`。
- 必要なら `./scripts/init_db.sh` を実行してサーバーを再起動します。

### Codex コマンドが見つからない

- UI インストーラ（NVM + Node LTS + `@openai/codex`）または手動で Codex をインストールします。
- 実行環境に応じて `CODEX_CMD` と `CODEX_NVM_DIR` が正しく設定されているか確認します。

### LAN バインドの安全性

`--host 0.0.0.0` は信頼できるネットワークのみで使用してください。認証/TLS なしで公開しないでください。

## 🗺️ ロードマップ

計画中および進行中の方針（`references/roadmap-blueprint.md` と関連ドキュメント参照）:

- 論文自動化ループのマルチステップ化と再現性ワークフローの改善。
- Codex Bridge のセッション信頼性と観測性の向上。
- サンドボックス／実行環境のセットアップパス改善（CPU/GPU バリアント）。
- プロジェクトコントロールとエディタの操作性向上。
- 多言語ドキュメントとウェブサイト整合の継続。

## 🌐 メインプロジェクト

- https://github.com/lachlanchen/the-art-of-lazying

## 🔗 エコシステムリンク

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

## 🤝 コントリビュート

コントリビューションは大歓迎です。

- 問題や提案内容を記載した issue を作成してください。
- 変更は焦点を絞って小さく保ってください。
- このリポジトリのコミット規約に従ってください: `Add ...`, `Update ...`, `Expand ...`。
- フロントエンド/UI 変更時は、PR にスクリーンショットまたは GIF を添付してください。
- README を更新する場合は、全言語版（`README.*.md`）との整合を保ってください。

サブモジュールへのコントリビューション方針は、それぞれ上流リポジトリ（`codex/`, `overleaf/`）で定義されています。

## 📜 ライセンス

ルートには現時点でリポジトリ全体のライセンスファイルがありません。

- 想定: 本プロジェクトは現時点で最終的なトップレベルライセンスが未確定のまま共有されている可能性があります。
- 大規模な改変版を再配布する前に、ライセンス方針を確認してください。
- サブモジュールには上流のライセンスが適用されます（例: `overleaf/LICENSE`）。

## 🙏 謝辞

- [Overleaf](https://github.com/overleaf/overleaf): 共同編集型 LaTeX 基盤のアイデアとコンポーネントを提供。
- [OpenAI Codex CLI](https://github.com/openai/codex): エージェント型ターミナルワークフロー。
- `the-art-of-lazying` エコシステム全体: 製品ビジョンとクロスプロジェクト統合の基盤。


## ❤️ Support

| Donate | PayPal | Stripe |
| --- | --- | --- |
| [![Donate](https://camo.githubusercontent.com/24a4914f0b42c6f435f9e101621f1e52535b02c225764b2f6cc99416926004b7/68747470733a2f2f696d672e736869656c64732e696f2f62616467652f446f6e6174652d4c617a79696e674172742d3045413545393f7374796c653d666f722d7468652d6261646765266c6f676f3d6b6f2d6669266c6f676f436f6c6f723d7768697465)](https://chat.lazying.art/donate) | [![PayPal](https://camo.githubusercontent.com/d0f57e8b016517a4b06961b24d0ca87d62fdba16e18bbdb6aba28e978dc0ea21/68747470733a2f2f696d672e736869656c64732e696f2f62616467652f50617950616c2d526f6e677a686f754368656e2d3030343537433f7374796c653d666f722d7468652d6261646765266c6f676f3d70617970616c266c6f676f436f6c6f723d7768697465)](https://paypal.me/RongzhouChen) | [![Stripe](https://camo.githubusercontent.com/1152dfe04b6943afe3a8d2953676749603fb9f95e24088c92c97a01a897b4942/68747470733a2f2f696d672e736869656c64732e696f2f62616467652f5374726970652d446f6e6174652d3633354246463f7374796c653d666f722d7468652d6261646765266c6f676f3d737472697065266c6f676f436f6c6f723d7768697465)](https://buy.stripe.com/aFadR8gIaflgfQV6T4fw400) |
