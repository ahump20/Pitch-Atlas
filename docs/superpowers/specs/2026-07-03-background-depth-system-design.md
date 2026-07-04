# The Descent — a seam-fed background depth system

**Date:** 2026-07-03
**Status:** Approved for implementation
**Surface change** (per NORTHSTAR: no Core commitments touched — no data model,
no provenance, no rights change; this is staging).

## The problem

The site sits on a flat black void. Every home section wears the identical
`v2-stage v2-tooth` treatment, the fixed dot grid and grain never respond to
scroll or to what section you're in, and the tall gaps between sections read as
unintentional emptiness instead of staged darkness. The background and the
React components don't know about each other: the hero card carries a `--c3`
accent world, but the field behind it stays inert everywhere.

## Approaches considered

**A. Animated video loops of famous pitches / rotating Pitching Ninja gifs**
(the prompt's opening idea). Rejected on three independent grounds:
1. *Rights* — broadcast footage and gifs cut from it are in the never-ships
   lane of the rights policy (NORTHSTAR, Rights & visual policy). Not
   negotiable without a Core decision-log change.
2. *Performance* — looping video under every section wrecks LCP, battery, and
   mobile data; the site currently ships zero runtime media in the shell.
3. *Taste* — the archive thesis is preserved specimens on matte black. Moving
   broadcast footage behind the cards reads as a highlight-reel site, the
   thing this project deliberately is not.

**B. WebGL ambient field** (faint drifting seam constellation behind
everything). Rejected: competes with the hero specimen for GPU and attention,
doubles the no-WebGL fallback surface, poor battery story.

**C. The seam-fed depth field** — **chosen.** Three coordinated strata built
entirely from the site's own original geometry and existing vocabulary
(seamPoint, the descent mark, ChapterMark, the accent triads). CSS-first,
transform/opacity only, zero new dependencies, zero runtime media.

## The design

Named parts, top of the z-stack downward. Everything is `aria-hidden`
decorative; every layer has a reduced-motion floor that is static, complete,
and present.

### 1. The far stratum (global, all pages)

A new fixed layer in `RootLayout` beneath `field-rules`: two or three very soft
radial pools at ~3–4% opacity that drift on slow keyframe clocks (12–18s,
alternating), the same "three speeds" doctrine the v2 stage already uses. It
accepts a `--scene-tint` custom property so the pools warm toward the active
section's accent. Reduced motion: pools static at their resting positions.

### 2. The near stratum parallax (global, all pages)

The existing `field-rules` dot grid gains a scroll-driven drift: behind
`@supports (animation-timeline: scroll())`, it translates vertically a small
distance (~120px) across the full document scroll. The grid is fixed, so the
slow counter-translation reads as the grid sitting *behind* the page — real
depth from one transform. No JS. Unsupported browsers and reduced motion keep
today's static grid.

### 3. Scene tint coordination (home; any page can opt in)

A small IntersectionObserver driver (same one-shot discipline as `useReveal`,
but tracking the *active* section rather than firing once) reads
`data-scene-tint` off home sections and sets `--scene-tint` on the layout
wrapper. The far stratum transitions its tint over ~1.2s. Sections declare
their world: the hero and refraction carry the featured specimen's `c3`, the
wings carry powder, the craft record navy, the close gold — each already the
section's own accent language. Opacity stays ≤6% under content so contrast
budgets are untouched.

### 4. The descent thread (home)

The one-off descent mark in `RefractionBridge` (hairline dropping into an open
diamond) generalizes into a `Descent` component: hairline + optional stitch
ticks + open seam-point diamond, drawn in with a view-timeline clip wipe
(SeamGuide's exact gating pattern: `@supports (animation-timeline: view())`,
IO class-toggle fallback, complete-and-still under reduced motion). Placed at
the top of each home section so every boundary reads as the thread dropping to
the next filed chapter. The dead gaps become the pause between chapters —
staged, not empty. RefractionBridge's inline mark is replaced by the component
in the same change (replace, don't stack).

### 5. ChapterMark draw-in (home)

The chapter mark's hairline segment draws in (scaleX) and the tick settles,
via the same view-timeline + fallback gating. Pure CSS addition to the
existing component; markup unchanged.

### 6. Spacing pass (home)

With the thread staging the boundaries, retune the two worst dead gaps
(ArchiveBand's exit, ToolsLab → FieldManual) so the darkness reads as rhythm.
Do not regress the mobile hero fixes from #148.

## What this is not

- No video, no gifs, no third-party imagery of any kind.
- No new npm dependencies, no animation library.
- No change to pitch data, provenance labels, or the seam calibration label.
- No scroll-frame JavaScript: IO one-shots and CSS timelines only.

## Performance budget

All new layers are `position: fixed`, animate transform/opacity only, and are
`pointer-events: none`. Bundle delta expected under 3 KB. LCP path (hero
specimen card) untouched. No layout thrash: nothing reads scroll position in
JS.

## Accessibility floors

- `prefers-reduced-motion: reduce` → every stratum static, every thread and
  mark complete and visible, tint switches instant or pinned neutral.
- All decoration `aria-hidden`; reading order and focus order untouched.
- Contrast: tint layers sit under content at ≤6% effective opacity; text
  contrast ratios unchanged.

## Verification

`npm run typecheck && npm run lint && npm run test && npm run build`, then
preview screenshots desktop + mobile, then the live deploy check at
pitch-atlas.com with the standing annotated-critique report.
