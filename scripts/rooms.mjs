// Visits every room in headless Chromium against a bridge in SIM mode and saves a screenshot of
// each (3D and flat). Fails on any page error. Usage: npm run build && node scripts/rooms.mjs [outDir]
// KSP_ROOT may point at a real or copied install for career/craft/body data.
import { spawn } from 'node:child_process';
import { createRequire } from 'node:module';
import fs from 'node:fs';

const require = createRequire(import.meta.url);
const { chromium } = require('playwright');
const out = process.argv[2] ?? 'rooms-out';
const only = process.argv[3]?.split(',');
fs.mkdirSync(out, { recursive: true });
const port = 8798;
const bridge = spawn(process.execPath, ['--import', 'tsx', 'services/bridge/src/main.ts'], {
  env: { ...process.env, MYKSP_PORT: String(port), MYKSP_MODE: process.env.MYKSP_MODE ?? 'sim', MYKSP_SIM_SPEED: '10', KSP_ROOT: process.env.KSP_ROOT ?? '/nonexistent' },
  stdio: ['ignore', 'inherit', 'inherit'],
});
await new Promise((r) => setTimeout(r, 2500));
const browser = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
const page = await browser.newPage({ viewport: { width: 1600, height: 900 } });
const errors = [];
page.on('pageerror', (e) => errors.push(e.message));
page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
page.on('response', (r) => { if (r.status() >= 400) errors.push(`${r.status()} ${r.url()}`); });
await page.goto(`http://127.0.0.1:${port}/#fcr`);
await page.waitForTimeout(6000);
const rooms = only ?? (await page.evaluate(() => [...document.querySelectorAll('#roomsel option')].map((o) => o.value)));
const results = [];
for (const id of rooms) {
  await page.evaluate((id) => { location.hash = id; }, id);
  await page.waitForTimeout(Number(process.env.WAIT ?? 7000));
  const s = await page.evaluate(() => window.__myksp);
  await page.screenshot({ path: `${out}/${id}-3d.png` });
  await page.keyboard.press('2');
  await page.waitForTimeout(1500);
  await page.screenshot({ path: `${out}/${id}-console2.png` });
  await page.keyboard.press('Escape');
  results.push({ id, env: s?.env, calls: s?.perf?.calls, tris: s?.perf?.triangles, ms: s?.perf?.frameMs?.toFixed(2), data: s?.data });
}
await page.keyboard.press('f');
await page.waitForTimeout(1500);
await page.screenshot({ path: `${out}/${rooms[rooms.length - 1]}-flat.png`, fullPage: true });
console.log(JSON.stringify(results, null, 1));
await browser.close();
bridge.kill();
if (errors.length) { console.error('PAGE ERRORS:\n' + [...new Set(errors)].join('\n')); process.exit(1); }
console.log('ROOMS OK');
