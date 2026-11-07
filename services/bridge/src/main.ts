import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { WebSocketServer, WebSocket } from 'ws';
import { AscentSim, EventDetector, analyzeFlight, type FlightEvent, type TelemetryFrame } from '@myksp/shared';
import { TelemachusClient, type TelemachusStatus } from './telemachus.js';
import { Recorder, listRecordings, loadRecording, play } from './recordings.js';
import { CareerService } from './careerService.js';
import { InstallService } from './installService.js';

const here = path.dirname(fileURLToPath(import.meta.url));
/** Repo root: MYKSP_REPO, else the nearest folder above this file whose package.json is "myksp".
 *  Works both from services/bridge/src (dev) and from release/bridge.mjs (bundle). */
function findRepoRoot(): string {
  if (process.env.MYKSP_REPO) return path.resolve(process.env.MYKSP_REPO);
  let dir = here;
  for (let i = 0; i < 6; i++) {
    try {
      if (JSON.parse(fs.readFileSync(path.join(dir, 'package.json'), 'utf8')).name === 'myksp') return dir;
    } catch { /* keep walking */ }
    const up = path.dirname(dir);
    if (up === dir) break;
    dir = up;
  }
  return path.resolve(here, '../../..');
}
const repoRoot = findRepoRoot();

const cfg = {
  port: Number(process.env.MYKSP_PORT ?? 8787),
  // Loopback by default: the bridge serves save data. Set MYKSP_HOST=0.0.0.0 for a LAN tablet.
  host: process.env.MYKSP_HOST ?? '127.0.0.1',
  kspRoot: process.env.KSP_ROOT ?? '/Applications/KSP-RP2000',
  telemachus: process.env.TELEMACHUS_URL ?? 'ws://127.0.0.1:8085/datalink',
  rateMs: Number(process.env.TELEMACHUS_RATE_MS ?? 250),
  recordingsDir: process.env.MYKSP_RECORDINGS ?? path.join(repoRoot, 'data/recordings'),
  staticDir: process.env.MYKSP_STATIC ?? path.join(repoRoot, 'apps/ops-center/dist'),
  startMode: (process.env.MYKSP_MODE ?? 'live') as Mode,
  simSpeed: Number(process.env.MYKSP_SIM_SPEED ?? 1),
};

type Mode = 'live' | 'sim' | 'replay';

const career = new CareerService(path.join(cfg.kspRoot, 'saves'));
const install = new InstallService(cfg.kspRoot, repoRoot);
const historyFile = path.join(path.dirname(cfg.recordingsDir), 'career-history.jsonl');

/** Append a career state to the history log when it changes (KSP saves are the only source). */
const lastLogged = new Map<string, string>();
function logCareer(save: string, s: { ut: number | null; funds: number | null; science: number | null; reputation: number | null }) {
  const key = `${s.ut}|${s.funds}|${s.science}|${s.reputation}`;
  if (s.ut === null || lastLogged.get(save) === key) return;
  lastLogged.set(save, key);
  try { fs.appendFileSync(historyFile, JSON.stringify({ save, ut: s.ut, funds: s.funds, science: s.science, reputation: s.reputation, at: new Date().toISOString() }) + '\n'); } catch { /* data dir not writable: trends fall back to backups */ }
}

/** The save KSP wrote most recently (any mode) is the one being played; its CommNet setting applies to live signal. */
function activeSaveInfo() {
  const s = career.list()[0];
  if (!s) return { activeSave: null, commNet: null };
  try { return { activeSave: s.name, commNet: career.summary(s.name).commNet }; } catch { return { activeSave: s.name, commNet: null }; }
}
const recorder = new Recorder(cfg.recordingsDir);
const recordingDirs = [cfg.recordingsDir, path.join(cfg.kspRoot, '_AgentDocs')];

let mode: Mode = cfg.startMode;
let replayFile: string | null = null;
let stopSource: (() => void) | null = null;
let lastFrame: TelemetryFrame | null = null;
const events: FlightEvent[] = [];
/** Compact per-frame samples for the current source, so a newly opened room can draw the whole track. */
let samples: { met: number; alt: number | null; vel: number | null; lat: number | null; lon: number | null }[] = [];
let sampleKey = '';
const detector = new EventDetector();

const clients = new Set<WebSocket>();
function broadcast(msg: unknown) {
  const s = JSON.stringify(msg);
  for (const c of clients) if (c.readyState === WebSocket.OPEN) c.send(s);
}

function emit(f: TelemetryFrame) {
  lastFrame = f;
  const key = `${f.source}:${f.vessel.name}`;
  if (key !== sampleKey) { samples = []; sampleKey = key; }
  if (f.vessel.met !== null) {
    samples.push({ met: f.vessel.met, alt: f.vessel.alt, vel: f.vessel.vOrb, lat: f.vessel.lat, lon: f.vessel.lon });
    if (samples.length > 7200) samples.splice(0, samples.length - 7200);
  }
  for (const e of detector.push(f)) {
    events.push(e);
    if (events.length > 200) events.shift();
    broadcast({ type: 'event', event: e });
  }
  broadcast({ type: 'frame', frame: f });
}

function status() {
  return {
    type: 'status',
    mode,
    replayFile,
    telemachus: telemachus.status as TelemachusStatus,
    recording: recorder.current,
    kspRoot: cfg.kspRoot,
    savesAvailable: career.available(),
    ...activeSaveInfo(),
  };
}

const telemachus = new TelemachusClient(
  cfg.telemachus,
  cfg.rateMs,
  (f) => {
    recorder.push(f); // Always record live flights, whatever the room is showing.
    if (mode === 'live') emit(f);
  },
  () => broadcast(status()),
);

async function setMode(next: Mode, opts: { file?: string; speed?: number } = {}) {
  stopSource?.();
  stopSource = null;
  detector.reset();
  events.length = 0;
  samples = [];
  sampleKey = '';
  mode = next;
  replayFile = null;
  if (next === 'sim') {
    const sim = new AscentSim();
    const speed = opts.speed ?? 1;
    const dt = cfg.rateMs / 1000;
    const timer = setInterval(() => { sim.step(dt * speed); emit(sim.frame()); }, cfg.rateMs);
    stopSource = () => clearInterval(timer);
  } else if (next === 'replay') {
    const name = path.basename(opts.file ?? '');
    const file = recordingDirs.map((d) => path.join(d, name)).find((p) => fs.existsSync(p));
    if (!file || !name.endsWith('.jsonl')) throw new Error(`recording not found: ${name}`);
    replayFile = name;
    const frames = await loadRecording(file);
    stopSource = play(frames, opts.speed ?? 1, emit, () => broadcast({ type: 'replay-end' }));
  }
  broadcast(status());
}

function json(res: http.ServerResponse, code: number, body: unknown) {
  res.writeHead(code, { 'content-type': 'application/json', 'cache-control': 'no-store' });
  res.end(JSON.stringify(body));
}

const MIME: Record<string, string> = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png', '.woff2': 'font/woff2' };

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url ?? '/', 'http://localhost');
  try {
    if (url.pathname === '/api/status') return json(res, 200, status());
    if (url.pathname === '/api/saves') return json(res, 200, { saves: career.list(), default: career.defaultSave() });
    if (url.pathname === '/api/career') {
      const save = url.searchParams.get('save') ?? career.defaultSave();
      if (!save) return json(res, 404, { error: 'no career save found', savesDir: path.join(cfg.kspRoot, 'saves') });
      const summary = career.summary(save);
      logCareer(save, summary);
      return json(res, 200, { save, summary });
    }
    if (url.pathname === '/api/career/history') {
      const save = url.searchParams.get('save') ?? career.defaultSave();
      if (!save) return json(res, 404, { error: 'no career save found' });
      const s = career.summary(save);
      return json(res, 200, { save, points: install.history(save, s, historyFile) });
    }
    if (url.pathname === '/api/install') return json(res, 200, install.facts());
    if (url.pathname === '/api/craft') return json(res, 200, { craft: install.craft() });
    if (url.pathname === '/api/craft/detail') return json(res, 200, install.craftDetail(url.searchParams.get('file') ?? ''));
    if (url.pathname === '/api/planning') return json(res, 200, install.planning());
    if (url.pathname === '/api/recording') {
      const name = path.basename(url.searchParams.get('file') ?? '');
      const file = recordingDirs.map((d) => path.join(d, name)).find((p) => fs.existsSync(p));
      if (!file || !name.endsWith('.jsonl')) return json(res, 404, { error: `recording not found: ${name}` });
      return json(res, 200, { file: name, analysis: analyzeFlight(await loadRecording(file)) });
    }
    if (url.pathname === '/api/recordings') return json(res, 200, { recordings: listRecordings(recordingDirs) });
    if (url.pathname === '/api/events') return json(res, 200, { events });
    if (url.pathname === '/api/source' && req.method === 'POST') {
      let body = '';
      for await (const chunk of req) body += chunk;
      const b = JSON.parse(body || '{}');
      if (!['live', 'sim', 'replay'].includes(b.mode)) return json(res, 400, { error: 'mode must be live, sim or replay' });
      await setMode(b.mode, { file: b.file, speed: Number(b.speed) || 1 });
      return json(res, 200, status());
    }
    // Static front end (production build), if present.
    if (fs.existsSync(cfg.staticDir)) {
      const rel = url.pathname === '/' ? 'index.html' : decodeURIComponent(url.pathname).replace(/^\/+/, '');
      const file = path.resolve(cfg.staticDir, rel);
      if (file.startsWith(cfg.staticDir) && fs.existsSync(file) && fs.statSync(file).isFile()) {
        res.writeHead(200, { 'content-type': MIME[path.extname(file)] ?? 'application/octet-stream' });
        return fs.createReadStream(file).pipe(res);
      }
    }
    json(res, 404, { error: 'not found' });
  } catch (e) {
    json(res, 500, { error: (e as Error).message });
  }
});

const wss = new WebSocketServer({ server, path: '/ws' });
wss.on('connection', (ws) => {
  clients.add(ws);
  ws.send(JSON.stringify(status()));
  for (const e of events) ws.send(JSON.stringify({ type: 'event', event: e, backfill: true }));
  if (samples.length) {
    const step = Math.max(1, Math.ceil(samples.length / 1500));
    ws.send(JSON.stringify({ type: 'history', key: sampleKey, samples: samples.filter((_, i) => i % step === 0 || i === samples.length - 1) }));
  }
  if (lastFrame) ws.send(JSON.stringify({ type: 'frame', frame: lastFrame }));
  ws.on('close', () => clients.delete(ws));
});

server.listen(cfg.port, cfg.host, () => {
  console.log(`[bridge] http://${cfg.host}:${cfg.port}  telemachus=${cfg.telemachus}  ksp=${cfg.kspRoot}  saves=${career.available() ? 'found' : 'NOT FOUND'}`);
  telemachus.start();
  if (mode !== 'live') setMode(mode, { speed: cfg.simSpeed }).catch((e) => console.error('[bridge]', e.message));
});

function shutdown() {
  stopSource?.();
  telemachus.stop();
  recorder.close();
  server.close(() => process.exit(0));
  setTimeout(() => process.exit(0), 1000).unref();
}
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
