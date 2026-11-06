# Environments: how to run and what is verified

The environment design lives in [design.md](design.md); the backlog in [backlog.md](backlog.md).
This page covers the Phase 1 vertical slice: the **Flight Control Room (FCR-1)**.

![Flight Control Room, overview seat](img/fcr-overview.png)

## Run it on the iMac

```sh
cd ~/Projects/myKSP
npm install
npm start            # builds the front end, starts the bridge on http://127.0.0.1:8787
```

Open <http://127.0.0.1:8787>. For development with hot reload use `npm run dev` (bridge on 8787,
front end on <http://127.0.0.1:5173>).

| Setting (env var) | Default | Meaning |
|---|---|---|
| `KSP_ROOT` | `/Applications/KSP-RP2000` | KSP install; saves are read from `saves/`, legacy flight logs from `_AgentDocs/` |
| `TELEMACHUS_URL` | `ws://127.0.0.1:8085/datalink` | Telemachus datalink |
| `TELEMACHUS_RATE_MS` | `250` | Subscription rate |
| `MYKSP_PORT` / `MYKSP_HOST` | `8787` / `127.0.0.1` | Bridge address. Loopback by default because it serves save data; set `MYKSP_HOST=0.0.0.0` to use a tablet on the LAN |
| `MYKSP_MODE` | `live` | Start in `live`, `sim` or `replay` |
| `MYKSP_SIM_SPEED` | `1` | Time multiplier for the simulator |
| `MYKSP_RECORDINGS` | `data/recordings` | Where live flights are recorded (JSONL) |

## Using the room

* **Consoles:** click a console or press **1–8** (FLIGHT, FDO, GNC, PROP, EECOM, INCO, CAPCOM,
  PROGRAM). **Esc** returns to the overview seat, **Tab** cycles, **F** toggles flat mode,
  **M** sound (Quindar tones on callouts, master caution on new warnings), **I** performance HUD, **?** help.
* **Source** (top right): *Live (KSP)*, *Simulator (demo)*, or any recorded flight. SIM and
  REPLAY are always badged magenta and are never presented as live data.
* **Front wall:** ground track with flown path and a predicted 1.5-revolution track, altitude
  and velocity against MET, orbit diagram drawn to scale, and a clock strip (MET, flight day,
  RSS game date, next apsis, link state).
* **Program board** (console 8 / **P**): funds, science, reputation, active and offered
  contracts with due dates, crew, vessels, facility levels, from the newest career save.

![Flat mode](img/fcr-flat.png)

## Verification status (2026-11-06)

| Item | Status |
|---|---|
| Unit tests (`npm test`): ConfigNode parser, career summary, Telemachus normalization incl. "NaN" strings and the 0 Δv quirk, limit checks, event detection, simulator reaches orbit, Telemachus client subscribe/stage-key/reconnect against a fake datalink | **Pass**, 18 tests |
| Career parser on the real `AFSA` save (1.48 MB, 3 active + 18 offered contracts, 57 roster entries) and `Artemis` save | **Pass**, 149 ms for AFSA; set `MYKSP_REAL_SAVE` to re-run |
| Replay of the 2026-08-22 Falcon 9 log from `_AgentDocs` through the bridge | **Pass** (Max-Q and engine cutoff called). That log has no lat/lon or attitude, so those show "no data" |
| Room renders in headless Chromium (software GL), SIM ascent to orbit, callouts, flat mode, program board | **Pass** (screenshots above; `npm run smoke`) |
| Render cost | 82 draw calls, about 1k triangles, about 1.5 ms CPU per rendered frame in software GL. Renders only on new data (≈4 Hz) or camera moves. GPU time on the iMac with KSP running is **not yet measured** |
| **Live Telemachus feed on the iMac** (Mike's craft in Earth orbit, "default" sandbox, 17:21) | **Pass.** Badge LIVE; one websocket frame matched a direct Telemachus query on body, Ap 7,958,196 m, Pe 378,392 m, inclination 28.4213°, period 10,767.83 s, EC 32,915/42,450, signal, paused, situation, stage count, Δv 66.6 m/s, mass 14.9 t. Altitude differed by 466 m because the craft was climbing between the two reads. FDO panel GO: "Pe 378.4 km clear of atmosphere". Main menu correctly showed NOT IN FLIGHT. Bridge log had no errors |
| Live recording | **Pass.** A JSONL recording started by itself when the flight began, at about 3.2 lines a second (397 lines when stopped) |
| Cost on the iMac with KSP in flight | Bridge 0.1–0.3 % CPU, 35–45 MB. KSP 83–85 % CPU and about 23 GB in flight. The room in the Claude app's browser pane: about 22 % (GPU helper) + 11 % (page), which includes the app itself. **Not measured:** visible vs hidden tab (that pane never reports the page hidden; needs Chrome or Safari) and KSP's own FPS |
| Issues found live, fixed in this change | Number keys ignored after using the source picker (it kept keyboard focus); wall screens lagged the side panel by up to about 7 s when the flight scene started (they now redraw at once on a state change); "No Target Selected." shown as a target name with 0 m range (now no target). Fixes are unit-tested or type-checked, **not yet re-checked live** |
| Open | INCO reads WARNING, signal 0 %: Telemachus itself reports 0, so this is real data. Check whether CommNet is off in that save. The iMac is short on memory (swap nearly full, startup disk 99 % full), which matters more than the room's cost in a long session |

## Limitations to know

* Read-only by design: no commands are sent to KSP. Telemachus' command endpoints are
  unauthenticated, so commanding waits for an authenticated path (kRPC or our own mod).
* Maneuver nodes are not shown: those Telemachus keys throw in this build.
* Telemachus ignores RealAntennas, so a comm blackout does not dim the room yet.
* Game date assumes the RSS/RP-1 epoch (UT 0 = 1951-01-01). Saves with another epoch will show a
  wrong calendar date; MET is unaffected.
* The simulator is a two-stage point-mass model for demos and tests, not a flight model.

## Launching and quitting KSP

`tools/ksp/launch-ksp.sh` starts KSP once (no-op if it is already running, lock against two
callers) and waits for the main menu. Loading takes 10–14 minutes on the iMac; a long quiet
stretch is normal, and `~/Library/Logs/Squad/KSP/Player.log` is more current than `KSP.log`.
`tools/ksp/quit-ksp.sh` quits without saving (polite quit, then SIGTERM, then SIGKILL). Never run
it while someone is playing. Back up the save before any test that touches it.
