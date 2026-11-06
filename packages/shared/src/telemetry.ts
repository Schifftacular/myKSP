/**
 * Normalized telemetry model.
 *
 * Every room in the ops center reads this shape, never raw Telemachus keys, so the source
 * (Telemachus today, kRPC or our own mod later) can change without touching a room.
 * Every numeric field is `number | null`; null means "the source did not report it",
 * which rooms must render as "no data", never as zero.
 */

export type Num = number | null;
export type Source = 'live' | 'replay' | 'sim';

export interface StageInfo {
  dv: Num;
  twr: Num;
  burnTime: Num;
  fuelMass: Num;
}

export interface TelemetryFrame {
  /** Wall-clock ms when the frame was produced (bridge time for live, original time for replay). */
  t: number;
  source: Source;
  /** Telemachus p.paused: 0 OK, 1 paused, 2 no power, 3 off, 4 no antenna, 5 not in flight. */
  paused: Num;
  vessel: {
    name: string | null;
    body: string | null;
    situation: string | null;
    met: Num;
    crew: Num;
    stage: Num;
    mass: Num;
    lat: Num;
    lon: Num;
    alt: Num;
    radarAlt: Num;
    vOrb: Num;
    vSurf: Num;
    vVert: Num;
    vHorz: Num;
    mach: Num;
    q: Num; // kPa
    g: Num;
    controllable: boolean | null;
  };
  orbit: {
    ap: Num;
    pe: Num;
    apR: Num;
    timeToAp: Num;
    timeToPe: Num;
    period: Num;
    sma: Num;
    ecc: Num;
    inc: Num;
    lan: Num;
    argPe: Num;
    trueAnomaly: Num;
  };
  attitude: { heading: Num; pitch: Num; roll: Num };
  control: {
    throttle: Num;
    sas: boolean | null;
    sasMode: string | null;
    rcs: boolean | null;
    gear: boolean | null;
    brakes: boolean | null;
    warp: Num;
  };
  prop: { totalDv: Num; totalBurn: Num; stageCount: Num; stages: StageInfo[] };
  power: { ec: Num; ecMax: Num };
  thermal: { hottestRatio: Num; hottestName: string | null };
  aero: { aoa: Num; stall: Num };
  comm: { signal: Num };
  target: { name: string | null; distance: Num; relVel: Num };
  landing: { timeToImpact: Num; suicideBurn: Num };
  /** Universal time in seconds, if known. */
  ut: Num;
}

/**
 * Telemachus keys the bridge subscribes to. Taken from the field list verified live against
 * this install (see _AgentDocs/telemachus.md on the Mac). Maneuver-node keys are deliberately
 * absent: they throw NullReferenceException in this Telemachus build and pollute every packet.
 */
export const TELEMACHUS_KEYS = [
  'v.name', 'v.body', 'v.situationString', 'v.missionTime', 'v.crewCount', 'v.currentStage',
  'v.mass', 'v.isControllable', 'v.lat', 'v.long', 'v.altitude', 'v.heightFromTerrain',
  'v.orbitalVelocity', 'v.surfaceVelocity', 'v.verticalSpeed', 'v.surfaceSpeed', 'v.mach',
  'v.dynamicPressurekPa', 'v.geeForce', 'v.sasValue', 'v.rcsValue', 'v.gearValue', 'v.brakeValue',
  'o.ApA', 'o.PeA', 'o.ApR', 'o.timeToAp', 'o.timeToPe', 'o.period', 'o.sma', 'o.eccentricity',
  'o.inclination', 'o.lan', 'o.argumentOfPeriapsis', 'o.trueAnomaly',
  'n.heading', 'n.pitch', 'n.roll',
  'f.throttle', 'f.sasEnabled', 'f.sasMode', 't.currentRate', 't.universalTime',
  'p.paused', 'dv.ready', 'dv.stageCount', 'dv.totalDVVac', 'dv.totalBurnTime',
  'r.resource[ElectricCharge]', 'r.resourceMax[ElectricCharge]',
  'therm.hottestPartTempRatio', 'therm.hottestPartName', 'far.aoa', 'far.stallFrac',
  'comm.signalStrength', 'tar.name', 'tar.distance', 'tar.o.relativeVelocity',
  'land.timeToImpact', 'land.suicideBurnCountdown',
] as const;

/** Per-stage keys, subscribed only once dv.stageCount says the stage exists. */
export function stageKeys(stageCount: number): string[] {
  const keys: string[] = [];
  for (let i = 0; i < stageCount; i++) {
    keys.push(`dv.stageDVVac[${i}]`, `dv.stageTWRActual[${i}]`, `dv.stageBurnTime[${i}]`, `dv.stageFuelMass[${i}]`);
  }
  return keys;
}

/** Telemachus returns non-finite numbers as the string "NaN". Treat anything non-finite as null. */
export function num(v: unknown): Num {
  if (typeof v === 'number') return Number.isFinite(v) ? v : null;
  if (typeof v === 'string' && v.trim() !== '' && v !== 'NaN') {
    const n = Number(v);
    return Number.isFinite(n) ? n : null;
  }
  return null;
}

export function bool(v: unknown): boolean | null {
  if (typeof v === 'boolean') return v;
  if (v === 1 || v === 'True' || v === 'true') return true;
  if (v === 0 || v === 'False' || v === 'false') return false;
  return null;
}

export function str(v: unknown): string | null {
  return typeof v === 'string' && v.length > 0 ? v : null;
}

/** Part names that Telemachus sometimes reports as bare digits ("1") are not names. */
export function partName(v: unknown): string | null {
  const s = str(v);
  if (!s || s.length < 3 || /^\d+$/.test(s)) return null;
  return s;
}

export function emptyFrame(source: Source, t = Date.now()): TelemetryFrame {
  return {
    t, source, paused: null, ut: null,
    vessel: { name: null, body: null, situation: null, met: null, crew: null, stage: null, mass: null, lat: null, lon: null, alt: null, radarAlt: null, vOrb: null, vSurf: null, vVert: null, vHorz: null, mach: null, q: null, g: null, controllable: null },
    orbit: { ap: null, pe: null, apR: null, timeToAp: null, timeToPe: null, period: null, sma: null, ecc: null, inc: null, lan: null, argPe: null, trueAnomaly: null },
    attitude: { heading: null, pitch: null, roll: null },
    control: { throttle: null, sas: null, sasMode: null, rcs: null, gear: null, brakes: null, warp: null },
    prop: { totalDv: null, totalBurn: null, stageCount: null, stages: [] },
    power: { ec: null, ecMax: null },
    thermal: { hottestRatio: null, hottestName: null },
    aero: { aoa: null, stall: null },
    comm: { signal: null },
    target: { name: null, distance: null, relVel: null },
    landing: { timeToImpact: null, suicideBurn: null },
  };
}

/** Map one Telemachus datalink message (key -> value) to a normalized frame. */
export function fromTelemachus(m: Record<string, unknown>, t = Date.now()): TelemetryFrame {
  const f = emptyFrame('live', t);
  f.paused = num(m['p.paused']);
  f.ut = num(m['t.universalTime']);
  const v = f.vessel;
  v.name = str(m['v.name']);
  v.body = str(m['v.body']);
  v.situation = str(m['v.situationString']);
  v.met = num(m['v.missionTime']);
  v.crew = num(m['v.crewCount']);
  v.stage = num(m['v.currentStage']);
  v.mass = num(m['v.mass']);
  v.controllable = bool(m['v.isControllable']);
  v.lat = num(m['v.lat']);
  v.lon = num(m['v.long']);
  v.alt = num(m['v.altitude']);
  v.radarAlt = num(m['v.heightFromTerrain']);
  v.vOrb = num(m['v.orbitalVelocity']);
  v.vSurf = num(m['v.surfaceVelocity']);
  v.vVert = num(m['v.verticalSpeed']);
  v.vHorz = num(m['v.surfaceSpeed']);
  v.mach = num(m['v.mach']);
  v.q = num(m['v.dynamicPressurekPa']);
  v.g = num(m['v.geeForce']);
  const o = f.orbit;
  o.ap = num(m['o.ApA']);
  o.pe = num(m['o.PeA']);
  o.apR = num(m['o.ApR']);
  o.timeToAp = num(m['o.timeToAp']);
  o.timeToPe = num(m['o.timeToPe']);
  o.period = num(m['o.period']);
  o.sma = num(m['o.sma']);
  o.ecc = num(m['o.eccentricity']);
  o.inc = num(m['o.inclination']);
  o.lan = num(m['o.lan']);
  o.argPe = num(m['o.argumentOfPeriapsis']);
  o.trueAnomaly = num(m['o.trueAnomaly']);
  f.attitude = { heading: num(m['n.heading']), pitch: num(m['n.pitch']), roll: num(m['n.roll']) };
  f.control = {
    throttle: num(m['f.throttle']),
    sas: bool(m['f.sasEnabled'] ?? m['v.sasValue']),
    sasMode: str(m['f.sasMode']),
    rcs: bool(m['v.rcsValue']),
    gear: bool(m['v.gearValue']),
    brakes: bool(m['v.brakeValue']),
    warp: num(m['t.currentRate']),
  };
  const stageCount = num(m['dv.stageCount']);
  const stages: StageInfo[] = [];
  if (stageCount !== null) {
    for (let i = 0; i < stageCount; i++) {
      stages.push({
        dv: num(m[`dv.stageDVVac[${i}]`]),
        twr: num(m[`dv.stageTWRActual[${i}]`]),
        burnTime: num(m[`dv.stageBurnTime[${i}]`]),
        fuelMass: num(m[`dv.stageFuelMass[${i}]`]),
      });
    }
  }
  // dv.totalDVVac has been seen reporting 0 through a whole live burn: prefer the stage sum then.
  let totalDv = num(m['dv.totalDVVac']);
  if (!totalDv) {
    const known = stages.map((s) => s.dv).filter((d): d is number => d !== null);
    totalDv = known.length ? known.reduce((a, b) => a + b, 0) : totalDv;
  }
  f.prop = { totalDv, totalBurn: num(m['dv.totalBurnTime']), stageCount, stages };
  f.power = { ec: num(m['r.resource[ElectricCharge]']), ecMax: num(m['r.resourceMax[ElectricCharge]']) };
  f.thermal = { hottestRatio: num(m['therm.hottestPartTempRatio']), hottestName: partName(m['therm.hottestPartName']) };
  f.aero = { aoa: num(m['far.aoa']), stall: num(m['far.stallFrac']) };
  f.comm = { signal: num(m['comm.signalStrength']) };
  f.target = { name: str(m['tar.name']), distance: num(m['tar.distance']), relVel: num(m['tar.o.relativeVelocity']) };
  f.landing = { timeToImpact: num(m['land.timeToImpact']), suicideBurn: num(m['land.suicideBurnCountdown']) };
  return f;
}

/**
 * The 2026-08-22 Falcon 9 log on the Mac uses a compact key set. Map it to the model; fields it
 * never recorded (lat/lon, attitude, per-stage dv) stay null and render as "no data".
 */
export function fromCompactLog(r: Record<string, unknown>): TelemetryFrame {
  const ts = num(r.ts);
  const f = emptyFrame('replay', ts !== null ? ts * 1000 : Date.now());
  f.paused = num(r.paused);
  f.vessel.name = str(r.name);
  f.vessel.situation = str(r.sit);
  f.vessel.body = 'Earth';
  f.vessel.met = num(r.met);
  f.vessel.alt = num(r.alt);
  f.vessel.vOrb = num(r.vel);
  f.vessel.vSurf = num(r.surf);
  f.vessel.vVert = num(r.vs);
  f.vessel.stage = num(r.stage);
  f.vessel.g = num(r.g);
  f.vessel.q = num(r.q);
  f.vessel.mach = num(r.mach);
  f.vessel.crew = num(r.crew);
  f.orbit.ap = num(r.ap);
  f.orbit.pe = num(r.pe);
  f.orbit.period = num(r.per);
  f.orbit.ecc = num(r.ecc);
  f.orbit.inc = num(r.inc);
  f.control.throttle = num(r.thr);
  f.control.warp = num(r.warp);
  f.thermal.hottestRatio = num(r.heat);
  f.thermal.hottestName = partName(r.hot);
  f.power.ec = num(r.ec);
  f.power.ecMax = num(r.ecm);
  f.comm.signal = num(r.sig);
  return f;
}
