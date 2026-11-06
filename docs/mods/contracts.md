# Writing contracts for this install

Reference for the contracts workstream. Everything here is checked against `/Applications/KSP-RP2000` as of 2026-11-06.

## The engine: Contract Configurator 2.13.4 (KSP-RO build)

- Fork maintained by KSP-RO: [KSP-RO/ContractConfigurator](https://github.com/KSP-RO/ContractConfigurator) (MIT; RemoteTech integration GPL-2.0). The 2.x line is RO's continuation of jrossignol's 1.x, so the [original wiki](https://github.com/jrossignol/ContractConfigurator/wiki) is still the best syntax reference for `CONTRACT_TYPE`, `PARAMETER`, `REQUIREMENT`, `BEHAVIOUR` and `DATA` nodes.
- Contracts are ModuleManager-patchable config nodes. They load after ModuleManager, so a contract file can use `:NEEDS[...]` and other mods can patch it.
- **Per-contract debug logs** are written to `GameData/ContractConfigurator/log/<group>/<contract>.log`. Load errors and requirement checks land there and in `KSP.log` under `[ContractConfigurator]`. Read them after every change.
- 58 contract types load today, all in the `RP2000` group tree.

## What the career already has

RP2000 ships one top-level group, `RP2000` (`GameData/RP2000/FromRP-0/Contracts/ContractGroups.cfg`), with subgroups:

| Subgroup | Count | Content |
|---|---:|---|
| Milestones | 17 | First launch to space, orbit, EVA, docking, station, GEO, Moon impact/flyby/landing, crewed Mars/Venus flyby |
| HumanContracts | 10 | Suborbital, LEO 1-3, station, crew rotation, lunar orbit, lunar landing, Mars landing (max 3 at once) |
| LandingContracts | 13 | Uncrewed landings Moon through Triton |
| Fly-ByContracts | 10 | Planetary flybys |
| OrbitContracts | 4 | Moon, Mars, Jupiter, Saturn orbit |
| RPBases | 2 | `MoonBaseCreate`, `MarsBaseCreate` |
| OreContracts | 2 | Moon and Mars ore collection |
| SpecialOrbitContracts | 0 | empty |

It also disables most stock contract types (ARM, base, explore, grand tour, record, part test, station, survey, world-first) and keeps CollectScience, ISRU, PlantFlag, RecoverAsset, Satellite and Tourism.

**Recommendation:** put the new campaign in its own top-level group (for example `MYKSP` with `ARTEMIS`, `CLPS`, `LUNARBASE` subgroups) in a new GameData folder such as `GameData/myKSP/Contracts/`. That keeps it separable from RP2000, easy to back up, and removable by deleting one folder. Use `disabledContractType` or a ModuleManager `!CONTRACT_TYPE[...]` patch to retire RP2000 contracts the new ones replace (`MoonBaseCreate`, `HumanMoonLanding`, `Lunar Landing 1 Repeat`).

### Bugs in the existing lunar-base contract

`GameData/RP2000/NewContracts/MoonBaseCreate.cfg`:

- The notes say "support 4 Kerbals" but `HasCrewCapacity` requires `minCapacity = 6`.
- The `HasCrew` parameter has two `name` keys (`HasCrew`, `Unmanned`); CC uses one and ignores the other.
- The power check names the stock `FuelCell` and `FuelCellArray` parts directly instead of checking for a generator module, so RO fuel cells from other packs do not count.
- No life-support, no duration, no location, no follow-on contracts. It is a placeholder, not a base campaign.

## Facts a contract author needs

**Calendar.** UT 0 is **2000-01-01** (RP2000 patches the RSSDateTime epoch). Real-date windows have to be converted: 2026-01-01 is UT 820,540,800 s and 2030-01-01 is UT 946,771,200 s. Use `REQUIREMENT { type = Expression; expression = UniversalTime() > ... }` or CC's date helpers to gate contracts on dates.

**Bodies (RSS names).** `Sun, Mercury, Venus, Earth, Moon, Mars, Phobos, Deimos, Vesta, Ceres, Jupiter, Io, Europa, Ganymede, Callisto, Saturn, Mimas, Enceladus, Tethys, Dione, Rhea, Titan, Iapetus, Uranus, Miranda, Ariel, Umbriel, Titania, Oberon, Neptune, Triton, Pluto, Charon`. Earth is the stock Kerbin body renamed at load time, so prefer `HomeWorld()` over the literal name. The existing RP2000 contracts use `targetBody = Moon` and load cleanly; never use `Mun`.

**Launch sites.** KSC Switcher provides 29 real sites (`us_cape_canaveral`, `ksc`, `us_vandenburg`, `kz_baikonur`, `fr_kourou`, `cn_wenchang`, `us_brownsville`, ...). Tundra Space Center adds named pads that match the Cape: `TSC 39A`, `TSC 39B`, `TLC 40`, `TLC 41`, `TSC 46`, `Landing Zone 1`. CC's `LaunchSite` checks and KK launch-site names can therefore express "launch from 39B".

**Life support: TAC Life Support 0.18.** Resources: `Food`, `Water`, `Oxygen`, `CarbonDioxide`, `Waste`, `WasteWater`. Per-kerbal rates (per second): Food 1.69e-5, Water 1.12e-5, Oxygen 1.71e-3, plus 0.014 EC per kerbal and a 0.021 EC base load. A 30-day stay for 4 crew needs about 175 Food, 116 Water, 17,770 Oxygen (units). Use `HasResource` to require consumables on the base vessel. Kerbalism is not installed.

**Power.** Valid generator modules here: `ModuleDeployableSolarPanel` and ROSolar's panels, `ModuleGenerator` (RTGs, fuel cells), `ModuleResourceConverter` fuel cells. Prefer `PartValidation` with `partModule` over part names.

**Comms.** RealAntennas 2.12 replaces CommNet. Use CC's `HasAntenna` sparingly; RealAntennas does not map cleanly to stock antenna power. `VesselParameterGroup` plus a part-module check on `ModuleRealAntenna` is more robust.

**Part names you can require** (internal `name`, all RO-supported):

| Mission element | Parts |
|---|---|
| Orion | `benjee10_orion_Capsule`, `benjee10_orion_serviceModule` (ESM), `benjee10_orion_heatShield`, `benjee10_orion_solarArray`, LAS parts `benjee10_orion_abort_*` |
| SLS | `benjee10_SLS_coreStage`, `benjee10_SLS_engineSection`, `PC_5Seg_RSRM` (5-segment SRB), `benjee10_SLS_BOLE_booster`, `bluedog_DeltaIV_DCSS_5m` (ICPS), `benjee10_SLS_EUS` (Block 1B), `benjee10_SLS_LVSA`, `benjee10_SLS_USA_fairing` |
| Lunar lander (Lockheed concept) | `benjee10_HLS_pod`, `benjee10_HLS_tank`, `benjee10_HLS_leg`, `benjee10_HLS_avionics`, `benjee10_HLS_fuelCell`, `benjee10_HLS_cargoBox` |
| Starship / Super Heavy | `SEP_24_SHIP_*` (Block 1), `SEP_25_*` (Block 2), `SEP_26_*` (Block 3, plus docking hardware), Raptor 1/2/3 engines `SEP_23_RAPTOR*`, `SEP_24_R1*`, `SEP_26_R3_*` |
| Engines from other packs | Merlin `ROE-Merlin1D`, RL10 (EDB, RN, ROE), J-2X `ROE-J2X`, BE-7 `EDB-BE7` |

There is no Starship HLS crew-cabin part, no Gateway module pack, and no Blue Origin Blue Moon lander. Gateway and a crewed Starship HLS would need either procedural stand-ins or new parts (a job for the mod workstream).

## Career blockers the contracts depend on

1. **Unreachable parts.** 196 RO parts point at tech nodes that do not exist in the RP2000 tree, so they can never be researched in career: 128 ROCapsules parts, 37 ROTanks parts, 13 ROEngines launch clamps (`unlockParts`, `standardDockingPorts`), 15 Starship Block 3 and flap parts (`flightControlNF`, `orbitalRocketryNF`, `capsulesNF`), and 3 Modular Launch Pad bases. `ZZZ_RP2000_Fixes/OrphanTechNodes.cfg` fixed an earlier batch on 2026-08-20; the SEP update since then reintroduced the gap. If a contract requires one of these parts, the career cannot complete it. See [backlog.md](backlog.md).
2. **No build time, no reliability.** KCT and TestFlight are not installed, so "this launch takes two years to prepare" or "this engine has 98% reliability" cannot be enforced by the game. Contracts that want realistic cadence have to gate on dates instead.
3. **Funding is stock-style.** Without RP-1 there is no budget per year. Advance funds and rewards are the economy, tuned by Custom Barn Kit facility costs (`RP2000/FromRP-0/CustomBarnKit.cfg`).

## Test loop for a new contract

1. Write the cfg in `GameData/myKSP/Contracts/`.
2. Start KSP, load a copy of a career save (never the live one).
3. Check `GameData/ContractConfigurator/log/<group>/<name>.log` and `KSP.log` for `[ContractConfigurator]` errors.
4. Use CC's debug window (Alt+F10, the "Contract Configurator" tab) to force-offer the contract and inspect requirement results.
5. Commit only after the contract offers, accepts and completes on a test vessel.
