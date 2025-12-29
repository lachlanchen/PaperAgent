[English](README.md) | [繁體中文](README.zh-Hant.md) | [简体中文](README.zh-Hans.md) | [日本語](README.ja.md) | [한국어](README.ko.md) | [Tiếng Việt](README.vi.md) | [العربية](README.ar.md) | [Français](README.fr.md) | Español

<p align="center">
  <img src="figs/banner.png" alt="Banner de PaperAgent" width="100%">
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
- https://chat.lazying.art 🧠
- https://paper.lazying.art 📄
- https://onlyideas.art 💡 <img src="https://img.shields.io/badge/Ideas-Visit-0f766e?style=flat-square" alt="OnlyIdeas">
- https://coin.lazying.art 🪙
- https://earn.lazying.art 💸
- https://learn.lazying.art 📚
- https://robot.lazying.art 🤖
- https://glass.lazying.art 👓
- https://ideas.onlyideas.art 🧪

### Donar

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

Tu apoyo sostiene la investigación, el desarrollo y las operaciones para poder compartir más proyectos abiertos y mejoras.
