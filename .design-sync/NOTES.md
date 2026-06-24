# design-sync notes — Pitch Atlas

Project: **Pitch Atlas Design System** (`aa4ea331-5881-4e4c-a982-988929d543ac`).
Shape: `package`, synth-entry mode. Global: `window.PitchAtlas`.

## This repo is an app, not a component library
Pitch Atlas builds a static SSG site (`vite build` → `dist/` of HTML pages), with
no `package.json` `main`/`module`/`exports`. The converter therefore runs in
**synth-entry mode** (scans `srcDir` for PascalCase exports) and needs the package
locatable at `node_modules/<pkg>`:

- **Symlink required (gitignored, recreate per clone):**
  `ln -sfn /Users/AustinHumphrey/code/Pitch-Atlas node_modules/pitch-atlas`
  Without it the build dies with `ENOENT node_modules/pitch-atlas/package.json`.

## Scope is deliberately the reusable primitives only
`cfg.srcDir = "src/components/ui"` → the 18 shadcn-style primitive files, which
expand to 73 exported components. The rest of `src/components/` is **intentionally
excluded**: page sections (HeroCase, ChromeWall, TheRead…) are bound to the
`PitchAtlasEntry` data model, and the 3D ball (Ball/BallStage/Studio) needs a WebGL
canvas — neither makes a reusable design-system card. A full-`src` scan also fails
the esbuild bundle (companion components import `.webp` sprites; `index.css` has
`url(/atmosphere/*.webp)` with no loader). If asked to widen scope later, add the
provenance atoms (ClaimCard, badges) before the page sections.

## cssEntry is a HASHED dist file — re-point on every app rebuild
`cfg.cssEntry = "dist/assets/index-Dtuk9Hgh.css"` is the compiled Tailwind v4 CSS
(tokens + used utilities + @font-face). **The hash changes every `vite build`.**
Before a re-sync: run `npm run build`, then re-point `cssEntry` at the new
`dist/assets/index-*.css` (the large one, ~230KB — the small one is a chunk).
Source `src/index.css` is NOT usable: Tailwind v4 utilities are generated at build,
not present in source.

## Fonts
`cfg.extraFonts` points at `@fontsource/*/latin-400.css` (Anton, Martian Mono,
Hanken Grotesk, Newsreader). The compiled site CSS references fonts via absolute
`/assets/*.woff2` paths the converter can't resolve, so they ship from @fontsource
instead. Only latin-400 to keep the bundle light.

## Render check / capture — no chromium cached
Drive the system Chrome:
`DS_CHROMIUM_PATH="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"`
on both `package-validate.mjs` and `package-capture.mjs` (and the `resync.mjs`
driver). Avoids the ~200MB `npx playwright install chromium`.

## Known render warns (check re-sync warns against this list)
- `[FONT_MISSING] "Impact"` — accepted. Impact is a decorative system display
  fallback used by the compiled CSS; it legitimately can't ship. Renders in the
  system fallback. Not a new warn.

## Authored previews
27 of 73 components have authored `.design-sync/previews/*.tsx`, all graded `good`.
The other 46 are floor cards — sub-parts (DialogContent, SelectItem, AlertTitle…)
shown composed inside their parents' authored cards. Portal components (Select,
Dialog, AlertDialog, Tooltip) author the trigger/closed surface only; the open
panel portals to `<body>` and escapes a static card. SelectGroup is authored
standalone with plain rows (its real use is inside an open SelectContent).

## Re-sync risks (what can silently go stale)
- **cssEntry hash** — stale hash → `[CSS_…]` or missing tokens. Re-point after
  `npm run build`. This is the single most likely break.
- **The symlink** — gitignored; recreate on a fresh clone or the build ENOENTs.
- **Repo lint/typecheck** — `tsconfig` only includes `src/` (previews safe), and
  `eslint.config.js` ignores `.design-sync` / `.ds-sync` / `ds-bundle`. If those
  ignores are dropped, `eslint .` fails on the previews' `pitch-atlas` shim import.
- **Node** — `.nvmrc` says 24; this sync ran on v22.17.1 (above the `>=20.19`
  floor). Fine for the converter; the app build target is still 24.
- **`Impact` font** — if the compiled CSS stops referencing it the warn vanishes;
  if a real brand font goes missing instead, that IS new — investigate.
