# design-sync notes — Pitch Atlas

Project: **Pitch Atlas Design System** (`e8154c97-53f1-4412-aa6b-9d019bc85e0c`) —
verified live 2026-07-24 and the ONLY canonical system. Two dead ids appear in
older prose: `1f94fe08-…` and `aa4ea331-…`. Both are gone (`aa4ea331` 404s). The
config's `projectId` is the authority; check it against `list_projects` first.

## READ THIS FIRST — the config was clobbered once (2026-06-28 → 2026-07-24)
Commit `993e5f9` ("import UI primitives to Claude Design system") overwrote this
file, `config.json`, `conventions.md`, and the whole `previews/` directory with a
DIFFERENT effort: 73 raw shadcn primitives from `src/components/ui`, aimed at the
now-deleted `aa4ea331` project. The real elevated system's sync inputs survived
only in commit `1f53c503`, and were restored from there on 2026-07-24.
If this file ever again describes `srcDir: src/components/ui` and ~73 components,
you are reading the clobbered variant — recover from `1f53c503`. The primitives
effort itself is preserved at commit `a46ee0e` if it is ever wanted back.

Shape: `package`. Global: `window.PitchAtlas`.

## What this system is now (regenerated from live source, 2026-06-28)
The delivered system is regenerated from the REAL product components, not a
hand-authored re-creation. The earlier `pa-*` mock components are retired.

- **Entry:** `--entry ./src/components/ds/index.ts` (the barrel; exports all 15
  branded components incl. the 3 re-exports BrandMark/ConfidenceDot/PitchSpecimenCard).
- **Components (19 as of 2026-07-24; was 22):** 15 branded `ds/` + 4 curated
  generic primitives (Select, Dialog, Tooltip, Toaster). **Tabs, Checkbox, and
  Avatar were dropped** — the June build compiled them from `src/components/ui/`
  files that only ever existed on an unmerged branch (`6191e44` and siblings);
  they are not on `main`, so they cannot be built and must not be advertised.
  Their cards/previews were deleted from the project. To bring them back it is a
  product decision (`npx shadcn add tabs checkbox avatar`), then re-add to
  `componentSrcMap` + `extraEntries` + `docsMap`; the old previews and doc-groups
  are recoverable from commit `1f53c503`. The primitives live in
  `src/components/ui/` (outside `srcDir`), so they are bundled onto the global via
  `cfg.extraEntries` (path-form repo files) AND carded via `cfg.componentSrcMap`.
  Their group is set by `.design-sync/doc-groups/<Name>.md` frontmatter
  (`category: Primitives`).
- **Real classes:** the bundled components render the product's own
  `.v2-cta`/`.btn-foil`/`.rfx-*`/`.hairline` — verified in `_ds_bundle.js`.

## cfg.provider = DsRouter (MemoryRouter) — REQUIRED
`PitchSpecimenCard` → `RefractorCard` renders a react-router `<Link>`, which throws
without a Router. `.design-sync/ds-router.tsx` exports `DsRouter` (a MemoryRouter
wrapper from `react-router-dom`), added to `cfg.extraEntries` and set as
`cfg.provider`. Because it is bundled into the SAME `_ds_bundle.js` as the card,
its MemoryRouter shares the one react-router context the Link consumes (a second
copy would not). Harmless for every non-routing cell.

## OPEN: the cards are verified but NOT yet uploaded (2026-07-24)
The 2026-07-24 driver run is fully green — `ok: true`, render check 19/19, anchor
matches, only the accepted `Impact` warn — and the upload was deliberately **not**
performed. Austin's call: the 19 cards read as a thin strip of content on 60–85%
dead void, with several exports clipped off the right edge, and they do not match
how the product actually presents these components (see
`src/pages/DesignSystemShowcase.tsx`, the canonical in-product gallery). Approved
design for the fix: `docs/superpowers/specs/2026-07-24-ds-component-truth-and-motion-design.md`.
Do not upload the current cards as-is; finish that work first. Bundle is at
`ds-bundle/`, verdict at `ds-bundle/.resync-verdict.json`.

## Previews — authored, on the real surface
`.design-sync/previews/<Name>.tsx` (committed, owned — win over generated). Each
wraps its demo in the real `.rfx-panel` charcoal surface so the dark-native
components read correctly on the void; content is real, qualitative pitch material
(no fabricated velo/spin/break, no medical/youth claims). Render check: 22/22 clean.

## ALWAYS pass --entry; omitting it silently drops the 3 re-exported components
Bit on 2026-07-24. The full driver call is:

    node .ds-sync/resync.mjs --config .design-sync/config.json \
      --node-modules node_modules --out ds-bundle \
      --entry ./src/components/ds/index.ts

`--entry` is NOT in the one-line usage string (it hides behind the `…`) and is
NOT a config field, so it is easy to drop. Without it the build resolves the
package's own entry instead of the ds barrel, and **BrandMark, ConfidenceDot and
PitchSpecimenCard vanish from `window.PitchAtlas`** — precisely the 3 components
the barrel re-exports from outside `srcDir` (`brand/`, `provenance/`,
`refractor/`). The 4 primitives survive because they are in `cfg.extraEntries`.

The tell is one line in the build stage:

    exported PascalCase symbols: 41; bundle export list: 38   # WRONG (no --entry)
    exported PascalCase symbols: 26; bundle export list: 41   # RIGHT

**package-build still prints `✓ wrote ds-bundle: … + 19 component previews`** and
the manifest still lists all 19, because the manifest comes from
`cfg.componentSrcMap` and never from what actually bundled. Only `validate`
catches it, as `[BUNDLE_EXPORT] 3/19 not a component on window.PitchAtlas` plus
two `root empty` renders. If BrandMark or ConfidenceDot ever render empty, check
this flag before debugging the components — they are fine.

## ORDERING RULE: re-point cssEntry AFTER the last app build, never before
Bit twice on 2026-07-24. The hash changes on EVERY `vite build`, so any sequence
of "set cssEntry → build the app again → run the driver" ships a bundle with no
component CSS. What it looks like:

    ! cssEntry: dist/assets/index-<old>.css not found — skipped
    styles.css: 1 @import(s)        # 2 when the CSS is really there

**The driver still reports `ok: true`, "render check 19/19 previews render
cleanly", and "bundle is complete".** The render check only asserts a non-empty
root, so a completely unstyled design system passes every automated gate — the
cards come out as default browser buttons and serif text on white. The ONLY thing
that catches it is reading a review sheet. If a sheet looks unstyled, check this
line first, before anything else.

So: do all app builds first, then `ls dist/assets/index-*.css`, take the LARGE one
(~285KB; the ~10KB one is a chunk), write it into cssEntry, and only then run the
driver. If you edit `src/index.css` mid-run, you have invalidated cssEntry — repoint
and re-run.

## cssEntry is a HASHED dist file — re-point on every app rebuild
`cfg.cssEntry` is the compiled Tailwind v4 CSS (`dist/assets/index-*.css`, the
large ~260KB one — the small one is a chunk). **The hash changes every `vite
build`.** Re-point before a re-sync. It carries the `:root` tokens, the real
component classes, AND the primitives' utilities (Tailwind scans the `ui/` files
even though no page imports them).

## Fonts — self-hosted, NO Google CDN (the audit's −2, fixed)
The Google `@import` lived only in the graded artifact's hand-authored
`tokens/fonts.css`, which the regenerated bundle replaces. `cfg.extraFonts` ships
`@fontsource` latin-400 for the four families; `styles.css` → `fonts/fonts.css` is
the self-hosted closure (zero remote font request — verified by grep).
POLISH (converter-pipeline, not a hand-edit): `fonts/fonts.css` also carries ~42
`@font-face` extracted from the compiled cssEntry that point at absolute
`/assets/*.woff2` (404 in the sandbox; the 4 self-hosted faces carry every glyph,
so nothing visibly breaks). Suppress those at the converter level + add the real
weights/italics when polishing.

## Upload — ATOMIC path, PRESERVE the curation
`1f94fe08` is pinned + non-empty → atomic upload. The regeneration replaces ONLY
the component layer + bundle + css + fonts. **Preserve (never delete):**
`tokens/{colors,typography,spacing,effects}.css`, `guidelines/**` (17 cards),
`ui_kits/**` (the web kit), `reference/**`, `assets/**`, `SKILL.md`.
- writes: `components/**`, `_ds_bundle.js`, `_ds_bundle.css`, `styles.css`,
  `fonts/**`, `_preview/**`, `_vendor/**`, `README.md`, `_ds_sync.json`,
  `_ds_needs_recompile`.
- deletes (NARROW): `components/**` (orphan the old flat mock layout),
  `components.css`, `components-specimen.css` (dead — the new `styles.css` imports
  `_ds_bundle.css` instead). Do NOT glob-delete tokens/guidelines/ui_kits/reference/assets.

## Render check / capture — DO NOT set DS_CHROMIUM_PATH (corrected 2026-07-24)
Playwright chromium **1228 is cached** at `~/Library/Caches/ms-playwright/`
(macOS path — NOT `~/.cache/ms-playwright/`, which is the Linux one and will look
empty). 1228 is exactly what the repo's pinned playwright 1.61.1 wants, so the
render check works with **no env var at all**.

The older advice here said to drive system Chrome via
`DS_CHROMIUM_PATH="/Applications/Google Chrome.app/…"`. That now **hangs and fails**
with `browserType.launch: Timeout 180000ms exceeded` — Austin's real Chrome is
normally running and playwright cannot take its profile. Symptom is
`[RENDER_SKIPPED]`, validate exit 1, and capture skipped as `prior_failure`, which
looks like a build problem but is not. Just unset it and re-run the driver.

## Symlink required (gitignored, recreate per clone)
`ln -sfn /Users/AustinHumphrey/Pitch-Atlas node_modules/pitch-atlas` — synth-entry
+ `pitch-atlas` import shim need the package locatable at `node_modules/<pkg>`.

## Known render warns (accepted)
`[FONT_MISSING] "Impact"` — a decorative system display fallback the compiled CSS
references; it legitimately can't ship and renders in the system fallback.
