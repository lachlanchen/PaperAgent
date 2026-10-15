[English](README.md) | 繁體中文 | [简体中文](README.zh-Hans.md) | [日本語](README.ja.md) | [한국어](README.ko.md) | [Tiếng Việt](README.vi.md) | [العربية](README.ar.md) | [Français](README.fr.md) | [Español](README.es.md)

<p align="center">
  <img src="https://raw.githubusercontent.com/lachlanchen/lachlanchen/main/logos/banner.png" alt="PaperAgent 橫幅" width="100%">
</p>

[![主專案](https://img.shields.io/badge/%E4%B8%BB%E5%B0%88%E6%A1%88-the--art--of--lazying-0f766e?style=for-the-badge)](https://github.com/lachlanchen/the-art-of-lazying) [![主站](https://img.shields.io/badge/%E4%B8%BB%E7%AB%99-lazying.art-0f766e?style=for-the-badge)](https://lazying.art)

# PaperAgent

PaperAgent 是一個本地優先的論文寫作工作台：在瀏覽器中編輯 LaTeX 與程式碼，後端執行 Python/R 並編譯 LaTeX，在同一處預覽 PDF 與編譯日誌。

## 願景

PaperAgent 的願景是讓每個人從研究的瑣事中解放，回到「只有想法」。
核心很簡單：把思考留給人，把重複工作交給系統。
你專注於想法與敘事，PaperAgent 處理執行迴圈。

## 理念

- 本地優先、隱私優先：資料與執行預設留在你的機器。
- 想法優先的流程：從概念到可執行論文的摩擦最小化。
- 小步可逆：每次變更清楚且可回復。
- 工具應該減少工作：自動化是為了刪除瑣事，而不是增加。

## 邏輯（如何運作）

1) 聊天 → 編輯：描述改動，PaperAgent 修改正確檔案。
2) 執行 → 編譯：跑 Python/R、編譯 LaTeX、產生圖表。
3) 預覽 → 迭代：查看 PDF 與日誌，快速修正再重來。

## 你會得到

- 連到 Docker 沙盒的 Web 終端
- LaTeX 專案骨架與一鍵編譯
- 用 Python/R 生成圖表與實驗
- PDF 預覽與編譯日誌
- 簡潔的 PWA 介面

## 專案狀態

- PWA 工作台：Web 終端、PDF 預覽、編輯器。
- 專案控制：建立工作區、初始化 LaTeX、編譯、Git/SSH 輔助。
- Codex Bridge：會話復原、DB 歷史列表、/status 同步開關。
- 檔案樹 + CodeMirror 編輯器（儲存/監看）。
- Docker 後端執行（可選），含 LaTeX/Python/R 工具鏈。

## 示範

![PaperAgent 示範](demos/demo-full.png)

## 主專案

- https://github.com/lachlanchen/the-art-of-lazying

## 生態系連結

- https://lazying.art 🎨 <img src="https://img.shields.io/badge/%E4%B8%BB%E7%AB%99-Visit-0f766e?style=flat-square" alt="主站">
- https://onlyideas.art 💡 <img src="https://img.shields.io/badge/Ideas-Visit-0f766e?style=flat-square" alt="OnlyIdeas">
- https://chat.lazying.art 🧠
- https://paper.lazying.art 📄
- https://coin.lazying.art 🪙
- https://earn.lazying.art 💸
- https://learn.lazying.art 📚
- https://robot.lazying.art 🤖
- https://glass.lazying.art 👓
- https://ideas.onlyideas.art 🧪

### 捐贈

<!-- support:start -->
[![GitHub Sponsors](https://img.shields.io/badge/GitHub-Sponsors-EA4AAA?style=for-the-badge&logo=githubsponsors&logoColor=white)](https://github.com/sponsors/lachlanchen)
[![LazyingArt Support](https://img.shields.io/badge/LazyingArt-Support-0EA5E9?style=for-the-badge)](https://chat.lazying.art/donate)
[![PayPal Support](https://img.shields.io/badge/PayPal-Support-00457C?style=for-the-badge&logo=paypal&logoColor=white)](https://paypal.me/RongzhouChen)
[![Stripe Support](https://img.shields.io/badge/Stripe-Support-635BFF?style=for-the-badge&logo=stripe&logoColor=white)](https://buy.stripe.com/aFadR8gIaflgfQV6T4fw400)
<!-- support:end -->

你的支持將用於研發與維運，讓我能持續分享更多開放專案與改進。
