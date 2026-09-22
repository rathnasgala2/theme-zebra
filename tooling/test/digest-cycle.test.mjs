import { strict as assert } from 'node:assert';
import { chmod, cp, mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { test } from 'node:test';

import { runCheckScript } from './helpers/run-check.mjs';

const DIGEST_PATTERN = /^sha256:[0-9a-f]{64}$/u;

// The exact closed packed file set `generate-theme-digests.mjs` reads and
// rewrites (its own `packedPaths`/`STYLESHEETS`, and
// `check-package-file-set.mjs`'s `EXPECTED_FILES`) — everything the
// digest cycle and the five local conformance runners it shells out to
// need to run for real against an isolated copy.
const PACKED_FILES = [
  'package.json',
  'README.md',
  'LICENSE',
  'theme.json',
  'tokens.css',
  'components.css',
  'print.css',
];

test('the theme.json digest cycle (fixtureDigest, evidenceDigest, integrity) is idempotent across two consecutive generator runs', async () => {
  // `node --test` runs suites concurrently, and `generate-theme-digests.mjs`
  // rewrites `theme.json` in place. Running it against the real checkout
  // here would race `template-conformance.test.mjs`, which loads
  // `theme.json` through the theme package it points `renderPublication`
  // at, sometimes reading it mid-write (`SyntaxError: Unexpected end of
  // JSON input`). Instead, copy the packed file set into a scratch
  // directory and point every script at it via `THEME_ROOT` (DEC-015
  // name, see `resolve-theme-root.mjs`) so the committed `theme.json` is
  // never mutated by this test.
  const repoRoot = path.join(import.meta.dirname, '..', '..');
  const themeRoot = await mkdtemp(path.join(tmpdir(), 'theme-default-digest-'));
  try {
    for (const relativePath of PACKED_FILES) {
      const destination = path.join(themeRoot, relativePath);
      await cp(path.join(repoRoot, relativePath), destination);
      // The packed-file-set/absence runners assert every packed member is
      // mode 0644; `cp` does not guarantee that survives a copy, so pin it.
      await chmod(destination, 0o644);
    }

    const env = { THEME_ROOT: themeRoot };
    const generate = await runCheckScript('generate-theme-digests.mjs', {
      env,
    });
    assert.ok(generate.passed, generate.output);

    const check = await runCheckScript('generate-theme-digests.mjs', { env });
    assert.ok(check.passed, check.output);

    const themePath = path.join(themeRoot, 'theme.json');
    const theme = JSON.parse(await readFile(themePath, 'utf8'));
    for (const field of [
      'fixtureDigest',
      'evidenceDigest',
      'integrity',
      'stylingContractDigest',
    ]) {
      assert.match(
        theme[field],
        DIGEST_PATTERN,
        `${field} must be a tagged sha256 digest`,
      );
    }
    // No digest appears in its own preimage (DEC-097 §4): the three
    // package-content-dependent digests must be pairwise distinct.
    assert.notEqual(theme.fixtureDigest, theme.evidenceDigest);
    assert.notEqual(theme.evidenceDigest, theme.integrity);
    assert.notEqual(theme.fixtureDigest, theme.integrity);
  } finally {
    await rm(themeRoot, { recursive: true, force: true });
  }
});
