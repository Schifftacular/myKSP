import * as THREE from 'three';
import {
  POLL_ORDER, POLL_TITLES, PROFILES, countValue, fmtCount, holdCount, newCountdown, poll, pollGo, recycleCount, scrubCount, startCount, tickCount,
  type Countdown, type Level, type PollAnswer,
} from '@myksp/shared';
import { RoomKit, v3 } from '../kit';
import { bar, blank, centerNote, kpi, label, PAL, table } from '../canvaskit';
import { esc, fNum, fPct, fUT } from '../format';
import { craftNameFor, vehicleGroup } from '../vehicle';
import type { Ctx, Env } from './types';

/**
 * Launch Control Center, Firing Room (design §4.3). Terminal count with built-in holds and a
 * GO/NO-GO poll answered from live data. Count structure follows Artemis II as flown (research
 * thread, nasa-native-experience.md §2.5): a 30-minute built-in hold at T-10 min, ground launch
 * sequencer from T-10 min, hand-off to the automated sequence at T-33 s, which requires the poll
 * to be GO. Control passes to the Flight Control Room at liftoff. Nothing here commands the
 * vehicle: the player still launches in KSP.
 */

const KEY = 'myksp.lcc';
interface LccState { count: Countdown; profile: string; autoHandoff: boolean; lastPoll: { at: string; answers: PollAnswer[] } | null; holdMins: number }
function load(): LccState {
  try {
    const s = JSON.parse(localStorage.getItem(KEY) ?? 'null');
    if (s?.count) return s;
  } catch { /* fresh state */ }
  return { count: newCountdown(-1200, [-600], -33), profile: 'leo', autoHandoff: true, lastPoll: null, holdMins: 30 };
}
let st = load();
const save = () => { try { localStorage.setItem(KEY, JSON.stringify(st)); } catch { /* private mode */ } };

const MILESTONES: [number, string][] = [
  [-1200, 'Terminal count begins (T-20 min)'],
  [-600, 'Built-in hold, T-10 min (planned 30 min). Launch Director polls the team'],
  [-600, 'Ground launch sequencer starts at release of the hold'],
  [-480, 'Crew access arm retracts'],
  [-33, 'Hand-off to the automated launch sequencer (poll must be GO)'],
  [-6.36, 'Core-stage engine start (SLS-type vehicles)'],
  [0, 'Booster ignition, liftoff. Control passes to Houston (FCR)'],
];

/** Count clock: game UT while KSP reports it (time warp moves the count), else wall time. */
/** The vessel has a situation and it is not on the ground (pre-launch, landed or splashed). */
function inFlight(ctx: Ctx) {
  const sit = ctx.store.frame?.vessel.situation;
  return !!sit && ctx.store.frame?.paused !== 5 && !/pre.?launch|landed|splash/i.test(sit) && st.count.state !== 'counting' && st.count.state !== 'launched';
}
function now(ctx: Ctx) { return ctx.store.frame?.source === 'live' && ctx.store.frame.ut !== null ? ctx.store.frame.ut : performance.now() / 1000; }

function answers(ctx: Ctx) { return poll(ctx.store.frame, PROFILES[st.profile] ?? PROFILES.leo, ctx.store.status?.commNet ?? null); }

let liftoffSeen = false;
let padKey = '';

export const lcc: Env = {
  id: 'lcc',
  code: 'LCC-FR1',
  name: 'Launch Control Center',
  purpose: 'Terminal count, built-in holds and a GO/NO-GO poll answered from live vehicle data',
  consoles: [
    { id: 'LD', title: 'Launch Director' },
    ...POLL_ORDER.map((id) => ({ id, title: POLL_TITLES[id] })),
  ],
  screens: [
    { key: 'clock', w: 2560, h: 220, label: 'Countdown' },
    { key: 'poll', w: 1024, h: 768, label: 'Poll board' },
    { key: 'pad', w: 1024, h: 768, label: 'Vehicle on the pad' },
  ],

  build() {
    const W = 34, D = 24, H = 9, F = -12;
    const k = new RoomKit('#04060a', [400, 2600]);
    k.shell({ w: W, d: D, h: H, front: F, skipFront: true, wall: '#262a2f', floor: '#202328' });
    // Window wall toward the pad: sill, glass band, header with the count clock.
    k.box('wallLow', () => k.std('#15181c', 0.9), W, 1.6, 0.4, 0, 0.8, F);
    k.box('wallLow', () => k.std('#15181c', 0.9), W, 1.0, 0.4, 0, H - 0.5, F);
    k.glass(-W / 2, W / 2, 1.6, H - 1.0, F, 10);
    k.screen('clock', 2560, 220, 15, 1.29, 0, H - 0.5, F + 0.25);
    k.screen('poll', 1024, 768, 5.2, 3.9, -W / 2 + 0.25, 4.6, -6, Math.PI / 2);
    k.screen('pad', 1024, 768, 5.2, 3.9, W / 2 - 0.25, 4.6, -6, -Math.PI / 2);
    const rows = [-6.5, -2.5, 1.5, 5.5];
    k.tiers(W, rows, 0.45, F + D);
    k.coffers([-9, -3, 3, 9], rows, H, '#4d473d');
    const layout: [string, number, number][] = [
      ['RANGE', -6.6, 0], ['VEHICLE', -2.2, 0], ['PROP', 2.2, 0], ['GNC', 6.6, 0],
      ['COMM', -4.4, 1], ['CREW', 0, 1], ['THERMAL', 4.4, 1], ['LD', 0, 2],
    ];
    for (const [id, x, r] of layout) {
      const y = 0.45 * r, z = rows[r];
      k.console(id, x, y, z, { view: { pos: v3(x * 0.85, y + 2.4, z + 3.2), look: v3(x * 0.4, y + 3.2, F - 40) } });
    }
    k.lights(rows, H, F, { warm: '#ffcf9a', spill: '#9fb7cc', spillI: 25, hemi: 0.28 });

    // Outside: night pad 600 m away, lit by xenon lights; the vehicle is the live vessel's craft.
    const ground = new THREE.Mesh(new THREE.PlaneGeometry(4000, 3000), k.std('#0a0d0f', 1));
    ground.rotation.x = -Math.PI / 2; ground.position.set(0, -0.05, F - 1500);
    k.scene.add(ground);
    const padZ = F - 600;
    k.box('pad', () => k.std('#3a3a38', 0.95), 90, 6, 90, 0, 3, padZ);
    k.box('tower', () => k.std('#4a3b32', 0.8, 0.4), 12, 120, 12, -22, 66, padZ);
    for (const [x, z] of [[-40, -40], [40, -40], [0, 50]]) k.box('masts', () => k.std('#5b5b5b', 0.7, 0.5), 2, 180, 2, x, 96, padZ + z);
    const stars = new THREE.BufferGeometry();
    const pts: number[] = [];
    for (let i = 0; i < 1400; i++) {
      const a = Math.random() * Math.PI, e = Math.random() * 0.9 + 0.04;
      pts.push(Math.cos(a) * 2400, Math.sin(e) * 2000 + 60, -Math.sin(a) * 2400 + F);
    }
    stars.setAttribute('position', new THREE.Float32BufferAttribute(pts, 3));
    k.scene.add(new THREE.Points(stars, new THREE.PointsMaterial({ color: '#cfd8e0', size: 2, sizeAttenuation: false })));
    const horizon = new THREE.Mesh(new THREE.PlaneGeometry(5000, 300), new THREE.MeshBasicMaterial({ color: '#0f1a26', transparent: true, opacity: 0.6, fog: false }));
    horizon.position.set(0, 140, F - 2400);
    k.scene.add(horizon);
    for (const x of [-60, 60]) {
      const s = new THREE.SpotLight('#e8f0ff', 9e5, 900, 0.32, 0.4, 1.4);
      s.position.set(x, 30, padZ + 160);
      s.target.position.set(0, 50, padZ);
      k.scene.add(s, s.target);
    }
    const vehicleSlot = new THREE.Group();
    vehicleSlot.position.set(0, 6, padZ);
    vehicleSlot.name = 'vehicle';
    k.scene.add(vehicleSlot);
    padKey = '';
    return k.finish({ pos: v3(0, 5.6, 12.5), look: v3(0, 4.2, F - 50) });
  },

  enter(ctx) { ctx.data.loadCraft(); liftoffSeen = false; },

  tick(ctx) {
    const t = now(ctx);
    const lifted = !!ctx.store.events.find((e) => e.kind === 'liftoff' && Date.now() - e.t < 120_000);
    const before = st.count.state;
    st.count = tickCount(st.count, t, pollGo(answers(ctx)), lifted);
    if (st.count.state !== before) {
      save();
      if (st.count.state === 'hold') { ctx.toast(st.count.holdReason ?? 'Hold'); ctx.audio.quindar(); }
      if (st.count.state === 'launched' && !liftoffSeen) {
        liftoffSeen = true;
        ctx.toast('Liftoff. Control passes to the Flight Control Room.');
        if (st.autoHandoff) setTimeout(() => ctx.go('fcr'), 2500);
      }
    }
    return st.count.state === 'counting' || st.count.state === 'hold';
  },

  draw(cv, ctx) {
    const f = ctx.store.frame;
    const ans = answers(ctx);
    const t = countValue(st.count, now(ctx));
    // Clock strip.
    {
      const g = cv.clock.getContext('2d')!;
      const { width: w, height: h } = cv.clock;
      g.fillStyle = '#020406'; g.fillRect(0, 0, w, h);
      const stCol = st.count.state === 'hold' ? PAL.caution : st.count.state === 'scrubbed' ? PAL.warning : st.count.state === 'launched' ? '#7fd19b' : PAL.text;
      label(g, 'COUNTDOWN', w * 0.01, h * 0.28, h * 0.17, PAL.dim, 'left', 700);
      label(g, `T${fmtCount(t)}`, w * 0.01, h * 0.84, h * 0.52, stCol, 'left', 600, true);
      label(g, 'STATUS', w * 0.33, h * 0.28, h * 0.17, PAL.dim, 'left', 700);
      label(g, st.count.state === 'idle' ? 'STANDBY' : st.count.state.toUpperCase(), w * 0.33, h * 0.7, h * 0.32, stCol, 'left', 800);
      label(g, st.count.holdReason ?? (PROFILES[st.profile]?.label ?? ''), w * 0.33, h * 0.93, h * 0.14, PAL.dim);
      label(g, 'POLL', w * 0.62, h * 0.28, h * 0.17, PAL.dim, 'left', 700);
      const go = pollGo(ans);
      label(g, ans[0]?.level === 'nodata' ? 'NO VEHICLE' : go ? 'GO FOR LAUNCH' : 'NO-GO', w * 0.62, h * 0.7, h * 0.32, ans[0]?.level === 'nodata' ? PAL.dim : go ? '#7fd19b' : PAL.warning, 'left', 800);
      label(g, 'GAME DATE (UTC)', w * 0.83, h * 0.28, h * 0.17, PAL.dim, 'left', 700);
      label(g, fUT(f?.ut ?? null).slice(0, 16), w * 0.83, h * 0.7, h * 0.17, PAL.text, 'left', 600, true);
    }
    // Poll board.
    {
      const { g, w, h } = blank(cv.poll, 'GO / NO-GO POLL', st.lastPoll ? `last poll ${st.lastPoll.at}` : 'live answers');
      const rows = ans.map((a) => [a.station, a.level === 'nodata' ? 'NO DATA' : a.go ? 'GO' : 'NO-GO', a.detail]);
      table(g, w * 0.04, h * 0.16, w * 0.92, h * 0.095, [{ label: 'Station', w: 2 }, { label: 'Answer', w: 1.6 }, { label: 'Basis', w: 6 }], rows,
        ans.map((a) => (a.level === 'nominal' ? '#7fd19b' : a.level === 'caution' ? PAL.caution : a.level === 'warning' ? PAL.warning : PAL.dim)));
      label(g, 'Answers come from live telemetry; nothing is sent to KSP.', w * 0.04, h * 0.95, h * 0.03, PAL.dim);
    }
    // Vehicle board + the 3D vehicle on the pad.
    {
      const airborne = inFlight(ctx);
      const { g, w, h } = blank(cv.pad, airborne ? 'VEHICLE IN FLIGHT' : 'VEHICLE ON THE PAD', f?.vessel.name ?? 'none');
      if (!f || f.paused === 5 || !f.vessel.situation) centerNote(cv.pad, 'No vehicle: KSP is not in a flight scene');
      else if (airborne) {
        centerNote(cv.pad, `Already ${f.vessel.situation.toLowerCase()}`);
        label(g, 'Follow this vehicle in the Flight Control Room.', w * 0.05, h * 0.62, h * 0.04, PAL.dim);
        label(g, 'A count needs a vehicle on the pad.', w * 0.05, h * 0.68, h * 0.04, PAL.dim);
      }
      else {
        const prof = PROFILES[st.profile] ?? PROFILES.leo;
        kpi(g, w * 0.05, h * 0.18, h * 0.07, 'Situation', f.vessel.situation ?? '—');
        kpi(g, w * 0.55, h * 0.18, h * 0.07, 'Mass', f.vessel.mass === null ? '—' : `${fNum(f.vessel.mass / 1000, 1)} t`);
        kpi(g, w * 0.05, h * 0.36, h * 0.07, 'Δv (vac)', `${fNum(f.prop.totalDv, 0)} m/s`);
        kpi(g, w * 0.55, h * 0.36, h * 0.07, 'Required', `${fNum(prof.requiredDv)} m/s`);
        bar(g, w * 0.05, h * 0.5, w * 0.9, h * 0.04, f.prop.totalDv === null ? null : f.prop.totalDv / prof.requiredDv, (f.prop.totalDv ?? 0) >= prof.requiredDv ? '#7fd19b' : PAL.caution);
        const s = f.prop.stages;
        kpi(g, w * 0.05, h * 0.64, h * 0.07, 'Liftoff TWR', s.length ? fNum(s[s.length - 1].twr, 2) : '—');
        kpi(g, w * 0.55, h * 0.64, h * 0.07, 'Stages', fNum(f.prop.stageCount));
        const ec = f.power.ec !== null && f.power.ecMax ? f.power.ec / f.power.ecMax : null;
        kpi(g, w * 0.05, h * 0.82, h * 0.07, 'Electric charge', fPct(ec));
        kpi(g, w * 0.55, h * 0.82, h * 0.07, 'Crew', fNum(f.vessel.crew));
      }
    }
    return ['clock', 'poll', 'pad'];
  },

  monitor(id, ctx) {
    const ans = answers(ctx);
    if (id === 'LD') {
      const go = pollGo(ans);
      return { rows: [['Count', `T${fmtCount(countValue(st.count, now(ctx)))}`], ['State', st.count.state.toUpperCase()], ['Poll', go ? 'GO' : 'NO-GO'], ['Profile', PROFILES[st.profile]?.label ?? '']], level: ans[0]?.level === 'nodata' ? 'nodata' : go ? 'nominal' : 'caution' };
    }
    const a = ans.find((x) => x.station === id);
    return { rows: [['Answer', a ? (a.level === 'nodata' ? 'NO DATA' : a.go ? 'GO' : 'NO-GO') : '—'], ['Basis', a?.detail ?? '—']], level: (a?.level ?? 'nodata') as Level };
  },

  panel(id, ctx) {
    const ans = answers(ctx);
    if (id && id !== 'LD') {
      const a = ans.find((x) => x.station === id);
      return `<header><div><div class="pos">${id}</div><div class="ptitle">${POLL_TITLES[id as keyof typeof POLL_TITLES] ?? ''}</div></div><div class="lamp ${a?.level ?? 'nodata'}">${a ? (a.level === 'nodata' ? 'NO DATA' : a.go ? 'GO' : 'NO-GO') : '—'}</div></header>
        <p>${esc(a?.detail ?? 'No data')}</p>
        <p class="muted">This station answers the Launch Director's poll from live telemetry against the selected mission profile.</p>`;
    }
    const t = countValue(st.count, now(ctx));
    const go = pollGo(ans);
    const profiles = Object.entries(PROFILES).map(([k, p]) => `<option value="${k}" ${k === st.profile ? 'selected' : ''}>${esc(p.label)} (${p.requiredDv} m/s${p.crewed ? ', crewed' : ''})</option>`).join('');
    const ms = MILESTONES.map(([at, text]) => `<div class="row ${t >= at ? '' : 'muted'}"><span class="k mono">T${fmtCount(at)}</span><span class="v small">${t >= at && st.count.state !== 'idle' ? '✓ ' : ''}${esc(text)}</span></div>`).join('');
    const pollRows = (st.lastPoll?.answers ?? ans).map((a) => `<div class="poll ${a.level}"><span>${a.station}</span><b>${a.level === 'nodata' ? 'NO DATA' : a.go ? 'GO' : 'NO-GO'}</b></div>`).join('');
    return `<header><div><div class="pos">LD</div><div class="ptitle">Launch Director</div></div><div class="lamp ${ans[0]?.level === 'nodata' ? 'nodata' : go ? 'nominal' : 'warning'}">${ans[0]?.level === 'nodata' ? 'NO VEHICLE' : go ? 'GO' : 'NO-GO'}</div></header>
      <div class="kpis"><div><span>Count</span><b>T${fmtCount(t)}</b></div><div><span>State</span><b class="small">${st.count.state.toUpperCase()}</b></div></div>
      ${inFlight(ctx) ? `<div class="alert caution">${esc(ctx.store.frame?.vessel.name ?? 'The vessel')} is already in flight (${esc(ctx.store.frame?.vessel.situation ?? '')}). A count needs a vehicle on the pad.</div>` : ''}
      ${st.count.holdReason ? `<div class="alert caution">${esc(st.count.holdReason)}</div>` : ''}
      <h3>Mission profile</h3>
      <select data-act="profile" class="wide">${profiles}</select>
      <h3>Count control</h3>
      <div class="btns">
        <button data-act="start" ${inFlight(ctx) && st.count.state === 'idle' ? 'disabled' : ''}>${st.count.state === 'hold' ? 'Resume count' : 'Start count'}</button>
        <button data-act="hold">Hold</button>
        <button data-act="poll">Poll the team</button>
        <button data-act="recycle">Recycle to T-10:00</button>
        <button data-act="scrub">Scrub</button>
        <button data-act="reset">Reset to T-20:00</button>
      </div>
      <label class="chk"><input type="checkbox" data-act="handoff" ${st.autoHandoff ? 'checked' : ''}> Hand over to the Flight Control Room at liftoff</label>
      <h3>${st.lastPoll ? `Poll at ${esc(st.lastPoll.at)}` : 'Live answers'}</h3><div class="pollgrid">${pollRows}</div>
      <h3>Terminal count (Artemis II as flown)</h3>${ms}
      <p class="muted foot">The count runs on game time while KSP is live, so time warp advances it. At T-33 s the count holds automatically unless every station is GO. Launch the vehicle yourself in KSP: myKSP never sends commands to the game.</p>`;
  },

  action(el, ctx, ev) {
    const act = el.dataset.act;
    if (!act) return false;
    const t = now(ctx);
    if (act === 'profile' && ev.type === 'change') st.profile = (el as HTMLSelectElement).value;
    else if (act === 'handoff' && ev.type === 'change') st.autoHandoff = (el as HTMLInputElement).checked;
    else if (ev.type !== 'click') return false;
    else if (act === 'start') st.count = startCount(st.count, t);
    else if (act === 'hold') st.count = holdCount(st.count, t, 'Hold called by the Launch Director');
    else if (act === 'recycle') st.count = recycleCount(st.count, -600);
    else if (act === 'scrub') st.count = scrubCount(st.count, 'Launch scrubbed by the Launch Director');
    else if (act === 'reset') { st.count = newCountdown(-1200, [-600], -33); liftoffSeen = false; }
    else if (act === 'poll') {
      const ans = answers(ctx);
      st.lastPoll = { at: fUT(ctx.store.frame?.ut ?? null).slice(11, 19) || new Date().toISOString().slice(11, 19), answers: ans };
      ans.forEach((a, i) => setTimeout(() => { ctx.toast(`${a.station}: ${a.level === 'nodata' ? 'no data' : a.go ? 'GO' : 'NO-GO'}`); ctx.audio.quindar(); }, i * 900));
      setTimeout(() => ctx.toast(pollGo(ans) ? 'Launch Director: we are GO for launch.' : 'Launch Director: we are NO-GO. Holding.'), ans.length * 900 + 300);
    }
    save();
    ctx.refresh();
    return true;
  },
};

/** Put the live vessel's craft on the pad. */
lcc.sceneUpdate = (room, ctx) => {
  const slot = room.scene.getObjectByName('vehicle');
  if (!slot) return false;
  const name = craftNameFor(ctx.store.frame?.vessel.name ?? null);
  const onPad = /pre.?launch|landed/i.test(ctx.store.frame?.vessel.situation ?? '');
  const craft = name && onPad ? ctx.data.craft?.find((c) => c.name === name) : undefined;
  const key = craft ? craft.file : 'none';
  if (key === padKey) return false;
  if (craft) {
    const det = ctx.data.craftDetail.get(craft.file);
    if (!det) { ctx.data.loadCraftDetail(craft.file); return false; }
    slot.clear();
    slot.add(vehicleGroup(det, craft.size));
  } else slot.clear();
  padKey = key;
  return true;
};
