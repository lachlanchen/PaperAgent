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

## 3) Enable Codex logging (optional)

Set in `.env`:

```
CODEX_LOG_DB=1
```

Then install the Postgres driver in your Python environment:

```
pip install psycopg2-binary
```

Restart the web server after editing `.env`.
