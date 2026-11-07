import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { emptyFrame } from '@myksp/shared';
import { Recorder } from '../src/recordings.js';

function frame(t: number, situation: string, throttle = 0, stages = 2) {
  const f = emptyFrame('live', t);
  f.paused = 0;
  f.vessel.name = 'Probe';
  f.vessel.situation = situation;
  f.control.throttle = throttle;
  f.prop.stageCount = stages;
  return f;
}

describe('Recorder', () => {
  it('records every frame in powered flight and one per 5 s while coasting, plus every change', async () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'rec-'));
    const r = new Recorder(dir);
    let t = 1_000_000;
    for (let i = 0; i < 40; i++, t += 250) r.push(frame(t, 'Flying', 1)); // 10 s of ascent
    for (let i = 0; i < 240; i++, t += 250) r.push(frame(t, 'Orbiting Earth')); // 60 s coast
    r.push(frame(t, 'Orbiting Earth', 0, 1)); // staging during the coast
    r.close();
    await new Promise((res) => setTimeout(res, 50));
    const [file] = fs.readdirSync(dir);
    const lines = fs.readFileSync(path.join(dir, file), 'utf8').trim().split('\n');
    // 40 ascent frames, first coast frame (situation change) + about one per 5 s, + the staging frame.
    expect(lines.length).toBeGreaterThanOrEqual(40 + 12);
    expect(lines.length).toBeLessThanOrEqual(40 + 15);
    expect(JSON.parse(lines[lines.length - 1]).prop.stageCount).toBe(1);
  });
});
