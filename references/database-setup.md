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

The `projects` table also stores `git_remote` so the UI can prefill the remote URL.
