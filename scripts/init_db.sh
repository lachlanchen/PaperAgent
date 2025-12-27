#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

ENV_FILE="${ENV_FILE:-$PROJECT_ROOT/.env}"
if [[ -f "$ENV_FILE" ]]; then
  while IFS= read -r line; do
    line="${line%%$'\r'}"
    [[ -z "$line" || "$line" =~ ^[[:space:]]*# ]] && continue
    [[ "$line" != *"="* ]] && continue
    key="${line%%=*}"
    value="${line#*=}"
    key="${key#"${key%%[![:space:]]*}"}"
    key="${key%"${key##*[![:space:]]}"}"
    value="${value#"${value%%[![:space:]]*}"}"
    value="${value%"${value##*[![:space:]]}"}"
    value="${value%\"}"
    value="${value#\"}"
    value="${value%\'}"
    value="${value#\'}"
    case "$key" in
      DB_* ) export "$key=$value" ;;
    esac
  done < "$ENV_FILE"
fi

DB_NAME="${DB_NAME:-paperagent_db}"
DB_USER="${DB_USER:-lachlan}"
DB_PASSWORD="${DB_PASSWORD:-change_me}"
DB_HOST="${DB_HOST:-localhost}"
DB_PORT="${DB_PORT:-5432}"

log() {
  printf "[db-init] %s\n" "$*"
}

if ! command -v psql >/dev/null 2>&1; then
  log "psql not found. Install PostgreSQL client tools first."
  exit 1
fi

if [[ "$(id -u)" -ne 0 ]]; then
  if ! sudo -n true >/dev/null 2>&1; then
    log "sudo access required. Run 'sudo -v' and re-run this script."
    exit 1
  fi
fi

log "Creating role/database if needed..."
sudo -u postgres psql -v ON_ERROR_STOP=1 \
  -v db_user="$DB_USER" \
  -v db_password="$DB_PASSWORD" \
  -v db_name="$DB_NAME" <<'SQL'
DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = :'db_user') THEN
    EXECUTE format('CREATE ROLE %I LOGIN PASSWORD %L', :'db_user', :'db_password');
  ELSE
    EXECUTE format('ALTER ROLE %I WITH PASSWORD %L', :'db_user', :'db_password');
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_database WHERE datname = :'db_name') THEN
    EXECUTE format('CREATE DATABASE %I OWNER %I', :'db_name', :'db_user');
  END IF;
END $$;

GRANT ALL PRIVILEGES ON DATABASE :db_name TO :db_user;
SQL

log "Applying schema..."
PGPASSWORD="$DB_PASSWORD" psql \
  -h "$DB_HOST" -p "$DB_PORT" \
  -U "$DB_USER" -d "$DB_NAME" \
  -v ON_ERROR_STOP=1 \
  -f "$PROJECT_ROOT/scripts/db_schema.sql"

log "Done."
