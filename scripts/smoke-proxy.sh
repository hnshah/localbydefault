#!/usr/bin/env bash
set -euo pipefail

CONFIG_PATH=${1:-"${PWD}/../localbydefault-private/lab/config/localbydefault.yaml"}
PORT=${PORT:-4141}

echo "== localbydefault smoke =="
echo "config: ${CONFIG_PATH}"

# Start server in background
node dist/cli.js serve -c "${CONFIG_PATH}" >/tmp/localbydefault-smoke.log 2>&1 &
PID=$!

cleanup() {
  kill ${PID} >/dev/null 2>&1 || true
}
trap cleanup EXIT

sleep 0.6

echo "-- chat completions (local)"
curl -sS -X POST "http://localhost:${PORT}/v1/chat/completions" \
  -H 'Content-Type: application/json' \
  -d '{"model":"qwen2.5-coder:32b","messages":[{"role":"user","content":"Say only: ok"}]}' \
  | head -c 200

echo
echo "-- cloud attempt (warn)"
# May 500 if cloud_base_url unset; we still want audit entry.
curl -sS -X POST "http://localhost:${PORT}/v1/cloud/chat/completions" \
  -H 'Content-Type: application/json' \
  -d '{"model":"gpt-4o-mini","messages":[{"role":"user","content":"Say only: ok"}]}' \
  | head -c 200 || true

echo
echo "-- done; log at /tmp/localbydefault-smoke.log"
