# Design system: component truth + motion

**Date:** 2026-07-24
**Scope:** the 19 components in the Pitch Atlas design-system layer, their motion
and state model, and the sync preview cards that represent them.
**Status:** approved design, ready for an implementation plan.

## Why this exists

Two problems, found by looking at the built artifacts rather than the docs.

**The cards misrepresent the system.** A full sync ran clean on 2026-07-24 — 19/19
previews render, bundle and anchor consistent — but reading the contact sheets
shows every card is a thin strip of content sitting on 60–85% dead void, with
several exports clipped off the right edge. The components render correctly; the
*cards* read as empty. Anyone browsing the design system, human or agent, sees a
system that looks unfinished.

**The cards don't match the product.** The repo already ships the canonical
presentation of these components at `src/pages/DesignSystemShowcase.tsx`, whose
own comment calls it *"the system as it actually ships, not a re-derivation."* It
organizes the components into seven labeled sections, prints each variant's name
beneath its specimen, deliberately places the `ink` button on a **cream** swatch
because that is its register, drives tags/toggle/search as live controlled state,
and enumerates all seven confidence tiers and four source tiers. The sync
previews do none of that — and one of them actively contradicts the product by
showing `ink` on charcoal.

Separately, motion vocabulary has drifted. `docs/WABI-SABI-MOTION.md` defines four
duration bands; `src/index.css` carries three view-transition durations
(`--duration-exit/enter/move`) plus ad-hoc values such as the `0.7s` in `.reveal`.
Nothing ties them together, so "consistency across routes" has no shared unit.

## Goals

1. Motion and interaction live in the **real product components**, so visitors get
   them and the design-system cards inherit them from one source of truth.
2. One motion vocabulary shared by route transitions, components, and media.
3. All 19 cards present the components the way the product actually presents them.
4. Every rule obeys `docs/WABI-SABI-MOTION.md` and collapses under
   `prefers-reduced-motion`.

## Non-goals

- Brand graphics, logo system, and video production (a later project).
- The cross-route/media/logo consistency audit (a later project).
- Any production deploy. This work lands and is verified; shipping is a separate
  decision.
- Any new animation dependency. No Framer Motion, no GSAP.
- Re-opening which components exist. The set is the 19 that exist on `main`.

## Architecture

### 1. Motion token layer

New custom properties in `:root` in `src/index.css`, taken from the doctrine's
bands (midpoint of each) plus the soft-out curve `.reveal` already uses:

```
--pa-motion-tiny:   120ms;   /* doctrine 90–140  */
--pa-motion-short:  190ms;   /* doctrine 160–220 */
--pa-motion-medium: 400ms;   /* doctrine 320–480 */
--pa-motion-slow:   700ms;   /* doctrine 700–1100, pinned low on purpose */
--pa-ease-out: cubic-bezier(0.22, 1, 0.36, 1);
```

The three existing view-transition durations are re-pointed at that scale:
`--duration-exit: var(--pa-motion-tiny)`, `--duration-enter: var(--pa-motion-short)`,
`--duration-move: var(--pa-motion-medium)`.

This intentionally shifts two timings: exit 150ms → 120ms, enter 210ms → 190ms.
Both stay inside their doctrine bands, and `--duration-move` is already exactly
400ms. `.reveal`'s hard-coded `0.7s` becomes `var(--pa-motion-slow)` — which is
why the slow band is pinned to 700ms rather than its midpoint: the site's most
widely used effect keeps its exact current timing while still being expressed in
the shared vocabulary. Adopting a token must not silently retune existing motion.

**Every component rule below is expressed in these tokens.** A raw millisecond
value in component CSS is a defect.

### 2. Motion attaches to the branded classes, not to JSX

`Button` maps variants onto existing classes (`.v2-cta`, `.btn-foil`,
`.ds-btn-link`); the other components follow the same pattern with `.rfx-*` and
friends. Motion therefore lives in the stylesheet on those classes, the way
`.reveal` does — which is also where `prefers-reduced-motion` is already handled.
Only motion that genuinely needs to observe the DOM (one-shot reveals) uses the
existing `useReveal` hook.

Constraints, from the doctrine: transforms and opacity only; no endless loops; no
rubbery overshoot; nothing that animates a source citation in a way that hurts
readability.

### 3. Per-component motion and state

| Component | Trigger → motion | Band | States to model |
|---|---|---|---|
| Button (chrome/ghost) | hover lift; press settle; focus ring | tiny | rest, hover, focus-visible, pressed, disabled |
| Button (foil) | as above, plus **one** contained sheen pass on hover — single pass, never loops | tiny + short | same |
| Button (ink) | as chrome, on the cream register | tiny | same |
| Button (link) | underline wipe on hover | tiny | rest, hover, focus-visible |
| Tag | selected settles like a paper tab | short | rest, hover, selected, disabled |
| SegmentedToggle | thumb slides between options (transform only) | short | per-option selected, focus-visible |
| SearchField | focus expand; clear affordance fades in when non-empty | tiny | empty, typed, focused, cleared |
| Input | focus state only — never animate typing | tiny | rest, focus-visible, invalid, disabled |
| ConfidenceDot | **one** opacity/scale settle on first reveal, never again | tiny | the 7 confidence tiers |
| SourceBadge | **one** settle on first reveal, never again | tiny | 4 tiers, plus approximate and relayed |
| ScoutRow | one-shot reveal, small per-row stagger | short (tiny stagger) | per-row tier |
| Hairline | draws in once (scaleX) on first reveal | medium | default, stage |
| Kicker / Stamp | one-shot fade-up with the section | short | default, tinted |
| Card | existing refractor tilt retained; foil edge responds to pointer and rests on leave | short | plain, foil |
| PitchSpecimenCard | keeps existing reveal + refractor tilt; **nothing added inside card content** | — | default, foil |
| BrandMark / DiamondMark | one settle on mount; no idle loop | short | sizes; gold variant |
| Dialog / Select / Tooltip / Toaster | enter/exit on the shared transition durations | tiny/short | closed, open, dismissed |

Provenance components (ConfidenceDot, SourceBadge, ScoutRow) carry citations. Their
motion is one settle and then permanent stillness — this is a hard rule, not a
preference.

### 4. Reduced motion

A single `@media (prefers-reduced-motion: reduce)` block neutralizes every rule
added here: no transitions, no transforms, final state visible immediately. This
mirrors the existing `.reveal` treatment. Reduced motion must never hide content.

### 5. Card rebuild

All 19 previews in `.design-sync/previews/` are re-authored as ports of the
showcase sections, carrying its grammar:

- eyebrow + heading per card,
- the variant name printed beneath each specimen in mono micro-type,
- `ink` shown on the cream swatch, never on charcoal,
- full enumerations for the provenance ladders,
- live controlled state for Tag, SegmentedToggle, and SearchField,
- real pitch content only — no fabricated velocity, spin, or break figures.

Two presentation defects are fixed by config, measured from the capture rather
than guessed: any export wider than a grid cell gets
`cfg.overrides.<Name>.cardMode: "column"`; overlay components (Dialog, Select,
Tooltip, Toaster) get `cardMode: "single"` with an explicit `viewport`. Per-component
viewport heights are set so cards crop to their content and the void disappears.

## Verification

The work is done when all of the following hold, with evidence:

1. `npm run typecheck`, `npm run lint`, `npm run test`, `npm run build` all green.
   The `src/components/ds/*.test.tsx` suites cover these components and must pass.
2. The sync driver reaches `ok: true` with render check 19/19.
3. Contact sheets and per-component review sheets are **read**, and every card
   shows content filling its cell with nothing clipped.
4. A reduced-motion pass confirms every animated surface renders complete and
   still.
5. Motion is verified in a real browser at the running route, not inferred from
   CSS source.
6. No raw millisecond literals in the component motion CSS.

## Risks

- **Timing shift on route transitions.** Exit and enter move by 30ms and 20ms.
  Small, inside doctrine bands, but it is a real behavior change to confirm
  visually.
- **Touching shipped components.** These render live product surfaces. The
  existing per-component tests are the guard; any test change must be justified,
  never relaxed to pass.
- **Foil sheen is the one flourish** that could read as decorative. It is capped
  at a single pass on hover and must rest.
- **Card viewport heights are content-dependent** and will need one measure-and-adjust
  iteration after the first capture.

## Decision log

- Motion lives in product components, not preview-only — chosen so the design
  system never advertises behavior the product lacks.
- CSS-level motion over a JS layer or an animation library — matches the existing
  `Reveal` pattern and the class-wrapper architecture, and keeps reduced-motion
  handling in one place.
- Duration tokens take the midpoint of each doctrine band, except the slow band,
  which is pinned to 700ms so `.reveal` keeps its existing timing exactly. The
  doctrine stays the source of truth; the CSS is derivable from it.
