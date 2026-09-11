[English](../README.md) · [العربية](README.ar.md) · [Español](README.es.md) · [Français](README.fr.md) · [日本語](README.ja.md) · [한국어](README.ko.md) · [Tiếng Việt](README.vi.md) · [中文 (简体)](README.zh-Hans.md) · [中文（繁體）](README.zh-Hant.md) · [Deutsch](README.de.md) · [Русский](README.ru.md)


[![LazyingArt banner](https://github.com/lachlanchen/lachlanchen/raw/main/figs/banner.png)](https://github.com/lachlanchen/lachlanchen/blob/main/figs/banner.png)

[![Main Project](https://img.shields.io/badge/Main%20Project-the--art--of--lazying-0f766e?style=for-the-badge)](https://github.com/lachlanchen/the-art-of-lazying) [![Main Website](https://img.shields.io/badge/Main%20Website-lazying.art-0f766e?style=for-the-badge)](https://lazying.art)
[![GitHub stars](https://img.shields.io/badge/GitHub%20stars-lachlanchen%2FPaperAgent-0f766e?style=for-the-badge)](https://github.com/lachlanchen/PaperAgent/stargazers)
[![GitHub issues](https://img.shields.io/badge/GitHub%20issues-lachlanchen%2FPaperAgent-7c3aed?style=for-the-badge)](https://github.com/lachlanchen/PaperAgent/issues)
[![Docs](https://img.shields.io/badge/Docs-README-2563eb?style=for-the-badge)](README.md)

# PaperAgent

[![Local First](https://img.shields.io/badge/Local--First-Yes-0f766e?style=flat-square)](#overview)
[![PWA](https://img.shields.io/badge/PWA-Enabled-2563eb?style=flat-square)](#overview)
[![Backend](https://img.shields.io/badge/Backend-Tornado-7c3aed?style=flat-square)](#overview)
[![Terminal](https://img.shields.io/badge/PTY-WebSocket-0891b2?style=flat-square)](#funktionen)
[![Docker Optional](https://img.shields.io/badge/Docker-Optional-0ea5e9?style=flat-square)](#voraussetzungen)
[![Postgres Optional](https://img.shields.io/badge/PostgreSQL-Optional-1d4ed8?style=flat-square)](#voraussetzungen)
[![License](https://img.shields.io/badge/License-Pending-lightgrey?style=flat-square)](#lizenz)

PaperAgent ist ein lokal ausgerichteter Web-Arbeitsbereich für wissenschaftliches Schreiben: Bearbeite LaTeX und Code im Browser, führe Python/R aus und kompiliere LaTeX im Backend, und prüfe PDFs mit Logs an einer Stelle.

## Hilfe beim Manuskript-Build

Möchtest du PaperAgent selbst betreiben? Beginne mit diesem Repository. Wenn du für ein Manuskript einen sauberen LaTeX-Build und eine prüfbare Redline brauchst, zeigt der [fest umrissene Sprint für 250 USD](https://lazying.art/manuscript-sprint/?utm_source=github&utm_medium=repository&utm_campaign=manuscript_sprint_pilot&utm_content=paperagent_readme) vor dem kostenlosen Fit-Check Beispiel, Umfang und Ausschlüsse.

## 💡 Vision

PaperAgent ist darauf ausgelegt, alle im Forschungsalltag anfallenden Routinetätigkeiten auf ein Minimum zu reduzieren – damit nur noch „Only Ideas“ bleibt.
Das Ziel ist klar: Lass das Denken menschlich, und überlasse dem System die repetitiven Abläufe.
Du kümmerst dich um Idee und Storyline; PaperAgent übernimmt die Ausführungsschleifen.

## 🧭 Philosophie

- Local-first, privacy-first: Daten und Ausführung bleiben standardmäßig auf deinem Gerät.
- Idea-first-Workflow: Gehe mit möglichst wenig Reibung von einer Idee zu einem ausführbaren Paper.
- Kleine, reversible Schritte: Jede Änderung ist transparent und leicht rückgängig zu machen.
- Werkzeuge sollen Arbeit reduzieren: Automatisierung soll Last entfernen, nicht neue Last erzeugen.

## 🛠️ Logik (wie es funktioniert)

1. Chat -> Edit: Beschreibe die Änderung, und PaperAgent editiert die passenden Dateien.
2. Run -> Compile: Führe Python/R aus, kompiliere LaTeX, erzeuge Abbildungen.
3. Preview -> Iterate: Prüfe PDF + Logs, korrigiere schnell, wiederhole.

## 📚 Überblick

PaperAgent basiert auf `webterm/`, einem Tornado + WebSocket-Server, der eine browserbasierte PWA-Workspace-Umgebung bereitstellt:

- PTY-Terminal-Streaming (`/ws`) für interaktive Shell-Arbeit.
- Codex-Bridge-WebSocket/API (`/codex/ws`, `/api/codex/*`) für sitzungsbasierte Agent-Workflows.
- Datei-, Baum- und PDF-APIs (`/api/file`, `/api/tree`, `/api/pdf`) für In-Browser-Editing und Vorschau.
- Optional: Postgres-gestützte Persistenz für Nutzer, Projekte, Git-Metadaten und Codex-Verlauf.
- Optionale Docker-Shell-Ausführung über `webterm/docker-shell.sh`.

### Auf einen Blick

| Bereich | Liefert | 
|---|---|
| Workspace | Browser-Terminal + Editor + Dateibaum + PDF-Panel |
| Automationsschleife | Prompt-gesteuerte Änderungen, Kompilieren, Logs prüfen, iterieren |
| Runtime | Standardmäßig Host-Shell, optionale Docker-Shell |
| Persistenz | Standardmäßig zustandslos; optional Postgres-gestützte Historie/Metadaten |
| Docs/i18n | Mehrsprachiger README-Satz und `i18n/`-Verzeichnis im Repo |

## 🎯 Was du bekommst

- Webterminal mit Verbindung zu einer Docker-Sandbox
- LaTeX-Projektstruktur und Ein-Klick-Kompilierung
- Python/R-Ausführung für Abbildungen und Experimente
- PDF-Vorschau mit Logs
- Eine klare, minimalistische PWA-Benutzeroberfläche

## ⚙️ Funktionen

- Browserterminal mit PTY-Resize-Unterstützung und persistenten Workflow-Steuerelementen.
- Projektsteuerungs-Panel für Workspace-Erstellung, LaTeX-Initialisierung und Kompilierungsabläufe.
- Dateibaum + CodeMirror-Editor mit Speichern und optionalem Watch-/Reload-Polling.
- PDF-Vorschau-Pipeline für `/home/<user>/Projects/<project>/latex/<file>.pdf`.
- Codex Bridge mit Sitzungsstart/-wiederaufnahme, Statusabgleich und optionaler DB-Protokollierung.
- Git/SSH-Helfer in der UI (Identity speichern, Remote vorausfüllen, SSH-Schlüssel generieren/prüfen).
- Docker-aware Befehls-/Dateioperationen mit Fallback auf Host-Shell/Filesystem.

### Funktionsübersicht

| Fähigkeit | Details |
|---|---|
| Terminal | WebSocket-PTY-Stream über `/ws`, interaktiver Shell-Workflow |
| Agent-Bridge | `/codex/ws` + `/api/codex/*`-Session-Orchestrierung |
| Dateien | `/api/file` Lesen/Schreiben, `/api/tree` Strukturansicht |
| PDF-Vorschau | Auslieferung kompilierter Artefakte über `/api/pdf` |
| Controls | Projekt anlegen, LaTeX initialisieren, kompilieren, Git/SSH einrichten |

## 📈 Projektstatus

- PWA-Workspace: Webterminal, PDF-Vorschau, Editor.
- Projektsteuerung: Workspace erstellen, LaTeX initialisieren, kompilieren, Git/SSH-Helfer.
- Codex Bridge: Sitzungs-Wiederaufnahme, DB-Historien-Liste, `/status`-Synchronisierung ein/aus.
- Dateibaum + CodeMirror-Editor mit Speichern/Watch.
- Docker-basierte Ausführung (optional) mit LaTeX/Python/R Toolchain.

## 🎬 Demo

![PaperAgent demo](demos/demo-full.png)

## 🗂️ Projektstruktur

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

## 🧪 Voraussetzungen

- OS: Linux empfohlen (Docker- und Shell-Tools vorausgesetzt).
- Python: Nutze die bestehende Conda-Umgebung (`paperagent`), sofern vorhanden.
- Abhängigkeiten:
  - `tornado`
  - `psycopg[binary]` (optional, empfohlen für DB-Features)
- Optionale Laufzeitdienste:
  - Docker (für Sandbox-Shell und containerisierte Projektpfade)
  - PostgreSQL (für persistente Nutzer-/Projekt- und Codex-Session-Historie)
- Optionale Toolchains in Sandbox/Container:
  - LaTeX (`latexmk` und TeX-Pakete)
  - Python, R
  - Node + `@openai/codex`

### Abhängigkeitsmatrix

| Typ | Komponenten |
|---|---|
| Erforderlich | Python + `tornado` |
| Empfohlen | `psycopg[binary]` für DB-gestützte Fähigkeiten |
| Optionale Dienste | Docker, PostgreSQL |
| Optionale Toolchains | LaTeX (`latexmk`), Python/R, Node + `@openai/codex` |

## 🚀 Installation

### 1) Repository klonen (mit Submodulen)

```bash

git clone --recurse-submodules https://github.com/lachlanchen/PaperAgent.git
cd PaperAgent
```

Falls bereits ohne Submodule geklont:

```bash
git submodule update --init --recursive
```

### 2) Python-Umgebung und Pakete

```bash
conda activate paperagent
pip install tornado "psycopg[binary]"
```

Alternative (falls du nicht in der Umgebung bist):

```bash
conda run -n paperagent pip install tornado "psycopg[binary]"
```

### 3) Umgebungs-Konfiguration

```bash
cp .env.example .env
```

Bearbeite `.env` für deine Maschine (DB-Credentials, Codex-Standards usw.).

### 4) Optionales Datenbank-Bootstrap

```bash
./scripts/init_db.sh
```

Das erstellt/aktualisiert Rolle + DB und wendet `scripts/db_schema.sql` an.

### 5) Optionales Docker-Sandbox-Bootstrap

```bash
./scripts/setup_docker_env.sh
```

Für NVIDIA-Host-Setups (falls benötigt):

```bash
./scripts/install_nvidia_host.sh
```

## 🧑‍💻 Nutzung

### Lokal ausführen (empfohlen)

```bash
cd webterm
python server.py --host 127.0.0.1 --port 8765
```

Öffne: `http://127.0.0.1:8765`

### Mit Docker-Shell-Ziel ausführen

```bash
cd webterm
python server.py --host 0.0.0.0 --port 8766 --shell ./docker-shell.sh
```

### Dev Auto-Reload-Modus

```bash
cd webterm
python server.py --host 127.0.0.1 --port 8765 --dev
```

Im `--dev`-Modus ist das Caching des Service Workers deaktiviert, um veraltete Assets zu vermeiden.

### Typischer UI-Ablauf

1. Gib Nutzer + Projekt im Steuerungsfeld ein.
2. Klicke **Create Project + cd**, damit dieser Pfad erzeugt wird:
   `/home/<user>/Projects/<project>/{code,data,figures,latex/latex_figures,artifacts}`
3. Klicke **Init LaTeX**, um `latex/main.tex` anzulegen.
4. Klicke **Compile LaTeX** (`latexmk`) und aktualisiere/öffne anschließend die PDF-Vorschau.
5. Bearbeite Dateien im CodeMirror über den Dateibaum und speichere.
6. Nutze Codex Bridge für Prompt-gesteuerte Änderungen und Sitzungs-Wiederaufnahme.

### API-Schnellrouten

| Endpoint | Zweck |
|---|---|
| `/api/tree` | Projektverzeichnisbaum für das Editor-Panel abfragen |
| `/api/file` | Projektdateien lesen/schreiben |
| `/api/pdf` | gerenderte PDF-Artefakte holen |
| `/api/codex/*` | Session-Lifecycle, Verlauf, Status-Sync |
| `/codex/ws` | WebSocket-Kanal für Codex-Bridge-Events |

## 🔧 Konfiguration

PaperAgent liest Umgebungsvariablen aus `.env` (oder `ENV_FILE`) und der Prozessumgebung.

### Zentrale DB-Einstellungen

```bash
DB_HOST=localhost
DB_PORT=5432
DB_NAME=paperagent_db
DB_USER=lachlan
DB_PASSWORD=change_me
```

### Codex-Standardwerte

```bash
CODEX_LOG_DB=1
CODEX_LOG_OUTPUT=1
CODEX_USERNAME=lachlan
CODEX_PROJECT=demo-paper
CODEX_ARGS="-s danger-full-access -a never"
CODEX_NVM_DIR=/root/.nvm
CODEX_HISTORY_MESSAGES=1000
```

### Weitere nützliche Schalter

- `CODEX_AUTO_RESTORE=1`: Fehlende Session-IDs neu erstellen und gespeicherten Verlauf erneut abspielen.
- `PROJECT_DB=1`: DB-gestützte Persistenz für Projektmetadaten aktivieren.
- `WEBTERM_QUIET_LOGS=1`: Lärmende Polling-/Static-Access-Logs unterdrücken.
- `CODEX_CMD=codex`: Codex-Befehl.
- `CODEX_CWD=/workspace`: Ausweich-Arbeitsverzeichnis, wenn Nutzer-/Projektpfad nicht verfügbar ist.
- `WEBTERM_CONTAINER=<name>`: Erkannten Container-Namen überschreiben.

## 📦 Beispiele

### Terminal starten und prüfen

```bash
cd webterm
python server.py --host 127.0.0.1 --port 8765
# im Browser-Terminal:
pwd
```

### Projektbaum-API abfragen

```bash
curl "http://127.0.0.1:8765/api/tree?user=paperagent&project=demo-paper&depth=4"
```

### PDF abrufen (nach Kompilierung)

```bash
curl -o main.pdf "http://127.0.0.1:8765/api/pdf?user=paperagent&project=demo-paper&file=main.pdf"
```

### Datei via API lesen

```bash
curl "http://127.0.0.1:8765/api/file?user=paperagent&project=demo-paper&path=latex/main.tex"
```

## 🧪 Entwicklungshinweise

- Coding Style:
  - Python: 4-Leerzeichen-Einrückung, kleine direkte Funktionen.
  - Frontend: 2-Leerzeichen-Einrückung, CSS-Klassennamen im `kebab-case`.
- Noch keine formale automatisierte Test-Suite; manuelle Checks haben Priorität.
- Manuelle Checks:
  - PWA laden, Terminal verbinden, `pwd` ausführen.
  - Projekt-Erstellung und LaTeX-Kompilierung in der UI prüfen.
- Bei PWA-Asset-Änderungen: den Service-Worker-Cache-Namen in `webterm/static/sw.js` erhöhen.
- Behandle `codex/` und `overleaf/` als Submodule; direkte Änderungen dort nur absichtlich.

## 🩺 Fehlerbehebung

### Docker-Shell: Berechtigung verweigert

Wenn der Docker-Zugriff fehlschlägt, stelle sicher, dass deine Shell Mitglied der Docker-Gruppe ist:

```bash
newgrp docker
cd webterm
python server.py --host 0.0.0.0 --port 8766
```

### PDF nicht in Vorschau gefunden

- Vergewissere dich, dass die Kompilierung im Terminal erfolgreich abgeschlossen wurde.
- Vergewissere dich, dass die Datei unter `/home/<user>/Projects/<project>/latex/main.pdf` existiert.
- Aktualisiere das PDF-Panel oder nutze den **Open**-Button.

### DB-Features nicht verfügbar

- Prüfe die DB-Zugänge in `.env`.
- Stelle sicher, dass PostgreSQL läuft und erreichbar ist.
- Installiere den Treiber: `pip install "psycopg[binary]"`.
- Falls nötig, führe `./scripts/init_db.sh` aus und starte den Server neu.

### Codex-Befehl nicht gefunden

- Installiere Codex über den UI-Installer (NVM + Node LTS + `@openai/codex`) oder manuell.
- Stelle sicher, dass `CODEX_CMD` und `CODEX_NVM_DIR` für deinen Laufzeitkontext korrekt gesetzt sind.

### Sicherheit bei LAN-Bindung

`--host 0.0.0.0` ist nur für vertrauenswürdige Netzwerke gedacht. Nicht ohne Auth/TLS öffentlich bereitstellen.

## 🗺️ Roadmap

Geplante und laufende Ausrichtung (siehe `references/roadmap-blueprint.md` und zugehörige Dokumente):

- Mehrstufigen Paper-Automatisierungsfluss und Reproduzierbarkeit weiter verbessern.
- Zuverlässigkeit und Beobachtbarkeit der Codex-Bridge-Sessions ausbauen.
- Sandbox-/Runtime-Setup-Pfade härten (CPU/GPU-Varianten).
- Projektsteuerung und Editor-Ergonomie verbessern.
- Mehrsprachige Dokumentation und Website-Ausrichtung fortsetzen.

## 🌐 Hauptprojekt

- https://github.com/lachlanchen/the-art-of-lazying

## 🔗 Ökosystem-Links

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

## 🤝 Beiträge leisten

Beiträge sind willkommen.

- Erstelle ein Issue mit Problem oder Vorschlag.
- Halte Änderungen fokussiert und klein.
- Folge dem Commit-Stil im Repo: `Add ...`, `Update ...`, `Expand ...`.
- Bei Frontend-/UI-Änderungen in PRs bitte Screenshots oder GIFs beilegen.
- Wenn du README-Inhalte aktualisierst, halte alle Sprachvarianten konsistent (`README.*.md`).

Hinweis: Richtlinien für Beiträge in Submodulen sind in deren eigenen Repositories definiert (`codex/`, `overleaf/`).

## 📜 Lizenz

Auf Repository-Ebene liegt im aktuellen Tree keine Lizenzdatei im Root.

- Annahme: Das Projekt wird möglicherweise derzeit ohne finale Top-Level-Lizenzdatei geteilt.
- Kläre die Lizenzabsicht, bevor du deutlich größere modifizierte Versionen weiterverbreitest.
- Submodule besitzen eigene Upstream-Lizenzen (z. B. `overleaf/LICENSE`).

## 🙏 Danksagungen

- [Overleaf](https://github.com/overleaf/overleaf) für Ideen und Komponenten rund um kollaborative LaTeX-Plattformen.
- [OpenAI Codex CLI](https://github.com/openai/codex) für agentische Terminal-Workflows.
- Das `the-art-of-lazying`-Ökosystem für die Produktvision und die Integration über Projekte hinweg.


## ❤️ Support

| Donate | PayPal | Stripe |
| --- | --- | --- |
| [![Donate](https://camo.githubusercontent.com/24a4914f0b42c6f435f9e101621f1e52535b02c225764b2f6cc99416926004b7/68747470733a2f2f696d672e736869656c64732e696f2f62616467652f446f6e6174652d4c617a79696e674172742d3045413545393f7374796c653d666f722d7468652d6261646765266c6f676f3d6b6f2d6669266c6f676f436f6c6f723d7768697465)](https://chat.lazying.art/donate) | [![PayPal](https://camo.githubusercontent.com/d0f57e8b016517a4b06961b24d0ca87d62fdba16e18bbdb6aba28e978dc0ea21/68747470733a2f2f696d672e736869656c64732e696f2f62616467652f50617950616c2d526f6e677a686f754368656e2d3030343537433f7374796c653d666f722d7468652d6261646765266c6f676f3d70617970616c266c6f676f436f6c6f723d7768697465)](https://paypal.me/RongzhouChen) | [![Stripe](https://camo.githubusercontent.com/1152dfe04b6943afe3a8d2953676749603fb9f95e24088c92c97a01a897b4942/68747470733a2f2f696d672e736869656c64732e696f2f62616467652f5374726970652d446f6e6174652d3633354246463f7374796c653d666f722d7468652d6261646765266c6f676f3d737472697065266c6f676f436f6c6f723d7768697465)](https://buy.stripe.com/aFadR8gIaflgfQV6T4fw400) |
