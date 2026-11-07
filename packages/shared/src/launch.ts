import type { TelemetryFrame } from './telemetry.js';
import type { Level } from './limits.js';

/**
 * Launch Control Center logic: the terminal-count clock and the GO/NO-GO poll.
 * Pure and deterministic so it can be unit-tested; the room only renders it.
 * Nothing here commands the vehicle: the player still launches in KSP.
 */

export type PollStation = 'RANGE' | 'VEHICLE' | 'PROP' | 'GNC' | 'COMM' | 'CREW' | 'THERMAL';
export const POLL_ORDER: PollStation[] = ['RANGE', 'VEHICLE', 'PROP', 'GNC', 'COMM', 'CREW', 'THERMAL'];
export const POLL_TITLES: Record<PollStation, string> = {
  RANGE: 'Range & pad', VEHICLE: 'Vehicle power', PROP: 'Propulsion', GNC: 'Guidance & control',
  COMM: 'Communications', CREW: 'Crew', THERMAL: 'Thermal',
};

export interface PollAnswer { station: PollStation; go: boolean; level: Level; detail: string }

export interface MissionProfile {
  /** Δv the vehicle needs to deliver from the pad (vacuum Δv as KSP reports it). RSS LEO ≈ 9.3 km/s. */
  requiredDv: number;
  crewed: boolean;
}

export const PROFILES: Record<string, MissionProfile & { label: string }> = {
  leo: { label: 'Low Earth orbit', requiredDv: 9300, crewed: false },
  leoCrew: { label: 'Crewed LEO', requiredDv: 9300, crewed: true },
  tli: { label: 'Trans-lunar injection', requiredDv: 12500, crewed: false },
  lunarCrew: { label: 'Crewed lunar (Orion-class)', requiredDv: 13600, crewed: true },
  suborbital: { label: 'Suborbital', requiredDv: 2500, crewed: false },
};

/** Answer the poll from one frame. `commNet` false means the save has CommNet off. */
export function poll(f: TelemetryFrame | null, profile: MissionProfile, commNet: boolean | null): PollAnswer[] {
  const a = (station: PollStation, level: Level, detail: string): PollAnswer => ({ station, go: level === 'nominal', level, detail });
  if (!f || f.paused === 5 || !f.vessel.situation) {
    return POLL_ORDER.map((s) => a(s, 'nodata', 'No vehicle on the pad (KSP not in flight)'));
  }
  const v = f.vessel;
  const out: PollAnswer[] = [];
  const onPad = /pre.?launch|landed/i.test(v.situation ?? '');
  out.push(a('RANGE', onPad && v.body === 'Earth' ? 'nominal' : onPad ? 'caution' : 'warning',
    onPad ? `${v.situation} on ${v.body ?? '?'}${v.lat !== null && v.lon !== null ? ` at ${v.lat.toFixed(3)}°, ${v.lon.toFixed(3)}°` : ''}` : `Vehicle is ${v.situation}, not on the pad`));

  const ec = f.power.ec !== null && f.power.ecMax ? f.power.ec / f.power.ecMax : null;
  out.push(a('VEHICLE', ec === null ? 'nodata' : ec >= 0.5 ? 'nominal' : ec >= 0.25 ? 'caution' : 'warning',
    ec === null ? 'No electric charge data' : `Electric charge ${(ec * 100).toFixed(0)} %${f.paused === 2 ? ', NO POWER' : ''}`));

  const dv = f.prop.totalDv;
  const stages = f.prop.stages;
  const first = stages.length ? stages[stages.length - 1] : null;
  const twr = first?.twr ?? null;
  let propLevel: Level = dv === null ? 'nodata' : dv >= profile.requiredDv ? 'nominal' : dv >= profile.requiredDv * 0.95 ? 'caution' : 'warning';
  if (twr !== null && twr < 1.0) propLevel = 'warning';
  else if (twr !== null && twr < 1.15 && propLevel === 'nominal') propLevel = 'caution';
  out.push(a('PROP', propLevel, `${dv === null ? 'Δv unknown' : `Δv ${Math.round(dv)} of ${profile.requiredDv} m/s`}${twr !== null ? ` · liftoff TWR ${twr.toFixed(2)}` : ''}`));

  const ctrl = v.controllable;
  out.push(a('GNC', ctrl === false ? 'warning' : ctrl === null ? 'nodata' : 'nominal',
    ctrl === false ? 'Vehicle not controllable' : `Controllable · SAS ${f.control.sas ? 'on' : 'off'}`));

  if (commNet === false) out.push(a('COMM', 'nominal', 'CommNet is off in this save: link not required'));
  else {
    const s = f.comm.signal;
    out.push(a('COMM', s === null ? 'nodata' : s >= 0.25 ? 'nominal' : s > 0.05 ? 'caution' : 'warning', s === null ? 'No signal data' : `Signal ${(s * 100).toFixed(0)} %`));
  }

  const crew = v.crew ?? 0;
  out.push(a('CREW', profile.crewed ? (crew > 0 ? 'nominal' : 'warning') : 'nominal',
    profile.crewed ? (crew > 0 ? `${crew} aboard` : 'Crewed profile but nobody is aboard') : crew > 0 ? `${crew} aboard (uncrewed profile)` : 'Uncrewed'));

  const heat = f.thermal.hottestRatio;
  out.push(a('THERMAL', heat === null ? 'nodata' : heat < 0.5 ? 'nominal' : heat < 0.75 ? 'caution' : 'warning',
    heat === null ? 'No thermal data' : `Hottest part ${(heat * 100).toFixed(0)} % of limit`));
  return out;
}

export function pollGo(answers: PollAnswer[]) { return answers.length > 0 && answers.every((x) => x.go); }

// ---------------------------------------------------------------------------------------------
// Terminal count

export type CountState = 'idle' | 'counting' | 'hold' | 'recycle' | 'launched' | 'scrubbed';

export interface Countdown {
  state: CountState;
  /** Count value (seconds, negative before T-0) at `ref`. */
  tAtRef: number;
  /** Clock time `ref` was taken at (seconds; game UT when live, else wall clock). */
  ref: number;
  /** Built-in holds, as count values (e.g. -600 for T-10 min). Each is used once. */
  holds: number[];
  holdReason: string | null;
  /** When the automatic sequence starts; the poll must be GO to pass it. */
  autoSeq: number;
}

export function newCountdown(from = -1200, holds = [-600, -240], autoSeq = -31): Countdown {
  return { state: 'idle', tAtRef: from, ref: 0, holds: [...holds].sort((a, b) => a - b), holdReason: null, autoSeq };
}

/** Current count value at clock time `now`. */
export function countValue(c: Countdown, now: number) {
  return c.state === 'counting' ? c.tAtRef + (now - c.ref) : c.tAtRef;
}

export function startCount(c: Countdown, now: number): Countdown {
  if (c.state === 'launched' || c.state === 'scrubbed') return c;
  return { ...c, state: 'counting', ref: now, holdReason: null };
}

export function holdCount(c: Countdown, now: number, reason: string): Countdown {
  if (c.state !== 'counting') return c;
  return { ...c, state: 'hold', tAtRef: countValue(c, now), ref: now, holdReason: reason };
}

export function recycleCount(c: Countdown, to: number): Countdown {
  return { ...c, state: 'hold', tAtRef: to, holdReason: `Recycled to T${fmtCount(to)}` };
}

export function scrubCount(c: Countdown, reason: string): Countdown {
  return { ...c, state: 'scrubbed', holdReason: reason };
}

/**
 * Advance the count to `now`: stop at built-in holds, stop at the auto-sequence start unless the
 * poll is GO, and mark launched when the vehicle has left the pad.
 */
export function tickCount(c: Countdown, now: number, pollIsGo: boolean, liftedOff: boolean): Countdown {
  // Only a liftoff during an active count ends it; a vehicle already flying when the count is idle
  // (or one launched after a scrub) does not count as this count's launch.
  if (liftedOff && (c.state === 'counting' || c.state === 'hold')) return { ...c, state: 'launched', tAtRef: Math.max(0, countValue(c, now)), ref: now, holdReason: null };
  if (c.state !== 'counting') return c;
  const t = countValue(c, now);
  const prev = c.tAtRef;
  for (const h of c.holds) {
    if (prev < h && t >= h) {
      return { ...c, state: 'hold', tAtRef: h, ref: now, holds: c.holds.filter((x) => x !== h), holdReason: `Built-in hold at T${fmtCount(h)}` };
    }
  }
  if (prev < c.autoSeq && t >= c.autoSeq && !pollIsGo) {
    return { ...c, state: 'hold', tAtRef: c.autoSeq, ref: now, holdReason: 'Automatic hold: poll is not GO for launch' };
  }
  // Keep the reference fresh so the next tick's "prev" is this tick's value.
  return { ...c, tAtRef: t, ref: now };
}

/** "-00:10:00" style count, sign included. */
export function fmtCount(t: number): string {
  const neg = t < 0;
  let x = Math.floor(Math.abs(t));
  const h = Math.floor(x / 3600); x -= h * 3600;
  const m = Math.floor(x / 60); const s = x - m * 60;
  const p = (n: number) => String(n).padStart(2, '0');
  return `${neg ? '-' : '+'}${p(h)}:${p(m)}:${p(s)}`;
}
