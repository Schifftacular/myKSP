import * as THREE from 'three';
import type { CraftDetail } from '@myksp/shared';

/**
 * A vehicle stack built from a craft file's part positions. The craft file has no part shapes,
 * so each vertical column of parts (core, side boosters) becomes one cylinder spanning its parts,
 * with a nose cone on the core. Proportions come from the real part layout and the editor's ship
 * size, so an SLS looks like an SLS and a Falcon 9 like a Falcon 9, without any part models.
 */
export function vehicleGroup(detail: CraftDetail, size: [number, number, number] | null, colors = { body: '#d9d4c7', accent: '#c7792f' }) {
  const g = new THREE.Group();
  if (!detail.parts.length) return g;
  const width = size ? Math.max(size[0], size[2]) : 5;
  // Cluster parts into vertical columns by horizontal position.
  const cols: { x: number; z: number; y0: number; y1: number; n: number }[] = [];
  const tol = Math.max(0.6, width * 0.06);
  for (const p of detail.parts) {
    const [x, y, z] = p.pos;
    let c = cols.find((c) => Math.hypot(c.x - x, c.z - z) < tol);
    if (!c) { c = { x, z, y0: y, y1: y, n: 0 }; cols.push(c); }
    c.y0 = Math.min(c.y0, y); c.y1 = Math.max(c.y1, y); c.n++;
  }
  // The core is the tallest column; small one-part columns (fins, antennas, RCS) are dropped.
  cols.sort((a, b) => (b.y1 - b.y0) - (a.y1 - a.y0));
  const core = cols[0];
  const yMin = Math.min(...detail.parts.map((p) => p.pos[1]));
  const yMax = Math.max(...detail.parts.map((p) => p.pos[1]));
  const height = size ? size[1] : yMax - yMin + 4;
  const pad = (height - (yMax - yMin)) / 2; // part centres sit inside the true extent
  const side = cols.slice(1).filter((c) => c.n >= 2 && c.y1 - c.y0 > height * 0.08);
  const nearest = side.length ? Math.min(...side.map((c) => Math.hypot(c.x - core.x, c.z - core.z))) : width;
  const coreR = Math.max(0.6, Math.min(width / 2, nearest * 0.55) * (side.length ? 0.8 : 1)) * (side.length ? 1 : 0.9);
  const bodyMat = new THREE.MeshStandardMaterial({ color: colors.body, roughness: 0.55, metalness: 0.1 });
  const accentMat = new THREE.MeshStandardMaterial({ color: colors.accent, roughness: 0.6, metalness: 0.1 });
  const cyl = (c: typeof core, r: number, mat: THREE.Material, nose: boolean) => {
    const y0 = c.y0 - yMin, y1 = c.y1 - yMin + pad * 2;
    const h = Math.max(1, y1 - y0);
    const m = new THREE.Mesh(new THREE.CylinderGeometry(r, r, h, 24), mat);
    m.position.set(c.x - core.x, y0 + h / 2, c.z - core.z);
    g.add(m);
    const capH = Math.min(r * (nose ? 2.2 : 1.4), h * 0.25);
    const cone = new THREE.Mesh(new THREE.ConeGeometry(r, capH, 24), mat);
    cone.position.set(c.x - core.x, y0 + h + capH / 2, c.z - core.z);
    g.add(cone);
  };
  cyl(core, coreR, bodyMat, true);
  const boosterR = Math.max(0.4, Math.min(coreR * 0.6, nearest - coreR - 0.1));
  for (const c of side) cyl(c, boosterR, accentMat, false);
  g.userData.height = height;
  return g;
}

/** Match a live vessel name to a craft name ("X Ship", "X Probe" are renamed vessels of craft X). */
export function craftNameFor(vessel: string | null): string | null {
  if (!vessel) return null;
  return vessel.replace(/\s+(Ship|Probe|Lander|Rover|Debris|Station|Base|Relay|Plane|Lander)$/i, '').trim();
}
