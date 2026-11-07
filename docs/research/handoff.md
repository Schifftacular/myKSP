# Research handoff: concrete items for other threads

Each item is something the research found that another thread can build. It names the data to
use and a check that shows it is done. Source detail is in
[`nasa-native-experience.md`](nasa-native-experience.md) and
[`artemis-manifest.yaml`](artemis-manifest.yaml).

## For the contracts thread

| # | Item | Data | Done when |
|---|---|---|---|
| C1 | Replace estimated coordinates with manifest `sites` | `sites[]` (lat/lon, east-positive, with precision). Base anchor: `SP-CONNECTING-RIDGE` (-89.5, -135.5). VIPER: `SP-MONS-MOUTON` (-85.42088, 31.6218). Reiner Gamma: `NS-REINER-GAMMA` (7.585, -58.725). Gruithuisen: `NS-GRUITHUISEN-GAMMA` (36.45715, -40.79602) | Every surface contract's target cites a site id; landing radius ≥ 3 km for medium/low precision |
| C2 | Artemis IV landing-site choice | `ARTEMIS-IV.candidate_sites` (NASA's nine 2024 regions) | Player picks one of the nine; reward bonus when a prior robotic mission surveyed it |
| C3 | Hold Blue Origin deliveries behind New Glenn | New mission `NEW-GLENN-RTF`; `MOON-BASE-I`, `VIPER` and `LTV-DELIVERY` now depend on it | Optional world-event gate (off in "player is the provider" mode) |
| C4 | Re-tune for manifest v2 changes | Moon Base I and III, Blue Ghost M2 slipped to 2027; fission power downgraded to speculative (procurement paused); `CLPS-2028-OTHER` is now Firefly + Intuitive Machines; Blue Ghost M3 site is Gruithuisen | `contract-map.yaml` says `manifest_version_reviewed: 2`; `tools/check_contract_coverage.py` shows no errors |
| C5 | New missions that may want contracts | `JAXA-PRESSURIZED-ROVER`, `LUNAR-RELAY-CONSTELLATION`, `CANADARM3-SURFACE`, `NEW-GLENN-RTF` (world event) | Mapped in `contract-map.yaml`, or marked "no contract by design" |
| C6 | Tie contracts to RP-1 Programs | RP-1 v4.8.1.0 `RP0_PROGRAM` (CrewedLunar, UncrewedLunarSurface, EarlyLunarHabitation) use `REQUIREMENT { type = ProgramActive }` | Artemis contract groups require the matching RP-1 program, or a short note explains why not |
| C7 | Short first landings | Oct 2026 briefing: two moonwalks of about 2 hours; NASA's Artemis IV page says about a week | Artemis IV contract requires 2 EVAs; a longer stay is optional |

## For the environments thread

| # | Item | Data | Done when |
|---|---|---|---|
| E1 | Launch Control Center countdown with real holds (your backlog #4) | Artemis II countdown in `nasa-native-experience.md` §2.5: built-in holds at L-12h35m, L-5h10m and L-40m (the T-10 hold), terminal count milestones, and recycle rules | Countdown runs from a data table with those holds; poll before terminal count; any stop after T-33s scrubs |
| E2 | Console positions use real Artemis call signs | Table in §3 (FLIGHT, CAPCOM, FDO, BOOSTER, CONTROL, GNC, PROP, EECOM, C&DH, MPO, INCO, GC, FAO, PAO) | No ISS-only call signs on screen; each console label matches the table |
| E3 | Program Office manifest timeline (your backlog #5) | `docs/research/artemis-manifest.json` (generated, no YAML parser needed): `missions[].window`, `status`, `confidence`, `site`, `dependencies` | Timeline renders all 31 missions; speculative ones visibly marked; joins to contracts by id |
| E4 | Flight-day plan strip (your backlog #8) | `ARTEMIS-II.flight_plan` (as flown) and `ARTEMIS-III.flight_plan` (planned) | Strip shows FD labels for the active campaign |
| E5 | Original agency identity (your design debt) | NASA meatball, worm and seal need written permission; seal never. NASA photos OK with "Credit: NASA" | No NASA marks in UI or release; image credits shown where NASA imagery is used |
| E6 | Real-world launch ticker (optional) | Launch Library 2 API 2.3.0: 15 requests/hour free, cache on the bridge; match CLPS missions by name, not just program id | Bridge fetches at most a few times a day and joins results to manifest ids |
| E7 | Comm geometry for south-pole and far-side ops (your backlog #3/#12) | Relays in the manifest: Altus-1 (IM-3), ESA Lunar Pathfinder (Blue Ghost M2), `LUNAR-RELAY-CONSTELLATION` | INCO shows relay coverage for the active site |

## For the mods thread

| # | Item | Data |
|---|---|---|
| M1 | Contract objectives at real south-pole coordinates assume RSS terrain/scatter at those points. Check that the `SP-*` sites in `sites[]` are landable in the installed RSS/RO terrain (slopes, no missing tiles). | `sites[]` |
| M2 | Pressurised rover, robotic arm and fission reactor parts: do the installed mods have parts that can stand in for the JAXA rover, Canadarm3 and a ~40 kWe reactor? | `JAXA-PRESSURIZED-ROVER`, `CANADARM3-SURFACE`, `FISSION-SURFACE-POWER` |
