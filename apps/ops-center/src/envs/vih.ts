import * as THREE from 'three';
import { RESOURCE_LABELS } from '@myksp/shared';
import { RoomKit, v3 } from '../kit';
import { blank, centerNote, kpi, label, PAL, table } from '../canvaskit';
import { esc, fMoney, fNum } from '../format';
import type { CraftEntry } from '../data';
import { craftNameFor, vehicleGroup } from '../vehicle';
import type { Ctx, Env } from './types';

/**
 * Vehicle Integration Hall (design §4.6): a VAB-scale high bay (140 m) with the selected design
 * stacked on a mobile launcher at true scale, built from the craft file's part layout. The wall
 * displays list every design in the install with KSP's own editor mass and cost, and the selected
 * vehicle's propellant and consumables load.
 */
const KEY = 'myksp.vih';
let sel: string | null = null;
try { sel = localStorage.getItem(KEY); } catch { /* private mode */ }
let stackKey = '';
let drawnKey = '';

function selected(ctx: Ctx): CraftEntry | null {
  const all = ctx.data.craft ?? [];
  if (!all.length) return null;
  const found = sel ? all.find((c) => c.file === sel) : undefined;
  if (found) return found;
  const live = craftNameFor(ctx.store.frame?.vessel.name ?? null);
  return all.find((c) => c.name === live) ?? all.find((c) => c.facility === 'VAB') ?? all[0];
}

export const vih: Env = {
  id: 'vih',
  code: 'VIH',
  name: 'Vehicle Integration Hall',
  purpose: 'Every vehicle design in the install, stacked at true scale with its mass, cost and load',
  consoles: [
    { id: 'VI', title: 'Vehicle integration lead' },
    { id: 'STACK', title: 'Stack and stages' },
    { id: 'LOAD', title: 'Propellant and consumables' },
    { id: 'INVENTORY', title: 'Design inventory' },
  ],
  screens: [
    { key: 'inventory', w: 1024, h: 1024, label: 'Design inventory' },
    { key: 'detail', w: 1024, h: 1024, label: 'Selected vehicle' },
  ],

  build() {
    const W = 64, D = 130, H = 140, F = -40;
    const k = new RoomKit('#0a0c0f', [160, 420]);
    k.shell({ w: W, d: D, h: H, front: F, wall: '#3b3e42', floor: '#2e2f31', ceil: '#1a1b1d', frontColor: '#33363a' });
    // Structural columns and work-platform levels around the bay.
    for (let z = F + 10; z < F + D; z += 18) for (const s of [-1, 1]) k.box('column', () => k.std('#4a4d52', 0.7, 0.4), 2, H, 2, s * (W / 2 - 1), H / 2, z);
    for (const y of [20, 36, 52, 68, 84, 100]) {
      // Work platforms retracted against the bay walls, as for a stack being rolled out.
      for (const s of [-1, 1]) k.box('platform', () => k.std('#6b5e45', 0.8, 0.3), 9, 1.2, 22, s * 27, y, 0);
      for (const s of [-1, 1]) k.box('rail', () => k.std('#c79a3a', 0.6, 0.5), 0.15, 1.1, 22, s * 22.6, y + 1.15, 0);
    }
    // Mobile launcher base the vehicle sits on.
    k.box('ml', () => k.std('#4b4f54', 0.75, 0.45), 40, 8, 34, 0, 4, 0);
    k.box('ml', () => k.std('#4b4f54', 0.75, 0.45), 8, 120, 8, -22, 68, -10);
    k.box('floorStripe', () => k.std('#b48a2c', 0.9), W, 0.05, 0.6, 0, 0.03, 24);
    // Displays at the floor-level gallery, consoles in front of them.
    k.screen('inventory', 1024, 1024, 11, 11, -W / 2 + 0.2, 9, 40, Math.PI / 2);
    k.screen('detail', 1024, 1024, 11, 11, W / 2 - 0.2, 9, 40, -Math.PI / 2);
    const consoles: [string, number, number, number][] = [['INVENTORY', -22, 40, Math.PI / 2], ['VI', -5, 52, 0], ['STACK', 5, 52, 0], ['LOAD', 22, 40, -Math.PI / 2]];
    for (const [id, x, z, r] of consoles) {
      k.console(id, x, 0, z, { rotY: r, width: 3.4, view: r === 0 ? { pos: v3(x * 0.6, 3, z + 5), look: v3(0, 30, 0) } : { pos: v3(x * 0.6 + Math.sign(-x) * 2, 3.2, z + 3), look: v3(Math.sign(x) * W / 2, 8, 40) } });
    }
    k.scene.add(new THREE.HemisphereLight('#c9d6e2', '#2a2620', 0.45));
    for (const y of [130, 70]) for (const x of [-20, 20]) {
      const s = new THREE.SpotLight('#ffe9c8', 1400, 400, 0.5, 0.6, 1.2);
      s.position.set(x, y, 40);
      s.target.position.set(0, y * 0.5, 0);
      k.scene.add(s, s.target);
    }
    const slot = new THREE.Group();
    slot.position.set(0, 8, 0);
    slot.name = 'vehicle';
    k.scene.add(slot);
    stackKey = '';
    drawnKey = '';
    return k.finish({ pos: v3(0, 34, 88), look: v3(0, 48, 0) });
  },

  enter(ctx) { ctx.data.loadCraft(); drawnKey = ''; },

  draw(cv, ctx) {
    const all = ctx.data.craft;
    const c = selected(ctx);
    const det = c ? ctx.data.craftDetail.get(c.file) : undefined;
    if (c && !det) ctx.data.loadCraftDetail(c.file);
    const key = `${all?.length}|${c?.file}|${!!det}`;
    if (key === drawnKey) return [];
    drawnKey = key;
    {
      const { g, w, h } = blank(cv.inventory, 'DESIGN INVENTORY', all ? `${all.length} designs` : '');
      if (!all) centerNote(cv.inventory, ctx.data.errors.craft ? `Craft unavailable: ${ctx.data.errors.craft}` : 'Loading craft…');
      else if (!all.length) centerNote(cv.inventory, 'No craft files in this install');
      else {
        const rows = all.slice(0, 18).map((x) => [x.name, x.facility ?? '—', x.totalMass === null ? '—' : fNum(x.totalMass, 1), fMoney(x.totalCost), x.partCount === null ? '—' : String(x.partCount), x.size ? fNum(x.size[1], 1) : '—']);
        table(g, w * 0.04, h * 0.12, w * 0.92, h * 0.045, [{ label: 'Design', w: 4 }, { label: 'Bldg', w: 0.9 }, { label: 'Mass t', w: 1.3, align: 'right' }, { label: 'Cost', w: 1.5, align: 'right' }, { label: 'Parts', w: 1, align: 'right' }, { label: 'Height m', w: 1.4, align: 'right' }], rows, all.map((x) => (x.file === c?.file ? PAL.predicted : undefined)));
        label(g, 'Mass and cost are KSP\'s editor figures (.loadmeta).', w * 0.04, h * 0.97, h * 0.024, PAL.dim);
      }
    }
    {
      const { g, w, h } = blank(cv.detail, c ? c.name.toUpperCase() : 'SELECTED VEHICLE', c?.save ? `save ${c.save}` : c?.facility ?? '');
      if (!c) centerNote(cv.detail, 'No design selected');
      else {
        kpi(g, w * 0.05, h * 0.13, h * 0.055, 'Mass', c.totalMass === null ? '—' : `${fNum(c.totalMass, 1)} t`);
        kpi(g, w * 0.52, h * 0.13, h * 0.055, 'Cost', fMoney(c.totalCost));
        kpi(g, w * 0.05, h * 0.25, h * 0.055, 'Height × width', c.size ? `${fNum(c.size[1], 1)} × ${fNum(Math.max(c.size[0], c.size[2]), 1)} m` : '—');
        kpi(g, w * 0.52, h * 0.25, h * 0.055, 'Parts · stages', `${c.partCount ?? '—'} · ${det?.stages ?? c.stageCount ?? '—'}`);
        if (!det) label(g, ctx.data.errors[`craft:${c.file}`] ?? 'Reading the craft file…', w * 0.05, h * 0.42, h * 0.03, PAL.dim);
        else {
          const res = Object.entries(det.resources).filter(([, r]) => r.max > 0).sort((a, b) => b[1].max - a[1].max).slice(0, 13);
          table(g, w * 0.05, h * 0.4, w * 0.9, h * 0.042, [{ label: 'Resource', w: 3 }, { label: 'Loaded', w: 2, align: 'right' }, { label: 'Capacity', w: 2, align: 'right' }, { label: 'Fill', w: 1, align: 'right' }],
            res.map(([n, r]) => [RESOURCE_LABELS[n] ?? n, fNum(r.amount, 0), fNum(r.max, 0), `${Math.round((r.amount / r.max) * 100)}%`]));
          if (!res.length) label(g, 'No resources in this design', w * 0.05, h * 0.45, h * 0.03, PAL.dim);
        }
        if (c.description) label(g, c.description.slice(0, 80), w * 0.05, h * 0.97, h * 0.024, PAL.dim);
      }
    }
    return ['inventory', 'detail'];
  },

  sceneUpdate(room, ctx) {
    const slot = room.scene.getObjectByName('vehicle');
    const c = selected(ctx);
    if (!slot) return false;
    const key = c?.file ?? 'none';
    if (key === stackKey) return false;
    if (c) {
      const det = ctx.data.craftDetail.get(c.file);
      if (!det) { ctx.data.loadCraftDetail(c.file); return false; }
      slot.clear();
      slot.add(vehicleGroup(det, c.size));
    } else slot.clear();
    stackKey = key;
    return true;
  },

  monitor(id, ctx) {
    const c = selected(ctx);
    if (!c) return { rows: [['Designs', ctx.data.craft ? 'none' : 'loading']], level: 'nodata' };
    const det = ctx.data.craftDetail.get(c.file);
    if (id === 'INVENTORY') return { rows: [['Designs', String(ctx.data.craft?.length ?? 0)], ['VAB', String(ctx.data.craft?.filter((x) => x.facility === 'VAB').length ?? 0)], ['SPH', String(ctx.data.craft?.filter((x) => x.facility === 'SPH').length ?? 0)]], level: 'nominal' };
    if (id === 'LOAD') {
      const res = det ? Object.entries(det.resources).filter(([, r]) => r.max > 0).sort((a, b) => b[1].max - a[1].max).slice(0, 5) : [];
      return { rows: res.length ? res.map(([n, r]) => [RESOURCE_LABELS[n] ?? n, `${Math.round((r.amount / r.max) * 100)}%`]) : [['Load', det ? 'none' : 'reading']], level: det ? 'nominal' : 'nodata' };
    }
    if (id === 'STACK') return { rows: [['Height', c.size ? `${fNum(c.size[1], 1)} m` : '—'], ['Parts', String(c.partCount ?? '—')], ['Stages', String(det?.stages ?? c.stageCount ?? '—')]], level: 'nominal' };
    return { rows: [['Design', c.name], ['Mass', c.totalMass === null ? '—' : `${fNum(c.totalMass, 1)} t`], ['Cost', fMoney(c.totalCost)]], level: 'nominal' };
  },

  panel(id, ctx) {
    const c = selected(ctx);
    const det = c ? ctx.data.craftDetail.get(c.file) : undefined;
    const title = vih.consoles.find((x) => x.id === (id ?? 'VI'))?.title ?? '';
    const head = `<header><div><div class="pos">${id ?? 'VI'}</div><div class="ptitle">${esc(title)}</div></div><div class="lamp ${c ? 'nominal' : 'nodata'}">${c ? 'OK' : 'NO DATA'}</div></header>`;
    const list = (ctx.data.craft ?? []).map((x) => `<button class="item ${x.file === c?.file ? 'sel' : ''}" data-act="pick" data-file="${esc(x.file)}"><div class="t">${esc(x.name)}</div><div class="m"><span>${x.facility ?? ''}${x.save ? ` · ${esc(x.save)}` : ''}</span><span>${x.totalMass === null ? '' : `${fNum(x.totalMass, 1)} t`}</span></div></button>`).join('');
    let body = '';
    if (!c) body = `<p class="muted">${ctx.data.craft ? 'No craft files in this install.' : 'Loading craft…'}</p>`;
    else if (id === 'LOAD') {
      const res = det ? Object.entries(det.resources).filter(([, r]) => r.max > 0).sort((a, b) => b[1].max - a[1].max) : [];
      body = res.map(([n, r]) => `<div class="row"><span class="k">${esc(RESOURCE_LABELS[n] ?? n)}</span><span class="v small">${fNum(r.amount, 1)} / ${fNum(r.max, 1)}</span></div>`).join('') || `<p class="muted">${det ? 'No resources' : 'Reading the craft file…'}</p>`;
    } else if (id === 'STACK') {
      const byStage = new Map<number, number>();
      for (const p of det?.parts ?? []) byStage.set(p.stage, (byStage.get(p.stage) ?? 0) + 1);
      body = `<p class="muted small">Parts by decouple stage (KSP's dstg; 0 is the payload end).</p>` + [...byStage.entries()].sort((a, b) => b[0] - a[0]).map(([s, n]) => `<div class="row"><span class="k">Stage ${s}</span><span class="v small">${n} parts</span></div>`).join('');
    } else body = `<div class="kpis"><div><span>Mass</span><b class="small">${c.totalMass === null ? '—' : fNum(c.totalMass, 1) + ' t'}</b></div><div><span>Cost</span><b class="small">${fMoney(c.totalCost)}</b></div><div><span>Height</span><b class="small">${c.size ? fNum(c.size[1], 1) + ' m' : '—'}</b></div><div><span>Parts</span><b class="small">${c.partCount ?? '—'}</b></div></div>${c.description ? `<p>${esc(c.description)}</p>` : ''}
      <p class="muted foot">The stack is drawn from the craft file's part positions: each vertical column of parts becomes one cylinder. Part shapes are not in the craft file, so this is a silhouette, not the in-game model.</p>`;
    return head + body + `<h3>Designs (${ctx.data.craft?.length ?? 0})</h3><div class="list">${list || '<div class="muted">None</div>'}</div>`;
  },

  action(el, ctx, ev) {
    if (el.dataset.act === 'pick' && ev.type === 'click') {
      sel = el.dataset.file ?? null;
      try { localStorage.setItem(KEY, sel ?? ''); } catch { /* */ }
      if (sel) ctx.data.loadCraftDetail(sel);
      drawnKey = '';
      ctx.refresh();
      return true;
    }
    return false;
  },
};
