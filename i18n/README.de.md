[English](../README.md) · [العربية](README.ar.md) · [Español](README.es.md) · [Français](README.fr.md) · [日本語](README.ja.md) · [한국어](README.ko.md) · [Tiếng Việt](README.vi.md) · [中文 (简体)](README.zh-Hans.md) · [中文（繁體）](README.zh-Hant.md) · [Deutsch](README.de.md) · [Русский](README.ru.md)


<p align="center">
  <img src="https://raw.githubusercontent.com/lachlanchen/lachlanchen/main/logos/banner.png" alt="PaperAgent banner" width="100%">
</p>

[![Main Project](https://img.shields.io/badge/Main%20Project-the--art--of--lazying-0f766e?style=for-the-badge)](https://github.com/lachlanchen/the-art-of-lazying) [![Main Website](https://img.shields.io/badge/Main%20Website-lazying.art-0f766e?style=for-the-badge)](https://lazying.art)

# PaperAgent

[![Local First](https://img.shields.io/badge/Local--First-Yes-0f766e?style=flat-square)](#uberblick)
[![PWA](https://img.shields.io/badge/PWA-Enabled-2563eb?style=flat-square)](#uberblick)
[![Backend](https://img.shields.io/badge/Backend-Tornado-7c3aed?style=flat-square)](#uberblick)
[![Terminal](https://img.shields.io/badge/PTY-WebSocket-0891b2?style=flat-square)](#funktionen)
[![Docker Optional](https://img.shields.io/badge/Docker-Optional-0ea5e9?style=flat-square)](#voraussetzungen)
[![Postgres Optional](https://img.shields.io/badge/PostgreSQL-Optional-1d4ed8?style=flat-square)](#voraussetzungen)
[![License](https://img.shields.io/badge/License-Pending-lightgrey?style=flat-square)](#lizenz)

PaperAgent ist ein lokal-priorisierter Web-Workspace zum Schreiben wissenschaftlicher Arbeiten: Du bearbeitest LaTeX und Code im Browser, führst Python/R aus und kompilierst LaTeX im Backend, und kannst PDFs zusammen mit Logs an einem Ort prüfen.

## Vision

PaperAgent wurde entwickelt, um alle von Forschungs-Beschäftigungstherapie zu „Only Ideas“ zu befreien.  
Das Ziel ist einfach: menschliches Denken bleibt menschlich, und das System übernimmt repetitive Arbeit.  
Du fokussierst dich auf Idee und Erzählung; PaperAgent übernimmt die Ausführungsschleifen.

## Philosophie

- Local-first, privacy-first: Daten und Ausführung bleiben standardmäßig auf deiner Maschine.
- Idea-first-Workflow: von einem Konzept mit minimaler Reibung zu einem ausführbaren Paper.
- Kleine, reversible Schritte: jede Änderung ist transparent und leicht rückgängig zu machen.
- Tools sollen Arbeit entfernen: Automatisierung dient dazu, Mühe zu löschen, nicht neue zu erzeugen.

## Logik (wie es funktioniert)

1. Chat -> Edit: Beschreibe die Änderung, und PaperAgent bearbeitet die richtigen Dateien.
2. Run -> Compile: Führe Python/R aus, kompiliere LaTeX, erzeuge Abbildungen.
3. Preview -> Iterate: Prüfe PDF + Logs, behebe schnell, wiederhole.

## Uberblick

PaperAgent konzentriert sich auf `webterm/`, einen Tornado- + WebSocket-Server, der einen browserbasierten PWA-Workspace bereitstellt:

- PTY-Terminal-Streaming (`/ws`) für interaktive Shell-Arbeit.
- Codex-Bridge-WebSocket/API (`/codex/ws`, `/api/codex/*`) für sitzungsbasierte Agent-Workflows.
- Datei-, Baum- und PDF-APIs (`/api/file`, `/api/tree`, `/api/pdf`) für Bearbeitung und Vorschau im Browser.
- Optionale Postgres-gestützte Persistenz für Benutzer, Projekte, Git-Metadaten und Codex-Historie.
- Optionale Docker-Shell-Ausführung über `webterm/docker-shell.sh`.

### Auf einen Blick

| Bereich | Was es bietet |
|---|---|
| Workspace | Browser-Terminal + Editor + Dateibaum + PDF-Panel |
| Automationsschleife | Prompt-gesteuerte Edits, kompilieren, Logs prüfen, iterieren |
| Laufzeit | Standardmäßig Host-Shell, optional Docker-Shell |
| Persistenz | Standardmäßig zustandslos; optional Postgres-gestützte Historie/Metadaten |
| Docs/i18n | Mehrsprachige README-Sammlung und `i18n/`-Verzeichnis im Repository |

## Was du bekommst

- Web-Terminal mit Verbindung zu einer Docker-Sandbox
- LaTeX-Projektgerüst und Kompilierung mit einem Klick
- Python/R-Ausführung für Abbildungen und Experimente
- PDF-Vorschau mit Logs
- Eine klare, minimalistische PWA-Oberfläche

## Funktionen

- Browser-Terminal mit PTY-Resize-Unterstützung und persistenten Workflow-Steuerelementen.
- Projekt-Kontrollpanel für Workspace-Erstellung, LaTeX-Initialisierung und Compile-Abläufe.
- Dateibaum + CodeMirror-Editor mit Speichern und optionalem Watch/Reload-Polling.
- PDF-Vorschau-Pipeline für `/home/<user>/Projects/<project>/latex/<file>.pdf`.
- Codex Bridge mit Session-Start/Fortsetzen, Status-Sync und optionalem DB-Logging.
- Git/SSH-Helfer in der UI (Identity speichern, Remote-Prefill, SSH-Key erzeugen/prufen).
- Docker-bewusste Kommando-/Dateioperationen mit Fallback auf Host-Shell/Dateisystem.

### Funktionskarte

| Fähigkeit | Details |
|---|---|
| Terminal | WebSocket-PTY-Stream über `/ws`, interaktiver Shell-Workflow |
| Agent-Bridge | `/codex/ws` + `/api/codex/*` Sitzungsorchestrierung |
| Dateien | `/api/file` Lesen/Schreiben, `/api/tree` Struktur-Browsing |
| PDF-Vorschau | `/api/pdf` liefert kompilierte Artefakte |
| Controls | Projekt erstellen, LaTeX initialisieren, kompilieren, Git/SSH-Setup |

## Projektstatus

- PWA-Workspace: Web-Terminal, PDF-Vorschau, Editor.
- Projekt-Controls: Workspace erstellen, LaTeX initialisieren, kompilieren, Git/SSH-Helfer.
- Codex Bridge: Session-Fortsetzung, DB-History-Liste, /status-Sync-Toggle.
- Dateibaum + CodeMirror-Editor mit Speichern/Watch.
- Docker-gestutzte Ausführung (optional) mit LaTeX/Python/R-Toolchain.

## Demo

![PaperAgent demo](demos/demo-full.png)

## Projektstruktur

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

## Voraussetzungen

- OS: Linux empfohlen (Docker- und Shell-Tooling wird erwartet).
- Python: Wenn verfügbar, vorhandene Conda-Umgebung (`paperagent`) verwenden.
- Abhängigkeiten:
  - `tornado`
  - `psycopg[binary]` (optional, aber für DB-gestützte Funktionen empfohlen)
- Optionale Laufzeitdienste:
  - Docker (für Sandbox-Shell und containerisierte Projektpfade)
  - PostgreSQL (für persistierte Benutzer/Projekte/Codex-Session-Historie)
- Optionale Toolchains innerhalb der Sandbox/des Containers:
  - LaTeX (`latexmk` und TeX-Pakete)
  - Python, R
  - Node + `@openai/codex`

### Abhängigkeitsmatrix

| Typ | Komponenten |
|---|---|
| Erforderlich | Python + `tornado` |
| Empfohlen | `psycopg[binary]` für DB-gestützte Funktionen |
| Optionale Dienste | Docker, PostgreSQL |
| Optionale Toolchains | LaTeX (`latexmk`), Python/R, Node + `@openai/codex` |

## Installation

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

Alternative (wenn nicht in der Umgebung):

```bash
conda run -n paperagent pip install tornado "psycopg[binary]"
```

### 3) Umgebungs-Konfiguration

```bash
cp .env.example .env
```

Bearbeite `.env` fur dein System (DB-Credentials, Codex-Defaults usw.).

### 4) Optionales Datenbank-Bootstrap

```bash
./scripts/init_db.sh
```

Das erzeugt/aktualisiert Rolle + DB und wendet `scripts/db_schema.sql` an.

### 5) Optionales Docker-Sandbox-Bootstrap

```bash
./scripts/setup_docker_env.sh
```

Für NVIDIA-Host-Setup (falls benötigt):

```bash
./scripts/install_nvidia_host.sh
```

## Nutzung

### Lokal ausführen (empfohlener Standard)

```bash
cd webterm
python server.py --host 127.0.0.1 --port 8765
```

Offnen: `http://127.0.0.1:8765`

### Mit Docker-Shell-Ziel ausführen

```bash
cd webterm
python server.py --host 0.0.0.0 --port 8766 --shell ./docker-shell.sh
```

### Dev-Auto-Reload-Modus

```bash
cd webterm
python server.py --host 127.0.0.1 --port 8765 --dev
```

Im `--dev`-Modus ist Service-Worker-Caching deaktiviert, um veraltete Assets zu vermeiden.

### Typischer UI-Ablauf

1. Benutzer + Projekt im Kontrollpanel eingeben.
2. **Create Project + cd** klicken, um Folgendes zu erstellen:
   `/home/<user>/Projects/<project>/{code,data,figures,latex/latex_figures,artifacts}`
3. **Init LaTeX** klicken, um `latex/main.tex` zu erzeugen.
4. **Compile LaTeX** (`latexmk`) klicken und PDF-Vorschau aktualisieren/offnen.
5. Dateien in CodeMirror uber den Dateibaum bearbeiten und speichern.
6. Codex Bridge für prompt-gesteuerte Edits und Session-Fortsetzung nutzen.

### API-Schnellrouten

| Endpoint | Zweck |
|---|---|
| `/api/tree` | Projekt-Verzeichnisbaum fur Editorpanel abfragen |
| `/api/file` | Projektdateien lesen/schreiben |
| `/api/pdf` | Gerenderte PDF-Artefakte abrufen |
| `/api/codex/*` | Session-Lifecycle, Historie, Status-Sync |
| `/codex/ws` | WebSocket-Kanal fur Codex-Bridge-Events |

## Konfiguration

PaperAgent liest Umgebungsvariablen aus `.env` (oder `ENV_FILE`) und der Prozessumgebung.

### Zentrale DB-Einstellungen

```bash
DB_HOST=localhost
DB_PORT=5432
DB_NAME=paperagent_db
DB_USER=lachlan
DB_PASSWORD=change_me
```

### Codex-Defaults

```bash
CODEX_LOG_DB=1
CODEX_LOG_OUTPUT=1
CODEX_USERNAME=lachlan
CODEX_PROJECT=demo-paper
CODEX_ARGS="-s danger-full-access -a never"
CODEX_NVM_DIR=/root/.nvm
CODEX_HISTORY_MESSAGES=1000
```

### Weitere nutzliche Schalter

- `CODEX_AUTO_RESTORE=1`: fehlende Session-IDs neu erstellen und gespeicherte Historie erneut abspielen.
- `PROJECT_DB=1`: DB-gestutzte Persistenz von Projekt-Metadaten aktivieren.
- `WEBTERM_QUIET_LOGS=1`: laute Polling-/Static-Access-Logs unterdrucken.
- `CODEX_CMD=codex`: Ausfuhrungskommando für Codex.
- `CODEX_CWD=/workspace`: Fallback-Arbeitsverzeichnis, wenn Benutzer-/Projektpfad nicht verfugbar ist.
- `WEBTERM_CONTAINER=<name>`: erkannten Containernamen überschreiben.

## Beispiele

### Starten und Terminal verifizieren

```bash
cd webterm
python server.py --host 127.0.0.1 --port 8765
# in browser terminal:
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

### Datei über API lesen

```bash
curl "http://127.0.0.1:8765/api/file?user=paperagent&project=demo-paper&path=latex/main.tex"
```

## Entwicklungshinweise

- Code-Style:
  - Python: 4 Leerzeichen Einruckung, kleine direkte Funktionen.
  - Frontend: 2 Leerzeichen Einruckung, `kebab-case` CSS-Klassennamen.
- Noch keine formale automatisierte Testsuite; manuelle Checks sind primär.
- Manuelle Checks:
  - PWA laden, Terminal verbinden, `pwd` ausführen.
  - Projekt-Erstellung und LaTeX-Kompilierung über die UI prüfen.
- Wenn du PWA-Assets aktualisierst, den Service-Worker-Cache-Namen in `webterm/static/sw.js` erhöhen.
- `codex/` und `overleaf/` als Submodule behandeln; direkte Edits hier nur bewusst vornehmen.

## Fehlerbehebung

### Docker-Shell: permission denied

Wenn Docker-Zugriff fehlschlagt, stelle sicher, dass deine Shell Mitglied der Docker-Gruppe ist:

```bash
newgrp docker
cd webterm
python server.py --host 0.0.0.0 --port 8766
```

### PDF in der Vorschau nicht gefunden

- Bestätige, dass die Kompilierung im Terminal erfolgreich abgeschlossen wurde.
- Bestätige, dass die Datei unter `/home/<user>/Projects/<project>/latex/main.pdf` existiert.
- PDF-Panel aktualisieren oder **Open** verwenden.

### DB-Funktionen nicht verfügbar

- `.env`-DB-Credentials prüfen.
- Sicherstellen, dass Postgres läuft und erreichbar ist.
- Treiber installieren: `pip install "psycopg[binary]"`.
- Falls nötig `./scripts/init_db.sh` ausführen und Server neu starten.

### Codex-Kommando nicht gefunden

- Codex über den UI-Installer (NVM + Node LTS + `@openai/codex`) oder manuell installieren.
- Sicherstellen, dass `CODEX_CMD` und `CODEX_NVM_DIR` für deinen Laufzeitkontext korrekt gesetzt sind.

### Sicherheit bei LAN-Bindung

`--host 0.0.0.0` ist nur für vertrauenswürdige Netzwerke gedacht. Nicht ohne Auth/TLS öffentlich exponieren.

## Roadmap

Geplante und laufende Richtung (siehe `references/roadmap-blueprint.md` und verwandte Dokumente):

- Multi-Step-Paper-Automationsschleife und Reproduzierbarkeits-Workflows verbessern.
- Zuverlässigkeit und Observability der Codex-Bridge-Sessions ausbauen.
- Sandbox-/Runtime-Setup-Pfade härten (CPU/GPU-Varianten).
- Projekt-Controls und Editor-Ergonomie verbessern.
- Mehrsprachige Doku und Website-Ausrichtung weiterführen.

## Hauptprojekt

- https://github.com/lachlanchen/the-art-of-lazying

## Ökosystem-Links

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

## Spenden

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

Deine Unterstützung trägt meine Forschung, Entwicklung und den Betrieb, damit ich weiterhin offene Projekte und Verbesserungen teilen kann.

## Beitragen

Beiträge sind willkommen.

- Ein Issue mit Problembeschreibung/Vorschlag öffnen.
- Änderungen fokussiert und klein halten.
- Commit-Stil aus diesem Repository einhalten: `Add ...`, `Update ...`, `Expand ...`.
- Für Frontend/UI-Änderungen Screenshots oder GIFs in PRs beilegen.
- Bei README-Änderungen alle Sprachvarianten synchron halten (`README.*.md`).

Hinweis: Submodule-Beitragsrichtlinien sind upstream in den jeweiligen Repositories definiert (`codex/`, `overleaf/`).

## Lizenz

Im aktuellen Tree ist auf Repository-Ebene keine Lizenzdatei im Root vorhanden.

- Annahme: Dieses Projekt wird derzeit möglicherweise ohne finalisierte Top-Level-Lizenzdatei geteilt.
- Lizenzabsicht vor der Weiterverteilung umfangreicher modifizierter Versionen bestätigen.
- Submodule tragen ihre eigenen Upstream-Lizenzen (zum Beispiel `overleaf/LICENSE`).

## Danksagungen

- [Overleaf](https://github.com/overleaf/overleaf) für Ideen und Komponenten zur kollaborativen LaTeX-Plattform-Infrastruktur.
- [OpenAI Codex CLI](https://github.com/openai/codex) für agentische Terminal-Workflows.
- Das umfassendere `the-art-of-lazying`-Ökosystem für Produktvision und projektübergreifende Integration.
