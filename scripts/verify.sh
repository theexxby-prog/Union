#!/usr/bin/env bash
# Reconciliation gate for the fixtures. Bundles the TS check with esbuild
# (resolves the extensionless imports Vite uses) and runs it on Node.
set -euo pipefail
cd "$(dirname "$0")/.."

TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT

./node_modules/.bin/esbuild scripts/check-consistency.ts \
  --bundle --platform=node --format=esm \
  --outfile="$TMP/check.mjs" --log-level=warning

node "$TMP/check.mjs"
