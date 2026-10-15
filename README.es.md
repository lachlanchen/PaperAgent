[English](README.md) | [繁體中文](README.zh-Hant.md) | [简体中文](README.zh-Hans.md) | [日本語](README.ja.md) | [한국어](README.ko.md) | [Tiếng Việt](README.vi.md) | [العربية](README.ar.md) | [Français](README.fr.md) | Español

<p align="center">
  <img src="https://raw.githubusercontent.com/lachlanchen/lachlanchen/main/logos/banner.png" alt="Banner de PaperAgent" width="100%">
</p>

[![Proyecto principal](https://img.shields.io/badge/Proyecto%20principal-the--art--of--lazying-0f766e?style=for-the-badge)](https://github.com/lachlanchen/the-art-of-lazying) [![Sitio principal](https://img.shields.io/badge/Sitio%20principal-lazying.art-0f766e?style=for-the-badge)](https://lazying.art)

# PaperAgent

PaperAgent es un espacio de trabajo local-first para escribir papers: edita LaTeX y código en el navegador, ejecuta Python/R y compila LaTeX en el backend, y previsualiza PDFs y logs en un solo lugar.

## Visión

PaperAgent está pensado para liberar a todos del trabajo repetitivo de la investigación y volver a «Only Ideas».
El objetivo es simple: dejar el pensamiento a las personas y el trabajo repetitivo al sistema.
Tú te concentras en la idea y la narrativa; PaperAgent maneja los bucles de ejecución.

## Filosofía

- Local-first, privacy-first: datos y ejecución quedan en tu máquina por defecto.
- Flujo idea-first: del concepto a un paper ejecutable con mínima fricción.
- Pasos pequeños y reversibles: cada cambio es claro y se puede deshacer.
- Las herramientas deben quitar trabajo: la automatización existe para eliminar esfuerzo.

## Lógica (cómo funciona)

1) Chat → Edición: describes el cambio y se modifican los archivos correctos.
2) Ejecutar → Compilar: ejecutar Python/R, compilar LaTeX, generar figuras.
3) Previsualizar → Iterar: revisar PDF y logs, corregir rápido, repetir.

## Qué obtienes

- Terminal web conectado a un sandbox Docker
- Estructura de proyecto LaTeX y compilación en un clic
- Ejecución Python/R para figuras y experimentos
- Previsualización PDF con logs
- Interfaz PWA limpia y mínima

## Estado del proyecto

- Espacio PWA: terminal web, vista previa PDF, editor.
- Controles del proyecto: crear espacio, init LaTeX, compilar, ayudas Git/SSH.
- Codex Bridge: reanudar sesión, lista de historial en DB, toggle de /status.
- Árbol de archivos + editor CodeMirror (guardar/monitoreo).
- Ejecución con Docker (opcional) con toolchain LaTeX/Python/R.

## Demo

![Demo PaperAgent](demos/demo-full.png)

## Proyecto principal

- https://github.com/lachlanchen/the-art-of-lazying

## Enlaces del ecosistema

- https://lazying.art 🎨 <img src="https://img.shields.io/badge/Sitio%20principal-Visit-0f766e?style=flat-square" alt="Sitio principal">
- https://onlyideas.art 💡 <img src="https://img.shields.io/badge/Ideas-Visit-0f766e?style=flat-square" alt="OnlyIdeas">
- https://chat.lazying.art 🧠
- https://paper.lazying.art 📄
- https://coin.lazying.art 🪙
- https://earn.lazying.art 💸
- https://learn.lazying.art 📚
- https://robot.lazying.art 🤖
- https://glass.lazying.art 👓
- https://ideas.onlyideas.art 🧪

### Donar

<!-- support:start -->
[![GitHub Sponsors](https://img.shields.io/badge/GitHub-Sponsors-EA4AAA?style=for-the-badge&logo=githubsponsors&logoColor=white)](https://github.com/sponsors/lachlanchen)
[![LazyingArt Support](https://img.shields.io/badge/LazyingArt-Support-0EA5E9?style=for-the-badge)](https://chat.lazying.art/donate)
[![PayPal Support](https://img.shields.io/badge/PayPal-Support-00457C?style=for-the-badge&logo=paypal&logoColor=white)](https://paypal.me/RongzhouChen)
[![Stripe Support](https://img.shields.io/badge/Stripe-Support-635BFF?style=for-the-badge&logo=stripe&logoColor=white)](https://buy.stripe.com/aFadR8gIaflgfQV6T4fw400)
<!-- support:end -->

Tu apoyo sostiene la investigación, el desarrollo y las operaciones para poder compartir más proyectos abiertos y mejoras.
