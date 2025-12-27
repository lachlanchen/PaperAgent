(() => {
  const statusEl = document.getElementById("status");
  const reconnectBtn = document.getElementById("reconnect");
  const terminalEl = document.getElementById("terminal");
  const userInput = document.getElementById("userInput");
  const projectInput = document.getElementById("projectInput");
  const createProjectBtn = document.getElementById("createProject");
  const initLatexBtn = document.getElementById("initLatex");
  const compileLatexBtn = document.getElementById("compileLatex");
  const pathPreview = document.getElementById("pathPreview");

  const DEFAULT_USER = "paperagent";
  const DEFAULT_PROJECT = "demo-paper";

  const term = new Terminal({
    cursorBlink: true,
    fontFamily: "JetBrains Mono, monospace",
    fontSize: 14,
    theme: {
      background: "#0f1419",
      foreground: "#e5e7eb",
      cursor: "#9ae6b4",
      selectionBackground: "#1f2937",
    },
  });

  const fitAddon = new FitAddon.FitAddon();
  term.loadAddon(fitAddon);
  term.open(terminalEl);

  let socket = null;
  let resizeTimer = null;

  function sanitizeSegment(value, fallback) {
    const trimmed = String(value || "").trim();
    const safe = trimmed.replace(/[^a-zA-Z0-9._-]/g, "_");
    return safe || fallback;
  }

  function buildBasePath() {
    const user = sanitizeSegment(userInput.value, DEFAULT_USER);
    const project = sanitizeSegment(projectInput.value, DEFAULT_PROJECT);
    return { user, project, path: `/home/${user}/Projects/${project}` };
  }

  function buildLatexInitCommand(basePath) {
    const latexDir = `${basePath}/latex`;
    const texPath = `${latexDir}/main.tex`;
    const latexLines = [
      "\\\\documentclass{article}",
      "\\\\usepackage{graphicx}",
      "\\\\begin{document}",
      "Hello PaperAgent.",
      "\\\\end{document}",
      "",
    ];
    const printfArgs = latexLines
      .map((line) => `'${line.replace(/'/g, "'\\\\''")}'`)
      .join(" ");

    return [
      `mkdir -p ${latexDir}/latex_figures`,
      `if [ ! -f ${texPath} ]; then printf '%s\\\\n' ${printfArgs} > ${texPath}; fi`,
      `cd ${latexDir}`,
      "ls -la",
      "pwd",
    ].join(" && ");
  }

  function buildLatexCompileCommand(basePath) {
    const latexDir = `${basePath}/latex`;
    return [
      `mkdir -p ${latexDir}`,
      `cd ${latexDir}`,
      "latexmk -pdf -interaction=nonstopmode -halt-on-error main.tex",
      "ls -lh main.pdf",
      "pwd",
    ].join(" && ");
  }

  function updatePathPreview() {
    if (!pathPreview) {
      return;
    }
    const { path } = buildBasePath();
    pathPreview.textContent = path;
  }

  function setStatus(text, online) {
    statusEl.textContent = text;
    statusEl.classList.toggle("online", Boolean(online));
  }

  function sendResize() {
    if (!socket || socket.readyState !== WebSocket.OPEN) {
      return;
    }
    fitAddon.fit();
    const { cols, rows } = term;
    socket.send(JSON.stringify({ type: "resize", cols, rows }));
  }

  function connect() {
    if (socket && socket.readyState === WebSocket.OPEN) {
      return;
    }
    setStatus("connecting", false);
    const protocol = location.protocol === "https:" ? "wss" : "ws";
    const wsUrl = `${protocol}://${location.host}/ws`;
    socket = new WebSocket(wsUrl);

    socket.addEventListener("open", () => {
      setStatus("connected", true);
      term.focus();
      sendResize();
    });

    socket.addEventListener("message", (event) => {
      term.write(event.data);
    });

    socket.addEventListener("close", () => {
      setStatus("disconnected", false);
    });

    socket.addEventListener("error", () => {
      setStatus("error", false);
    });
  }

  function sendCommand(command) {
    if (!socket || socket.readyState !== WebSocket.OPEN) {
      term.writeln("");
      term.writeln("[webterm] Not connected.");
      return;
    }
    socket.send(command);
  }

  term.onData((data) => {
    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.send(data);
    }
  });

  window.addEventListener("resize", () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(sendResize, 150);
  });

  reconnectBtn.addEventListener("click", () => {
    if (socket) {
      try {
        socket.close();
      } catch (err) {
        // no-op
      }
    }
    connect();
  });

  if (createProjectBtn) {
    createProjectBtn.addEventListener("click", () => {
      const { user, project, path } = buildBasePath();
      userInput.value = user;
      projectInput.value = project;
      updatePathPreview();

      const command = [
        `mkdir -p ${path}/{code,data,figures,latex/latex_figures,artifacts}`,
        `cd ${path}`,
        "pwd",
      ].join(" && ");

      sendCommand(`${command}\n`);
      term.focus();
    });
  }

  if (initLatexBtn) {
    initLatexBtn.addEventListener("click", () => {
      const { user, project, path } = buildBasePath();
      userInput.value = user;
      projectInput.value = project;
      updatePathPreview();

      const command = buildLatexInitCommand(path);
      sendCommand(`${command}\n`);
      term.focus();
    });
  }

  if (compileLatexBtn) {
    compileLatexBtn.addEventListener("click", () => {
      const { user, project, path } = buildBasePath();
      userInput.value = user;
      projectInput.value = project;
      updatePathPreview();

      const command = buildLatexCompileCommand(path);
      sendCommand(`${command}\n`);
      term.focus();
    });
  }

  if (userInput && projectInput) {
    userInput.addEventListener("input", updatePathPreview);
    projectInput.addEventListener("input", updatePathPreview);
  }

  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("/sw.js").catch(() => {
      // offline or blocked; ignore
    });
  }

  updatePathPreview();
  fitAddon.fit();
  connect();
})();
