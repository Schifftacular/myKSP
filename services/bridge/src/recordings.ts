import fs from 'node:fs';
import path from 'node:path';
import readline from 'node:readline';
import { fromCompactLog, type TelemetryFrame } from '@myksp/shared';

/**
 * Records live flights to JSONL (one normalized frame per line) and replays them.
 * A new file starts when the active vessel changes or after a 60 s gap in flight telemetry.
 */
export class Recorder {
  private stream: fs.WriteStream | null = null;
  private file: string | null = null;
  private vessel: string | null = null;
  private lastT = 0;
  private lastWritten = 0;

  constructor(private dir: string, private minIntervalMs = 250) {
    fs.mkdirSync(dir, { recursive: true });
  }

  get current() { return this.file ? path.basename(this.file) : null; }

  push(f: TelemetryFrame) {
    if (f.source !== 'live') return;
    if (f.paused === 5 || !f.vessel.name) return; // not in flight
    const gap = f.t - this.lastT > 60_000;
    if (!this.stream || gap || f.vessel.name !== this.vessel) this.rotate(f);
    this.lastT = f.t;
    if (f.t - this.lastWritten < this.minIntervalMs) return;
    this.lastWritten = f.t;
    this.stream!.write(JSON.stringify(f) + '\n');
  }

  private rotate(f: TelemetryFrame) {
    this.stream?.end();
    const stamp = new Date(f.t).toISOString().replace(/[:.]/g, '-').slice(0, 19);
    const safe = (f.vessel.name ?? 'vessel').replace(/[^A-Za-z0-9_-]+/g, '_').slice(0, 40);
    this.file = path.join(this.dir, `${stamp}_${safe}.jsonl`);
    this.vessel = f.vessel.name;
    this.stream = fs.createWriteStream(this.file, { flags: 'a' });
  }

  close() { this.stream?.end(); this.stream = null; }
}

export interface RecordingInfo { file: string; bytes: number; modified: string }

export function listRecordings(dirs: string[]): RecordingInfo[] {
  const out: RecordingInfo[] = [];
  for (const dir of dirs) {
    if (!fs.existsSync(dir)) continue;
    for (const name of fs.readdirSync(dir)) {
      if (!name.endsWith('.jsonl')) continue;
      const st = fs.statSync(path.join(dir, name));
      out.push({ file: name, bytes: st.size, modified: st.mtime.toISOString() });
    }
  }
  return out.sort((a, b) => b.modified.localeCompare(a.modified));
}

/** Load a recording. Accepts our normalized frames or the compact 2026-08 flight-log format. */
export async function loadRecording(file: string): Promise<TelemetryFrame[]> {
  const frames: TelemetryFrame[] = [];
  const rl = readline.createInterface({ input: fs.createReadStream(file), crlfDelay: Infinity });
  for await (const line of rl) {
    if (!line.trim()) continue;
    let r: Record<string, unknown>;
    try { r = JSON.parse(line); } catch { continue; }
    if (r && typeof r === 'object' && 'vessel' in r && 'orbit' in r) frames.push({ ...(r as unknown as TelemetryFrame), source: 'replay' });
    else frames.push(fromCompactLog(r));
  }
  return frames;
}

/** Plays frames with their original spacing (scaled by speed). Returns a stop function. */
export function play(frames: TelemetryFrame[], speed: number, onFrame: (f: TelemetryFrame) => void, onEnd: () => void): () => void {
  let i = 0;
  let timer: NodeJS.Timeout | null = null;
  const next = () => {
    if (i >= frames.length) { onEnd(); return; }
    const f = frames[i];
    onFrame({ ...f, source: 'replay' });
    const dt = i + 1 < frames.length ? Math.max(0, frames[i + 1].t - f.t) : 0;
    i++;
    timer = setTimeout(next, Math.min(dt, 10_000) / Math.max(0.01, speed));
  };
  next();
  return () => { if (timer) clearTimeout(timer); };
}
