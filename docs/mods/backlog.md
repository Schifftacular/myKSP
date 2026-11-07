# Mod-stack backlog

Known problems in `/Applications/KSP-RP2000`, found by the 2026-11-06 survey. Each item says what was observed, why it matters, and the proposed fix. Nothing here has been changed in the install yet; every fix should be made with a backup and verified by re-running `tools/mod-inventory`.

Priority: **P1** blocks a workstream, **P2** degrades it, **P3** is housekeeping. ✅ = fixed, ⏳ = in progress.

| # | P | Problem | Evidence | Fix |
|---|---|---|---|---|
| 1 | ✅ | 196 installed parts could never be researched in career. **Fixed 2026-11-07:** `install/GameData/ZZZ_myKSP_Fixes/OrphanTechNodes2.cfg` places 189; 9 deprecated/hidden parts left out on purpose | Their `TechRequired` names nodes missing from `ModuleManager.TechTree` (179 nodes): ROCapsules 128 and ROTanks 37 (`unlockParts`, `standardDockingPorts`), ROEngines 13 launch clamps, SEP 15 (`flightControlNF`, `orbitalRocketryNF`, `capsulesNF`), Modular Launch Pads 3 (`none`) | Extend `ZZZ_RP2000_Fixes/OrphanTechNodes.cfg` (it already handles this class of bug at `:FINAL`) with placements for these parts. Generate the list from the cache rather than by hand |
| 2 | ✅ | KSPBridge could not publish. **Fixed 2026-11-07:** Aedes MQTT broker in `~/.local/ksp-mqtt` (127.0.0.1:1883 + WebSocket 9002); KSPBridge logged `MQTT connected`. Not yet started at login; Homebrew Mosquitto blocked because `/opt/homebrew` belongs to another account | `MQTT connect failed ... localhost:1883` every 5 s | Install and run Mosquitto on the Mac with listeners on 1883 (MQTT) and 9002 (WebSockets) |
| 3 | P2 | Visual stack is in an undocumented mixed state | EA EVE 3.2.2 + Scatterer 0.0906 + StockVolumetricClouds loaded alongside legacy RSSVE; CKAN registry still lists EVE 1.11.7.2 / Scatterer 0.0878. (The planet list itself is fine: one definition plus an RSSVE patch.) | Environments workstream picks one baseline and measures frame time, then reconcile CKAN ([environments.md](environments.md)) |
| 4 | ✅ | Scatterer missing `stbn.R8`. **Fixed 2026-11-07:** copied into `GameData/Scatterer/` | `FileNotFoundException: GameData/Scatterer/stbn.R8`; file is in `GameData/EnvironmentalVisualEnhancements/` | Copy it into `GameData/Scatterer/` if the EA Scatterer stays |
| 5 | ✅ | KCT and TestFlight had configs but no plugin. **Fixed 2026-11-07:** CKAN 1.36.4 (`~/Applications/CKAN.app`, CLI `~/.local/ckan/ckan.exe`) installed KerbalConstructionTime 1.4.13.1, MagiCore 1.4.0.0, TestFlight 2.12.1.0, nothing else changed (backup `CKAN/registry.json.bak-20261107-pre-tf-kct`). All DLLs load with 0 exceptions; 2,695 TestFlight entries on RO engines; RP2000 KCT preset present (pick it when a career first loads with KCT); MM patches 69,291 → 75,032 | OhScrap configs remain but it has no DLL, so they are inert (no double failures) | Existing careers start with zero TestFlight flight data; expect early failures |
| 6 | P2 | kRPC open to the network | `settings.cfg`: address `0.0.0.0`, `autoAcceptConnections = True` | Bind to `127.0.0.1` or turn off auto-accept once the front end's connection model is settled |
| 7 | P2 | `MoonBaseCreate` contract is wrong | Notes say 4 crew, check requires 6; duplicate `name` in `HasCrew` | Replace with the contracts workstream's lunar-base chain; disable the RP2000 one |
| 8 | P2 | FAR compute shader unavailable on macOS GL | `Kernel 'CountPixelsMain' not found` in FAR during drag-cube generation | Platform limit. Track whether FAR falls back correctly (aero sanity test on a known craft) |
| 9 | P3 | CKAN registry out of sync | `kRPC-MechJeb` listed but its DLL is in `_disabled-mods/kRPC/`; SEP listed 3.2.1 while the DLL is 3.3.2 and `.version` says 3.1.0; EVE/Scatterer as in #3 | After #3, mark manual installs in CKAN or document them in `installed-custom.ckan` |
| 10 | P3 | Stand Alone Map View server runs with no client | `samv_server.cfg Enabled = True`; no client install | Remove, or set up a client install if the environments workstream wants a map monitor |
| 11 | P3 | Load-time errors from small mods | KerbalChangelog `Invalid version: 0.43.0.11b`; VABOrganizer duplicate key `berth`; `_BuildManager` `Invalid path`; `RP2000/RO Compatibility/RO-USI-SrvPack.cfg` is empty; 6 MunksFixes cfgs for absent mods fail to parse | Cosmetic. Fix only if they mask a real error |
| 12 | P3 | Ten mods declare a KSP maximum below 1.12 | Firespitter, KSPWheel, Chatterer (+Extended), RCSBuildAid, KerbalChangelog, Benjee10 shared assets, PlumeParty, HabTechProps, SAF-KWRocketry | All load. First suspects when something breaks |
| 13 | P3 | Leftover saves and logs | `saves/RP-1` (no RP-1 plugin), four old `KSP.log.*` copies (~80 MB) | Archive outside the install |
| 14 | ✅ | 15-minute boot. **Fixed 2026-11-07:** 15 m 13 s → 2 m 33 s warm / 6 m 07 s after a GameData change | 7 m 41 s stall inside KSPe.Light (Distant Object) enumerating `_tools/docking-cards/node_modules` (21.5k files, 1,349 symlinks) under the KSP root; macOS spin report showed directory enumeration | `_tools` moved to `~/Projects/myKSP/_tools`. Rule: no tooling inside `/Applications/KSP-RP2000`; batch GameData edits (each change costs a ~3.5 min MM rebuild) |

## Rules for changing the install

1. Close KSP. Copy the affected folders and `CKAN/registry.json` to a dated backup first.
2. Prefer adding a patch in a `ZZZ_` folder over editing a mod's own files, so CKAN upgrades do not erase the fix.
3. Delete `GameData/ModuleManager.ConfigCache` only when a patch changed; it costs a full rebuild.
4. After the game loads, re-run `tools/mod-inventory/inventory.py`, diff `docs/mods/data/mod-inventory.json`, and check `KSP.log` for new `[EXC` lines.
