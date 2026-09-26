# Changelog

All notable changes to `@rathnasgala2/theme-zebra` are documented here.

## Unreleased

2026-09-25 code-discipline review remediation (THD-H5): this file
previously carried three dated sub-headings under `## Unreleased` above a
`## 2.0.0 - 2026-09-22` heading, even though `2.0.0` has been on the
registry since 2026-09-22 — a state that made no sense read either way
(see the review's own explanation). The three dated entries below are
folded into this one `Unreleased` section (Keep a Changelog: exactly one
`Unreleased` section, dated headings below it), and `2.0.0`'s heading now
carries its actual release date. Everything in this section ships as the
next version; bumping `package.json`'s `version` for that release is an
owner decision (recommended: `2.1.0`, since nothing below is a breaking
change to the token/CSS-hook contract).

### Changed (THD-M10, 2026-09-25)

- Added a `visual` CI job: installs the pinned Chromium binary and runs
  `@rathnasgala2/theme-tooling`'s `visual:check` (Playwright + axe-core,
  320/768/1440px, light/dark), uploading screenshots as a build artifact.
  Deliberately its own job, not part of `verify`: it is the one gate that
  needs a browser binary on disk. Re-pinned the `template` and
  `theme-tooling` sibling checkouts to `d2b2f0f`/`8fd9b36f` (contract
  2.1.0's pseudo-class/icon-property/contrast-pair admission);
  `stylingContractDigest` is unchanged (the contract's `catalogDigest`
  did not change between these two commits). `sbom.cdx.json` regenerated:
  the theme-tooling re-pin adds `axe-core`/`playwright` to its
  devDependency tree this SBOM attributes.

### Changed (THZ-H1, 2026-09-25, second pass)

- Replaced the interim per-row `border-inline-start`-only accent (see the
  earlier THZ-H1 entry below) with true `li:nth-child(odd)`/
  `li:nth-child(even)` row alternation between `color-surface` and
  `color-surface-raised`, now that `@rathnasgala2/theme-tooling` admits a
  pseudo-class between a hook atom and any trailing pseudo-element. The
  `border-inline-start` accent is kept on every `<li>`.

### Changed (THM-M3, contrast retune, 2026-09-25)

- `check-css-hooks.mjs` now asserts `theme.json.slotHooks` set-equality
  against the hook IDs the CSS actually matches in both directions
  (THM-M3): added a real `#main-content:focus-visible` rule so the
  already-declared `landmark-main-content` hook is genuinely used,
  reconciling the one direction that was failing.
- Retuned `color-accent` from `#7a5205`/`#e09a00` to `#8f5a00`/`#bd7800`
  (light/dark) so the tooling's three new contrast pairs
  (`color-accent`/`color-text` ≥ 3:1, `color-accent`/`color-surface`
  ≥ 3:1, `color-surface-raised`/`color-surface` ≥ 1.3:1 — the last already
  cleared without change) pass in both palettes; `color-focus` mirrors
  `color-accent` in the light palette and moved with it.
- Confirmed THZ-M2's `color-accent`/`color-text` pair, now a default
  tooling pair rather than a theme-documented-only floor, passes at the
  retuned value.
- `theme.json` digest cycle regenerated: this is the first commit since
  THZ-H1 where the contrast gate passes, so this is also where
  `components.css`'s asset digest catches up to that commit's bytes.

### Changed (Contract 2.1.0 adoption, 2026-09-25)

- `theme.json.contractVersion` bumped to `2.1.0` and `stylingContractDigest`
  refreshed against the published `catalogDigest`. `templateRange` stays
  `^2.0.0`, which already admits the template's currently published
  `2.0.0` and its unreleased `2.1.0`.
- Removed the `components.css`/`tokens.css` declarations gala-base (the
  template's own `TPL-H3` cascade layer) now supplies: `h1`/`h2`
  `line-height`, `img`'s `max-width: 100%`, and the whole
  `prefers-reduced-motion` block.
- Merged the `hr` and `ul`/`ol` character declarations into their single
  base rule each, instead of a second declaration of the same element
  160+ lines later relying on source order (THZ-M3).
- Removed the forced-colors `#main-content` `outline-color` override: it
  never painted anything of its own (`outline-style` is only ever set by
  gala-base's `:focus-visible` rule) and is now redundant with it.

### Changed (THZ-H2, 2026-09-25)

- Added `background-image: none` to the `forced-colors` `hr` rule:
  `background-image` paints over `background-color` and forced-colors
  mode does not remove author gradients, so the `CanvasText` fallback
  never actually rendered under Windows High Contrast and equivalent
  modes.

### Changed (THZ-H1, 2026-09-25)

- Replaced the fixed-period `repeating-linear-gradient` band behind
  `ul`/`ol` (which drifted out of sync with variable-height `<li>` rows
  within two items) with a single consistent `border-inline-start` accent
  on every `<li>` and a `color-surface-raised` background on the list
  itself. Per-row `:nth-child` alternation is blocked on a gap in this
  package's pinned conformance tooling (`check-css-hooks.mjs` only strips
  trailing pseudo-_elements_, not pseudo-classes, before matching a
  selector against the closed hook catalog), not on anything in this
  repository — see the README "Visual character" section.

### Changed (THZ-M1 + THZ-M2, 2026-09-25)

- Widened `color-surface-raised` (light `#e3e3e3`->`#d3d3d3`, dark
  `#232323`->`#333333`) and the dark palette's `color-accent`
  (`#ffcf66`->`#e09a00`) so both the surface-vs-surface and
  accent-vs-text relationships the theme's character depends on clear a
  documented 1.3:1 floor in both palettes (previously 1.15:1 and,
  measured correctly, 1.34:1 in the dark palette). See the README for the
  measured ratios; the automated contrast gate does not yet check either
  relationship (that runner lives in `@rathnasgala2/theme-tooling`).

### Changed (THZ-L2, 2026-09-25)

- Dropped internal task-packet/finding ids (`S2-T14`, `THD-H1`, `TPL-H2`,
  `THD-C1`) from `components.css`/`tokens.css` comments; kept every
  comment's actual explanation.

### Changed (THD-H1, 2026-09-25)

- Removed the four inert `outline-color`/`outline-width` declaration pairs
  from `components.css` (`#main-content`, `a`, `select`) — `outline-style`
  was never set alongside them, so they painted nothing (the initial value
  of `outline-style` is `none`), and the previous README/CHANGELOG claim
  that they produced a themed visible focus ring was false. A themed ring
  needs `:focus-visible`, unavailable in this template contract version
  (TPL-H2); a single comment in `components.css` documents where it will
  be restored.

### Changed (THD-C1, 2026-09-25)

- Added a bare-root `[data-gala-publication-root]` block (light palette)
  plus a `@media (prefers-color-scheme: dark)` override to `tokens.css`,
  before the two resolved-mode blocks, so every `--gala-*` token still has
  a real value when `data-gala-resolved-color-mode` is not set (no
  JavaScript, a text-mode crawler, or a pre-hydration paint) — previously
  the theme applied no styling at all in that case.

### Changed (THD-M6, 2026-09-25)

- Replaced this repository's own copy of `tooling/scripts`/`tooling/test`
  (25 files, identical across all five theme repositories except one
  package-name literal, and the `tooling-drift.test.mjs` guard that
  skipped in every CI configuration these repositories had, THD-H3) with a
  dependency on the new `@rathnasgala2/theme-tooling` repository, which
  now implements every gate once. `tooling/` here carries only
  `run.mjs` and a trimmed `package.json`. See
  `../theme-tooling/CHANGELOG.md` for what moved and what changed in the
  process (THD-H2/M2/M3/M4/M5).
- Deleted the root `package-lock.json` (THD-L5): the published
  `package.json` has never had a dependency for it to lock.
- Widened the closed `package.json` shape to carry `repository` (THD-H6):
  `npm publish --provenance` derives the source repository from that
  field and refuses to build a provenance statement without it.

### Changed (SCHEMA-REPIN-2.11.0, 2026-09-22)

- `tooling/package.json` re-pins `@rathnasgala2/schemas` from the LOCAL-1
  local tarball (`file:../../../local-packages/rathnasgala2-schemas-2.8.0.tgz`)
  to the exact published registry version `2.11.0`
  (`https://registry.npmjs.org/@rathnasgala2/schemas/-/schemas-2.11.0.tgz`,
  integrity `sha512-5hXxpLaXqEKKhoRLBBEq98rzJQ9K4u3b8nDMt/ZZmV2gL4XRmTOCwjF1U618UJ1CgmFnlifhQWRuDvQQVyFfTA==`).
  This fixes CI, which was failing on every push because the `file:` path
  does not exist on GitHub Actions runners. `urn:gala:schema:theme-contract:2.0.0`
  and the `build-input` root this tooling validates against are
  byte-identical between 2.8.0 and 2.11.0 (contract re-pin packet,
  2026-09-19); `tooling/package-lock.json` and `sbom.cdx.json` regenerated
  accordingly; full `npm run verify` re-run and green.
- Added `tooling/scripts/check-no-local-schema-pin.mjs` (wired into
  `verify` as `schema-pin:check`) so a `file:`/`local-packages` specifier
  for `@rathnasgala2/schemas` can never silently return.

### Changed (THEMES-2.8.0, 2026-09-18)

- `tooling/package.json` pins `@rathnasgala2/schemas` to the packed
  `rathnasgala2-schemas-2.8.0.tgz` tarball (sha256
  `6352293855cdcff9054d43ced876740644f6b45bc813eda3990b646ec9bef563`,
  LOCAL-1), up from 2.6.1; `tooling/package-lock.json` integrity and
  `sbom.cdx.json` regenerated. `urn:gala:schema:theme-contract:2.0.0`, the
  `build-input` root and the published `examples/valid/build-input/canonical.json`
  this tooling validates against are byte-identical between 2.6.1 and 2.8.0;
  the 2.7.0-2.8.0 delta is confined to the deployment roots, the OpenAPI
  bundle and the App catalogs, none of which this repository consumes.

### Added (FOLLOW-UP SUPPLY-CHAIN-JS, 2026-09-17)

- `tooling/scripts/resolve-template-dir.mjs` and `tooling/test/tooling-drift.test.mjs`
  updated to `theme-default`'s canonical copies: `resolveTemplateDir()` now
  also honours `WORKSPACE_ROOT` (DEC-015 name), checked after the existing
  `GALA_TEMPLATE_DIR` override and before the fixed relative default
  (`<WORKSPACE_ROOT>/template`), fixing resolution from a git worktree one
  level deeper than the real checkout (LOCAL-38); `tooling-drift.test.mjs`
  resolves its `theme-default` canonical source the same way and reads
  `@rathnasgala2/theme-zebra`'s own package-identity literal from `package.json` at run time
  instead of a hardcoded name, and skips (with a printed reason) rather than
  failing when `theme-default` cannot be found. Added
  `tooling/test/resolve-template-dir.test.mjs`.

## 2.0.0 - Unreleased (task packet S2-T14)

### Added

- Visual character: Alternating striped listings and rules over a near-monochrome ground with one amber accent: `ul`/`ol` carry a `repeating-linear-gradient` stripe band and `hr` carries an alternating text/accent stripe.
- Initial closed package file set: `package.json` (dependency-free,
  script-free, 4-key closed shape), `theme.json` (all 35 tokens for light
  and dark palettes, `stylesheets`/`cssLayers` three-file shape, the
  51-hook `slotHooks` subset this theme's CSS uses, budgets, and the
  digest chain), `tokens.css`/`components.css`/`print.css`, and a
  compact-JCS `LICENSE` license-evidence file (SPDX `Apache-2.0`).
- WCAG 2.2 AA contrast for every named token pair in both palettes,
  `outline-color`/`outline-width` on every interactive hook (no
  `outline-style` override, no `:focus` pseudo-class available in this
  template contract version — corrected 2026-09-25, THD-H1: these two
  longhands alone never painted a visible ring, and were removed),
  `forced-colors: active` system-color mappings, and a defensive
  `prefers-reduced-motion: reduce` rule.
- `tooling/` local dev/test/SBOM project (private, unpublished, its own
  lockfile) with the closed-hook CSS conformance test, the WCAG contrast
  test, the theme-contract schema test, the closed-package-file-set test,
  the forbidden-constructs absence test, the digest-cycle generator/test,
  the template-conformance byte-equality test (two builds against
  `@rathnasgala2/template`'s `main` branch, consumed by path), and a
  tooling-drift test asserting `tooling/scripts/*.mjs` is byte-identical
  to `theme-default`'s canonical copy except the one documented
  package-identity literal.
- SBOM (`sbom.cdx.json`, CycloneDX 1.6, generated for the published package
  surface — which has zero runtime dependencies).

### Notes

- `fixtureDigest`/`evidenceDigest` are this repository's own genuine local
  conformance evidence (five of the eight DEC-097 runner IDs:
  `schema`/`semantic`/`package`/`css`/`absence`), not the DEC-097-mandated
  _shared_ fixture release/result the not-yet-existing `S2-T11` reusable
  CI workflow will eventually produce and re-issue across all five theme
  packages. See README "What `fixtureDigest`/`evidenceDigest` are, and are
  not."
