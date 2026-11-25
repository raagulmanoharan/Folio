import { spawnSync } from 'node:child_process';
import { mkdirSync } from 'node:fs';

// Keep CLI state inside writable, task-specific caches. Do not change HOME.
const env = {
  ...process.env,
  // npm run injects its own default here; it can point at a read-only HOME.
  npm_config_cache: '/tmp/jarwiz-v5-npm',
  HYPERFRAMES_CONFIG_DIR: process.env.HYPERFRAMES_CONFIG_DIR || '/tmp/jarwiz-v5-hyperframes-config',
  HYPERFRAMES_CACHE_DIR: process.env.HYPERFRAMES_CACHE_DIR || '/tmp/jarwiz-v5-hyperframes-cache',
  HYPERFRAMES_BROWSER_PATH: process.env.HYPERFRAMES_BROWSER_PATH || '/usr/bin/chromium',
  HYPERFRAMES_NO_TELEMETRY: '1',
  XDG_CACHE_HOME: '/tmp/jarwiz-v5-user-cache',
};
for (const key of ['npm_config_cache', 'HYPERFRAMES_CONFIG_DIR', 'HYPERFRAMES_CACHE_DIR', 'XDG_CACHE_HOME']) {
  mkdirSync(env[key], { recursive: true, mode: 0o700 });
}
const result = spawnSync('npx', ['--yes', 'hyperframes@0.9.59', ...process.argv.slice(2)], { env, stdio: 'inherit' });
if (result.error) throw result.error;
process.exit(result.status ?? 1);
