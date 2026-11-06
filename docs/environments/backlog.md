# Environments backlog

Ordered. Each item names the acceptance check that closes it.

## Now (finish Phase 1)
1. **Verify the live feed on the iMac.** KSP in flight → badge LIVE within 1 s, FDO matches the
   in-game orbit readout, recording file appears in `data/recordings/`.
2. **Measure GPU cost with KSP running** (Safari/Chrome performance panel on the iMac at 1440p).
   Budget: ≤ 8 ms GPU per rendered frame; KSP's own frame rate drop ≤ 5 %.
3. **Comm blackout from RealAntennas** (needs kRPC or a mod): INCO goes LOS, room dims.

## Next (Phase 2)
4. **Launch Control Center firing room**: countdown with player-set built-in holds and a
   data-driven GO/NO-GO poll; hands over to FCR at tower clear.
5. **Program Office as a 3D room** around the existing program board, with the Artemis
   manifest timeline from `docs/research/artemis-manifest.yaml` and the contracts pack.
6. **Mission Evaluation Room**: scrub any recording, mark limit violations and events, compare
   with contract objectives.
7. **Campaign view** (multi-launch missions, e.g. tanker flights) in FLIGHT and Program.
8. Flight-day plan strip on the clock wall (research thread: Artemis plans by flight day).

## Later
9. Mission Design Center (windows, Δv budget vs craft) · 10. Vehicle Integration Hall (craft
   inventory, rollout) · 11. Astronaut Office · 12. Network Operations (DSN/RealAntennas) ·
   13. Lunar Surface Operations Center (needs a life-support mod decision).

## Design debt
* Original agency identity for the UI (research thread: do not use NASA marks).
* Bundle Inter / JetBrains Mono (OFL) locally so typography does not depend on system fonts.
* Console monitors are single wide screens; real FCR desks have three to four displays.
