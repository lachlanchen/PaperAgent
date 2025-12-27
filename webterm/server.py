import argparse
import json
import os
import re
import signal
import subprocess
import pty
import fcntl
import termios
import struct
import shutil
import shlex
import uuid
from collections import deque
from urllib.parse import urlparse

import tornado.ioloop
import tornado.web
import tornado.websocket
import tornado.autoreload

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
STATIC_DIR = os.path.join(BASE_DIR, "static")
SAFE_SEGMENT = re.compile(r"[^a-zA-Z0-9._-]+")
SAFE_PDF = re.compile(r"^[a-zA-Z0-9._-]+\.pdf$", re.IGNORECASE)
MAX_FILE_BYTES = 1024 * 1024
CODEX_MAX_BUFFER = int(os.environ.get("CODEX_MAX_BUFFER", "40000"))


def resolve_default_shell():
    docker_shell = os.path.join(BASE_DIR, "docker-shell.sh")
    if os.path.isfile(docker_shell) and os.access(docker_shell, os.X_OK):
        return docker_shell
    return os.environ.get("SHELL", "/bin/bash")


def set_pty_size(fd, rows, cols):
    winsize = struct.pack("HHHH", rows, cols, 0, 0)
    fcntl.ioctl(fd, termios.TIOCSWINSZ, winsize)


def sanitize_segment(value, fallback):
    if not value:
        return fallback
    safe = SAFE_SEGMENT.sub("_", value.strip())
    return safe or fallback


def sanitize_pdf_name(value):
    if not value:
        return "main.pdf"
    name = os.path.basename(value.strip())
    if SAFE_PDF.match(name):
        return name
    return None


def sanitize_relpath(value):
    if not value:
        return None
    cleaned = value.strip().lstrip("/")
    if not cleaned:
        return None
    parts = []
    for part in cleaned.split("/"):
        if part in ("", ".", ".."):
            return None
        safe = SAFE_SEGMENT.sub("_", part)
        if not safe or safe in (".", ".."):
            return None
        parts.append(safe)
    return "/".join(parts)


def resolve_container_name():
    container = os.environ.get("WEBTERM_CONTAINER")
    if container:
        return container
    docker_shell = os.path.join(BASE_DIR, "docker-shell.sh")
    if os.path.isfile(docker_shell):
        return "paperagent-sandbox"
    return None


def resolve_codex_command():
    cmd = os.environ.get("CODEX_CMD", "codex")
    args = shlex.split(os.environ.get("CODEX_ARGS", "-s danger-full-access -a never"))
    cwd = os.environ.get("CODEX_CWD", "/workspace")
    container = resolve_container_name()
    if container and shutil.which("docker"):
        quoted = " ".join([shlex.quote(cmd)] + [shlex.quote(arg) for arg in args])
        shell_cmd = f"cd {shlex.quote(cwd)} && {quoted}"
        return ["docker", "exec", "-it", container, "bash", "-lc", shell_cmd], None
    return [cmd] + args, cwd


def read_file_bytes(path):
    container = resolve_container_name()
    if container and shutil.which("docker"):
        result = subprocess.run(
            ["docker", "exec", container, "cat", path],
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            check=False,
        )
        if result.returncode == 0 and result.stdout:
            return result.stdout
    if os.path.isfile(path):
        with open(path, "rb") as handle:
            return handle.read()
    return None


def write_file_bytes(path, content):
    container = resolve_container_name()
    if container and shutil.which("docker"):
        result = subprocess.run(
            [
                "docker",
                "exec",
                "-i",
                container,
                "sh",
                "-c",
                'mkdir -p "$(dirname "$1")" && cat > "$1"',
                "_",
                path,
            ],
            input=content,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            check=False,
        )
        return result.returncode == 0
    try:
        os.makedirs(os.path.dirname(path), exist_ok=True)
        with open(path, "wb") as handle:
            handle.write(content)
        return True
    except OSError:
        return False


def read_file_meta(path):
    container = resolve_container_name()
    if container and shutil.which("docker"):
        result = subprocess.run(
            [
                "docker",
                "exec",
                container,
                "sh",
                "-c",
                'stat -c "%Y %s" "$1"',
                "_",
                path,
            ],
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            check=False,
        )
        if result.returncode == 0 and result.stdout:
            try:
                parts = result.stdout.decode().strip().split()
                return {"mtime": int(parts[0]), "size": int(parts[1])}
            except (ValueError, IndexError):
                return None
        return None
    if os.path.isfile(path):
        try:
            stat = os.stat(path)
        except OSError:
            return None
        return {"mtime": int(stat.st_mtime), "size": int(stat.st_size)}
    return None


def list_tree_entries(base_path, depth):
    container = resolve_container_name()
    if container and shutil.which("docker"):
        check = subprocess.run(
            ["docker", "exec", container, "sh", "-c", 'test -d "$1"', "_", base_path],
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            check=False,
        )
        if check.returncode != 0:
            return None
        result = subprocess.run(
            [
                "docker",
                "exec",
                container,
                "find",
                base_path,
                "-maxdepth",
                str(depth),
                "-mindepth",
                "1",
                "-printf",
                "%y\t%P\n",
            ],
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            check=False,
        )
        if result.returncode != 0:
            return None
        entries = []
        for line in result.stdout.decode("utf-8", errors="ignore").splitlines():
            if "\t" not in line:
                continue
            kind, rel = line.split("\t", 1)
            if not rel:
                continue
            if kind == "d":
                entry_type = "dir"
            elif kind == "f":
                entry_type = "file"
            else:
                continue
            entries.append({"path": rel, "type": entry_type})
        return entries
    if not os.path.isdir(base_path):
        return None
    entries = []
    base_depth = base_path.rstrip(os.sep).count(os.sep)
    for root, dirs, files in os.walk(base_path):
        current_depth = root.count(os.sep) - base_depth
        if current_depth >= depth:
            dirs[:] = []
            continue
        rel_root = os.path.relpath(root, base_path)
        rel_root = "" if rel_root == "." else rel_root
        for directory in dirs:
            rel = os.path.join(rel_root, directory) if rel_root else directory
            entries.append({"path": rel, "type": "dir"})
        for file_name in files:
            rel = os.path.join(rel_root, file_name) if rel_root else file_name
            entries.append({"path": rel, "type": "file"})
    return entries


def compute_dev_version():
    paths = [os.path.abspath(__file__)]
    for root, _, files in os.walk(STATIC_DIR):
        for name in files:
            if name.startswith("."):
                continue
            paths.append(os.path.join(root, name))
    latest = 0.0
    for path in paths:
        try:
            mtime = os.path.getmtime(path)
        except OSError:
            continue
        if mtime > latest:
            latest = mtime
    return int(latest * 1000)


class MainHandler(tornado.web.RequestHandler):
    def get(self):
        self.render("index.html")


class DevVersionHandler(tornado.web.RequestHandler):
    def initialize(self, version_func):
        self.version_func = version_func

    def get(self):
        self.set_header("Cache-Control", "no-store")
        self.write({"version": self.version_func()})


class PdfHandler(tornado.web.RequestHandler):
    def get(self):
        user = sanitize_segment(self.get_argument("user", "paperagent"), "paperagent")
        project = sanitize_segment(self.get_argument("project", "demo-paper"), "demo-paper")
        name = sanitize_pdf_name(self.get_argument("file", "main.pdf"))
        if not name:
            self.set_status(400)
            self.write({"error": "invalid file name"})
            return
        pdf_path = f"/home/{user}/Projects/{project}/latex/{name}"
        data = read_file_bytes(pdf_path)
        if not data:
            self.set_status(404)
            self.write({"error": "pdf not found"})
            return
        self.set_header("Content-Type", "application/pdf")
        self.set_header("Cache-Control", "no-store")
        self.set_header("Content-Disposition", f'inline; filename="{name}"')
        self.finish(data)


class FileHandler(tornado.web.RequestHandler):
    def write_error_json(self, status, message):
        self.set_status(status)
        self.set_header("Content-Type", "application/json")
        self.write({"error": message})

    def get(self):
        user = sanitize_segment(self.get_argument("user", "paperagent"), "paperagent")
        project = sanitize_segment(self.get_argument("project", "demo-paper"), "demo-paper")
        rel_path = sanitize_relpath(self.get_argument("path", "latex/main.tex"))
        if not rel_path:
            self.write_error_json(400, "invalid path")
            return
        base_path = f"/home/{user}/Projects/{project}"
        target = os.path.normpath(os.path.join(base_path, rel_path))
        if not target.startswith(base_path):
            self.write_error_json(400, "invalid path")
            return
        meta_only = self.get_argument("meta", "0").lower() in ("1", "true", "yes")
        meta = read_file_meta(target)
        if not meta:
            self.write_error_json(404, "file not found")
            return
        if meta_only:
            self.set_header("Content-Type", "application/json")
            self.set_header("Cache-Control", "no-store")
            self.write({"path": rel_path, "mtime": meta["mtime"], "size": meta["size"]})
            return
        if meta["size"] > MAX_FILE_BYTES:
            self.write_error_json(413, "file too large")
            return
        data = read_file_bytes(target)
        if data is None:
            self.write_error_json(404, "file not found")
            return
        content = data.decode("utf-8", errors="replace")
        self.set_header("Content-Type", "application/json")
        self.set_header("Cache-Control", "no-store")
        self.write(
            {
                "path": rel_path,
                "content": content,
                "mtime": meta["mtime"],
                "size": meta["size"],
            }
        )

    def post(self):
        try:
            payload = json.loads(self.request.body.decode("utf-8"))
        except (json.JSONDecodeError, UnicodeDecodeError):
            self.write_error_json(400, "invalid json")
            return
        user = sanitize_segment(payload.get("user") or "paperagent", "paperagent")
        project = sanitize_segment(payload.get("project") or "demo-paper", "demo-paper")
        rel_path = sanitize_relpath(payload.get("path"))
        if not rel_path:
            self.write_error_json(400, "invalid path")
            return
        base_path = f"/home/{user}/Projects/{project}"
        target = os.path.normpath(os.path.join(base_path, rel_path))
        if not target.startswith(base_path):
            self.write_error_json(400, "invalid path")
            return
        content = payload.get("content", "")
        if not isinstance(content, str):
            self.write_error_json(400, "invalid content")
            return
        data = content.encode("utf-8")
        if len(data) > MAX_FILE_BYTES:
            self.write_error_json(413, "file too large")
            return
        if not write_file_bytes(target, data):
            self.write_error_json(500, "failed to write")
            return
        meta = read_file_meta(target) or {"mtime": 0, "size": len(data)}
        self.set_header("Content-Type", "application/json")
        self.set_header("Cache-Control", "no-store")
        self.write(
            {
                "ok": True,
                "path": rel_path,
                "mtime": meta["mtime"],
                "size": meta["size"],
            }
        )


class TreeHandler(tornado.web.RequestHandler):
    def get(self):
        user = sanitize_segment(self.get_argument("user", "paperagent"), "paperagent")
        project = sanitize_segment(self.get_argument("project", "demo-paper"), "demo-paper")
        depth_value = self.get_argument("depth", "4")
        try:
            depth = int(depth_value)
        except ValueError:
            depth = 4
        depth = max(1, min(depth, 8))
        base_path = f"/home/{user}/Projects/{project}"
        entries = list_tree_entries(base_path, depth)
        if entries is None:
            self.set_status(404)
            self.set_header("Content-Type", "application/json")
            self.write({"error": "project not found"})
            return
        self.set_header("Content-Type", "application/json")
        self.set_header("Cache-Control", "no-store")
        self.write({"base": base_path, "entries": entries})


class CodexSession:
    def __init__(self, session_id, max_buffer=CODEX_MAX_BUFFER):
        self.session_id = session_id
        self.max_buffer = max_buffer
        self.buffer = deque()
        self.buffer_len = 0
        self.clients = set()
        self.master_fd = None
        self.proc = None
        self._closed = False
        self._loop = tornado.ioloop.IOLoop.current()
        self._spawn()

    def _spawn(self):
        self.master_fd, slave_fd = pty.openpty()
        env = os.environ.copy()
        env.setdefault("TERM", "xterm-256color")
        cmd, cwd = resolve_codex_command()
        self.proc = subprocess.Popen(
            cmd,
            stdin=slave_fd,
            stdout=slave_fd,
            stderr=slave_fd,
            cwd=cwd,
            env=env,
            start_new_session=True,
        )
        os.close(slave_fd)
        os.set_blocking(self.master_fd, False)
        self._loop.add_handler(self.master_fd, self._on_read, self._loop.READ)

    def _append_buffer(self, data):
        if not data:
            return
        self.buffer.append(data)
        self.buffer_len += len(data)
        while self.buffer_len > self.max_buffer and self.buffer:
            dropped = self.buffer.popleft()
            self.buffer_len -= len(dropped)

    def _broadcast(self, payload):
        if not self.clients:
            return
        message = json.dumps(payload)
        stale = []
        for client in self.clients:
            try:
                client.write_message(message)
            except tornado.websocket.WebSocketClosedError:
                stale.append(client)
        for client in stale:
            self.clients.discard(client)

    def _on_read(self, fd, events):
        try:
            data = os.read(fd, 4096)
        except OSError:
            data = b""
        if not data:
            self._broadcast({"type": "status", "state": "closed"})
            self.close()
            return
        text = data.decode("utf-8", errors="ignore")
        self._append_buffer(text)
        self._broadcast({"type": "output", "data": text})

    def attach(self, client):
        self.clients.add(client)
        if self.buffer:
            history = "".join(self.buffer)
            client.write_message(json.dumps({"type": "history", "data": history}))
        client.write_message(json.dumps({"type": "status", "state": "ready"}))

    def detach(self, client):
        self.clients.discard(client)

    def send_input(self, text):
        if self._closed or self.master_fd is None:
            return
        if not text.endswith("\n"):
            text = text + "\n"
        os.write(self.master_fd, text.encode())

    def stop(self):
        self._broadcast({"type": "status", "state": "stopping"})
        self.close()

    def close(self):
        if self._closed:
            return
        self._closed = True
        if self.master_fd is not None:
            try:
                self._loop.remove_handler(self.master_fd)
            except Exception:
                pass
            try:
                os.close(self.master_fd)
            except OSError:
                pass
            self.master_fd = None
        if self.proc and self.proc.poll() is None:
            try:
                os.killpg(os.getpgid(self.proc.pid), signal.SIGTERM)
            except OSError:
                pass
        self.proc = None


class CodexManager:
    def __init__(self):
        self.sessions = {}

    def get_or_create(self, session_id):
        session = self.sessions.get(session_id)
        if session and not session._closed:
            return session
        session = CodexSession(session_id)
        self.sessions[session_id] = session
        return session

    def stop(self, session_id):
        session = self.sessions.get(session_id)
        if not session:
            return
        session.stop()
        self.sessions.pop(session_id, None)

    def restart(self, session_id):
        self.stop(session_id)
        return self.get_or_create(session_id)


class CodexWebSocket(tornado.websocket.WebSocketHandler):
    def initialize(self, manager):
        self.manager = manager
        self.session = None
        self.session_id = None

    def check_origin(self, origin):
        if not origin:
            return True
        try:
            host = urlparse(origin).hostname
        except Exception:
            return False
        request_host = self.request.host.split(":")[0]
        return host in ("localhost", "127.0.0.1", "::1", request_host)

    def open(self):
        session_id = self.get_argument("session", "").strip()
        if not session_id:
            session_id = uuid.uuid4().hex[:12]
        self.session_id = session_id
        self.session = self.manager.get_or_create(session_id)
        self.session.attach(self)
        self.write_message(json.dumps({"type": "session", "id": session_id}))

    def on_message(self, message):
        payload = None
        if isinstance(message, str) and message.startswith("{"):
            try:
                payload = json.loads(message)
            except json.JSONDecodeError:
                payload = None
        if payload:
            if payload.get("type") == "prompt":
                text = payload.get("text", "")
                if self.session:
                    self.session.send_input(text)
                return
            if payload.get("type") == "control":
                action = payload.get("action")
                if action == "stop" and self.session_id:
                    self.manager.stop(self.session_id)
                elif action == "new" and self.session_id:
                    self.session = self.manager.restart(self.session_id)
                    self.session.attach(self)
                return
        if self.session:
            self.session.send_input(str(message))

    def on_close(self):
        if self.session:
            self.session.detach(self)
        self.session = None


class TerminalWebSocket(tornado.websocket.WebSocketHandler):
    def initialize(self, shell, cwd):
        self.shell = shell
        self.cwd = cwd
        self.master_fd = None
        self.proc = None
        self._closed = False
        self._loop = tornado.ioloop.IOLoop.current()

    def check_origin(self, origin):
        if not origin:
            return True
        try:
            host = urlparse(origin).hostname
        except Exception:
            return False
        request_host = self.request.host.split(":")[0]
        return host in ("localhost", "127.0.0.1", "::1", request_host)

    def open(self):
        self.master_fd, slave_fd = pty.openpty()
        env = os.environ.copy()
        env.setdefault("TERM", "xterm-256color")
        self.proc = subprocess.Popen(
            [self.shell],
            stdin=slave_fd,
            stdout=slave_fd,
            stderr=slave_fd,
            cwd=self.cwd,
            env=env,
            start_new_session=True,
        )
        os.close(slave_fd)
        os.set_blocking(self.master_fd, False)
        self._loop.add_handler(self.master_fd, self._on_pty_read, self._loop.READ)

    def _on_pty_read(self, fd, events):
        try:
            data = os.read(fd, 4096)
        except OSError:
            data = b""
        if not data:
            self.close()
            return
        try:
            self.write_message(data.decode("utf-8", errors="ignore"))
        except tornado.websocket.WebSocketClosedError:
            self.close()

    def on_message(self, message):
        payload = None
        if isinstance(message, str) and message.startswith("{"):
            try:
                payload = json.loads(message)
            except json.JSONDecodeError:
                payload = None
        if payload and payload.get("type") == "resize":
            rows = int(payload.get("rows", 24))
            cols = int(payload.get("cols", 80))
            if self.master_fd is not None:
                set_pty_size(self.master_fd, rows, cols)
                if self.proc and self.proc.poll() is None:
                    try:
                        os.killpg(os.getpgid(self.proc.pid), signal.SIGWINCH)
                    except OSError:
                        pass
            return
        if self.master_fd is not None:
            if isinstance(message, str):
                os.write(self.master_fd, message.encode())
            else:
                os.write(self.master_fd, message)

    def on_close(self):
        if self._closed:
            return
        self._closed = True
        if self.master_fd is not None:
            try:
                self._loop.remove_handler(self.master_fd)
            except Exception:
                pass
            try:
                os.close(self.master_fd)
            except OSError:
                pass
            self.master_fd = None
        if self.proc and self.proc.poll() is None:
            try:
                os.killpg(os.getpgid(self.proc.pid), signal.SIGTERM)
            except OSError:
                pass
        self.proc = None


def make_app(shell, cwd, dev_mode=False):
    codex_manager = CodexManager()
    settings = {
        "static_path": STATIC_DIR,
        "template_path": STATIC_DIR,
        "compress_response": True,
    }
    routes = [
        (r"/", MainHandler),
        (r"/ws", TerminalWebSocket, {"shell": shell, "cwd": cwd}),
        (r"/codex/ws", CodexWebSocket, {"manager": codex_manager}),
        (r"/api/pdf", PdfHandler),
        (r"/api/file", FileHandler),
        (r"/api/tree", TreeHandler),
        (r"/(manifest.json)", tornado.web.StaticFileHandler, {"path": STATIC_DIR}),
        (r"/(sw.js)", tornado.web.StaticFileHandler, {"path": STATIC_DIR}),
        (r"/(icon.svg)", tornado.web.StaticFileHandler, {"path": STATIC_DIR}),
        (r"/static/(.*)", tornado.web.StaticFileHandler, {"path": STATIC_DIR}),
    ]
    if dev_mode:
        routes.append(
            (r"/__dev__/version", DevVersionHandler, {"version_func": compute_dev_version})
        )
    return tornado.web.Application(routes, **settings)


def main():
    parser = argparse.ArgumentParser(description="Local web terminal (Tornado)")
    parser.add_argument("--host", default="127.0.0.1", help="Bind host")
    parser.add_argument("--port", type=int, default=8765, help="Bind port")
    parser.add_argument(
        "--shell",
        default=resolve_default_shell(),
        help="Shell to launch",
    )
    parser.add_argument(
        "--cwd",
        default=os.getcwd(),
        help="Working directory for the shell",
    )
    parser.add_argument(
        "--dev",
        action="store_true",
        help="Enable auto-reload on code changes",
    )
    args = parser.parse_args()

    if args.dev:
        tornado.autoreload.start()
        tornado.autoreload.watch(os.path.abspath(__file__))
        for root, _, files in os.walk(STATIC_DIR):
            for name in files:
                tornado.autoreload.watch(os.path.join(root, name))

    app = make_app(args.shell, args.cwd, dev_mode=args.dev)
    app.listen(args.port, args.host)
    print(f"Web terminal running at http://{args.host}:{args.port}")
    tornado.ioloop.IOLoop.current().start()


if __name__ == "__main__":
    main()
