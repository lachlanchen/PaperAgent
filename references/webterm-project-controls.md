# Web Terminal Project Controls

The PWA includes a left control panel with project and LaTeX actions. Each button sends a command to the terminal (right panel).

## What the buttons do

### Create Project + cd

It sends the following command into the terminal:

```
mkdir -p /home/<user>/Projects/<project>/{code,data,figures,latex/latex_figures,artifacts} && \
  cd /home/<user>/Projects/<project> && \
  pwd
```

You will see the output (`pwd`) in the terminal on the right panel.

### Init LaTeX

It creates a minimal `latex/main.tex` (if missing) and prepares the LaTeX folder:

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

## Defaults

- Container user: `paperagent`
- Project ID: `demo-paper`

You can edit these fields before clicking the button. Invalid characters are replaced with `_`.

## Notes

- This creates the folder structure **inside the container** (not on the host) unless you explicitly bind-mount that path.
- The terminal must be connected to the Docker container (see `webterm/docker-shell.sh`).
