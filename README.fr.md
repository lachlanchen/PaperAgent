[English](README.md) | [繁體中文](README.zh-Hant.md) | [简体中文](README.zh-Hans.md) | [日本語](README.ja.md) | [한국어](README.ko.md) | [Tiếng Việt](README.vi.md) | [العربية](README.ar.md) | Français | [Español](README.es.md)

<p align="center">
  <img src="https://raw.githubusercontent.com/lachlanchen/lachlanchen/main/logos/banner.png" alt="Bannière PaperAgent" width="100%">
</p>

[![Projet principal](https://img.shields.io/badge/Projet%20principal-the--art--of--lazying-0f766e?style=for-the-badge)](https://github.com/lachlanchen/the-art-of-lazying) [![Site principal](https://img.shields.io/badge/Site%20principal-lazying.art-0f766e?style=for-the-badge)](https://lazying.art)

# PaperAgent

PaperAgent est un espace de travail local-first pour rédiger des articles : éditer LaTeX et le code dans le navigateur, exécuter Python/R et compiler LaTeX côté backend, puis prévisualiser les PDF et les logs au même endroit.

## Vision

PaperAgent vise à libérer chacun des tâches répétitives de la recherche pour revenir à « Only Ideas ».
L’objectif est simple : garder la réflexion humaine et confier le répétitif au système.
Vous vous concentrez sur l’idée et le récit; PaperAgent gère les boucles d’exécution.

## Philosophie

- Local-first, privacy-first : données et exécution restent sur votre machine par défaut.
- Flux centré sur l’idée : du concept à un paper exécutable avec un minimum de friction.
- Petits pas réversibles : chaque modification est claire et annulable.
- Les outils doivent enlever du travail : l’automatisation sert à réduire l’effort.

## Logique (comment ça marche)

1) Chat → Édition : vous décrivez le changement et les bons fichiers sont modifiés.
2) Exécuter → Compiler : lancer Python/R, compiler LaTeX, générer les figures.
3) Prévisualiser → Itérer : examiner le PDF et les logs, corriger vite, recommencer.

## Ce que vous obtenez

- Terminal web connecté à un sandbox Docker
- Squelette de projet LaTeX et compilation en un clic
- Exécution Python/R pour figures et expériences
- Prévisualisation PDF avec logs
- Interface PWA propre et minimale

## Statut du projet

- Espace PWA : terminal web, aperçu PDF, éditeur.
- Project Controls : création d’espace, init LaTeX, compilation, outils Git/SSH.
- Codex Bridge : reprise de session, liste d’historique DB, bascule /status.
- Arborescence + éditeur CodeMirror (sauvegarde/surveillance).
- Exécution via Docker (optionnelle) avec toolchain LaTeX/Python/R.

## Démo

![Démo PaperAgent](demos/demo-full.png)

## Projet principal

- https://github.com/lachlanchen/the-art-of-lazying

## Liens de l’écosystème

- https://lazying.art 🎨 <img src="https://img.shields.io/badge/Site%20principal-Visit-0f766e?style=flat-square" alt="Site principal">
- https://onlyideas.art 💡 <img src="https://img.shields.io/badge/Ideas-Visit-0f766e?style=flat-square" alt="OnlyIdeas">
- https://chat.lazying.art 🧠
- https://paper.lazying.art 📄
- https://coin.lazying.art 🪙
- https://earn.lazying.art 💸
- https://learn.lazying.art 📚
- https://robot.lazying.art 🤖
- https://glass.lazying.art 👓
- https://ideas.onlyideas.art 🧪

### Faire un don

<!-- support:start -->
[![GitHub Sponsors](https://img.shields.io/badge/GitHub-Sponsors-EA4AAA?style=for-the-badge&logo=githubsponsors&logoColor=white)](https://github.com/sponsors/lachlanchen)
[![LazyingArt Support](https://img.shields.io/badge/LazyingArt-Support-0EA5E9?style=for-the-badge)](https://chat.lazying.art/donate)
[![PayPal Support](https://img.shields.io/badge/PayPal-Support-00457C?style=for-the-badge&logo=paypal&logoColor=white)](https://paypal.me/RongzhouChen)
[![Stripe Support](https://img.shields.io/badge/Stripe-Support-635BFF?style=for-the-badge&logo=stripe&logoColor=white)](https://buy.stripe.com/aFadR8gIaflgfQV6T4fw400)
<!-- support:end -->

Votre soutien finance la recherche, le développement et l’exploitation afin que je puisse partager davantage de projets ouverts et d’améliorations.
