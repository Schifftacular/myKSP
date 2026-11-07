# Environments backlog

Ordered. Each item names the acceptance check that closes it.

## Now (finish Phase 1)
1. **Verify the live feed on the iMac.** KSP in flight → badge LIVE within 1 s, FDO matches the
   in-game orbit readout, recording file appears in `data/recordings/`.
2. **Measure GPU cost with KSP running** (Safari/Chrome performance panel on the iMac at 1440p).
   Budget: ≤ 8 ms GPU per rendered frame; KSP's own frame rate drop ≤ 5 %.
3. **Comm blackout from RealAntennas** (needs kRPC or a mod): INCO goes LOS, room dims.

4. **Live check of the eight new rooms** on the iMac: LCC poll and count against a vehicle on the
   pad, MER on a real recording, VIH stack of the live craft, NET elevation against a craft in
   orbit, LSOC with a vessel at the Moon. Acceptance: each room's numbers match KSP's own readouts.

## Done 2026-11-07
Launch Control Center, Program Office, Mission Evaluation Room, Mission Design Center, Vehicle
Integration Hall, Astronaut Office, Network Operations, Lunar Surface Operations (TAC LS is
installed). CommNet-off now shows "CommNet off" instead of an INCO warning.

## Next
5. **Campaign view** (multi-launch missions, e.g. tanker flights) in FLIGHT and Program.
6. Flight-day plan strip on the FCR clock wall from the manifest's `flight_plan`.
7. Porkchop plot in MDC (Lambert solver) instead of Hohmann-only windows.
8. Live consumables for the active vessel at the Moon (Telemachus `r.resource[Food]` etc.).

## Design debt
* Original agency identity for the UI (research thread: do not use NASA marks).
* Bundle Inter / JetBrains Mono (OFL) locally so typography does not depend on system fonts.
* Console monitors are single wide screens; real FCR desks have three to four displays.

## From the first live test (2026-11-06)

* Measure the room's cost in Chrome or Safari, visible and hidden, with KSP in flight. Each 4 Hz
  frame currently redraws the clock strip and all eight console textures; cut that to changed
  consoles only if the GPU cost matters.
* ~~INCO signal reads 0 % on the "default" sandbox craft.~~ CommNet is off in that save
  (`enableCommNet = False`); INCO now shows "CommNet off".
* Re-check the three live fixes (number keys, wall lag, no-target) on the next live session.
