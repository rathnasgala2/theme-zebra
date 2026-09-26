#!/usr/bin/env node
/**
 * Thin wrapper into `@rathnasgala2/theme-tooling` (THD-M6): every real gate
 * implementation lives there now, shared across all five theme
 * repositories. This file, `package.json`, `.gitignore` and this
 * directory's `README.md` mention are all that remain of a `tooling/`
 * directory that used to carry 25 hand-copied files.
 *
 * Not yet published (see `@rathnasgala2/theme-tooling`'s README "Status:
 * not yet published" for why), so resolution is `GALA_THEME_TOOLING_DIR`
 * only — never a relative default, never `node_modules` — and fails
 * closed with the exact fix when it is unset.
 */

import { spawnSync } from 'node:child_process';
import path from 'node:path';

const override = process.env.GALA_THEME_TOOLING_DIR;
if (!override || override.trim() === '') {
  console.error(
    [
      'GALA_THEME_TOOLING_DIR is not set.',
      '',
      '@rathnasgala2/theme-tooling is not yet published to the npm registry',
      '(publishing it is an owner decision), so every tooling command must be',
      'run with GALA_THEME_TOOLING_DIR pointing at a checkout of it, e.g.:',
      '',
      '  GALA_THEME_TOOLING_DIR=../../theme-tooling npm --prefix tooling run verify',
      '',
      'CI sets this by checking out rathnasgala2/theme-tooling to a pinned',
      'commit alongside this repository (see .github/workflows/ci.yml) and',
      'running `npm ci` there before any tooling command.',
      '',
      'See ../theme-tooling/README.md "Status: not yet published" for the full',
      'explanation and the plan for once it is published.',
    ].join('\n'),
  );
  process.exit(1);
}

const cli = path.join(path.resolve(override), 'bin', 'cli.mjs');
const result = spawnSync(process.execPath, [cli, ...process.argv.slice(2)], {
  stdio: 'inherit',
  cwd: process.cwd(),
  env: process.env,
});
if (result.error) {
  console.error(`theme-tooling: ${result.error.message}`);
  process.exit(1);
}
process.exit(result.status ?? 1);
