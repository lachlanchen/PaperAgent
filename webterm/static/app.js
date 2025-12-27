(() => {
  const statusEl = document.getElementById("status");
  const reconnectBtn = document.getElementById("reconnect");
  const terminalEl = document.getElementById("terminal");
  const userInput = document.getElementById("userInput");
  const projectInput = document.getElementById("projectInput");
  const sshKeyLabelInput = document.getElementById("sshKeyLabel");
  const sshKeyOutput = document.getElementById("sshKeyOutput");
  const gitRemoteInput = document.getElementById("gitRemote");
  const openProjectBtn = document.getElementById("openProject");
  const createProjectBtn = document.getElementById("createProject");
  const initLatexBtn = document.getElementById("initLatex");
  const compileLatexBtn = document.getElementById("compileLatex");
  const initGitBtn = document.getElementById("initGit");
  const generateSshKeyBtn = document.getElementById("generateSshKey");
  const setSshConfigBtn = document.getElementById("setSshConfig");
  const setGitRemoteBtn = document.getElementById("setGitRemote");
  const testGitRemoteBtn = document.getElementById("testGitRemote");
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
  const codexSessionInput = document.getElementById("codexSession");
  const codexSessionList = document.getElementById("codexSessionList");
  const codexNewBtn = document.getElementById("codexNew");
  const codexResumeBtn = document.getElementById("codexResume");
  const codexStopBtn = document.getElementById("codexStop");
  const codexInitBtn = document.getElementById("codexInit");
  const codexOutput = document.getElementById("codexOutput");
  const codexPrompt = document.getElementById("codexPrompt");
  const codexSendBtn = document.getElementById("codexSend");
  const codexStatus = document.getElementById("codexStatus");

  const DEFAULT_USER = "paperagent";
  const DEFAULT_PROJECT = "demo-paper";
  const PATH_EXISTS_MARKER = "__WEBTERM_PATH_EXISTS__";
  const PATH_MISSING_MARKER = "__WEBTERM_PATH_MISSING__";
  const PDF_NAME_RE = /^[a-zA-Z0-9._-]+\.pdf$/i;
  const DEFAULT_EDITOR_FILE = "latex/main.tex";
  const DEFAULT_TREE_DEPTH = 5;
  const CODEX_SESSION_KEY = "paperagent.codex.session";
  const CODEX_OUTPUT_LIMIT = 60000;
  const CODEX_SESSIONS_REFRESH_MS = 8000;
  const PROJECT_REMOTE_PREFIX = "paperagent.project.remote";

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
  let codexSocket = null;
  let codexTerm = null;
  let codexFitAddon = null;
  let codexSessionsTimer = null;
  let codexStatusBase = "Status: idle";
  let codexStatusClass = "";
  let codexRunState = "";
  let codexOutputBuffer = "";
  let projectRemoteTimer = null;
  let gitRemoteDirty = false;

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

  function sanitizeKeyLabel(value, fallback) {
    const trimmed = String(value || "").trim();
    if (!trimmed) {
      return fallback;
    }
    return trimmed.replace(/[^a-zA-Z0-9@._+-]/g, "_") || fallback;
  }

  function sanitizeGitRemote(value) {
    const trimmed = String(value || "").trim();
    if (!trimmed) {
      return "";
    }
    return trimmed.replace(/[^a-zA-Z0-9@._:/+-]/g, "_");
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

  function buildSshKeyUrl(user) {
    const params = new URLSearchParams({
      user,
    });
    return `/api/ssh-key?${params.toString()}`;
  }

  function buildProjectUrl({ user, project }) {
    const params = new URLSearchParams({
      user,
      project,
    });
    return `/api/project?${params.toString()}`;
  }

  function buildCodexSessionsUrl({ user, project }) {
    const params = new URLSearchParams();
    if (user) {
      params.set("user", user);
    }
    if (project) {
      params.set("project", project);
    }
    return `/api/codex/sessions?${params.toString()}`;
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

  function buildGitInitCommand(basePath) {
    return [
      'if command -v sudo >/dev/null 2>&1; then SUDO=sudo; else SUDO=""; fi',
      'if ! command -v git >/dev/null 2>&1; then',
      '  if ! command -v apt-get >/dev/null 2>&1; then echo "apt-get not found"; exit 1; fi',
      '  $SUDO apt-get update && $SUDO apt-get install -y git',
      "fi",
      `mkdir -p ${basePath}`,
      `cd ${basePath}`,
      'if [ ! -d ".git" ]; then git init -b main; else git branch -M main; fi',
      "git status -sb",
      "pwd",
    ].join("\n");
  }

  function buildSshKeyCommand(user, label) {
    const safeLabel = sanitizeKeyLabel(label, `${user}@paperagent`);
    const keyName = sanitizeSegment(`${user}_paperagent_ed25519`, "paperagent_ed25519");
    const keyDir = `/home/${user}/.ssh`;
    const keyPath = `${keyDir}/${keyName}`;
    const configPath = `${keyDir}/config`;
    return [
      'if command -v sudo >/dev/null 2>&1; then SUDO=sudo; else SUDO=""; fi',
      'if ! command -v ssh-keygen >/dev/null 2>&1; then',
      '  if ! command -v apt-get >/dev/null 2>&1; then echo "apt-get not found"; exit 1; fi',
      '  $SUDO apt-get update && $SUDO apt-get install -y openssh-client',
      "fi",
      `mkdir -p ${keyDir}`,
      `chmod 700 ${keyDir}`,
      `if [ ! -f ${keyPath} ]; then ssh-keygen -t ed25519 -C "${safeLabel}" -f ${keyPath} -N ""; fi`,
      `if [ ! -f ${configPath} ] || ! grep -q "^Host github.com" ${configPath}; then`,
      `  printf '%s\\n' "Host github.com" "  HostName github.com" "  User git" "  IdentityFile ${keyPath}" "  IdentitiesOnly yes" >> ${configPath}`,
      "fi",
      `chmod 600 ${configPath} || true`,
      `chmod 600 ${keyPath} || true`,
      `chmod 644 ${keyPath}.pub || true`,
      `if id -u ${user} >/dev/null 2>&1; then chown -R ${user}:${user} ${keyDir}; fi`,
      'echo "[webterm] Public key:"',
      `cat ${keyPath}.pub`,
    ].join("\n");
  }

  function buildSshConfigCommand(user) {
    const safeUser = sanitizeSegment(user, DEFAULT_USER);
    const keyName = sanitizeSegment(
      `${safeUser}_paperagent_ed25519`,
      "paperagent_ed25519"
    );
    const keyPath = `/home/${safeUser}/.ssh/${keyName}`;
    const configBlock = [
      "Host github.com",
      "  HostName github.com",
      "  User git",
      `  IdentityFile ${keyPath}`,
      "  IdentitiesOnly yes",
    ];
    const blockLiteral = configBlock.map((line) => `"${line}"`).join(" ");
    return [
      `KEY_PATH="${keyPath}"`,
      'if [ ! -f "$KEY_PATH" ]; then echo "[webterm] SSH key missing, generate it first"; exit 1; fi',
      `for HOME_DIR in "/home/${safeUser}" "/root"; do`,
      '  SSH_DIR="$HOME_DIR/.ssh"',
      '  CONFIG_PATH="$SSH_DIR/config"',
      '  mkdir -p "$SSH_DIR"',
      '  chmod 700 "$SSH_DIR"',
      '  if [ -f "$CONFIG_PATH" ]; then',
      '    awk \'BEGIN{skip=0} /^\\s*Host\\s+github.com(\\s|$)/{skip=1; next} /^\\s*Host\\s+/{if(skip){skip=0}} !skip{print}\' "$CONFIG_PATH" > "$CONFIG_PATH.tmp"',
      "  else",
      '    : > "$CONFIG_PATH.tmp"',
      "  fi",
      `  printf '%s\\n' ${blockLiteral} >> "$CONFIG_PATH.tmp"`,
      '  mv "$CONFIG_PATH.tmp" "$CONFIG_PATH"',
      '  chmod 600 "$CONFIG_PATH"',
      "done",
      `if id -u ${safeUser} >/dev/null 2>&1; then chown -R ${safeUser}:${safeUser} /home/${safeUser}/.ssh; fi`,
      'echo "[webterm] SSH config updated."',
    ].join("\n");
  }

  function buildGitRemoteCommand(basePath, remote) {
    const safeRemote = sanitizeGitRemote(remote);
    return [
      `REMOTE="${safeRemote}"`,
      'if [ -z "$REMOTE" ]; then echo "[webterm] Remote URL required"; exit 1; fi',
      'if command -v sudo >/dev/null 2>&1; then SUDO=sudo; else SUDO=""; fi',
      'if ! command -v git >/dev/null 2>&1; then',
      '  if ! command -v apt-get >/dev/null 2>&1; then echo "apt-get not found"; exit 1; fi',
      '  $SUDO apt-get update && $SUDO apt-get install -y git',
      "fi",
      `mkdir -p ${basePath}`,
      `cd ${basePath}`,
      'if [ ! -d ".git" ]; then git init -b main; else git branch -M main; fi',
      'if git remote get-url origin >/dev/null 2>&1; then',
      '  git remote set-url origin "$REMOTE"',
      "else",
      '  git remote add origin "$REMOTE"',
      "fi",
      "git remote -v",
    ].join("\n");
  }

  function buildGitTestCommand(basePath, user, remote) {
    const safeRemote = sanitizeGitRemote(remote);
    const safeUser = sanitizeSegment(user, DEFAULT_USER);
    const keyName = sanitizeSegment(
      `${safeUser}_paperagent_ed25519`,
      "paperagent_ed25519"
    );
    const sshDir = `/home/${safeUser}/.ssh`;
    const keyPath = `${sshDir}/${keyName}`;
    const configPath = `${sshDir}/config`;
    return [
      `REMOTE="${safeRemote}"`,
      'if command -v sudo >/dev/null 2>&1; then SUDO=sudo; else SUDO=""; fi',
      'if ! command -v git >/dev/null 2>&1; then',
      '  if ! command -v apt-get >/dev/null 2>&1; then echo "apt-get not found"; exit 1; fi',
      '  $SUDO apt-get update && $SUDO apt-get install -y git',
      "fi",
      `mkdir -p ${basePath}`,
      `cd ${basePath}`,
      'if [ -z "$REMOTE" ]; then REMOTE=$(git remote get-url origin 2>/dev/null || true); fi',
      'if [ -z "$REMOTE" ]; then echo "[webterm] Remote URL required"; exit 1; fi',
      `HOME_DIR="/home/${safeUser}"`,
      'SSH_DIR="$HOME_DIR/.ssh"',
      `KEY_PATH="${keyPath}"`,
      `CONFIG_PATH="${configPath}"`,
      'if [ ! -f "$KEY_PATH" ]; then echo "[webterm] SSH key missing, generate it first"; exit 1; fi',
      'if [ -f "$CONFIG_PATH" ]; then SSH_CONFIG="-F $CONFIG_PATH"; else SSH_CONFIG=""; fi',
      'HOST=""',
      'case "$REMOTE" in',
      '  git@*:* ) HOST=$(echo "$REMOTE" | sed -n "s/^git@\\([^:]*\\):.*/\\1/p") ;;',
      '  ssh://git@*/* ) HOST=$(echo "$REMOTE" | sed -n "s#^ssh://git@\\([^/]*\\)/.*#\\1#p") ;;',
      '  https://*/* ) HOST=$(echo "$REMOTE" | sed -n "s#^https://\\([^/]*\\)/.*#\\1#p") ;;',
      '  http://*/* ) HOST=$(echo "$REMOTE" | sed -n "s#^http://\\([^/]*\\)/.*#\\1#p") ;;',
      "esac",
      'if [ -z "$HOST" ]; then HOST="github.com"; fi',
      'if [ "$HOST" = "github.com" ]; then',
      '  if ! command -v ssh >/dev/null 2>&1; then',
      '    if ! command -v apt-get >/dev/null 2>&1; then echo "apt-get not found"; exit 1; fi',
      '    $SUDO apt-get update && $SUDO apt-get install -y openssh-client',
      "  fi",
      '  ssh $SSH_CONFIG -T -o BatchMode=yes -o StrictHostKeyChecking=accept-new -o IdentitiesOnly=yes -i "$KEY_PATH" git@"$HOST"',
      "  status=$?",
      '  if [ "$status" -eq 1 ] || [ "$status" -eq 0 ]; then',
      '    echo "[webterm] GitHub SSH auth OK"',
      "  else",
      '    echo "[webterm] GitHub SSH failed (code $status)"',
      "    exit $status",
      "  fi",
      "else",
      '  git ls-remote "$REMOTE" HEAD >/dev/null 2>&1 && echo "[webterm] Remote reachable" || { echo "[webterm] Remote test failed"; exit 1; }',
      "fi",
    ].join("\n");
  }

  async function loadProjectRemote({ silent } = {}) {
    if (!gitRemoteInput) {
      return;
    }
    const { user, project } = buildBasePath();
    const url = buildProjectUrl({ user, project });
    try {
      const response = await fetch(url, { cache: "no-store" });
      if (!response.ok) {
        throw new Error("missing");
      }
      const data = await response.json();
      const remote = data?.git_remote || "";
      setStoredProjectRemote(user, project, remote);
      if (!gitRemoteDirty || !gitRemoteInput.value.trim()) {
        gitRemoteInput.value = remote;
      }
    } catch (err) {
      const cached = getStoredProjectRemote(user, project);
      if (cached && (!gitRemoteDirty || !gitRemoteInput.value.trim())) {
        gitRemoteInput.value = cached;
      }
      if (!silent) {
        // ignore
      }
    }
  }

  function scheduleProjectRemoteLoad(delay = 0) {
    clearTimeout(projectRemoteTimer);
    projectRemoteTimer = setTimeout(() => {
      loadProjectRemote({ silent: true });
    }, delay);
  }

  async function saveProjectRemote(remote) {
    const { user, project } = buildBasePath();
    const payload = {
      user,
      project,
      git_remote: String(remote || "").trim(),
    };
    setStoredProjectRemote(user, project, payload.git_remote);
    try {
      await fetch("/api/project", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
    } catch (err) {
      // ignore
    }
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
      'if [ -f /.dockerenv ]; then',
      '  echo "[webterm] Container detected. Installing CUDA toolkit in container."',
      '  echo "[webterm] Host NVIDIA driver is required for GPU access."',
      '  echo "[webterm] Run on host: ./scripts/install_nvidia_host.sh"',
      "fi",
      '$SUDO apt-get update',
      '$SUDO apt-get install -y nvidia-cuda-toolkit',
      "nvcc --version || true",
      "nvidia-smi || true",
      'if ! command -v nvidia-smi >/dev/null 2>&1; then',
      '  echo "[webterm] nvidia-smi not found. Install NVIDIA driver on host."',
      "fi",
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

  function setCodexStatus(text, state) {
    if (!codexStatus) {
      return;
    }
    codexStatusBase = text;
    codexStatusClass = state || "";
    renderCodexStatus();
  }

  function setCodexRunState(state) {
    codexRunState = state || "idle";
    renderCodexStatus();
  }

  function renderCodexStatus() {
    if (!codexStatus) {
      return;
    }
    const suffix = codexRunState ? ` · ${codexRunState}` : "";
    codexStatus.textContent = `${codexStatusBase}${suffix}`;
    codexStatus.classList.remove("ready", "loading", "error");
    if (codexStatusClass) {
      codexStatus.classList.add(codexStatusClass);
    }
  }

  function ensureCodexTerminal() {
    if (codexTerm || !codexOutput || !window.Terminal) {
      return;
    }
    codexTerm = new Terminal({
      cursorBlink: true,
      fontFamily: "JetBrains Mono, monospace",
      fontSize: 12,
      convertEol: true,
      scrollback: 2000,
      theme: {
        background: "#0f1419",
        foreground: "#e5e7eb",
        cursor: "#9ae6b4",
        selectionBackground: "#1f2937",
      },
    });
    codexFitAddon = new FitAddon.FitAddon();
    codexTerm.loadAddon(codexFitAddon);
    codexTerm.open(codexOutput);
    codexFitAddon.fit();
    codexTerm.onData((data) => {
      if (!codexSocket || codexSocket.readyState !== WebSocket.OPEN) {
        return;
      }
      if (data.includes("\r")) {
        setCodexRunState("running");
      }
      codexSocket.send(JSON.stringify({ type: "input", data }));
    });
  }

  function sendCodexResize() {
    if (!codexSocket || codexSocket.readyState !== WebSocket.OPEN || !codexTerm) {
      return;
    }
    codexSocket.send(
      JSON.stringify({
        type: "resize",
        cols: codexTerm.cols,
        rows: codexTerm.rows,
      })
    );
  }

  function resetCodexOutput() {
    if (codexTerm) {
      codexTerm.reset();
      codexOutputBuffer = "";
      return;
    }
    if (codexOutput) {
      codexOutput.textContent = "";
    }
  }

  function stripAnsi(value) {
    if (!value) {
      return "";
    }
    return value
      .replace(/\x1b\][^\x07]*(?:\x07|\x1b\\)/g, "")
      .replace(/\x1b\[[0-9;?]*[ -/]*[@-~]/g, "");
  }

  function updateCodexRunStateFromOutput(text) {
    const cleaned = stripAnsi(text);
    if (!cleaned) {
      return;
    }
    codexOutputBuffer = `${codexOutputBuffer}${cleaned}`.slice(-2000);
    if (/(^|[\r\n])›\s/.test(codexOutputBuffer)) {
      setCodexRunState("idle");
    }
  }

  function appendCodexOutput(text) {
    updateCodexRunStateFromOutput(text);
    ensureCodexTerminal();
    if (codexTerm) {
      codexTerm.write(text);
      return;
    }
    if (!codexOutput) {
      return;
    }
    codexOutput.textContent += text;
    if (codexOutput.textContent.length > CODEX_OUTPUT_LIMIT) {
      codexOutput.textContent = codexOutput.textContent.slice(-CODEX_OUTPUT_LIMIT);
    }
  }

  function generateCodexSessionId() {
    if (window.crypto?.randomUUID) {
      return window.crypto.randomUUID().slice(0, 12);
    }
    return Math.random().toString(36).slice(2, 14);
  }

  function formatCodexSessionLabel(session) {
    const parts = [];
    if (session?.id) {
      parts.push(session.id);
    }
    if (session?.username || session?.project) {
      parts.push(`${session.username || "?"}/${session.project || "?"}`);
    }
    if (session?.state) {
      parts.push(session.state);
    }
    if (typeof session?.clients === "number") {
      parts.push(`${session.clients} client${session.clients === 1 ? "" : "s"}`);
    }
    return parts.join(" - ");
  }

  function syncCodexSessionSelection(value) {
    if (!codexSessionList) {
      return;
    }
    const hasValue = Array.from(codexSessionList.options).some(
      (option) => option.value === value
    );
    codexSessionList.value = hasValue ? value : "";
  }

  function updateCodexSessionList(sessions) {
    if (!codexSessionList) {
      return;
    }
    codexSessionList.innerHTML = "";
    const placeholder = document.createElement("option");
    placeholder.value = "";
    placeholder.textContent = sessions?.length
      ? "Active sessions"
      : "No active sessions";
    codexSessionList.appendChild(placeholder);
    (sessions || []).forEach((session) => {
      const option = document.createElement("option");
      option.value = session.id;
      option.textContent = formatCodexSessionLabel(session);
      codexSessionList.appendChild(option);
    });
    syncCodexSessionSelection(codexSessionInput?.value || "");
  }

  async function loadCodexSessions({ silent } = {}) {
    if (!codexSessionList) {
      return;
    }
    const { user, project } = buildBasePath();
    const url = buildCodexSessionsUrl({ user, project });
    try {
      const response = await fetch(url, { cache: "no-store" });
      if (!response.ok) {
        throw new Error("bad response");
      }
      const data = await response.json();
      updateCodexSessionList(data.sessions || []);
    } catch (err) {
      if (!silent) {
        updateCodexSessionList([]);
      }
    }
  }

  function getStoredCodexSession() {
    try {
      return localStorage.getItem(CODEX_SESSION_KEY);
    } catch (err) {
      return null;
    }
  }

  function setStoredCodexSession(value) {
    try {
      localStorage.setItem(CODEX_SESSION_KEY, value);
    } catch (err) {
      // ignore
    }
  }

  function getProjectRemoteKey(user, project) {
    return `${PROJECT_REMOTE_PREFIX}.${user}.${project}`;
  }

  function getStoredProjectRemote(user, project) {
    try {
      return localStorage.getItem(getProjectRemoteKey(user, project));
    } catch (err) {
      return null;
    }
  }

  function setStoredProjectRemote(user, project, value) {
    try {
      localStorage.setItem(getProjectRemoteKey(user, project), value || "");
    } catch (err) {
      // ignore
    }
  }

  function connectCodex(sessionId, options = {}) {
    if (!codexSessionInput) {
      return;
    }
    const rawId = String(sessionId || "").trim();
    if (options.resume && !rawId) {
      setCodexStatus("Status: session id required", "error");
      return;
    }
    const id = sanitizeSegment(
      rawId,
      options.resume ? "" : generateCodexSessionId()
    );
    if (!id) {
      setCodexStatus("Status: session id required", "error");
      return;
    }
    codexSessionInput.value = id;
    setStoredCodexSession(id);
    syncCodexSessionSelection(id);
    if (codexSocket) {
      try {
        codexSocket.close();
      } catch (err) {
        // ignore
      }
    }
    setCodexStatus("Status: connecting", "loading");
    const { user, project } = buildBasePath();
    const protocol = location.protocol === "https:" ? "wss" : "ws";
    const wsParams = new URLSearchParams({
      session: id,
      user,
      project,
    });
    if (options.resume) {
      wsParams.set("resume", "1");
    }
    const wsUrl = `${protocol}://${location.host}/codex/ws?${wsParams.toString()}`;
    codexSocket = new WebSocket(wsUrl);

    codexSocket.addEventListener("open", () => {
      setCodexStatus(`Status: connected (${id})`, "ready");
      setCodexRunState("idle");
      ensureCodexTerminal();
      if (codexFitAddon) {
        codexFitAddon.fit();
      }
      setTimeout(() => {
        if (codexFitAddon) {
          codexFitAddon.fit();
        }
        sendCodexResize();
      }, 50);
      loadCodexSessions({ silent: true });
    });

    codexSocket.addEventListener("message", (event) => {
      let payload = null;
      try {
        payload = JSON.parse(event.data);
      } catch (err) {
        payload = null;
      }
      if (payload && payload.type === "session" && payload.id) {
        codexSessionInput.value = payload.id;
        setStoredCodexSession(payload.id);
        return;
      }
      if (payload && payload.type === "status") {
        const state = payload.state || "unknown";
        if (state === "ready") {
          setCodexStatus(`Status: ready (${id})`, "ready");
          setCodexRunState("idle");
        } else if (state === "closed") {
          setCodexStatus("Status: closed", "error");
          setCodexRunState("stopped");
        } else if (state === "missing") {
          setCodexStatus("Status: missing session", "error");
        } else if (state === "stopping") {
          setCodexStatus("Status: stopping", "loading");
          setCodexRunState("stopping");
        } else {
          setCodexStatus(`Status: ${state}`);
        }
        return;
      }
      if (payload && (payload.type === "output" || payload.type === "history")) {
        appendCodexOutput(payload.data || "");
        return;
      }
      appendCodexOutput(String(event.data || ""));
    });

    codexSocket.addEventListener("close", () => {
      setCodexStatus("Status: disconnected", "error");
      setCodexRunState("stopped");
      loadCodexSessions({ silent: true });
    });

    codexSocket.addEventListener("error", () => {
      setCodexStatus("Status: error", "error");
    });
  }

  function sendCodexPrompt() {
    if (!codexPrompt || !codexSocket || codexSocket.readyState !== WebSocket.OPEN) {
      setCodexStatus("Status: not connected", "error");
      return;
    }
    const text = codexPrompt.value.trim();
    if (!text) {
      return;
    }
    const payload = `\u001b[200~${text}\u001b[201~\r`;
    codexSocket.send(JSON.stringify({ type: "input", data: payload }));
    codexPrompt.value = "";
    setCodexRunState("running");
  }

  function sendCodexCommand(command) {
    if (!codexSocket || codexSocket.readyState !== WebSocket.OPEN) {
      setCodexStatus("Status: not connected", "error");
      return;
    }
    const text = String(command || "").trim();
    if (!text) {
      return;
    }
    const payload = `\u001b[200~${text}\u001b[201~\r`;
    codexSocket.send(JSON.stringify({ type: "input", data: payload }));
    setCodexRunState("running");
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
        details.open = depth === 0 && item.name === "latex";
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

  function shouldStartDevReload() {
    const params = new URLSearchParams(window.location.search);
    if (params.get("dev") === "1") {
      return true;
    }
    try {
      return localStorage.getItem("paperagent.dev") === "1";
    } catch (err) {
      return false;
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
    resizeTimer = setTimeout(() => {
      sendResize();
      if (codexFitAddon) {
        codexFitAddon.fit();
        sendCodexResize();
      }
    }, 150);
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

  if (initGitBtn) {
    initGitBtn.addEventListener("click", () => {
      const { user, project, path } = buildBasePath();
      userInput.value = user;
      projectInput.value = project;
      updatePathPreview();

      const command = buildGitInitCommand(path);
      sendCommand(`${command}\n`);
      term.focus();
    });
  }

  if (generateSshKeyBtn) {
    generateSshKeyBtn.addEventListener("click", () => {
      const { user } = buildBasePath();
      const label = sshKeyLabelInput ? sshKeyLabelInput.value : "";
      const command = buildSshKeyCommand(user, label);
      sendCommand(`${command}\n`);
      term.focus();
      scheduleSshKeyLoad(1500);
    });
  }

  if (setSshConfigBtn) {
    setSshConfigBtn.addEventListener("click", () => {
      const { user } = buildBasePath();
      const command = buildSshConfigCommand(user);
      sendCommand(`${command}\n`);
      term.focus();
    });
  }

  if (setGitRemoteBtn) {
    setGitRemoteBtn.addEventListener("click", () => {
      const { user, project, path } = buildBasePath();
      userInput.value = user;
      projectInput.value = project;
      updatePathPreview();

      const remote = gitRemoteInput ? gitRemoteInput.value : "";
      saveProjectRemote(remote);
      const command = buildGitRemoteCommand(path, remote);
      sendCommand(`${command}\n`);
      term.focus();
    });
  }

  if (testGitRemoteBtn) {
    testGitRemoteBtn.addEventListener("click", () => {
      const { user, project, path } = buildBasePath();
      userInput.value = user;
      projectInput.value = project;
      updatePathPreview();

      const remote = gitRemoteInput ? gitRemoteInput.value : "";
      const command = buildGitTestCommand(path, user, remote);
      sendCommand(`${command}\n`);
      term.focus();
    });
  }

  if (gitRemoteInput) {
    gitRemoteInput.addEventListener("input", () => {
      gitRemoteDirty = true;
    });
  }

  async function loadSshKey() {
    if (!sshKeyOutput) {
      return;
    }
    const { user } = buildBasePath();
    const url = buildSshKeyUrl(user);
    try {
      const response = await fetch(url, { cache: "no-store" });
      if (!response.ok) {
        throw new Error("missing");
      }
      const text = await response.text();
      sshKeyOutput.value = text.trim();
    } catch (err) {
      sshKeyOutput.value = "";
    }
  }

  function scheduleSshKeyLoad(delay = 0) {
    setTimeout(() => {
      loadSshKey();
    }, delay);
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

  if (codexNewBtn) {
    codexNewBtn.addEventListener("click", () => {
      resetCodexOutput();
      connectCodex(generateCodexSessionId(), { resume: false });
      loadCodexSessions({ silent: true });
    });
  }

  if (codexResumeBtn) {
    codexResumeBtn.addEventListener("click", () => {
      resetCodexOutput();
      const candidate = codexSessionInput?.value || codexSessionList?.value || "";
      connectCodex(candidate, { resume: true });
    });
  }

  if (codexStopBtn) {
    codexStopBtn.addEventListener("click", () => {
      if (!codexSocket || codexSocket.readyState !== WebSocket.OPEN) {
        return;
      }
      codexSocket.send(JSON.stringify({ type: "control", action: "stop" }));
      setCodexStatus("Status: stopping", "loading");
      setTimeout(() => {
        loadCodexSessions({ silent: true });
      }, 800);
    });
  }

  if (codexInitBtn) {
    codexInitBtn.addEventListener("click", () => {
      sendCodexCommand("/init");
    });
  }

  if (codexSendBtn) {
    codexSendBtn.addEventListener("click", () => {
      sendCodexPrompt();
    });
  }

  if (codexPrompt) {
    codexPrompt.addEventListener("keydown", (event) => {
      if ((event.ctrlKey || event.metaKey) && event.key === "Enter") {
        event.preventDefault();
        sendCodexPrompt();
      }
    });
  }

  if (codexSessionList) {
    codexSessionList.addEventListener("change", () => {
      if (!codexSessionInput) {
        return;
      }
      if (codexSessionList.value) {
        codexSessionInput.value = codexSessionList.value;
        setStoredCodexSession(codexSessionList.value);
      }
    });
  }

  if (codexSessionInput) {
    codexSessionInput.addEventListener("input", () => {
      syncCodexSessionSelection(codexSessionInput.value);
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
      scheduleSshKeyLoad(400);
      gitRemoteDirty = false;
      scheduleProjectRemoteLoad(450);
    });
    projectInput.addEventListener("input", () => {
      updatePathPreview();
      setProjectStatus("unknown");
      schedulePdfRefresh(500);
      scheduleEditorLoad(700);
      scheduleTreeLoad(800);
      setActiveTreePath(null);
      gitRemoteDirty = false;
      scheduleProjectRemoteLoad(450);
    });
  }

  updatePathPreview();
  setProjectStatus("unknown");
  setPdfStatus("Status: idle");
  setEditorStatus("Status: idle");
  setTreeStatus("Status: idle");
  setCodexStatus("Status: idle");
  ensureCodexTerminal();
  if (codexSessionInput) {
    const storedSession = getStoredCodexSession() || generateCodexSessionId();
    codexSessionInput.value = storedSession;
    connectCodex(storedSession, { resume: false });
  }
  loadSshKey();
  loadProjectRemote({ silent: true });
  loadCodexSessions({ silent: true });
  clearInterval(codexSessionsTimer);
  codexSessionsTimer = setInterval(() => {
    loadCodexSessions({ silent: true });
  }, CODEX_SESSIONS_REFRESH_MS);
  fitAddon.fit();
  ensureEditor();
  connect();
  scheduleEditorLoad(400);
  startEditorWatch();
  loadFileTree({ silent: true });
  if (shouldStartDevReload()) {
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
  } else if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("/sw.js").catch(() => {
      // offline or blocked; ignore
    });
  }
})();
