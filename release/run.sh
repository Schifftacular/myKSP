#!/bin/sh
# Prebuilt bridge + front end: runs with plain Node 20+, no npm install needed.
HERE="$(cd "$(dirname "$0")" && pwd)"
REPO="$(cd "$HERE/.." && pwd)"
export MYKSP_STATIC="${MYKSP_STATIC:-$HERE/ops-center}"
export MYKSP_RECORDINGS="${MYKSP_RECORDINGS:-$REPO/data/recordings}"
exec node "$HERE/bridge.mjs"
