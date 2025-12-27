# Web Terminal Project Controls

The PWA now includes a left control panel with a **Create Project + cd** button. When clicked, it creates a container-only project layout and changes the terminal to that directory.

## What the button does

It sends the following command into the terminal:

```
mkdir -p /home/<user>/Projects/<project>/{code,data,figures,latex/latex_figures,artifacts} && \
  cd /home/<user>/Projects/<project> && \
  pwd
```

You will see the output (`pwd`) in the terminal on the right panel.

## Defaults

- Container user: `paperagent`
- Project ID: `demo-paper`

You can edit these fields before clicking the button. Invalid characters are replaced with `_`.

## Notes

- This creates the folder structure **inside the container** (not on the host) unless you explicitly bind-mount that path.
- The terminal must be connected to the Docker container (see `webterm/docker-shell.sh`).

