import * as THREE from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import type { BuiltRoom, ConsoleSlot, View } from './engine';
import { makeCanvas } from './screens';

/**
 * Procedural building blocks shared by every room. No downloaded models or textures: geometry
 * is generated, static parts are merged into few meshes, and every display is a canvas texture
 * redrawn only when its data changes.
 */
export class RoomKit {
  readonly scene = new THREE.Scene();
  readonly consoles = new Map<string, ConsoleSlot>();
  readonly screens: BuiltRoom['screens'] = {};
  private merged = new Map<string, { mat: THREE.Material; geos: THREE.BufferGeometry[] }>();

  constructor(bg = '#06080b', fog: [number, number] = [26, 48]) {
    this.scene.background = new THREE.Color(bg);
    this.scene.fog = new THREE.Fog(bg, fog[0], fog[1]);
  }

  std(color: string, rough = 0.85, metal = 0.05) { return new THREE.MeshStandardMaterial({ color, roughness: rough, metalness: metal }); }

  /** Queue a static box for merging under material `key` (one draw call per key). */
  box(key: string, mat: () => THREE.Material, w: number, h: number, d: number, x: number, y: number, z: number, rotY = 0) {
    const g = new THREE.BoxGeometry(w, h, d);
    if (rotY) g.rotateY(rotY);
    g.translate(x, y, z);
    this.queue(key, mat, g);
  }

  queue(key: string, mat: () => THREE.Material, g: THREE.BufferGeometry) {
    let e = this.merged.get(key);
    if (!e) { e = { mat: mat(), geos: [] }; this.merged.set(key, e); }
    e.geos.push(g.index ? g.toNonIndexed() : g);
  }

  /** Floor, ceiling and four walls. `front` is the z of the display wall; the room extends to +z. */
  shell(o: { w: number; d: number; h: number; front: number; floor?: string; wall?: string; ceil?: string; frontColor?: string; skipFront?: boolean }) {
    const { w, d, h, front } = o;
    const plane = (pw: number, ph: number, mat: THREE.Material, pos: [number, number, number], rx = 0, ry = 0) => {
      const m = new THREE.Mesh(new THREE.PlaneGeometry(pw, ph), mat);
      m.rotation.set(rx, ry, 0);
      m.position.set(...pos);
      this.scene.add(m);
    };
    plane(w, d, this.std(o.floor ?? '#1b1f24', 0.97), [0, 0, front + d / 2], -Math.PI / 2);
    plane(w, d, this.std(o.ceil ?? '#101215', 1), [0, h, front + d / 2], Math.PI / 2);
    const wallMat = this.std(o.wall ?? '#23272c', 0.9);
    plane(d, h, wallMat, [-w / 2, h / 2, front + d / 2], 0, Math.PI / 2);
    plane(d, h, wallMat, [w / 2, h / 2, front + d / 2], 0, -Math.PI / 2);
    plane(w, h, wallMat, [0, h / 2, front + d], 0, Math.PI);
    if (!o.skipFront) plane(w, h, this.std(o.frontColor ?? '#0c0e11', 0.95), [0, h / 2, front]);
  }

  /** Acoustic panels along both side walls. */
  sidePanels(w: number, front: number, back: number, y = 3.4, ph = 3.2) {
    for (let z = front + 2; z < back - 1; z += 2.2) for (const side of [-1, 1]) {
      this.box('panels', () => this.std('#2b3036', 0.95), 0.06, ph, 1.9, side * (w / 2 - 0.03), y, z);
    }
  }

  /** Raised tiers: tier r spans from rowZ[r]-1.9 to the next row (or `back`). */
  tiers(w: number, rowZ: number[], tierH: number, back: number, color = '#1d2126', strip = '#c79a5b') {
    for (let r = 1; r < rowZ.length; r++) {
      const z0 = rowZ[r] - 1.9;
      const z1 = r === rowZ.length - 1 ? back : rowZ[r + 1] - 1.9;
      this.box('tiers', () => this.std(color, 0.96), w, tierH * r, z1 - z0, 0, (tierH * r) / 2, z0 + (z1 - z0) / 2);
      this.box('strips', () => new THREE.MeshBasicMaterial({ color: strip }), w - 0.4, 0.025, 0.025, 0, tierH * r - 0.03, z0 - 0.02);
    }
  }

  /** Emissive ceiling coffers. */
  coffers(xs: number[], zs: number[], h: number, color = '#5a5144', size: [number, number] = [2.6, 0.7]) {
    for (const z of zs) for (const x of xs) {
      const g = new THREE.PlaneGeometry(size[0], size[1]);
      g.rotateX(Math.PI / 2);
      g.translate(x, h - 0.01, z);
      this.queue(`coffer${color}`, () => new THREE.MeshBasicMaterial({ color }), g);
    }
  }

  /** A display: bezel plus a canvas-textured plane. Registers it under `key`. */
  screen(key: string, cw: number, ch: number, w: number, h: number, x: number, y: number, z: number, rotY = 0) {
    const canvas = makeCanvas(cw, ch);
    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.anisotropy = 4;
    const grp = new THREE.Group();
    grp.position.set(x, y, z);
    grp.rotation.y = rotY;
    const bezel = new THREE.Mesh(new THREE.BoxGeometry(w + 0.24, h + 0.24, 0.12), this.std('#050607', 0.6, 0.3));
    bezel.position.z = 0.06;
    const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ map: texture, toneMapped: false }));
    m.position.z = 0.125;
    grp.add(bezel, m);
    this.scene.add(grp);
    this.screens[key] = { canvas, texture };
    return grp;
  }

  labelTexture(text: string, w = 512, h = 96, fg = '#c9d3da', bg = '#0b0d10') {
    const c = makeCanvas(w, h);
    const g = c.getContext('2d')!;
    g.fillStyle = bg; g.fillRect(0, 0, w, h);
    g.fillStyle = fg;
    g.font = `800 ${h * 0.56}px Inter, system-ui, sans-serif`;
    g.textAlign = 'center';
    g.fillText(text, w / 2, h * 0.7);
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    return t;
  }

  /**
   * An operator console: desk, worktop, reclined monitor housing with a canvas screen, position
   * placard with a status lamp, chair, and an invisible hit box for picking. Faces −z by default
   * (toward the front wall); `rotY` turns it.
   */
  console(id: string, x: number, y: number, z: number, opts: { rotY?: number; width?: number; label?: string; view?: View; lookAt?: THREE.Vector3 } = {}) {
    const W = opts.width ?? 3.6;
    const group = new THREE.Group();
    group.position.set(x, y, z);
    group.rotation.y = opts.rotY ?? 0;
    const body = this.std('#2a2f35', 0.55, 0.35);
    const desk = new THREE.Mesh(new THREE.BoxGeometry(W, 0.74, 0.95), body);
    desk.position.set(0, 0.37, 0);
    const work = new THREE.Mesh(new THREE.BoxGeometry(W + 0.1, 0.05, 1.15), this.std('#3a4047', 0.4, 0.2));
    work.position.set(0, 0.765, 0.08);
    const housing = new THREE.Mesh(new THREE.BoxGeometry(W - 0.1, 0.78, 0.12), this.std('#14171a', 0.5, 0.3));
    housing.position.set(0, 1.25, -0.28);
    housing.rotation.x = -0.12;
    const canvas = makeCanvas(1024, 256);
    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.anisotropy = 4;
    const screen = new THREE.Mesh(new THREE.PlaneGeometry(W - 0.26, (W - 0.26) / 4), new THREE.MeshBasicMaterial({ map: texture, toneMapped: false }));
    screen.position.set(0, 1.25, -0.215);
    screen.rotation.x = -0.12;
    const plate = new THREE.Mesh(new THREE.PlaneGeometry(1.1, 0.2), new THREE.MeshBasicMaterial({ map: this.labelTexture(opts.label ?? id), toneMapped: false }));
    plate.position.set(0, 1.73, -0.25);
    const lamp = new THREE.MeshBasicMaterial({ color: '#4a5864', toneMapped: false });
    const lampMesh = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.06, 0.04), lamp);
    lampMesh.position.set(0.75, 1.73, -0.25);
    const chairMat = this.std('#16191c', 0.8);
    const seat = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.08, 0.55), chairMat);
    seat.position.set(0, 0.5, 1.0);
    const back = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.7, 0.06), chairMat);
    back.position.set(0, 0.9, 1.28);
    const hit = new THREE.Mesh(new THREE.BoxGeometry(W, 1.9, 1.6), new THREE.MeshBasicMaterial({ visible: false }));
    hit.position.set(0, 0.95, 0.2);
    hit.userData.console = id;
    group.add(desk, work, housing, screen, plate, lampMesh, seat, back, hit);
    this.scene.add(group);
    // Default seat view: behind and above the chair, looking past the monitor.
    const rot = opts.rotY ?? 0;
    const behind = new THREE.Vector3(0, 2.4, 3.2).applyAxisAngle(new THREE.Vector3(0, 1, 0), rot).add(group.position);
    const ahead = opts.lookAt ?? new THREE.Vector3(0, 1.4, -6).applyAxisAngle(new THREE.Vector3(0, 1, 0), rot).add(group.position);
    this.consoles.set(id, { id, canvas, texture, lamp, hit, view: opts.view ?? { pos: behind, look: ahead } });
    return group;
  }

  /** Conference table with a dark top. */
  table(x: number, z: number, w: number, d: number, h = 0.76) {
    this.box('tableTop', () => this.std('#2c3238', 0.35, 0.25), w, 0.06, d, x, h, z);
    this.box('tableBase', () => this.std('#15181b', 0.8), w * 0.8, h - 0.03, d * 0.4, x, (h - 0.03) / 2, z);
  }

  /** Glass wall with mullions at z, spanning x0..x1 and y0..y1. */
  glass(x0: number, x1: number, y0: number, y1: number, z: number, bays = 8) {
    const w = x1 - x0, h = y1 - y0;
    const glass = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshStandardMaterial({ color: '#0b1a24', transparent: true, opacity: 0.18, roughness: 0.05, metalness: 0.6, depthWrite: false }));
    glass.position.set((x0 + x1) / 2, (y0 + y1) / 2, z);
    this.scene.add(glass);
    for (let i = 0; i <= bays; i++) this.box('mullion', () => this.std('#0d0f12', 0.5, 0.6), 0.14, h, 0.14, x0 + (w * i) / bays, (y0 + y1) / 2, z);
    for (const y of [y0, y1]) this.box('mullion', () => this.std('#0d0f12', 0.5, 0.6), w, 0.2, 0.2, (x0 + x1) / 2, y, z);
  }

  lights(rowZ: number[], h: number, frontZ: number, opts: { warm?: string; spill?: string; spillI?: number; hemi?: number } = {}) {
    this.scene.add(new THREE.HemisphereLight('#9fb4c8', '#1a1612', opts.hemi ?? 0.35));
    for (const z of rowZ) {
      const s = new THREE.SpotLight(opts.warm ?? '#ffd7a8', 60, 16, 0.85, 0.6, 1.6);
      s.position.set(0, h - 0.3, z + 1.2);
      s.target.position.set(0, 0, z);
      this.scene.add(s, s.target);
    }
    const spill = new THREE.PointLight(opts.spill ?? '#7fb4d8', opts.spillI ?? 40, 18, 1.6);
    spill.position.set(0, 4.5, frontZ + 1.5);
    this.scene.add(spill);
  }

  finish(overview: View, extra: Partial<BuiltRoom> = {}): BuiltRoom {
    for (const { mat, geos } of this.merged.values()) {
      if (geos.length) this.scene.add(new THREE.Mesh(mergeGeometries(geos), mat));
    }
    this.merged.clear();
    return { scene: this.scene, consoles: this.consoles, screens: this.screens, overview, ...extra };
  }
}

export const v3 = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);
