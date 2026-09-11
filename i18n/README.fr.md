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

PaperAgent est un espace de travail web local-first pour la rédaction de papiers : éditez LaTeX et code dans le navigateur, exécutez Python/R et compilez LaTeX côté backend, puis prévisualisez les PDF avec leurs logs dans un seul endroit.

## Aide à la compilation d'un manuscrit

Vous souhaitez utiliser PaperAgent vous-même ? Commencez par ce dépôt. Si vous avez besoin d'une compilation LaTeX propre et d'un redline vérifiable pour un manuscrit, le [sprint à périmètre fixe de 250 USD](https://lazying.art/manuscript-sprint/?utm_source=github&utm_medium=repository&utm_campaign=manuscript_sprint_pilot&utm_content=paperagent_readme) présente l'exemple, le périmètre et les exclusions avant le diagnostic gratuit.

## 💡 Vision

PaperAgent est conçu pour libérer tout le monde de la paperasserie de la recherche afin de rester sur les "Only Ideas".
L’objectif est simple : garder la réflexion humaine et faire faire le travail répétitif au système.
Vous vous concentrez sur l’idée et la narration ; PaperAgent gère les boucles d’exécution.

## 🧭 Philosophie

- Local-first, privacy-first : les données et l’exécution restent sur votre machine par défaut.
- Workflow centré sur l’idée : passer d’un concept à un article exécutable avec un minimum de friction.
- Étapes petites et réversibles : chaque modification est transparente et facile à annuler.
- Les outils doivent supprimer le travail : l’automatisation doit enlever la routine, pas l’ajouter.

## 🛠️ Logique (fonctionnement)

1. Chat -> Edit : décrivez le changement, PaperAgent modifie les bons fichiers.
2. Run -> Compile : exécute Python/R, compile LaTeX, génère des figures.
3. Preview -> Iterate : vérifiez le PDF + les logs, corrigez vite, recommencez.

## 📚 Aperçu

PaperAgent s’articule autour de `webterm/`, un serveur Tornado + WebSocket qui alimente un espace de travail PWA dans le navigateur :

- Streaming PTY terminal (`/ws`) pour le travail shell interactif.
- Pont Codex WebSocket/API (`/codex/ws`, `/api/codex/*`) pour des flux de travail agent basés sur les sessions.
- API de fichiers, d’arborescence et PDF (`/api/file`, `/api/tree`, `/api/pdf`) pour l’édition et la prévisualisation dans le navigateur.
- Persistance Postgres optionnelle pour les utilisateurs, projets, métadonnées git et historique Codex.
- Exécution via Docker-shell optionnelle via `webterm/docker-shell.sh`.

### En bref

| Domaine | Ce qu’il fournit |
|---|---|
| Espace de travail | Terminal navigateur + éditeur + arbre de fichiers + panneau PDF |
| Boucle d’automatisation | Modifications pilotées par prompt, compilation, inspection des logs, itération |
| Exécution | Shell hôte par défaut, shell Docker optionnel |
| Persistance | Mode sans état par défaut ; historique/métadonnées optionnels via Postgres |
| Docs/i18n | Jeux de README multilingues et répertoire `i18n/` dans le dépôt |

## 🎯 Ce que vous obtenez

- Terminal web connecté à un bac à sable Docker
- Scaffolding de projet LaTeX et compilation en un clic
- Exécution Python/R pour les figures et les expériences
- Prévisualisation PDF avec logs
- Interface PWA propre et minimaliste

## ⚙️ Fonctionnalités

- Terminal navigateur avec prise en charge du redimensionnement PTY et contrôles de workflow persistants.
- Panneau de contrôle de projet pour création d’espaces de travail, initialisation LaTeX et flux de compilation.
- Arborescence de fichiers + éditeur CodeMirror avec sauvegarde et actualisation/rechargement optionnels via polling.
- Pipeline de prévisualisation PDF pour `/home/<user>/Projects/<project>/latex/<file>.pdf`.
- Pont Codex avec démarrage/reprise de session, synchronisation d’état et journalisation DB optionnelle.
- Aides Git/SSH dans l’UI (sauvegarde d’identité, pré-remplissage remote, génération/vérification de clé SSH).
- Opérations de commandes/fichiers conscientes de Docker avec fallback vers le shell/système de fichiers hôte.

### Carte des fonctionnalités

| Fonctionnalité | Détails |
|---|---|
| Terminal | Flux PTY WebSocket via `/ws`, workflow shell interactif |
| Pont agent | Orchestration de session `/codex/ws` + `/api/codex/*` |
| Fichiers | Lecture/écriture via `/api/file`, navigation de structure via `/api/tree` |
| Prévisualisation PDF | Serveur des artefacts compilés via `/api/pdf` |
| Contrôles | Créer un projet, initialiser LaTeX, compiler, configurer Git/SSH |

## 📈 État du projet

- Espace de travail PWA : terminal web, prévisualisation PDF, éditeur.
- Contrôles de projet : création d’espace de travail, initialisation LaTeX, compilation, outils Git/SSH.
- Pont Codex : reprise de session, liste d’historique DB, bascule de synchronisation /status.
- Arborescence de fichiers + éditeur CodeMirror avec sauvegarde/veille.
- Exécution via Docker (optionnel) avec toolchain LaTeX/Python/R.

## 🎬 Démonstration

![PaperAgent demo](demos/demo-full.png)

## 🗂️ Structure du projet

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

## 🧪 Prérequis

- OS : Linux recommandé (Docker et outils shell attendus).
- Python : utilisez l’environnement Conda existant (`paperagent`) quand il est disponible.
- Dépendances :
  - `tornado`
  - `psycopg[binary]` (optionnel mais recommandé pour les fonctions liées à la DB)
- Services d’exécution optionnels :
  - Docker (pour le shell sandbox et les chemins de projet conteneurisés)
  - PostgreSQL (pour la persistance des utilisateurs/projets/historique de session Codex)
- Toolchains optionnelles dans le sandbox/conteneur :
  - LaTeX (`latexmk` et paquets TeX)
  - Python, R
  - Node + `@openai/codex`

### Matrice des dépendances

| Type | Composants |
|---|---|
| Requis | Python + `tornado` |
| Recommandé | `psycopg[binary]` pour les fonctions basées sur la DB |
| Services optionnels | Docker, PostgreSQL |
| Toolchains optionnelles | LaTeX (`latexmk`), Python/R, Node + `@openai/codex` |

## 🚀 Installation

### 1) Cloner le dépôt (avec sous-modules)

```bash
git clone --recurse-submodules https://github.com/lachlanchen/PaperAgent.git
cd PaperAgent
```

S’il a déjà été cloné sans les sous-modules :

```bash
git submodule update --init --recursive
```

### 2) Environnement Python et paquets

```bash
conda activate paperagent
pip install tornado "psycopg[binary]"
```

Alternative (si vous n’êtes pas dans l’environnement) :

```bash
conda run -n paperagent pip install tornado "psycopg[binary]"
```

### 3) Configuration de l’environnement

```bash
cp .env.example .env
```

Modifiez `.env` pour votre machine (identifiants DB, paramètres Codex, etc.).

### 4) Initialisation DB optionnelle

```bash
./scripts/init_db.sh
```

Cela crée/met à jour le rôle et la base, puis applique `scripts/db_schema.sql`.

### 5) Initialisation du sandbox Docker optionnelle

```bash
./scripts/setup_docker_env.sh
```

Pour une configuration NVIDIA (si nécessaire) :

```bash
./scripts/install_nvidia_host.sh
```

## 🧑‍💻 Utilisation

### Exécuter en local (configuration recommandée)

```bash
cd webterm
python server.py --host 127.0.0.1 --port 8765
```

Ouvrez : `http://127.0.0.1:8765`

### Exécuter avec un shell Docker cible

```bash
cd webterm
python server.py --host 0.0.0.0 --port 8766 --shell ./docker-shell.sh
```

### Mode de rechargement automatique

```bash
cd webterm
python server.py --host 127.0.0.1 --port 8765 --dev
```

En mode `--dev`, la mise en cache du service worker est désactivée pour éviter des assets périmés.

### Parcours d’utilisation habituel de l’UI

1. Renseignez utilisateur + projet dans le panneau de contrôle.
2. Cliquez sur **Create Project + cd** pour créer :
   `/home/<user>/Projects/<project>/{code,data,figures,latex/latex_figures,artifacts}`
3. Cliquez sur **Init LaTeX** pour générer `latex/main.tex`.
4. Cliquez sur **Compile LaTeX** (`latexmk`) puis actualisez/ouvrez la prévisualisation PDF.
5. Editez les fichiers dans CodeMirror via l’arborescence et enregistrez.
6. Utilisez Codex Bridge pour des modifications pilotées par prompt et la reprise de session.

### Routes API rapides

| Endpoint | Objectif |
|---|---|
| `/api/tree` | Interroger l’arborescence du projet pour le panneau éditeur |
| `/api/file` | Lire/écrire des fichiers du projet |
| `/api/pdf` | Récupérer les artefacts PDF compilés |
| `/api/codex/*` | Cycle de vie des sessions, historique, synchronisation de l’état |
| `/codex/ws` | Canal WebSocket pour les événements de Codex Bridge |

## 🔧 Configuration

PaperAgent lit les variables d’environnement depuis `.env` (ou `ENV_FILE`) et l’environnement du processus.

### Paramètres DB principaux

```bash
DB_HOST=localhost
DB_PORT=5432
DB_NAME=paperagent_db
DB_USER=lachlan
DB_PASSWORD=change_me
```

### Valeurs par défaut Codex

```bash
CODEX_LOG_DB=1
CODEX_LOG_OUTPUT=1
CODEX_USERNAME=lachlan
CODEX_PROJECT=demo-paper
CODEX_ARGS="-s danger-full-access -a never"
CODEX_NVM_DIR=/root/.nvm
CODEX_HISTORY_MESSAGES=1000
```

### Paramètres utiles supplémentaires

- `CODEX_AUTO_RESTORE=1` : recrée les identifiants de session manquants et rejoue l’historique stocké.
- `PROJECT_DB=1` : active la persistance des métadonnées de projet basée sur la DB.
- `WEBTERM_QUIET_LOGS=1` : supprime les logs d’accès pollings/statistiques trop bruyants.
- `CODEX_CMD=codex` : commande d’exécutable Codex.
- `CODEX_CWD=/workspace` : répertoire de travail de secours lorsque le chemin utilisateur/projet n’est pas disponible.
- `WEBTERM_CONTAINER=<name>` : remplace le nom de conteneur détecté.

## 📦 Exemples

### Lancer et vérifier le terminal

```bash
cd webterm
python server.py --host 127.0.0.1 --port 8765
# dans le terminal navigateur:
pwd
```

### Interroger l’API de l’arborescence projet

```bash
curl "http://127.0.0.1:8765/api/tree?user=paperagent&project=demo-paper&depth=4"
```

### Récupérer un PDF (après compilation)

```bash
curl -o main.pdf "http://127.0.0.1:8765/api/pdf?user=paperagent&project=demo-paper&file=main.pdf"
```

### Lire un fichier via API

```bash
curl "http://127.0.0.1:8765/api/file?user=paperagent&project=demo-paper&path=latex/main.tex"
```

## 🧪 Notes de développement

- Style de code :
  - Python : indentation 4 espaces, fonctions courtes et directes.
  - Frontend : indentation 2 espaces, noms de classes CSS en kebab-case.
- Aucune suite de tests automatisés formelle pour l’instant ; les vérifications manuelles priment.
- Vérifications manuelles :
  - Charger la PWA, connecter le terminal, exécuter `pwd`.
  - Vérifier la création de dossiers de projet et l’exécution de la compilation LaTeX depuis l’UI.
- Si vous mettez à jour des assets PWA, incrémentez le nom du cache dans `webterm/static/sw.js`.
- Traitez `codex/` et `overleaf/` comme des sous-modules ; évitez de les modifier directement si ce n’est pas intentionnel.

## 🩺 Dépannage

### Accès refusé au shell Docker

Si l’accès à Docker échoue, vérifiez que votre shell dispose des droits Docker group :

```bash
newgrp docker
cd webterm
python server.py --host 0.0.0.0 --port 8766
```

### PDF introuvable dans la prévisualisation

- Vérifiez que la compilation s’est terminée avec succès dans le terminal.
- Vérifiez que le fichier existe bien à `/home/<user>/Projects/<project>/latex/main.pdf`.
- Actualisez le panneau PDF ou utilisez le bouton **Open**.

### Fonctionnalités DB indisponibles

- Vérifiez les identifiants DB dans `.env`.
- Assurez-vous que PostgreSQL fonctionne et est joignable.
- Installez le driver : `pip install "psycopg[binary]"`.
- Si nécessaire, exécutez `./scripts/init_db.sh` puis redémarrez le serveur.

### Commande Codex introuvable

- Installez Codex via l’installateur UI (NVM + Node LTS + `@openai/codex`) ou manuellement.
- Vérifiez que `CODEX_CMD` et `CODEX_NVM_DIR` sont configurés correctement pour votre contexte d’exécution.

### Sécurité du binding LAN

`--host 0.0.0.0` est réservé aux réseaux de confiance. Ne l’exposez pas publiquement sans auth/TLS.

## 🗺️ Feuille de route

Orientation prévue et en cours (voir `references/roadmap-blueprint.md` et docs associées) :

- Améliorer la boucle d’automatisation multi-étapes et les workflows de reproductibilité.
- Étendre la fiabilité et la capacité d’observation du pont Codex.
- Renforcer la configuration sandbox/runtime (variantes CPU/GPU).
- Améliorer les contrôles de projet et l’ergonomie de l’éditeur.
- Continuer l’alignement entre la doc multilingue et le site.

## 🌐 Projet principal

- https://github.com/lachlanchen/the-art-of-lazying

## 🔗 Liens de l’écosystème

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

## 🤝 Contribuer

Les contributions sont les bienvenues.

- Ouvrez une issue décrivant le problème/la proposition.
- Gardez les changements ciblés et de petite taille.
- Respectez le style de commit utilisé dans ce dépôt : `Add ...`, `Update ...`, `Expand ...`.
- Pour les changements frontend/UI, incluez des captures d’écran ou des GIFs dans les PR.
- Si vous mettez à jour le contenu de ce README, gardez toutes les variantes linguistiques alignées (`README.*.md`).

Note : les politiques de contribution des sous-modules sont définies dans leurs dépôts d’origine (`codex/`, `overleaf/`).

## 📜 Licence

Le fichier de licence au niveau du dépôt n’est pas présent dans l’arborescence actuelle.

- Hypothèse : ce projet peut actuellement être partagé sans licence finale au niveau racine.
- Confirmez l’intention de licensing avant de redistribuer des versions modifiées substantiellement.
- Les sous-modules ont leurs propres licences amont (par exemple, `overleaf/LICENSE`).

## 🙏 Remerciements

- [Overleaf](https://github.com/overleaf/overleaf) pour les idées d’infrastructure collaborative LaTeX et des composants.
- [OpenAI Codex CLI](https://github.com/openai/codex) pour les workflows agentic terminal.
- L’écosystème plus large de `the-art-of-lazying` pour la vision produit et l’intégration interprojets.


## ❤️ Support

| Donate | PayPal | Stripe |
| --- | --- | --- |
| [![Donate](https://camo.githubusercontent.com/24a4914f0b42c6f435f9e101621f1e52535b02c225764b2f6cc99416926004b7/68747470733a2f2f696d672e736869656c64732e696f2f62616467652f446f6e6174652d4c617a79696e674172742d3045413545393f7374796c653d666f722d7468652d6261646765266c6f676f3d6b6f2d6669266c6f676f436f6c6f723d7768697465)](https://chat.lazying.art/donate) | [![PayPal](https://camo.githubusercontent.com/d0f57e8b016517a4b06961b24d0ca87d62fdba16e18bbdb6aba28e978dc0ea21/68747470733a2f2f696d672e736869656c64732e696f2f62616467652f50617950616c2d526f6e677a686f754368656e2d3030343537433f7374796c653d666f722d7468652d6261646765266c6f676f3d70617970616c266c6f676f436f6c6f723d7768697465)](https://paypal.me/RongzhouChen) | [![Stripe](https://camo.githubusercontent.com/1152dfe04b6943afe3a8d2953676749603fb9f95e24088c92c97a01a897b4942/68747470733a2f2f696d672e736869656c64732e696f2f62616467652f5374726970652d446f6e6174652d3633354246463f7374796c653d666f722d7468652d6261646765266c6f676f3d737472697065266c6f676f436f6c6f723d7768697465)](https://buy.stripe.com/aFadR8gIaflgfQV6T4fw400) |
