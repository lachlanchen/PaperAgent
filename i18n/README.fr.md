[English](../README.md) · [العربية](README.ar.md) · [Español](README.es.md) · [Français](README.fr.md) · [日本語](README.ja.md) · [한국어](README.ko.md) · [Tiếng Việt](README.vi.md) · [中文 (简体)](README.zh-Hans.md) · [中文（繁體）](README.zh-Hant.md) · [Deutsch](README.de.md) · [Русский](README.ru.md)


<p align="center">
  <img src="https://raw.githubusercontent.com/lachlanchen/lachlanchen/main/logos/banner.png" alt="Bannière PaperAgent" width="100%">
</p>

[![Main Project](https://img.shields.io/badge/Main%20Project-the--art--of--lazying-0f766e?style=for-the-badge)](https://github.com/lachlanchen/the-art-of-lazying) [![Main Website](https://img.shields.io/badge/Main%20Website-lazying.art-0f766e?style=for-the-badge)](https://lazying.art)

# PaperAgent

[![Local First](https://img.shields.io/badge/Local--First-Yes-0f766e?style=flat-square)](#apercu)
[![PWA](https://img.shields.io/badge/PWA-Enabled-2563eb?style=flat-square)](#apercu)
[![Backend](https://img.shields.io/badge/Backend-Tornado-7c3aed?style=flat-square)](#apercu)
[![Terminal](https://img.shields.io/badge/PTY-WebSocket-0891b2?style=flat-square)](#fonctionnalites)
[![Docker Optional](https://img.shields.io/badge/Docker-Optional-0ea5e9?style=flat-square)](#prerequis)
[![Postgres Optional](https://img.shields.io/badge/PostgreSQL-Optional-1d4ed8?style=flat-square)](#prerequis)
[![License](https://img.shields.io/badge/License-Pending-lightgrey?style=flat-square)](#licence)

PaperAgent est un espace de travail web local-first pour rédiger des articles scientifiques : éditez du LaTeX et du code dans le navigateur, exécutez Python/R et compilez LaTeX côté backend, puis prévisualisez les PDF avec les logs au même endroit.

## Vision

PaperAgent est conçu pour libérer chacun des tâches répétitives de la recherche afin d’atteindre « Only Ideas ».  
L’objectif est simple : garder la réflexion humaine et laisser le système gérer le travail répétitif.  
Vous vous concentrez sur l’idée et la narration ; PaperAgent prend en charge les boucles d’exécution.

## Philosophie

- Local-first, privacy-first : les données et l’exécution restent sur votre machine par défaut.
- Flux orienté idée : passer d’un concept à un article exécutable avec un minimum de friction.
- Petites étapes réversibles : chaque changement est transparent et facile à annuler.
- Les outils doivent supprimer du travail : l’automatisation sert à éliminer la corvée, pas à en ajouter.

## Logique (comment ça fonctionne)

1. Chat -> Edit : décrivez le changement, et PaperAgent modifie les bons fichiers.
2. Run -> Compile : exécutez Python/R, compilez LaTeX, générez les figures.
3. Preview -> Iterate : inspectez PDF + logs, corrigez rapidement, recommencez.

## Aperçu

PaperAgent est centré sur `webterm/`, un serveur Tornado + WebSocket qui alimente un espace de travail PWA dans le navigateur :

- Streaming de terminal PTY (`/ws`) pour un travail shell interactif.
- WebSocket/API Codex Bridge (`/codex/ws`, `/api/codex/*`) pour des workflows agentiques basés sur des sessions.
- API fichier, arborescence et PDF (`/api/file`, `/api/tree`, `/api/pdf`) pour l’édition et la prévisualisation dans le navigateur.
- Persistance optionnelle avec PostgreSQL pour les utilisateurs, projets, métadonnées git et historique Codex.
- Exécution shell Docker optionnelle via `webterm/docker-shell.sh`.

### En bref

| Zone | Ce que cela apporte |
|---|---|
| Workspace | Terminal navigateur + éditeur + arbre de fichiers + panneau PDF |
| Boucle d’automatisation | Modifs pilotées par prompt, compilation, inspection des logs, itérations |
| Runtime | Shell hôte par défaut, shell Docker en option |
| Persistance | Mode stateless par défaut ; historique/métadonnées PostgreSQL en option |
| Docs/i18n | Ensemble README multilingue et dossier `i18n/` dans le dépôt |

## Ce que vous obtenez

- Terminal web connecté à un sandbox Docker
- Structure de projet LaTeX et compilation en un clic
- Exécution Python/R pour figures et expériences
- Prévisualisation PDF avec logs
- Interface PWA propre et minimaliste

## Fonctionnalités

- Terminal navigateur avec prise en charge du redimensionnement PTY et contrôles de workflow persistants.
- Panneau de contrôle projet pour la création de workspace, l’initialisation LaTeX et la compilation.
- Arborescence de fichiers + éditeur CodeMirror avec sauvegarde et polling watch/reload optionnel.
- Pipeline de prévisualisation PDF pour `/home/<user>/Projects/<project>/latex/<file>.pdf`.
- Codex Bridge avec démarrage/reprise de session, synchronisation d’état et journalisation DB optionnelle.
- Aides Git/SSH dans l’UI (sauvegarde d’identité, préremplissage du remote, génération/vérification de clés SSH).
- Opérations commande/fichier compatibles Docker avec fallback vers le shell/système de fichiers hôte.

### Carte des fonctionnalités

| Capacité | Détails |
|---|---|
| Terminal | Flux PTY WebSocket via `/ws`, workflow shell interactif |
| Agent bridge | Orchestration de sessions `/codex/ws` + `/api/codex/*` |
| Fichiers | Lecture/écriture `/api/file`, navigation structure `/api/tree` |
| Prévisualisation PDF | Service des artefacts compilés via `/api/pdf` |
| Contrôles | Créer projet, init LaTeX, compiler, config Git/SSH |

## État du projet

- Espace PWA : terminal web, prévisualisation PDF, éditeur.
- Project Controls : création workspace, init LaTeX, compilation, aides Git/SSH.
- Codex Bridge : reprise de session, liste d’historique DB, bascule de sync `/status`.
- Arborescence + éditeur CodeMirror avec save/watch.
- Exécution Docker (optionnelle) avec toolchain LaTeX/Python/R.

## Démo

![PaperAgent demo](demos/demo-full.png)

## Structure du projet

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

## Prérequis

- OS : Linux recommandé (Docker et outillage shell attendus).
- Python : utilisez l’environnement Conda existant (`paperagent`) quand il est disponible.
- Dépendances :
  - `tornado`
  - `psycopg[binary]` (optionnel mais recommandé pour les fonctionnalités adossées à la DB)
- Services d’exécution optionnels :
  - Docker (pour le shell sandbox et les chemins projet conteneurisés)
  - PostgreSQL (pour la persistance utilisateurs/projets/historique de session Codex)
- Toolchains optionnelles dans le sandbox/conteneur :
  - LaTeX (`latexmk` et paquets TeX)
  - Python, R
  - Node + `@openai/codex`

### Matrice des dépendances

| Type | Composants |
|---|---|
| Requis | Python + `tornado` |
| Recommandé | `psycopg[binary]` pour les capacités adossées à la DB |
| Services optionnels | Docker, PostgreSQL |
| Toolchains optionnelles | LaTeX (`latexmk`), Python/R, Node + `@openai/codex` |

## Installation

### 1) Cloner le dépôt (avec submodules)

```bash
git clone --recurse-submodules https://github.com/lachlanchen/PaperAgent.git
cd PaperAgent
```

Si déjà cloné sans submodules :

```bash
git submodule update --init --recursive
```

### 2) Environnement Python et paquets

```bash
conda activate paperagent
pip install tornado "psycopg[binary]"
```

Alternative (si vous n’êtes pas dans l’env) :

```bash
conda run -n paperagent pip install tornado "psycopg[binary]"
```

### 3) Configuration de l’environnement

```bash
cp .env.example .env
```

Modifiez `.env` pour votre machine (identifiants DB, valeurs par défaut Codex, etc.).

### 4) Initialisation optionnelle de la base

```bash
./scripts/init_db.sh
```

Cela crée/met à jour le rôle + la DB et applique `scripts/db_schema.sql`.

### 5) Initialisation optionnelle du sandbox Docker

```bash
./scripts/setup_docker_env.sh
```

Pour la configuration d’un hôte NVIDIA (si nécessaire) :

```bash
./scripts/install_nvidia_host.sh
```

## Utilisation

### Exécution locale (par défaut recommandée)

```bash
cd webterm
python server.py --host 127.0.0.1 --port 8765
```

Ouvrez : `http://127.0.0.1:8765`

### Exécution avec shell Docker cible

```bash
cd webterm
python server.py --host 0.0.0.0 --port 8766 --shell ./docker-shell.sh
```

### Mode dev avec auto-reload

```bash
cd webterm
python server.py --host 127.0.0.1 --port 8765 --dev
```

En mode `--dev`, le cache du service worker est désactivé pour éviter les assets obsolètes.

### Flux UI typique

1. Saisissez utilisateur + projet dans le panneau de contrôle.
2. Cliquez **Create Project + cd** pour créer :
   `/home/<user>/Projects/<project>/{code,data,figures,latex/latex_figures,artifacts}`
3. Cliquez **Init LaTeX** pour générer `latex/main.tex`.
4. Cliquez **Compile LaTeX** (`latexmk`) puis rafraîchissez/ouvrez l’aperçu PDF.
5. Modifiez les fichiers dans CodeMirror via l’arborescence puis sauvegardez.
6. Utilisez Codex Bridge pour les modifications pilotées par prompt et la reprise de session.

### Routes API rapides

| Endpoint | Objectif |
|---|---|
| `/api/tree` | Interroger l’arborescence du projet pour le panneau éditeur |
| `/api/file` | Lire/écrire les fichiers du projet |
| `/api/pdf` | Récupérer les artefacts PDF rendus |
| `/api/codex/*` | Cycle de vie des sessions, historique, synchronisation d’état |
| `/codex/ws` | Canal WebSocket pour les événements du bridge Codex |

## Configuration

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

### Autres bascules utiles

- `CODEX_AUTO_RESTORE=1` : recrée les IDs de session manquants et rejoue l’historique stocké.
- `PROJECT_DB=1` : active la persistance des métadonnées projet dans la DB.
- `WEBTERM_QUIET_LOGS=1` : supprime les logs verbeux de polling/accès statiques.
- `CODEX_CMD=codex` : commande exécutable Codex.
- `CODEX_CWD=/workspace` : répertoire de travail de repli quand le chemin user/projet n’est pas disponible.
- `WEBTERM_CONTAINER=<name>` : surcharge le nom du conteneur détecté.

## Exemples

### Lancer et vérifier le terminal

```bash
cd webterm
python server.py --host 127.0.0.1 --port 8765
# in browser terminal:
pwd
```

### Interroger l’API d’arborescence projet

```bash
curl "http://127.0.0.1:8765/api/tree?user=paperagent&project=demo-paper&depth=4"
```

### Récupérer le PDF (après compilation)

```bash
curl -o main.pdf "http://127.0.0.1:8765/api/pdf?user=paperagent&project=demo-paper&file=main.pdf"
```

### Lire un fichier via l’API

```bash
curl "http://127.0.0.1:8765/api/file?user=paperagent&project=demo-paper&path=latex/main.tex"
```

## Notes de développement

- Style de code :
  - Python : indentation 4 espaces, fonctions petites et directes.
  - Frontend : indentation 2 espaces, noms de classes CSS en kebab-case.
- Pas encore de suite de tests automatisés formelle ; les vérifications manuelles sont prioritaires.
- Vérifications manuelles :
  - Charger la PWA, connecter le terminal, exécuter `pwd`.
  - Vérifier la création de projet et les actions de compilation LaTeX depuis l’UI.
- Si vous mettez à jour les assets PWA, incrémentez le nom de cache du service worker dans `webterm/static/sw.js`.
- Traitez `codex/` et `overleaf/` comme des submodules ; évitez les modifications directes ici sauf intention explicite.

## Dépannage

### Permission refusée pour le shell Docker

Si l’accès Docker échoue, assurez-vous que votre shell est membre du groupe docker :

```bash
newgrp docker
cd webterm
python server.py --host 0.0.0.0 --port 8766
```

### PDF introuvable dans l’aperçu

- Confirmez que la compilation s’est terminée avec succès dans le terminal.
- Confirmez que le fichier existe à `/home/<user>/Projects/<project>/latex/main.pdf`.
- Rafraîchissez le panneau PDF ou utilisez le bouton **Open**.

### Fonctionnalités DB indisponibles

- Vérifiez les identifiants DB dans `.env`.
- Assurez-vous que Postgres est lancé et joignable.
- Installez le driver : `pip install "psycopg[binary]"`.
- Si nécessaire, exécutez `./scripts/init_db.sh` puis redémarrez le serveur.

### Commande Codex introuvable

- Installez Codex via l’installateur UI (NVM + Node LTS + `@openai/codex`) ou manuellement.
- Vérifiez que `CODEX_CMD` et `CODEX_NVM_DIR` sont correctement définis pour votre contexte d’exécution.

### Sécurité du binding LAN

`--host 0.0.0.0` est réservé aux réseaux de confiance. N’exposez pas publiquement sans auth/TLS.

## Feuille de route

Direction planifiée et en cours (voir `references/roadmap-blueprint.md` et la documentation associée) :

- Améliorer la boucle d’automatisation multi-étapes et les workflows de reproductibilité.
- Étendre la fiabilité et l’observabilité des sessions Codex Bridge.
- Renforcer les parcours de configuration sandbox/runtime (variantes CPU/GPU).
- Améliorer les contrôles projet et l’ergonomie de l’éditeur.
- Poursuivre l’alignement de la documentation multilingue et du site.

## Projet principal

- https://github.com/lachlanchen/the-art-of-lazying

## Liens de l’écosystème

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

## Faire un don

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

Votre soutien finance ma recherche, mon développement et mes opérations afin que je puisse continuer à partager davantage de projets ouverts et d’améliorations.

## Contribution

Les contributions sont les bienvenues.

- Ouvrez une issue décrivant le problème/la proposition.
- Gardez des modifications ciblées et petites.
- Suivez le style de commit utilisé dans ce dépôt : `Add ...`, `Update ...`, `Expand ...`.
- Pour les changements frontend/UI, incluez des captures d’écran ou des GIFs dans les PR.
- Si vous mettez à jour le contenu des README, gardez toutes les variantes de langue alignées (`README.*.md`).

Remarque : les politiques de contribution des submodules sont définies en amont dans leurs propres dépôts (`codex/`, `overleaf/`).

## Licence

Le fichier de licence au niveau du dépôt n’est pas présent à la racine dans l’arborescence actuelle.

- Hypothèse : ce projet est peut-être actuellement partagé sans fichier de licence finalisé au niveau supérieur.
- Confirmez l’intention de licence avant de redistribuer des versions modifiées substantielles.
- Les submodules portent leurs propres licences amont (par exemple, `overleaf/LICENSE`).

## Remerciements

- [Overleaf](https://github.com/overleaf/overleaf) pour les idées d’infrastructure et composants de plateforme LaTeX collaborative.
- [OpenAI Codex CLI](https://github.com/openai/codex) pour les workflows terminal agentiques.
- L’écosystème `the-art-of-lazying` au sens large pour la vision produit et l’intégration inter-projets.
