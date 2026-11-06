import { describe, expect, it } from 'vitest';
import { WebSocketServer } from 'ws';
import { TelemachusClient } from '../src/telemachus.js';
import type { TelemetryFrame } from '@myksp/shared';

/** A fake Telemachus datalink that records what the client subscribes to. */
function fakeTelemachus() {
  const wss = new WebSocketServer({ port: 0, path: '/datalink' });
  const received: any[] = [];
  const sockets: any[] = [];
  wss.on('connection', (ws) => {
    sockets.push(ws);
    ws.on('message', (d) => received.push(JSON.parse(String(d))));
  });
  const port = () => (wss.address() as any).port;
  return { wss, received, sockets, port };
}

const until = async (cond: () => boolean, ms = 3000) => {
  const t0 = Date.now();
  while (!cond()) {
    if (Date.now() - t0 > ms) throw new Error('timeout');
    await new Promise((r) => setTimeout(r, 20));
  }
};

describe('TelemachusClient', () => {
  it('subscribes, normalizes frames, adds stage keys once they exist, and reconnects after a drop', async () => {
    const fake = fakeTelemachus();
    await new Promise((r) => fake.wss.once('listening', r));
    const frames: TelemetryFrame[] = [];
    const c = new TelemachusClient(`ws://127.0.0.1:${fake.port()}/datalink`, 250, (f) => frames.push(f));
    c.start();
    await until(() => fake.received.length >= 1);
    expect(fake.received[0].rate).toBe(250);
    expect(fake.received[0]['+']).toContain('v.altitude');
    expect(fake.received[0]['+'].some((k: string) => k.startsWith('o.maneuverNodes'))).toBe(false);

    fake.sockets[0].send(JSON.stringify({ 'v.name': 'Test', 'v.altitude': 1234, 'dv.stageCount': 2, 'p.paused': 0 }));
    await until(() => frames.length >= 1 && fake.received.length >= 2);
    expect(frames[0].vessel.alt).toBe(1234);
    expect(fake.received[1]['+']).toEqual(['dv.stageDVVac[0]', 'dv.stageTWRActual[0]', 'dv.stageBurnTime[0]', 'dv.stageFuelMass[0]', 'dv.stageDVVac[1]', 'dv.stageTWRActual[1]', 'dv.stageBurnTime[1]', 'dv.stageFuelMass[1]']);

    // Partial update merges with what we already know.
    fake.sockets[0].send(JSON.stringify({ 'v.altitude': 2000, 'dv.stageDVVac[1]': 900 }));
    await until(() => frames.length >= 2);
    expect(frames[1].vessel.name).toBe('Test');
    expect(frames[1].prop.stages[1].dv).toBe(900);

    // Drop the connection: the client must come back on its own.
    fake.sockets[0].terminate();
    await until(() => fake.sockets.length >= 2, 5000);
    expect(c.status.connected).toBe(true);
    c.stop();
    fake.wss.close();
  }, 10000);
});
