# Visuals, immersion, and launch sites

Reference for the immersive-environments workstream. Checked against the install on 2026-11-06.

## Hardware and graphics API ceiling

KSP 1.12.5 on this Mac runs **OpenGL 4.1 on Apple's Metal translation layer** (`SM: 46 (OpenGL 4.1 Metal)`), Apple M4 10-core GPU, 32 GB unified memory. Two hard limits follow from that and show up in `KSP.log`:

- **No usable compute shaders.** FAR logs `Kernel 'CountPixelsMain' not found` while generating drag data, and the raymarched-cloud shaders are compiled without their compute path. Any mod feature that depends on compute shaders will silently degrade.
- **32 texture slots per shader.** `Scatterer-EVE/RaymarchCloud` asks for 34 to 40 and the driver warns it cannot honour that.

An earlier attempt (2026-08-21, `_AgentDocs/volumetrics-install-20260821.md`) installed Blackrack's raymarched volumetric clouds with the RSS-Volumetrics configs and got roughly **0.5 fps**. It was rolled back on 2026-08-22.

## What is actually installed now (and why it is inconsistent)

| Component | On disk / loaded | CKAN thinks |
|---|---|---|
| EVE | **3.2.2** (raymarched-capable build), `RaymarchedCloudsQualityManager` running | 1.11.7.2 |
| Scatterer | **0.0906** (DLL 0.905) | 0.0878 |
| StockVolumetricClouds | present (Sep 1), raymarched configs for stock bodies | not tracked |
| Blackrack_TUFX.cfg | present at GameData root | not tracked |
| RSSVE | legacy RSSVE configs (Aug 18); patches the Scatterer planet list for RSS bodies | RSSVE-LR 3.1.0 |
| StockScattererConfigs | present; supplies the base `Scatterer_planetsList` that RSSVE patches | not tracked |
| Deferred | `zzz_Deferred` 1.3.5 | 1.3.5 |
| TUFX | 1.1.1 with profiles Blackrack, Blaze, Dan, Switch, JSIA Vision | matches |

So after the August rollback, the early-access EVE/Scatterer and StockVolumetricClouds came back (folder dates Aug 23 and Sep 1), while RSSVE and StockScattererConfigs are also present. What that means:

1. **The planet list is fine.** `StockScattererConfigs/planetsList.cfg` defines the one `Scatterer_planetsList`, and `RSSVE_Scatterer_Planetlist_Config.cfg` is a `@Scatterer_planetsList:FOR[RSSVE]` patch on top of it. The resolved `ModuleManager.ConfigCache` holds exactly one list. (The first survey misread the patch as a second definition.)
2. **Scatterer could not find its blue-noise texture.** `FileNotFoundException: .../GameData/Scatterer/stbn.R8`. The file ships in `GameData/EnvironmentalVisualEnhancements/`. **Fixed 2026-11-07:** copied into `GameData/Scatterer/`; takes effect at the next launch.
3. **CKAN's registry no longer describes the visual stack.** A CKAN upgrade or "install dependencies" pass can overwrite the EA files. Decline any CKAN prompt touching EVE or Scatterer until the stack is settled.

The environments workstream should pick one visual baseline, measure frame time for it (see budgets below), and then make the install match it, with CKAN either told the truth (mark the EA files as manually installed) or kept away from those modules.

## The rest of the immersion stack

| Area | Mods | Notes |
|---|---|---|
| Atmosphere, clouds, lighting | Scatterer, EVE, RSSVE, Deferred, PlanetShine, Distant Object, TUFX, KSPBurst, KSPTextureLoader | Deferred and PlanetShine overlap; RSS-Volumetrics readme recommends dropping PlanetShine with Deferred |
| Plumes and FX | Waterfall 0.11, RealPlume 13.3.2, SmokeScreen 2.8.14 | Waterfall is the modern path; RealPlume configs still cover many engines |
| Cockpits (IVA) | FreeIva 0.2.20.2, RasterPropMonitor 1.1.0.1 + MechJebRPM, ASET Props/Avionics/Agency, DE_IVAExtension, HabTechProps, TDProps, JSIA Vision | Coverage audit: `_AgentDocs/iva.md` |
| Cameras | HullcamVDS 0.2.2.4 (+ `ZZZ_HullcamRO` patch), CameraTools 1.37.1, Telemachus camera endpoint | Notes and keybinds: `_AgentDocs/hullcam.md`. Backspace is both a Hullcam key and Abort |
| Audio | Chatterer 0.9.99 + Chatterer Extended | Both declare old KSP maxima; they load and work |
| UI | HUDReplacer, ZTheme, WasdMainMenu, KerbalChangelog | KerbalChangelog throws on one malformed changelog (`0.43.0.11b`) |
| Editor | EditorExtensionsRedux, VABOrganizer (+ SheepDog, Munk), RCSBuildAid, JanitorsCloset, WasdEditorCamera, FShangarExtender | VABOrganizer throws a duplicate-key error (`berth`) at load; sorting still works |

## Launch sites and KSC

- **KSC Switcher 2.2** with RSS's `LaunchSites.cfg`: 29 real sites (Cape Canaveral, KSC, Vandenberg, Wallops, Kodiak, Brownsville, Baikonur, Plesetsk, Kourou, Wenchang, Tanegashima, Satish Dhawan, Mahia, ...).
- **Kerbal Konstructs 1.12.2** hosts statics from **Tundra Space Center 2.0.2** (pads `TSC 39A`, `TSC 39B`, `TLC 40`, `TLC 41`, `TSC 46`, `Landing Zone 1`, runways, helipads) and **KSC Extended 3.0.3**. Local fix: `LocalFixBackups/KSCExtended-TSCKSRSS-TSC_PQSDecal.cfg.orig` is the pre-fix copy of a KSC Extended decal config.
- **Modular Launch Pads 2.9.1** provides towers, clamps and flame trenches as parts (three base parts are unreachable in career; see [backlog.md](backlog.md)).

For an Artemis-flavoured experience, 39B plus the SLS and Orion parts is the closest match available.

## Suggested performance budget

At 2560×1440 on the M4, measure before and after each visual change with the same save and view (on the pad at 39B, and in LEO over daylight Earth):

- Flight scene: ≥ 30 fps on the pad, ≥ 45 fps in orbit.
- Scene load (measured 2026-11-07): **2 m 33 s** warm (MM cache reused), **6 m 07 s** after any GameData change (full ModuleManager rebuild, ~69,300 patches). Before the fix it was 15 m 13 s: Distant Object's KSPe.Light library walks the whole KSP root at startup and spent 7 m 41 s on a 21.5k-file `_tools/docking-cards/node_modules` folder (moved to `~/Projects/myKSP/_tools`, logged in `LocalFixBackups/README-moves.txt`). **Keep the KSP folder free of tooling** (node_modules, repos, venvs), and batch GameData edits so each launch pays the rebuild at most once.
- Front-end budget alongside KSP: it shares the same GPU and memory, so the front end should stay well under a few hundred MB of GPU memory and avoid continuous 60 fps WebGL rendering while KSP is in flight.
