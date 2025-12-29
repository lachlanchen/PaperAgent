English | [繁體中文](README.zh-Hant.md) | [简体中文](README.zh-Hans.md) | [日本語](README.ja.md) | [한국어](README.ko.md) | [Tiếng Việt](README.vi.md) | [العربية](README.ar.md) | [Français](README.fr.md) | [Español](README.es.md)

<p align="center">
  <img src="figs/banner.png" alt="PaperAgent banner" width="100%">
</p>

[![Main Project](https://img.shields.io/badge/Main%20Project-the--art--of--lazying-0f766e?style=for-the-badge)](https://github.com/lachlanchen/the-art-of-lazying) [![Main Website](https://img.shields.io/badge/Main%20Website-lazying.art-0f766e?style=for-the-badge)](https://lazying.art)

# PaperAgent

PaperAgent is a local-first web workspace for writing papers: edit LaTeX and code in the browser, run Python/R and compile LaTeX on the backend, and preview PDFs with logs in one place.

## Vision

PaperAgent is built to liberate everyone from research busy-work to “Only Ideas.”
The goal is simple: keep the thinking human and make the system do the repetitive work.
You focus on the idea and the narrative; PaperAgent handles the execution loops.

## Philosophy

- Local-first, privacy-first: data and execution stay on your machine by default.
- Idea-first workflow: move from a concept to a runnable paper with minimal friction.
- Small, reversible steps: every change is transparent and easy to undo.
- Tools should remove work: automation exists to delete toil, not add it.

## Logic (how it works)

1) Chat → Edit: describe the change, and PaperAgent edits the right files.
2) Run → Compile: execute Python/R, compile LaTeX, generate figures.
3) Preview → Iterate: inspect PDF + logs, fix fast, repeat.

## What you get

- Web terminal connected to a Docker sandbox
- LaTeX project scaffolding and one-click compile
- Python/R execution for figures and experiments
- PDF preview with logs
- A clean, minimal PWA interface

## Project status

- PWA workspace: web terminal, PDF preview, editor.
- Project Controls: create workspace, init LaTeX, compile, Git/SSH helpers.
- Codex Bridge: session resume, DB history list, /status sync toggle.
- File tree + CodeMirror editor with save/watch.
- Docker-backed execution (optional) with LaTeX/Python/R toolchain.

## Demo

![PaperAgent demo](demos/demo-full.png)

## Main project

- https://github.com/lachlanchen/the-art-of-lazying

## Ecosystem links

- https://lazying.art 🎨 <img src="https://img.shields.io/badge/Main-Visit-0f766e?style=flat-square" alt="Main site">
- https://chat.lazying.art 🧠
- https://paper.lazying.art 📄
- https://onlyideas.art 💡 <img src="https://img.shields.io/badge/Ideas-Visit-0f766e?style=flat-square" alt="OnlyIdeas">
- https://coin.lazying.art 🪙
- https://earn.lazying.art 💸
- https://learn.lazying.art 📚
- https://robot.lazying.art 🤖
- https://glass.lazying.art 👓
- https://ideas.onlyideas.art 🧪

### Donate

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

Your support sustains my research, development, and ops so I can keep sharing more open projects and improvements.
