import { execFile } from 'node:child_process';
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { promisify } from 'node:util';

import {
  normalizeSbomDocument,
  serializeSbomDocument,
} from './sbom-normalize.mjs';

const run = promisify(execFile);

/**
 * Regenerate the SBOM into a scratch file and assert it is byte-identical
 * to the committed `sbom.cdx.json` (both normalized the same way). Fails
 * closed if the committed SBOM drifted from `package.json`/
 * `package-lock.json`.
 *
 * @returns {Promise<void>} resolves once the check passes
 */
async function main() {
  const committedPath = path.resolve('../sbom.cdx.json');
  const committed = await readFile(committedPath, 'utf8');

  const scratchDirectory = await mkdtemp(path.join(tmpdir(), 'theme-sbom-'));
  const scratchPath = path.join(scratchDirectory, 'sbom.cdx.json');
  try {
    await run('npx', [
      'cyclonedx-npm',
      '--package-lock-only',
      '--output-file',
      scratchPath,
      '--output-format',
      'JSON',
      '--spec-version',
      '1.6',
    ]);
    const packageJson = JSON.parse(
      await readFile(path.resolve('../package.json'), 'utf8'),
    );
    const generated = JSON.parse(await readFile(scratchPath, 'utf8'));
    const normalized = serializeSbomDocument(
      normalizeSbomDocument(generated, {
        name: packageJson.name,
        version: packageJson.version,
      }),
    );
    if (normalized !== committed) {
      console.error(
        'sbom.cdx.json is stale: regenerating it produces different bytes. ' +
          'Run `npm run sbom:generate` and commit the result.',
      );
      process.exitCode = 1;
      return;
    }
    console.log('sbom.cdx.json is current.');
  } finally {
    await rm(scratchDirectory, { recursive: true, force: true });
  }
}

await main();
