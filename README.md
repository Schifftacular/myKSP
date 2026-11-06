# myKSP

A modern space-program front end for Mike's realism KSP install (KSP 1.12.5, RSS/RO/RP-style
career at `/Applications/KSP-RP2000`). Clean-sheet project.

## Layout

| Path | What |
|---|---|
| `packages/shared` | Telemetry model, limit checks, flight events, KSP ConfigNode/save parser |
| `services/bridge` | Node service: Telemachus relay, flight recorder/replay, read-only career API |
| `apps/ops-center` | 3D browser front end (Three.js): Flight Control Room and program rooms |
| `docs/` | Design specs, research, mod notes, backlog (`docs/environments`, `docs/research`, `docs/mods`) |
| `tools/` | Standalone scripts |

Requires Node 20+. `npm install`, then `npm run dev`. See `docs/environments/` for the environment design and how to run it.
