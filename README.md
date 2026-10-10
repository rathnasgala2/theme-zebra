# @rathnasgala2/theme-zebra

A high-contrast presentation theme for Galascribe portable publications
(`@rathnasgala2/template@^3.0.0`): hard edges, black-and-white stripes as the
signature, a yellow accent, offset block shadows. A publication selects it
with `appearance.theme`. This package is a **closed, passive file set**: JSON and CSS
only, no JavaScript, no build step, no runtime dependency, no lifecycle
script. A missing selected theme fails a build rather than silently changing
appearance.

Since 3.0.0 the template owns page layout and component structure. This
theme supplies design values (the 116-token contract) plus a small amount of
skin CSS.

## Files

- `package.json`: exactly `name`, `version`, `license`, `repository`, `files`.
- `theme.json`: validated against `urn:gala:schema:theme-contract:2.0.0`
  (schema package 3.0.0). It carries the identity, `templateRange`
  (`^3.0.0`), the stylesheet and layer projection, the template styling hooks
  the CSS uses (`slotHooks`), both palettes for all 116 tokens (light and dark), asset
  digests, size budgets, and `stylingContractDigest` (the template's styling
  contract 3.0.0).
- `tokens.css`: generated from `theme.json` by `tokens:generate`. Never edit
  it by hand; `tokens:check` fails if it drifts from `theme.json`.
- `components.css`: a small skin layer (card shadow and lift, chip fill and case, avatar radius, strong text)
  that uses tokens only.
- `print.css`: print rules.
- `LICENSE`, `README.md`.

Token values are the owner-approved Zebra look. Edit `theme.json` `tokens`,
then run `tokens:generate` and `digest:generate`; never edit `tokens.css`.

## Commands

Node 24.18.0 (see `.nvmrc`). `tooling/` is private and never packed; every
gate lives in `@rathnasgala2/theme-tooling` and is reached through
`tooling/run.mjs`.

```sh
export GALA_THEME_TOOLING_DIR=../theme-tooling   # checkout of theme-tooling
export GALA_TEMPLATE_DIR=../template             # checkout of the template
npm --prefix tooling run tokens:generate         # theme.json tokens -> tokens.css
npm --prefix tooling run digest:generate         # run twice; second run must change nothing
npm --prefix tooling run verify
```

Re-run `digest:generate` after editing `theme.json`, `tokens.css`,
`components.css` or `print.css`. It recomputes asset digests and the chain
`fixtureDigest`, `evidenceDigest`, `integrity`.

Neither `@rathnasgala2/template` nor `@rathnasgala2/theme-tooling` is an npm
dependency here; both are resolved by path through the two environment
variables above (CI checks them out at pinned commits).

## Rules

CSS is limited to the root scope and the template's published styling hooks,
contains no `@import`, external `url()`, `outline: none` or script
constructs, and every stylesheet is one `@layer` block matching `theme.json`.
Contrast (WCAG 2.2 AA) is checked for both palettes by `contrast:check`.
The shared tooling README describes each gate.
