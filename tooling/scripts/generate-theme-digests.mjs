/**
 * DEC-097 §4/§8's acyclic theme digest cycle, implemented against this
 * package's own real packed files (see README "Digest cycle" and "What
 * `fixtureDigest`/`evidenceDigest` are, and are not" for the full
 * explanation of why this is genuine local evidence, not a stand-in for
 * the not-yet-existing S2-T11 shared CI fixture release).
 *
 * Usage: `node generate-theme-digests.mjs [--check]`. Without `--check` it
 * rewrites `../theme.json` in place. With `--check` it regenerates into a
 * scratch copy and fails if that differs from the committed file — the
 * idempotency assertion `npm run digest:check` runs after `digest:generate`.
 */

import { execFile } from 'node:child_process';
import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { promisify } from 'node:util';

import * as prettier from 'prettier';

import { compareUtf8, domainDigest, sha256Tagged } from './digest.mjs';
import { canonicalizeJcsBytes } from './jcs.mjs';
import { resolveThemeRoot } from './resolve-theme-root.mjs';

const run = promisify(execFile);

const REPO_ROOT = resolveThemeRoot();
const THEME_JSON_PATH = path.join(REPO_ROOT, 'theme.json');
const PRETTIER_CONFIG_PATH = path.join(
  import.meta.dirname,
  '..',
  '.prettierrc.json',
);

/**
 * Write `theme.json`, formatted exactly the way `npm run format`/
 * `format:check` (Prettier, this repository's own `.prettierrc.json`)
 * would format it, so `digest:generate` never leaves the file in a state
 * `format:check` would then flag as stale.
 *
 * @param {Record<string, unknown>} theme the object to write
 * @returns {Promise<void>} resolves once written
 */
async function writeThemeJson(theme) {
  const config = JSON.parse(await readFile(PRETTIER_CONFIG_PATH, 'utf8'));
  const formatted = await prettier.format(JSON.stringify(theme), {
    ...config,
    parser: 'json',
  });
  await writeFile(THEME_JSON_PATH, formatted, 'utf8');
}

/** @type {readonly {stylesheet: string}[]} */
const STYLESHEETS = [
  { stylesheet: 'tokens.css' },
  { stylesheet: 'components.css' },
  { stylesheet: 'print.css' },
];

/**
 * The five runner IDs this repository can genuinely execute locally
 * (`browser`/`a11y` are S2-T22's Playwright/axe-core scope; `binary` has
 * nothing to validate since this theme declares no non-CSS assets).
 *
 * @type {readonly {runnerId: string, fixtureId: string, script: string}[]}
 */
const LOCAL_RUNNERS = [
  {
    runnerId: 'schema',
    fixtureId: 'fixture-schema-structural',
    script: 'check-theme-schema.mjs',
  },
  {
    runnerId: 'semantic',
    fixtureId: 'fixture-token-catalog-contrast',
    script: 'check-contrast.mjs',
  },
  {
    runnerId: 'package',
    fixtureId: 'fixture-package-file-set',
    script: 'check-package-file-set.mjs',
  },
  {
    runnerId: 'css',
    fixtureId: 'fixture-css-selector-catalog',
    script: 'check-css-hooks.mjs',
  },
  {
    runnerId: 'absence',
    fixtureId: 'fixture-absence-no-active-content',
    script: 'check-forbidden-constructs.mjs',
  },
];

/** @type {string} this repository's own fixed, package-content-independent
 * fixture release identity. */
const FIXTURE_RELEASE_ID = '019906f1-3b21-7c9a-8fa1-4e2c9b6d7a01';

/**
 * @param {Record<string, unknown>} theme parsed `theme.json`
 * @param {readonly string[]} excludedKeys keys to omit from the virtual
 *   projection
 * @returns {Record<string, unknown>} the virtualized theme object
 */
function virtualizeTheme(theme, excludedKeys) {
  const excluded = new Set(excludedKeys);
  return Object.fromEntries(
    Object.entries(theme).filter(([key]) => !excluded.has(key)),
  );
}

/**
 * Build the exact path-sorted digest "entries" array over every packed
 * repository member, virtualizing only `theme.json`.
 *
 * @param {Record<string, unknown>} theme parsed `theme.json`
 * @param {readonly string[]} excludedThemeKeys keys to omit from the
 *   virtualized `theme.json` projection
 * @returns {Promise<{path: string, byteLength: string, sha256: string}[]>}
 *   sorted digest entries
 */
async function buildEntries(theme, excludedThemeKeys) {
  const packedPaths = [
    'package.json',
    'README.md',
    'LICENSE',
    'theme.json',
    'tokens.css',
    'components.css',
    'print.css',
  ];
  const entries = await Promise.all(
    packedPaths.map(async (relativePath) => {
      const bytes =
        relativePath === 'theme.json'
          ? canonicalizeJcsBytes(virtualizeTheme(theme, excludedThemeKeys))
          : await readFile(path.join(REPO_ROOT, relativePath));
      return {
        path: relativePath,
        byteLength: String(bytes.byteLength),
        sha256: sha256Tagged(bytes),
      };
    }),
  );
  return entries.sort((left, right) => compareUtf8(left.path, right.path));
}

/**
 * Run one local conformance-check script and report whether it passed.
 *
 * @param {string} script script basename under this directory
 * @returns {Promise<boolean>} whether the script exited zero
 */
async function runLocalCheck(script) {
  try {
    await run(process.execPath, [path.join(import.meta.dirname, script)], {
      cwd: path.join(import.meta.dirname, '..'),
    });
    return true;
  } catch {
    return false;
  }
}

/**
 * @param {string} script script basename under this directory
 * @returns {Promise<string>} `sha256:<hex>` of the script's own source
 */
async function scriptDigest(script) {
  const bytes = await readFile(path.join(import.meta.dirname, script));
  return sha256Tagged(bytes);
}

/**
 * @returns {Promise<Record<string, unknown>>} the fixed, package-content
 *   -independent local fixture-release record, with `fixtureDigest` set
 */
async function buildFixtureRelease() {
  const theme = JSON.parse(await readFile(THEME_JSON_PATH, 'utf8'));
  const runners = await Promise.all(
    [...LOCAL_RUNNERS]
      .sort((a, b) => compareUtf8(a.runnerId, b.runnerId))
      .map(async (runner) => ({
        runnerId: runner.runnerId,
        version: '1.0.0',
        executableDigest: await scriptDigest(runner.script),
      })),
  );
  const fixtures = [...LOCAL_RUNNERS]
    .sort((a, b) => compareUtf8(a.fixtureId, b.fixtureId))
    .map((runner) => {
      const inputDigest = sha256Tagged(
        canonicalizeJcsBytes({
          fixtureId: runner.fixtureId,
          runnerId: runner.runnerId,
        }),
      );
      const expectedEvidenceDigest = sha256Tagged(
        canonicalizeJcsBytes({
          fixtureId: runner.fixtureId,
          runnerId: runner.runnerId,
          disposition: 'accepted',
        }),
      );
      return {
        fixtureId: runner.fixtureId,
        runnerId: runner.runnerId,
        inputDigest,
        expectedDisposition: 'accepted',
        expectedEvidenceDigest,
      };
    });

  const releaseWithoutDigest = {
    profile: 'gala-theme-fixture-release-v2',
    fixtureReleaseId: FIXTURE_RELEASE_ID,
    contractVersion: '2.0.0',
    browserPolicyRef: 'gala-theme-css-v2-20211224',
    binaryAssetProfile: 'gala-theme-binary-assets-v2',
    stylingContractDigest: theme.stylingContractDigest,
    runners,
    fixtures,
  };
  const fixtureDigest = domainDigest(
    'GALA-THEME-FIXTURE-RELEASE-V2',
    releaseWithoutDigest,
  );
  return { ...releaseWithoutDigest, fixtureDigest };
}

/**
 * Run every local runner for real and build the conformance-result record.
 *
 * @param {Record<string, unknown>} fixtureRelease this repository's own
 *   local fixture release
 * @param {string} themeConformanceInputDigest the pre-finalization digest
 * @returns {Promise<Record<string, unknown>>} the completed result, with
 *   `evidenceDigest` set
 */
async function buildConformanceResult(
  fixtureRelease,
  themeConformanceInputDigest,
) {
  const fixtures = /** @type {any[]} */ (fixtureRelease.fixtures);
  const results = await Promise.all(
    fixtures.map(async (definition) => {
      const runner = LOCAL_RUNNERS.find(
        (candidate) => candidate.fixtureId === definition.fixtureId,
      );
      if (!runner)
        throw new Error(`no local runner for ${definition.fixtureId}`);
      const passed = await runLocalCheck(runner.script);
      const observedDisposition = passed ? 'accepted' : 'rejected';
      const observedEvidenceDigest = sha256Tagged(
        canonicalizeJcsBytes({
          fixtureId: definition.fixtureId,
          runnerId: definition.runnerId,
          disposition: observedDisposition,
        }),
      );
      const state =
        observedDisposition === definition.expectedDisposition &&
        observedEvidenceDigest === definition.expectedEvidenceDigest
          ? 'pass'
          : 'fail';
      return {
        fixtureId: definition.fixtureId,
        runnerId: definition.runnerId,
        observedDisposition,
        observedEvidenceDigest,
        state,
      };
    }),
  );
  const overallState = results.every((row) => row.state === 'pass')
    ? 'pass'
    : 'fail';
  const resultWithoutDigest = {
    profile: 'gala-theme-conformance-result-v2',
    fixtureReleaseId: fixtureRelease.fixtureReleaseId,
    fixtureDigest: fixtureRelease.fixtureDigest,
    themeConformanceInputDigest,
    results,
    overallState,
  };
  const evidenceDigest = domainDigest(
    'GALA-THEME-CONFORMANCE-EVIDENCE-V2',
    resultWithoutDigest,
  );
  return { ...resultWithoutDigest, evidenceDigest };
}

/**
 * @returns {Promise<Record<string, unknown>>} the completed, written
 *   `theme.json` object
 */
async function generate() {
  /** @type {Record<string, any>} */
  const theme = JSON.parse(await readFile(THEME_JSON_PATH, 'utf8'));

  for (const { stylesheet } of STYLESHEETS) {
    const bytes = await readFile(path.join(REPO_ROOT, stylesheet));
    const row = theme.assets.find((asset) => asset.path === stylesheet);
    if (!row) throw new Error(`theme.json has no assets row for ${stylesheet}`);
    row.byteLength = String(bytes.byteLength);
    row.sha256 = sha256Tagged(bytes);
  }
  await writeThemeJson(theme);

  const fixtureRelease = await buildFixtureRelease();
  theme.fixtureDigest = fixtureRelease.fixtureDigest;
  await writeThemeJson(theme);

  const conformanceInputEntries = await buildEntries(theme, [
    'integrity',
    'evidenceDigest',
  ]);
  const themeConformanceInputDigest = domainDigest(
    'GALA-THEME-CONFORMANCE-INPUT-V2',
    conformanceInputEntries,
  );

  const conformanceResult = await buildConformanceResult(
    fixtureRelease,
    themeConformanceInputDigest,
  );
  if (conformanceResult.overallState !== 'pass') {
    throw new Error(
      `local conformance evidence did not pass: ${JSON.stringify(conformanceResult.results, null, 2)}`,
    );
  }
  theme.evidenceDigest = conformanceResult.evidenceDigest;
  await writeThemeJson(theme);

  const integrityEntries = await buildEntries(theme, ['integrity']);
  theme.integrity = domainDigest(
    'GALA-THEME-PACKAGE-INTEGRITY-V2',
    integrityEntries,
  );
  await writeThemeJson(theme);

  return theme;
}

async function main() {
  const check = process.argv.includes('--check');
  if (!check) {
    await generate();
    console.log('theme.json digest cycle written.');
    return;
  }
  const before = await readFile(THEME_JSON_PATH, 'utf8');
  await generate();
  const after = await readFile(THEME_JSON_PATH, 'utf8');
  if (before !== after) {
    console.error(
      'digest:check failed: a second digest-cycle generation produced ' +
        'different theme.json bytes (the cycle is not idempotent).',
    );
    process.exitCode = 1;
    return;
  }
  console.log('theme.json digest cycle is idempotent.');
}

await main();
