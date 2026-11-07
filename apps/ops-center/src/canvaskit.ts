import { header, label, niceMax, PAL } from './screens';

/** Small drawing helpers for the wall displays and console monitors of every room. */

export function blank(c: HTMLCanvasElement, title: string, right = '') {
  const g = c.getContext('2d')!;
  const { width: w, height: h } = c;
  g.fillStyle = PAL.bg;
  g.fillRect(0, 0, w, h);
  header(g, w, h, title, right);
  return { g, w, h };
}

export function centerNote(c: HTMLCanvasElement, text: string, sub?: string) {
  const g = c.getContext('2d')!;
  const { width: w, height: h } = c;
  label(g, text, w / 2, h * 0.5, h * 0.05, PAL.dim, 'center', 600);
  if (sub) label(g, sub, w / 2, h * 0.58, h * 0.034, PAL.dim, 'center');
}

export interface Col { label: string; w: number; align?: CanvasTextAlign; mono?: boolean }

/** A table: header row then data rows. `colors[i]` tints row i. Returns rows drawn. */
export function table(g: CanvasRenderingContext2D, x: number, y: number, width: number, rowH: number, cols: Col[], rows: string[][], colors: (string | undefined)[] = [], maxRows = 99) {
  const total = cols.reduce((s, c) => s + c.w, 0);
  const xs: number[] = [];
  let acc = x;
  for (const c of cols) { xs.push(acc); acc += (c.w / total) * width; }
  const ax = (i: number) => (cols[i].align === 'right' ? xs[i] + (cols[i].w / total) * width - rowH * 0.2 : cols[i].align === 'center' ? xs[i] + ((cols[i].w / total) * width) / 2 : xs[i]);
  cols.forEach((c, i) => label(g, c.label.toUpperCase(), ax(i), y, rowH * 0.42, PAL.dim, c.align ?? 'left', 700));
  g.strokeStyle = PAL.gridStrong; g.lineWidth = 1;
  g.beginPath(); g.moveTo(x, y + rowH * 0.3); g.lineTo(x + width, y + rowH * 0.3); g.stroke();
  const n = Math.min(rows.length, maxRows);
  for (let r = 0; r < n; r++) {
    const yy = y + rowH * (r + 1.05);
    rows[r].forEach((cell, i) => {
      const col = cols[i];
      if (!col) return;
      const maxW = (col.w / total) * width - rowH * 0.3;
      label(g, fit(g, cell, maxW, rowH * 0.5, col.mono), ax(i), yy, rowH * 0.5, colors[r] ?? PAL.text, col.align ?? 'left', i === 0 ? 600 : 500, col.mono);
    });
  }
  return n;
}

function fit(g: CanvasRenderingContext2D, s: string, maxW: number, size: number, mono = false) {
  g.font = `500 ${Math.round(size)}px ${mono ? 'monospace' : 'sans-serif'}`;
  if (g.measureText(s).width <= maxW) return s;
  let lo = 0, hi = s.length;
  while (lo < hi) { const mid = (lo + hi + 1) >> 1; if (g.measureText(s.slice(0, mid) + '…').width <= maxW) lo = mid; else hi = mid - 1; }
  return s.slice(0, lo) + '…';
}

export interface Series { pts: [number, number][]; color: string; label?: string; dash?: boolean; max?: number; min?: number }

/**
 * Line chart in rect (L,T,R,B). Each series may have its own y-scale (`max`); x is shared.
 * Returns the x→pixel mapping for overlays (cursors, markers).
 */
export function chart(g: CanvasRenderingContext2D, L: number, T: number, R: number, B: number, series: Series[], xr?: [number, number]) {
  const all = series.flatMap((s) => s.pts);
  if (all.length < 2) return null;
  const x0 = xr?.[0] ?? Math.min(...all.map((p) => p[0])), x1 = xr?.[1] ?? Math.max(...all.map((p) => p[0]), x0 + 1);
  g.strokeStyle = PAL.grid; g.lineWidth = 1;
  for (let k = 0; k <= 4; k++) { const y = T + ((B - T) * k) / 4; g.beginPath(); g.moveTo(L, y); g.lineTo(R, y); g.stroke(); }
  const X = (x: number) => L + ((x - x0) / (x1 - x0 || 1)) * (R - L);
  for (const s of series) {
    if (s.pts.length < 1) continue;
    const ys = s.pts.map((p) => p[1]);
    const lo = s.min ?? Math.min(0, ...ys);
    const hi = s.max ?? niceMax(Math.max(...ys, lo + 1e-9) - lo || 1) + lo;
    const Y = (y: number) => B - ((y - lo) / (hi - lo || 1)) * (B - T);
    g.strokeStyle = s.color; g.lineWidth = Math.max(2, (B - T) * 0.012);
    if (s.dash) g.setLineDash([8, 6]);
    g.beginPath();
    s.pts.forEach(([x, y], i) => (i ? g.lineTo(X(x), Y(y)) : g.moveTo(X(x), Y(y))));
    g.stroke();
    g.setLineDash([]);
  }
  return { X, x0, x1 };
}

export function legend(g: CanvasRenderingContext2D, x: number, y: number, size: number, items: [string, string][]) {
  let xx = x;
  for (const [text, color] of items) {
    g.fillStyle = color; g.fillRect(xx, y - size * 0.6, size * 1.2, size * 0.25);
    label(g, text, xx + size * 1.5, y, size, PAL.dim, 'left', 600);
    g.font = `600 ${Math.round(size)}px sans-serif`;
    xx += size * 2.4 + g.measureText(text).width;
  }
}

/** Big labelled number, for KPI tiles on wall displays. */
export function kpi(g: CanvasRenderingContext2D, x: number, y: number, size: number, cap: string, value: string, color: string = PAL.text) {
  label(g, cap.toUpperCase(), x, y, size * 0.36, PAL.dim, 'left', 700);
  label(g, value, x, y + size * 0.95, size, color, 'left', 600, true);
}

export function bar(g: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, frac: number | null, color: string) {
  g.fillStyle = '#0f1820'; g.fillRect(x, y, w, h);
  if (frac !== null) { g.fillStyle = color; g.fillRect(x, y, w * Math.max(0, Math.min(1, frac)), h); }
  g.strokeStyle = PAL.gridStrong; g.lineWidth = 1; g.strokeRect(x + 0.5, y + 0.5, w - 1, h - 1);
}

export { label, PAL };
