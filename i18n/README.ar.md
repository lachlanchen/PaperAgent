[English](../README.md) · [العربية](README.ar.md) · [Español](README.es.md) · [Français](README.fr.md) · [日本語](README.ja.md) · [한국어](README.ko.md) · [Tiếng Việt](README.vi.md) · [中文 (简体)](README.zh-Hans.md) · [中文（繁體）](README.zh-Hant.md) · [Deutsch](README.de.md) · [Русский](README.ru.md)


[![LazyingArt banner](https://github.com/lachlanchen/lachlanchen/raw/main/figs/banner.png)](https://github.com/lachlanchen/lachlanchen/blob/main/figs/banner.png)

[![Main Project](https://img.shields.io/badge/Main%20Project-the--art--of--lazying-0f766e?style=for-the-badge)](https://github.com/lachlanchen/the-art-of-lazying) [![Main Website](https://img.shields.io/badge/Main%20Website-lazying.art-0f766e?style=for-the-badge)](https://lazying.art)
[![GitHub stars](https://img.shields.io/github/stars/lachlanchen/PaperAgent?style=for-the-badge&label=Stars&color=0f766e)](https://github.com/lachlanchen/PaperAgent/stargazers)
[![GitHub issues](https://img.shields.io/github/issues/lachlanchen/PaperAgent?style=for-the-badge&label=Issues&color=7c3aed)](https://github.com/lachlanchen/PaperAgent/issues)
[![Docs](https://img.shields.io/badge/Docs-README-2563eb?style=for-the-badge)](README.md)

# PaperAgent

[![Local First](https://img.shields.io/badge/Local--First-Yes-0f766e?style=flat-square)](#نظرة-عامة)
[![PWA](https://img.shields.io/badge/PWA-Enabled-2563eb?style=flat-square)](#نظرة-عامة)
[![Backend](https://img.shields.io/badge/Backend-Tornado-7c3aed?style=flat-square)](#نظرة-عامة)
[![Terminal](https://img.shields.io/badge/PTY-WebSocket-0891b2?style=flat-square)](#الميزات)
[![Docker Optional](https://img.shields.io/badge/Docker-Optional-0ea5e9?style=flat-square)](#المتطلبات-المسبقة)
[![Postgres Optional](https://img.shields.io/badge/PostgreSQL-Optional-1d4ed8?style=flat-square)](#المتطلبات-المسبقة)
[![License](https://img.shields.io/badge/License-Pending-lightgrey?style=flat-square)](#الترخيص)

PaperAgent هو مساحة عمل ويب محلية أولاً لكتابة الأوراق البحثية: عدّل LaTeX والكود من المتصفح، وشغّل Python/R وتجميع LaTeX في الخلفية، وعاين ملفات PDF مع السجلات في مكان واحد.

## مساعدة في بناء المخطوطات

هل تريد تشغيل PaperAgent بنفسك؟ ابدأ بهذا المستودع. وإذا احتجت إلى بناء LaTeX نظيف ونسخة فروق قابلة للمراجعة لمخطوطة واحدة، فإن [الخدمة محددة النطاق بسعر 250 دولارًا](https://lazying.art/manuscript-sprint/?utm_source=github&utm_medium=repository&utm_campaign=manuscript_sprint_pilot&utm_content=paperagent_readme) تعرض العينة والنطاق والاستثناءات قبل فحص الملاءمة المجاني.

## الرؤية

تم بناء PaperAgent للتحرر من الأعمال الروتينية في البحث والتركيز على "Only Ideas".
الغاية واضحة: اجعل التفكير إنسانيًا واجعل النظام يتولى الأعمال المتكررة.
أنت تُركّز على الفكرة والسرد؛ وPaperAgent يتعامل مع حلقات التنفيذ.

## الفلسفة

- Local-first و privacy-first: البيانات والتنفيذ تبقيان على جهازك افتراضًا.
- سير عمل يبدأ من الفكرة: الانتقال من مفهوم إلى ورقة قابلة للتنفيذ بأقل احتكاك.
- خطوات صغيرة وقابلة للعكس: كل تغيير شفاف وسهل التراجع.
- الأدوات يجب أن تقلّل العبء: الأتمتة موجودة لإزالة العمل اليدوي، لا لإضافته.

## 🛠️ المنطق (كيف يعمل)

1. Chat -> Edit: صف التغيير، وسيُعدّل PaperAgent الملفات الصحيحة.
2. Run -> Compile: نفّذ Python/R، اجمع LaTeX، وابنِ الرسوم.
3. Preview -> Iterate: افحص PDF + السجلات، أصلح بسرعة، وكرّر.

## نظرة عامة

PaperAgent مبني حول `webterm/`، وهو خادم Tornado + WebSocket يشغّل مساحة عمل PWA في المتصفح:

- بث طرفية PTY (`/ws`) لأعمال shell التفاعلية.
- جسر Codex عبر WebSocket/API (`/codex/ws`, `/api/codex/*`) لسير عمل قائم على الجلسة.
- واجهات الملفات والشجرة وPDF (`/api/file`, `/api/tree`, `/api/pdf`) للتحرير والمعاينة داخل المتصفح.
- حفظ اختياري معتمد على Postgres للمستخدمين والمشاريع وبيانات git الوصفية وسجل Codex.
- تنفيذ اختياري عبر `webterm/docker-shell.sh`.

### لمحة سريعة

| المجال | ما يقدّمه |
|---|---|
| مساحة العمل | طرفية المتصفح + محرر + شجرة ملفات + لوحة PDF |
| حلقة الأتمتة | تعديلات موجهة بالأوامر النصية، تجميع، فحص سجلات، تكرار |
| بيئة التشغيل | shell المضيف افتراضًا، وDocker shell اختياري |
| الاستمرارية | وضع عديم الحالة افتراضًا؛ سجل/بيانات وصفية اختياري عبر Postgres |
| Docs/i18n | مجموعة README متعددة اللغات ومجلد `i18n/` داخل المستودع |

## ما الذي ستحصل عليه

- طرفية ويب متصلة بحاوية Docker المعزولة.
- إنشاء هيكل مشروع LaTeX وتجميع بنقرة واحدة.
- تنفيذ Python/R للرسوم والتجارب.
- معاينة PDF مع سجلات التشغيل.
- واجهة PWA نظيفة وبسيطة.

## الميزات

- طرفية متصفح مع دعم تغيير حجم PTY وعناصر تحكم سير عمل مستمرة.
- لوحة تحكم المشروع لإنشاء مساحة العمل وتهيئة LaTeX ومسارات التجميع.
- شجرة ملفات + محرر CodeMirror مع حفظ ومراقبة اختيارية لإعادة التحميل.
- خط أنابيب معاينة PDF لمسار `/home/<user>/Projects/<project>/latex/<file>.pdf`.
- Codex Bridge مع بدء/استئناف الجلسات، مزامنة الحالة، وتسجيل اختياري في قاعدة البيانات.
- أدوات Git/SSH في الواجهة (حفظ الهوية، تعبئة remote مسبقًا، توليد/تحقق مفاتيح SSH).
- تنفيذ الملفات/الأوامر واعٍ لـDocker مع fallback إلى shell ونظام الملفات الأساسي.

### خريطة الميزات

| الإمكانية | التفاصيل |
|---|---|
| الطرفية | بث PTY عبر WebSocket عبر `/ws` لسير عمل shell تفاعلي |
| جسر الوكيل | تنسيق الجلسات عبر `/codex/ws` + `/api/codex/*` |
| الملفات | قراءة/كتابة عبر `/api/file` وتصفح شجرة المجلد عبر `/api/tree` |
| معاينة PDF | تخزين/استرجاع المخرجات المجمّعة عبر `/api/pdf` |
| أدوات التحكم | إنشاء المشروع، تهيئة LaTeX، التجميع، إعداد Git/SSH |

## حالة المشروع

- مساحة عمل PWA: طرفية ويب، معاينة PDF، محرر.
- أدوات التحكم بالمشروع: إنشاء مساحة العمل، تهيئة LaTeX، التجميع، أدوات Git/SSH.
- Codex Bridge: استئناف الجلسات، قائمة سجل DB، تبديل مزامنة `/status`.
- شجرة الملفات + محرر CodeMirror مع الحفظ/المراقبة.
- تنفيذ معتمد على Docker (اختياري) مع أدوات LaTeX/Python/R.

## العرض التوضيحي

![PaperAgent demo](demos/demo-full.png)

## 🗂️ بنية المشروع

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

- نظام التشغيل: Linux مفضل (يتطلب Docker وأدوات shell).
- Python: استخدم البيئة Conda الحالية (`paperagent`) متى كانت متاحة.
- التبعيات:
  - `tornado`
  - `psycopg[binary]` (اختيارية لكنها موصى بها لميزات DB)
- خدمات تشغيل اختيارية:
  - Docker (لاستخدام sandbox shell ومسارات المشاريع داخل الحاويات)
  - PostgreSQL (لحفظ المستخدمين/المشاريع/سجل جلسات Codex)
- سلاسل أدوات اختيارية داخل sandbox/container:
  - LaTeX (`latexmk` وحزم TeX)
  - Python, R
  - Node + `@openai/codex`

### مصفوفة التبعيات

| النوع | المكونات |
|---|---|
| مطلوب | Python + `tornado` |
| موصى به | `psycopg[binary]` للقدرات المعتمدة على قاعدة البيانات |
| خدمات اختيارية | Docker, PostgreSQL |
| سلاسل أدوات اختيارية | LaTeX (`latexmk`), Python/R, Node + `@openai/codex` |

## التثبيت

### 1) استنساخ المستودع (مع submodules)

```bash
git clone --recurse-submodules https://github.com/lachlanchen/PaperAgent.git
cd PaperAgent
```

إذا كان الاستنساخ مسبقًا بلا submodules:

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

### 3) إعداد البيئة

```bash
cp .env.example .env
```

عدّل `.env` حسب جهازك (بيانات اعتماد DB، إعدادات Codex الافتراضية، إلخ).

### 4) تهيئة قاعدة البيانات اختيارية

```bash
./scripts/init_db.sh
```

ينشئ هذا الدور وقاعدة البيانات ويطبّق `scripts/db_schema.sql`.

### 5) تهيئة Docker sandbox اختيارية

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

### التشغيل باستخدام Docker shell

```bash
cd webterm
python server.py --host 0.0.0.0 --port 8766 --shell ./docker-shell.sh
```

### وضع إعادة التحميل التلقائي أثناء التطوير

```bash
cd webterm
python server.py --host 127.0.0.1 --port 8765 --dev
```

في وضع `--dev` يتم تعطيل تخزين service worker المؤقت لتجنب الأصول القديمة.

### تدفق واجهة المستخدم النموذجي

1. أدخل اسم المستخدم + المشروع في لوحة التحكم.
2. انقر **Create Project + cd** لإنشاء:
   `/home/<user>/Projects/<project>/{code,data,figures,latex/latex_figures,artifacts}`
3. انقر **Init LaTeX** لتهيئة `latex/main.tex`.
4. انقر **Compile LaTeX** (`latexmk`) ثم حدّث/افتح معاينة PDF.
5. حرّر الملفات في CodeMirror عبر شجرة الملفات ثم احفظ.
6. استخدم Codex Bridge للتعديلات عبر prompt واستئناف الجلسة.

### مسارات API السريعة

| نقطة النهاية | الغرض |
|---|---|
| `/api/tree` | استعلام شجرة دليل المشروع للوحة المحرر |
| `/api/file` | قراءة/كتابة ملفات المشروع |
| `/api/pdf` | استرجاع ملفات PDF المترجمة |
| `/api/codex/*` | دورة حياة الجلسة، السجل، مزامنة الحالة |
| `/codex/ws` | قناة WebSocket لأحداث جسر Codex |

## التكوين

PaperAgent يقرأ متغيرات البيئة من `.env` (أو `ENV_FILE`) ومن بيئة التشغيل.

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

### مفاتيح تبديل مفيدة إضافية

- `CODEX_AUTO_RESTORE=1`: إعادة إنشاء معرفات جلسات مفقودة وإعادة تشغيل التاريخ المخزن.
- `PROJECT_DB=1`: تفعيل حفظ بيانات مشروع معتمد على DB.
- `WEBTERM_QUIET_LOGS=1`: تقليل ضجيج سجلات الاستطلاع/الوصول الثابت.
- `CODEX_CMD=codex`: أمر تشغيل Codex.
- `CODEX_CWD=/workspace`: دليل العمل الاحتياطي إذا كانت مسارات المستخدم/المشروع غير متاحة.
- `WEBTERM_CONTAINER=<name>`: تجاوز اسم الحاوية المكتشف تلقائيًا.

## أمثلة

### تشغيل والتحقق من الطرفية

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
  - Python: 4 فراغات، دوال صغيرة ومباشرة.
  - الواجهة الأمامية: 2 فراغات، أسماء فئات CSS بنمط kebab-case.
- لا توجد حزمة اختبارات آلية رسمية؛ الفحوصات اليدوية هي الأساس.
- فحوصات يدوية:
  - تحميل PWA، ثم الاتصال بالطرفية وتشغيل `pwd`.
  - التحقق من إنشاء المشروع وتحقق تجميع LaTeX من الواجهة.
- إذا عدّلت أصول PWA، زد اسم cache لـ service worker في `webterm/static/sw.js`.
- عُدّ وحدات `codex/` و`overleaf/` كوحدات فرعية؛ وتجنب تعديلها مباشرةً إلا عند الضرورة.

## 🩺 استكشاف الأخطاء وإصلاحها

### رفض إذن Docker shell

إذا فشل الوصول إلى Docker، تأكد أن بيئتك في مجموعة docker:

```bash
newgrp docker
cd webterm
python server.py --host 0.0.0.0 --port 8766
```

### PDF غير موجود في المعاينة

- تأكد من نجاح التجميع في الطرفية.
- تأكد من وجود الملف في `/home/<user>/Projects/<project>/latex/main.pdf`.
- حدّث لوحة PDF أو استخدم زر **Open**.

### ميزات DB غير متاحة

- تحقق من بيانات DB في `.env`.
- تأكد من أن Postgres يعمل ومتاح.
- ثبّت driver: `pip install "psycopg[binary]"`.
- إذا لزم، شغّل `./scripts/init_db.sh` ثم أعد تشغيل الخادم.

### أمر Codex غير موجود

- ثبّت Codex عبر مثبت الواجهة (NVM + Node LTS + `@openai/codex`) أو يدويًا.
- تأكد من ضبط `CODEX_CMD` و `CODEX_NVM_DIR` بشكل صحيح لبيئة التشغيل.

### أمان الربط عبر LAN

`--host 0.0.0.0` مخصص فقط للشبكات الموثوقة. لا تعرّض الخدمة على الإنترنت دون auth/TLS.

## 🗺️ خارطة الطريق

اتجاهات مخططة وفي التنفيذ (راجع `references/roadmap-blueprint.md` والوثائق ذات الصلة):

- تحسين حلقة أتمتة الأوراق متعددة الخطوات وسير العمل القابلية لإعادة الإنتاج.
- توسيع موثوقية Codex Bridge وسهولة ملاحظته.
- تقوية إعدادات sandbox/ال runtime (متغيرات CPU/GPU).
- تحسين أدوات التحكم بالمشروع وتجربة محرر الملفات.
- توسيع التوثيق متعدد اللغات ومواءمة الواجهة.

## 🌐 المشروع الرئيسي

- https://github.com/lachlanchen/the-art-of-lazying

## 🔗 روابط النظام البيئي

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

## المساهمة

المساهمات مرحّب بها.

- افتح Issue يصف المشكلة/الاقتراح.
- اجعل التغييرات مركّزة وصغيرة.
- اتبع نمط أسماء الالتزامات المستخدم في هذا المستودع: `Add ...`، `Update ...`، `Expand ...`.
- لتعديلات الواجهة الأمامية/UI، أرفق لقطات شاشة أو GIFs في طلبات السحب.
- عند تحديث محتوى README، حافظ على تماسك نسخ اللغات (`README.*.md`).

ملاحظة: سياسات المساهمة الخاصة بالـ submodules معرفة في مستودعاتها الأصلية (`codex/` و `overleaf/`).

## 📜 الترخيص

ملف الترخيص على مستوى المستودع غير موجود حاليًا في الشجرة الجذرية.

- افتراض: قد يتم مشاركة هذا المشروع حاليًا دون ملف ترخيص نهائي على المستوى الأعلى.
- حدّد نية الترخيص قبل إعادة توزيع نسخ معدلة بشكل جوهري.
- الوحدات الفرعية تحمل تراخيصها الأصلية (مثل `overleaf/LICENSE`).

## 🙏 الشكر والتقدير

- [Overleaf](https://github.com/overleaf/overleaf) لبنية وأفكار منصة LaTeX التعاونية.
- [OpenAI Codex CLI](https://github.com/openai/codex) لسير عمل terminal agent.
- منظومة `the-art-of-lazying` الأوسع لرؤية المنتج والتكامل بين المشاريع.


## ❤️ Support

| Donate | PayPal | Stripe |
| --- | --- | --- |
| [![Donate](https://camo.githubusercontent.com/24a4914f0b42c6f435f9e101621f1e52535b02c225764b2f6cc99416926004b7/68747470733a2f2f696d672e736869656c64732e696f2f62616467652f446f6e6174652d4c617a79696e674172742d3045413545393f7374796c653d666f722d7468652d6261646765266c6f676f3d6b6f2d6669266c6f676f436f6c6f723d7768697465)](https://chat.lazying.art/donate) | [![PayPal](https://camo.githubusercontent.com/d0f57e8b016517a4b06961b24d0ca87d62fdba16e18bbdb6aba28e978dc0ea21/68747470733a2f2f696d672e736869656c64732e696f2f62616467652f50617950616c2d526f6e677a686f754368656e2d3030343537433f7374796c653d666f722d7468652d6261646765266c6f676f3d70617970616c266c6f676f436f6c6f723d7768697465)](https://paypal.me/RongzhouChen) | [![Stripe](https://camo.githubusercontent.com/1152dfe04b6943afe3a8d2953676749603fb9f95e24088c92c97a01a897b4942/68747470733a2f2f696d672e736869656c64732e696f2f62616467652f5374726970652d446f6e6174652d3633354246463f7374796c653d666f722d7468652d6261646765266c6f676f3d737472697065266c6f676f436f6c6f723d7768697465)](https://buy.stripe.com/aFadR8gIaflgfQV6T4fw400) |
