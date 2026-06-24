# Pitch Atlas v2 — "The Refractor Case" landing prototype

Status: approved (concept + delivery + section design), 2026-06-17.
Route: `/v2` (additive, prerendered). The live `/` is untouched until promoted.

## Goal

Reimagine the Pitch Atlas landing page with a bolder UI/UX: an early-90s vintage
**chromium** language (Topps Finest / Bowman Chrome refractor gloss) set against
**matte Topps-Now card stock**, dense but motivated micro-motion in every
interaction, and the existing hyper-real R3F ball + grips + cards staged
cinematically. No slop. No regressions. A genuinely new composition, not a reskin.

## Design read + dials

- Read: flagship product-landing overhaul for a design-literate baseball audience,
  vintage-chromium-card language leaning the existing React 19 + R3F stack hard
  into material realism and dense motivated motion.
- Dials (overhaul, declared): `DESIGN_VARIANCE 9` / `MOTION_INTENSITY 9` /
  `VISUAL_DENSITY 5`. Wild layout + motion; the cards still breathe.

## Material thesis (the whole aesthetic)

Two honest materials in tension:

- **Glossy chromium** — the `--foil` refractor rainbow that shifts with
  pointer/tilt (already wired via `useCardTilt` store -> `FoilLayer`), a new
  brushed/polished-chrome display treatment, specular sheen on the leather ball.
- **Matte Topps-Now stock** — new flat, light-absorbing charcoal/black card
  surfaces and stage. The chrome only reads as chrome because it sits on matte.

Per-card color comes from the existing `accents.ts` triads (`--c1/--c2/--c3`).
Base palette stays the Heritage `@theme` tokens; the chromium + matte surfaces are
a new material layer added to `src/index.css` (new tokens + classes), not a
repaint of the existing ones.

## Section composition

Each section is a different layout family (no repeated grids; one deliberate
matte<->chrome rhythm; eyebrow count within taste budget).

1. **The Case (hero, matte-black, `min-h-[100dvh]`).** Hero specimen card pushed
   off-axis (the anti-repackage move vs today's centered pull). Reuses
   `PitchSpecimenCard entry={PITCHES[0]} foil priority` — already mounts the live
   R3F `BallStage` + foil + spring tilt. New: chromium headline, matte stage with a
   rim-light sweep behind the card (atmosphere over a real asset), one primary CTA
   (`/repertoire`) + one secondary (a filed pitch). Headline <=2 lines, subtext
   <=20 words, CTAs above the fold, `pt-24` cap.
2. **The Refraction (scroll-pinned bridge).** As the hero card exits, a CSS
   `animation-timeline: view()` drives a refract + scale, then a 2D seam schematic
   (`seam2d` / `SeamSchematic`) fades in as the bridge to the set. Same `seamPoint`
   function as the 3D ball, so model and diagram cannot disagree. Static under
   reduced-motion and on browsers without view-timeline support.
3. **The Filed Set (chrome wall).** The set as a matte-black wall of chrome card
   fronts (reusing `RefractorCard` / `PocketCard`), every cell tilts + catches
   foil light on hover. Click/tap flips a card to its matte **card back**
   (`CardBackPanel`) showing the sourced shape read + confidence + source. New: the
   wall layout (rhythm, one larger chase cell) + the CSS 3D flip; the back face is
   the existing `CardBackPanel`. Real `PITCHES` data only.
4. **The Grip (material close-up).** A focused grip read: `BallStage` in grip view
   (or a real grip photo where one exists) beside the seam schematic. Breathes.
   "The grip is the lesson."
5. **The Shape (the honest read).** Qualitative shape-in-words + the spin-axis
   vector on the ball. Sourced, labeled. No fabricated figures.
6. **Sourced, Not Corrected (provenance strip).** `ClaimCard` examples + the
   confidence vocabulary, on the matte register. The principle made visible.
7. **File Your Own (close + footer).** CTA into `/repertoire` (the Pitch Index
   front door) and the live community; reuse `SiteFooter`.

## Motion system

- Continuous/scroll motion via CSS `animation-timeline: view()`/`scroll()` and the
  existing `useCardTilt` rAF store (CSS vars, no React re-render). No per-frame
  React `useState`, no `window` scroll listeners, no new motion dependency
  (the repo has no framer-motion; this matches its established idiom).
- Every micro-motion is motivated: pointer -> foil (material), scroll -> refract /
  dissolve (story), hover -> tilt (affordance), enter -> reveal (hierarchy),
  press -> scale (tactile).
- `prefers-reduced-motion` collapses all of it to static; no-WebGL falls back to
  the 2D schematic via `BallStage` + `SpecimenBoundary`.

## Charter guardrails (non-negotiable, = no regression)

- "Sourced, not corrected": every visible claim keeps its `Source` + `confidence`.
- No fabricated spin-rate, velocity, or break-in-inches. "Physics" = rendering
  fidelity + real spin-axis/gyro vectors + the qualitative shape read only.
- One `seamPoint` feeds 3D ball, 2D schematic, and fallback. Keep them in sync.
- Real grip photos only (clean sources); no scraped imagery, no team/league marks.
- The no-WebGL path stays fully usable; routes stay prerendered; `/` untouched.

## Reuse map

Reuse: `PitchSpecimenCard`, `RefractorCard`, `BallStage` (-> `BallScene`/`Ball`),
`FoilLayer`, `SpecimenBoundary`, `SeamSchematic`, `CardBackPanel`, `BrandMark`,
`ClaimCard`/`ConfidenceLabel`/`SourceBadge`, `PocketCard`, `SeamGuide`, `Reveal`,
the ui primitives, `seam.ts`/`seam2d.ts`, `accents.ts`, `useCardTilt`/`useInView`/
`useWebGLSupport`/`useReducedMotion`, the Heritage `@theme` tokens + `rfx-*` /
`btn-foil` / `claim-card` classes.

## New artifacts

- `src/pages/AtlasHomeV2.tsx` (the page; real `PITCHES` data; `useSeoMeta`).
- `src/components/v2/*` (HeroCase, RefractionBridge, ChromeWall, GripStudy,
  ShapeRead, ProvenanceStrip).
- New CSS in `src/index.css`: chromium tokens + classes (chrome display, polished
  surface), matte Topps-Now card stock, the chrome-wall + 3D flip, the refraction
  view-timeline. Extends `@theme`; replaces nothing.
- One route line in `src/routes.tsx`: `{ path: 'v2', lazy: ... }`.

## Verification

`npm run typecheck && npm run lint && npm run test && npm run build && npm run preview`,
then visual QA on the real rendered `/v2` (desktop + narrow), confirming: hero
fits the viewport, the live ball renders, the foil tracks the pointer, the
refraction bridge fires (and is static under reduced-motion), the chrome wall
flips to real card backs, and `/` is byte-for-byte unchanged.
