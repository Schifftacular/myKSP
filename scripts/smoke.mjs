// End-to-end smoke test: starts the bridge in SIM mode, loads the built ops center in headless
// Chromium, and checks the room renders, telemetry flows, callouts fire and nothing throws.
// Needs `npm run build` first and Playwright available (`npm i -D playwright` if not installed).
import { spawn } from 'node:child_process';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
let chromium;
try { ({ chromium } = require('playwright')); } catch { console.error('playwright not installed'); process.exit(2); }

const port = 8797;
const bridge = spawn(process.execPath, ['--import', 'tsx', 'services/bridge/src/main.ts'], {
  env: { ...process.env, MYKSP_PORT: String(port), MYKSP_MODE: 'sim', MYKSP_SIM_SPEED: '10', KSP_ROOT: process.env.KSP_ROOT ?? '/nonexistent' },
  stdio: 'inherit',
});
const fail = (m) => { console.error('SMOKE FAIL:', m); bridge.kill(); process.exit(1); };
await new Promise((r) => setTimeout(r, 2500));
const browser = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
const errors = [];
page.on('pageerror', (e) => errors.push(e.message));
await page.goto(`http://127.0.0.1:${port}/`);
await page.waitForTimeout(12000);
const s = await page.evaluate(() => window.__myksp);
console.log(JSON.stringify(s));
if (errors.length) fail(errors.join('; '));
if (!s) fail('no app state exposed');
if (s.link.label !== 'SIM') fail(`expected SIM badge, got ${s.link.label}`);
if (s.events < 2) fail(`expected callouts, got ${s.events}`);
if (s.perf.calls > 150) fail(`draw calls ${s.perf.calls} over budget 150`);
await page.keyboard.press('f');
await page.waitForTimeout(500);
if (!(await page.evaluate(() => document.querySelector('#flat:not([hidden])') !== null))) fail('flat mode did not open');
console.log('SMOKE OK');
await browser.close();
bridge.kill();
process.exit(0);
