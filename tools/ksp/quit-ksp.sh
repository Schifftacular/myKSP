#!/bin/bash
# Quit KSP without saving: ask politely, then SIGTERM, then SIGKILL.
# KSP writes persistent.sfs on scene changes, not on a quit request, and a
# signal never triggers a save. (Not verified for every mod: some mods write
# their own data on quit.) Best used from the main menu or Space Center.
# Never run this while Mike is playing.
# Exits 0 once no KSP process remains.
set -u
KSP_ROOT="${KSP_ROOT:-/Applications/KSP-RP2000}"
BIN="$KSP_ROOT/KSP.app/Contents/MacOS/KSP"

pid="$(pgrep -f "$BIN" | head -1)"
[ -n "$pid" ] || { echo "KSP is not running."; exit 0; }

gone() { ! kill -0 "$pid" 2>/dev/null; }
wait_gone() { for _ in $(seq 1 "$1"); do gone && return 0; sleep 1; done; return 1; }

echo "Quitting KSP (pid $pid)"
osascript -e "tell application id \"unity.Squad.Kerbal Space Program\" to quit" >/dev/null 2>&1
if wait_gone 20; then echo "KSP quit."; exit 0; fi

echo "Still running; sending SIGTERM"
kill -TERM "$pid" 2>/dev/null
if wait_gone 30; then echo "KSP stopped."; exit 0; fi

echo "Still running; sending SIGKILL"
kill -KILL "$pid" 2>/dev/null
if wait_gone 10; then echo "KSP killed."; exit 0; fi
echo "KSP (pid $pid) would not exit."; exit 1
