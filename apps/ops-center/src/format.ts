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
 * RSS/RP-1 career UT 0 is 1951-01-01 00:00 UTC (RSSDateTime). Assumption recorded in the design
 * doc; sandbox saves may use another epoch.
 */
export const RSS_EPOCH_MS = Date.UTC(1951, 0, 1);
export function fUT(ut: number | null | undefined): string {
  if (ut === null || ut === undefined || !Number.isFinite(ut)) return DASH;
  const d = new Date(RSS_EPOCH_MS + ut * 1000);
  return d.toISOString().replace('T', ' ').slice(0, 19) + ' UTC';
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
