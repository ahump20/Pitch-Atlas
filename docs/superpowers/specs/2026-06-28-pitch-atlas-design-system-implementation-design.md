# Pitch Atlas — Design System Implementation (Design Spec)

> **Preserving & Progressing the Art of the Pitch.**
> *Sourced, not corrected.*

- **Date:** 2026-06-28
- **Branch:** `feat/design-system-implementation`
- **Source design project:** claude.ai/design — "Pitch Atlas Design System" (`1f94fe08-…`), updated 2026-06-28
- **Scope decision:** Full — system into the product. **Ambition:** Formalize & consolidate (faithful, not a redesign).

---

## 1. Summary

Make the Pitch Atlas Design System **real in the codebase**: one named, contract-backed component layer and one semantic token vocabulary, adopted across the home, index, and specimen surfaces — retiring the duplicate and parallel implementations that exist today. This is a **consolidation and formalization** effort, not a repaint.

The visitor-visible change is intentionally subtle (more consistent chrome). The win is architectural: the code stops *resembling* the design system and *becomes* it, which is what a design system is for.

## 2. Background — the corrected understanding

The design project was **extracted from the live app**, not authored as a new target (its own README: "Everything here was lifted from the real codebase"). Three read-only mapping passes confirmed the consequences:

- **The tokens are already live.** The values I first read as "evolved deltas" — brighter bone `#F6F1E6`, `--color-cyan #37D6FF`, `--color-seam-bright #FF2D44`, the provenance `-bright` trio — **already exist** in the app's second `@theme` block (the Refractor void layer). They are not additions.
- **The real debt is duplication.** The same primitives are built two or three ways:
  - Two parallel button systems: stock shadcn `ui/button.tsx` vs the branded `.btn-foil` CSS, no bridge.
  - The segmented toggle hand-rebuilt as raw `aria-pressed` button groups in three tools (`GripCompare`, `MovementMap`, `TunnelPlot`), plus a fourth shadcn `ToggleGroup` path in `PitchIndex`.
  - The source badge built three times (`provenance/SourceBadge` cream, `RefractorClaim → RefractorSource` void, `grip/GripSourceBadge`).
  - The confidence-dot color map hand-copied inline (`TIER_DOT`) into three home sections (`ChromeWall`, `TheRead`, `ProvenanceStrip`) instead of importing the canonical `CONFIDENCE_COLOR`.
  - A stale duplicate of the bone color (`#F2ECDD`) shadowed by the live `#F6F1E6` override.
  - The whole `src/components/ui/*` shadcn set is effectively a second, unbranded primitive library beside the `rfx-*` system.
- **Most "solid" primitives already exist** as good `rfx-*` classes or bespoke components: Kicker (`.rfx-skick`/`SectionHero`), Hairline (`.hairline`), Card (`.rfx-panel`/`.theater-card`), Stamp (`.rfx-stamp`), BrandMark (component), ConfidenceDot (component), PitchSpecimenCard (`RefractorCard`/`PitchSpecimenCard`).

## 3. Goal & non-goals

**Goal.** A single branded component layer (`src/components/ds/`) with the design system's contracts, rendering the app's existing/consolidated branded styles; a clean additive semantic-token vocabulary; adoption on the three primary surfaces; a `/design-system` showcase route; full green verification and live visual proof.

**Non-goals.**
- No visible redesign of the surfaces (parity is the target; "tighter," not "different").
- No third CSS system. New components render existing/consolidated classes; net CSS classes go **down**, not up.
- No renaming of existing `@theme` `--color-*` / `--font-*` / `--radius-*` tokens (Tailwind v4 generates utilities from them; renames silently break `bg-*`/`text-*`/`font-*`/`rounded-*` across the TSX).
- No new data, no runtime external API calls, no fabricated pitch behavior/figures/badges/counts.

## 4. Non-negotiables preserved (the charter)

Carried through every phase, verified at the end:

- **Sourced, not corrected.** Every behavioral claim keeps its `Source` + `confidence` label. Shape language, never fabricated figures. The `claim`/`secondhand`/`unverified` helpers and the 7-tier `ClaimConfidence` union are untouched; a bad source id still throws at build via `src()`.
- **Freshness is computed.** The colophon "as of" date keeps deriving from `latestRetrievedAt(allSources())` → `asOfDate(...)`. Never hardcode a freshness string.
- **Seam label.** Public copy stays "seam-informed schematic," never "seam-accurate." `seamPoint` stays the single source for 3D tube, 2D schematic, and no-WebGL fallback.
- **Four-state surfaces.** Loading / error / empty / populated coverage preserved on any surface touched (the index already has a real empty state — keep it).
- **Rights & safety.** No scraped player/agency imagery, no league marks, no medical/injury/workload/youth-prescription copy. First-party grip photos only.
- **README / UI copy / data model stay in lockstep** on the sourced-not-corrected principle.

## 5. Architecture decision

**One component layer over the existing class vocabulary.** New React primitives live in `src/components/ds/` (the "design system" namespace), each a thin component exposing the design project's prop contract and rendering the app's **existing** branded CSS — consolidated where it is currently fragmented. This deliberately avoids introducing the design project's parallel `.pa-*` class set as a third system; instead the components map onto the proven `rfx-*` / `.btn-foil` / `.hairline` / `.rfx-stamp` classes, unifying the fragmented ones (`.rfx-seg` vs `.pi-toggle`; `.rfx-chip` vs `.rfx-filedtag` vs `.pi-toggle`; shadcn button vs `.btn-foil`) into a single canonical class per primitive.

**Token vocabulary is additive and namespaced.** New semantic aliases point at existing base tokens. Names that would collide with Tailwind utilities or the existing `--pa-*` scales are **not** introduced bare (`--text-*`, `--space-*`, `--shadow-*` are off-limits as bare names); aliases use safe namespaces (`--surface-*`, `--confidence-*`, `--cta-*`, `--border-card`, `--hairline-*`, `--glow-*`) or the established `--pa-` prefix.

## 6. Phase 1 — Foundation (tokens & dedupe) · additive, near-zero visual risk

Edits in `src/index.css` only, plus three small TSX edits to consolidate the dot-color map.

1. **Add missing semantic aliases** (each `= var(<existing base token>)`, placed in the dark `:root` block so they resolve on the void; cream overrides added in `.field-cream` where the meaning flips):
   - Surfaces: `--surface-page` → `--color-void`, `--surface-stage` → `--color-stage`, `--surface-card` → `--color-press`, `--surface-card-2` → `--color-press-2` (add `--color-press-2 #16130F` if absent), `--surface-cream` → `--color-paper`, `--surface-cream-2` → `--color-paper-2`.
   - Text: `--text-fg` → `--color-bone`, `--text-fg-2` → `--color-bone-2`, `--text-fg-muted` → `--color-bone-3` (note: **not** bare `--text-*`; use `--text-fg*` to dodge Tailwind's text-size namespace). Add `--color-bone-3 #969080` if absent.
   - CTA / focus: `--cta-bg` → `--color-seam`, `--cta-bg-hover` → `--color-seam-deep`, `--cta-text` → `--color-cta-text`, `--focus-ring` → `--color-seam`.
   - Confidence (semantic): `--confidence-official` → `--color-ok-bright`, `--confidence-reputable` → `--color-amber-bright`, `--confidence-secondhand` → `--color-sand-bright`, `--confidence-unverified` → `--color-bone-3`.
   - Lines: `--border-card` (the `rgba(246,241,230,.10)` literal, tokenized), `--hairline-void` (`rgba(246,241,230,.12)`), `--hairline-cream` (`rgba(12,35,64,.18)`).
   - Effects: `--glow-cyan`, `--glow-gold`, `--leather-edge`, `--inset-mount` — tokenize the inline values already used by `.scene-coal`/`.v2-mount`/etc.
   - Motion: `--dur-quick .18s`, `--dur-settle .22s`, `--dur-reveal .7s` (the existing `--pa-ease-settle/-spring` already cover easing).
2. **Resolve conflicts explicitly** (do **not** import the design names blindly): keep the existing computed `--color-seam-deep` (do not overwrite with `#9b0c23`); do not touch `--accent` (it is a shadcn dark-surface primitive, not an accent color); do not add bare `--space-*`/`--text-*`/`--shadow-*`.
3. **Dedupe the stale bone pair.** Remove the block-#1 `--color-bone #F2ECDD` / `--color-bone-2 #C7BEA8` declarations now that block #2's `#F6F1E6`/`#C9C2B0` are the live values. Verify no rule depends on the stale value resolving first.
4. **Consolidate the dot-color map.** Replace the three inline `TIER_DOT` hex maps in `ChromeWall`, `TheRead`, `ProvenanceStrip` with an import of the canonical `CONFIDENCE_COLOR` (from `provenance/refractorClaimMeta.ts`). Label text already comes from canonical `CONFIDENCE_META` — this only removes the duplicated color literals.
5. **Guardrail:** leave raw-hex → `var()` migrations (cyan/seam/bone usages, incl. the `rgba(246,241,230,…)` ×60 form) for a *later optional* sweep, not this phase — they are not required for formalization and carry test-assertion risk. Note them in the regression register.

**Verify Phase 1:** `npm run typecheck && npm run lint && npm run test && npm run build`; visual check that home renders identically.

## 7. Phase 2 — Component layer (`src/components/ds/`) · consolidation

Build each as a thin, typed React component exposing the design project's contract (exact props read per-component from the project's `.d.ts`). Build/extract targets first, then thin wrappers over what already exists. Each ships with the showcase entry.

**Build / consolidate (currently fragmented):**
- `Button` — variants `primary | chrome | ghost | link`, sizes `sm | md | lg`, `arrow?`, `disabled?`, polymorphic (`as`/`href` for link vs button). Renders the unified branded button class; the `→`/`↗` arrow becomes a prop (today copy-pasted inline across ~15 CTAs). Bridges the shadcn-vs-`.btn-foil` split.
- `Tag` — `active?`, `onClick?`, optional `glyph`. One class, replacing `.rfx-chip` / `.pi-toggle` / `.rfx-filedtag` fragmentation for the family-filter/chip use.
- `SegmentedToggle` — `options`, `value`, `onChange`, 44px coarse-pointer targets. One control replacing the three hand-rolled `aria-pressed` groups + the shadcn `ToggleGroup` path.
- `SearchField` — `value`, `onChange`, `placeholder`, leading icon, Escape-to-clear. Extracts the inline `PitchIndex` search.
- `Input` — the scene-toned branded field; unify with `.rfx-input`.
- `SourceBadge` — `source`, optional `approx`, tier styling; unify the three surface copies into one that adapts to void/cream context.
- `ScoutRow` — `label`, `tier`, value/children; the sourced spec-sheet row (consolidates `SourcedValue`/`SoftballProvenanceRow` shape).
- `DiamondMark` — `gold?`, `size`, label (`PA`); extracts the inline `.rfx-diamond`.

**Thin wrappers over existing good implementations (no behavior change):**
- `Stamp` (`.rfx-stamp`), `Kicker` (`.rfx-skick`, `rule?`), `Hairline` (`cream?`), `Card` (`.rfx-panel`/`.theater-card`, `interactive?`/`foil?`), `ConfidenceDot` (reuse `RefractorClaim`'s), `BrandMark` (reuse), `PitchSpecimenCard` (reuse `refractor/PitchSpecimenCard`, align prop names if needed).

**Showcase route `/design-system`** — a real in-repo route rendering every component in its states (the guideline-card equivalent), wired to **real** sample data (e.g. `PITCHES[0]`), four-state where relevant. Prerendered like the rest of the app (React Router + SSG). Not linked from primary nav unless asked.

**Verify Phase 2:** typecheck/lint/test/build; the showcase renders every primitive; no visual change to existing surfaces yet.

## 8. Phase 3 — Adoption · swap surfaces onto the components

Replace inline duplication with the new components, one surface at a time, verifying parity after each.

- **Home (`AtlasHomeV2` + `v2/*`):** CTAs → `Button`; section eyebrows → `Kicker`; the provenance strip dots/badges → `ConfidenceDot`/`SourceBadge`; stamps → `Stamp`. Delete the now-dead inline `TIER_DOT`/CTA markup.
- **Index (`RepertoirePage` → `PitchIndex`):** search → `SearchField`; family filter → `Tag`/`SegmentedToggle`; row CTAs → `Button`; retire the shadcn `ToggleGroup`/`InputGroup` path here. Keep the real empty state.
- **Specimen (`PitchChapter`):** section CTAs/back → `Button`; scout file rows → `ScoutRow`; source/confidence → `SourceBadge`/`ConfidenceDot`; master-variant cards → `Card`. Keep the 3D ball, the scroll dissolve, the per-source colophon untouched.

**Verify Phase 3:** full suite; live preview on each surface, desktop + mobile; visual diff against pre-change (target: identical/tighter).

## 9. Phase 4 — Verification & proof

- `npm run typecheck && npm run lint && npm run test && npm run build && npm run preview`.
- Fetch the live preview; describe what a visitor sees on home, index, and a specimen page, desktop and mobile, with screenshot critique (10+ anchored notes per shot per the standing rule).
- Confirm README / UI copy / data model still hold sourced-not-corrected; confirm no new mock data, no fabricated figures, freshness still computed.
- Handoff report: files changed, commands + results, preview URL, known limitations.

## 10. Regression register (specific traps from the audit)

- **Tailwind `@theme` renames break utilities.** Add aliases; never rename existing `--color-*`/`--font-*`/`--radius-*`.
- **Bare `--text-*` / `--space-*` / `--shadow-*` collide** with Tailwind utilities and the `--pa-*` scales. Use safe namespaces.
- **Bone lives as `rgba(246,241,230,…)` ×60** — invisible to a hex/token change. The optional raw→token sweep is out of scope here; if attempted later, sweep the rgba triple too.
- **Tests assert specific hexes** (`useCardTilt`, `ScoutMovementWheel`, `FoilLayer` tests reference `#37D6FF`). Any color migration updates assertions in lockstep.
- **`--color-seam-deep` and `--accent` are conflicts** — leave both as-is.
- **Prerender integrity test** runs in `build` (`PITCH_ATLAS_CHECK_DIST=1`). New `/design-system` route must prerender cleanly or be excluded deliberately.
- **iOS drift gate.** The iOS bundle generates from `src/data/*`. This effort does not touch `src/data/*`, so no drift; confirm at the end.

## 11. How it gets built

Staged via ultracode Workflow orchestration + subagent-driven development, applying `design-systems` / `taste-skill` / `impeccable` / `design-for-ai` as the craft layer:

- One phase = one workflow (or one workflow stage), in order (1 → 2 → 3 → 4), because each depends on the previous (components need tokens; adoption needs components). Within a phase, independent components/surfaces are built in parallel (they touch different files).
- Each built artifact is adversarially verified (a second agent checks it against its done-when: renders, types, no fabricated data, parity).
- Commits per phase on `feat/design-system-implementation`; merge to `main` only after Phase 4 is green and visually proven. Deploy is the existing manual GitHub Action — not triggered by this work.

## 12. Success criteria

1. `typecheck`, `lint`, `test`, `build` all green; `/design-system` prerenders.
2. The eight build/consolidate components exist in `src/components/ds/`, typed, each used on at least one real surface; the duplicate implementations they replace are deleted.
3. Home, index, and specimen render at visual parity (or tighter) with pre-change, verified live on desktop + mobile.
4. Net CSS classes and inline duplication **decrease**; no third class system introduced.
5. README / UI copy / data model still hold sourced-not-corrected; zero new mock/fabricated data; freshness still computed from `latestRetrievedAt`.
6. iOS data bundle unaffected (no `src/data/*` changes).
