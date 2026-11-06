# myKSP Environments: Design Spec

Status: living document, owned by the Environments thread. Last revised 2026-11-06.

This spec defines the immersive spaces of the myKSP front end, why each one exists, what real
game state drives it, and in what order they get built. The rule from the project brief applies
to every line below: **no room exists for decoration.** Each environment must improve gameplay,
realism, operational awareness, or usability, and must be backed by real game data or be
clearly labelled as not yet integrated.

## 1. Ground truth: what the install actually exposes

Inspected on Mike's iMac (`/Applications/KSP-RP2000`, KSP 1.12.5.3190, macOS arm64) on 2026-11-06.

| Source | What it gives us | Status |
|---|---|---|
| **Telemachus 1.7.0** | Live active-vessel telemetry over `ws://<host>:8085/datalink` at ~4 Hz: orbit, attitude, velocities, staging Δv, resources, heat, FAR aero, comm signal, target, landing predictions. Also flight commands (stage, throttle, SAS) as unauthenticated GETs. Partless mode on. | Verified live by an earlier session (`_AgentDocs/telemachus.md`), 25 keys confirmed during a real Falcon 9 flight. Maneuver-node keys throw in this build: never subscribe them. |
| **Save files** `saves/<career>/persistent.sfs` | Funds, science, reputation, contracts (offered/active/completed, with parameter trees), facility levels, tracked vessels, crew roster, alarms, tech. | Verified by parsing the AFSA career save (most recent career, 2026-11-04) and the Artemis save in this session. Read-only, always. |
| **kRPC 0.6.0** | Full scripted access incl. SpaceCenter, MechJeb, KAC services, on `127.0.0.1:50000/50001`. | Installed; not used by the vertical slice. Candidate for the commanding layer (Phase 3+). |
| **RealAntennas** | Real ground-station network (DSN-style) and link budgets. | Installed. Ground-station data reachable via save + kRPC; not yet wired. |
| **ContractConfigurator 2.13.4** + RP2000 contracts | Contract definitions the Contracts thread will extend. | Installed. |
| **KSPBridge 0.15.1 (MQTT)** | Publishes telemetry to an MQTT broker under `ksp/telemetry/*`. | Installed. Needs a Mosquitto broker on `localhost:1883` (plus a 9002 WebSocket listener for browsers); none is running, so it publishes nothing today. Possible second telemetry source; see the Mods thread's `docs/mods/`. |
| **KerbalConstructionTime** | Build/rollout queues. | Only `KCT_Presets` present, no plugin. **Not available.** Integration hall must not depend on it. |
| **TAC Life Support** | Consumables. | Scenario node left in old saves, mod not installed. **Not available.** |

Consequences:

* Live flight rooms run on Telemachus now. Career rooms run on the save file now (refreshes
  whenever KSP saves; KSP autosaves on scene changes).
* Commanding (staging, GO/NO-GO actions that touch the game) waits until we choose an
  authenticated path (kRPC or our own mod). Telemachus commands are unauthenticated and reachable
  from the LAN; the front end never sends them by default.

## 2. Architecture as it affects environments

Standalone hybrid, chosen over an in-game UI:

* **`apps/ops-center`**: browser front end (Vite + TypeScript + Three.js). Runs in its own window
  or on a second monitor/tablet, so KSP keeps its single window and frame budget.
* **`services/bridge`**: small Node process. Relays Telemachus into a normalized telemetry model,
  records every flight to JSONL, replays recordings, and serves career state parsed from the save.
  The front end only talks to the bridge, so an in-game mod or kRPC can replace a source later
  without touching any room.
* **Authority**: KSP is always authoritative. The front end holds no game state of its own except
  UI preferences and flight recordings (which are derived data). Nothing writes to saves.
* **Recovery**: every source reconnects with backoff; rooms keep last-good values on screen and
  mark them stale (amber, with age) instead of blanking.

### Performance budget (KSP running on the same iMac)

| Metric | Budget | How it is enforced |
|---|---|---|
| Frame time, 3D room, 1440p, Apple Silicon iGPU | ≤ 8 ms GPU, 60 fps target, 30 fps cap when idle | Single scene, instanced consoles, no shadows beyond one baked-look key light, screen textures re-drawn only on new data |
| Draw calls | ≤ 150 | Merged static geometry, instanced console rows |
| Triangles | ≤ 250 k | Procedural low-poly architecture |
| Front-end JS heap | ≤ 150 MB | Ring buffers for telemetry history |
| Bridge CPU | ≤ 2 % of one core at 4 Hz | Event-driven, no polling of saves (fs.watch + debounce) |
| Background tab | 0 frames | Render loop stops on `visibilitychange` |
| Low-power mode | 2D "flat" view, no WebGL | Toggle `F`, auto-offered if frame time > 25 ms sustained |

## 3. The lifecycle the environments follow

A real program runs one loop, and every mission goes through it:

**Program direction → mission concept → mission design → vehicle integration → crew assignment
→ launch processing → launch → flight operations → tracking & comms → landing & recovery →
post-flight evaluation → (surface operations).**

Each environment owns one or more of these steps. Fast access is preserved by a persistent
**Ops Bar** on every screen (UT date, MET of the active flight, funds, link status, alerts) and by
number-key jumps between rooms. Any room can be opened in **flat mode** (crisp 2D panels, no 3D)
for accessibility and low-power use; the data and controls are identical.

## 4. Environments

Each entry: real-world reference, job in the game, data, signature interactions, phase.

### 4.1 Flight Control Room (FCR) — *vertical slice, Phase 1*
* **Reference:** JSC Mission Control Center, Flight Control Room 1 ("White FCR") as used for
  Artemis I/II: tiered console rows facing a front-wall display set (ground track centre, trajectory
  and timeline flanks, MET and countdown clocks above).
* **Job:** live awareness and decision support during any flight. Answers "are we OK, and what
  happens next?" faster than KSP's own HUD.
* **Consoles (positions are real FCR disciplines, mapped to what KSP can tell us):**
  * **FLIGHT**: overall status, situation, MET, active alerts, GO/NO-GO roll-up from all positions.
  * **FDO** (Flight Dynamics): Ap/Pe with time-to, period, inclination, eccentricity, escape flag,
    impact prediction.
  * **GNC**: attitude (heading/pitch/roll), SAS mode, angle of attack, stall fraction, G-load.
  * **PROP**: per-stage Δv, TWR, burn time, propellant fraction; total Δv.
  * **EECOM** (power & thermal): electric charge, hottest-part temperature ratio with peak-hold.
  * **INCO** (comms): signal strength, link state, telemetry age, data rate.
  * **CAPCOM**: crew count and an event log of callouts (staging, MECO, orbit insertion, Max-Q),
    with optional Quindar tones.
* **Front wall:** world map with live ground track (equirectangular, coastlines from Natural Earth),
  altitude/velocity trajectory plot, big MET and UT clocks, event timeline.
* **Limit checks:** each position has caution (amber) / warning (red) limits that roll up to
  FLIGHT. This is the gameplay value: problems are surfaced before they kill the vehicle.
* **Data:** Telemachus via bridge. Replay of recorded flights through the same pipeline (clearly
  badged REPLAY).

### 4.2 Program Office — *Phase 2*
* **Reference:** NASA HQ program office / Artemis program war room: integrated master schedule
  on the wall, budget and risk boards.
* **Job:** the career's home. Funds, science, reputation trends; contract portfolio by status and
  deadline; facility levels; the **manifest to 2030** (fed by the Contracts thread's Artemis
  contract pack) on a wall timeline; the lunar-base goal tracker.
* **Data:** save parser (verified). Trends come from successive save snapshots the bridge keeps.

### 4.3 Launch Control Center, Firing Room — *Phase 2*
* **Reference:** KSC LCC Firing Room 1 (Artemis), tiered consoles facing windows toward the pad.
* **Job:** terminal count and ascent. Countdown clock with built-in holds the player sets;
  **GO/NO-GO poll that checks real conditions** (EC above reserve, comm link, crew aboard, SAS
  state, stage count), each position answering GO or NO-GO from data. Ascent view hands off to
  the FCR at tower clear, exactly as KSC hands to Houston.
* **Data:** Telemachus pre-launch values (verified keys). Commanding the launch itself stays in
  KSP until an authenticated command path exists.

### 4.4 Mission Evaluation Room (MER) / Post-flight — *Phase 2*
* **Reference:** JSC MER, engineering support during and after flight.
* **Job:** every flight the bridge records is replayable here with scrubbing, event markers and
  limit violations highlighted; compare a flight to its contract objectives. Turns failures (like
  the 2026-08-22 Falcon 9 upper-tank burn-through) into lessons.
* **Data:** bridge flight recordings (JSONL). Same replay engine as the FCR.

### 4.5 Mission Design Center — *Phase 3*
* **Reference:** JSC Flight Design and Dynamics, GSFC trajectory groups.
* **Job:** turn an accepted contract into a plan: target body, launch window (daily for the
  Moon, synodic for planets), Δv budget vs a chosen craft, schedule slot on the manifest.
* **Data:** contracts (save), craft files (`Ships/VAB/*.craft`), computed windows. Craft-level Δv
  requires either craft parsing with RealFuels data or kRPC; spike needed.

### 4.6 Vehicle Integration Hall — *Phase 3*
* **Reference:** VAB High Bay 3 with the Mobile Launcher.
* **Job:** inventory of vehicle designs (64 craft in `Ships/VAB`, incl. Modular Launch Pad
  assemblies), which contract each is assigned to, readiness flags. Vehicle *building* stays in
  KSP's editor; we do not duplicate it.
* **Data:** craft files. No build queue (KCT plugin not installed).

### 4.7 Astronaut Office — *Phase 3*
* **Reference:** JSC Astronaut Office, crew assignment boards.
* **Job:** roster, experience/flight history, availability, crew assignment to missions.
* **Data:** save `ROSTER` (verified present in saves).

### 4.8 Network Operations (SCaN / DSN) — *Phase 4*
* **Reference:** DSN Now, JPL's network operations centre; Near Space Network.
* **Job:** which station is talking to which vessel, link margins, upcoming coverage gaps
  (critical for lunar far-side and surface ops).
* **Data:** RealAntennas via kRPC or a small mod; Telemachus signal strength for the active vessel.

### 4.9 Lunar Surface Operations Center — *Phase 5, the career goal*
* **Reference:** Artemis Base Camp concepts; ISS MCC-H systems flight control.
* **Job:** a permanent lunar base as a managed system: module inventory, power budget across
  lunar day/night, crew rotation schedule, resupply manifest, consumables (once a life-support
  mod is chosen; none installed now).
* **Data:** vessels/landed state from save; needs a life-support decision from the Mods thread.

### Inputs from other threads
* Research (`docs/research/nasa-native-experience.md`): show MET and UTC side by side and plan in
  flight days; track *campaigns* of several launches, not single vessels; comm coverage as a
  constraint for polar and far-side sites; avoid NASA insignia and use an original agency
  identity in NASA's design language.
* Mods (`docs/mods/`): KSPBridge needs an MQTT broker; visual mods state is in flux, which does
  not affect this front end because it renders its own scenes.

## 5. Visual, audio, and interaction language

* **Look:** contemporary NASA ops, not sci-fi. Dark charcoal consoles, low ambient light, warm
  task lighting on desks, cool emissive screens; front wall is the brightest thing in the room.
  Typography is a clean grotesk for labels and tabular monospace for numbers. Colour carries
  meaning only: nominal is neutral/white, caution amber, warning red, data stale is dimmed with
  an age stamp, replay/sim is magenta-badged. Never colour-only: every state also has a word.
* **Readability first:** numbers that matter are rendered as HTML overlays at native resolution
  when a console is focused, never only as tiny text on a 3D texture.
* **Audio:** low room tone, console clicks, Quindar intro/outro tones (2525 Hz / 2475 Hz,
  250 ms) on CAPCOM callouts, master caution tone on new warnings. Off until the user enables it.
* **Navigation:** click a console or press its number to move to it; `Esc` returns to the overview
  seat; `F` toggles flat mode; `Tab` cycles positions. Camera moves are short (≤ 600 ms) and can be
  turned off (`prefers-reduced-motion` respected).

## 6. Acceptance criteria for the vertical slice (Phase 1)

1. `npm run dev` starts bridge + front end; the room renders with no external network access
   other than the bridge.
2. With KSP in flight, consoles show live Telemachus values within 1 s; with KSP closed, the room
   shows NO LINK state and keeps rendering; reconnect is automatic.
3. A recorded flight replays through the same pipeline, badged REPLAY.
4. Ground track draws on the world map; limit checks roll up to FLIGHT.
5. Every console is reachable by mouse and keyboard; flat mode shows the same data.
6. Bridge serves career summary parsed from a real save without modifying it.
7. Measured frame time and draw calls reported against the budget.
