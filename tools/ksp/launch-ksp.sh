#!/bin/bash
# Launch the RP-1/RSS KSP install once, then wait until it reaches the main menu.
#   - Exits 0 without launching if KSP is already running (prints its pid).
#   - Uses a lock in /tmp so two callers can't launch at the same time.
#   - Launches through LaunchServices with cwd = the install folder.
#   - Waits up to KSP_READY_TIMEOUT seconds (default 25 min) for the main menu,
#     printing the last log line every 60 s; fails if the log stops moving for
#     KSP_STALL_SECS (default 5 min) or KSP exits.
# Loading is slow: 10 min 23 s measured on 2026-11-06 (an earlier launch took ~14 min).
# A long silence is normal and is NOT a freeze; Player.log
# (~/Library/Logs/Squad/KSP/Player.log) is more current than KSP.log, which is written in bursts.
# The 5-minute stall threshold is untested: the longest gap observed was ~40 s.
# Usage: tools/ksp/launch-ksp.sh            (KSP_ROOT overrides the install path)
set -u

KSP_ROOT="${KSP_ROOT:-/Applications/KSP-RP2000}"
APP="$KSP_ROOT/KSP.app"
BIN="$APP/Contents/MacOS/KSP"
LOG="$KSP_ROOT/KSP.log"
LOCK="/tmp/myksp-launch-ksp.lock"
TIMEOUT="${KSP_READY_TIMEOUT:-1500}"
STALL="${KSP_STALL_SECS:-300}"
MARKER="Scene Change : From LOADING to MAINMENU"

ksp_pid() { pgrep -f "$BIN" | head -1; }

pid="$(ksp_pid)"
if [ -n "$pid" ]; then
  echo "KSP already running (pid $pid); not launching another."
  exit 0
fi

# mkdir is atomic: only one caller gets the lock. A lock whose owner is gone is stale and gets cleared.
if ! mkdir "$LOCK" 2>/dev/null; then
  owner="$(cat "$LOCK/pid" 2>/dev/null)"
  if [ -n "$owner" ] && kill -0 "$owner" 2>/dev/null; then
    echo "Another launch is in progress (launcher pid $owner); not launching."
    exit 0
  fi
  echo "Clearing stale lock $LOCK"
  rm -rf "$LOCK"
  mkdir "$LOCK" || { echo "Could not take lock $LOCK"; exit 1; }
fi
echo $$ > "$LOCK/pid"
trap 'rm -rf "$LOCK"' EXIT

[ -x "$BIN" ] || { echo "KSP binary not found at $BIN"; exit 1; }

start=$(date +%s)
cd "$KSP_ROOT" || exit 1
echo "Launching $APP at $(date '+%H:%M:%S')"
open -n -a "$APP" || { echo "open failed"; exit 1; }

# Wait for the process and a fresh log (KSP truncates KSP.log at startup).
for _ in $(seq 1 60); do
  pid="$(ksp_pid)"
  if [ -n "$pid" ] && [ -f "$LOG" ] && [ "$(stat -f %m "$LOG")" -ge "$start" ]; then break; fi
  sleep 1
done
[ -n "$pid" ] || { echo "KSP process never appeared"; exit 1; }
echo "KSP pid $pid"

last_size=-1; last_change=$(date +%s); last_report=0
while :; do
  now=$(date +%s); elapsed=$((now - start))
  if ! kill -0 "$pid" 2>/dev/null; then
    echo "KSP exited after ${elapsed}s. Last log lines:"; tail -40 "$LOG"; exit 1
  fi
  if grep -aq "$MARKER" "$LOG" 2>/dev/null; then
    echo "Main menu reached after ${elapsed}s ($((elapsed / 60))m $((elapsed % 60))s)."
    exit 0
  fi
  size=$(stat -f %z "$LOG" 2>/dev/null || echo 0)
  if [ "$size" != "$last_size" ]; then last_size=$size; last_change=$now; fi
  if [ $((now - last_change)) -ge "$STALL" ]; then
    echo "KSP log has not changed for $STALL s (stalled?) after ${elapsed}s. KSP is still running; check Player.log before killing it. Last log lines:"
    tail -40 "$LOG"; exit 2
  fi
  if [ "$elapsed" -ge "$TIMEOUT" ]; then
    echo "Timed out after ${elapsed}s without reaching the main menu. Last log lines:"
    tail -40 "$LOG"; exit 3
  fi
  if [ $((now - last_report)) -ge 60 ]; then
    last_report=$now
    echo "[$((elapsed / 60))m] $(tail -1 "$LOG" | cut -c1-160)"
  fi
  sleep 5
done
