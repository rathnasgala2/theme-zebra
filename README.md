# @rathnasgala2/theme-zebra

A high-contrast Developer theme for Galascribe portable publications using
`@rathnasgala2/template@^4.4.0`: hard edges, black-and-white stripes, a yellow
accent, and offset block shadows. This package is a **closed, passive file
set**: JSON and CSS only, with no JavaScript, build step, runtime dependency,
lifecycle script, external URL, or runtime font request.

## Composition

`theme.json` embeds the complete generation-4 Developer composition:
topic-index home, technical article, biography author page, row listings,
utility header, compact footer, landscape media, and compact density. The
template owns structure and layout; this theme supplies its established 116
design tokens and small skin stylesheet.

## Files

- `package.json`: exactly `name`, `version`, `license`, `repository`, `files`.
- `theme.json`: the contract-4 identity and Developer composition, stylesheet
  and hook projection, both 116-token palettes, asset digests, size budgets,
  and conformance digest chain.
- `tokens.css`: generated from `theme.json` by `tokens:generate`. Never edit
  it by hand; `tokens:check` fails if it drifts from `theme.json`.
- `components.css`: a small skin layer (card shadow and lift, chip fill and case, avatar radius, strong text, brand-name size)
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
npm --prefix ../theme-tooling run vendor:check
npm --prefix ../theme-tooling ci
GALA_THEME_TOOLING_DIR=../../theme-tooling npm --prefix tooling run tokens:generate
GALA_THEME_TOOLING_DIR=../../theme-tooling npm --prefix tooling run digest:generate
GALA_THEME_TOOLING_DIR=../../theme-tooling npm --prefix tooling run verify
```

Re-run `digest:generate` after editing `theme.json`, `tokens.css`,
`components.css` or `print.css`. It recomputes asset digests and the chain
`fixtureDigest`, `evidenceDigest`, `integrity`.

Only theme tooling is consumed from an explicit source checkout. Its exact
Schema 3.16.0 and Template 4.4.0 dev dependencies install from the npm
registry, and Schema and Template resolve from those installed packages.
`GALA_SCHEMA_DIR` and `GALA_TEMPLATE_DIR` are development overrides, not part
of this flow. None is a runtime dependency, and these commands do not publish
the package.

## Rules

CSS is limited to the root scope and the template's published styling hooks,
contains no `@import`, external `url()`, `outline: none` or script
constructs, and every stylesheet is one `@layer` block matching `theme.json`.
Contrast (WCAG 2.2 AA) is checked for both palettes by `contrast:check`.
The shared tooling README describes each gate.
