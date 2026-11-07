# Install fixes

Files here mirror what myKSP adds to `/Applications/KSP-RP2000`, so every change to the install is versioned and reviewable. Copy a folder into the install's `GameData/` to apply it; delete it there to undo.

| Folder | What it does | Applied |
|---|---|---|
| `GameData/ZZZ_myKSP_Fixes/OrphanTechNodes2.cfg` | Places 189 parts whose tech node is missing from the RP2000 tree (ROCapsules, ROTanks, RO launch clamps, Starship Block 3). Runs at `:FINAL`, guarded by `HAS[#TechRequired[<old>]]` so it only touches still-orphaned parts | 2026-11-07 |

Other changes made outside GameData on 2026-11-07:
- `GameData/Scatterer/stbn.R8` copied from `GameData/EnvironmentalVisualEnhancements/stbn.R8`.
- MQTT broker for KSPBridge at `~/.local/ksp-mqtt` (Aedes on Node, 127.0.0.1:1883 and WebSocket 127.0.0.1:9002, log `broker.log`). Start: `cd ~/.local/ksp-mqtt && nohup node broker.js >> broker.log 2>&1 &`.
