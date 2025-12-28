[![메인 프로젝트](https://img.shields.io/badge/메인_프로젝트-the--art--of--lazying-0f766e?style=for-the-badge)](https://github.com/lachlanchen/the-art-of-lazying)

[English](README.md) | [繁體中文](README.zh-Hant.md) | [简体中文](README.zh-Hans.md) | [日本語](README.ja.md) | 한국어 | [Tiếng Việt](README.vi.md) | [العربية](README.ar.md) | [Français](README.fr.md) | [Español](README.es.md)

<p align="center">
  <img src="logos/banner.png" alt="PaperAgent 배너" width="100%">
</p>


# PaperAgent

PaperAgent는 로컬 우선 논문 작성 워크스페이스입니다. 브라우저에서 LaTeX와 코드를 편집하고, 백엔드에서 Python/R을 실행해 LaTeX을 컴파일하며, PDF와 로그를 한 곳에서 확인합니다.

## 비전

PaperAgent는 연구의 잡무에서 모두를 해방해 ‘Only Ideas’에 집중하게 합니다.
핵심은 간단합니다. 생각은 사람에게, 반복은 시스템에게.
당신은 아이디어와 서사에 집중하고 PaperAgent가 실행 루프를 돌립니다.

## 철학

- 로컬 우선·프라이버시 우선: 데이터와 실행은 기본적으로 로컬에 둡니다.
- 아이디어 우선 흐름: 개념에서 실행 가능한 논문까지 마찰 최소화.
- 작은 단계, 되돌리기 쉬움: 변경은 투명하고 복구 가능합니다.
- 도구는 일을 줄여야 함: 자동화는 일을 줄이기 위해 존재합니다.

## 동작 로직

1) 채팅 → 편집: 요구를 설명하면 필요한 파일이 수정됩니다.
2) 실행 → 컴파일: Python/R 실행, LaTeX 컴파일, 그림 생성.
3) 미리보기 → 반복: PDF와 로그를 확인하고 빠르게 수정합니다.

## 제공 기능

- Docker 샌드박스에 연결된 웹 터미널
- LaTeX 프로젝트 스캐폴딩과 원클릭 컴파일
- 그림/실험을 위한 Python/R 실행
- PDF 미리보기와 로그
- 깔끔한 PWA 인터페이스

## 프로젝트 상태

- PWA 워크스페이스: 웹 터미널, PDF 미리보기, 편집기.
- 프로젝트 컨트롤: 워크스페이스 생성, LaTeX 초기화, 컴파일, Git/SSH 도우미.
- Codex Bridge: 세션 재개, DB 기록 목록, /status 동기화 토글.
- 파일 트리 + CodeMirror 편집기(저장/감시).
- Docker 기반 실행(선택), LaTeX/Python/R 툴체인.

## 데모

![PaperAgent 데모](demos/demo-full.png)

## 메인 프로젝트

- https://github.com/lachlanchen/the-art-of-lazying

## 에코시스템 링크

- https://lazying.art 🎨 <img src="https://img.shields.io/badge/메인-Visit-0f766e?style=flat-square" alt="메인 사이트">
- https://chat.lazying.art
- https://onlyideas.art 💡 <img src="https://img.shields.io/badge/Ideas-Visit-0f766e?style=flat-square" alt="OnlyIdeas">
- https://ideas.onlyideas.art
- https://coin.lazying.art
- https://earn.lazying.art
- https://learn.lazying.art
- https://robot.lazying.art
- https://glass.lazying.art

### 후원

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

여러분의 지원은 연구·개발과 운영을 지속하고 더 많은 오픈 프로젝트를 공유할 수 있게 해줍니다.
