#!/usr/bin/env bash
set -euo pipefail

# Set the admin passkey expected by server/planetary-max.ts.
# Provide ADMIN_PASSKEY through your environment; never commit the secret here.
SECRET_NAME="ADMIN_PASSKEY"
WORKER_NAME="planetary-max"

if [[ -z "${ADMIN_PASSKEY:-}" ]]; then
  echo "Set ADMIN_PASSKEY in your environment before running this script." >&2
  exit 1
fi

printf '%s' "$ADMIN_PASSKEY" | npx wrangler secret put "$SECRET_NAME" --name "$WORKER_NAME"
echo "Successfully updated $SECRET_NAME on Cloudflare Worker $WORKER_NAME."
