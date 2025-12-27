import argparse
import json
import logging
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
import time
import uuid
from collections import deque


def load_dotenv(path):
    if not path or not os.path.isfile(path):
        return
    try:
        with open(path, "r", encoding="utf-8") as handle:
            for raw in handle:
                line = raw.strip()
                if not line or line.startswith("#") or "=" not in line:
                    continue
                key, value = line.split("=", 1)
                key = key.strip()
                value = value.strip().strip('"').strip("'")
                if key and key not in os.environ:
                    os.environ[key] = value
    except OSError:
        pass
from urllib.parse import urlparse

import tornado.ioloop
import tornado.web
import tornado.websocket
import tornado.autoreload

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
STATIC_DIR = os.path.join(BASE_DIR, "static")
SAFE_SEGMENT = re.compile(r"[^a-zA-Z0-9._-]+")
SAFE_PDF = re.compile(r"^[a-zA-Z0-9._-]+\.pdf$", re.IGNORECASE)
CODEX_WORK_RE = re.compile(
    r"(?:^|[\r\n])\s*[\u2022\u25e6][^\r\n]*esc to interrupt",
    re.IGNORECASE,
)
CODEX_DONE_RE = re.compile(r"(?:^|[\r\n])\u2500 Worked for ")
CODEX_PROMPT_RE = re.compile(r"(?:^|[\r\n])\u203a\s")
CODEX_CLI_SESSION_RE = re.compile(r"Session:\s*([0-9a-f-]{8,})", re.IGNORECASE)
MAX_FILE_BYTES = 1024 * 1024
logger = logging.getLogger("paperterm")


class QuietAccessFilter(logging.Filter):
    def __init__(self):
        super().__init__()
        self.enabled = os.environ.get("WEBTERM_QUIET_LOGS", "1").lower() in (
            "1",
            "true",
            "yes",
        )

    def filter(self, record):
        if not self.enabled:
            return True
        message = record.getMessage()
        if not message:
            return True
        parts = message.split(" ", 1)
        try:
            status = int(parts[0])
        except (ValueError, IndexError):
            return True
        if status >= 400:
            if status == 404 and "GET /api/project" in message:
                return False
            if status == 404 and "GET /__dev__/version" in message:
                return False
            return True
        if "GET /api/file" in message and "meta=1" in message:
            return False
        if "GET /api/codex/sessions" in message:
            return False
        if "GET /api/codex/history" in message:
            return False
        if "GET /api/project" in message:
            return False
        if "GET /api/user" in message:
            return False
        if "GET /__dev__/version" in message:
            return False
        if (
            "GET /static/" in message
            or "GET /manifest.json" in message
            or "GET /icon.svg" in message
            or "GET /sw.js" in message
        ):
            return False
        return True


def get_codex_max_buffer():
    return int(os.environ.get("CODEX_MAX_BUFFER", "40000"))


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


def normalize_remote(value):
    if not value:
        return ""
    trimmed = value.strip()
    if not trimmed:
        return ""
    return trimmed[:512]


def normalize_user_field(value, max_len=200):
    if not value:
        return ""
    trimmed = value.strip()
    if not trimmed:
        return ""
    return trimmed[:max_len]


def get_db_params():
    return {
        "host": os.environ.get("DB_HOST", "localhost"),
        "port": os.environ.get("DB_PORT", "5432"),
        "dbname": os.environ.get("DB_NAME", "paperagent_db"),
        "user": os.environ.get("DB_USER", "lachlan"),
        "password": os.environ.get("DB_PASSWORD", ""),
    }


def open_db_connection():
    params = get_db_params()
    errors = []
    try:
        import psycopg2

        return psycopg2.connect(**params), None
    except Exception as exc:
        errors.append(f"psycopg2: {exc}")
    try:
        import psycopg

        return psycopg.connect(**params), None
    except Exception as exc:
        errors.append(f"psycopg: {exc}")
    return None, "; ".join(errors)


def resolve_container_name():
    container = os.environ.get("WEBTERM_CONTAINER")
    if container:
        return container
    docker_shell = os.path.join(BASE_DIR, "docker-shell.sh")
    if os.path.isfile(docker_shell):
        return "paperagent-sandbox"
    return None


def resolve_codex_command(username=None, project=None):
    cmd = os.environ.get("CODEX_CMD", "codex")
    args = shlex.split(os.environ.get("CODEX_ARGS", "-s danger-full-access -a never"))
    default_project = os.environ.get("CODEX_PROJECT", "demo-paper")
    default_user = os.environ.get("CODEX_USERNAME", "paperagent")
    user = username or default_user
    project_id = project or default_project
    fallback_cwd = os.environ.get("CODEX_CWD", "/workspace")
    cwd = f"/home/{user}/Projects/{project_id}"
    if not user or not project_id:
        cwd = fallback_cwd
    container = resolve_container_name()
    if container and shutil.which("docker"):
        nvm_dir = os.environ.get("CODEX_NVM_DIR") or os.environ.get("NVM_DIR") or "/root/.nvm"
        nvm_init = (
            f'export NVM_DIR={shlex.quote(nvm_dir)}; '
            f'[ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh"; '
        )
        quoted = " ".join([shlex.quote(cmd)] + [shlex.quote(arg) for arg in args])
        shell_cmd = f"{nvm_init}cd {shlex.quote(cwd)} 2>/dev/null || cd {shlex.quote(fallback_cwd)}; {quoted}"
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


class SshKeyHandler(tornado.web.RequestHandler):
    def get(self):
        user = sanitize_segment(self.get_argument("user", "paperagent"), "paperagent")
        key_name = sanitize_segment(f"{user}_paperagent_ed25519", "paperagent_ed25519")
        key_path = f"/home/{user}/.ssh/{key_name}.pub"
        data = read_file_bytes(key_path)
        if not data:
            self.set_status(404)
            self.set_header("Content-Type", "application/json")
            self.write({"error": "ssh key not found"})
            return
        self.set_header("Content-Type", "text/plain; charset=utf-8")
        self.set_header("Cache-Control", "no-store")
        self.write(data.decode("utf-8", errors="replace"))


class ProjectStore:
    def __init__(self):
        self.enabled = os.environ.get("PROJECT_DB", "1").lower() in ("1", "true", "yes")
        self._conn = None
        self._connect_error = None
        self._connect_error_logged = False

    def _log_connect_error(self):
        if self._connect_error and not self._connect_error_logged:
            logger.warning("ProjectStore disabled: %s", self._connect_error)
            self._connect_error_logged = True

    def _connect(self):
        if not self.enabled:
            return None
        if self._conn:
            return self._conn
        if self._connect_error:
            self._log_connect_error()
            return None
        conn, error = open_db_connection()
        if not conn:
            self._connect_error = error or "unknown db error"
            self._log_connect_error()
            return None
        self._conn = conn
        self._conn.autocommit = True
        return self._conn

    def _ensure_user(self, username):
        conn = self._connect()
        if not conn:
            return None
        try:
            with conn.cursor() as cur:
                cur.execute(
                    """
                    INSERT INTO users (username)
                    VALUES (%s)
                    ON CONFLICT (username)
                    DO UPDATE SET username = EXCLUDED.username
                    RETURNING id
                    """,
                    (username,),
                )
                row = cur.fetchone()
                return row[0] if row else None
        except Exception as exc:
            logger.error("ProjectStore user upsert failed: %s", exc)
            return None

    def upsert_project(self, username, project_id, root_path, git_remote):
        conn = self._connect()
        if not conn:
            return False
        user_id = self._ensure_user(username)
        if not user_id:
            return False
        try:
            with conn.cursor() as cur:
                cur.execute(
                    """
                    INSERT INTO projects (user_id, project_id, root_path, git_remote)
                    VALUES (%s, %s, %s, %s)
                    ON CONFLICT (user_id, project_id)
                    DO UPDATE SET
                      root_path = EXCLUDED.root_path,
                      git_remote = EXCLUDED.git_remote
                    """,
                    (user_id, project_id, root_path, git_remote),
                )
            return True
        except Exception as exc:
            logger.error("ProjectStore project upsert failed: %s", exc)
            return False

    def fetch_project(self, username, project_id):
        conn = self._connect()
        if not conn:
            return None
        try:
            with conn.cursor() as cur:
                cur.execute(
                    """
                    SELECT p.project_id, p.root_path, p.git_remote
                    FROM projects p
                    JOIN users u ON u.id = p.user_id
                    WHERE u.username = %s AND p.project_id = %s
                    LIMIT 1
                    """,
                    (username, project_id),
                )
                row = cur.fetchone()
                if not row:
                    return None
                return {
                    "project_id": row[0],
                    "root_path": row[1],
                    "git_remote": row[2],
                }
        except Exception as exc:
            logger.error("ProjectStore project fetch failed: %s", exc)
            return None

    def upsert_user_git(self, username, git_name, git_email):
        conn = self._connect()
        if not conn:
            return False
        user_id = self._ensure_user(username)
        if not user_id:
            return False
        name_value = git_name or None
        email_value = git_email or None
        try:
            with conn.cursor() as cur:
                cur.execute(
                    """
                    UPDATE users
                    SET git_name = %s,
                        git_email = %s
                    WHERE id = %s
                    """,
                    (name_value, email_value, user_id),
                )
            return True
        except Exception as exc:
            logger.error("ProjectStore user git update failed: %s", exc)
            return False

    def fetch_user_git(self, username):
        conn = self._connect()
        if not conn:
            return None
        try:
            with conn.cursor() as cur:
                cur.execute(
                    """
                    SELECT git_name, git_email
                    FROM users
                    WHERE username = %s
                    LIMIT 1
                    """,
                    (username,),
                )
                row = cur.fetchone()
                if not row:
                    return None
                return {
                    "git_name": row[0] or "",
                    "git_email": row[1] or "",
                }
        except Exception as exc:
            logger.error("ProjectStore user git fetch failed: %s", exc)
            return None


class ProjectHandler(tornado.web.RequestHandler):
    def initialize(self, store):
        self.store = store

    def write_error_json(self, status, message):
        self.set_status(status)
        self.set_header("Content-Type", "application/json")
        self.write({"error": message})

    def get(self):
        username = sanitize_segment(self.get_argument("user", "paperagent"), "paperagent")
        project_id = sanitize_segment(self.get_argument("project", "demo-paper"), "demo-paper")
        data = self.store.fetch_project(username, project_id)
        if not data:
            if not self.store.enabled or self.store._connect_error:
                self.set_header("Content-Type", "application/json")
                self.set_header("Cache-Control", "no-store")
                self.write(
                    {
                        "ok": False,
                        "disabled": True,
                        "reason": self.store._connect_error or "project store disabled",
                    }
                )
                return
            self.write_error_json(404, "project not found")
            return
        self.set_header("Content-Type", "application/json")
        self.set_header("Cache-Control", "no-store")
        self.write(
            {
                "user": username,
                "project": project_id,
                "root_path": data.get("root_path"),
                "git_remote": data.get("git_remote"),
            }
        )

    def post(self):
        try:
            payload = json.loads(self.request.body.decode("utf-8"))
        except (json.JSONDecodeError, UnicodeDecodeError):
            self.write_error_json(400, "invalid json")
            return
        username = sanitize_segment(payload.get("user") or "paperagent", "paperagent")
        project_id = sanitize_segment(payload.get("project") or "demo-paper", "demo-paper")
        git_remote = normalize_remote(payload.get("git_remote", ""))
        root_path = f"/home/{username}/Projects/{project_id}"
        if not self.store.upsert_project(username, project_id, root_path, git_remote):
            logger.warning(
                "ProjectStore unavailable for %s/%s (remote: %s)",
                username,
                project_id,
                git_remote,
            )
            if not self.store.enabled or self.store._connect_error:
                self.set_header("Content-Type", "application/json")
                self.set_header("Cache-Control", "no-store")
                self.write(
                    {
                        "ok": False,
                        "disabled": True,
                        "reason": self.store._connect_error or "project store disabled",
                    }
                )
                return
            self.write_error_json(503, "database unavailable")
            return
        self.set_header("Content-Type", "application/json")
        self.set_header("Cache-Control", "no-store")
        self.write({"ok": True, "user": username, "project": project_id})


class UserHandler(tornado.web.RequestHandler):
    def initialize(self, store):
        self.store = store

    def write_error_json(self, status, message):
        self.set_status(status)
        self.set_header("Content-Type", "application/json")
        self.write({"error": message})

    def get(self):
        username = sanitize_segment(self.get_argument("user", "paperagent"), "paperagent")
        if not self.store.enabled or self.store._connect_error:
            self.set_header("Content-Type", "application/json")
            self.set_header("Cache-Control", "no-store")
            self.write(
                {
                    "ok": False,
                    "disabled": True,
                    "reason": self.store._connect_error or "user store disabled",
                    "user": username,
                    "git_name": "",
                    "git_email": "",
                }
            )
            return
        data = self.store.fetch_user_git(username)
        if not data:
            self.set_header("Content-Type", "application/json")
            self.set_header("Cache-Control", "no-store")
            self.write(
                {
                    "ok": True,
                    "user": username,
                    "git_name": "",
                    "git_email": "",
                }
            )
            return
        self.set_header("Content-Type", "application/json")
        self.set_header("Cache-Control", "no-store")
        self.write(
            {
                "ok": True,
                "user": username,
                "git_name": data.get("git_name", ""),
                "git_email": data.get("git_email", ""),
            }
        )

    def post(self):
        try:
            payload = json.loads(self.request.body.decode("utf-8"))
        except (json.JSONDecodeError, UnicodeDecodeError):
            self.write_error_json(400, "invalid json")
            return
        username = sanitize_segment(payload.get("user") or "paperagent", "paperagent")
        git_name = normalize_user_field(payload.get("git_name", ""), max_len=120)
        git_email = normalize_user_field(payload.get("git_email", ""), max_len=120)
        if not self.store.upsert_user_git(username, git_name, git_email):
            logger.warning(
                "UserStore unavailable for %s (git_name=%s, git_email=%s)",
                username,
                git_name,
                git_email,
            )
            if not self.store.enabled or self.store._connect_error:
                self.set_header("Content-Type", "application/json")
                self.set_header("Cache-Control", "no-store")
                self.write(
                    {
                        "ok": False,
                        "disabled": True,
                        "reason": self.store._connect_error or "user store disabled",
                    }
                )
                return
            self.write_error_json(503, "database unavailable")
            return
        self.set_header("Content-Type", "application/json")
        self.set_header("Cache-Control", "no-store")
        self.write({"ok": True, "user": username})


class CodexLogger:
    def __init__(self):
        self.enabled = os.environ.get("CODEX_LOG_DB", "1").lower() in ("1", "true", "yes")
        self.log_output = (
            os.environ.get("CODEX_LOG_OUTPUT", "1").lower() in ("1", "true", "yes")
        )
        self.username = os.environ.get("CODEX_USERNAME", "")
        self.project = os.environ.get("CODEX_PROJECT", "")
        self.history_messages = int(os.environ.get("CODEX_HISTORY_MESSAGES", "1000"))
        self._conn = None
        self._connect_error = None

    def _connect(self):
        if not self.enabled:
            return None
        if self._conn:
            return self._conn
        if self._connect_error:
            return None
        conn, error = open_db_connection()
        if not conn:
            self._connect_error = error or "unknown db error"
            return None
        self._conn = conn
        self._conn.autocommit = True
        return self._conn

    def log_session(self, session_id, username=None, project=None):
        conn = self._connect()
        if not conn:
            return
        name = username or self.username or None
        proj = project or self.project or None
        try:
            with conn.cursor() as cur:
                cur.execute(
                    """
                    INSERT INTO codex_sessions (session_id, username, project_id)
                    VALUES (%s, %s, %s)
                    ON CONFLICT (session_id)
                    DO UPDATE SET
                      username = EXCLUDED.username,
                      project_id = EXCLUDED.project_id,
                      updated_at = NOW()
                    """,
                    (session_id, name, proj),
                )
        except Exception:
            return

    def log_cli_session_id(self, session_id, cli_session_id):
        if not cli_session_id:
            return
        conn = self._connect()
        if not conn:
            return
        try:
            with conn.cursor() as cur:
                cur.execute(
                    """
                    UPDATE codex_sessions
                    SET cli_session_id = %s,
                        updated_at = NOW()
                    WHERE session_id = %s
                    """,
                    (cli_session_id, session_id),
                )
        except Exception:
            return

    def log_message(self, session_id, role, content):
        if role == "assistant" and not self.log_output:
            return
        conn = self._connect()
        if not conn:
            return
        try:
            with conn.cursor() as cur:
                cur.execute(
                    """
                    INSERT INTO codex_messages (session_id, role, content)
                    VALUES (%s, %s, %s)
                    """,
                    (session_id, role, content),
                )
                cur.execute(
                    """
                    UPDATE codex_sessions
                    SET updated_at = NOW()
                    WHERE session_id = %s
                    """,
                    (session_id,),
                )
        except Exception:
            return

    def fetch_output_history(self, session_id):
        conn = self._connect()
        if not conn:
            return ""
        limit = self.history_messages
        try:
            with conn.cursor() as cur:
                if limit <= 0:
                    cur.execute(
                        """
                        SELECT content
                        FROM codex_messages
                        WHERE session_id = %s AND role = 'assistant'
                        ORDER BY created_at ASC
                        """,
                        (session_id,),
                    )
                    rows = cur.fetchall()
                else:
                    bounded = max(1, min(limit, 5000))
                    cur.execute(
                        """
                        SELECT content
                        FROM codex_messages
                        WHERE session_id = %s AND role = 'assistant'
                        ORDER BY created_at DESC
                        LIMIT %s
                        """,
                        (session_id, bounded),
                    )
                    rows = cur.fetchall()
        except Exception:
            return ""
        if not rows:
            return ""
        if limit > 0:
            rows.reverse()
        return "".join((row[0] or "") for row in rows)

    def fetch_latest_session(self, username=None, project=None):
        conn = self._connect()
        if not conn:
            return None
        name = username or None
        proj = project or None
        try:
            with conn.cursor() as cur:
                cur.execute(
                    """
                    SELECT session_id, username, project_id, cli_session_id, updated_at
                    FROM codex_sessions
                    WHERE (%s IS NULL OR username = %s)
                      AND (%s IS NULL OR project_id = %s)
                    ORDER BY updated_at DESC
                    LIMIT 1
                    """,
                    (name, name, proj, proj),
                )
                row = cur.fetchone()
        except Exception:
            return None
        if not row:
            return None
        return {
            "session_id": row[0],
            "username": row[1],
            "project_id": row[2],
            "cli_session_id": row[3],
            "updated_at": row[4].isoformat() if row[4] else None,
        }

    def list_sessions(self, username=None, project=None, limit=50):
        conn = self._connect()
        if not conn:
            return []
        name = username or None
        proj = project or None
        try:
            with conn.cursor() as cur:
                if limit is None or limit <= 0:
                    cur.execute(
                        """
                        SELECT session_id, username, project_id, cli_session_id, updated_at
                        FROM codex_sessions
                        WHERE (%s IS NULL OR username = %s)
                          AND (%s IS NULL OR project_id = %s)
                        ORDER BY updated_at DESC
                        """,
                        (name, name, proj, proj),
                    )
                else:
                    bounded = max(1, min(limit, 200))
                    cur.execute(
                        """
                        SELECT session_id, username, project_id, cli_session_id, updated_at
                        FROM codex_sessions
                        WHERE (%s IS NULL OR username = %s)
                          AND (%s IS NULL OR project_id = %s)
                        ORDER BY updated_at DESC
                        LIMIT %s
                        """,
                        (name, name, proj, proj, bounded),
                    )
                rows = cur.fetchall()
        except Exception:
            return []
        sessions = []
        for row in rows or []:
            sessions.append(
                {
                    "session_id": row[0],
                    "username": row[1],
                    "project_id": row[2],
                    "cli_session_id": row[3],
                    "updated_at": row[4].isoformat() if row[4] else None,
                }
            )
        return sessions


class CodexSession:
    def __init__(self, session_id, logger=None, username=None, project=None):
        self.session_id = session_id
        self.max_buffer = get_codex_max_buffer()
        self.buffer = deque()
        self.buffer_len = 0
        self.clients = set()
        self.master_fd = None
        self.proc = None
        self._closed = False
        self._loop = tornado.ioloop.IOLoop.current()
        self.logger = logger
        self.username = username
        self.project = project
        self.created_at = time.time()
        self.last_activity = self.created_at
        self.state = "running"
        self.run_state = "idle"
        self._run_state_buffer = ""
        self._had_work_line = False
        self.cli_session_id = None
        if self.logger:
            self.logger.log_session(self.session_id, self.username, self.project)
        self._spawn()

    def _spawn(self):
        self.master_fd, slave_fd = pty.openpty()
        env = os.environ.copy()
        env.setdefault("TERM", "xterm-256color")
        cmd, cwd = resolve_codex_command(self.username, self.project)
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
        set_pty_size(self.master_fd, 30, 120)
        self._loop.add_handler(self.master_fd, self._on_read, self._loop.READ)

    def _append_buffer(self, data):
        if not data:
            return
        self.buffer.append(data)
        self.buffer_len += len(data)
        while self.buffer_len > self.max_buffer and self.buffer:
            dropped = self.buffer.popleft()
            self.buffer_len -= len(dropped)
        self.last_activity = time.time()

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

    def _set_run_state(self, state):
        if state == self.run_state:
            return
        self.run_state = state
        self._broadcast({"type": "run_state", "state": state})

    def _update_run_state(self, text):
        if not text:
            return
        self._run_state_buffer = f"{self._run_state_buffer}{text}"[-2000:]
        if CODEX_WORK_RE.search(self._run_state_buffer):
            self._had_work_line = True
            self._set_run_state("running")
            return
        if self._had_work_line and (
            CODEX_DONE_RE.search(self._run_state_buffer)
            or CODEX_PROMPT_RE.search(self._run_state_buffer)
        ):
            self._had_work_line = False
            self._run_state_buffer = ""
            self._set_run_state("idle")

    def _update_cli_session_id(self, text):
        if not text:
            return
        match = None
        for entry in CODEX_CLI_SESSION_RE.finditer(text):
            match = entry
        if not match:
            return
        cli_id = match.group(1)
        if not cli_id or cli_id == self.cli_session_id:
            return
        self.cli_session_id = cli_id
        if self.logger:
            self.logger.log_cli_session_id(self.session_id, cli_id)
        self._broadcast({"type": "cli_session", "id": cli_id})

    def note_user_input(self):
        self._had_work_line = False
        self._run_state_buffer = ""
        self._set_run_state("idle")

    def _on_read(self, fd, events):
        try:
            data = os.read(fd, 4096)
        except OSError:
            data = b""
        if not data:
            self.state = "closed"
            self._broadcast({"type": "status", "state": "closed"})
            self.close()
            return
        if b"\x1b[6n" in data and self.master_fd is not None:
            try:
                os.write(self.master_fd, b"\x1b[1;1R")
            except OSError:
                pass
            data = data.replace(b"\x1b[6n", b"")
        text = data.decode("utf-8", errors="ignore")
        self._append_buffer(text)
        self._update_run_state(text)
        self._update_cli_session_id(text)
        if self.logger:
            self.logger.log_message(self.session_id, "assistant", text)
        self._broadcast({"type": "output", "data": text})

    def attach(self, client):
        self.clients.add(client)
        self.last_activity = time.time()
        if self.logger:
            self.logger.log_session(self.session_id, self.username, self.project)
        if self.buffer:
            history = "".join(self.buffer)
            client.write_message(json.dumps({"type": "history", "data": history}))
        elif self.logger:
            history = self.logger.fetch_output_history(self.session_id)
            if history:
                client.write_message(json.dumps({"type": "history", "data": history}))
        client.write_message(
            json.dumps(
                {"type": "status", "state": "ready", "run_state": self.run_state}
            )
        )
        client.write_message(json.dumps({"type": "run_state", "state": self.run_state}))
        if self.cli_session_id:
            client.write_message(
                json.dumps({"type": "cli_session", "id": self.cli_session_id})
            )

    def detach(self, client):
        self.clients.discard(client)

    def send_input(self, text):
        if self._closed or self.master_fd is None:
            return
        self.last_activity = time.time()
        self.note_user_input()
        payload = text.replace("\r", "")
        if "\n" in payload:
            payload = payload.replace("\n", "\r")
        if not payload:
            payload = "\r"
        elif not payload.endswith("\r"):
            payload = payload + "\r"
        os.write(self.master_fd, payload.encode())

    def send_raw(self, data):
        if self._closed or self.master_fd is None:
            return
        self.last_activity = time.time()
        if isinstance(data, str):
            os.write(self.master_fd, data.encode())
        else:
            os.write(self.master_fd, data)

    def resize(self, rows, cols):
        if self._closed or self.master_fd is None:
            return
        try:
            set_pty_size(self.master_fd, rows, cols)
            if self.proc and self.proc.poll() is None:
                os.killpg(os.getpgid(self.proc.pid), signal.SIGWINCH)
        except OSError:
            pass

    def stop(self):
        self.state = "stopping"
        self._broadcast({"type": "status", "state": "stopping"})
        self.close()

    def close(self):
        if self._closed:
            return
        self._closed = True
        if self.state != "closed":
            self.state = "closed"
            self._broadcast({"type": "status", "state": "closed"})
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
        self.logger = CodexLogger()

    def get(self, session_id):
        session = self.sessions.get(session_id)
        if session and not session._closed:
            return session
        return None

    def get_or_create(self, session_id, username=None, project=None):
        session = self.get(session_id)
        if session:
            return session
        session = CodexSession(
            session_id,
            logger=self.logger,
            username=username,
            project=project,
        )
        self.sessions[session_id] = session
        return session

    def stop(self, session_id):
        session = self.sessions.get(session_id)
        if not session:
            return
        session.stop()
        self.sessions.pop(session_id, None)

    def restart(self, session_id, username=None, project=None):
        self.stop(session_id)
        return self.get_or_create(session_id, username, project)

    def list_sessions(self, username=None, project=None):
        sessions = []
        stale = []
        for session_id, session in self.sessions.items():
            if session._closed:
                stale.append(session_id)
                continue
            if session.proc and session.proc.poll() is not None:
                stale.append(session_id)
                continue
            if username and session.username and session.username != username:
                continue
            if project and session.project and session.project != project:
                continue
            state = session.state
            if state == "running":
                state = "attached" if session.clients else "idle"
            sessions.append(
                {
                    "id": session_id,
                    "username": session.username,
                    "project": session.project,
                    "state": state,
                    "cli_session_id": session.cli_session_id,
                    "run_state": session.run_state,
                    "clients": len(session.clients),
                    "created_at": session.created_at,
                    "last_activity": session.last_activity,
                }
            )
        for session_id in stale:
            self.sessions.pop(session_id, None)
        sessions.sort(
            key=lambda entry: entry.get("last_activity") or entry.get("created_at") or 0,
            reverse=True,
        )
        return sessions


class CodexSessionsHandler(tornado.web.RequestHandler):
    def initialize(self, manager):
        self.manager = manager

    def get(self):
        username = sanitize_segment(self.get_argument("user", ""), "")
        project = sanitize_segment(self.get_argument("project", ""), "")
        sessions = self.manager.list_sessions(username or None, project or None)
        self.set_header("Content-Type", "application/json")
        self.set_header("Cache-Control", "no-store")
        self.write({"sessions": sessions})


class CodexLatestHandler(tornado.web.RequestHandler):
    def initialize(self, manager):
        self.manager = manager

    def get(self):
        username = sanitize_segment(self.get_argument("user", ""), "")
        project = sanitize_segment(self.get_argument("project", ""), "")
        logger_ref = getattr(self.manager, "logger", None)
        if not logger_ref or not logger_ref.enabled:
            self.set_header("Content-Type", "application/json")
            self.set_header("Cache-Control", "no-store")
            self.write(
                {
                    "ok": False,
                    "disabled": True,
                    "reason": "codex db logging disabled",
                }
            )
            return
        session = logger_ref.fetch_latest_session(username or None, project or None)
        if not session:
            if logger_ref._connect_error:
                self.set_header("Content-Type", "application/json")
                self.set_header("Cache-Control", "no-store")
                self.write(
                    {
                        "ok": False,
                        "disabled": True,
                        "reason": logger_ref._connect_error,
                    }
                )
                return
            self.set_header("Content-Type", "application/json")
            self.set_header("Cache-Control", "no-store")
            self.write({"ok": False})
            return
        active = None
        if self.manager:
            active = self.manager.get(session.get("session_id"))
        payload = {
            "ok": True,
            "session": session,
        }
        if active:
            payload["session"]["run_state"] = active.run_state
            payload["session"]["state"] = "attached" if active.clients else "idle"
            if active.cli_session_id:
                payload["session"]["cli_session_id"] = active.cli_session_id
        self.set_header("Content-Type", "application/json")
        self.set_header("Cache-Control", "no-store")
        self.write(payload)


class CodexHistoryHandler(tornado.web.RequestHandler):
    def initialize(self, manager):
        self.manager = manager

    def get(self):
        username = sanitize_segment(self.get_argument("user", ""), "")
        project = sanitize_segment(self.get_argument("project", ""), "")
        try:
            limit = int(self.get_argument("limit", "50"))
        except ValueError:
            limit = 50
        logger_ref = getattr(self.manager, "logger", None)
        if not logger_ref or not logger_ref.enabled:
            self.set_header("Content-Type", "application/json")
            self.set_header("Cache-Control", "no-store")
            self.write(
                {
                    "ok": False,
                    "disabled": True,
                    "reason": "codex db logging disabled",
                }
            )
            return
        sessions = logger_ref.list_sessions(username or None, project or None, limit)
        if not sessions and logger_ref._connect_error:
            self.set_header("Content-Type", "application/json")
            self.set_header("Cache-Control", "no-store")
            self.write(
                {
                    "ok": False,
                    "disabled": True,
                    "reason": logger_ref._connect_error,
                }
            )
            return
        self.set_header("Content-Type", "application/json")
        self.set_header("Cache-Control", "no-store")
        self.write({"ok": True, "sessions": sessions})


class CodexWebSocket(tornado.websocket.WebSocketHandler):
    def initialize(self, manager):
        self.manager = manager
        self.session = None
        self.session_id = None
        self.username = None
        self.project = None

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
        username = sanitize_segment(self.get_argument("user", ""), "")
        project = sanitize_segment(self.get_argument("project", ""), "")
        self.username = username or None
        self.project = project or None
        resume = self.get_argument("resume", "0").lower() in ("1", "true", "yes")
        auto_restore = os.environ.get("CODEX_AUTO_RESTORE", "1").lower() in (
            "1",
            "true",
            "yes",
        )
        if resume:
            session = self.manager.get(session_id)
            if not session:
                if not auto_restore:
                    self.write_message(
                        json.dumps({"type": "status", "state": "missing"})
                    )
                    self.close()
                    return
                self.session = self.manager.get_or_create(
                    session_id, username, project
                )
                self.session.attach(self)
                self.write_message(
                    json.dumps({"type": "status", "state": "restored"})
                )
                self.write_message(json.dumps({"type": "session", "id": session_id}))
                return
            self.session = session
        else:
            self.session = self.manager.get_or_create(session_id, username, project)
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
            if payload.get("type") == "resize":
                try:
                    rows = int(payload.get("rows", 24))
                    cols = int(payload.get("cols", 80))
                except (TypeError, ValueError):
                    return
                if self.session:
                    self.session.resize(rows, cols)
                return
            if payload.get("type") == "input":
                data = payload.get("data", "")
                if self.session and data:
                    if "\r" in data or "\n" in data:
                        self.session.note_user_input()
                    self.session.send_raw(data)
                return
            if payload.get("type") == "prompt":
                text = payload.get("text", "")
                if self.session:
                    self.session.note_user_input()
                    self.session.send_input(text)
                if self.session_id and self.manager.logger:
                    self.manager.logger.log_message(self.session_id, "user", text)
                return
            if payload.get("type") == "control":
                action = payload.get("action")
                if action == "stop" and self.session_id:
                    self.manager.stop(self.session_id)
                elif action == "new" and self.session_id:
                    self.session = self.manager.restart(
                        self.session_id, self.username, self.project
                    )
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
    project_store = ProjectStore()
    settings = {
        "static_path": STATIC_DIR,
        "template_path": STATIC_DIR,
        "compress_response": True,
    }
    routes = [
        (r"/", MainHandler),
        (r"/ws", TerminalWebSocket, {"shell": shell, "cwd": cwd}),
        (r"/codex/ws", CodexWebSocket, {"manager": codex_manager}),
        (r"/api/codex/sessions", CodexSessionsHandler, {"manager": codex_manager}),
        (r"/api/codex/latest", CodexLatestHandler, {"manager": codex_manager}),
        (r"/api/codex/history", CodexHistoryHandler, {"manager": codex_manager}),
        (r"/api/pdf", PdfHandler),
        (r"/api/file", FileHandler),
        (r"/api/tree", TreeHandler),
        (r"/api/ssh-key", SshKeyHandler),
        (r"/api/project", ProjectHandler, {"store": project_store}),
        (r"/api/user", UserHandler, {"store": project_store}),
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
    dotenv_path = os.environ.get("ENV_FILE") or os.path.abspath(
        os.path.join(BASE_DIR, "..", ".env")
    )
    load_dotenv(dotenv_path)
    log_level = os.environ.get("WEBTERM_LOG_LEVEL", "INFO").upper()
    logging.basicConfig(
        level=log_level,
        format="%(levelname)s %(asctime)s %(message)s",
    )
    access_logger = logging.getLogger("tornado.access")
    access_logger.addFilter(QuietAccessFilter())
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
