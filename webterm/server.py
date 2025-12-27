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
from urllib.parse import urlparse

import tornado.ioloop
import tornado.web
import tornado.websocket
import tornado.autoreload

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
STATIC_DIR = os.path.join(BASE_DIR, "static")
SAFE_SEGMENT = re.compile(r"[^a-zA-Z0-9._-]+")
SAFE_PDF = re.compile(r"^[a-zA-Z0-9._-]+\.pdf$", re.IGNORECASE)


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


def resolve_container_name():
    container = os.environ.get("WEBTERM_CONTAINER")
    if container:
        return container
    docker_shell = os.path.join(BASE_DIR, "docker-shell.sh")
    if os.path.isfile(docker_shell):
        return "paperagent-sandbox"
    return None


def read_pdf_bytes(path):
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
        data = read_pdf_bytes(pdf_path)
        if not data:
            self.set_status(404)
            self.write({"error": "pdf not found"})
            return
        self.set_header("Content-Type", "application/pdf")
        self.set_header("Cache-Control", "no-store")
        self.set_header("Content-Disposition", f'inline; filename="{name}"')
        self.finish(data)


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
    settings = {
        "static_path": STATIC_DIR,
        "template_path": STATIC_DIR,
        "compress_response": True,
    }
    routes = [
        (r"/", MainHandler),
        (r"/ws", TerminalWebSocket, {"shell": shell, "cwd": cwd}),
        (r"/api/pdf", PdfHandler),
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
