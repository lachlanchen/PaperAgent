[English](../README.md) · [العربية](README.ar.md) · [Español](README.es.md) · [Français](README.fr.md) · [日本語](README.ja.md) · [한국어](README.ko.md) · [Tiếng Việt](README.vi.md) · [中文 (简体)](README.zh-Hans.md) · [中文（繁體）](README.zh-Hant.md) · [Deutsch](README.de.md) · [Русский](README.ru.md)



[![LazyingArt banner](https://github.com/lachlanchen/lachlanchen/raw/main/figs/banner.png)](https://github.com/lachlanchen/lachlanchen/blob/main/figs/banner.png)

[![Main Project](https://img.shields.io/badge/Main%20Project-the--art--of--lazying-0f766e?style=for-the-badge)](https://github.com/lachlanchen/the-art-of-lazying) [![Main Website](https://img.shields.io/badge/Main%20Website-lazying.art-0f766e?style=for-the-badge)](https://lazying.art)

# PaperAgent

[![Local First](https://img.shields.io/badge/Local--First-Yes-0f766e?style=flat-square)](#visión-general)
[![PWA](https://img.shields.io/badge/PWA-Enabled-2563eb?style=flat-square)](#visión-general)
[![Backend](https://img.shields.io/badge/Backend-Tornado-7c3aed?style=flat-square)](#visión-general)
[![Terminal](https://img.shields.io/badge/PTY-WebSocket-0891b2?style=flat-square)](#funcionalidades)
[![Docker Optional](https://img.shields.io/badge/Docker-Optional-0ea5e9?style=flat-square)](#requisitos-previos)
[![Postgres Optional](https://img.shields.io/badge/PostgreSQL-Optional-1d4ed8?style=flat-square)](#requisitos-previos)
[![License](https://img.shields.io/badge/License-Pending-lightgrey?style=flat-square)](#licencia)

PaperAgent es un espacio de trabajo web local-first para redactar artículos: edita LaTeX y código en el navegador, ejecuta Python/R y compila LaTeX en el backend, y previsualiza PDFs con logs en un único lugar.

## Visión

PaperAgent está construido para liberar a todas las personas del trabajo repetitivo de investigación y llegar a “Only Ideas”.  
El objetivo es simple: mantener el pensamiento en manos humanas y dejar que el sistema haga el trabajo repetitivo.  
Tú te concentras en la idea y la narrativa; PaperAgent se encarga de los bucles de ejecución.

## Filosofía

- Local-first, privacy-first: los datos y la ejecución permanecen en tu máquina por defecto.
- Flujo idea-first: pasa de un concepto a un artículo ejecutable con mínima fricción.
- Pasos pequeños y reversibles: cada cambio es transparente y fácil de deshacer.
- Las herramientas deben eliminar trabajo: la automatización existe para quitar carga, no para añadirla.

## Lógica (cómo funciona)

1. Chat -> Edit: describe el cambio y PaperAgent edita los archivos correctos.
2. Run -> Compile: ejecuta Python/R, compila LaTeX y genera figuras.
3. Preview -> Iterate: inspecciona PDF + logs, corrige rápido y repite.

## Visión general

PaperAgent está centrado en `webterm/`, un servidor Tornado + WebSocket que impulsa un espacio de trabajo PWA en el navegador:

- Streaming de terminal PTY (`/ws`) para trabajo interactivo de shell.
- Codex Bridge WebSocket/API (`/codex/ws`, `/api/codex/*`) para flujos de agente por sesión.
- APIs de archivos, árbol y PDF (`/api/file`, `/api/tree`, `/api/pdf`) para edición y vista previa en navegador.
- Persistencia opcional en Postgres para usuarios, proyectos, metadatos de git e historial de Codex.
- Ejecución opcional mediante shell de Docker con `webterm/docker-shell.sh`.

### De un vistazo

| Área | Qué ofrece |
|---|---|
| Workspace | Terminal de navegador + editor + árbol de archivos + panel PDF |
| Automation loop | Ediciones dirigidas por prompt, compilación, inspección de logs, iteración |
| Runtime | Shell del host por defecto, shell Docker opcional |
| Persistence | Modo sin estado por defecto; historial/metadatos opcionales con Postgres |
| Docs/i18n | Conjunto de README multilingüe y directorio `i18n/` en el repositorio |

## Qué obtienes

- Terminal web conectada a un sandbox Docker
- Estructura de proyecto LaTeX y compilación en un clic
- Ejecución de Python/R para figuras y experimentos
- Vista previa de PDF con logs
- Una interfaz PWA limpia y minimalista

## Funcionalidades

- Terminal de navegador con soporte de redimensionado PTY y controles de flujo persistentes.
- Panel de control de proyecto para creación de workspace, inicialización LaTeX y compilación.
- Árbol de archivos + editor CodeMirror con guardado y sondeo opcional de watch/reload.
- Pipeline de vista previa PDF para `/home/<user>/Projects/<project>/latex/<file>.pdf`.
- Codex Bridge con inicio/reanudación de sesión, sincronización de estado y logging opcional en BD.
- Utilidades Git/SSH en la UI (guardar identidad, prefill de remoto, generación/verificación de clave SSH).
- Operaciones de comandos/archivos conscientes de Docker con fallback a shell/sistema de archivos del host.

### Mapa de funcionalidades

| Capacidad | Detalles |
|---|---|
| Terminal | Flujo PTY por WebSocket vía `/ws`, workflow interactivo de shell |
| Agent bridge | Orquestación de sesiones con `/codex/ws` + `/api/codex/*` |
| Files | Lectura/escritura con `/api/file`, exploración de estructura con `/api/tree` |
| PDF preview | Entrega de artefactos compilados mediante `/api/pdf` |
| Controls | Crear proyecto, inicializar LaTeX, compilar, configuración Git/SSH |

## Estado del proyecto

- Workspace PWA: terminal web, vista previa PDF, editor.
- Project Controls: crear workspace, inicializar LaTeX, compilar, utilidades Git/SSH.
- Codex Bridge: reanudación de sesión, lista de historial en BD, toggle de sincronización `/status`.
- Árbol de archivos + editor CodeMirror con guardado/watch.
- Ejecución con respaldo Docker (opcional) con toolchain LaTeX/Python/R.

## Demo

![PaperAgent demo](demos/demo-full.png)

## Estructura del proyecto

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

## Requisitos previos

- SO: se recomienda Linux (se espera Docker y herramientas de shell).
- Python: usa el entorno Conda existente (`paperagent`) cuando esté disponible.
- Dependencias:
  - `tornado`
  - `psycopg[binary]` (opcional pero recomendado para funcionalidades con BD)
- Servicios de ejecución opcionales:
  - Docker (para shell sandbox y rutas de proyecto en contenedor)
  - PostgreSQL (para persistir usuarios/proyectos/historial de sesión de Codex)
- Toolchains opcionales dentro del sandbox/contenedor:
  - LaTeX (`latexmk` y paquetes TeX)
  - Python, R
  - Node + `@openai/codex`

### Matriz de dependencias

| Tipo | Componentes |
|---|---|
| Required | Python + `tornado` |
| Recommended | `psycopg[binary]` para capacidades con respaldo en BD |
| Optional services | Docker, PostgreSQL |
| Optional toolchains | LaTeX (`latexmk`), Python/R, Node + `@openai/codex` |

## Instalación

### 1) Clonar el repositorio (con submódulos)

```bash
git clone --recurse-submodules https://github.com/lachlanchen/PaperAgent.git
cd PaperAgent
```

Si ya lo clonaste sin submódulos:

```bash
git submodule update --init --recursive
```

### 2) Entorno de Python y paquetes

```bash
conda activate paperagent
pip install tornado "psycopg[binary]"
```

Alternativa (si no estás dentro del entorno):

```bash
conda run -n paperagent pip install tornado "psycopg[binary]"
```

### 3) Configuración del entorno

```bash
cp .env.example .env
```

Edita `.env` para tu máquina (credenciales de BD, valores por defecto de Codex, etc.).

### 4) Bootstrap opcional de base de datos

```bash
./scripts/init_db.sh
```

Esto crea/actualiza rol + BD y aplica `scripts/db_schema.sql`.

### 5) Bootstrap opcional de sandbox Docker

```bash
./scripts/setup_docker_env.sh
```

Para configuración de host NVIDIA (si se necesita):

```bash
./scripts/install_nvidia_host.sh
```

## Uso

### Ejecutar localmente (predeterminado recomendado)

```bash
cd webterm
python server.py --host 127.0.0.1 --port 8765
```

Abrir: `http://127.0.0.1:8765`

### Ejecutar con destino de shell Docker

```bash
cd webterm
python server.py --host 0.0.0.0 --port 8766 --shell ./docker-shell.sh
```

### Modo de auto-recarga para desarrollo

```bash
cd webterm
python server.py --host 127.0.0.1 --port 8765 --dev
```

En modo `--dev`, la caché del service worker se desactiva para evitar assets obsoletos.

### Flujo típico en la UI

1. Introduce usuario + proyecto en el panel de control.
2. Haz clic en **Create Project + cd** para crear:
   `/home/<user>/Projects/<project>/{code,data,figures,latex/latex_figures,artifacts}`
3. Haz clic en **Init LaTeX** para generar `latex/main.tex`.
4. Haz clic en **Compile LaTeX** (`latexmk`) y refresca/abre la vista previa PDF.
5. Edita archivos en CodeMirror mediante el árbol de archivos y guarda.
6. Usa Codex Bridge para ediciones guiadas por prompt y reanudación de sesión.

### Rutas rápidas de API

| Endpoint | Propósito |
|---|---|
| `/api/tree` | Consultar el árbol del directorio del proyecto para el panel del editor |
| `/api/file` | Leer/escribir archivos del proyecto |
| `/api/pdf` | Obtener artefactos PDF renderizados |
| `/api/codex/*` | Ciclo de vida de sesión, historial, sincronización de estado |
| `/codex/ws` | Canal WebSocket para eventos del bridge de Codex |

## Configuración

PaperAgent lee variables de entorno desde `.env` (o `ENV_FILE`) y desde el entorno del proceso.

### Ajustes principales de BD

```bash
DB_HOST=localhost
DB_PORT=5432
DB_NAME=paperagent_db
DB_USER=lachlan
DB_PASSWORD=change_me
```

### Valores por defecto de Codex

```bash
CODEX_LOG_DB=1
CODEX_LOG_OUTPUT=1
CODEX_USERNAME=lachlan
CODEX_PROJECT=demo-paper
CODEX_ARGS="-s danger-full-access -a never"
CODEX_NVM_DIR=/root/.nvm
CODEX_HISTORY_MESSAGES=1000
```

### Toggles adicionales útiles

- `CODEX_AUTO_RESTORE=1`: recrea IDs de sesión faltantes y reproduce el historial almacenado.
- `PROJECT_DB=1`: habilita persistencia de metadatos de proyecto con respaldo en BD.
- `WEBTERM_QUIET_LOGS=1`: suprime logs ruidosos de sondeo/acceso a estáticos.
- `CODEX_CMD=codex`: comando ejecutable de Codex.
- `CODEX_CWD=/workspace`: directorio de trabajo de fallback cuando la ruta de usuario/proyecto no está disponible.
- `WEBTERM_CONTAINER=<name>`: sobrescribe el nombre de contenedor detectado.

## Ejemplos

### Lanzar y verificar terminal

```bash
cd webterm
python server.py --host 127.0.0.1 --port 8765
# in browser terminal:
pwd
```

### Consultar la API de árbol de proyecto

```bash
curl "http://127.0.0.1:8765/api/tree?user=paperagent&project=demo-paper&depth=4"
```

### Obtener PDF (después de compilar)

```bash
curl -o main.pdf "http://127.0.0.1:8765/api/pdf?user=paperagent&project=demo-paper&file=main.pdf"
```

### Leer archivo vía API

```bash
curl "http://127.0.0.1:8765/api/file?user=paperagent&project=demo-paper&path=latex/main.tex"
```

## Notas de desarrollo

- Estilo de código:
  - Python: indentación de 4 espacios, funciones pequeñas y directas.
  - Frontend: indentación de 2 espacios, nombres de clase CSS en kebab-case.
- Aún no hay una suite formal de tests automatizados; las comprobaciones manuales son la base.
- Comprobaciones manuales:
  - Cargar la PWA, conectar terminal, ejecutar `pwd`.
  - Verificar desde la UI la creación de proyectos y la compilación de LaTeX.
- Si actualizas assets de PWA, incrementa el nombre de caché del service worker en `webterm/static/sw.js`.
- Trata `codex/` y `overleaf/` como submódulos; evita ediciones directas aquí salvo que sea intencional.

## Solución de problemas

### Permiso denegado en shell Docker

Si falla el acceso a Docker, asegúrate de que tu shell tenga pertenencia al grupo docker:

```bash
newgrp docker
cd webterm
python server.py --host 0.0.0.0 --port 8766
```

### PDF no encontrado en la vista previa

- Confirma que la compilación terminó correctamente en la terminal.
- Confirma que el archivo existe en `/home/<user>/Projects/<project>/latex/main.pdf`.
- Refresca el panel PDF o usa el botón **Open**.

### Funcionalidades de BD no disponibles

- Revisa las credenciales de BD en `.env`.
- Asegura que Postgres esté en ejecución y accesible.
- Instala el driver: `pip install "psycopg[binary]"`.
- Si hace falta, ejecuta `./scripts/init_db.sh` y reinicia el servidor.

### Comando Codex no encontrado

- Instala Codex mediante el instalador de la UI (NVM + Node LTS + `@openai/codex`) o manualmente.
- Asegura que `CODEX_CMD` y `CODEX_NVM_DIR` estén bien configurados para tu contexto de ejecución.

### Seguridad al enlazar en LAN

`--host 0.0.0.0` es solo para redes de confianza. No lo expongas públicamente sin auth/TLS.

## Hoja de ruta

Dirección planificada y en progreso (ver `references/roadmap-blueprint.md` y documentos relacionados):

- Mejorar el bucle de automatización de artículos en múltiples pasos y flujos de reproducibilidad.
- Ampliar la fiabilidad y observabilidad de sesiones de Codex Bridge.
- Endurecer rutas de configuración de sandbox/runtime (variantes CPU/GPU).
- Mejorar controles de proyecto y ergonomía del editor.
- Continuar la documentación multilingüe y la alineación con el sitio web.

## Proyecto principal

- https://github.com/lachlanchen/the-art-of-lazying

## Enlaces del ecosistema

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

## Contribuir

Las contribuciones son bienvenidas.

- Abre un issue describiendo el problema/propuesta.
- Mantén los cambios enfocados y pequeños.
- Sigue el estilo de commits usado en este repositorio: `Add ...`, `Update ...`, `Expand ...`.
- Para cambios de frontend/UI, incluye capturas o GIFs en los PR.
- Si actualizas contenido del README, mantén alineadas todas las variantes de idioma (`README.*.md`).

Nota: las políticas de contribución de submódulos están definidas aguas arriba en sus propios repositorios (`codex/`, `overleaf/`).

## Licencia

El archivo de licencia a nivel de repositorio no está presente en la raíz del árbol actual.

- Suposición: este proyecto puede estar compartiéndose actualmente sin un archivo de licencia de nivel superior finalizado.
- Confirma la intención de licencia antes de redistribuir versiones modificadas sustanciales.
- Los submódulos tienen sus propias licencias upstream (por ejemplo, `overleaf/LICENSE`).

## Agradecimientos

- [Overleaf](https://github.com/overleaf/overleaf) por las ideas e infraestructura de plataforma colaborativa LaTeX.
- [OpenAI Codex CLI](https://github.com/openai/codex) por los flujos de terminal agénticos.
- El ecosistema más amplio de `the-art-of-lazying` por la visión de producto y la integración entre proyectos.


## ❤️ Support

| Donate | PayPal | Stripe |
| --- | --- | --- |
| [![Donate](https://camo.githubusercontent.com/24a4914f0b42c6f435f9e101621f1e52535b02c225764b2f6cc99416926004b7/68747470733a2f2f696d672e736869656c64732e696f2f62616467652f446f6e6174652d4c617a79696e674172742d3045413545393f7374796c653d666f722d7468652d6261646765266c6f676f3d6b6f2d6669266c6f676f436f6c6f723d7768697465)](https://chat.lazying.art/donate) | [![PayPal](https://camo.githubusercontent.com/d0f57e8b016517a4b06961b24d0ca87d62fdba16e18bbdb6aba28e978dc0ea21/68747470733a2f2f696d672e736869656c64732e696f2f62616467652f50617950616c2d526f6e677a686f754368656e2d3030343537433f7374796c653d666f722d7468652d6261646765266c6f676f3d70617970616c266c6f676f436f6c6f723d7768697465)](https://paypal.me/RongzhouChen) | [![Stripe](https://camo.githubusercontent.com/1152dfe04b6943afe3a8d2953676749603fb9f95e24088c92c97a01a897b4942/68747470733a2f2f696d672e736869656c64732e696f2f62616467652f5374726970652d446f6e6174652d3633354246463f7374796c653d666f722d7468652d6261646765266c6f676f3d737472697065266c6f676f436f6c6f723d7768697465)](https://buy.stripe.com/aFadR8gIaflgfQV6T4fw400) |
