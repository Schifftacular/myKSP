// Starts the bridge and the ops-center dev server together. Ctrl-C stops both.
import { spawn } from 'node:child_process';

const procs = [
  spawn('npm', ['run', 'start', '-w', '@myksp/bridge'], { stdio: 'inherit', env: process.env }),
  spawn('npm', ['run', 'dev', '-w', '@myksp/ops-center'], { stdio: 'inherit', env: process.env }),
];
const stop = () => { for (const p of procs) p.kill('SIGTERM'); process.exit(0); };
process.on('SIGINT', stop);
process.on('SIGTERM', stop);
for (const p of procs) p.on('exit', (code) => { if (code) { console.error(`[dev] a process exited with ${code}`); stop(); } });
