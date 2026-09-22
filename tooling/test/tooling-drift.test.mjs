/**
 * S2-T14 drift gate: `tooling/scripts/*.mjs` in every theme repository must
 * stay byte-identical to `theme-default`'s canonical copy, with exactly one
 * documented exception — `check-package-file-set.mjs` carries this
 * package's own name literal where it asserts `package.json.name`, which is
 * itself "package identity", the one delta the S2-T14 task packet names.
 * Substituting that literal back before comparing proves the rest of the
 * file, and every other script, is unmodified — so drift is caught at the
 * byte level, not just "looks similar". The package-identity literal is
 * read from each repository's own `package.json` at run time (never
 * hardcoded per repository) so this test file itself is byte-identical
 * across every theme repository, `theme-default` included.
 *
 * `theme-default` is the canonical source, resolved via `WORKSPACE_ROOT`
 * (DEC-015 name; FOLLOW-UP SUPPLY-CHAIN-JS, 2026-09-17) when set, else the
 * fixed relative default `../../theme-default` from this repository's own
 * `tooling/test/` directory. In `theme-default` itself this resolves back
 * to this repository's own `tooling/scripts` (the "self case"): the
 * comparison still runs for real, trivially passing since both sides are
 * the same files, rather than being skipped. In a single-repo CI checkout
 * of one of the other four themes, with no `theme-default` sibling and no
 * `WORKSPACE_ROOT` set, the canonical repository cannot be found; the test
 * is skipped with a printed reason instead of failing.
 */

import { strict as assert } from 'node:assert';
import { readFile, readdir } from 'node:fs/promises';
import path from 'node:path';
import { test } from 'node:test';

const REPO_ROOT = path.join(import.meta.dirname, '..', '..');
const THIS_SCRIPTS_DIR = path.join(REPO_ROOT, 'tooling', 'scripts');

/**
 * Resolve the workspace root containing the sibling theme repositories:
 * `WORKSPACE_ROOT` (DEC-015 name) when set to a non-empty string, else the
 * fixed relative default one level above this repository's own checkout.
 *
 * @returns {string} the absolute workspace root directory
 */
function resolveWorkspaceRoot() {
  const override = process.env.WORKSPACE_ROOT;
  return path.resolve(
    override && override.length > 0 ? override : path.join(REPO_ROOT, '..'),
  );
}

const CANONICAL_REPO_DIR = path.join(resolveWorkspaceRoot(), 'theme-default');
const CANONICAL_SCRIPTS_DIR = path.join(
  CANONICAL_REPO_DIR,
  'tooling',
  'scripts',
);

test('tooling/scripts/*.mjs is byte-identical to theme-default/tooling/scripts, except the named package-identity literal', async (t) => {
  const ourPackageJson = JSON.parse(
    await readFile(path.join(REPO_ROOT, 'package.json'), 'utf8'),
  );

  /** @type {{name: string}} */
  let canonicalPackageJson;
  try {
    canonicalPackageJson = JSON.parse(
      await readFile(path.join(CANONICAL_REPO_DIR, 'package.json'), 'utf8'),
    );
  } catch {
    t.skip(
      `theme-default not found at ${CANONICAL_REPO_DIR}; set WORKSPACE_ROOT ` +
        'to the directory containing the sibling theme repositories to run ' +
        'this drift check',
    );
    return;
  }

  const ourFiles = (await readdir(THIS_SCRIPTS_DIR)).sort();
  const canonicalFiles = (await readdir(CANONICAL_SCRIPTS_DIR)).sort();
  assert.deepEqual(
    ourFiles,
    canonicalFiles,
    'the set of tooling/scripts files must match theme-default exactly',
  );

  for (const file of ourFiles) {
    const ours = await readFile(path.join(THIS_SCRIPTS_DIR, file), 'utf8');
    const canonical = await readFile(
      path.join(CANONICAL_SCRIPTS_DIR, file),
      'utf8',
    );
    if (
      file === 'check-package-file-set.mjs' &&
      ourPackageJson.name !== canonicalPackageJson.name
    ) {
      assert.equal(
        ours
          .split(`'${ourPackageJson.name}'`)
          .join(`'${canonicalPackageJson.name}'`),
        canonical,
        `${file} must be byte-identical to theme-default's copy once its ` +
          'own package-identity literal is substituted back',
      );
      assert.notEqual(
        ours,
        canonical,
        `${file} is expected to actually carry this package's own name literal`,
      );
      continue;
    }
    assert.equal(
      ours,
      canonical,
      `${file} must be byte-identical to theme-default/tooling/scripts/${file}`,
    );
  }
});
