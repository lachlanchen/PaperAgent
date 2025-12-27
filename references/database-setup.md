# Database Setup (Postgres)

This repo includes a simple bootstrap to create `paperagent_db` and tables
for users, projects, and Codex sessions.

## 1) Create `.env`

Copy and edit the example:

```
cp .env.example .env
```

Set `DB_USER`, `DB_PASSWORD`, and `DB_NAME` as needed.

## 2) Initialize the database

Run:

```
./scripts/init_db.sh
```

This will:
- create/update the Postgres role
- create the database if missing
- apply `scripts/db_schema.sql`

## 3) Codex logging (default on)

Codex logging is enabled by default when the database is reachable. To disable it,
set in `.env`:

```
CODEX_LOG_DB=0
```

Then install the Postgres driver in your Python environment (Python 3.13+ prefers psycopg v3):

```
pip install "psycopg[binary]"
```

If you are on Python <= 3.12 you can also use:

```
pip install psycopg2-binary
```

Restart the web server after editing `.env`.

Tip: When the DB is reachable, Codex resume uses the last logged terminal output
to refill history if the in-memory buffer is empty.

## 4) Codex session persistence

When the DB is reachable, the web app can restore the last Codex session for a
`user/project` pair using `/api/codex/latest`. The UI prefers the stored session
ID (localStorage) and falls back to the latest DB session on first load.

If a session ID is requested but not currently running, the server can recreate
the Codex process with the same session ID and replay the stored history. This
is controlled by:

```
CODEX_AUTO_RESTORE=1
```

(`1` is the default.)

You can control how much history is replayed with:

```
CODEX_HISTORY_MESSAGES=1000
```

Set it to `0` to replay the full stored history (may be large).

The `projects` table also stores `git_remote` so the UI can prefill the remote URL.
The `users` table stores `git_name` and `git_email` for git identity persistence.
