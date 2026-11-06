# Integration surfaces: getting data in and out of KSP

KSP 1.12.5 has no official external API. Everything a front end can see or control goes through a mod that runs inside the game, or through files the game writes. This install has four live interfaces plus the save files.

| Surface | Version | Transport | Direction | State on 2026-11-06 |
|---|---|---|---|---|
| **Telemachus Reborn** | 1.7.0 | HTTP + WebSocket, port **8085**, all interfaces | read, plus a few actions | Running, partless mode, verified live by an earlier audit (`_AgentDocs/telemachus.md`) and by the environments workstream |
| **kRPC** | 0.6.0 | Protobuf over TCP, RPC **50000**, stream **50001**, bound to `0.0.0.0` | full read and control | Running, auto-starts, auto-accepts clients |
| **KSPBridge** | 0.15.1 | MQTT publish to `localhost:1883`, topics `ksp/telemetry/#` | read only (push) | Loads and starts 18 producers at 10 Hz, then **fails to connect**: no broker is running |
| **Stand Alone Map View** (server half) | 1.0.0.3 | TCP/UDP, listen 26718, client 26719 | sync with a second KSP instance | Loaded, `Enabled = True`, no client install exists |
| Save files (`saves/<name>/persistent.sfs`) | n/a | ConfigNode text on disk | read (write only when KSP is closed) | KSP writes on quicksave, scene change, and autosave |

## Telemachus Reborn 1.7.0

- **Endpoints.** `http://<host>:8085/telemachus/datalink?<alias>=<key>` for one-shot reads (for example `?p=p.paused`). `ws://<host>:8085/datalink` for a stream. The browser UI is at `/telemachus/index.html`. Camera frames are at `/telemachus/cameras` and `/telemachus/cameras/<name>`.
- **Subscribe** by sending `{"+": ["v.altitude", "o.PeA"], "rate": 250}`. Unsubscribe with `"-"`. One-shot actions go through `{"run": ["f.stage"]}`. Nothing is sent until the first subscription.
- **Config:** `GameData/Telemachus/Plugins/PluginData/Telemachus/config.xml` (`PORT 8085`, `IPADDRESS -1` meaning all interfaces, `PARTLESS 1`).
- **RO interplay.** RealismOverhaul adds `TelemachusDataLink` to every antenna part (299 parts), so partless mode is belt and braces. Telemachus **ignores RealAntennas**: it keeps reporting during a comms blackout. A front end that wants realistic loss of signal has to compute it from RealAntennas state, which only kRPC or a custom plugin can see.
- **Good for:** a quick flight-dynamics feed into a browser with no client library. **Weak at:** career state (funds, contracts, tech), anything not on the active vessel, and writes.
- Key reference: [Telemachus Reborn API (TeaGuild docs)](https://teaguild.github.io/Telemachus-1/api/).

## kRPC 0.6.0

- **Config:** `GameData/kRPC/PluginData/settings.cfg`. `autoStartServers = True`, `autoAcceptConnections = True`, `pauseServerWithGame = True`, `logLevel = Debug`, one server "Default Server" on `0.0.0.0`, RPC 50000, stream 50001.
- **Services loaded:** `KRPC` (core), `SpaceCenter`, `KerbalAlarmClock`, `Drawing`, `UI`, `DockingCamera`, `LiDAR`, `InfernalRobotics`, `RemoteTech`. The last four are inert because their target mods are not installed. Each service's schema ships as JSON next to its DLL (`KRPC.SpaceCenter.json` etc.), which is what code generators read.
- **kRPC.MechJeb is deliberately off.** CKAN still lists `kRPC-MechJeb` 0.7.1 as installed, but `KRPC.MechJeb.dll` has been moved to `_disabled-mods/kRPC/`. Treat MechJeb as not scriptable over kRPC until that is re-tested against kRPC 0.6.0 and MechJeb 2.15.3.
- **What 0.6.0 adds** over the long-standing 0.5.4: a game-scene setting, `Vessel.Loaded`/`Vessel.Packed`, a staging API, `AutoPilot.TargetRotation`, and more SpaceCenter coverage ([changelog](https://krpc.github.io/krpc/0.6.0/changelog.html)). Client libraries must be 0.6.x to match.
- **Career data.** `SpaceCenter` exposes funds, science, reputation, contracts (`ContractManager`), launch sites, and the warp/time API. That makes kRPC the only live interface here that can drive a career dashboard.
- **Logged noise.** `KSP.log` shows `[kRPC] Error - Instance not found` stacks when a client holds a stale object id after a vessel switch. Clients should re-resolve vessels on scene change rather than cache remote objects.
- **Security.** `0.0.0.0` plus auto-accept means any device on the LAN or tailnet can control the vessel. Bind to `127.0.0.1` (or keep auto-accept off) unless a remote console is intended.

## KSPBridge 0.15.1 (MQTT)

- Author: John Knight ([johnmknight/KSPBridge](https://github.com/johnmknight/KSPBridge), MIT). Built against MQTTnet 4.3.7.
- **Config:** `GameData/KSPBridge/Settings.cfg`, node `KSPBRIDGE`: `broker_host = localhost`, `broker_port = 1883`, `topic_prefix = ksp/telemetry`, `client_id = kspbridge`.
- **Confirmed root cause of "not working":** the plugin is fine. `KSP.log` shows `plugin loaded, version 0.15.1`, `MQTT bridge started`, `telemetry scheduler started at 10.0 Hz, 18 producer(s) registered`, then `MQTT connect failed: Error while connecting host 'Unspecified/localhost:1883'` every 5 seconds. Nothing is listening on 1883.
- **Fix:** run Mosquitto on the Mac (`brew install mosquitto`, with a `listener 1883` and, for browsers, a `listener 9002` + `protocol websockets` block). Then `mosquitto_sub -t 'ksp/telemetry/#' -v` should show traffic within a second of entering flight. The topic schema is `docs/TOPICS.md` in the KSPBridge repository.
- **Why it is interesting:** it is the only push-based, many-subscriber feed. A broker decouples the game from every screen, so the front end, a Stream Deck, an ESP32 panel and a logger can all listen without each opening a connection into KSP.

## Stand Alone Map View

Server half only (`saves/samv_server.cfg`: listen 26718, client 127.0.0.1:26719). It needs a second, stripped KSP install running the client. None exists, so it costs a little CPU for nothing. Candidate for removal unless the environments workstream wants a dedicated map-view monitor.

## Save files

- `saves/<name>/persistent.sfs` is a ConfigNode tree: `GAME > PARAMETERS`, `SCENARIO` nodes (contracts live in `SCENARIO { name = ContractSystem }`, Contract Configurator state in `ContractPreLoader`, funds in `Funding`, tech in `ResearchAndDevelopment`), and `FLIGHTSTATE > VESSEL`.
- Reading is safe at any time (copy first; KSP may be mid-write). **Writing while KSP is running is never safe**; the game overwrites the file and may load a half-written one.
- Most recently written career: `saves/AFSA` (Nov 4). `saves/default` (sandbox) was written today.

## Recommended authority model

| Data | Authoritative source | Notes |
|---|---|---|
| Vessel state (orbit, attitude, resources) | kRPC streams | Telemachus or MQTT as a cheap fan-out mirror |
| Career state (funds, contracts, tech) | kRPC `SpaceCenter` live, `persistent.sfs` when the game is closed | No other live interface exposes it |
| Contract definitions | `GameData/**/*.cfg` after ModuleManager (`ModuleManager.ConfigCache`) | Raw files can be patched; the cache is what the game saw |
| Mod and part catalogue | `tools/mod-inventory` output plus `PartDatabase.cfg` | Regenerate after any CKAN change |
| Time | Game UT from kRPC (`SpaceCenter.UT`). RP2000 sets the RSSDateTime epoch to **2000-01-01T00:00:00** (`RP2000/RSSDateTimePatch.cfg`), so UT 0 is 1 Jan 2000 | Do not use wall-clock time |

A front end should treat the game as the only writer, reconnect on scene change, and degrade to "last known state" when the socket drops. Nothing it shows should require a connection to be up to render.
