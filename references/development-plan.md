# PaperAgent Development Plan (Codex + Overleaf Hybrid)

## Goal
Build an Overleaf-like web app that hosts a chat-based writing workflow while executing code and LaTeX on a local CLI runner. Users write papers from ideas, run Python/R to generate figures, compile LaTeX, and see PDFs, logs, and diffs in one place.

## Design Logic (from PaperMCP.md)
- Separate **Host** (orchestrator + UI) from **Servers/Tools** (filesystem, git, python, R, LaTeX). The Host decides what to do; tools just execute.
- Prefer **structured tools** over free-form shell commands. Keep tool inputs and outputs deterministic and auditable.
- Treat execution as **jobs** with IDs, timeouts, logs, and artifacts (PDFs, figures).
- Enforce a **policy layer** (allow/ask/deny) for risky actions and network use.

## Architecture Overview

```
Browser (chat + editor + PDF preview)
        |
        v
Host / Orchestrator (LLM + tool routing + policy)
        |
        v
Local CLI Runner (jobs, sandbox, artifacts)
        |
        v
MCP Tools: filesystem, git, compile_latex, run_python, run_r
```

### Components
- **Web UI**
  - Chat stream, file tree, editor, PDF preview, compile logs, run history.
  - Shows diffs and tool results inline.
- **Host / Orchestrator**
  - Manages sessions, tool calls, approvals, and artifacts.
  - Converts user intents to MCP tool calls.
- **CLI Runner**
  - Executes jobs (python, R, latex) with strict timeouts and resource caps.
  - Writes artifacts to a sandboxed workspace.
- **MCP Tool Servers**
  - Filesystem (read/write/patch/list)
  - Git (status/diff/commit)
  - LaTeX compile (latexmk/xelatex)
  - Python and R runners
- **Artifact Store**
  - PDF output, logs, images/plots, cached build data.

## Minimal MCP Tool Surface
- `read_text(path, start_line?, end_line?)`
- `apply_patch(path, unified_diff)`
- `list_dir(path)`
- `git_status()`
- `git_diff(path?)`
- `compile_latex(entry, engine, passes, timeout)`
- `run_python(entry, args, timeout, cwd)`
- `run_r(entry, args, timeout, cwd)`

Avoid a generic `run_shell` in MVP; keep execution structured.

## Key Workflows
1. **Chat -> Edit -> Compile**
   - User requests a change.
   - Host applies patch to .tex or .bib.
   - `compile_latex` job runs.
   - PDF + log returned; UI links errors to lines.
2. **Generate Figures**
   - User requests a plot or experiment.
   - Host updates Python/R code.
   - `run_python` or `run_r` generates figures into `paper/figures/`.
   - Host updates LaTeX references and re-compiles.
3. **Iterate on Errors**
   - Compile errors mapped to file/line.
   - Host auto-fixes or prompts user.

## Data Model (MVP)
- **Project**: workspace root, settings, main TeX entry.
- **Session**: chat messages, tool calls, approvals.
- **Job**: type, status, logs, artifacts, exit code.
- **Artifact**: pdf, log, image, data summary.

## Safety and Policy Defaults
- Allow: read_text, list_dir, git_status, git_diff.
- Ask: apply_patch, compile_latex, run_python, run_r, git_commit.
- Deny: network access, arbitrary shell, git_push.

## MVP Scope
- Single-user, local-only setup.
- One project at a time.
- Chat + editor + PDF preview.
- LaTeX compile with logs and error navigation.
- Python and R execution for figure generation.
- Basic approvals and job cancellation.

## Non-Goals (MVP)
- Multi-user collaboration.
- Remote agents and cloud relay.
- Full Overleaf feature parity.
- Arbitrary shell execution.

## Phased Development Plan

### Phase 0: Scaffolding (1-2 weeks)
- Define workspace layout: `paper/`, `code/`, `figures/`, `artifacts/`.
- Implement CLI runner skeleton with job queue and logs.
- Stub MCP tool interfaces and policy engine.

### Phase 1: LaTeX Core (2-3 weeks)
- Implement `compile_latex` tool (latexmk + texlive).
- Capture logs, parse errors, map to source lines.
- Produce PDF artifact and wire to UI preview.

### Phase 2: Chat + Editor (2-4 weeks)
- Web chat UI with tool call transcript.
- File tree + editor (Monaco or CodeMirror).
- Patch-based writes for safe editing.

### Phase 3: Code Execution (2-3 weeks)
- Add `run_python` and `run_r` tools.
- Generate figures in `paper/figures/`.
- Auto-update LaTeX references and rebuild.

### Phase 4: Reliability and UX (2-3 weeks)
- Job cancelation, retries, timeouts.
- Clear status indicators (idle/running/error).
- Better diff views and run history.

### Phase 5: Hardening and Extensions (future)
- Containerized runners per job.
- Remote agents and cloud relay.
- Collaboration and multi-user permissions.

## Testing Plan
- Unit tests for tool adapters and policy engine.
- Integration tests for compile and runner jobs.
- UI smoke tests for chat, editor, PDF preview.

## Open Decisions
- Host language: Node/TypeScript vs Python.
- Sandboxing: Docker vs OS-level sandbox.
- LaTeX engine defaults: pdflatex vs xelatex.
- Editor stack: Monaco vs CodeMirror.
- Storage: local filesystem vs object store.

