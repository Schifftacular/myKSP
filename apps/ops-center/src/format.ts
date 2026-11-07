const DASH = '—';

export function fNum(v: number | null | undefined, digits = 0, unit = ''): string {
  if (v === null || v === undefined || !Number.isFinite(v)) return DASH;
  return v.toLocaleString('en-US', { minimumFractionDigits: digits, maximumFractionDigits: digits }) + (unit ? ` ${unit}` : '');
}

/** Distance in metres → km above 10 km, m below. Hyperbolic Ap (negative) reads ESCAPE. */
export function fDist(m: number | null | undefined, opts: { escape?: boolean } = {}): string {
  if (m === null || m === undefined || !Number.isFinite(m)) return DASH;
  if (opts.escape && m < 0) return 'ESCAPE';
  const a = Math.abs(m);
  if (a >= 1e9) return fNum(m / 1e9, 2, 'Gm');
  if (a >= 1e6) return fNum(m / 1e6, 2, 'Mm');
  if (a >= 10_000) return fNum(m / 1000, 1, 'km');
  return fNum(m, 0, 'm');
}

export function fSpeed(v: number | null | undefined): string { return fNum(v, v !== null && v !== undefined && Math.abs(v) < 100 ? 1 : 0, 'm/s'); }

/** Duration as [d] hh:mm:ss. */
export function fDur(s: number | null | undefined): string {
  if (s === null || s === undefined || !Number.isFinite(s)) return DASH;
  const neg = s < 0;
  let x = Math.floor(Math.abs(s));
  const d = Math.floor(x / 86400); x -= d * 86400;
  const h = Math.floor(x / 3600); x -= h * 3600;
  const m = Math.floor(x / 60); const sec = x - m * 60;
  const p = (n: number) => String(n).padStart(2, '0');
  return `${neg ? '−' : ''}${d ? `${d}d ` : ''}${p(h)}:${p(m)}:${p(sec)}`;
}

export function fMet(s: number | null | undefined): string {
  if (s === null || s === undefined) return 'T+ ' + DASH;
  return `T+ ${fDur(s)}`;
}

/**
 * Game UT 0 as a calendar date. Read from the install's RSSDateTime config by the bridge
 * (RP2000 sets `epoch = 2000-01-01T00:00:00`); 2000-01-01 is the default until that arrives.
 */
let epochMs = Date.UTC(2000, 0, 1);
export function setEpoch(ms: number | null | undefined) { if (ms !== null && ms !== undefined && Number.isFinite(ms)) epochMs = ms; }
export function utToDate(ut: number): Date { return new Date(epochMs + ut * 1000); }
export function dateToUt(d: Date | number): number { return ((typeof d === 'number' ? d : d.getTime()) - epochMs) / 1000; }
export function fUT(ut: number | null | undefined): string {
  if (ut === null || ut === undefined || !Number.isFinite(ut)) return DASH;
  return utToDate(ut).toISOString().replace('T', ' ').slice(0, 19) + ' UTC';
}
export function fDate(ut: number | null | undefined): string {
  if (ut === null || ut === undefined || !Number.isFinite(ut)) return DASH;
  return utToDate(ut).toISOString().slice(0, 10);
}

export function fPct(v: number | null | undefined, digits = 0): string {
  return v === null || v === undefined || !Number.isFinite(v) ? DASH : `${(v * 100).toFixed(digits)} %`;
}

export function fMoney(v: number | null | undefined): string {
  if (v === null || v === undefined) return DASH;
  const a = Math.abs(v);
  if (a >= 1e6) return `√${(v / 1e6).toFixed(2)}M`;
  if (a >= 1e3) return `√${(v / 1e3).toFixed(1)}k`;
  return `√${v.toFixed(0)}`;
}

export function esc(s: string | null | undefined): string {
  return (s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);
}
