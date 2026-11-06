import fs from 'node:fs';
import path from 'node:path';
import { summarizeCareer, type CareerSummary } from '@myksp/shared';

export interface SaveInfo { name: string; mode: string | null; title: string | null; modified: string }

/**
 * Read-only access to KSP saves. Never opens a save for writing. Caches the parsed summary per
 * save and invalidates it when the file's mtime changes (KSP rewrites persistent.sfs on save).
 */
export class CareerService {
  private cache = new Map<string, { mtimeMs: number; summary: CareerSummary }>();

  constructor(private savesDir: string) {}

  available() { return fs.existsSync(this.savesDir); }

  list(): SaveInfo[] {
    if (!this.available()) return [];
    const out: SaveInfo[] = [];
    for (const name of fs.readdirSync(this.savesDir)) {
      const file = path.join(this.savesDir, name, 'persistent.sfs');
      if (!fs.existsSync(file)) continue;
      const st = fs.statSync(file);
      // Only the header is needed for the list: read the first 4 KB.
      const fd = fs.openSync(file, 'r');
      const buf = Buffer.alloc(4096);
      fs.readSync(fd, buf, 0, 4096, 0);
      fs.closeSync(fd);
      const head = buf.toString('utf8');
      out.push({
        name,
        mode: /\bMode = (\w+)/.exec(head)?.[1] ?? null,
        title: /\bTitle = (.+)/.exec(head)?.[1]?.trim() ?? null,
        modified: st.mtime.toISOString(),
      });
    }
    return out.sort((a, b) => b.modified.localeCompare(a.modified));
  }

  /** Most recently saved career-mode save, which is the one the player is most likely running. */
  defaultSave(): string | null {
    return this.list().find((s) => s.mode === 'CAREER')?.name ?? null;
  }

  summary(save: string): CareerSummary {
    if (save.includes('/') || save.includes('\\') || save.startsWith('.')) throw new Error('invalid save name');
    const file = path.join(this.savesDir, save, 'persistent.sfs');
    const st = fs.statSync(file);
    const hit = this.cache.get(save);
    if (hit && hit.mtimeMs === st.mtimeMs) return hit.summary;
    const summary = summarizeCareer(fs.readFileSync(file, 'utf8'));
    this.cache.set(save, { mtimeMs: st.mtimeMs, summary });
    return summary;
  }
}
