import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';

/**
 * One WebGL renderer shared by every environment. Rooms are swapped by loading a new scene;
 * the old one is disposed so GPU memory does not grow as you walk between rooms.
 *
 * Rendering is on demand: a frame is drawn only when data changed, the camera is moving or the
 * window resized. The page renders nothing while hidden. A static room costs nothing per frame
 * while KSP is running.
 */
export interface View { pos: THREE.Vector3; look: THREE.Vector3 }

export interface ConsoleSlot {
  id: string;
  canvas: HTMLCanvasElement;
  texture: THREE.CanvasTexture;
  lamp: THREE.MeshBasicMaterial;
  hit: THREE.Object3D;
  view: View;
}

export interface BuiltRoom {
  scene: THREE.Scene;
  consoles: Map<string, ConsoleSlot>;
  screens: Record<string, { canvas: HTMLCanvasElement; texture: THREE.CanvasTexture }>;
  overview: View;
  /** Optional per-frame animation (kept cheap; it forces continuous rendering while active). */
  animate?: (t: number) => boolean;
  dispose?: () => void;
}

export class Stage3D {
  readonly renderer: THREE.WebGLRenderer;
  readonly camera = new THREE.PerspectiveCamera(55, 1, 0.1, 4000);
  room: BuiltRoom | null = null;
  private envMap: THREE.Texture;
  private dirty = true;
  private tween: { from: THREE.Vector3; to: THREE.Vector3; fromLook: THREE.Vector3; toLook: THREE.Vector3; t0: number; dur: number } | null = null;
  private look = new THREE.Vector3();
  private raycaster = new THREE.Raycaster();
  private hovered: string | null = null;
  reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  onPick: (id: string) => void = () => {};
  perf = { frameMs: 0, calls: 0, triangles: 0, frames: 0, textures: 0, geometries: 0 };

  constructor(private host: HTMLElement) {
    this.renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
    this.renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5));
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    host.appendChild(this.renderer.domElement);
    const pmrem = new THREE.PMREMGenerator(this.renderer);
    this.envMap = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    pmrem.dispose();
    new ResizeObserver(() => this.resize()).observe(host);
    this.resize();
    this.bindPointer();
    const loop = (t: number) => { this.tick(t); requestAnimationFrame(loop); };
    requestAnimationFrame(loop);
    document.addEventListener('visibilitychange', () => { this.dirty = true; });
  }

  load(room: BuiltRoom) {
    if (this.room) disposeScene(this.room);
    this.room = room;
    room.scene.environment = this.envMap;
    if (room.scene.environmentIntensity === 1) room.scene.environmentIntensity = 0.12;
    this.setView(room.overview, true);
    this.dirty = true;
  }

  setView(v: View, instant = false) {
    if (instant || this.reducedMotion) {
      this.camera.position.copy(v.pos);
      this.look.copy(v.look);
      this.camera.lookAt(this.look);
      this.tween = null;
    } else {
      this.tween = { from: this.camera.position.clone(), to: v.pos.clone(), fromLook: this.look.clone(), toLook: v.look.clone(), t0: performance.now(), dur: 550 };
    }
    this.dirty = true;
  }

  markDirty() { this.dirty = true; }

  refresh(tex: THREE.Texture | undefined) { if (tex) { tex.needsUpdate = true; this.dirty = true; } }

  setLamp(id: string, color: string) {
    const c = this.room?.consoles.get(id);
    if (c && c.lamp.color.getHexString() !== color.replace('#', '').toLowerCase()) { c.lamp.color.set(color); this.dirty = true; }
  }

  private resize() {
    const w = this.host.clientWidth || 1, h = this.host.clientHeight || 1;
    this.renderer.setSize(w, h, false);
    this.camera.aspect = w / h;
    this.camera.fov = w / h < 1.3 ? 70 : 55;
    this.camera.updateProjectionMatrix();
    this.dirty = true;
  }

  private bindPointer() {
    const el = this.renderer.domElement;
    const pick = (e: PointerEvent): string | null => {
      if (!this.room) return null;
      const r = el.getBoundingClientRect();
      const ndc = new THREE.Vector2(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
      this.raycaster.setFromCamera(ndc, this.camera);
      const hits = this.raycaster.intersectObjects([...this.room.consoles.values()].map((c) => c.hit), false);
      return (hits[0]?.object.userData.console as string) ?? null;
    };
    el.addEventListener('pointermove', (e) => {
      const id = pick(e);
      if (id !== this.hovered) { this.hovered = id; el.style.cursor = id ? 'pointer' : 'default'; el.title = id ? `${id} console` : ''; }
    });
    el.addEventListener('click', (e) => { const id = pick(e); if (id) this.onPick(id); });
  }

  private tick(t: number) {
    if (!this.room || document.hidden) return;
    if (this.tween) {
      const k = Math.min(1, (performance.now() - this.tween.t0) / this.tween.dur);
      const e = k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2;
      this.camera.position.lerpVectors(this.tween.from, this.tween.to, e);
      this.look.lerpVectors(this.tween.fromLook, this.tween.toLook, e);
      this.camera.lookAt(this.look);
      if (k >= 1) this.tween = null;
      this.dirty = true;
    }
    if (this.room.animate && !this.reducedMotion && this.room.animate(t)) this.dirty = true;
    if (!this.dirty) return;
    this.dirty = false;
    const t0 = performance.now();
    this.renderer.render(this.room.scene, this.camera);
    const info = this.renderer.info;
    this.perf = {
      frameMs: performance.now() - t0, calls: info.render.calls, triangles: info.render.triangles, frames: this.perf.frames + 1,
      textures: info.memory.textures, geometries: info.memory.geometries,
    };
  }
}

function disposeScene(room: BuiltRoom) {
  room.dispose?.();
  room.scene.traverse((o) => {
    const m = o as THREE.Mesh;
    m.geometry?.dispose();
    const mats = Array.isArray(m.material) ? m.material : m.material ? [m.material] : [];
    for (const mat of mats) {
      for (const v of Object.values(mat)) if (v instanceof THREE.Texture) v.dispose();
      mat.dispose();
    }
  });
}
