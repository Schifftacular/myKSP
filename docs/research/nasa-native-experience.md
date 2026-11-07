# Making myKSP feel like running a NASA program

Research notes from the Artemis research thread. Each idea is tied to how NASA actually
runs Artemis today (late 2026), says what it does for gameplay, and flags what still needs
checking. Concrete work items handed to other threads are in [`handoff.md`](handoff.md).

Legend: **[V]** verified against a cited 2026 source · **[K]** well-documented NASA practice,
not re-checked this pass · **[?]** still open.

## 1. The program, not just the rocket

| Idea | Real-world basis | Gameplay value |
|---|---|---|
| **Program board with three phases** (Phase 1 access/experiment → Phase 2 build → Phase 3 live) that unlocks as milestones complete | NASA Moon Base phases: now–2029, 2029–2032, 2032+ **[V]** | Gives the career a visible spine toward the permanent base |
| **Map onto RP-1 Programs** rather than inventing a parallel system | RP-1 v4.8.1.0 has `RP0_PROGRAM` nodes with duration, funding curve, confidence cost, requirements and objectives (e.g. CrewedLunar, EarlyLunarHabitation) **[V]** | Real funding and reputation consequences for keeping NASA's schedule |
| **Two-provider lander competition**: the player funds two lander lines; whichever passes its uncrewed landing first gets the first crew | Starship and Blue Moon MK2 both in plan, neither assigned; one uncrewed landing each required **[V]** | Risk and redundancy choices that mirror real program management |
| **"Delivery as a service" contracts** where the player is the CLPS provider | CLPS model; about 10 deliveries per year planned from 2027; NASA plans 17 surface deliveries **[V]** | Steady robotic income and site data between crewed flights |
| **Schedule slip as a mechanic**: dates shown as NET and allowed to slip, with reputation cost scaled to how public the date was | Every 2026 CLPS mission slipped (Moon Base I and III to 2027); New Glenn pad explosion delayed three NASA deliveries **[V]** | Realistic pressure without hard failures |
| **Oversight events**: Aerospace Safety Advisory Panel and Inspector General findings can force an extra test flight or cost budget if ignored | ASAP and OIG findings on Artemis in 2026 **[V]** | Safety culture as a gameplay layer |
| **Single points of failure in the supply chain**: one launcher grounding blocks every payload that depends on it | New Glenn grounding blocks Moon Base I, VIPER and the LTVs (`NEW-GLENN-RTF` in the manifest) **[V]** | Rewards contracting more than one launch provider |
| **Fiscal year budget cycle** starting 1 October | US federal FY **[K]**; RP-1 budgets by subsidy + program funding **[V]** | Long-term planning |
| **Competitor timeline**: China's south-pole missions and 2030 crewed-landing goal as world events | Chang'e-7 stood down Aug 2026 **[V]** | Narrative urgency |
| **International partner seats** earned through partner contracts | ESA's Parmitano on Artemis III, CSA's Hansen on Artemis II; JAXA trades its pressurised rover for seats **[V]** | Partner hardware (Canadarm3, JAXA rover) arrives as contract rewards |

## 2. Mission lifecycle the player walks through

1. **Mission definition**: objectives, crew, lander provider, landing-site shortlist. South-pole sites unlock from CLPS, VIPER and MoonFall data **[V]**.
2. **Crew assignment announcement**: four-person crews, international seats **[V]**.
3. **Hardware flow**: booster stacking, core-stage mate in VAB High Bay 3, Orion integration, rollout to LC-39B **[V]**.
4. **Wet dress rehearsal** that can uncover faults (Artemis II's helium-flow issue delayed launch) **[V]**.
5. **Countdown in the Launch Control Center** (Artemis II as flown) **[V]**:
   - Call to stations L-49h50m; clock starts L-49h40m.
   - Built-in holds: L-12h35m (2h45m), L-5h10m (1h10m), L-40m (30 min, the "T-10 hold").
   - Ground Launch Sequencer active L-13h15m; tanking go/no-go L-10h50m; crew boards L-4h; hatch closed about L-1h40m; final NASA Test Director briefing L-50m; visors down L-15m.
   - Launch Director's go/no-go poll before terminal count.
   - Terminal count: T-10m GLS start; T-8m crew access arm retracts; T-33s hand-off to the automated launch sequencer; T-6.36s RS-25 start; T-0 booster ignition.
   - Recycle rules: can hold at T-6m for the rest of the window; holds of up to 3 minutes between T-6m and T-1:30, longer recycles to T-10; after the automated sequencer takes over, any stop scrubs the day.
   - Control passes from Kennedy to Houston at booster ignition.
6. **Campaign execution**: multi-launch missions are normal now (Artemis III needs three launches; a Starship landing needs many tanker flights) **[V]**. The UI tracks a campaign, not a single vessel.
7. **Surface ops**: two crew down, two in Orion, two moonwalks of about two hours total; LTVs support up to three moonwalks, 10 km per charge **[V]**.
8. **Recovery and post-flight**: ocean splashdown (Artemis II off San Diego), then a lessons-learned report **[V]**.

## 3. Mission Control and interfaces

**Houston Mission Control positions used on Artemis** (NASA's Artemis I roster, plus CAPCOM for crewed flights) **[V]**:

| Call sign | Job | Useful as a myKSP lens for |
|---|---|---|
| FLIGHT | Flight Director | Overall go/no-go, mission rules |
| CAPCOM | Talks to the crew (crewed flights) | Crew comms, procedures |
| FDO | Trajectory and aborts | Orbit, manoeuvres, abort options |
| BOOSTER | SLS boosters, core stage, upper stage through TLI | Ascent |
| CONTROL | SLS/upper-stage guidance until TLI | Ascent guidance |
| GNC | Orion navigation and attitude | Attitude, nav state |
| PROP | Propulsion and burns | Burn execution, propellant |
| EECOM | Environment, life support, emergency procedures | Cabin, consumables |
| C&DH | Avionics, computers, data | Vessel computers, errors |
| MPO | Power, mechanical, structures, landing and recovery | Electrical, recovery |
| INCO | Data, telemetry, video and command links | Comm links, signal |
| GC | Ground systems, Near Space and Deep Space Network links | Ground stations |
| FAO | Flight plan timeline | Flight-day plan strip |
| PAO | Public commentary | Optional broadcast audio |

ISS-era call signs (e.g. ODIN, ECLSS) are not confirmed for Orion; avoid them.

**Kennedy launch team** (Firing Room 1, ~90 people): Launch Director (runs the polls), NASA Test Director, Ground Launch Sequencer software, closeout crew, Eastern Range and weather **[V]**.

**Other interface ideas**
- Mission Elapsed Time and GMT side by side, flight days ("FD3 docking") as the planning unit **[V]**.
- Comm coverage as a constraint: far-side and polar sites need relays (Altus-1 on IM-3, ESA Lunar Pathfinder with Blue Ghost M2) **[V]**.
- Lunar illumination at the pole as a planning overlay **[V]**.
- NASA vocabulary: NET, L-minus, T-minus, scrub, recycle, built-in hold, MET, go/no-go, FRR **[K]**.

## 4. Base-building that follows NASA's logic

- **Survey before build**: VIPER, MoonFall and Griffin-1/FLIP data decide the base site **[V]**.
- **Utility nodes first**: three HALO-derived Lunar Infrastructure Demos (power, thermal, comms, night survival) **[V]**.
- **Mobility before habitation**: LTVs land ahead of the Artemis IV crew; pressurised rover (JAXA) around 2029–2031 **[V]**.
- **Robotics for logistics**: Canadarm3 repurposed for surface cargo and assembly **[V]**.
- **Power gates permanence**: NASA wants a fission reactor by 2030, but paused the procurement in March 2026 to rethink it **[V]**. Make "survive a lunar night with crew" the Phase 2 boss fight.
- **Plume hazards**: SCALPSS flies on most Moon Base landers; keep pads away from habitats **[V]**.

## 5. Brand and licensing (verified)

- The NASA insignia (meatball), logotype (worm) and seal **may not be used without NASA's explicit permission**, and never as branding on third-party products; the seal is for the Administrator only (14 CFR 1221) **[V]**.
- Mission identifiers such as the Artemis identifier and crew emblems are not cleared for outside use; requests go to NASA's Associate Administrator for Communications **[V]**.
- NASA photos, video and audio are generally not copyrighted. Credit "NASA" (or the named photographer), never imply endorsement, and check third-party credits **[V]**.
- No NASA page covers games or mods specifically **[?]**.

**Decision for myKSP**: an original agency identity in NASA's design spirit. Real mission names
appear only as world data. NASA imagery may be used with credit. If Mike ever wants real marks,
the request goes to agency-brand@mail.nasa.gov.

## 6. Live data for keeping the game in sync

| Source | Use | Facts |
|---|---|---|
| NASA Artemis blog and Moon Base pages | Primary schedule changes | Watched daily by the research thread |
| Launch Library 2 (The Space Devs) | Machine-readable launch dates for a "real world" ticker | API 2.3.0; free tier 15 requests/hour/IP; they ask you to cache; no licence page found; CLPS launches are present but not reliably tagged with the CLPS program, so match by name too **[V]** |
| NASA Image and Video Library | Reference imagery for environments | Credit NASA; check third-party credits **[V]** |
| Official NASA launch feed | — | None exists (no API, RSS or iCal) **[V]** |

Recommendation: the bridge service fetches LL2 at most a few times a day, caches the result,
and joins it to the manifest by mission id.

## Open questions

- Landing sites of the Firefly and Intuitive Machines June 2026 awards.
- ESA's I-Hab decision (December 2026 ministerial).
- Artemis IV crew and which lander flies first; SLS upper-stage choice (around summer 2027).
- What NASA announced at the 2026-11-07 Moon Base update.
