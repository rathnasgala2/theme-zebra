# Repository instructions

## Purpose

Own one of the five `@rathnasgala2/theme-*` presentation packages —
`@rathnasgala2/theme-zebra` (alternating striped listings and rules over a near-monochrome ground with one amber accent) —
selected by a publication's own `appearance.theme`, never the build
fallback (that is `@rathnasgala2/theme-default`, S2-T13). This repository
never owns rendering, deployment, provider credentials, or any other
theme's presentation bytes (S2 brief §4; task packet S2-T14).

## The one hard rule

The **published package** (`package.json`, `theme.json`, `tokens.css`,
`components.css`, `print.css`, `LICENSE`, `README.md`) is a closed, passive
file set. Never add:

- Any JavaScript, TypeScript, JSX, WASM, executable binary, or `bin` entry.
- A `scripts`, `dependencies`, `devDependencies`, or `engines` field to the
  root `package.json` — it is exactly `{name, version, license, files}`.
  All tooling lives in `tooling/`, which is never part of `files` and is
  never packed.
- `utilities.css`, or any file outside the closed set the brief names
  (`.github/workflows/release.yaml`, once added by a later task, is
  source-validated but never packed either).
- Any CSS selector that is not the root/palette scope or one of
  `@rathnasgala2/template`'s published 64 `publicThemeSlotHooks` selector
  atoms (`contracts/theme-styling-contract.jcs` in the template repository)
  — `tooling/test/css-hooks.test.mjs` enforces this with a pinned
  `postcss`/`postcss-selector-parser`.
- `@import`, an external-origin `url(...)`, or any other remote reference
  in CSS.

## Commands

```sh
source ~/.nvm/nvm.sh && nvm use 24.18.0
npm --prefix tooling install
npm --prefix tooling run verify
```

`tooling/test/tooling-drift.test.mjs` asserts every `tooling/scripts/*.mjs`
file is byte-identical to `theme-default`'s canonical copy, except the
one documented package-identity literal in `check-package-file-set.mjs`
— never diverge those scripts beyond that one substitution.

`tooling/package.json` (private, unpublished, its own lockfile) holds every
dev/test/SBOM dependency; test files and conformance scripts live inside
`tooling/` (`tooling/test/`, `tooling/scripts/`) so bare-specifier
resolution reaches `tooling/node_modules` with no extra wiring. Re-run
`npm --prefix tooling run digest:generate` after editing
`tokens.css`/`components.css`/`print.css` — it recomputes `theme.json`'s
asset byte-lengths/digests and the whole digest chain
(`fixtureDigest`/`evidenceDigest`/`integrity`) and is idempotent (run it
twice; `digest:check` fails if the second run changes anything).
`@rathnasgala2/template` is never an npm dependency — it is resolved by
path at test/script run time via `tooling/scripts/resolve-template-dir.mjs`
(`$GALA_TEMPLATE_DIR`, defaulting to the sibling `../../template` checkout);
see README "Consuming the template by path" before changing that.

## What never goes here

`@rathnasgala2/theme-default` (S2-T13, canonical owner of `tooling/`) and
the other three sibling themes (S2-T14), the reusable release workflow or
this repository's own workflow caller (S2-T11, infra, REMOTE-ONLY),
Playwright/axe-core browser conformance (S2-T22), template rendering
logic, or `publish` kernel/adapter logic.

## Review checklist

Confirm: `package.json` still exactly 4 keys with no scripts/dependencies;
`theme.json` validates against `urn:gala:schema:theme-contract:2.0.0`
(all 35 tokens, both palettes, exact order) via
`@rathnasgala2/schemas`'s own `validateGalaDocument`; every stylesheet is
one outer matching `@layer` block; every selector resolves only to the
template's published 64-hook catalog; WCAG 2.2 AA contrast holds in both
palettes; no `outline: none`/`outline-style: none`/`@import`/external
`url()`/script/executable construct anywhere; the digest cycle is
idempotent across two consecutive generator runs; the template
conformance test's two-build byte-equality assertion passes; and every
gate in `npm --prefix tooling run verify` passes twice in a row with a
clean `git status --porcelain` on the parent repository.
