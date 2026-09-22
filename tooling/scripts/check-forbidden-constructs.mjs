/**
 * Absence runner: no JavaScript/TypeScript/executable/remote-reference
 * construct anywhere in the closed *packed* file set (S2 brief §4:
 * "Forbidden, and enforced by the conformance gate: JavaScript,
 * TypeScript, JSX, HTML templates, server code, WebAssembly, executable
 * binaries, package lifecycle scripts, active SVG, remote imports, ...
 * remote fonts and undeclared network URLs. CSS URLs resolve only to
 * package-owned validated assets through normalized contained paths.").
 *
 * Deliberately scoped to exactly the packed set
 * (`package.json`/`README.md`/`LICENSE`/`theme.json`/the three
 * stylesheets), never the whole repository tree — `test/` and `tooling/`
 * are real `.mjs` dev tooling, never packed, and are out of scope for this
 * runner (`check-package-file-set.mjs` independently asserts the packed
 * tarball's own file set is exactly this closed list).
 */

import { readFile, stat } from 'node:fs/promises';
import path from 'node:path';

import { resolveThemeRoot } from './resolve-theme-root.mjs';

const REPO_ROOT = resolveThemeRoot();
const PACKED_FILES = [
  'package.json',
  'README.md',
  'LICENSE',
  'theme.json',
  'tokens.css',
  'components.css',
  'print.css',
];
const CSS_FILES = ['tokens.css', 'components.css', 'print.css'];
const CSS_FORBIDDEN_PATTERNS = [
  { pattern: /<script/i, label: '<script' },
  { pattern: /javascript:/i, label: 'javascript: URL scheme' },
  { pattern: /expression\s*\(/i, label: 'expression()' },
  { pattern: /@import/i, label: '@import' },
  { pattern: /-moz-binding/i, label: '-moz-binding' },
  { pattern: /url\(\s*['"]?(https?:)?\/\//i, label: 'external-origin url()' },
];

async function main() {
  let failed = false;

  for (const relativePath of PACKED_FILES) {
    const filePath = path.join(REPO_ROOT, relativePath);
    const stats = await stat(filePath);
    if (!stats.isFile()) {
      console.error(`${relativePath} is not a regular file`);
      failed = true;
      continue;
    }
    if ((stats.mode & 0o777) !== 0o644) {
      console.error(
        `${relativePath} has mode ${(stats.mode & 0o777).toString(8)}, expected 0644`,
      );
      failed = true;
    }
  }

  for (const stylesheet of CSS_FILES) {
    const text = await readFile(path.join(REPO_ROOT, stylesheet), 'utf8');
    for (const { pattern, label } of CSS_FORBIDDEN_PATTERNS) {
      if (pattern.test(text)) {
        console.error(`${stylesheet} contains a forbidden construct: ${label}`);
        failed = true;
      }
    }
    if (text.charCodeAt(0) === 0xfeff) {
      console.error(`${stylesheet} begins with a byte-order mark`);
      failed = true;
    }
  }

  const packageJson = JSON.parse(
    await readFile(path.join(REPO_ROOT, 'package.json'), 'utf8'),
  );
  if ('scripts' in packageJson || 'dependencies' in packageJson) {
    console.error(
      'package.json carries a forbidden scripts/dependencies field',
    );
    failed = true;
  }

  if (failed) {
    process.exitCode = 1;
    return;
  }
  console.log('no forbidden construct found in the packed file set.');
}

await main();
