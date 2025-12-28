[![Projet principal](https://img.shields.io/badge/Projet_principal-the--art--of--lazying-0f766e?style=for-the-badge)](https://github.com/lachlanchen/the-art-of-lazying)

[English](README.md) | [繁體中文](README.zh-Hant.md) | [简体中文](README.zh-Hans.md) | [日本語](README.ja.md) | [한국어](README.ko.md) | [Tiếng Việt](README.vi.md) | [العربية](README.ar.md) | Français | [Español](README.es.md)

<p align="center">
  <img src="logos/banner.png" alt="Bannière PaperAgent" width="100%">
</p>


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

- https://lazying.art 🎨 <img src="https://img.shields.io/badge/Main-Visit-0f766e?style=flat-square" alt="Site principal">
- https://chat.lazying.art
- https://onlyideas.art 💡 <img src="https://img.shields.io/badge/Ideas-Visit-0f766e?style=flat-square" alt="OnlyIdeas">
- https://ideas.onlyideas.art
- https://coin.lazying.art
- https://earn.lazying.art
- https://learn.lazying.art
- https://robot.lazying.art
- https://glass.lazying.art

### Faire un don

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

Votre soutien finance la recherche, le développement et l’exploitation afin que je puisse partager davantage de projets ouverts et d’améliorations.
