# @rathnasgala2/theme-zebra

One of the five `@rathnasgala2/theme-*` presentation packages for
Galascribe portable publications (`@rathnasgala2/template@^2.0.0`). This
package is a **closed, passive file set**: JSON and CSS only, no
JavaScript, no build step, no runtime dependency, no lifecycle script.
Unlike `@rathnasgala2/theme-default`, this package is never the build's
fallback; a build resolves to this theme only when a publication's own
`appearance.theme` names it.

## What this package is

Per task packet S2-T14 (S2 "author-owned publication" brief §4, authority
DEC-017 / doc 13 `urn:gala:schema:theme-contract:2.0.0` / doc 26 §3 /
DEC-097 §4 — S2-T14 satisfies the identical closed-package/token/hook/
digest-cycle shape `@rathnasgala2/theme-default` (S2-T13) established,
with this theme's own distinct token values and component rules), the
packed regular-file set (after npm's mandatory `package/`
prefix is stripped) is exactly:

```text
package.json
theme.json
tokens.css
components.css
print.css
LICENSE
README.md
```

`utilities.css` is the optional fourth stylesheet in the two valid
`stylesheets`/`cssLayers` shapes; this theme uses the three-file shape
(`tokens.css`, `components.css`, `print.css`) with no `utilities.css` and no
`assets/` members (no binary or SVG passive assets are declared).

- **`package.json`** is DEC-097's closed, dependency-free, script-free
  object: exactly `name`, `version`, `license`, `files` (the unique
  UTF-8-byte-sorted set `["components.css","print.css","theme.json","tokens.css"]`).
  It has no `scripts`, no `dependencies`, no `devDependencies`, no `engines`
  field — those constraints belong to `tooling/` (below), never to the
  published package identity.
- **`theme.json`** binds the theme's schema (`theme-contract:2.0.0`),
  identity, compatible template range (`^2.0.0`), the exact stylesheet/layer
  projection, the closed subset of the template's 64 public styling hooks
  this theme's CSS actually targets, both palettes for all 35 closed
  tokens, the `text/css` asset inventory, declared budgets, and the
  `fixtureDigest`/`evidenceDigest`/`stylingContractDigest`/`integrity`
  digest chain (see "Digest cycle" below).
- **`LICENSE`** is not license _text_; it is compact-JCS (RFC 8785) license
  _evidence_ — `profile: "gala-theme-license-evidence-v2"`, the SPDX
  3.28.0 license-list version/digest this package's toolchain generated
  from, `packageExpression: "Apache-2.0"`, an empty `assetOverrides` (no
  per-asset license override; the whole package is one expression), and one
  `catalogEntries` row carrying the verbatim SPDX Apache-2.0 license text.
  This is the same shape DEC-097 §4/§8 calls the package's "compact-JCS
  `LICENSE` closure."

## Visual character

Alternating striped listings and rules over a near-monochrome ground with one amber accent: `ul`/`ol` carry a `repeating-linear-gradient` stripe band and `hr` carries an alternating text/accent stripe. See `tokens.css` for every token value and
`components.css` for the character-specific component rules
(a `repeating-linear-gradient` stripe band on `ul`/`ol` and `hr`, since this template version's styling contract publishes an empty `pseudoClasses` set (no `:nth-child` selector is available to style individual rows, so the "alternating" motif is a band pattern rather than a per-row rule)); every other component rule is the same
token-driven structure `@rathnasgala2/theme-default` uses.

## Toolchain and how to run locally

Node `24.18.0` / npm `11.16.0` exactly (`.nvmrc`/`.node-version` at the repo
root pin this; the closed `package.json` above cannot carry an `engines`
field, so pinning lives in these files instead, exactly as this repository's
own tooling does).

Because the published `package.json` cannot carry `devDependencies` or
`scripts` (they would be packed into the published tarball, breaking the
closed 4-key shape DEC-097 requires), every lint/test/build/SBOM command for
this repository lives in the **`tooling/`** subdirectory, which is not part
of `theme.json`/`package.json`'s `files` and is never present in the
published tarball (`npm pack` only ever includes `files`-listed paths plus
`package.json`/`README.md`/`LICENSE`):

```sh
source ~/.nvm/nvm.sh && nvm use 24.18.0
npm --prefix tooling install
npm --prefix tooling run verify
```

`tooling/package.json` is a private, unpublished Node project (its own
`"private": true`, its own `package-lock.json` at lockfile version 3) that
declares every dev/test/SBOM dependency this repository needs — ESLint,
Prettier, `postcss`/`postcss-selector-parser` (the CSS-hook conformance
test's pinned parser), `@cyclonedx/cyclonedx-npm` (SBOM), `jscpd`
(duplication), and this workspace's own `@rathnasgala2/schemas` (LOCAL-1:
the packed tarball dependency,
`file:../../local-packages/rathnasgala2-schemas-2.0.0.tgz`). Note what is
**not** an npm dependency here: `@rathnasgala2/template` is consumed
entirely **by path** at test/script run time (see "Consuming the template
by path" below) — a `file:` dependency on a git checkout is not durable
release evidence, and (independent-review finding on this task) pulls that
checkout's own unrelated dependency graph into `tooling`'s own `npm
ls`/SBOM output. With no such dependency declared, `npm ls --all` and
`cyclonedx-npm`'s SBOM generation run clean, no suppression flag needed.

Every test file and `tooling/scripts/*.mjs` conformance script lives
_inside_ `tooling/` (`tooling/test/`, `tooling/scripts/`) precisely so
that plain Node ESM bare-specifier resolution (`import '@rathnasgala2/
schemas'`, climbing from the importing file's own location up through
`node_modules` directories) reaches `tooling/node_modules` without any
extra wiring — no symlink, no `NODE_PATH`, no workspace declaration in the
closed root `package.json`. All `tooling` scripts still operate against
the **parent** repository root (`..`) for the actual package files
(`theme.json`, the stylesheets, `LICENSE`, `README.md`), never against
`tooling/` itself for those.

This repository additionally carries `tooling/test/tooling-drift.test.mjs`
(task packet S2-T14): every `tooling/scripts/*.mjs` file must be
byte-identical to `theme-default`'s own canonical copy, resolved via
`WORKSPACE_ROOT` (DEC-015 name; FOLLOW-UP SUPPLY-CHAIN-JS, 2026-09-17) when
set, else the fixed relative default `../../theme-default`, with exactly one
documented exception — `check-package-file-set.mjs` carries this package's
own `@rathnasgala2/theme-zebra` name literal where it asserts `package.json.name` (read from
this repository's own `package.json` at run time, not hardcoded; that
literal is itself "package identity", the one delta the task packet names);
the test substitutes it back before comparing, so real drift in any script
is still caught at the byte level. `theme-default` is the canonical owner of
`tooling/`; this repository never edits those scripts except through that
one substitution. In a single-repo CI checkout with no `theme-default`
sibling and no `WORKSPACE_ROOT` set, the canonical repository cannot be
found and the test is skipped with a printed reason instead of failing.

`npm run verify` (via `tooling`) runs, in order: `format:check`, `lint`,
`schema:check` (theme.json structural validation against
`urn:gala:schema:theme-contract:2.0.0`), `css:check` (the closed-hook
selector conformance test), `contrast:check` (WCAG 2.2 AA contrast-ratio
assertions for both palettes), `package:check` (closed file-set / `0644`
mode / `package.json` shape), `absence:check` (no JavaScript/executable/
remote-reference constructs anywhere in the packed set), `digest:generate`

- `digest:check` (the digest cycle, idempotent — run twice, byte-identical
  `theme.json`), `test` (the full `node --test` suite, including the
  template conformance test), `duplication`, and `sbom:generate` +
  `sbom:check`.

## The 35-token catalog and both palettes

`theme.json.tokens` carries exactly the 35 keys DEC-097 §4 and the S2 brief
§4 close the catalog to, in the fixed order the `theme-contract:2.0.0`
schema's `tokens` array enforces (`border-width`, the 17 `color-*` keys,
`content-measure`, `focus-width`, the 3 `font-*` keys, `radius-medium`,
`radius-small`, the 6 `space-*` keys, and the 4 `weight-*` keys). Every
`color-*` key differs by palette; every other key's `light`/`dark` value is
identical (its type does not carry a palette-dependent value). Every custom
property is `--gala-<key>`, only ever declared inside `tokens.css`'s
`@layer gala-tokens` block, scoped to the template's own
`resolvedPaletteSelectors` (`[data-gala-publication-root][data-gala-resolved-color-mode="light"]`
/ `="dark"`) — the same selectors published in
`@rathnasgala2/template`'s `contracts/theme-styling-contract.jcs`.

`tooling/test/tokens-contrast.test.mjs` computes WCAG relative-luminance contrast
ratios (the standard sRGB-linearized formula) for every token pair the S2
brief names — body text, muted text, links (unvisited/visited), danger/
warning/success status text, on-accent text, code text, and the border/
focus non-text UI pair — against their governing canvas/surface/accent
color, in **both** palettes independently (passing one palette never
substitutes for the other, per the brief). All body/link/status/code text
pairs clear 4.5:1; the non-text border/focus pairs clear 3:1.

## CSS and the 64-hook styling contract

`tokens.css`, `components.css` and `print.css` are each one outer `@layer`
block (`gala-tokens`, `gala-components`, `gala-print` respectively, matching
`theme.json.cssLayers`) and target **only** the template's published,
closed 64-entry `publicThemeSlotHooks` catalog from
`@rathnasgala2/template`'s `contracts/theme-styling-contract.jcs` — the
landmark/heading/prose/code/control/media/page-kind/slot hooks, always
scoped under the required root compound `[data-gala-publication-root]` (or
its resolved-palette variant), joined only by the contract's four closed
combinators (` `, `>`, `+`, `~`). This version of the template's
styling contract publishes an empty `pseudoClasses` set (no `:focus`/
`:hover`/etc. selector is available to a theme at all in this template
version), so focus-ring color/width customization uses only the
`outline-color`/`outline-width` longhands (never `outline-style`, which
this theme never sets) on interactive hooks — combining with whatever
`:focus-visible` behavior the template's own base layer or the browser's
UA stylesheet supplies, and never suppressing it. `theme.json.slotHooks` is
the exact sorted set of the 51 hook IDs this CSS actually uses (not the
whole 64-hook catalog — only the subset a theme actually styles is
declared, per the S2 brief).

`tooling/test/css-hooks.test.mjs` parses every stylesheet with `postcss` (a pinned
exact version) and `postcss-selector-parser`, and fails the build if any
selector uses an attribute/class/id/type atom that is not one of the
template's published 64 `publicThemeSlotHooks` selector atoms or the
required root/palette scoping compounds.

`tooling/.jscpd.json`'s duplication scan (`jscpd` 3% / 50 tokens,
implementer-rules gate) deliberately excludes `tokens.css`: its light/dark
`@layer gala-tokens` blocks repeat the same 35 custom-property _names_
against different literal color/length/font values by construction (a flat
custom-property declaration has no legitimate way to factor that
repetition out while keeping every value an independently-readable
literal, and it is data — token values — not logic). `components.css` and
`print.css` stay in scope and are refactored (grouped selectors, e.g.
`h4, h5` and the three muted-text slot hooks) wherever a real duplicate
declaration block existed.

## Accessibility posture

- **Contrast**: see above; asserted by test, both palettes, WCAG 2.2 AA.
- **Focus visibility**: no `outline: none`/`outline-style: none` anywhere;
  every interactive hook (`a`, `select`, `#gala-appearance-color-mode`,
  `#main-content`) carries theme-token `outline-color`/`outline-width` so a
  visible ring uses this theme's own accessible focus color at whatever
  width the UA/template's focus-visible behavior renders it.
- **`forced-colors: active`**: `components.css` maps links, the main-content
  focus ring, select borders and the divider rule to system colors
  (`LinkText`, `Highlight`, `ButtonBorder`, `CanvasText`) so meaning survives
  a forced-colors palette, per the brief's "forced-colors mode takes
  precedence where the browser supplies system colors."
- **`prefers-reduced-motion: reduce`**: collapses any animation/transition
  duration to effectively zero at the root scope (defensive; this theme
  declares no animations or transitions of its own, so this rule has no
  visible effect today but keeps the obligation explicit and testable if a
  future revision adds one).
- **Zoom/reflow**: this theme sets no fixed pixel widths that would prevent
  320px-wide reflow (`main`'s `max-width` is a `rem` content measure, never
  a lower bound); Playwright-driven 400% zoom/reflow, keyboard-journey and
  axe-core runs are S2-T22, explicitly out of this task's scope.

## Digest cycle (`fixtureDigest`, `evidenceDigest`, `integrity`)

`scripts/generate-theme-digests.mjs` (in `tooling/`, devDependency-only,
never packed) implements DEC-097 §4/§8's acyclic digest construction using
the exact domain-separated SHA-256 formulas DEC-097 §8 publishes
(`GALA-THEME-FIXTURE-RELEASE-V2\0`, `GALA-THEME-CONFORMANCE-INPUT-V2\0`,
`GALA-THEME-CONFORMANCE-EVIDENCE-V2\0`, `GALA-THEME-PACKAGE-INTEGRITY-V2\0`)
over RFC 8785 JCS-canonicalized entries, reproduced independently in this
repository (the formulas are DEC-097's public specification; the reference
implementation in `@rathnasgala2/schemas`'s internal
`theme-composition-semantics.js` is not part of that package's published
`exports` map, so it cannot be imported as a dependency — only its
documented algorithm is reused here):

1. **`stylingContractDigest`** is copied verbatim from
   `@rathnasgala2/template`'s published `contracts/theme-styling-contract.jcs`
   `catalogDigest` field — the same value every theme package targeting
   this template version carries.
2. **`fixtureDigest`** is computed over a small **local** conformance
   fixture release this repository defines itself (`schema`, `semantic`,
   `package`, `css`, `absence` runners — see "What `fixtureDigest`/
   `evidenceDigest` are, and are not" below) — independent of this
   package's own file bytes.
3. **`themeConformanceInputDigest`** (an intermediate value, not itself a
   `theme.json` field) is computed over the packed package projection with
   `theme.json`'s `integrity` and `evidenceDigest` fields both absent.
4. **`evidenceDigest`** is computed over a conformance-result record
   naming `fixtureDigest` and `themeConformanceInputDigest`, once every
   local runner in step 2 has actually run against this package's real
   files and recorded a real pass.
5. **`integrity`** is computed last, over the packed package projection
   with only `integrity` itself absent (so it is the only field excluded
   from its own preimage) — the completed `theme.json` (steps 1–4 already
   written) is what gets hashed.

Running `npm --prefix tooling run digest:generate` twice in a row on an
unchanged source tree reproduces byte-identical `theme.json` bytes both
times (idempotent; no wall-clock, machine-identity, or non-deterministic
input participates) — `tooling/test/digest-cycle.test.mjs` asserts this directly,
independent of the whole-repository two-build-cycle conformance test
below.

### What `fixtureDigest`/`evidenceDigest` are, and are not

DEC-097 §4 describes `fixtureDigest`/`evidenceDigest` as binding "the exact
shared fixture release" and "the retained conformance result" produced by
the reusable `infra/.github/workflows/theme-release.yml` runner
(S2-T11: `schema`/`semantic`/`package`/`css`/`binary`/`browser`/`a11y`/
`absence`). That workflow is infra/CI scope, `REMOTE-ONLY` per the S2
digest, and does not exist in this local environment yet (LOCAL-4: do not
fabricate remote evidence). The digests this package ships are therefore
**genuine, locally-computed evidence from this repository's own real local
runners** (`schema`, `semantic`, `package`, `css`, `absence` — five of the
eight runner IDs; `binary` has nothing to validate since this theme
declares no non-CSS assets, and `browser`/`a11y` are Playwright/axe-core,
explicitly S2-T22's task, not this one) — not a fabricated stand-in for the
eventual shared CI fixture release, and not the DEC-097-mandated _shared_
release (which by definition must be identical bytes across all five theme
packages; this package's fixture release is this package's own, until
S2-T11 exists and re-issues a real shared one). This is called out
explicitly here, in `theme.json`'s own generation script, and in the
report handed to the orchestrator, so it is never mistaken for `S2-T11`
CI evidence.

## Consuming the template by path

`tooling`'s conformance test (`tooling/test/template-conformance.test.mjs`)
needs a real `@rathnasgala2/template@2.0.0` build to render against. Locally,
no registry-published `@rathnasgala2/template` tarball exists yet (LOCAL-4),
and — per independent review of an earlier version of this package — a
`file:` npm dependency on a git checkout is not durable release evidence
either (a worktree in particular is explicitly temporary: "never run `git
worktree remove`; the orchestrator does that after merge" governs the
_orchestrator's_ lifecycle for it, not this package's own dependency
graph, and pulling that checkout's own independent lockfile/`node_modules`
into `tooling`'s tree is exactly what polluted `npm ls`/SBOM output
before this fix).

So `@rathnasgala2/template` is resolved **by path, at test/script run
time, never as an npm dependency**: `tooling/scripts/resolve-template-dir.mjs`
exports `resolveTemplateDir()`, which returns `$GALA_TEMPLATE_DIR` if that
environment variable is set to a non-empty value, else the default
`../../template` resolved against the current working directory (every
consumer of this helper — the `tooling` npm scripts, and `node --test`
invoked from `tooling` — always runs with `tooling/` as its cwd, so that
default is the sibling checkout `/Users/anand/ws/galascribe/v2/template`,
matching how `publish-kernel`/`publish-action` will eventually resolve a
theme/template package directory from an adapter-local extraction, not
from `node_modules`). Every consumer (`check-css-hooks.mjs`,
`tooling/test/fixtures/rich-build-input.mjs`, `tooling/test/template-conformance.test.mjs`)
reads `contracts/*.jcs` directly off disk under that directory, and
dynamically `import()`s its `src/core/index.js` (the exact file its own
`exports["."]` maps to) by file URL for `renderPublication`/
`computeBodyDigest` — no test-internal helper or private module of the
template repository is imported, and no template code ever appears in
`tooling`'s own `npm ls`/SBOM output.

Set `GALA_TEMPLATE_DIR` to override the default — for example, while the
sibling checkout's currently-checked-out branch does not yet carry the
template revision this package's tests need (as of this writing, the
primary `v2/template` checkout has `slice/S2-T04-output-security` checked
out, which predates S2-T12; `git -C /Users/anand/ws/galascribe/v2/template
switch main` — or waiting for that checkout to move to `main`/a
post-S2-T12 branch — resolves this without any override). This package's
own verification was run with
`GALA_TEMPLATE_DIR=/Users/anand/ws/galascribe/v2/.worktrees/template-main`
for exactly that reason; that worktree is otherwise unreferenced by any
committed file in this repository.

`resolveTemplateDir()` also honours `WORKSPACE_ROOT` (DEC-015 name; FOLLOW-UP
SUPPLY-CHAIN-JS, 2026-09-17), checked after `GALA_TEMPLATE_DIR` and before the
fixed relative default: when set to a non-empty value, the template checkout
resolves as `<WORKSPACE_ROOT>/template` instead of the fixed relative
`../../template`. This is the fix for running `tooling`'s tests/scripts from a
location where that fixed relative default cannot reach the sibling
`template` checkout — a git worktree one level deeper than the real checkout
(LOCAL-38) — without needing a one-off `GALA_TEMPLATE_DIR`: set
`WORKSPACE_ROOT=/Users/anand/ws/galascribe/v2` once and every sibling
resolves correctly. `tooling/test/tooling-drift.test.mjs` resolves its own
`theme-default` canonical source the same way.

The conformance test builds its own build-input fixture in
`tooling/test/fixtures/rich-build-input.mjs`, based on
`@rathnasgala2/schemas`'s own published `examples/valid/build-input/canonical.json`
(that example's `appearance.theme` already names
`@rathnasgala2/theme-zebra@2.0.0`), with a real render-policy identity
(reproducing `@rathnasgala2/template`'s own
`GALA-RENDER-POLICY-V2\0`-domain-separated digest over its published
`contracts/render-policy.jcs`, since that computation is not part of the
template's public `exports`) and a real `bodyDigest` (via the template's
own exported `computeBodyDigest`). It calls `renderPublication(buildInput,
{ outputDirectory, workDirectory, sourceDirectory, themeDirectory: <this
package's own repo root>, provenance })` twice into two fresh output
directories and asserts every rendered route/asset file is byte-identical
between the two runs.

## Forbidden constructs

`tooling/test/forbidden-constructs.test.mjs` and `tooling/test/package-file-set.test.mjs`
together assert: no `.js`/`.mjs`/`.cjs`/`.ts`/`.tsx`/`.jsx`/`.wasm`/`bin`
file anywhere in the packed set; no `<script>`, `javascript:`, `expression(`,
`@import`, external `url(...)` (only package-relative/normalized-path
`url()` values would be admitted, and this theme declares none), or
`-moz-binding` construct in any packed CSS byte; every packed member is a
regular `0644` file; `package.json` carries no `dependencies` and no
`scripts`.

## Not in scope here

- `@rathnasgala2/theme-default` (S2-T13, the canonical owner of `tooling/`)
  and the other three sibling themes (`theme-amaze`, `theme-flashy`, `theme-minimal`) — S2-T14
  covers all four together, each its own repository and commit.
- `infra/.github/workflows/theme-release.yml` and this repository's own
  `.github/workflows/release.yaml` caller — S2-T11 (infra, REMOTE-ONLY).
- Playwright/axe-core browser conformance, no-JS/keyboard/400%-zoom
  journeys, manual AT scripts — S2-T22.
