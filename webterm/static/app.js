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
  const installCodexBtn = document.getElementById("installCodex");
  const installCudaBtn = document.getElementById("installCuda");
  const pathPreview = document.getElementById("pathPreview");
  const projectStatus = document.getElementById("projectStatus");
  const pdfFrame = document.getElementById("pdfFrame");
  const pdfFileInput = document.getElementById("pdfFile");
  const refreshPdfBtn = document.getElementById("refreshPdf");
  const openPdfLink = document.getElementById("openPdf");
  const pdfEmpty = document.getElementById("pdfEmpty");
  const pdfStatus = document.getElementById("pdfStatus");
  const editorPathInput = document.getElementById("editorPath");
  const editorTextArea = document.getElementById("editorText");
  const loadFileBtn = document.getElementById("loadFile");
  const saveFileBtn = document.getElementById("saveFile");
  const editorStatus = document.getElementById("editorStatus");
  const watchFileToggle = document.getElementById("watchFile");
  const fileTreeEl = document.getElementById("fileTree");
  const refreshTreeBtn = document.getElementById("refreshTree");
  const fileTreeStatus = document.getElementById("fileTreeStatus");

  const DEFAULT_USER = "paperagent";
  const DEFAULT_PROJECT = "demo-paper";
  const PATH_EXISTS_MARKER = "__WEBTERM_PATH_EXISTS__";
  const PATH_MISSING_MARKER = "__WEBTERM_PATH_MISSING__";
  const PDF_NAME_RE = /^[a-zA-Z0-9._-]+\.pdf$/i;
  const DEFAULT_EDITOR_FILE = "latex/main.tex";
  const DEFAULT_TREE_DEPTH = 5;

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
  let editor = null;
  let editorDirty = false;
  let editorPollTimer = null;
  let editorLoadTimer = null;
  let lastRemoteMtime = null;
  let editorLoading = false;
  let activeTreePath = null;
  let treeLoadTimer = null;

  function sanitizeSegment(value, fallback) {
    const trimmed = String(value || "").trim();
    const safe = trimmed.replace(/[^a-zA-Z0-9._-]/g, "_");
    return safe || fallback;
  }

  function sanitizeRelPath(value, fallback) {
    const trimmed = String(value || "").trim().replace(/^\/+/, "");
    if (!trimmed) {
      return fallback;
    }
    const parts = trimmed.split("/").filter(Boolean);
    if (!parts.length) {
      return fallback;
    }
    const cleaned = [];
    for (const part of parts) {
      if (part === "." || part === "..") {
        return fallback;
      }
      const safe = part.replace(/[^a-zA-Z0-9._-]/g, "_");
      if (!safe || safe === "." || safe === "..") {
        return fallback;
      }
      cleaned.push(safe);
    }
    return cleaned.join("/");
  }

  function pickEditorMode(relPath) {
    if (!relPath) {
      return null;
    }
    const lower = relPath.toLowerCase();
    if (lower.endsWith(".tex") || lower.endsWith(".sty") || lower.endsWith(".cls")) {
      return "stex";
    }
    if (lower.endsWith(".py")) {
      return "python";
    }
    if (lower.endsWith(".md")) {
      return "markdown";
    }
    if (lower.endsWith(".json")) {
      return { name: "javascript", json: true };
    }
    if (lower.endsWith(".js")) {
      return "javascript";
    }
    return null;
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

  function buildTreeUrl({ user, project, depth }) {
    const params = new URLSearchParams({
      user,
      project,
      depth: String(depth),
    });
    return `/api/tree?${params.toString()}`;
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
    const latexmkCmd =
      "latexmk -pdf -interaction=nonstopmode -halt-on-error -g main.tex";
    const missingPattern = "File \\`[^']+\\.sty' not found";
    const missingExtract =
      "grep -oE \"File \\`[^']+\\.sty' not found\" main.log | head -n1 | sed \"s/.*\\`//; s/' not found//\"";
    return [
      `mkdir -p ${latexDir}`,
      `cd ${latexDir}`,
      'if command -v sudo >/dev/null 2>&1; then SUDO=sudo; else SUDO=""; fi',
      `if ! ${latexmkCmd}; then`,
      `  if [ -f main.log ] && grep -Eq "${missingPattern}" main.log; then`,
      `    missing=$(${missingExtract})`,
      '    echo "[webterm] Missing LaTeX package: $missing"',
      '    if command -v apt-get >/dev/null 2>&1; then',
      '      case "$missing" in',
      '        siunitx.sty) pkg="texlive-science" ;;',
      '        *) pkg="texlive-full" ;;',
      "      esac",
      '      echo "[webterm] Installing $pkg..."',
      '      $SUDO apt-get update && $SUDO apt-get install -y "$pkg"',
      `      if ! ${latexmkCmd}; then exit 1; fi`,
      "    else",
      '      echo "[webterm] apt-get not available; install TeX packages manually."',
      "      exit 1",
      "    fi",
      "  else",
      "    exit 1",
      "  fi",
      "fi",
      "ls -lh main.pdf",
      "pwd",
    ].join("\n");
  }

  function buildCodexInstallCommand() {
    return [
      'export NVM_DIR="$HOME/.nvm"',
      'if [ ! -s "$NVM_DIR/nvm.sh" ]; then',
      '  if ! command -v curl >/dev/null 2>&1; then apt-get update && apt-get install -y curl ca-certificates; fi',
      '  curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash',
      "fi",
      '. "$NVM_DIR/nvm.sh"',
      "nvm install --lts",
      "nvm use --lts",
      "npm install -g @openai/codex",
      "hash -r",
      "command -v codex >/dev/null 2>&1 && codex --version || true",
    ].join("\n");
  }

  function buildCudaInstallCommand() {
    return [
      'if ! command -v apt-get >/dev/null 2>&1; then echo "apt-get not found"; exit 1; fi',
      'if command -v sudo >/dev/null 2>&1; then SUDO=sudo; else SUDO=""; fi',
      '$SUDO apt-get update',
      '$SUDO apt-get install -y nvidia-cuda-toolkit',
      "nvcc --version || true",
      "nvidia-smi || true",
    ].join("\n");
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

  function setEditorStatus(text, state) {
    if (!editorStatus) {
      return;
    }
    editorStatus.textContent = text;
    editorStatus.classList.remove("ready", "dirty", "error", "loading");
    if (state) {
      editorStatus.classList.add(state);
    }
  }

  function setTreeStatus(text, state) {
    if (!fileTreeStatus) {
      return;
    }
    fileTreeStatus.textContent = text;
    fileTreeStatus.classList.remove("ready", "loading", "error");
    if (state) {
      fileTreeStatus.classList.add(state);
    }
  }

  function setActiveTreePath(path) {
    activeTreePath = path;
    if (!fileTreeEl) {
      return;
    }
    const active = fileTreeEl.querySelector(".tree-file.active");
    if (active && active.dataset.path !== path) {
      active.classList.remove("active");
    }
    if (path) {
      const target = fileTreeEl.querySelector(`.tree-file[data-path="${path}"]`);
      if (target) {
        target.classList.add("active");
      }
    }
  }

  function buildTree(entries) {
    const root = { name: "", type: "dir", children: new Map() };
    (entries || []).forEach((entry) => {
      if (!entry || !entry.path) {
        return;
      }
      const parts = entry.path.split("/").filter(Boolean);
      if (!parts.length) {
        return;
      }
      let node = root;
      parts.forEach((part, index) => {
        if (!node.children.has(part)) {
          node.children.set(part, {
            name: part,
            type: "dir",
            children: new Map(),
          });
        }
        node = node.children.get(part);
        if (index === parts.length - 1) {
          node.type = entry.type === "dir" ? "dir" : "file";
        }
      });
    });
    return root;
  }

  function sortTreeEntries(entries) {
    return entries.sort((a, b) => {
      if (a.type !== b.type) {
        return a.type === "dir" ? -1 : 1;
      }
      return a.name.localeCompare(b.name);
    });
  }

  function renderTreeNode(node, container, depth, prefix) {
    const items = sortTreeEntries(Array.from(node.children.values()));
    items.forEach((item) => {
      const fullPath = prefix ? `${prefix}/${item.name}` : item.name;
      if (item.type === "dir") {
        const details = document.createElement("details");
        details.className = "tree-dir";
        details.open = depth < 2;
        const summary = document.createElement("summary");
        summary.textContent = item.name;
        details.appendChild(summary);
        const children = document.createElement("div");
        children.className = "tree-children";
        details.appendChild(children);
        renderTreeNode(item, children, depth + 1, fullPath);
        container.appendChild(details);
      } else {
        const button = document.createElement("button");
        button.type = "button";
        button.className = "tree-file";
        button.dataset.path = fullPath;
        button.textContent = item.name;
        if (activeTreePath === fullPath) {
          button.classList.add("active");
        }
        container.appendChild(button);
      }
    });
  }

  function renderFileTree(entries) {
    if (!fileTreeEl) {
      return;
    }
    fileTreeEl.innerHTML = "";
    const tree = buildTree(entries);
    renderTreeNode(tree, fileTreeEl, 0, "");
  }
  function setEditorDirty(isDirty) {
    editorDirty = isDirty;
    if (editorDirty) {
      setEditorStatus("Status: modified (unsaved)", "dirty");
    }
  }

  function ensureEditor() {
    if (!editorTextArea || editor) {
      return;
    }
    if (!window.CodeMirror) {
      setEditorStatus("Status: CodeMirror missing", "error");
      return;
    }
    editor = window.CodeMirror.fromTextArea(editorTextArea, {
      lineNumbers: true,
      lineWrapping: true,
      theme: "material-darker",
      indentUnit: 2,
      tabSize: 2,
      styleActiveLine: true,
      matchBrackets: true,
      autoCloseBrackets: true,
    });
    editor.on("change", () => {
      if (editorLoading) {
        return;
      }
      setEditorDirty(true);
    });
  }

  function getEditorValue() {
    if (editor) {
      return editor.getValue();
    }
    return editorTextArea ? editorTextArea.value : "";
  }

  function setEditorValue(content) {
    if (editor) {
      editor.setValue(content);
    } else if (editorTextArea) {
      editorTextArea.value = content;
    }
  }

  function setEditorMode(path) {
    if (!editor) {
      return;
    }
    const mode = pickEditorMode(path);
    if (mode) {
      editor.setOption("mode", mode);
    } else {
      editor.setOption("mode", null);
    }
  }

  function buildFileApiUrl({ user, project, path, meta }) {
    const params = new URLSearchParams({
      user,
      project,
      path,
    });
    if (meta) {
      params.set("meta", "1");
    }
    return `/api/file?${params.toString()}`;
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

  async function loadEditorFile({ silent } = {}) {
    if (!editorPathInput) {
      return;
    }
    ensureEditor();
    const { user, project } = buildBasePath();
    const relPath = sanitizeRelPath(editorPathInput.value, DEFAULT_EDITOR_FILE);
    editorPathInput.value = relPath;
    setEditorStatus("Status: loading", "loading");
    try {
      const url = buildFileApiUrl({ user, project, path: relPath });
      const response = await fetch(url, { cache: "no-store" });
      if (!response.ok) {
        throw new Error("missing");
      }
      const payload = await response.json();
      editorLoading = true;
      setEditorValue(payload.content || "");
      setEditorMode(relPath);
      if (editor) {
        editor.refresh();
      }
      editorDirty = false;
      lastRemoteMtime = payload.mtime || null;
      setEditorStatus(`Status: loaded (${relPath})`, "ready");
      setActiveTreePath(relPath);
      editorLoading = false;
    } catch (err) {
      editorLoading = false;
      if (!silent) {
        setEditorStatus(`Status: missing (${relPath})`, "error");
      }
    }
  }

  async function saveEditorFile() {
    if (!editorPathInput) {
      return;
    }
    ensureEditor();
    const { user, project } = buildBasePath();
    const relPath = sanitizeRelPath(editorPathInput.value, DEFAULT_EDITOR_FILE);
    editorPathInput.value = relPath;
    setEditorStatus("Status: saving", "loading");
    try {
      const response = await fetch("/api/file", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user,
          project,
          path: relPath,
          content: getEditorValue(),
        }),
      });
      if (!response.ok) {
        throw new Error("save failed");
      }
      const payload = await response.json();
      editorDirty = false;
      lastRemoteMtime = payload.mtime || null;
      setEditorStatus(`Status: saved (${relPath})`, "ready");
      setActiveTreePath(relPath);
      loadFileTree({ silent: true });
      if (relPath.toLowerCase().endsWith(".tex")) {
        schedulePdfRefresh(1200);
      }
    } catch (err) {
      setEditorStatus("Status: save failed", "error");
    }
  }

  async function pollEditorFile() {
    if (!watchFileToggle || !watchFileToggle.checked || !editorPathInput) {
      return;
    }
    const { user, project } = buildBasePath();
    const relPath = sanitizeRelPath(editorPathInput.value, DEFAULT_EDITOR_FILE);
    const url = buildFileApiUrl({ user, project, path: relPath, meta: true });
    try {
      const response = await fetch(url, { cache: "no-store" });
      if (!response.ok) {
        return;
      }
      const payload = await response.json();
      if (!payload.mtime) {
        return;
      }
      if (lastRemoteMtime && payload.mtime > lastRemoteMtime) {
        if (editorDirty) {
          setEditorStatus("Status: remote change detected", "dirty");
        } else {
          await loadEditorFile({ silent: true });
        }
      }
    } catch (err) {
      // ignore
    }
  }

  function startEditorWatch() {
    clearInterval(editorPollTimer);
    if (!watchFileToggle || !watchFileToggle.checked) {
      return;
    }
    editorPollTimer = setInterval(() => {
      pollEditorFile();
    }, 3000);
  }

  function scheduleEditorLoad(delay = 0) {
    clearTimeout(editorLoadTimer);
    editorLoadTimer = setTimeout(() => {
      loadEditorFile({ silent: true });
    }, delay);
  }

  function scheduleTreeLoad(delay = 0) {
    clearTimeout(treeLoadTimer);
    treeLoadTimer = setTimeout(() => {
      loadFileTree({ silent: true });
    }, delay);
  }

  async function loadFileTree({ silent } = {}) {
    if (!fileTreeEl) {
      return;
    }
    const { user, project } = buildBasePath();
    if (!silent) {
      setTreeStatus("Status: loading", "loading");
    }
    try {
      const url = buildTreeUrl({
        user,
        project,
        depth: DEFAULT_TREE_DEPTH,
      });
      const response = await fetch(url, { cache: "no-store" });
      if (!response.ok) {
        throw new Error("missing");
      }
      const payload = await response.json();
      renderFileTree(payload.entries || []);
      setTreeStatus(
        `Status: ${payload.entries?.length || 0} items`,
        "ready"
      );
    } catch (err) {
      if (!silent) {
        setTreeStatus("Status: project not found", "error");
      }
    }
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
      scheduleTreeLoad(400);
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
      scheduleTreeLoad(800);
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
      scheduleTreeLoad(400);
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
      scheduleTreeLoad(600);
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
      scheduleTreeLoad(1200);
    });
  }

  if (installCodexBtn) {
    installCodexBtn.addEventListener("click", () => {
      const command = buildCodexInstallCommand();
      sendCommand(`${command}\n`);
      term.focus();
    });
  }

  if (installCudaBtn) {
    installCudaBtn.addEventListener("click", () => {
      const command = buildCudaInstallCommand();
      sendCommand(`${command}\n`);
      term.focus();
    });
  }

  if (loadFileBtn) {
    loadFileBtn.addEventListener("click", () => {
      loadEditorFile();
    });
  }

  if (saveFileBtn) {
    saveFileBtn.addEventListener("click", () => {
      saveEditorFile();
    });
  }

  if (editorPathInput) {
    editorPathInput.addEventListener("change", () => {
      const nextPath = sanitizeRelPath(
        editorPathInput.value,
        DEFAULT_EDITOR_FILE
      );
      editorPathInput.value = nextPath;
      setActiveTreePath(nextPath);
      scheduleEditorLoad(200);
    });
  }

  if (fileTreeEl) {
    fileTreeEl.addEventListener("click", (event) => {
      const target = event.target.closest(".tree-file");
      if (!target) {
        return;
      }
      const nextPath = sanitizeRelPath(
        target.dataset.path,
        DEFAULT_EDITOR_FILE
      );
      if (!nextPath) {
        return;
      }
      if (editorPathInput) {
        editorPathInput.value = nextPath;
      }
      setActiveTreePath(nextPath);
      loadEditorFile();
    });
  }

  if (refreshTreeBtn) {
    refreshTreeBtn.addEventListener("click", () => {
      loadFileTree();
    });
  }

  if (watchFileToggle) {
    watchFileToggle.addEventListener("change", () => {
      startEditorWatch();
    });
  }

  document.addEventListener("keydown", (event) => {
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "s") {
      event.preventDefault();
      saveEditorFile();
    }
  });

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
      scheduleEditorLoad(700);
      scheduleTreeLoad(800);
      setActiveTreePath(null);
    });
    projectInput.addEventListener("input", () => {
      updatePathPreview();
      setProjectStatus("unknown");
      schedulePdfRefresh(500);
      scheduleEditorLoad(700);
      scheduleTreeLoad(800);
      setActiveTreePath(null);
    });
  }

  updatePathPreview();
  setProjectStatus("unknown");
  setPdfStatus("Status: idle");
  setEditorStatus("Status: idle");
  setTreeStatus("Status: idle");
  fitAddon.fit();
  ensureEditor();
  connect();
  scheduleEditorLoad(400);
  startEditorWatch();
  loadFileTree({ silent: true });
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
