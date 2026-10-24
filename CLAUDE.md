# Repository instructions

## Purpose

Own one of the six generation-4 `@rathnasgala2/theme-*` presentation packages —
`@rathnasgala2/theme-zebra` (hard edges and black-and-white stripes over a near-monochrome ground with one yellow accent) —
selected by a publication's own `appearance.theme`, never the build
fallback (that is `@rathnasgala2/theme-default`, S2-T13). This repository
never owns rendering, deployment, provider credentials, or any other
theme's presentation bytes (S2 brief §4; task packet S2-T14).

## The one hard rule

The **portable package** (`package.json`, `theme.json`, `tokens.css`,
`components.css`, `print.css`, `LICENSE`, `README.md`) is a closed, passive
file set. Never add:

- Any JavaScript, TypeScript, JSX, WASM, executable binary, or `bin` entry.
- A `scripts`, `dependencies`, `devDependencies`, or `engines` field to the
  root `package.json` — it is exactly `{name, version, license, repository, files}`.
  All tooling lives in `tooling/`, which is never part of `files` and is
  never packed.
- `utilities.css`, or any file outside the closed set the brief names
  (`.github/workflows/release.yaml` is source-validated but never packed
  either).
- Any CSS selector that is not the root/palette scope or one of
  `@rathnasgala2/template`'s published styling-contract hooks
  (`contracts/theme-styling-contract.jcs` in the template repository) —
  `css:check` in `@rathnasgala2/theme-tooling` enforces this.
- `@import`, an external-origin `url(...)`, or any other remote reference
  in CSS.

## Releasing

A release is a version bump in `package.json` plus a `## <version> - <date>`
heading in `CHANGELOG.md`, pushed to main. `.github/workflows/release.yaml`
(byte-identical in all six theme repositories) then runs the complete gate and
publishes with npm trusted publishing. A push that changes a packed path
without a version that is new on npm fails the run; it never skips. Do not add
`publishConfig` to `package.json`: the closed shape above forbids it, and the
workflow passes `--access public --provenance` itself.

## Commands

```sh
source ~/.nvm/nvm.sh && nvm use 24.18.0
npm --prefix tooling install
npm --prefix tooling run verify
```

`tooling/` (private, never packed) only dispatches into
`@rathnasgala2/theme-tooling` (`GALA_THEME_TOOLING_DIR`); the tests and gates
live in that repository. `theme.json` `tokens` are the source of truth for
`tokens.css`: edit tokens, then run `npm --prefix tooling run tokens:generate`
(`tokens:check` fails on drift). Re-run
`npm --prefix tooling run digest:generate` after editing
`theme.json`/`tokens.css`/`components.css`/`print.css` — it recomputes `theme.json`'s
asset byte-lengths/digests and the whole digest chain
(`fixtureDigest`/`evidenceDigest`/`integrity`) and is idempotent (run it
twice; `digest:check` fails if the second run changes anything).
The schema and `@rathnasgala2/template` are never npm dependencies — they are
resolved from sibling checkouts through `$GALA_SCHEMA_DIR` and
`$GALA_TEMPLATE_DIR`; see README "Commands".

## What never goes here

`@rathnasgala2/theme-default` (S2-T13, canonical owner of `tooling/`) and
the other four sibling themes, including Editorial, the reusable release workflow or
this repository's own workflow caller (S2-T11, infra, REMOTE-ONLY),
Playwright/axe-core browser conformance (S2-T22), template rendering
logic, or `publish` kernel/adapter logic.

## Review checklist

Confirm: `package.json` still has no scripts/dependencies/engines;
`theme.json` validates as contract 4 with the exact Developer composition
(all 116 tokens, both palettes, exact order) via the sibling schema checkout;
every stylesheet is
one outer matching `@layer` block; every selector resolves only to the
template's published hook catalog; WCAG 2.2 AA contrast holds in both
palettes; no `outline: none`/`outline-style: none`/`@import`/external
`url()`/script/executable construct anywhere; the digest cycle is
idempotent across two consecutive generator runs; the template
conformance test's two-build byte-equality assertion passes; and every
gate in `npm --prefix tooling run verify` passes twice in a row with a
clean `git status --porcelain` on the parent repository.
