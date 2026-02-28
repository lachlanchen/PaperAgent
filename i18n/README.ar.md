[English](../README.md) · [العربية](README.ar.md) · [Español](README.es.md) · [Français](README.fr.md) · [日本語](README.ja.md) · [한국어](README.ko.md) · [Tiếng Việt](README.vi.md) · [中文 (简体)](README.zh-Hans.md) · [中文（繁體）](README.zh-Hant.md) · [Deutsch](README.de.md) · [Русский](README.ru.md)


<p align="center">
  <img src="https://raw.githubusercontent.com/lachlanchen/lachlanchen/main/logos/banner.png" alt="PaperAgent banner" width="100%">
</p>

[![Main Project](https://img.shields.io/badge/Main%20Project-the--art--of--lazying-0f766e?style=for-the-badge)](https://github.com/lachlanchen/the-art-of-lazying) [![Main Website](https://img.shields.io/badge/Main%20Website-lazying.art-0f766e?style=for-the-badge)](https://lazying.art)

# PaperAgent

[![Local First](https://img.shields.io/badge/Local--First-Yes-0f766e?style=flat-square)](#نظرة-عامة)
[![PWA](https://img.shields.io/badge/PWA-Enabled-2563eb?style=flat-square)](#نظرة-عامة)
[![Backend](https://img.shields.io/badge/Backend-Tornado-7c3aed?style=flat-square)](#نظرة-عامة)
[![Terminal](https://img.shields.io/badge/PTY-WebSocket-0891b2?style=flat-square)](#الميزات)
[![Docker Optional](https://img.shields.io/badge/Docker-Optional-0ea5e9?style=flat-square)](#المتطلبات-المسبقة)
[![Postgres Optional](https://img.shields.io/badge/PostgreSQL-Optional-1d4ed8?style=flat-square)](#المتطلبات-المسبقة)
[![License](https://img.shields.io/badge/License-Pending-lightgrey?style=flat-square)](#الترخيص)

PaperAgent مساحة عمل ويب تعتمد مبدأ local-first لكتابة الأوراق البحثية: حرّر LaTeX والكود من المتصفح، شغّل Python/R واجرِ تجميع LaTeX في الخلفية، وعاين ملفات PDF مع السجلات في مكان واحد.

## الرؤية

تم بناء PaperAgent لتحرير الجميع من الأعمال البحثية الروتينية إلى مرحلة “Only Ideas”.  
الهدف بسيط: إبقاء التفكير إنسانيًا وجعل النظام يتولى العمل المتكرر.  
أنت تركّز على الفكرة والسرد؛ وPaperAgent يتولى حلقات التنفيذ.

## الفلسفة

- Local-first وprivacy-first: البيانات والتنفيذ يبقيان على جهازك افتراضيًا.
- سير عمل يضع الفكرة أولًا: الانتقال من مفهوم إلى ورقة قابلة للتشغيل بأقل احتكاك.
- خطوات صغيرة وقابلة للعكس: كل تغيير واضح وسهل التراجع.
- الأدوات يجب أن تزيل العمل: الأتمتة موجودة لإلغاء العناء لا لإضافته.

## المنطق (كيف يعمل)

1. Chat -> Edit: صف التغيير، فيعدّل PaperAgent الملفات الصحيحة.
2. Run -> Compile: شغّل Python/R، اجمع LaTeX، وأنشئ الرسوم.
3. Preview -> Iterate: افحص PDF + السجلات، أصلح بسرعة، وكرّر.

## نظرة عامة

يرتكز PaperAgent على `webterm/`، وهو خادم Tornado + WebSocket يشغّل مساحة عمل PWA داخل المتصفح:

- بث طرفية PTY (`/ws`) للعمل التفاعلي عبر الصدفة.
- واجهة Codex Bridge عبر WebSocket/API (`/codex/ws`, `/api/codex/*`) لسير عمل الوكيل القائم على الجلسات.
- واجهات الملفات والشجرة وPDF (`/api/file`, `/api/tree`, `/api/pdf`) للتحرير والمعاينة داخل المتصفح.
- حفظ اختياري مدعوم بـ Postgres للمستخدمين والمشاريع وبيانات git الوصفية وسجل Codex.
- تنفيذ اختياري عبر Docker shell باستخدام `webterm/docker-shell.sh`.

### لمحة سريعة

| المجال | ما الذي يقدمه |
|---|---|
| مساحة العمل | طرفية متصفح + محرر + شجرة ملفات + لوحة PDF |
| حلقة الأتمتة | تعديلات موجهة بالمطالبات، تجميع، فحص السجلات، تكرار |
| بيئة التشغيل | صدفة المضيف افتراضيًا، وصدفة Docker اختياريًا |
| الاستمرارية | وضع عديم الحالة افتراضيًا؛ وسجل/بيانات وصفية اختياريًا عبر Postgres |
| الوثائق/i18n | مجموعة README متعددة اللغات ومجلد `i18n/` داخل المستودع |

## ما الذي ستحصل عليه

- طرفية ويب متصلة ببيئة Docker معزولة
- إنشاء هيكل مشروع LaTeX وتجميع بنقرة واحدة
- تنفيذ Python/R للرسوم والتجارب
- معاينة PDF مع السجلات
- واجهة PWA نظيفة وبسيطة

## الميزات

- طرفية متصفح مع دعم تغيير حجم PTY وعناصر تحكم سير عمل مستمرة.
- لوحة تحكم المشروع لإنشاء مساحة العمل وتهيئة LaTeX ومسارات التجميع.
- شجرة ملفات + محرر CodeMirror مع الحفظ واستطلاع اختياري للمراقبة/إعادة التحميل.
- مسار معاينة PDF لـ `/home/<user>/Projects/<project>/latex/<file>.pdf`.
- Codex Bridge مع بدء/استئناف الجلسات، مزامنة الحالة، وتسجيل اختياري في قاعدة البيانات.
- مساعدات Git/SSH في الواجهة (حفظ الهوية، تعبئة remote مسبقًا، توليد/فحص مفاتيح SSH).
- عمليات أوامر/ملفات مدركة لـ Docker مع fallback إلى صدفة/نظام ملفات المضيف.

### خريطة الميزات

| الإمكانية | التفاصيل |
|---|---|
| الطرفية | بث PTY عبر WebSocket من خلال `/ws` وسير عمل صدفة تفاعلي |
| جسر الوكيل | تنظيم الجلسات عبر `/codex/ws` + `/api/codex/*` |
| الملفات | قراءة/كتابة عبر `/api/file` وتصفح البنية عبر `/api/tree` |
| معاينة PDF | تقديم المخرجات المجمعة عبر `/api/pdf` |
| أدوات التحكم | إنشاء مشروع، تهيئة LaTeX، التجميع، إعداد Git/SSH |

## حالة المشروع

- مساحة عمل PWA: طرفية ويب، معاينة PDF، محرر.
- أدوات تحكم المشروع: إنشاء مساحة عمل، تهيئة LaTeX، تجميع، مساعدات Git/SSH.
- Codex Bridge: استئناف الجلسة، قائمة سجل DB، تبديل مزامنة `/status`.
- شجرة ملفات + محرر CodeMirror مع الحفظ/المراقبة.
- تنفيذ مدعوم بـ Docker (اختياري) مع سلسلة أدوات LaTeX/Python/R.

## العرض التوضيحي

![PaperAgent demo](demos/demo-full.png)

## بنية المشروع

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

## المتطلبات المسبقة

- نظام التشغيل: يُنصح بـ Linux (متوقع توفر Docker وأدوات الصدفة).
- Python: استخدم بيئة Conda الحالية (`paperagent`) عند توفرها.
- الاعتماديات:
  - `tornado`
  - `psycopg[binary]` (اختياري لكنه موصى به للميزات المعتمدة على قاعدة البيانات)
- خدمات تشغيل اختيارية:
  - Docker (لصدفة sandbox ومسارات المشاريع المعزولة بالحاويات)
  - PostgreSQL (لاستمرارية المستخدمين/المشاريع/سجل جلسات Codex)
- سلاسل أدوات اختيارية داخل sandbox/container:
  - LaTeX (`latexmk` وحزم TeX)
  - Python, R
  - Node + `@openai/codex`

### مصفوفة الاعتماديات

| النوع | المكونات |
|---|---|
| مطلوب | Python + `tornado` |
| موصى به | `psycopg[binary]` للقدرات المعتمدة على قاعدة البيانات |
| خدمات اختيارية | Docker, PostgreSQL |
| سلاسل أدوات اختيارية | LaTeX (`latexmk`), Python/R, Node + `@openai/codex` |

## التثبيت

### 1) استنساخ المستودع (مع الوحدات الفرعية)

```bash
git clone --recurse-submodules https://github.com/lachlanchen/PaperAgent.git
cd PaperAgent
```

إذا تم الاستنساخ مسبقًا دون وحدات فرعية:

```bash
git submodule update --init --recursive
```

### 2) بيئة Python والحزم

```bash
conda activate paperagent
pip install tornado "psycopg[binary]"
```

بديل (إذا لم تكن داخل البيئة):

```bash
conda run -n paperagent pip install tornado "psycopg[binary]"
```

### 3) ضبط البيئة

```bash
cp .env.example .env
```

عدّل `.env` بما يناسب جهازك (بيانات اعتماد DB، إعدادات Codex الافتراضية، إلخ).

### 4) تهيئة اختيارية لقاعدة البيانات

```bash
./scripts/init_db.sh
```

يقوم هذا بإنشاء/تحديث الدور + قاعدة البيانات وتطبيق `scripts/db_schema.sql`.

### 5) تهيئة اختيارية لبيئة Docker المعزولة

```bash
./scripts/setup_docker_env.sh
```

لإعداد مضيف NVIDIA (عند الحاجة):

```bash
./scripts/install_nvidia_host.sh
```

## الاستخدام

### التشغيل محليًا (الافتراضي الموصى به)

```bash
cd webterm
python server.py --host 127.0.0.1 --port 8765
```

افتح: `http://127.0.0.1:8765`

### التشغيل مع هدف صدفة Docker

```bash
cd webterm
python server.py --host 0.0.0.0 --port 8766 --shell ./docker-shell.sh
```

### وضع إعادة التحميل التلقائي أثناء التطوير

```bash
cd webterm
python server.py --host 127.0.0.1 --port 8765 --dev
```

في وضع `--dev`، يتم تعطيل التخزين المؤقت لـ service worker لتجنب الأصول القديمة.

### تدفق واجهة مستخدم نموذجي

1. أدخل المستخدم + المشروع في لوحة التحكم.
2. انقر **Create Project + cd** لإنشاء:
   `/home/<user>/Projects/<project>/{code,data,figures,latex/latex_figures,artifacts}`
3. انقر **Init LaTeX** لإنشاء `latex/main.tex`.
4. انقر **Compile LaTeX** (`latexmk`) ثم حدّث/افتح معاينة PDF.
5. حرّر الملفات في CodeMirror عبر شجرة الملفات ثم احفظ.
6. استخدم Codex Bridge لتعديلات موجهة بالمطالبات واستئناف الجلسات.

### مسارات API سريعة

| Endpoint | الغرض |
|---|---|
| `/api/tree` | استعلام شجرة مجلد المشروع للوحة المحرر |
| `/api/file` | قراءة/كتابة ملفات المشروع |
| `/api/pdf` | جلب مخرجات PDF المعروضة |
| `/api/codex/*` | دورة حياة الجلسات، السجل، مزامنة الحالة |
| `/codex/ws` | قناة WebSocket لأحداث Codex bridge |

## الإعداد

يقرأ PaperAgent متغيرات البيئة من `.env` (أو `ENV_FILE`) ومن بيئة العملية.

### إعدادات DB الأساسية

```bash
DB_HOST=localhost
DB_PORT=5432
DB_NAME=paperagent_db
DB_USER=lachlan
DB_PASSWORD=change_me
```

### إعدادات Codex الافتراضية

```bash
CODEX_LOG_DB=1
CODEX_LOG_OUTPUT=1
CODEX_USERNAME=lachlan
CODEX_PROJECT=demo-paper
CODEX_ARGS="-s danger-full-access -a never"
CODEX_NVM_DIR=/root/.nvm
CODEX_HISTORY_MESSAGES=1000
```

### مفاتيح تبديل إضافية مفيدة

- `CODEX_AUTO_RESTORE=1`: إعادة إنشاء معرّفات الجلسات المفقودة وإعادة تشغيل السجل المخزَّن.
- `PROJECT_DB=1`: تمكين حفظ البيانات الوصفية للمشاريع عبر قاعدة البيانات.
- `WEBTERM_QUIET_LOGS=1`: كتم سجلات الاستطلاع/الوصول الثابت المزعجة.
- `CODEX_CMD=codex`: أمر تشغيل Codex.
- `CODEX_CWD=/workspace`: مجلد العمل الاحتياطي عند عدم توفر مسار المستخدم/المشروع.
- `WEBTERM_CONTAINER=<name>`: تجاوز اسم الحاوية المكتشف تلقائيًا.

## أمثلة

### التشغيل والتحقق من الطرفية

```bash
cd webterm
python server.py --host 127.0.0.1 --port 8765
# in browser terminal:
pwd
```

### استعلام API شجرة المشروع

```bash
curl "http://127.0.0.1:8765/api/tree?user=paperagent&project=demo-paper&depth=4"
```

### جلب PDF (بعد التجميع)

```bash
curl -o main.pdf "http://127.0.0.1:8765/api/pdf?user=paperagent&project=demo-paper&file=main.pdf"
```

### قراءة ملف عبر API

```bash
curl "http://127.0.0.1:8765/api/file?user=paperagent&project=demo-paper&path=latex/main.tex"
```

## ملاحظات التطوير

- أسلوب الكود:
  - Python: مسافة بادئة 4 فراغات، ودوال صغيرة ومباشرة.
  - الواجهة الأمامية: مسافة بادئة 2 فراغات، وأسماء فئات CSS بنمط kebab-case.
- لا توجد حاليًا مجموعة اختبارات آلية رسمية؛ الفحوصات اليدوية هي الأساس.
- فحوصات يدوية:
  - حمّل PWA، اتصل بالطرفية، شغّل `pwd`.
  - تحقّق من إنشاء المشروع وإجراءات تجميع LaTeX من الواجهة.
- إذا حدّثت أصول PWA، ارفع اسم ذاكرة التخزين المؤقت لـ service worker في `webterm/static/sw.js`.
- تعامل مع `codex/` و`overleaf/` كوحدات فرعية؛ وتجنب التعديلات المباشرة هنا إلا إذا كان ذلك مقصودًا.

## استكشاف الأخطاء وإصلاحها

### رفض إذن صدفة Docker

إذا فشل الوصول إلى docker، فتأكد أن صدفتك ضمن مجموعة docker:

```bash
newgrp docker
cd webterm
python server.py --host 0.0.0.0 --port 8766
```

### عدم العثور على PDF في المعاينة

- تأكد من اكتمال التجميع بنجاح في الطرفية.
- تأكد من وجود الملف في `/home/<user>/Projects/<project>/latex/main.pdf`.
- حدّث لوحة PDF أو استخدم زر **Open**.

### ميزات DB غير متاحة

- تحقق من بيانات اعتماد DB في `.env`.
- تأكد من تشغيل Postgres وإمكانية الوصول إليه.
- ثبّت المشغّل: `pip install "psycopg[binary]"`.
- عند الحاجة، شغّل `./scripts/init_db.sh` ثم أعد تشغيل الخادم.

### تعذّر العثور على أمر Codex

- ثبّت Codex عبر مُثبّت الواجهة (NVM + Node LTS + `@openai/codex`) أو يدويًا.
- تأكد من ضبط `CODEX_CMD` و`CODEX_NVM_DIR` بشكل صحيح وفق سياق التشغيل لديك.

### أمان الربط عبر LAN

استخدم `--host 0.0.0.0` فقط ضمن شبكات موثوقة. لا تعرض الخدمة علنًا دون auth/TLS.

## خارطة الطريق

اتجاهات مخطط لها وجارية (راجع `references/roadmap-blueprint.md` والوثائق ذات الصلة):

- تحسين حلقة أتمتة الأوراق متعددة الخطوات وسير عمل القابلية لإعادة الإنتاج.
- توسيع موثوقية Codex Bridge وإمكانية مراقبته.
- تقوية مسارات إعداد sandbox/بيئة التشغيل (نسخ CPU/GPU).
- تحسين أدوات التحكم بالمشروع وتجربة المحرر.
- مواصلة الوثائق متعددة اللغات ومواءمة الموقع.

## المشروع الرئيسي

- https://github.com/lachlanchen/the-art-of-lazying

## روابط النظام البيئي

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

## التبرع

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

دعمك يساند البحث والتطوير والتشغيل لدي، حتى أواصل مشاركة المزيد من المشاريع المفتوحة والتحسينات.

## المساهمة

المساهمات مرحّب بها.

- افتح issue يصف المشكلة/المقترح.
- اجعل التغييرات مركّزة وصغيرة.
- اتبع نمط الرسائل المستخدم في هذا المستودع: `Add ...`, `Update ...`, `Expand ...`.
- لتغييرات الواجهة الأمامية/UI، أرفق لقطات شاشة أو GIFs في طلبات السحب.
- عند تحديث محتوى README، حافظ على اتساق جميع نسخ اللغات (`README.*.md`).

ملاحظة: سياسات المساهمة الخاصة بالوحدات الفرعية معرّفة في مستودعاتها الأصلية (`codex/`, `overleaf/`).

## الترخيص

ملف ترخيص على مستوى المستودع غير موجود في الجذر ضمن الشجرة الحالية.

- افتراض: قد تتم مشاركة هذا المشروع حاليًا دون ملف ترخيص نهائي على المستوى الأعلى.
- أكّد نية الترخيص قبل إعادة توزيع نسخ معدلة بشكل كبير.
- الوحدات الفرعية تحمل تراخيصها الأصلية الخاصة بها (على سبيل المثال `overleaf/LICENSE`).

## الشكر والتقدير

- [Overleaf](https://github.com/overleaf/overleaf) لأفكار وبنى منصات LaTeX التعاونية ومكوناتها.
- [OpenAI Codex CLI](https://github.com/openai/codex) لسير عمل الطرفية الوكيلية.
- منظومة `the-art-of-lazying` الأوسع لرؤية المنتج والتكامل عبر المشاريع.
