import './styles.css';
import { connectBridge, listRecordings, setSource, store } from './store';
import { Stage3D, type BuiltRoom } from './engine';
import { drawConsole, makeCanvas } from './screens';
import { LEVEL_COLOR } from './positions';
import { Audio } from './audio';
import { esc, fMet, fMoney, fNum } from './format';
import { data } from './data';
import { ENVS, ENV_ORDER } from './envs';
import type { Ctx, Env } from './envs/types';

const $ = <T extends HTMLElement>(sel: string) => document.querySelector(sel) as T;
const audio = new Audio();

// ------------------------------------------------------------------------------------------------
// Layout

document.body.innerHTML = `
  <header id="opsbar" role="banner">
    <div class="brand"><b>myKSP</b> <span id="roomcode">Mission Operations</span></div>
    <select id="roomsel" aria-label="Room" title="Room ([ and ])"></select>
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
    <div id="help" hidden></div>
    <div id="perf" hidden></div>
  </main>`;

const nav = $('#consoles');
const roomSel = $<HTMLSelectElement>('#roomsel');
roomSel.innerHTML = ENV_ORDER.map((id) => `<option value="${id}">${esc(ENVS[id].code)} · ${esc(ENVS[id].name)}</option>`).join('');
$('#help').innerHTML = `
  <h2>Keys</h2>
  <p><b>[</b> / <b>]</b> previous / next room · <b>1–9</b> go to a console · <b>Esc</b> room overview · <b>Tab</b> next console · <b>F</b> flat mode · <b>M</b> sound · <b>P</b> Program Office · <b>L</b> Launch Control · <b>I</b> performance</p>
  <h2>Rooms</h2>
  ${ENV_ORDER.map((id) => `<p><b>${esc(ENVS[id].code)}</b> ${esc(ENVS[id].name)}: ${esc(ENVS[id].purpose)}</p>`).join('')}
  <p>Badges: <b class="tag sim">SIM</b> and <b class="tag sim">REPLAY</b> are never live game data. Amber is caution, red is warning, grey is no data.</p>
  <p>The bridge never writes to KSP or its saves, and never sends commands to the vessel.</p>`;

// ------------------------------------------------------------------------------------------------
// State

let stage: Stage3D | null = null;
try { stage = new Stage3D($('#room')); } catch (e) { console.warn('WebGL unavailable, using flat mode', e); }

const ls = { get(k: string) { try { return localStorage.getItem(k); } catch { return null; } }, set(k: string, v: string) { try { localStorage.setItem(k, v); } catch { /* private mode */ } } };

let env: Env = ENVS.fcr;
let room: BuiltRoom | null = null;
let canvases: Record<string, HTMLCanvasElement> = {};
let focus: string | null = null;
let flat = !stage || ls.get('myksp.flat') === '1';

const ctx: Ctx = {
  store, data, audio,
  toast: (t) => toast(t),
  refresh: () => { forcePanel = true; schedule(); },
  go: (id, c = null) => enterEnv(id, c),
  get focus() { return focus; },
};

function enterEnv(id: string, consoleId: string | null = null) {
  const next = ENVS[id] ?? ENVS.fcr;
  env = next;
  ls.set('myksp.env', env.id);
  if (location.hash !== `#${env.id}`) history.replaceState(null, '', `#${env.id}`);
  roomSel.value = env.id;
  $("#roomcode").textContent = env.code;
  document.title = `myKSP · ${env.name}`;
  if (stage) {
    room = env.build();
    stage.load(room);
    canvases = Object.fromEntries(Object.entries(room.screens).map(([k, v]) => [k, v.canvas]));
  } else {
    room = null;
    canvases = Object.fromEntries(env.screens.map((s) => [s.key, makeCanvas(s.w, s.h)]));
  }
  nav.innerHTML = env.consoles.map((c, i) => `<button data-id="${c.id}" class="cbtn" title="${esc(c.title)}"><kbd>${i + 1}</kbd>${c.id}<i class="dot nodata"></i></button>`).join('');
  $('#flat').dataset.built = '';
  env.enter?.(ctx);
  focus = null;
  goto(consoleId);
  if (flat) renderFlat();
  updateDisplays(true);
}

function goto(id: string | null) {
  focus = id && room?.consoles.has(id) ? id : id && !room ? id : null;
  for (const b of nav.querySelectorAll<HTMLButtonElement>('.cbtn')) b.classList.toggle('active', b.dataset.id === focus);
  if (stage && room) stage.setView(focus ? room.consoles.get(focus)!.view : room.overview);
  forcePanel = true;
  renderPanel();
}

let forcePanel = true;
function renderPanel() {
  const panel = $('#panel');
  // Do not rebuild the panel under the user's hands (an open select, a focused input).
  const active = document.activeElement as HTMLElement | null;
  if (!forcePanel && active && panel.contains(active) && /SELECT|INPUT|TEXTAREA/.test(active.tagName)) return;
  forcePanel = false;
  const scroll = panel.scrollTop;
  panel.innerHTML = env.panel(focus, ctx);
  panel.scrollTop = scroll;
  panel.classList.toggle('overview', !focus);
}

function setFlat(on: boolean) {
  flat = on || !stage;
  ls.set('myksp.flat', flat ? '1' : '0');
  $('#flat').hidden = !flat;
  $('#room').style.visibility = flat ? 'hidden' : 'visible';
  $('#panel').hidden = flat;
  nav.hidden = flat;
  $('#flatbtn').textContent = flat ? '3D' : 'Flat';
  if (flat) renderFlat();
}

/** Flat mode: the same canvases and panels as the room, laid out as a dashboard. */
function renderFlat() {
  if (!flat) return;
  const el = $('#flat');
  if (!el.dataset.built) {
    el.dataset.built = '1';
    el.innerHTML = `<div class="fscreens"></div><div class="fgrid"></div>`;
    const box = el.querySelector('.fscreens')!;
    for (const s of env.screens) {
      const fig = document.createElement('figure');
      fig.className = s.w / s.h > 6 ? 'fstrip' : s.w >= 2000 ? 'fbig' : 'fsmall';
      fig.append(canvases[s.key]);
      box.append(fig);
    }
  }
  const active = document.activeElement as HTMLElement | null;
  if (active && el.contains(active) && /SELECT|INPUT/.test(active.tagName)) return;
  el.querySelector('.fgrid')!.innerHTML = env.consoles.map((c) => `<article class="fpanel">${env.panel(c.id, ctx)}</article>`).join('');
}

// ------------------------------------------------------------------------------------------------
// Data → displays

let lastWarnings = new Set<string>();

function updateDisplays(full = false) {
  const now = performance.now();
  const changed = env.draw(canvases, ctx, now);
  if (stage && room) {
    for (const k of changed) stage.refresh(room.screens[k]?.texture);
    if (env.sceneUpdate?.(room, ctx)) stage.markDirty();
  }
  for (const c of env.consoles) {
    const m = env.monitor(c.id, ctx);
    const slot = room?.consoles.get(c.id);
    if (slot && stage) {
      drawConsole(slot.canvas, c.id, m.rows, LEVEL_COLOR[m.level]);
      stage.refresh(slot.texture);
      stage.setLamp(c.id, LEVEL_COLOR[m.level]);
    }
    const dot = nav.querySelector(`[data-id="${c.id}"] .dot`);
    if (dot) dot.className = `dot ${m.level}`;
  }
  // Ops bar
  const f = store.frame;
  const link = store.linkState();
  $('#link').textContent = link.label;
  $('#link').className = `badge ${link.cls}`;
  $('#vessel').textContent = f?.vessel.name ?? '—';
  $('#met').textContent = f ? fMet(f.vessel.met) : '—';
  const fl = store.levels?.FLIGHT ?? 'nodata';
  $('#flight').textContent = fl === 'nominal' ? 'GO' : fl.toUpperCase().replace('NODATA', 'NO DATA');
  $('#flight').className = `lampword ${fl}`;
  const warnings = new Set(store.checks.filter((c) => c.level === 'warning').map((c) => c.id));
  for (const w of warnings) if (!lastWarnings.has(w)) { audio.masterCaution(); break; }
  lastWarnings = warnings;
  if (full) forcePanel = true;
  renderPanel();
  if (flat) renderFlat();
}

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
data.on(() => { forcePanel = true; schedule(); });
// Clocks, countdowns and staleness tick even when no frames arrive.
setInterval(() => { env.tick?.(ctx); schedule(); }, 1000);

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

function syncSourceSelect() {
  const sel = $<HTMLSelectElement>('#source');
  const s = store.status;
  if (!s) return;
  sel.value = s.mode === 'replay' ? `replay:${s.replayFile}` : s.mode;
}

async function loadReplayOptions() {
  const sel = $<HTMLSelectElement>('#source');
  try {
    const recs = await listRecordings();
    store.recordings = recs;
    sel.querySelectorAll('option[data-rec]').forEach((o) => o.remove());
    for (const r of recs) {
      const o = document.createElement('option');
      o.value = `replay:${r.file}`;
      o.dataset.rec = '1';
      o.textContent = `Replay: ${r.file.replace(/\.jsonl$/, '')}`;
      sel.append(o);
    }
    syncSourceSelect();
    forcePanel = true;
    schedule();
  } catch { /* bridge down; retried on reconnect */ }
}

$<HTMLSelectElement>('#source').addEventListener('change', async (e) => {
  const sel = e.target as HTMLSelectElement;
  const v = sel.value;
  sel.blur(); // hand focus back so the console keys work straight away
  if (v.startsWith('replay:')) await setSource('replay', v.slice(7), 1);
  else await setSource(v as 'live' | 'sim');
});
roomSel.addEventListener('change', () => { const v = roomSel.value; roomSel.blur(); enterEnv(v); });
$('#flatbtn').addEventListener('click', () => setFlat(!flat));
$('#soundbtn').addEventListener('click', () => {
  const on = audio.toggle();
  $('#soundbtn').textContent = on ? 'Sound on' : 'Sound off';
  $('#soundbtn').setAttribute('aria-pressed', String(on));
});
$('#helpbtn').addEventListener('click', () => { $('#help').hidden = !$('#help').hidden; });
nav.addEventListener('click', (e) => {
  const b = (e.target as HTMLElement).closest<HTMLButtonElement>('.cbtn');
  if (b) goto(focus === b.dataset.id ? null : b.dataset.id!);
});
if (stage) stage.onPick = (id) => goto(focus === id ? null : id);

// Panel controls (count buttons, recording scrubber, pickers) are handled by the room.
for (const type of ['click', 'change', 'input'] as const) {
  for (const host of [$('#panel'), $('#flat')]) {
    host.addEventListener(type, (ev) => {
      const el = (ev.target as HTMLElement).closest<HTMLElement>('[data-act]');
      if (el && env.action?.(el, ctx, ev)) { forcePanel = type === 'click'; schedule(); }
    });
  }
}

document.addEventListener('keydown', (e) => {
  const tag = (e.target as HTMLElement).tagName;
  if (tag === 'SELECT' || tag === 'INPUT' || tag === 'TEXTAREA' || e.metaKey || e.ctrlKey || e.altKey) return;
  const n = Number(e.key);
  const ids = env.consoles.map((c) => c.id);
  if (n >= 1 && n <= ids.length) goto(ids[n - 1]);
  else if (e.key === 'Escape' || e.key === '0') { goto(null); $('#help').hidden = true; }
  else if (e.key === 'Tab') { e.preventDefault(); const i = focus ? ids.indexOf(focus) : -1; goto(ids[(i + (e.shiftKey ? ids.length - 1 : 1)) % ids.length]); }
  else if (e.key === '[' || e.key === ']') { const i = ENV_ORDER.indexOf(env.id); enterEnv(ENV_ORDER[(i + (e.key === ']' ? 1 : ENV_ORDER.length - 1)) % ENV_ORDER.length]); }
  else if (e.key === 'f' || e.key === 'F') setFlat(!flat);
  else if (e.key === 'm' || e.key === 'M') $('#soundbtn').click();
  else if (e.key === 'p' || e.key === 'P') enterEnv('program');
  else if (e.key === 'l' || e.key === 'L') enterEnv('lcc');
  else if (e.key === '?') $('#help').hidden = !$('#help').hidden;
  else if (e.key === 'i' || e.key === 'I') $('#perf').hidden = !$('#perf').hidden;
});
window.addEventListener('hashchange', () => { const id = location.hash.slice(1); if (ENVS[id] && id !== env.id) enterEnv(id); });

// Performance HUD and a hook for automated checks.
setInterval(() => {
  const p = stage?.perf;
  (window as any).__myksp = { env: env.id, perf: p, flat, focus, link: store.linkState(), events: store.events.length, career: !!store.career, data: { install: !!data.install, craft: data.craft?.length ?? null, planning: !!data.planning?.manifest, errors: data.errors } };
  if (p && !$('#perf').hidden) $('#perf').innerHTML = `${env.code} · render ${p.frameMs.toFixed(2)} ms (CPU submit) · ${p.calls} draw calls · ${(p.triangles / 1000).toFixed(1)}k tris · ${p.textures} textures · ${p.frames} frames rendered`;
}, 500);

// Boot
data.loadInstall();
setFlat(flat);
const startId = location.hash.slice(1) || ls.get('myksp.env') || 'fcr';
enterEnv(ENVS[startId] ? startId : 'fcr');
connectBridge();
let wasConnected = false;
store.on((w) => {
  if (w === 'status' && store.bridgeConnected !== wasConnected) {
    wasConnected = store.bridgeConnected;
    if (wasConnected) { void loadReplayOptions(); data.loadInstall(true); env.enter?.(ctx); }
  }
});
void loadReplayOptions();
