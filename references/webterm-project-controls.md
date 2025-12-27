# Web Terminal Project Controls

The PWA includes a left control panel with project and LaTeX actions. Each button sends a command to the terminal (right panel). On reload, the app auto-checks whether the project path exists and `cd`s into it if found.

## What the buttons do

### Create Project + cd

It sends the following command into the terminal:

```
mkdir -p /home/<user>/Projects/<project>/{code,data,figures,latex/latex_figures,artifacts} && \
  cd /home/<user>/Projects/<project> && \
  pwd
```

You will see the output (`pwd`) in the terminal on the right panel.

### Go to Project

Checks if the project directory exists and `cd`s into it when present:

```
if [ -d /home/<user>/Projects/<project> ]; then
  cd /home/<user>/Projects/<project> && pwd
fi
```

If the directory exists, the **Create Project + cd** button is disabled to prevent overwriting.

### Init LaTeX

It creates a minimal `latex/main.tex` (if missing) and prepares the LaTeX folder. If it detects a broken header (like `\\documentclass`) or literal `\\n` sequences, it rewrites the file.

```
mkdir -p /home/<user>/Projects/<project>/latex/latex_figures && \
  if [ ! -f /home/<user>/Projects/<project>/latex/main.tex ]; then \
    printf '%s\n' "\\documentclass{article}" "\\usepackage{graphicx}" "\\begin{document}" "Hello PaperAgent." "\\end{document}" "" \
    > /home/<user>/Projects/<project>/latex/main.tex; \
  fi && \
  cd /home/<user>/Projects/<project>/latex && \
  ls -la && \
  pwd
```

### Compile LaTeX

It compiles `latex/main.tex` with `latexmk`:

```
mkdir -p /home/<user>/Projects/<project>/latex && \
  cd /home/<user>/Projects/<project>/latex && \
  latexmk -pdf -interaction=nonstopmode -halt-on-error main.tex && \
  ls -lh main.pdf && \
  pwd
```

The compile step uses `-g` to force a rebuild when you click it, even if
`latexmk` thinks outputs are up-to-date.

If a `*.sty` package is missing, the PWA will attempt to install dependencies
and re-run the compile. Example mapping:

- `siunitx.sty` -> `texlive-science`
- fallback -> `texlive-full`

### Install NVM + Codex

Runs a multi-line install script inside the container:

```
export NVM_DIR="$HOME/.nvm"
if [ ! -s "$NVM_DIR/nvm.sh" ]; then
  if ! command -v curl >/dev/null 2>&1; then apt-get update && apt-get install -y curl ca-certificates; fi
  curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
fi
. "$NVM_DIR/nvm.sh"
nvm install --lts
nvm use --lts
npm install -g @openai/codex
hash -r
command -v codex >/dev/null 2>&1 && codex --version || true
```

### Install CUDA Toolkit

Installs the Ubuntu CUDA toolkit inside the container (requires host NVIDIA driver + `--gpus all` at container start):

```
apt-get update
apt-get install -y nvidia-cuda-toolkit
nvcc --version
nvidia-smi
```

## PDF preview panel

The right panel loads the compiled PDF directly from the container. It fetches:

```
/api/pdf?user=<user>&project=<project>&file=main.pdf
```

Use **Refresh PDF** to re-fetch the file after compiling. The **Open** button opens the PDF in a new tab. You can change the PDF file name in the input (defaults to `main.pdf`).

## Editor panel

The bottom editor panel uses a Sublime-style CodeMirror editor. It loads and saves files inside the container through:

```
GET /api/file?user=<user>&project=<project>&path=latex/main.tex
POST /api/file
```

The **Watch** toggle polls every ~3s and reloads when it detects a newer mtime (unless you have unsaved edits).

## File tree

The editor includes a left file tree that lists files under `/home/<user>/Projects/<project>` (default depth 5). Click a file to load it into the editor.

## Codex Bridge

The Codex panel opens a direct WebSocket to `/codex/ws?session=<id>` and lets you:

- start a new session
- resume a session by ID
- send prompts without opening the interactive CLI

Default Codex args can be configured with:

```
CODEX_ARGS="-s danger-full-access -a never"
```

## Defaults

- Container user: `paperagent`
- Project ID: `demo-paper`

You can edit these fields before clicking the button. Invalid characters are replaced with `_`.

## Notes

- This creates the folder structure **inside the container** (not on the host) unless you explicitly bind-mount that path.
- The terminal must be connected to the Docker container (see `webterm/docker-shell.sh`).
