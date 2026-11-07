# Manifest changelog

## v3 — 2026-11-07 (daily check)

- `PEREGRINE-2`, `PEREGRINE-3`: Gruithuisen Domes site confirmed from Astrobotic's release; payloads listed (LETS, SCALPSS, LRA). No contract change needed.
- `clps_cadence`: NASA says Phase I has more than twenty robotic landings through 2029.
- NASA's Moon Base news conference is at 22:00 UTC today (after this check); the next daily check covers it.

## v2 — 2026-11-07

31 missions (+4), 14 landing sites (new), 58 sources.

Changed (contracts: re-tune these ids):
- `MOON-BASE-I`: delayed to NET Q1 2027; New Glenn grounded after the 2026-05-28 pad explosion. Site `SP-CONNECTING-RIDGE`.
- `MOON-BASE-II`: Falcon Heavy; Astrobotic now owned by Voyager; late 2026 or NET Jan 2027; Nobile region.
- `MOON-BASE-III`: delayed to NET Q1 2027; Falcon 9; full payload list; site `NS-REINER-GAMMA`.
- `BLUE-GHOST-M2`: delayed to NET 2027; payload list; ESA Lunar Pathfinder relay on the orbiter.
- `BLUE-GHOST-M3`: confidence raised to likely; site Gruithuisen (Dec 2024 award).
- `CLPS-2028-OTHER`: now the Firefly ($144.2M) and Intuitive Machines ($148.3M) June 2026 awards; payloads SCALPSS, LRA, LETS.
- `CAPSTONE-02`: two ~400 kg spacecraft from Advanced Space/Terran Orbital, 2027.
- `VIPER`, `LTV-DELIVERY`: depend on New Glenn; LTV specs and design-review dates.
- `FISSION-SURFACE-POWER`: downgraded to speculative; NASA paused the procurement on 2026-03-26 to reassess.
- `ARTEMIS-III`: flight plan added; crew named 2026-06-09.
- `ARTEMIS-IV`: nine candidate sites; upper-stage choice (ICPS vs Centaur V) around summer 2027; surface-stay discrepancy noted.
- `ARTEMIS-II`: flown flight-day plan added.
- `PEREGRINE-2/3`: Gruithuisen site per Astrobotic, flagged for re-check.
- World state: PPE goes to the SR-1 Freedom nuclear-electric spacecraft; ESA decides I-Hab in Dec 2026; Canadarm3 becomes surface robotics.

Added: `NEW-GLENN-RTF`, `JAXA-PRESSURIZED-ROVER`, `LUNAR-RELAY-CONSTELLATION`, `CANADARM3-SURFACE`, and the `sites` list.

Tooling: JSON export for the apps, `--check` mode, site validation, contract-coverage check, unit tests and a CI workflow.

Open for next pass: Firefly/IM 2028 sites; NASA's 2026-11-07 Moon Base update; ESA I-Hab decision; exact Shackleton ridge aim point.

## v1 — 2026-11-06

First manifest. 27 missions (8 crewed incl. 3 projected, 19 robotic/infrastructure), 9
program-level facts, 24 sources.

Key world-state facts captured:
- Artemis II flew 2026-04-01 to 04-10.
- Artemis III is now a mid-2027 LEO docking test with both lander test articles; crew named.
- Artemis IV (2028) is the first landing; Artemis V follows (late 2028, soft).
- Gateway paused (2026-03-24); HALO repurposed into three Lunar Infrastructure Demos.
- SLS Block 1B / EUS / ML-2 cancelled; Artemis IV upper stage is ICPS or stretched Centaur V.
- NASA Moon Base program: three phases (now–2029, 2029–2032, 2032+), ~$20B over seven years.
- Fission surface power goal by 2030.

Known gaps for the next pass:
- Launch status of Moon Base I/II/III (none confirmed launched as of 2026-11-06).
- The other June 2026 CLPS awards (`CLPS-2028-OTHER`).
- PPE / I-Hab disposition; ESA, JAXA, CSA surface contributions.
- Artemis IV crew and lander order.
- `CAPSTONE-02` and `BLUE-GHOST-M2` details came from a summarised read of NASA's Moon Base
  phases page; re-read verbatim.
