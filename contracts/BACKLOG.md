# Contracts backlog

Ordered by value. The contracts thread works this list continuously.

1. **Force-offer test.** Load passes (30/30, 2026-11-06). Next: force-offer each
   contract in the CC debug window (Alt+F10) on a copy of a career save. Optionally
   give the groups an `agent` to silence that warning.
2. **Play-test the multi-vessel contracts** (Artemis III, Artemis IV, CAPSTONE 02,
   Moon Base II/III, crew rotation): confirm `define` / `IsNotVessel` keep the
   vehicles apart and that docking keeps vessel keys as expected.
3. **Reward tuning.** Rewards are scaled from RP2000's existing lunar contracts
   (MoonBaseCreate ~0.5-0.8M). Check against a real career's cash flow
   (AFSA save had ~0.56M funds) and Custom Barn Kit facility costs.
4. **Optional real-date gates** (`Expression` on `UniversalTime()`) for a
   "historical cadence" mode, off by default.
5. **Retire RP2000's buggy `MoonBaseCreate`** once `MKSP_Base_Habitat` is
   play-tested (ModuleManager `!CONTRACT_TYPE` or a `disabledContractType`).
6. **Precise site coordinates** from the research thread (Shackleton ridge,
   Artemis IV candidate regions, VIPER traverse) once it sources them.
7. **Surface night survival with real thermal limits** if a thermal / life
   support mod is added (Kerbalism is not installed).
8. **Lander-specific variants** once the mod thread fixes the orphan tech nodes
   so Starship Block 3 / ROCapsules parts are reachable in career.
9. **Feed contract state to the Ops Center** via the bridge's career parser
   (`/api/career`) so active Artemis contracts show on the mission wall.
10. **Gateway branch** only if the manifest moves Gateway out of `paused`.
