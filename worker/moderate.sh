#!/usr/bin/env bash
# Review moderation. Usage: ./moderate.sh list | approve <id> | delete <id>
# Runs against the REMOTE D1 database, so run it only when you mean to.
set -euo pipefail
run() { npx --yes wrangler@4.156.1 d1 execute beanters-counter --remote --command "$1"; }
numeric() { [[ "${1:-}" =~ ^[0-9]+$ ]] || { echo "id must be a number" >&2; exit 2; }; }
case "${1:-}" in
  list)    run "SELECT id, book, stars, name, comment, created_at FROM reviews WHERE status = 'pending' ORDER BY id" ;;
  approve) numeric "${2:-}"; run "UPDATE reviews SET status = 'approved' WHERE id = $2" ;;
  delete)  numeric "${2:-}"; run "DELETE FROM reviews WHERE id = $2" ;;
  *) echo "usage: $0 list | approve <id> | delete <id>" >&2; exit 2 ;;
esac
