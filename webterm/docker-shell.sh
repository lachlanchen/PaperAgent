#!/usr/bin/env bash
set -euo pipefail

container="${WEBTERM_CONTAINER:-paperagent-sandbox}"
workdir="${WEBTERM_WORKDIR:-/workspace}"

exec docker exec -it -w "$workdir" "$container" bash
