import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import type { Position } from '@myksp/shared';
import { makeCanvas } from './screens';

/**
 * The Flight Control Room. Procedural geometry only (no downloaded assets, no licensing
 * questions), modelled on the layout of a contemporary flight control room: three tiers of
 * consoles facing a front wall of displays, the flight director on the top tier.
 *
 * Rendering is on demand: the scene is redrawn when data arrives (~4 Hz), while the camera
 * moves, or on resize/hover. A static room costs nothing per frame while KSP is running.
 */

export type ConsoleId = Position | 'PROGRAM';

export interface ConsoleSlot {
  id: ConsoleId;
  x: number;
  z: number;
  tier: number;
  canvas: HTMLCanvasElement;
  texture: THREE.CanvasTexture;
  lamp: THREE.MeshBasicMaterial;
  hit: THREE.Object3D;
}

const ROOM = { w: 30, d: 22, h: 10, front: -10 };
const TIER_H = 0.42;

const LAYOUT: { id: ConsoleId; x: number; row: number }[] = [
  { id: 'FDO', x: -4.4, row: 0 }, { id: 'GNC', x: 0, row: 0 }, { id: 'PROP', x: 4.4, row: 0 },
  { id: 'EECOM', x: -4.4, row: 1 }, { id: 'INCO', x: 0, row: 1 }, { id: 'CAPCOM', x: 4.4, row: 1 },
  { id: 'PROGRAM', x: -4.4, row: 2 }, { id: 'FLIGHT', x: 0, row: 2 },
];
const ROW_Z = [-3.2, 0.6, 4.4];

export class FlightControlRoom {
  readonly renderer: THREE.WebGLRenderer;
  readonly scene = new THREE.Scene();
  readonly camera: THREE.PerspectiveCamera;
  readonly consoles = new Map<ConsoleId, ConsoleSlot>();
  readonly wall: { ground: THREE.CanvasTexture; traj: THREE.CanvasTexture; orbit: THREE.CanvasTexture; clocks: THREE.CanvasTexture };
  readonly wallCanvas: { ground: HTMLCanvasElement; traj: HTMLCanvasElement; orbit: HTMLCanvasElement; clocks: HTMLCanvasElement };
  private dirty = true;
  private tween: { from: THREE.Vector3; to: THREE.Vector3; fromLook: THREE.Vector3; toLook: THREE.Vector3; t0: number; dur: number } | null = null;
  private look = new THREE.Vector3();
  private raycaster = new THREE.Raycaster();
  private hovered: ConsoleId | null = null;
  reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  onPick: (id: ConsoleId) => void = () => {};
  perf = { frameMs: 0, calls: 0, triangles: 0, frames: 0, textures: 0, geometries: 0 };

  constructor(private host: HTMLElement) {
    this.renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
    this.renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5));
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.0;
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    host.appendChild(this.renderer.domElement);
    this.camera = new THREE.PerspectiveCamera(55, 1, 0.1, 100);
    this.scene.background = new THREE.Color('#06080b');
    this.scene.fog = new THREE.Fog('#06080b', 26, 48);
    const pmrem = new THREE.PMREMGenerator(this.renderer);
    this.scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    this.scene.environmentIntensity = 0.12;

    this.wallCanvas = { ground: makeCanvas(2048, 1152), traj: makeCanvas(1024, 576), orbit: makeCanvas(1024, 576), clocks: makeCanvas(2560, 176) };
    const tex = (c: HTMLCanvasElement) => { const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; return t; };
    this.wall = { ground: tex(this.wallCanvas.ground), traj: tex(this.wallCanvas.traj), orbit: tex(this.wallCanvas.orbit), clocks: tex(this.wallCanvas.clocks) };

    this.buildArchitecture();
    this.buildFrontWall();
    for (const c of LAYOUT) this.buildConsole(c.id, c.x, c.row);
    this.buildLights();

    this.setView(this.overview(), true);
    const ro = new ResizeObserver(() => this.resize());
    ro.observe(host);
    this.resize();
    this.bindPointer();
    const loop = () => { this.tick(); requestAnimationFrame(loop); };
    requestAnimationFrame(loop);
  }

  // --- construction ---------------------------------------------------------------------------

  private std(color: string, rough = 0.85, metal = 0.05) { return new THREE.MeshStandardMaterial({ color, roughness: rough, metalness: metal }); }

  private buildArchitecture() {
    const { w, d, h, front } = ROOM;
    const back = front + d;
    const floor = new THREE.Mesh(new THREE.PlaneGeometry(w, d), this.std('#1b1f24', 0.97));
    floor.rotation.x = -Math.PI / 2;
    floor.position.set(0, 0, front + d / 2);
    const ceil = new THREE.Mesh(new THREE.PlaneGeometry(w, d), this.std('#101215', 1));
    ceil.rotation.x = Math.PI / 2;
    ceil.position.set(0, h, front + d / 2);
    const wallMat = this.std('#23272c', 0.9);
    const left = new THREE.Mesh(new THREE.PlaneGeometry(d, h), wallMat);
    left.rotation.y = Math.PI / 2; left.position.set(-w / 2, h / 2, front + d / 2);
    const right = left.clone(); right.rotation.y = -Math.PI / 2; right.position.x = w / 2;
    const backWall = new THREE.Mesh(new THREE.PlaneGeometry(w, h), wallMat);
    backWall.rotation.y = Math.PI; backWall.position.set(0, h / 2, back);
    const frontWall = new THREE.Mesh(new THREE.PlaneGeometry(w, h), this.std('#0c0e11', 0.95));
    frontWall.position.set(0, h / 2, front);
    this.scene.add(floor, ceil, left, right, backWall, frontWall);

    // Acoustic wall panels: merged into one mesh (one draw call).
    const panels: THREE.BufferGeometry[] = [];
    for (let z = front + 2; z < back - 1; z += 2.2) {
      for (const side of [-1, 1]) {
        const g = new THREE.BoxGeometry(0.06, 3.2, 1.9);
        g.translate(side * (w / 2 - 0.03), 3.4, z);
        panels.push(g);
      }
    }
    this.scene.add(new THREE.Mesh(mergeGeometries(panels), this.std('#2b3036', 0.95)));

    // Tier platforms for rows 2 and 3.
    const tiers: THREE.BufferGeometry[] = [];
    for (let r = 1; r < ROW_Z.length; r++) {
      const depth = (r === ROW_Z.length - 1 ? back : ROW_Z[r] + 1.9) - (ROW_Z[r] - 1.9);
      const g = new THREE.BoxGeometry(w, TIER_H * r, depth);
      g.translate(0, (TIER_H * r) / 2, ROW_Z[r] - 1.9 + depth / 2);
      tiers.push(g);
    }
    const tierMesh = new THREE.Mesh(mergeGeometries(tiers), this.std('#1d2126', 0.96));
    this.scene.add(tierMesh);
    // Edge strip lights on tier fronts (safety lighting, a real FCR detail).
    const strips: THREE.BufferGeometry[] = [];
    for (let r = 1; r < ROW_Z.length; r++) {
      const g = new THREE.BoxGeometry(w - 0.4, 0.025, 0.025);
      g.translate(0, TIER_H * r - 0.03, ROW_Z[r] - 1.9 - 0.02);
      strips.push(g);
    }
    this.scene.add(new THREE.Mesh(mergeGeometries(strips), new THREE.MeshBasicMaterial({ color: '#c79a5b' })));

    // Ceiling light coffers: emissive, warm, dim. Merged.
    const coffers: THREE.BufferGeometry[] = [];
    for (const z of ROW_Z) for (const x of [-6.6, -2.2, 2.2, 6.6]) {
      const g = new THREE.PlaneGeometry(2.6, 0.7);
      g.rotateX(Math.PI / 2);
      g.translate(x, h - 0.01, z);
      coffers.push(g);
    }
    this.scene.add(new THREE.Mesh(mergeGeometries(coffers), new THREE.MeshBasicMaterial({ color: '#5a5144' })));
  }

  private buildFrontWall() {
    const f = ROOM.front + 0.02;
    const screen = (tex: THREE.Texture, w: number, h: number, x: number, y: number) => {
      const bezel = new THREE.Mesh(new THREE.BoxGeometry(w + 0.24, h + 0.24, 0.12), this.std('#050607', 0.6, 0.3));
      bezel.position.set(x, y, f + 0.06);
      const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ map: tex, toneMapped: false }));
      m.position.set(x, y, f + 0.125);
      this.scene.add(bezel, m);
    };
    screen(this.wall.ground, 13.6, 7.65, 0, 4.9);
    screen(this.wall.traj, 6.6, 3.71, -10.6, 5.2);
    screen(this.wall.orbit, 6.6, 3.71, 10.6, 5.2);
    screen(this.wall.clocks, 13.6, 0.935, 0, 9.3);
  }

  private label(text: string, w = 512, h = 96) {
    const c = makeCanvas(w, h);
    const g = c.getContext('2d')!;
    g.fillStyle = '#0b0d10'; g.fillRect(0, 0, w, h);
    g.fillStyle = '#c9d3da';
    g.font = `800 ${h * 0.56}px Inter, system-ui, sans-serif`;
    g.textAlign = 'center';
    g.fillText(text, w / 2, h * 0.7);
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    return t;
  }

  private buildConsole(id: ConsoleId, x: number, row: number) {
    const y = TIER_H * row;
    const z = ROW_Z[row];
    const W = 3.6;
    const group = new THREE.Group();
    group.position.set(x, y, z);
    const body = this.std('#2a2f35', 0.55, 0.35);
    const top = this.std('#3a4047', 0.4, 0.2);
    const desk = new THREE.Mesh(new THREE.BoxGeometry(W, 0.74, 0.95), body);
    desk.position.set(0, 0.37, 0);
    const work = new THREE.Mesh(new THREE.BoxGeometry(W + 0.1, 0.05, 1.15), top);
    work.position.set(0, 0.765, 0.08);
    // Monitor housing: wide, slightly reclined, facing the operator (+z).
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
    // Position placard on top of the housing.
    const plate = new THREE.Mesh(new THREE.PlaneGeometry(1.1, 0.2), new THREE.MeshBasicMaterial({ map: this.label(id), toneMapped: false }));
    plate.position.set(0, 1.73, -0.25);
    const lamp = new THREE.MeshBasicMaterial({ color: '#4a5864', toneMapped: false });
    const lampMesh = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.06, 0.04), lamp);
    lampMesh.position.set(0.75, 1.73, -0.25);
    // Chair (scale cue): seat + back.
    const chairMat = this.std('#16191c', 0.8);
    const seat = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.08, 0.55), chairMat);
    seat.position.set(0, 0.5, 1.0);
    const backrest = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.7, 0.06), chairMat);
    backrest.position.set(0, 0.9, 1.28);
    // Invisible, generous hit box so the console is easy to click.
    const hit = new THREE.Mesh(new THREE.BoxGeometry(W, 1.9, 1.6), new THREE.MeshBasicMaterial({ visible: false }));
    hit.position.set(0, 0.95, 0.2);
    hit.userData.console = id;
    group.add(desk, work, housing, screen, plate, lampMesh, seat, backrest, hit);
    this.scene.add(group);
    this.consoles.set(id, { id, x, z, tier: row, canvas, texture, lamp, hit });
  }

  private buildLights() {
    this.scene.add(new THREE.HemisphereLight('#9fb4c8', '#1a1612', 0.35));
    // Warm task light over each row, aimed at the desks.
    for (const z of ROW_Z) {
      const s = new THREE.SpotLight('#ffd7a8', 60, 16, 0.85, 0.6, 1.6);
      s.position.set(0, ROOM.h - 0.3, z + 1.2);
      s.target.position.set(0, 0, z);
      this.scene.add(s, s.target);
    }
    // Cool spill from the front wall displays.
    const spill = new THREE.PointLight('#7fb4d8', 40, 18, 1.6);
    spill.position.set(0, 4.5, ROOM.front + 1.5);
    this.scene.add(spill);
  }

  // --- camera ---------------------------------------------------------------------------------

  overview() {
    return { pos: new THREE.Vector3(0, 5.2, 11.2), look: new THREE.Vector3(0, 3.7, ROOM.front) };
  }

  seat(id: ConsoleId) {
    const c = this.consoles.get(id)!;
    const y = TIER_H * c.tier;
    return { pos: new THREE.Vector3(c.x * 0.9, y + 2.45, c.z + 3.3), look: new THREE.Vector3(c.x * 0.45, y + 2.9, ROOM.front) };
  }

  setView(v: { pos: THREE.Vector3; look: THREE.Vector3 }, instant = false) {
    if (instant || this.reducedMotion) {
      this.camera.position.copy(v.pos);
      this.look.copy(v.look);
      this.camera.lookAt(this.look);
      this.tween = null;
    } else {
      this.tween = { from: this.camera.position.clone(), to: v.pos, fromLook: this.look.clone(), toLook: v.look, t0: performance.now(), dur: 550 };
    }
    this.dirty = true;
  }

  // --- updates --------------------------------------------------------------------------------

  markDirty() { this.dirty = true; }

  setLamp(id: ConsoleId, color: string) {
    const c = this.consoles.get(id);
    if (c && c.lamp.color.getHexString() !== color.replace('#', '').toLowerCase()) { c.lamp.color.set(color); this.dirty = true; }
  }

  refreshTextures(which: ('ground' | 'traj' | 'orbit' | 'clocks')[]) {
    for (const k of which) this.wall[k].needsUpdate = true;
    this.dirty = true;
  }

  refreshConsole(id: ConsoleId) {
    const c = this.consoles.get(id);
    if (c) { c.texture.needsUpdate = true; this.dirty = true; }
  }

  private resize() {
    const w = this.host.clientWidth || 1, h = this.host.clientHeight || 1;
    this.renderer.setSize(w, h, false);
    this.camera.aspect = w / h;
    // Keep the whole front wall in view on narrow screens.
    this.camera.fov = w / h < 1.3 ? 70 : 55;
    this.camera.updateProjectionMatrix();
    this.dirty = true;
  }

  private bindPointer() {
    const el = this.renderer.domElement;
    const pick = (e: PointerEvent): ConsoleId | null => {
      const r = el.getBoundingClientRect();
      const ndc = new THREE.Vector2(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
      this.raycaster.setFromCamera(ndc, this.camera);
      const hits = this.raycaster.intersectObjects([...this.consoles.values()].map((c) => c.hit), false);
      return (hits[0]?.object.userData.console as ConsoleId) ?? null;
    };
    el.addEventListener('pointermove', (e) => {
      const id = pick(e);
      if (id !== this.hovered) { this.hovered = id; el.style.cursor = id ? 'pointer' : 'default'; el.title = id ? `${id} console` : ''; }
    });
    el.addEventListener('click', (e) => { const id = pick(e); if (id) this.onPick(id); });
  }

  private tick() {
    if (this.tween) {
      const k = Math.min(1, (performance.now() - this.tween.t0) / this.tween.dur);
      const e = k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2;
      this.camera.position.lerpVectors(this.tween.from, this.tween.to, e);
      this.look.lerpVectors(this.tween.fromLook, this.tween.toLook, e);
      this.camera.lookAt(this.look);
      if (k >= 1) this.tween = null;
      this.dirty = true;
    }
    if (!this.dirty || document.hidden) return;
    this.dirty = false;
    const t0 = performance.now();
    this.renderer.render(this.scene, this.camera);
    const info = this.renderer.info;
    this.perf = {
      frameMs: performance.now() - t0, calls: info.render.calls, triangles: info.render.triangles, frames: this.perf.frames + 1,
      textures: info.memory.textures, geometries: info.memory.geometries,
    };
  }
}
