import { execFile } from 'node:child_process';
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { promisify } from 'node:util';
import zlib from 'node:zlib';

import { resolveThemeRoot } from './resolve-theme-root.mjs';

const run = promisify(execFile);

/** @type {readonly string[]} the exact closed packed regular-file set,
 * after stripping npm's mandatory `package/` prefix (S2 brief §4). */
const EXPECTED_FILES = [
  'LICENSE',
  'README.md',
  'components.css',
  'package.json',
  'print.css',
  'theme.json',
  'tokens.css',
];

/**
 * Parse a POSIX ustar tar stream into `{path, mode, typeflag, size}` rows,
 * enough to check the closed file set and every member's mode/kind without
 * a third-party tar dependency.
 *
 * @param {Buffer} buffer decompressed tar bytes
 * @returns {{path: string, mode: number, typeflag: string}[]} parsed entries
 */
function parseTar(buffer) {
  /** @type {{path: string, mode: number, typeflag: string}[]} */
  const entries = [];
  let offset = 0;
  while (offset + 512 <= buffer.length) {
    const header = buffer.subarray(offset, offset + 512);
    if (header.every((byte) => byte === 0)) break;
    const name = header.subarray(0, 100).toString('utf8').replace(/\0.*$/s, '');
    const modeText = header
      .subarray(100, 108)
      .toString('utf8')
      .replace(/\0.*$/s, '')
      .trim();
    const sizeText = header
      .subarray(124, 136)
      .toString('utf8')
      .replace(/\0.*$/s, '')
      .trim();
    const typeflag = header.subarray(156, 157).toString('utf8');
    const mode = parseInt(modeText || '0', 8);
    const size = parseInt(sizeText || '0', 8);
    if (name.length > 0) entries.push({ path: name, mode, typeflag });
    const dataBlocks = Math.ceil(size / 512);
    offset += 512 + dataBlocks * 512;
  }
  return entries;
}

async function main() {
  const repoRoot = resolveThemeRoot();
  const scratchDirectory = await mkdtemp(path.join(tmpdir(), 'theme-pack-'));
  try {
    const { stdout } = await run(
      'npm',
      ['pack', '--json', '--pack-destination', scratchDirectory],
      { cwd: repoRoot },
    );
    const [{ filename }] = JSON.parse(stdout);
    const tarGzPath = path.join(scratchDirectory, filename);
    const gzBytes = await readFile(tarGzPath);
    const tarBytes = zlib.gunzipSync(gzBytes);
    const entries = parseTar(tarBytes).filter(
      (entry) => entry.typeflag === '0' || entry.typeflag === '',
    );
    const strippedPaths = entries
      .map((entry) => entry.path.replace(/^package\//, ''))
      .sort();

    let failed = false;
    if (JSON.stringify(strippedPaths) !== JSON.stringify(EXPECTED_FILES)) {
      console.error('closed package file set mismatch.');
      console.error('  expected:', EXPECTED_FILES);
      console.error('  actual:  ', strippedPaths);
      failed = true;
    }
    for (const entry of entries) {
      if ((entry.mode & 0o777) !== 0o644) {
        console.error(
          `packed member ${entry.path} has mode ${entry.mode.toString(8)}, expected 0644`,
        );
        failed = true;
      }
    }

    const packageJson = JSON.parse(
      await readFile(path.join(repoRoot, 'package.json'), 'utf8'),
    );
    const keys = Object.keys(packageJson).sort();
    if (
      JSON.stringify(keys) !==
      JSON.stringify(['files', 'license', 'name', 'version'])
    ) {
      console.error('package.json is not the closed 4-key shape:', keys);
      failed = true;
    }
    if (packageJson.name !== '@rathnasgala2/theme-zebra') {
      console.error('package.json.name mismatch');
      failed = true;
    }
    const sortedFiles = [...packageJson.files].sort((a, b) =>
      Buffer.compare(Buffer.from(a, 'utf8'), Buffer.from(b, 'utf8')),
    );
    if (
      JSON.stringify(sortedFiles) !== JSON.stringify(packageJson.files) ||
      new Set(packageJson.files).size !== packageJson.files.length
    ) {
      console.error('package.json.files is not a unique UTF-8-byte-sorted set');
      failed = true;
    }

    if (failed) {
      process.exitCode = 1;
      return;
    }
    console.log(
      `closed package file set OK: ${strippedPaths.length} regular 0644 files.`,
    );
  } finally {
    await rm(scratchDirectory, { recursive: true, force: true });
  }
}

await main();
