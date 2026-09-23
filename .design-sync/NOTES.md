# design-sync notes — Pitch Atlas

**System of record (since 2026-09-18): the Design System artifact**
https://claude.ai/artifact/JCrrMN5H3gQz5VhQNkB9RA — re-synced to main@4098cbd
on 2026-09-22 (published as Version 10, bullet fix Version 11). The claude.ai/design
project `e8154c97-53f1-4412-aa6b-9d019bc85e0c` is the legacy source it was migrated
from; it is left untouched and no longer receives uploads. Two dead ids appear in
older prose: `1f94fe08-…` and `aa4ea331-…`. Both are gone (`aa4ea331` 404s).

Canonical checkout: `~/Pitch-Atlas/Pitch-Atlas-living-media` (this repo). The
folder above it, `~/Pitch-Atlas`, is an unversioned older copy whose
`.design-sync/` is the clobbered variant described below; it now carries a pointer
back here.

## Re-sync to the artifact — the flow (2026-09-22)
1. `npm run design-sync -- --skip-build --remote .design-sync/.cache/remote-sync.json`
   (build first if `src/` changed). Grade every pending cell from
   `ds-bundle/_screenshots/` into `.design-sync/.cache/review/<Name>.grade.json`
   and re-run until the verdict reads `ok: true, pendingGrade: []`.
2. Read the live artifact first (Artifact tool, `read` with `path`): the page saves
   versions of itself, so build on what is published, never on a local copy.
3. From a working copy of the artifact's `project/` folder:
   `python3 .design-sync/artifact/guides.py <project>` (component READMEs, `.d.ts`,
   groups), `node .design-sync/artifact/package.mjs <project> <tokens.json>`
   (bundle, React lib, stylesheet, previews with `height=__H__`, fonts),
   `WEBGL=1 node .design-sync/artifact/render-check.mjs <project> <tokens.json> <shots>`
   (must show no errors, `canvases=2 loading=0` for BallStage), then write each
   card's measured `content` height into its marker. The cover is its own step:
   `node .design-sync/artifact/cover.mjs <project>` draws it from `seamPoint` (the
   quarter-turned face the brand mark draws) and `SITE.tagline`; never hand-draw a
   seam there. Rerun it when the title, palette or display face changes.
4. Publish in one call: `files` for everything changed, `text/plain` for `.d.ts`,
   `.html` and `.js` (that is how the carried files are stored), and the index
   (`project/design-system.json`, with `lastChange`) as `file_path`.
5. Open the page in Austin's Chrome with the tab in front (a background or covered
   tab never paints) and read the cover, the brand book and the cards.

`tokens.json` here is the published token table; `build_tokens.py` + `usage.py`
regenerate it (`resolve-tokens.mjs` measures the values in a browser). The brand
book (`project/README.md`) lives only in the artifact: read it there, edit it,
republish it. Keep every bullet on ONE line: the page's renderer splits a list
item at its first line break, so a hard-wrapped bullet renders as a bullet plus a
stray paragraph.

## The bundle is a DEVELOPMENT build — pair it with React's development build
The driver bundles with `NODE_ENV=development` (lib/bundle.mjs, contract surface —
do not fork it). `@react-three/fiber` picks its reconciler from that flag, and the
development reconciler reads React internals (`actQueue` and kin) that only
React's development build defines. With production React the 3D scene throws
`Cannot read properties of undefined (reading 'push')` the moment it mounts;
BallStage's boundary quietly shows the schematic instead, so nothing looks broken.
No capture without WebGL ever reaches that code: measured "production React is
lighter" first, and it broke the 3D ball. `package.mjs` builds React 19 as a
development IIFE for this reason.

## The driver stubs `scheduler` with a throw — the packager swaps it
lib/bundle.mjs resolves any `scheduler` import to a stub that throws
`[SCHEDULER_MISSING]`, assuming it means react-dom leaked into the build. Here it
does not: r3f's renderer imports scheduler itself, exactly as it does on the site.
`package.mjs` replaces the stub (asserting exactly one) with `window.__paScheduler`,
the instance react-dom runs on, which the React lib now exposes. The legacy
claude.ai/design project still carries the throwing stub; with WebGL its 3D mounts
fall back to the schematic.

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

- **Entry:** `--entry ./src/components/ds/index.ts` (the barrel; 12 `ds/`
  components plus the 5 re-exports BrandMark/ConfidenceDot/PitchSpecimenCard/
  BallStage/SeamSchematic).
- **Components (21 as of 2026-09-22):** BallStage and SeamSchematic, the signature
  medium, joined the 19 below. `.design-sync/extra-exports.ts` puts `PITCHES`,
  `CONFIDENCE_META` and `toast` on the global beside them.
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

## RESOLVED 2026-09-22: the card work the 2026-07-24 run was held for
The approved spec (`docs/superpowers/specs/2026-07-24-ds-component-truth-and-motion-design.md`)
is done and published: every card follows the in-product gallery
(`src/pages/DesignSystemShowcase.tsx`) — one Kicker and heading on the FIRST cell
only, product copy only, variant names as case-preserving code captions (the
site's `.mono-label` would upper-case `variant="chrome"` into a prop that does not
exist). Signature grids (PitchSpecimenCard, BallStage, SeamSchematic) sit on one
baseline; everything else stacks with a hairline between cells. The 3D previews
use the site's own mount boxes (GripCompare's full-width figure, GripViewer's
square up to 480px).

## Previews — authored, on the real surface
`.design-sync/previews/<Name>.tsx` (committed, owned — win over generated). Each
cell sits on `var(--surface-page)`, the void the product ships on, with 28px of
padding; the card grammar is in the RESOLVED section above. Content is real
product copy or a real `PITCHES` record (no fabricated velo/spin/break, no
medical/youth claims). Grades live in `.design-sync/.cache/review/` (gitignored);
all 21 graded good on 2026-09-22.

## ALWAYS pass --entry; omitting it silently drops the re-exported components (5 since 2026-09-22)
Bit on 2026-07-24. **Enforced since 2026-08-02 — use `npm run design-sync`**, which
is `scripts/design-sync.mjs`: it passes `--entry` unconditionally, resolves
`cssEntry` from the built HTML, and refuses to run if the barrel stopped
re-exporting any of the five. `npm run design-sync:check` is the preflight alone
(no build, no sync). `src/test/design-sync-config.test.ts` pins both invariants,
so the trap now fails a test rather than waiting to be remembered. The driver in
`.ds-sync/` is gitignored and re-vendored by the skill, so the guardrail lives in
tracked source instead of in the tool. The rest of this section is the diagnosis,
kept because the symptom is still worth recognizing by eye.

The full driver call, which the wrapper makes for you:

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
Bit twice on 2026-07-24, and again on 2026-08-02 — the committed `cssEntry` was
two builds stale and named a file that was no longer on disk. **Enforced since
2026-08-02:** `npm run design-sync` builds first, then reads the stylesheet out of
`dist/index.html` and re-points `cssEntry` itself, so the ordering is structural
rather than remembered. It reads the `<link>` rather than picking the largest
`index-*.css`, because dist carries a CSS-module chunk alongside the app sheet and
"largest" is a guess that happens to be right. The diagnosis below still stands.

The hash changes on EVERY `vite build`, so any sequence
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

## Upload — ATOMIC path, PRESERVE the curation (LEGACY: the claude.ai/design project)
Kept for the record; uploads now go to the artifact (see the flow at the top).
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
From the checkout root: `ln -sfn "$(pwd)" node_modules/pitch-atlas` — synth-entry
+ `pitch-atlas` import shim need the package locatable at `node_modules/<pkg>`.
The link must point at THIS checkout; the older advice pointed at `~/Pitch-Atlas`,
the unversioned folder above it, which builds the wrong tree.

## Known render warns (accepted)
`[FONT_MISSING] "Impact"` — a decorative system display fallback the compiled CSS
references; it legitimately can't ship and renders in the system fallback.
The driver's captures draw SVG labels (SeamSchematic's contact labels) in a serif
fallback; the artifact render uses Martian Mono. Capture-only.

## Motion, as the site ships it (audited 2026-09-22)
- Tokens: `--pa-motion-tiny` 120ms, `-short` 190ms, `-medium` 400ms, `-slow` 700ms,
  `-sweep` 900ms, all on `--pa-ease-settle` (cubic-bezier(.22,1,.36,1)).
- Nothing loops at rest. `src/index.css` defines nine ambient loops (`.rfx-holo`
  7s, `.field-depth` 17s/13s, `.grain-overlay` 11s, `.ambient-foil` 16s — used
  nowhere, the resting-card rake 9s, `.v2-rim` 14s and its rake 9s, `.v2-tooth`
  9s), and an unlayered rule in `src/styles/archive.css` (imported by RootLayout)
  stops all nine: "Lighting stays authored at rest." Layered loops lose to it by
  cascade layer, the unlayered ones by source order.
- Two indicators loop: `.is-busy` (0.7s) and `.skel-stock` (1.4s).
- About 101 timing values in `transition`/`animation` declarations are raw numbers
  (82 in `src/index.css`, 10 `blaze.css`, 4 `archive.css`, 4 `compare.css`, 1
  `world.css`), counted with comments stripped and `var()` ignored.
- One global reduced-motion rule (`src/index.css`, the "safety net") clamps every
  animation and transition; BallStage also stops its spin on the hook.

## Interaction audit (2026-09-22, packaged cards, Playwright at 900 and 390px)
Focus is visible everywhere once the transition settles (text field, search field
and dialog close ring cyan; measuring before the 0.2s transition finishes reads as
"no focus" — wait ~600ms). Escape closes the dialog and focus stays trapped inside.
Open items, none fixed here:
- Touch size (site bar 44px): buttons 41–42px tall, segments 34, a specimen card's
  Compare link 36, chips 30, select options and the dialog close 28; compare tray
  remove 32×36 (CSS). All clear WCAG's 24px floor.
- Tooltip: a tap never opens it (Radix), so touch readers never see its text.
- SegmentedToggle: takes no `aria-label` and draws no group; on a phone a
  four-option toggle wraps its labels ("A–Z" splits).
- ConfidenceDot `withLabel={false}`: tier by color alone plus a hover `title`.
- BallStage drag is pointer-only (`aria-hidden`); GripViewer supplies the keyboard
  path (arrows switch view, F flips the hand, H lifts it). Other mounts need one.
- Provenance labels render at 8–10px (ScoutRow row labels 8px, badges 10px, chips
  9.5px, stamps 9px).
- `DesignSystemShowcase.tsx` uses `text-bone-3`, which Tailwind never generates, so
  its variant labels lose their color.

## Color, as the site paints it (audited 2026-09-22, live CSS/JS read in a browser)
Token values match the live site exactly; the guidance had drifted because it was
written from the semantic layer, which the site declares and never reads. The
brand book's Color section (artifact Version 15) is now built from painted values.
Open items on the site, none fixed here:
- The semantic block (`surface-*`, `text-fg*`, `cta-*`, `focus-ring`,
  `confidence-*`, `border-card`, `hairline-*`) and the chart/sidebar tokens are
  never read. The `var()`-built aliases resolve on `:root`, so inside
  `.field-cream` they keep their void values; the "auto-flips" comment is false.
- Three tier color sets: ConfidenceDot (`CONFIDENCE_COLOR`), the cream stats plate
  (`CARD_INK`), the home card backs (`STAGE_TIER_DOT`). `confidence-*` matches
  none; `confidence-unverified` is gray while ConfidenceDot paints unverified red.
- `/repertoire/:id` prints the cream-field family inks (`FAMILY_ACCENT`) on the
  void: specialty #4e555b at 2.7:1 (under 3:1), the others 3.1–3.8:1.
- `cta-text` white on #ff2d44 is 3.7:1 (unused today).
- Retired cyan #37d6ff is hard-coded in the `.v2-cta` outer glow, ExternalMediaRail
  (two gradients) and GripLibrary's loading shimmer, and is the `var(--gc|--c3)`
  fallback in `.rfx-entry`, `.rfx-plate`, `.rfx-panel:before`, `.v2-rim`,
  `.v2-flip-btn`; chart-1/2 and sidebar tokens still carry it.
- Two secondary grays on the open page: `ink-2` #c2c7d6 (cool) and `bone-2`
  #c9c2b0 (warm).
