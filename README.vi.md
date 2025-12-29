[English](README.md) | [繁體中文](README.zh-Hant.md) | [简体中文](README.zh-Hans.md) | [日本語](README.ja.md) | [한국어](README.ko.md) | Tiếng Việt | [العربية](README.ar.md) | [Français](README.fr.md) | [Español](README.es.md)

<p align="center">
  <img src="https://raw.githubusercontent.com/lachlanchen/lachlanchen/main/https://raw.githubusercontent.com/lachlanchen/lachlanchen/main/logos/banner.png" alt="Biểu ngữ PaperAgent" width="100%">
</p>

[![Dự án chính](https://img.shields.io/badge/D%E1%BB%B1%20%C3%A1n%20ch%C3%ADnh-the--art--of--lazying-0f766e?style=for-the-badge)](https://github.com/lachlanchen/the-art-of-lazying) [![Trang chính](https://img.shields.io/badge/Trang%20ch%C3%ADnh-lazying.art-0f766e?style=for-the-badge)](https://lazying.art)

# PaperAgent

PaperAgent là không gian làm việc local-first để viết bài nghiên cứu: chỉnh sửa LaTeX và mã trong trình duyệt, chạy Python/R và biên dịch LaTeX ở backend, và xem PDF cùng log tại một nơi.

## Tầm nhìn

PaperAgent được tạo ra để giải phóng mọi người khỏi việc lặt vặt trong nghiên cứu, trở về với “Only Ideas”.
Mục tiêu rất rõ: giữ phần suy nghĩ cho con người và giao phần lặp lại cho hệ thống.
Bạn tập trung vào ý tưởng và câu chuyện, PaperAgent lo các vòng lặp thực thi.

## Triết lý

- Ưu tiên local, ưu tiên riêng tư: dữ liệu và thực thi ở trên máy của bạn theo mặc định.
- Quy trình ưu tiên ý tưởng: từ khái niệm đến bài chạy được với ít ma sát.
- Bước nhỏ, có thể đảo ngược: thay đổi rõ ràng và dễ hoàn tác.
- Công cụ phải giảm việc: tự động hóa để bớt việc, không phải thêm việc.

## Cách hoạt động

1) Chat → Chỉnh sửa: mô tả thay đổi, PaperAgent cập nhật đúng tệp.
2) Chạy → Biên dịch: chạy Python/R, biên dịch LaTeX, tạo hình.
3) Xem trước → Lặp lại: xem PDF và log, sửa nhanh, lặp lại.

## Bạn nhận được

- Web terminal kết nối Docker sandbox
- Khung dự án LaTeX và biên dịch một chạm
- Chạy Python/R cho hình vẽ và thí nghiệm
- Xem trước PDF và log
- Giao diện PWA gọn gàng

## Trạng thái dự án

- Không gian làm việc PWA: terminal web, xem PDF, trình soạn thảo.
- Project Controls: tạo workspace, khởi tạo LaTeX, biên dịch, tiện ích Git/SSH.
- Codex Bridge: khôi phục phiên, danh sách lịch sử DB, công tắc đồng bộ /status.
- Cây thư mục + editor CodeMirror (lưu/giám sát).
- Chạy qua Docker (tùy chọn) với toolchain LaTeX/Python/R.

## Demo

![PaperAgent demo](demos/demo-full.png)

## Dự án chính

- https://github.com/lachlanchen/the-art-of-lazying

## Liên kết hệ sinh thái

- https://lazying.art 🎨 <img src="https://img.shields.io/badge/Trang%20ch%C3%ADnh-Visit-0f766e?style=flat-square" alt="Trang chính">
- https://chat.lazying.art 🧠
- https://paper.lazying.art 📄
- https://onlyideas.art 💡 <img src="https://img.shields.io/badge/Ideas-Visit-0f766e?style=flat-square" alt="OnlyIdeas">
- https://coin.lazying.art 🪙
- https://earn.lazying.art 💸
- https://learn.lazying.art 📚
- https://robot.lazying.art 🤖
- https://glass.lazying.art 👓
- https://ideas.onlyideas.art 🧪

### Ủng hộ

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

Sự ủng hộ của bạn giúp duy trì nghiên cứu, phát triển và vận hành để tôi có thể chia sẻ thêm nhiều dự án mở.
