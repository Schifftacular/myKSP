import type { TelemetryFrame } from './telemetry.js';
import { EventDetector, type FlightEvent } from './events.js';
import { evaluate, type Level, type Position } from './limits.js';

/**
 * Post-flight analysis for the Mission Evaluation Room: replays a recording through the same
 * event detector and limit checks the live room uses, and condenses it for display.
 */
export interface Violation { position: Position; id: string; label: string; level: Level; startMet: number | null; endMet: number | null; worst: string }

export interface FlightAnalysis {
  vessel: string | null;
  frames: number;
  duration: number | null; // s of MET covered
  startMet: number | null;
  endMet: number | null;
  maxAlt: number | null;
  maxSpeed: number | null;
  maxQ: { value: number; met: number | null } | null;
  maxG: { value: number; met: number | null } | null;
  reachedOrbit: boolean;
  bodies: string[];
  events: FlightEvent[];
  violations: Violation[];
  /** Down-sampled series for plots: met, alt, orbital speed, q, g, throttle. */
  series: { met: number; alt: number | null; vel: number | null; q: number | null; g: number | null; thr: number | null; ap: number | null; pe: number | null }[];
}

export function analyzeFlight(frames: TelemetryFrame[], maxPoints = 1200): FlightAnalysis {
  const det = new EventDetector();
  const events: FlightEvent[] = [];
  const open = new Map<string, Violation>();
  const violations: Violation[] = [];
  let maxAlt: number | null = null, maxSpeed: number | null = null;
  let maxQ: FlightAnalysis['maxQ'] = null, maxG: FlightAnalysis['maxG'] = null;
  let reachedOrbit = false;
  const bodies = new Set<string>();
  const inFlight = frames.filter((f) => f.vessel.met !== null);
  for (const f of frames) {
    for (const e of det.push(f)) events.push(e);
    const v = f.vessel;
    if (v.body) bodies.add(v.body);
    if (v.alt !== null && (maxAlt === null || v.alt > maxAlt)) maxAlt = v.alt;
    if (v.vOrb !== null && (maxSpeed === null || v.vOrb > maxSpeed)) maxSpeed = v.vOrb;
    if (v.q !== null && (!maxQ || v.q > maxQ.value)) maxQ = { value: v.q, met: v.met };
    if (v.g !== null && (!maxG || v.g > maxG.value)) maxG = { value: v.g, met: v.met };
    if (/orbit/i.test(v.situation ?? '') && !/sub/i.test(v.situation ?? '')) reachedOrbit = true;
    const bad = new Set<string>();
    for (const c of evaluate(f)) {
      if (c.level !== 'caution' && c.level !== 'warning') continue;
      const key = `${c.position}:${c.id}:${c.level}`;
      bad.add(key);
      const cur = open.get(key);
      if (cur) { cur.endMet = v.met; cur.worst = c.detail; }
      else open.set(key, { position: c.position, id: c.id, label: c.label, level: c.level, startMet: v.met, endMet: v.met, worst: c.detail });
    }
    for (const [k, vio] of open) if (!bad.has(k)) { violations.push(vio); open.delete(k); }
  }
  violations.push(...open.values());
  const step = Math.max(1, Math.ceil(inFlight.length / maxPoints));
  const series = inFlight
    .filter((_, i) => i % step === 0 || i === inFlight.length - 1)
    .map((f) => ({ met: f.vessel.met!, alt: f.vessel.alt, vel: f.vessel.vOrb, q: f.vessel.q, g: f.vessel.g, thr: f.control.throttle, ap: f.orbit.ap, pe: f.orbit.pe }));
  const startMet = inFlight[0]?.vessel.met ?? null, endMet = inFlight[inFlight.length - 1]?.vessel.met ?? null;
  return {
    vessel: frames.find((f) => f.vessel.name)?.vessel.name ?? null,
    frames: frames.length,
    duration: startMet !== null && endMet !== null ? endMet - startMet : null,
    startMet, endMet, maxAlt, maxSpeed, maxQ, maxG, reachedOrbit,
    bodies: [...bodies], events, violations, series,
  };
}
