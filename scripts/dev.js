/**
 * StormLink dev runner — boots the Express API and the Next.js client together.
 * Usage: node scripts/dev.js
 */
import { spawn } from 'node:child_process';

const services = [
  { name: 'api', cwd: 'server', color: '\x1b[38;5;81m', args: ['run', 'dev'] },
  { name: 'web', cwd: 'client', color: '\x1b[38;5;141m', args: ['run', 'dev'] },
];

const reset = '\x1b[0m';

for (const svc of services) {
  const child = spawn('npm', svc.args, {
    cwd: new URL(`../${svc.cwd}/`, import.meta.url).pathname,
    env: process.env,
    stdio: ['ignore', 'pipe', 'pipe'],
    shell: process.platform === 'win32',
  });

  const prefix = `${svc.color}[${svc.name}]${reset} `;
  const pipe = (stream) =>
    stream.on('data', (chunk) => {
      for (const line of chunk.toString().split('\n')) {
        if (line.trim()) process.stdout.write(prefix + line + '\n');
      }
    });

  pipe(child.stdout);
  pipe(child.stderr);

  child.on('exit', (code) => {
    console.log(`${prefix} exited with code ${code}`);
    process.exit(code ?? 0);
  });
}

process.on('SIGINT', () => process.exit(0));
process.on('SIGTERM', () => process.exit(0));
