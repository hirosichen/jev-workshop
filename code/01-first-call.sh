#!/usr/bin/env bash
# Demo 1: verify key, then one Noul question. Usage: ./01-first-call.sh
set -euo pipefail
[ -f .env ] && set -a && . ./.env && set +a
: "${TYPESAFE_API_KEY:?set TYPESAFE_API_KEY (see .env.example)}"

echo "== GET /v1/models =="
curl -s https://api.typesafe.ai/v1/models -H "Authorization: Bearer $TYPESAFE_API_KEY"
echo; echo "== POST /v1/systemone =="
curl -s https://api.typesafe.ai/v1/systemone \
  -H "Authorization: Bearer $TYPESAFE_API_KEY" \
  -H "Content-Type: application/json" \
  --data @first-request.json
echo
