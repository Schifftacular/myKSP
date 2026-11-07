import { emptyFrame, type TelemetryFrame } from './telemetry.js';

/**
 * Deterministic ascent simulator, used when no game is connected so rooms can be designed,
 * demoed and tested. Every frame it emits is marked source: 'sim' and every room badges it SIM.
 * It is NOT game data. Physics: point mass, inverse-square gravity, rotating spherical Earth
 * (RSS values), two stages, open-loop pitch program then a simple closed-loop insertion.
 * Drag is ignored for the trajectory; q and Mach are computed for display only.
 */
const MU = 3.986004418e14;
const R = 6_371_000;
const OMEGA = 7.2921159e-5;
const G0 = 9.80665;
const LAUNCH = { lat: 28.6082, lon: -80.6041 }; // LC-39B
const TARGET_ALT = 200_000;

interface Stage { dry: number; prop: number; thrust: number; isp: number }
const STAGES: Stage[] = [
  { dry: 26_000 + 118_000, prop: 400_000, thrust: 7_600_000, isp: 300 }, // stage 1 (dry includes upper stack)
  { dry: 4_500 + 18_000, prop: 95_000, thrust: 981_000, isp: 348 },      // stage 2 (dry includes payload)
];

type V3 = [number, number, number];
const add = (a: V3, b: V3): V3 => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
const mul = (a: V3, s: number): V3 => [a[0] * s, a[1] * s, a[2] * s];
const dot = (a: V3, b: V3) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const cross = (a: V3, b: V3): V3 => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const len = (a: V3) => Math.sqrt(dot(a, a));
const norm = (a: V3): V3 => mul(a, 1 / len(a));
const deg = (r: number) => (r * 180) / Math.PI;
const rad = (d: number) => (d * Math.PI) / 180;

export interface SimOptions { vesselName?: string; prelaunchSeconds?: number }

export class AscentSim {
  /** Seconds since sim start; liftoff at prelaunchSeconds. */
  time = 0;
  private r: V3;
  private v: V3;
  private stageIdx = 0;
  private propLeft: number[];
  private engineOn = false;
  private seco = false;
  private ec = 4000;
  private readonly prelaunch: number;
  private readonly name: string;
  private hotRatio = 0.12;
  private pitchCmd = 90;

  constructor(opts: SimOptions = {}) {
    this.prelaunch = opts.prelaunchSeconds ?? 10;
    this.name = opts.vesselName ?? 'SIM Ascent Demo';
    const la = rad(LAUNCH.lat), lo = rad(LAUNCH.lon);
    this.r = [R * Math.cos(la) * Math.cos(lo), R * Math.cos(la) * Math.sin(lo), R * Math.sin(la)];
    this.v = cross([0, 0, OMEGA], this.r);
    this.propLeft = STAGES.map((s) => s.prop);
  }

  private met() { return Math.max(0, this.time - this.prelaunch); }

  private mass(): number {
    // A stage's dry mass already includes the full stack above it.
    return STAGES[this.stageIdx].dry + this.propLeft[this.stageIdx];
  }

  /** Local frame at position r: up, east, north. */
  private local(r: V3) {
    const up = norm(r);
    const east = norm(cross([0, 0, 1], up));
    const north = cross(up, east);
    return { up, east, north };
  }

  private thrustDir(): V3 {
    const { up, east, north } = this.local(this.r);
    const met = this.met();
    let pitch: number;
    const alt = len(this.r) - R;
    if (this.stageIdx === 0) {
      // Open-loop gravity-turn style program.
      pitch = met < 8 ? 90 : Math.max(25, 90 - 62 * Math.pow((met - 8) / 152, 0.75));
    } else {
      // Closed loop: aim vertical speed at a value that arrives at the target altitude.
      const vrel = this.vRel();
      const vv = dot(vrel, up);
      const desiredVv = Math.max(-50, Math.min(250, (TARGET_ALT - alt) / 80));
      pitch = Math.max(-5, Math.min(45, 8 + (desiredVv - vv) * 0.06));
    }
    this.pitchCmd = pitch;
    // Launch azimuth 90° (due east) from the Cape, so the plane matches launch latitude.
    const p = rad(pitch);
    void north;
    return norm(add(mul(up, Math.sin(p)), mul(east, Math.cos(p))));
  }

  private vRel(): V3 { return add(this.v, mul(cross([0, 0, OMEGA], this.r), -1)); }

  /** Advance the simulation by dt seconds (internally sub-stepped). */
  step(dt: number) {
    const sub = 0.05;
    for (let t = 0; t < dt - 1e-9; t += sub) this.substep(Math.min(sub, dt - t));
  }

  private substep(h: number) {
    this.time += h;
    const met = this.met();
    if (this.time < this.prelaunch) {
      // On the pad: rotate with the Earth.
      const ang = OMEGA * h;
      const c = Math.cos(ang), s = Math.sin(ang);
      this.r = [this.r[0] * c - this.r[1] * s, this.r[0] * s + this.r[1] * c, this.r[2]];
      this.v = cross([0, 0, OMEGA], this.r);
      this.ec -= 0.5 * h;
      return;
    }
    if (!this.seco) this.engineOn = true;
    let acc: V3 = mul(norm(this.r), -MU / dot(this.r, this.r));
    if (this.engineOn) {
      const st = STAGES[this.stageIdx];
      const mdot = st.thrust / (st.isp * G0);
      const m = this.mass();
      acc = add(acc, mul(this.thrustDir(), st.thrust / m));
      this.propLeft[this.stageIdx] -= mdot * h;
      if (this.propLeft[this.stageIdx] <= 0) {
        this.propLeft[this.stageIdx] = 0;
        if (this.stageIdx < STAGES.length - 1) this.stageIdx++;
        else { this.engineOn = false; this.seco = true; }
      }
      // Cut off at insertion: periapsis above the atmosphere and apoapsis at/above target.
      if (this.stageIdx === STAGES.length - 1) {
        const el = elements(this.r, this.v);
        if (el.pe - R > 150_000) { this.engineOn = false; this.seco = true; }
      }
    }
    this.v = add(this.v, mul(acc, h));
    this.r = add(this.r, mul(this.v, h));
    const vs = len(this.vRel());
    const altKm = (len(this.r) - R) / 1000;
    const heatIn = this.engineOn ? 0.0006 : 0;
    const qHeat = 0.5 * 1.225 * Math.exp(-altKm / 7.2) * vs * vs * vs * 2e-10;
    this.hotRatio = Math.min(0.98, Math.max(0.1, this.hotRatio + (heatIn + qHeat) * h - 0.002 * h * (this.hotRatio - 0.1)));
    // Batteries until orbit, then deployed solar arrays charge them back up.
    this.ec += (this.seco ? 0.6 : met > 0 ? -1.2 : -0.5) * h;
    if (this.ec > 4000) this.ec = 4000;
    if (this.ec < 0) this.ec = 0;
  }

  frame(t = Date.now()): TelemetryFrame {
    const f = emptyFrame('sim', t);
    const r = this.r, v = this.v;
    const { up, east, north } = this.local(r);
    const vrel = this.vRel();
    const alt = len(r) - R;
    const theta = OMEGA * this.time; // Earth rotation since sim start
    const lonInertial = Math.atan2(r[1], r[0]);
    let lon = deg(lonInertial - theta);
    lon = ((lon + 540) % 360) - 180;
    const lat = deg(Math.asin(r[2] / len(r)));
    const vVert = dot(vrel, up);
    const vHorz = Math.sqrt(Math.max(0, dot(vrel, vrel) - vVert * vVert));
    const rho = 1.225 * Math.exp(-alt / 7200);
    const vs = len(vrel);
    const el = elements(r, v);
    const met = this.met();
    const prelaunch = this.time < this.prelaunch;
    const atmo = 140_000;
    const situation = prelaunch ? 'Pre-Launch' : alt < atmo ? 'Flying' : el.pe - R > atmo ? 'Orbiting' : 'Sub-Orbital';

    f.paused = 0;
    f.ut = 0 + this.time;
    Object.assign(f.vessel, {
      name: this.name, body: 'Earth', situation, met, crew: 0, stage: prelaunch ? STAGES.length : STAGES.length - 1 - this.stageIdx,
      mass: this.mass(), lat, lon, alt, radarAlt: alt, vOrb: len(v), vSurf: vs, vVert, vHorz,
      mach: vs / 330, q: (0.5 * rho * vs * vs) / 1000, g: this.engineOn ? STAGES[this.stageIdx].thrust / this.mass() / G0 : 0,
      controllable: true,
    });
    Object.assign(f.orbit, {
      ap: el.ap - R, pe: el.pe - R, apR: el.ap, sma: el.a, ecc: el.e, inc: el.inc, lan: el.lan, argPe: el.argPe,
      trueAnomaly: el.nu, period: el.period, timeToAp: el.timeToAp, timeToPe: el.timeToPe,
    });
    const hdgVec = norm(add(mul(east, dot(vrel, east)), mul(north, dot(vrel, north))));
    const heading = (deg(Math.atan2(dot(hdgVec, east), dot(hdgVec, north))) + 360) % 360;
    f.attitude = { heading: prelaunch ? 90 : heading, pitch: prelaunch ? 90 : this.pitchCmd, roll: 0 };
    f.control = { throttle: this.engineOn ? 1 : 0, sas: true, sasMode: 'StabilityAssist', rcs: false, gear: false, brakes: false, warp: 1 };
    const stages = STAGES.slice(this.stageIdx).map((s, i) => {
      const prop = this.propLeft[this.stageIdx + i];
      const m0 = s.dry + prop;
      const dv = s.isp * G0 * Math.log(m0 / s.dry);
      return { dv, twr: s.thrust / (m0 * G0), burnTime: prop / (s.thrust / (s.isp * G0)), fuelMass: prop };
    });
    f.prop = { totalDv: stages.reduce((a, s) => a + (s.dv ?? 0), 0), totalBurn: stages.reduce((a, s) => a + (s.burnTime ?? 0), 0), stageCount: stages.length, stages };
    f.power = { ec: this.ec, ecMax: 4000 };
    f.thermal = { hottestRatio: this.hotRatio, hottestName: this.stageIdx === 0 ? 'Interstage' : 'Payload Fairing' };
    f.aero = { aoa: alt < atmo ? Math.max(-3, Math.min(3, (this.pitchCmd - deg(Math.atan2(vVert, vHorz || 1))) * 0.2)) : null, stall: 0 };
    f.comm = { signal: 1 };
    f.target = { name: null, distance: null, relVel: null };
    f.landing = { timeToImpact: el.pe - R < 0 && !prelaunch ? estimateImpact(alt, vVert) : null, suicideBurn: null };
    return f;
  }
}

function estimateImpact(alt: number, vVert: number): number | null {
  // Ballistic estimate, enough for a SIM display.
  const g = 9.81;
  const disc = vVert * vVert + 2 * g * alt;
  if (disc < 0) return null;
  return (vVert + Math.sqrt(disc)) / g;
}

export function elements(r: V3, v: V3) {
  const rm = len(r), vm = len(v);
  const h = cross(r, v);
  const hm = len(h);
  const eVec = add(mul(cross(v, h), 1 / MU), mul(r, -1 / rm));
  const e = len(eVec);
  const a = 1 / (2 / rm - (vm * vm) / MU);
  const inc = deg(Math.acos(Math.max(-1, Math.min(1, h[2] / hm))));
  const nVec: V3 = [-h[1], h[0], 0];
  const nm = len(nVec) || 1e-9;
  let lan = deg(Math.acos(Math.max(-1, Math.min(1, nVec[0] / nm))));
  if (nVec[1] < 0) lan = 360 - lan;
  let argPe = e > 1e-8 ? deg(Math.acos(Math.max(-1, Math.min(1, dot(nVec, eVec) / (nm * e))))) : 0;
  if (eVec[2] < 0) argPe = 360 - argPe;
  let nu = e > 1e-8 ? deg(Math.acos(Math.max(-1, Math.min(1, dot(eVec, r) / (e * rm))))) : 0;
  if (dot(r, v) < 0) nu = 360 - nu;
  const ap = e < 1 ? a * (1 + e) : -Math.abs(a) * (1 + e); // KSP reports negative Ap when hyperbolic
  const pe = a * (1 - e);
  let period: number | null = null, timeToAp: number | null = null, timeToPe: number | null = null;
  if (e < 1 && a > 0) {
    period = 2 * Math.PI * Math.sqrt((a * a * a) / MU);
    const E = 2 * Math.atan(Math.sqrt((1 - e) / (1 + e)) * Math.tan(rad(nu) / 2));
    let M = E - e * Math.sin(E);
    if (M < 0) M += 2 * Math.PI;
    const n = (2 * Math.PI) / period;
    timeToPe = ((2 * Math.PI - M) % (2 * Math.PI)) / n;
    timeToAp = (((Math.PI - M) % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI) / n;
  }
  return { a, e, inc, lan, argPe, nu, ap, pe, period, timeToAp, timeToPe };
}
