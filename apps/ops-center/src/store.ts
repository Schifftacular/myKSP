import { evaluate, rollup, type CareerSummary, type Check, type FlightEvent, type Level, type Position, type TelemetryFrame } from '@myksp/shared';

export interface BridgeStatus {
  mode: 'live' | 'sim' | 'replay';
  replayFile: string | null;
  telemachus: { connected: boolean; lastFrameAt: number | null; lastError: string | null; url: string };
  recording: string | null;
  savesAvailable: boolean;
  activeSave?: string | null;
  commNet?: boolean | null;
}

export interface Sample { met: number; alt: number | null; vel: number | null; lat: number | null; lon: number | null }

/**
 * Single source of truth for the front end. Holds derived/cached data only; KSP stays authoritative.
 * History is a bounded ring so a long session cannot grow memory without limit.
 */
export class Store {
  frame: TelemetryFrame | null = null;
  frameAt = 0; // local receive time
  checks: Check[] = [];
  levels: Record<Position, Level> | null = null;
  events: FlightEvent[] = [];
  status: BridgeStatus | null = null;
  bridgeConnected = false;
  career: { save: string; summary: CareerSummary } | null = null;
  careerError: string | null = null;
  history: Sample[] = [];
  recordings: { file: string; bytes: number; modified: string }[] = [];
  private historyVessel: string | null = null;
  private listeners = new Set<(what: 'frame' | 'event' | 'status' | 'career') => void>();
  static readonly HISTORY_MAX = 7200; // 30 min at 4 Hz

  on(fn: (what: 'frame' | 'event' | 'status' | 'career') => void) { this.listeners.add(fn); return () => this.listeners.delete(fn); }
  private emit(what: 'frame' | 'event' | 'status' | 'career') { for (const l of this.listeners) l(what); }

  setFrame(f: TelemetryFrame) {
    const key = `${f.source}:${f.vessel.name}`;
    if (key !== this.historyVessel || (this.frame && f.vessel.met !== null && this.frame.vessel.met !== null && f.vessel.met < this.frame.vessel.met - 1)) {
      this.history = [];
      this.historyVessel = key;
    }
    this.frame = f;
    this.frameAt = performance.now();
    this.checks = evaluate(f, { commNet: this.status?.commNet });
    this.levels = rollup(this.checks);
    if (f.vessel.met !== null) {
      this.history.push({ met: f.vessel.met, alt: f.vessel.alt, vel: f.vessel.vOrb, lat: f.vessel.lat, lon: f.vessel.lon });
      if (this.history.length > Store.HISTORY_MAX) this.history.splice(0, this.history.length - Store.HISTORY_MAX);
    }
    this.emit('frame');
  }

  setHistory(key: string, samples: Sample[]) {
    this.history = samples.slice(-Store.HISTORY_MAX);
    this.historyVessel = key;
  }

  /** Backfilled events (sent on connect) are listed but not announced again. */
  addEvent(e: FlightEvent, backfill = false) {
    this.events.push(e);
    if (this.events.length > 100) this.events.shift();
    this.emit(backfill ? 'frame' : 'event');
  }

  setStatus(s: BridgeStatus) {
    const modeChanged = this.status?.mode !== s.mode || this.status?.replayFile !== s.replayFile;
    this.status = s;
    if (modeChanged) { this.events = []; this.history = []; this.frame = null; this.levels = null; this.checks = []; }
    this.emit('status');
  }

  setBridge(connected: boolean) { this.bridgeConnected = connected; this.emit('status'); }

  setCareer(c: Store['career'], err: string | null = null) { this.career = c; this.careerError = err; this.emit('career'); }

  /** Seconds since the last frame arrived, or Infinity. */
  age() { return this.frame ? (performance.now() - this.frameAt) / 1000 : Infinity; }

  /** What the ops bar badge says. */
  linkState(): { label: string; cls: string } {
    if (!this.bridgeConnected) return { label: 'BRIDGE DOWN', cls: 'warning' };
    const m = this.status?.mode;
    if (m === 'sim') return { label: 'SIM', cls: 'sim' };
    if (m === 'replay') return { label: 'REPLAY', cls: 'sim' };
    if (!this.status?.telemachus.connected) return { label: 'NO LINK', cls: 'warning' };
    if (this.frame?.paused === 5) return { label: 'NOT IN FLIGHT', cls: 'nodata' };
    if (this.age() > 3) return { label: `STALE ${Math.round(this.age())}s`, cls: 'caution' };
    return { label: 'LIVE', cls: 'nominal' };
  }
}

export const store = new Store();

export function connectBridge() {
  let ws: WebSocket | null = null;
  let backoff = 500;
  const url = `${location.protocol === 'https:' ? 'wss' : 'ws'}://${location.host}/ws`;
  const open = () => {
    ws = new WebSocket(url);
    ws.onopen = () => { backoff = 500; store.setBridge(true); loadCareer(); };
    ws.onmessage = (m) => {
      let msg: any;
      try { msg = JSON.parse(m.data); } catch { return; }
      if (msg.type === 'frame') store.setFrame(msg.frame);
      else if (msg.type === 'event') store.addEvent(msg.event, !!msg.backfill);
      else if (msg.type === 'status') store.setStatus(msg);
      else if (msg.type === 'history') store.setHistory(msg.key, msg.samples);
    };
    ws.onclose = () => {
      store.setBridge(false);
      setTimeout(open, backoff);
      backoff = Math.min(backoff * 2, 8000);
    };
  };
  open();
  // Career data changes only when KSP saves; a slow poll is plenty and costs nothing.
  setInterval(loadCareer, 30_000);
}

export async function loadCareer() {
  try {
    const r = await fetch('/api/career');
    const body = await r.json();
    if (!r.ok) return store.setCareer(null, body.error ?? `HTTP ${r.status}`);
    store.setCareer(body);
  } catch (e) {
    store.setCareer(null, (e as Error).message);
  }
}

export async function setSource(mode: 'live' | 'sim' | 'replay', file?: string, speed = 1) {
  await fetch('/api/source', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ mode, file, speed }) });
}

export async function listRecordings(): Promise<{ file: string; bytes: number; modified: string }[]> {
  const r = await fetch('/api/recordings');
  return (await r.json()).recordings ?? [];
}
