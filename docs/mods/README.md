# myKSP mod stack: expert reference

This is the reference for the mod stack in Mike's install at `/Applications/KSP-RP2000`. It is written for the other myKSP workstreams (contracts, immersive environments, NASA/Artemis research, the front end and its bridge) so they can build on what is actually installed rather than what a mod list says.

Surveyed 2026-11-06, read-only, against the live install. Every number here comes from the install's own files (`CKAN/registry.json`, `GameData/**/*.version`, `KSP.log`, `ModuleManager.ConfigCache`, `PartDatabase.cfg`) unless it is marked otherwise.

| Doc | Read it when you are... |
|---|---|
| [inventory.md](inventory.md) | looking up a mod's exact version, license, KSP range, or folder ([JSON](data/mod-inventory.json)) |
| [integration.md](integration.md) | wiring the front end to the game: telemetry, control, save files, ports |
| [contracts.md](contracts.md) | writing Contract Configurator contracts (lunar base, Artemis) for this install |
| [environments.md](environments.md) | working on visuals, IVA, cameras, audio, KSC/launch sites |
| [backlog.md](backlog.md) | looking for known problems and the fixes to make next |

To refresh the inventory after a mod change, see [tools/mod-inventory](../../tools/mod-inventory/README.md).

## The install at a glance

| | |
|---|---|
| Game | KSP **1.12.5** (build 03190), Steam, macOS player |
| Machine | Apple M4 (10 cores), 32 GB RAM, Metal via OpenGL 4.1 shim |
| Mods | 156 GameData entries, 142 CKAN modules (48 auto-installed deps), 155 assemblies loaded |
| ModuleManager | 4.2.3, **69,101 patches** applied, 2 warnings |
| Parts | 3,169 parts in `PartDatabase.cfg` |
| Planet pack | Real Solar System 20.1.3 on Kopernicus 1.12.1-247 |
| Realism | Realism Overhaul 17.4.1, RealFuels 15.15, FAR 0.16.1.2, RealAntennas 2.12, RealHeat 5.1, RealChute 1.4.9.5 |
| Calendar | UT 0 = **2000-01-01** (RP2000 patches the RSSDateTime epoch). A real-date 2026 to 2030 Artemis campaign is about 26 to 30 years of game time from a fresh start |
| Career layer | **RP2000** (a config-only career built on RP-0 contracts and Community Tech Tree) on Contract Configurator 2.13.4 (KSP-RO build) |
| Saves | Careers: `AFSA` (newest), `Artemis`, `NASA`, `Next Gen Aero`, `RP-1`. Sandboxes: `default`, `NASA NOW`, `Sandy Boxes` |

### What the stack is made of

- **Foundation.** ModuleManager, Harmony 2.2.1, ClickThroughBlocker, ToolbarController, KSPCommunityFixes 1.41.1, KSPBurst, KSPTextureLoader, B9PartSwitch, TexturesUnlimited, ModularFlightIntegrator, SolverEngines, ROUtils, ROLib, SpaceTuxLibrary.
- **Realism.** RSS, RO, RealFuels, RealEngines, ROEngines, ROTanks, ROCapsules, ROSolar, ProceduralParts, ProceduralFairings, FAR, AJE, RealAntennas, RealHeat, RealChute, RealPlume, Kerbal Joint Reinforcement, TAC Life Support 0.18, BackgroundResources.
- **Hardware.** Artemis: Benjee10 Orion/SLS/ICPS/BOLE and a Lockheed lunar lander, Starship Expansion Project (53 parts). Apollo/Shuttle/station era: EDBMods (362 RO parts), FASA, RN US/Soviet packs, Space Shuttle System, CxAerospace, ISS Community, HTV, Antares/Cygnus.
- **Career and planning.** Contract Configurator, Custom Barn Kit, WaypointManager, Kerbal Alarm Clock, Transfer Window Planner, Trajectories, MechJeb 2.15.3, Custom Pre-Launch Checks.
- **External interfaces.** Telemachus Reborn 1.7.0, kRPC 0.6.0, KSPBridge 0.15.1 (MQTT), Stand Alone Map View server.
- **Visuals and immersion.** Scatterer 0.0878, EVE Redux, RSSVE-LR, TUFX with five profiles, Deferred, Waterfall 0.11, RealPlume, SmokeScreen, PlanetShine, Distant Object, FreeIva, RasterPropMonitor, ASET, HullcamVDS, CameraTools, Chatterer, HUDReplacer, ZTheme.
- **Launch sites.** KSC Switcher (29 real-world sites), Kerbal Konstructs, KSC Extended, Tundra Space Center (LC-39A/B, SLC-40/41 analogues), Modular Launch Pads.

## Findings that matter to the other workstreams

1. **There is no build-time or failure simulation.** RP2000 ships Kerbal Construction Time presets and TestFlight configs, and OhScrap patches are in GameData, but **KCT, TestFlight, OhScrap and ScrapYard have no DLL installed.** The game ignores those configs, so contracts and the front end cannot assume build queues, integration time, or engine reliability exist. See [backlog.md](backlog.md).
2. **RP2000 is not RP-1.** No RP-1 plugin is loaded, so there are no RP-1 Programs, Leaders, confidence, or KCT-driven budgets. Funding is stock contracts plus Custom Barn Kit facility costs. The `RP-1` save is a leftover.
3. **Two of the three live-data interfaces work today**: Telemachus on 8085 and kRPC on 50000/50001. KSPBridge loads but **cannot reach an MQTT broker** because none is running on `localhost:1883`. See [integration.md](integration.md).
4. **kRPC listens on 0.0.0.0 with `autoAcceptConnections = True`.** Anyone on the LAN or tailnet can fly the vessel. Telemachus is also bound to every interface. Fine for a home network, worth tightening before the front end ships.
5. **The Artemis hardware is RO-supported.** 56 of 61 Benjee10_Orion parts (Orion, SLS core, ICPS, BOLE boosters, Lockheed HLS lander parts) and all 53 Starship parts carry RO configs. The five non-RO Orion parts are cosmetic vapor vents. Contracts can name these parts.
6. **The one existing lunar-base contract has bugs** (`RP2000/NewContracts/MoonBaseCreate.cfg`). Its notes ask for 4 crew while the check requires 6, and a duplicated `name` key in its `HasCrew` parameter. The contracts workstream should replace it, not extend it. See [contracts.md](contracts.md).
7. **Life support is TAC-LS** (Food, Water, Oxygen, CO2, Waste, WasteWater). Kerbalism is not installed. Base contracts should check TAC-LS resources.
8. **196 parts are unreachable in career** because their tech nodes do not exist in the RP2000 tree: most ROCapsules and ROTanks parts, RO launch clamps, and the Starship Block 3 parts added by a SEP update after the August orphan fix. See [backlog.md](backlog.md) item 1.
9. **The visual stack is in a mixed state.** Early-access EVE 3.2.2 and Scatterer 0.0906 are loaded alongside RSSVE and a second Scatterer planet list, and CKAN's registry no longer matches. See [environments.md](environments.md).
10. **Most of the stack is current for 1.12.5.** Ten `.version` files declare a KSP max below 1.12 (Firespitter, KSPWheel, Chatterer, RCSBuildAid, Benjee10 shared assets, and others). They all load, and most are well-known "works on 1.12" mods, but they are the first suspects when something breaks.

## Version boundary

Everything here is pinned to KSP 1.12.5, the final KSP 1 release. The modding ecosystem is frozen at that version, so the risk is not game updates but **mod updates via CKAN**. Any CKAN upgrade should be followed by a re-run of the inventory tool and a diff of `docs/mods/data/mod-inventory.json`.
