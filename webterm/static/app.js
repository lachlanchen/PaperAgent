(() => {
  const statusEl = document.getElementById("status");
  const reconnectBtn = document.getElementById("reconnect");
  const terminalEl = document.getElementById("terminal");
  const userInput = document.getElementById("userInput");
  const projectInput = document.getElementById("projectInput");
  const openProjectBtn = document.getElementById("openProject");
  const createProjectBtn = document.getElementById("createProject");
  const initLatexBtn = document.getElementById("initLatex");
  const compileLatexBtn = document.getElementById("compileLatex");
  const pathPreview = document.getElementById("pathPreview");
  const projectStatus = document.getElementById("projectStatus");
  const pdfFrame = document.getElementById("pdfFrame");
  const pdfFileInput = document.getElementById("pdfFile");
  const refreshPdfBtn = document.getElementById("refreshPdf");
  const openPdfLink = document.getElementById("openPdf");
  const pdfEmpty = document.getElementById("pdfEmpty");
  const pdfStatus = document.getElementById("pdfStatus");

  const DEFAULT_USER = "paperagent";
  const DEFAULT_PROJECT = "demo-paper";
  const PATH_EXISTS_MARKER = "__WEBTERM_PATH_EXISTS__";
  const PATH_MISSING_MARKER = "__WEBTERM_PATH_MISSING__";
  const PDF_NAME_RE = /^[a-zA-Z0-9._-]+\.pdf$/i;

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
  let pdfRefreshTimer = null;
  let devMode = false;
  let pdfObjectUrl = null;

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

  function sanitizePdfName(value, fallback) {
    const trimmed = String(value || "").trim();
    if (!trimmed) {
      return fallback;
    }
    const cleaned = trimmed.replace(/[^a-zA-Z0-9._-]/g, "");
    if (!cleaned) {
      return fallback;
    }
    const withExt = /\.pdf$/i.test(cleaned) ? cleaned : `${cleaned}.pdf`;
    return PDF_NAME_RE.test(withExt) ? withExt : fallback;
  }

  function buildPdfUrl({ user, project, file }) {
    const params = new URLSearchParams({
      user,
      project,
      file,
    });
    return `/api/pdf?${params.toString()}`;
  }

  function buildLatexInitCommand(basePath) {
    const latexDir = `${basePath}/latex`;
    const texPath = `${latexDir}/main.tex`;
    const latexLines = [
      "\\documentclass{article}",
      "\\usepackage{graphicx}",
      "\\begin{document}",
      "Hello PaperAgent.",
      "\\end{document}",
      "",
    ];
    const printfArgs = latexLines
      .map((line) => `'${line.replace(/'/g, "'\\\\''")}'`)
      .join(" ");

    return [
      `mkdir -p ${latexDir}/latex_figures`,
      `if [ ! -f ${texPath} ] || grep -q '^\\\\\\\\documentclass' ${texPath} || grep -q '\\\\n' ${texPath}; then printf '%s\\n' ${printfArgs} > ${texPath}; fi`,
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

  function setProjectStatus(state) {
    if (!projectStatus || !createProjectBtn) {
      return;
    }
    projectStatus.classList.remove("exists", "missing");
    if (state === "exists") {
      projectStatus.textContent = "Status: exists";
      projectStatus.classList.add("exists");
      createProjectBtn.disabled = true;
      return;
    }
    if (state === "missing") {
      projectStatus.textContent = "Status: missing";
      projectStatus.classList.add("missing");
      createProjectBtn.disabled = false;
      return;
    }
    projectStatus.textContent = "Status: unknown";
    createProjectBtn.disabled = false;
  }

  function setPdfStatus(text, state) {
    if (!pdfStatus) {
      return;
    }
    pdfStatus.textContent = text;
    pdfStatus.classList.remove("ready", "missing", "loading");
    if (state) {
      pdfStatus.classList.add(state);
    }
  }

  function setPdfEmpty(visible, message) {
    if (!pdfEmpty) {
      return;
    }
    if (message) {
      pdfEmpty.textContent = message;
    }
    pdfEmpty.style.display = visible ? "flex" : "none";
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

  function autoCdOnConnect() {
    const { path } = buildBasePath();
    const command = buildCheckCdCommand(path, true);
    sendCommand(`${command}\n`);
  }

  async function loadPdfPreview() {
    if (!pdfFrame) {
      return;
    }
    const { user, project } = buildBasePath();
    const fallbackName = "main.pdf";
    const file = sanitizePdfName(pdfFileInput ? pdfFileInput.value : fallbackName, fallbackName);
    if (pdfFileInput) {
      pdfFileInput.value = file;
    }
    const baseUrl = buildPdfUrl({ user, project, file });
    const freshUrl = `${baseUrl}&t=${Date.now()}`;
    if (openPdfLink) {
      openPdfLink.href = freshUrl;
    }
    setPdfStatus("Status: loading", "loading");
    try {
      const response = await fetch(freshUrl, { cache: "no-store" });
      if (!response.ok) {
        throw new Error("missing");
      }
      const blob = await response.blob();
      if (pdfObjectUrl) {
        URL.revokeObjectURL(pdfObjectUrl);
      }
      pdfObjectUrl = URL.createObjectURL(blob);
      pdfFrame.src = pdfObjectUrl;
      setPdfEmpty(false);
      setPdfStatus(`Status: ready (${file})`, "ready");
    } catch (err) {
      if (pdfObjectUrl) {
        URL.revokeObjectURL(pdfObjectUrl);
        pdfObjectUrl = null;
      }
      pdfFrame.removeAttribute("src");
      setPdfEmpty(true, "No PDF found yet. Compile LaTeX to generate one.");
      setPdfStatus(`Status: missing (${file})`, "missing");
    }
  }

  function schedulePdfRefresh(delay = 0) {
    clearTimeout(pdfRefreshTimer);
    pdfRefreshTimer = setTimeout(() => {
      loadPdfPreview();
    }, delay);
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
      autoCdOnConnect();
      schedulePdfRefresh(300);
    });

    socket.addEventListener("message", (event) => {
      const data = String(event.data);
      let output = data;
      if (output.includes(PATH_EXISTS_MARKER)) {
        setProjectStatus("exists");
        output = output.replace(PATH_EXISTS_MARKER, "");
      }
      if (output.includes(PATH_MISSING_MARKER)) {
        setProjectStatus("missing");
        output = output.replace(PATH_MISSING_MARKER, "");
      }
      if (output) {
        term.write(output);
      }
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

  async function disableServiceWorkerCache() {
    if (!("serviceWorker" in navigator)) {
      return;
    }
    const registrations = await navigator.serviceWorker.getRegistrations();
    await Promise.all(registrations.map((reg) => reg.unregister()));
  }

  async function maybeStartDevReload() {
    const url = "/__dev__/version";
    try {
      const response = await fetch(url, { cache: "no-store" });
      if (!response.ok) {
        return;
      }
      const payload = await response.json();
      let lastVersion = payload.version;
      devMode = true;
      await disableServiceWorkerCache();
      setInterval(async () => {
        try {
          const check = await fetch(url, { cache: "no-store" });
          if (!check.ok) {
            return;
          }
          const next = await check.json();
          if (next.version !== lastVersion) {
            location.reload();
          }
        } catch (err) {
          // ignore
        }
      }, 1500);
    } catch (err) {
      // ignore
    }
  }

  function buildCheckCdCommand(basePath, shouldCd) {
    const cdPart = shouldCd ? `cd ${basePath} && pwd` : "true";
    return [
      `if [ -d ${basePath} ]; then`,
      `echo "${PATH_EXISTS_MARKER}";`,
      `${cdPart};`,
      "else",
      `echo "${PATH_MISSING_MARKER}";`,
      "fi",
    ].join(" ");
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
      schedulePdfRefresh(800);
    });
  }

  if (openProjectBtn) {
    openProjectBtn.addEventListener("click", () => {
      const { user, project, path } = buildBasePath();
      userInput.value = user;
      projectInput.value = project;
      updatePathPreview();

      const command = buildCheckCdCommand(path, true);
      sendCommand(`${command}\n`);
      term.focus();
      schedulePdfRefresh(400);
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
      schedulePdfRefresh(600);
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
      schedulePdfRefresh(1500);
    });
  }

  if (refreshPdfBtn) {
    refreshPdfBtn.addEventListener("click", () => {
      schedulePdfRefresh(0);
    });
  }

  if (pdfFileInput) {
    pdfFileInput.addEventListener("input", () => {
      schedulePdfRefresh(400);
    });
  }

  if (userInput && projectInput) {
    userInput.addEventListener("input", () => {
      updatePathPreview();
      setProjectStatus("unknown");
      schedulePdfRefresh(500);
    });
    projectInput.addEventListener("input", () => {
      updatePathPreview();
      setProjectStatus("unknown");
      schedulePdfRefresh(500);
    });
  }

  updatePathPreview();
  setProjectStatus("unknown");
  setPdfStatus("Status: idle");
  fitAddon.fit();
  connect();
  maybeStartDevReload().finally(() => {
    if (devMode) {
      return;
    }
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {
        // offline or blocked; ignore
      });
    }
  });
})();
