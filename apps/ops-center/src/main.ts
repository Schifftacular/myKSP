import './styles.css';
import { POSITIONS, type Position } from '@myksp/shared';
import { connectBridge, listRecordings, setSource, store } from './store';
import { FlightControlRoom, type ConsoleId } from './room';
import { drawClocks, drawConsole, drawGroundTrack, drawOrbit, drawTrajectory, PAL } from './screens';
import { LEVEL_COLOR, monitorRows, panelHtml } from './positions';
import { programHtml } from './program';
import { Audio } from './audio';
import { fMet, fMoney, fNum } from './format';

const $ = <T extends HTMLElement>(sel: string) => document.querySelector(sel) as T;

const ORDER: ConsoleId[] = ['FLIGHT', 'FDO', 'GNC', 'PROP', 'EECOM', 'INCO', 'CAPCOM', 'PROGRAM'];
const audio = new Audio();

// ------------------------------------------------------------------------------------------------
// Layout

document.body.innerHTML = `
  <header id="opsbar" role="banner">
    <div class="brand"><b>myKSP</b> <span>Mission Operations · FCR-1</span></div>
    <div id="link" class="badge nodata" aria-live="polite">…</div>
    <div class="cell"><span>Vessel</span><b id="vessel">—</b></div>
    <div class="cell"><span>MET</span><b id="met" class="mono">—</b></div>
    <div class="cell"><span>Flight</span><b id="flight" class="lampword nodata">—</b></div>
    <div class="cell hide-s"><span>Funds</span><b id="funds">—</b></div>
    <div class="cell hide-s"><span>Rep</span><b id="rep">—</b></div>
    <div class="spacer"></div>
    <div class="ctl">
      <select id="source" aria-label="Telemetry source">
        <option value="live">Live (KSP)</option>
        <option value="sim">Simulator (demo)</option>
        <option value="replay" disabled>Replay…</option>
      </select>
      <button id="flatbtn" title="Flat mode (F)">Flat</button>
      <button id="soundbtn" title="Sound (M)" aria-pressed="false">Sound off</button>
      <button id="helpbtn" title="Keys (?)">?</button>
    </div>
  </header>
  <main id="stage">
    <div id="room" aria-hidden="true"></div>
    <nav id="consoles" aria-label="Consoles"></nav>
    <aside id="panel" tabindex="-1" aria-live="off"></aside>
    <section id="flat" hidden aria-label="Flat mode"></section>
    <div id="toast" role="status" aria-live="polite"></div>
    <div id="help" hidden>
      <h2>Flight Control Room</h2>
      <p><b>1–8</b> go to a console · <b>Esc</b> overview · <b>Tab</b> next console · <b>F</b> flat mode · <b>M</b> sound · <b>P</b> program board · <b>I</b> performance</p>
      <p>Badges: <b class="tag sim">SIM</b> and <b class="tag sim">REPLAY</b> are never live game data. Amber is caution, red is warning, grey is no data. Values that stop updating are marked STALE.</p>
      <p>The bridge never writes to KSP or its saves, and never sends commands to the vessel.</p>
    </div>
    <div id="perf" hidden></div>
  </main>`;

const nav = $('#consoles');
nav.innerHTML = ORDER.map((id, i) => `<button data-id="${id}" class="cbtn"><kbd>${i + 1}</kbd>${id}<i class="dot nodata"></i></button>`).join('');

// ------------------------------------------------------------------------------------------------
// 3D room (falls back to flat mode if WebGL is unavailable)

let room: FlightControlRoom | null = null;
try {
  room = new FlightControlRoom($('#room'));
} catch (e) {
  console.warn('WebGL unavailable, using flat mode', e);
}

let focus: ConsoleId | null = null;
let flat = !room || localStorageGet('myksp.flat') === '1';

function localStorageGet(k: string) { try { return localStorage.getItem(k); } catch { return null; } }
function localStorageSet(k: string, v: string) { try { localStorage.setItem(k, v); } catch { /* private mode */ } }

function goto(id: ConsoleId | null) {
  focus = id;
  for (const b of nav.querySelectorAll<HTMLButtonElement>('.cbtn')) b.classList.toggle('active', b.dataset.id === id);
  if (room) room.setView(id ? room.seat(id) : room.overview());
  renderPanel();
}

function renderPanel() {
  const panel = $('#panel');
  const id = focus ?? 'FLIGHT';
  panel.innerHTML = id === 'PROGRAM' ? programHtml(store) : panelHtml(id as Position, store);
  panel.classList.toggle('overview', !focus);
}

function setFlat(on: boolean) {
  flat = on || !room;
  localStorageSet('myksp.flat', flat ? '1' : '0');
  $('#flat').hidden = !flat;
  $('#room').style.visibility = flat ? 'hidden' : 'visible';
  $('#panel').hidden = flat;
  nav.hidden = flat;
  $('#flatbtn').textContent = flat ? '3D' : 'Flat';
  if (flat) renderFlat();
}

// ------------------------------------------------------------------------------------------------
// Flat mode: the same canvases and panels, laid out as a dashboard.

const flatCanvases = { ground: document.createElement('canvas'), traj: document.createElement('canvas'), orbit: document.createElement('canvas'), clocks: document.createElement('canvas') };
function renderFlat() {
  if (!flat) return;
  const el = $('#flat');
  if (!el.dataset.built) {
    el.dataset.built = '1';
    el.innerHTML = `<div class="fwall"><div class="fclock"></div><div class="fmain"></div><div class="fside"><div class="ftraj"></div><div class="forbit"></div></div></div><div class="fgrid"></div>`;
    const src = room?.wallCanvas ?? { ground: makeFallback(2048, 1152), traj: makeFallback(1024, 576), orbit: makeFallback(1024, 576), clocks: makeFallback(2560, 176) };
    Object.assign(flatCanvases, src);
    el.querySelector('.fclock')!.append(src.clocks);
    el.querySelector('.fmain')!.append(src.ground);
    el.querySelector('.ftraj')!.append(src.traj);
    el.querySelector('.forbit')!.append(src.orbit);
  }
  el.querySelector('.fgrid')!.innerHTML = ORDER.map((id) => `<article class="fpanel">${id === 'PROGRAM' ? programHtml(store) : panelHtml(id as Position, store)}</article>`).join('');
}
function makeFallback(w: number, h: number) { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; }

// ------------------------------------------------------------------------------------------------
// Data → displays

let lastWarnings = new Set<string>();
let lastWallDraw = 0;
let lastWallSource: string | undefined;

function wallCanvases() { return room?.wallCanvas ?? flatCanvases; }

function updateDisplays() {
  const f = store.frame;
  const link = store.linkState();
  const linkColor = link.cls === 'nominal' ? '#7fd19b' : link.cls === 'sim' ? PAL.sim : link.cls === 'caution' ? PAL.caution : link.cls === 'warning' ? PAL.warning : PAL.dim;
  const wc = wallCanvases();
  // Big wall displays change slowly: redraw and re-upload them at most once a second
  // (a 2048×1152 texture upload at 4 Hz is wasted GPU bandwidth while KSP is running).
  const now = performance.now();
  if (now - lastWallDraw > 1000 || f?.source !== lastWallSource) {
    lastWallDraw = now;
    lastWallSource = f?.source;
    drawGroundTrack(wc.ground, f, store.history);
    drawTrajectory(wc.traj, f, store.history);
    drawOrbit(wc.orbit, f);
    room?.refreshTextures(['ground', 'traj', 'orbit']);
  }
  drawClocks(wc.clocks, f, link.label, linkColor);
  room?.refreshTextures(['clocks']);
  for (const id of ORDER) {
    const level = id === 'PROGRAM' ? (store.career ? 'nominal' : 'nodata') : store.levels?.[id as Position] ?? 'nodata';
    const c = room?.consoles.get(id);
    if (c) {
      drawConsole(c.canvas, id, id === 'PROGRAM' ? programRows() : monitorRows(id as Position, store), LEVEL_COLOR[level]);
      room!.refreshConsole(id);
      room!.setLamp(id, LEVEL_COLOR[level]);
    }
    const dot = nav.querySelector(`[data-id="${id}"] .dot`);
    if (dot) dot.className = `dot ${level}`;
  }
  // Ops bar
  $('#link').textContent = link.label;
  $('#link').className = `badge ${link.cls}`;
  $('#vessel').textContent = f?.vessel.name ?? '—';
  $('#met').textContent = f ? fMet(f.vessel.met) : '—';
  const fl = store.levels?.FLIGHT ?? 'nodata';
  $('#flight').textContent = fl === 'nominal' ? 'GO' : fl.toUpperCase().replace('NODATA', 'NO DATA');
  $('#flight').className = `lampword ${fl}`;
  // Master caution on a new warning.
  const warnings = new Set(store.checks.filter((c) => c.level === 'warning').map((c) => c.id));
  for (const w of warnings) if (!lastWarnings.has(w)) { audio.masterCaution(); break; }
  lastWarnings = warnings;
  renderPanel();
  if (flat) renderFlat();
}

function programRows(): [string, string][] {
  const c = store.career?.summary;
  if (!c) return [['Career', store.careerError ? 'unavailable' : 'loading']];
  return [['Funds', fMoney(c.funds)], ['Science', fNum(c.science, 1)], ['Reputation', fNum(c.reputation)], ['Active contracts', String(c.contracts.active.length)], ['Offered', String(c.contracts.offered.length)], ['Crew', String(c.crew.filter((k) => k.type === 'Crew').length)]];
}

// Throttle redraws to the data rate; the room re-renders only when something changed.
let pending = false;
function schedule() { if (!pending) { pending = true; requestAnimationFrame(() => { pending = false; updateDisplays(); }); } }
store.on((what) => {
  if (what === 'career') {
    $('#funds').textContent = fMoney(store.career?.summary.funds);
    $('#rep').textContent = fNum(store.career?.summary.reputation);
  }
  if (what === 'event') {
    const e = store.events[store.events.length - 1];
    if (e) { toast(`${fMet(e.met)}  ${e.text}`); audio.quindar(); }
  }
  if (what === 'status') syncSourceSelect();
  schedule();
});
// Staleness has to be noticed even when no frames arrive.
setInterval(schedule, 1000);

let toastTimer = 0;
function toast(text: string) {
  const t = $('#toast');
  t.textContent = text;
  t.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = window.setTimeout(() => t.classList.remove('show'), 4500);
}

// ------------------------------------------------------------------------------------------------
// Controls

async function syncSourceSelect() {
  const sel = $<HTMLSelectElement>('#source');
  const s = store.status;
  if (!s) return;
  sel.value = s.mode === 'replay' ? `replay:${s.replayFile}` : s.mode;
}

async function loadReplayOptions() {
  const sel = $<HTMLSelectElement>('#source');
  try {
    const recs = await listRecordings();
    sel.querySelectorAll('option[data-rec]').forEach((o) => o.remove());
    for (const r of recs) {
      const o = document.createElement('option');
      o.value = `replay:${r.file}`;
      o.dataset.rec = '1';
      o.textContent = `Replay: ${r.file.replace(/\.jsonl$/, '')}`;
      sel.append(o);
    }
    syncSourceSelect();
  } catch { /* bridge down; retried on reconnect */ }
}

$<HTMLSelectElement>('#source').addEventListener('change', async (e) => {
  const v = (e.target as HTMLSelectElement).value;
  if (v.startsWith('replay:')) await setSource('replay', v.slice(7), 1);
  else await setSource(v as 'live' | 'sim');
});
$('#flatbtn').addEventListener('click', () => setFlat(!flat));
$('#soundbtn').addEventListener('click', () => {
  const on = audio.toggle();
  $('#soundbtn').textContent = on ? 'Sound on' : 'Sound off';
  $('#soundbtn').setAttribute('aria-pressed', String(on));
});
$('#helpbtn').addEventListener('click', () => { $('#help').hidden = !$('#help').hidden; });
nav.addEventListener('click', (e) => {
  const b = (e.target as HTMLElement).closest<HTMLButtonElement>('.cbtn');
  if (b) goto(focus === b.dataset.id ? null : (b.dataset.id as ConsoleId));
});
if (room) room.onPick = (id) => goto(focus === id ? null : id);

document.addEventListener('keydown', (e) => {
  if ((e.target as HTMLElement).tagName === 'SELECT' || e.metaKey || e.ctrlKey || e.altKey) return;
  const n = Number(e.key);
  if (n >= 1 && n <= ORDER.length) goto(ORDER[n - 1]);
  else if (e.key === 'Escape' || e.key === '0') { goto(null); $('#help').hidden = true; }
  else if (e.key === 'Tab') { e.preventDefault(); const i = focus ? ORDER.indexOf(focus) : -1; goto(ORDER[(i + (e.shiftKey ? ORDER.length - 1 : 1)) % ORDER.length]); }
  else if (e.key === 'f' || e.key === 'F') setFlat(!flat);
  else if (e.key === 'm' || e.key === 'M') $('#soundbtn').click();
  else if (e.key === 'p' || e.key === 'P') goto('PROGRAM');
  else if (e.key === '?') $('#help').hidden = !$('#help').hidden;
  else if (e.key === 'i' || e.key === 'I') $('#perf').hidden = !$('#perf').hidden;
});

// Performance HUD and a hook for automated checks.
setInterval(() => {
  if (!room) return;
  const p = room.perf;
  (window as any).__myksp = { perf: p, flat, focus, link: store.linkState(), events: store.events.length, career: !!store.career };
  if (!$('#perf').hidden) $('#perf').innerHTML = `render ${p.frameMs.toFixed(2)} ms (CPU submit) · ${p.calls} draw calls · ${(p.triangles / 1000).toFixed(1)}k tris · ${p.textures} textures · ${p.frames} frames rendered`;
}, 500);

// Boot
setFlat(flat);
goto(null);
connectBridge();
let wasConnected = false;
store.on((w) => {
  if (w === 'status' && store.bridgeConnected !== wasConnected) { wasConnected = store.bridgeConnected; if (wasConnected) void loadReplayOptions(); }
});
void loadReplayOptions();
updateDisplays();
