import type { TelemetryFrame } from './telemetry.js';
import { atmosphereTop } from './limits.js';

export interface FlightEvent {
  met: number | null;
  t: number;
  kind: 'liftoff' | 'staging' | 'maxq' | 'meco' | 'orbit' | 'soi' | 'escape' | 'los' | 'aos' | 'vessel' | 'landed' | 'atmo-exit' | 'entry';
  text: string;
}

/**
 * Turns a stream of frames into the callouts a CAPCOM / flight loop would make.
 * Stateful: feed frames in order. Reset when the active vessel changes.
 */
export class EventDetector {
  private prev: TelemetryFrame | null = null;
  private qPeak = 0;
  private maxQCalled = false;
  private orbitCalled = false;

  push(f: TelemetryFrame): FlightEvent[] {
    const p = this.prev;
    const out: FlightEvent[] = [];
    const ev = (kind: FlightEvent['kind'], text: string) => out.push({ kind, text, met: f.vessel.met, t: f.t });

    if (p && f.vessel.name && p.vessel.name && f.vessel.name !== p.vessel.name) {
      this.reset();
      ev('vessel', `Active vessel is now ${f.vessel.name}`);
      this.prev = f;
      return out;
    }
    if (p) {
      const ps = p.vessel.situation ?? '', fs = f.vessel.situation ?? '';
      if (/pre.?launch/i.test(ps) && !/pre.?launch/i.test(fs)) ev('liftoff', 'Liftoff. Tower clear.');
      if (/landed|splashed/i.test(fs) && !/landed|splashed/i.test(ps) && !/pre.?launch/i.test(ps)) ev('landed', `${/splash/i.test(fs) ? 'Splashdown' : 'Touchdown'} on ${f.vessel.body ?? 'surface'}.`);
      if (f.vessel.stage !== null && p.vessel.stage !== null && f.vessel.stage < p.vessel.stage) ev('staging', `Staging confirmed, stage ${f.vessel.stage}.`);
      if (f.vessel.body && p.vessel.body && f.vessel.body !== p.vessel.body) ev('soi', `Entered ${f.vessel.body} sphere of influence.`);

      const q = f.vessel.q;
      if (q !== null) {
        if (q > this.qPeak) this.qPeak = q;
        if (!this.maxQCalled && this.qPeak > 5 && q < this.qPeak * 0.9) {
          this.maxQCalled = true;
          ev('maxq', `Max-Q, ${this.qPeak.toFixed(1)} kPa.`);
        }
      }
      const thrP = p.control.throttle, thrF = f.control.throttle;
      if (thrP !== null && thrF !== null && thrP > 0.05 && thrF === 0 && !/landed|pre.?launch/i.test(fs)) ev('meco', 'Engine cutoff.');

      const atmo = atmosphereTop(f.vessel.body);
      if (atmo > 0 && p.vessel.alt !== null && f.vessel.alt !== null) {
        if (p.vessel.alt < atmo && f.vessel.alt >= atmo) ev('atmo-exit', 'Out of the atmosphere.');
        if (p.vessel.alt >= atmo && f.vessel.alt < atmo) ev('entry', 'Entry interface.');
      }
      const pe = f.orbit.pe;
      if (!this.orbitCalled && pe !== null && f.vessel.alt !== null && pe > atmo && f.vessel.alt > atmo && (f.orbit.ecc ?? 1) < 1) {
        this.orbitCalled = true;
        ev('orbit', `Orbit insertion confirmed. ${((f.orbit.ap ?? 0) / 1000).toFixed(0)} by ${(pe / 1000).toFixed(0)} km.`);
      }
      if ((p.orbit.ecc ?? 0) < 1 && (f.orbit.ecc ?? 0) >= 1 && f.vessel.alt !== null && f.vessel.alt > atmo) ev('escape', `Escape trajectory from ${f.vessel.body ?? 'body'}.`);

      const ps0 = p.comm.signal, fs0 = f.comm.signal;
      if (ps0 !== null && fs0 !== null) {
        if (ps0 > 0 && fs0 === 0) ev('los', 'Loss of signal.');
        if (ps0 === 0 && fs0 > 0) ev('aos', 'Acquisition of signal.');
      }
    }
    this.prev = f;
    return out;
  }

  reset() {
    this.prev = null;
    this.qPeak = 0;
    this.maxQCalled = false;
    this.orbitCalled = false;
  }
}
