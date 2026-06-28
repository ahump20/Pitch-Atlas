# Pitch Atlas Design System Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the Pitch Atlas Design System real in the codebase — one named, typed component layer (`src/components/ds/`) and one additive semantic-token vocabulary — adopted on the home, index, and specimen surfaces, retiring the duplicate/parallel implementations. Parity, not redesign.

**Architecture:** New thin React primitives expose the design project's prop contracts and render the app's **existing proven branded CSS** (`.rfx-*`, `.hairline`, `.rfx-stamp`, …), consolidating the fragmented ones. Only `Button` — which has no clean existing canonical (today split across `.v2-cta`, `.btn-foil`, inline CTAs, shadcn) — introduces one new canonical class, which then replaces the scattered ones. No third CSS system; the big signature objects (specimen card, brand mark) are reused, never reskinned.

**Tech Stack:** Vite 8 + React 19 + TypeScript 6 + Tailwind v4 (CSS-first `@theme`, no config), React Router 7 + vite-plugin-react-ssg (prerender), Vitest 4 + Testing Library, lucide-react, `cn()` (clsx + tailwind-merge).

## Global Constraints

- **Sourced, not corrected.** Every visible claim keeps its `Source` + `confidence` label. Shape language, never a fabricated number/badge/count. The `ClaimConfidence` union and `claim`/`secondhand`/`unverified`/`src` helpers are untouched.
- **Freshness computed**, never hardcoded: colophon "as of" derives from `latestRetrievedAt(allSources())` → `asOfDate(...)`.
- **Seam label** stays "seam-informed schematic"; `seamPoint` stays the single source for 3D/2D/fallback.
- **No new data, no runtime external API calls, no `src/data/*` changes** (protects the iOS bundle drift gate).
- **No `@theme` token renames** (Tailwind generates `bg-*`/`text-*`/`font-*`/`rounded-*` from them). Tokens are **added**, never renamed.
- **No bare `--text-*` / `--space-*` / `--shadow-*` token names** (collide with Tailwind utilities + the existing `--pa-*` scales). Use safe namespaces.
- **Node 24** (`.nvmrc`). **Branch:** `feat/design-system-implementation`. **Commit style:** Conventional Commits (`type(scope): …`).
- **Four-state surfaces** (loading/error/empty/populated) preserved on anything touched.
- **Verify gate per task:** `npm run typecheck && npm run lint && npm run test` green before commit; `npm run build` green at each phase end.

---

## Phase 1 — Foundation (tokens & dedupe)

### Task 1.1: Add the additive semantic-token vocabulary

**Files:**
- Modify: `src/index.css` (the dark global `:root` ~lines 1392–1460; cream overrides in `.field-cream` ~1467–1509; base `--foil`/`--gold` block ~450–460)

**Interfaces — Produces:** the CSS custom properties Phase 2 components reference (`--cta-bg`, `--cta-bg-hover`, `--cta-text`, `--radius-pill`, `--radius-lg`, `--ease-spring`, `--ease-settle`, `--border-card`, `--color-press-2`, `--color-bone-3`, `--bevel-lo`, plus the semantic aliases).

- [ ] **Step 1 — Add tokens needed by the component layer + semantic aliases.** In the dark `:root` block, append (each pointing at an existing base token; do not invent values except the few noted):

```css
/* ── design-system semantic aliases (additive — point at existing base tokens) ── */
/* surfaces */
--surface-page: var(--color-void);
--surface-stage: var(--color-stage);
--surface-card: var(--color-press);
--surface-card-2: var(--color-press-2);
--surface-cream: var(--color-paper);
--surface-cream-2: var(--color-paper-2);
/* text (note: --text-fg*, NOT bare --text-*, to dodge Tailwind's text-size namespace) */
--text-fg: var(--color-bone);
--text-fg-2: var(--color-bone-2);
--text-fg-muted: var(--color-bone-3);
/* cta + focus */
--cta-bg: var(--color-seam);
--cta-bg-hover: var(--color-seam-deep);
--cta-text: var(--color-cta-text);
--focus-ring: var(--color-seam);
/* confidence (semantic, on the void) */
--confidence-official: var(--color-ok-bright);
--confidence-reputable: var(--color-amber-bright);
--confidence-secondhand: var(--color-sand-bright);
--confidence-unverified: var(--color-bone-3);
/* lines */
--border-card: rgba(246, 241, 230, 0.10);
--hairline-void: rgba(246, 241, 230, 0.12);
--hairline-cream: rgba(12, 35, 64, 0.18);
/* effect aliases (point at existing --pa-* where present) */
--ease-settle: var(--pa-ease-settle);
--ease-spring: var(--pa-ease-spring);
--dur-quick: 0.18s;
--dur-settle: 0.22s;
--dur-reveal: 0.7s;
/* radii the component layer needs (additive — app has only xs/sm/md today) */
--radius-pill: 999px;
--radius-lg: 8px;
/* deeper press + tertiary bone + bevel (add only if absent — verify first) */
--color-press-2: #16130F;
--color-bone-3: #969080;
--bevel-lo: rgba(0, 0, 0, 0.7);
```

Before adding `--color-press-2`, `--color-bone-3`, `--bevel-lo`, `--radius-pill`, `--radius-lg`: `grep -n` each in `src/index.css`; if it already exists, skip that line (do not redeclare).

- [ ] **Step 2 — Add the cream-context overrides.** In `.field-cream`, override only the tokens whose meaning flips on cream: `--cta-bg: var(--color-seam)` (seam stays), `--text-fg: var(--color-ink)`, `--text-fg-2: var(--color-ink-2)`, `--text-fg-muted: var(--color-ink-3)`, `--surface-card: var(--color-paper-2)`, `--border-card: rgba(12,35,64,0.14)`, `--confidence-official: var(--color-ok)`, `--confidence-reputable: var(--color-amber)`, `--confidence-secondhand: var(--color-sand)`.
- [ ] **Step 3 — Verify nothing broke.** Run: `npm run build`. Expected: PASS (the prerender-integrity test included in `build` stays green; additive tokens can't break existing utilities).
- [ ] **Step 4 — Visual check.** `npm run preview`, load `/`; confirm the home renders identically (additive tokens are unused so far).
- [ ] **Step 5 — Commit.**
```bash
git add src/index.css
git commit -m "feat(design-system): add additive semantic token vocabulary"
```

### Task 1.2: Dedupe the stale bone declaration

**Files:** Modify `src/index.css` (`@theme` block #1 ~lines 31–32)

- [ ] **Step 1 — Confirm the override.** `grep -n "color-bone" src/index.css`. Verify block #2 (~line 430) declares `--color-bone: #F6F1E6` / `--color-bone-2: #C9C2B0` (the live values) and block #1 (~31) declares the stale `#F2ECDD` / `#C7BEA8`.
- [ ] **Step 2 — Remove the stale pair** from `@theme` block #1 (delete the two `--color-bone`/`--color-bone-2` lines there only). Leave block #2 untouched.
- [ ] **Step 3 — Verify.** Run: `npm run build && npm run test`. Expected: PASS. Then `npm run preview` and confirm bone text on `/` is unchanged (it already rendered `#F6F1E6`).
- [ ] **Step 4 — Commit.**
```bash
git add src/index.css
git commit -m "refactor(design-system): drop the stale shadowed bone token"
```

### Task 1.3: Consolidate the three inline confidence-dot color maps

**Files:**
- Modify: `src/components/v2/ChromeWall.tsx`, `src/components/v2/TheRead.tsx`, `src/components/v2/ProvenanceStrip.tsx`
- Read: `src/components/provenance/refractorClaimMeta.ts` (canonical `CONFIDENCE_COLOR`)

**Interfaces — Consumes:** `CONFIDENCE_COLOR` (the canonical tier→hex map) from `refractorClaimMeta.ts`.

- [ ] **Step 1 — Read the canonical map.** Open `refractorClaimMeta.ts`; confirm the exported `CONFIDENCE_COLOR` keys cover the tiers each section's local `TIER_DOT` uses.
- [ ] **Step 2 — Replace each local map.** In each of the three files, delete the inline `TIER_DOT` (or equivalently-named local hex object) and import + use `CONFIDENCE_COLOR` instead. Keep the label text exactly as-is (already canonical `CONFIDENCE_META[c].label`).
- [ ] **Step 3 — Verify.** Run: `npm run typecheck && npm run test`. Expected: PASS. `npm run preview`, load `/`, confirm the chrome-wall cards, the read panel, and the provenance strip dots are the same colors as before.
- [ ] **Step 4 — Commit.**
```bash
git add src/components/v2/ChromeWall.tsx src/components/v2/TheRead.tsx src/components/v2/ProvenanceStrip.tsx
git commit -m "refactor(provenance): read the canonical dot colors, not three local copies"
```

---

## Phase 2 — Component layer (`src/components/ds/`)

**Canonical-class rule:** every `ds/` component renders an **existing** branded class except `Button`. Before writing each component, the implementer reads the named existing class in `src/index.css` and one existing usage, and matches that markup exactly (visual parity is the gate). Each component is a named export; `src/components/ds/index.ts` re-exports all.

### Task 2.0: Scaffold the `ds/` barrel + confirm helpers

**Files:** Create `src/components/ds/index.ts`; Read `src/lib/utils.ts` (confirm `cn`)

- [ ] **Step 1** — Confirm `cn` exists: `grep -rn "export function cn\|export const cn" src/lib`. Note the import path (expected `@/lib/utils` or `../../lib/utils`; match the app's alias by checking an existing component import).
- [ ] **Step 2** — Create `src/components/ds/index.ts` with a header comment and (initially empty) re-export block; each later task appends its export.
- [ ] **Step 3 — Commit.** `git add src/components/ds/index.ts && git commit -m "chore(ds): scaffold the design-system component barrel"`

### Task 2.1: Button (the one new canonical class)

**Files:**
- Create: `src/components/ds/Button.tsx`, `src/components/ds/Button.test.tsx`
- Modify: `src/index.css` (append the `.pa-btn` block in `@layer components`), `src/components/ds/index.ts`

**Interfaces — Produces:** `Button(props: ButtonProps)` where
```ts
interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  as?: 'button' | 'a' | React.ElementType   // default 'button'
  variant?: 'primary' | 'chrome' | 'ghost' | 'link'  // default 'primary'
  size?: 'sm' | 'md' | 'lg'                 // default 'md'
  arrow?: boolean                            // default false
  className?: string
  children?: ReactNode
}
```

- [ ] **Step 1 — Add the `.pa-btn` CSS** to `src/index.css` (verbatim from the design system's `components.css`; it already uses `--cta-bg`, `--cta-bg-hover`, `--cta-text`, `--color-bone`, `--color-cyan`, `--radius-pill`, `--ease-spring` — all present after Phase 1). Include `.pa-btn`, `.is-primary/.is-chrome/.is-ghost/.is-link`, `.is-sm/.is-lg`, `:hover/:active/:focus-visible/[disabled]`, `.pa-btn-arrow`.
- [ ] **Step 2 — Write the failing test** `Button.test.tsx`:
```tsx
import { render, screen } from '@testing-library/react'
import { Button } from './Button'
test('renders a seam-red primary button by default', () => {
  render(<Button>Open the Index</Button>)
  const el = screen.getByRole('button', { name: 'Open the Index' })
  expect(el.className).toContain('pa-btn')
  expect(el.className).toContain('is-primary')
})
test('renders as an anchor when as="a" with href', () => {
  render(<Button as="a" href="/about" variant="ghost">Mission</Button>)
  const el = screen.getByRole('link', { name: /Mission/ })
  expect(el).toHaveAttribute('href', '/about')
  expect(el.className).toContain('is-ghost')
})
test('appends an arrow glyph when arrow', () => {
  render(<Button arrow>Go</Button>)
  expect(screen.getByText('→')).toBeInTheDocument()
})
```
- [ ] **Step 2b — Run, expect FAIL** (`Button` not found): `npm run test -- src/components/ds/Button.test.tsx`
- [ ] **Step 3 — Implement** `Button.tsx`:
```tsx
import type { ButtonHTMLAttributes, ElementType, ReactNode } from 'react'
import { cn } from '@/lib/utils' // match the path confirmed in Task 2.0

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  as?: ElementType
  variant?: 'primary' | 'chrome' | 'ghost' | 'link'
  size?: 'sm' | 'md' | 'lg'
  arrow?: boolean
  children?: ReactNode
}

export function Button({
  as: Comp = 'button', variant = 'primary', size = 'md',
  arrow = false, className, children, ...rest
}: ButtonProps) {
  return (
    <Comp
      className={cn('pa-btn', `is-${variant}`, size !== 'md' && `is-${size}`, className)}
      {...rest}
    >
      {children}
      {arrow && <span className="pa-btn-arrow" aria-hidden="true">→</span>}
    </Comp>
  )
}
```
- [ ] **Step 4 — Run, expect PASS.** `npm run test -- src/components/ds/Button.test.tsx`
- [ ] **Step 5 — Export** from `ds/index.ts`: `export { Button, type ButtonProps } from './Button'`
- [ ] **Step 6 — Verify + commit.** `npm run typecheck && npm run lint`; then `git add -A && git commit -m "feat(ds): add the Button primitive (the one canonical button class)"`

### Task 2.2: Tag — renders existing `.rfx-chip`

**Files:** Create `src/components/ds/Tag.tsx`, `Tag.test.tsx`; Modify `ds/index.ts`; Read `.rfx-chip` def in `src/index.css` (~1214) + a usage in `src/components/grip/GripViewer.tsx`.

**Interfaces — Produces:** `Tag({ active?, glyph?, as?, className?, children, ...HTMLAttributes })`. `active` ⇒ the chip's selected state (match how `.rfx-chip` signals on — likely `aria-pressed="true"` + an `is-active`/active class; match the existing usage exactly).

- [ ] **Step 1** — Read `.rfx-chip` + its usage; note the exact on-state markup.
- [ ] **Step 2 — Test:** renders `.rfx-chip`; when `active`, sets the same on-state attribute/class the existing usage uses; fires `onClick`.
- [ ] **Step 3 — Implement** rendering `.rfx-chip` (+ glyph slot) matching the existing markup; default element `span` (or `button` when `onClick`/`active` — match existing a11y).
- [ ] **Step 4 — Run tests PASS; typecheck; export; commit** `feat(ds): add the Tag chip over the existing rfx-chip`.

### Task 2.3: SegmentedToggle — renders existing `.rfx-seg`

**Files:** Create `src/components/ds/SegmentedToggle.tsx`, `.test.tsx`; Read `.rfx-seg` (~1359) + a usage in `src/components/.../MovementMap.tsx`.

**Interfaces — Produces:** `SegmentedToggle({ options: Array<string|{value,label}>, value?, onChange?(value), className? })`. 44px coarse-pointer targets (the `.rfx-seg` rule already handles this — verify).

- [ ] **Step 1** — Read `.rfx-seg` markup + a usage (raw `aria-pressed` button group).
- [ ] **Step 2 — Test:** renders one option button per option; the option whose value === `value` carries the on-state (`aria-pressed="true"` / on-class per existing); clicking an option calls `onChange` with its value; string and `{value,label}` options both render.
- [ ] **Step 3 — Implement** rendering `.rfx-seg` with a button per option, matching the existing on-state markup.
- [ ] **Step 4 — PASS; typecheck; export; commit** `feat(ds): add SegmentedToggle over the existing rfx-seg`.

### Task 2.4: SearchField — renders existing `.rfx-input` + leading icon

**Files:** Create `src/components/ds/SearchField.tsx`, `.test.tsx`; Read the inline search in `src/components/sections/PitchIndex.tsx` (~388) + `.rfx-input` (~1196).

**Interfaces — Produces:** `SearchField(props: InputHTMLAttributes<HTMLInputElement>)` — a `type="search"` `.rfx-input` with a leading lucide `Search` glyph and Escape-to-clear (only if the existing search has it; match behavior).

- [ ] **Step 1** — Read the existing PitchIndex search composition; decide the minimal wrapper (leading-icon positioning may reuse an existing class or need a tiny `.ds-search` wrapper — prefer reusing whatever PitchIndex uses).
- [ ] **Step 2 — Test:** renders an input with `role="searchbox"` (or `type="search"`); forwards `value`/`onChange`/`placeholder`; the lucide search icon is present (`aria-hidden`).
- [ ] **Step 3 — Implement** matching the existing search markup.
- [ ] **Step 4 — PASS; typecheck; export; commit** `feat(ds): add SearchField over the existing index search`.

### Task 2.5: Input — renders existing `.rfx-input`

**Files:** Create `src/components/ds/Input.tsx`, `.test.tsx`; Read `.rfx-input` (~1196).

**Interfaces — Produces:** `Input({ label?, className?, ...InputHTMLAttributes })`. When `label`, render a mono field label above and wire `id`/`htmlFor` (generate an id with `useId` if none passed).

- [ ] **Step 1 — Test:** renders `.rfx-input`; with `label`, a `<label>` is associated (`getByLabelText` finds the input).
- [ ] **Step 2 — Implement** (`.rfx-input`; label via the existing field-label class if present, else `.mono-label`).
- [ ] **Step 3 — PASS; typecheck; export; commit** `feat(ds): add Input over the existing rfx-input`.

### Task 2.6: SourceBadge — consolidate the three provenance renderers

**Files:** Create `src/components/ds/SourceBadge.tsx`, `.test.tsx`; Read `src/components/provenance/SourceBadge.tsx`, `RefractorClaim.tsx` (`RefractorSource`), `grip/GripSourceBadge.tsx`, `refractorClaimMeta.ts`.

**Interfaces — Produces:** `SourceBadge({ tier?, label?, approximate?, className?, ...HTMLAttributes<HTMLSpanElement> })`, `tier` ∈ the 7-tier union (default `'official'`). Renders a `ConfidenceDot` (reuse the existing one) + a mono tier label (from `CONFIDENCE_META[tier].label` unless `label` overrides) + an optional "Approx" pill. Adapts skin to void vs cream via the existing classes (`.rfx-srcbadge` on void; `.field-cream` context handles cream).

- [ ] **Step 1 — Test:** `tier="official"` renders the official dot color + canonical label; `label="Relayed · Kagan"` overrides the text; `approximate` shows an "Approx" pill; the tier maps to the canonical `CONFIDENCE_META` label (no fabricated text).
- [ ] **Step 2 — Implement** reusing the existing `ConfidenceDot` + `CONFIDENCE_META`/`CONFIDENCE_COLOR`. Do **not** introduce new color literals.
- [ ] **Step 3 — PASS; typecheck; export; commit** `feat(ds): add a single SourceBadge consolidating the three copies`.

### Task 2.7: ScoutRow — renders existing `.rfx-scout-row`

**Files:** Create `src/components/ds/ScoutRow.tsx`, `.test.tsx`; Read `.rfx-scout-row/-k/-v` (~940) + `SourcedValue.tsx`.

**Interfaces — Produces:** `ScoutRow({ label, tier?, children, className?, ...HTMLAttributes<HTMLDivElement> })`. Renders `.rfx-scout-row` with `.rfx-scout-k` (label) + `.rfx-scout-v` (children) + an optional trailing `ConfidenceDot` when `tier`.

- [ ] **Step 1 — Test:** renders the label in the mono key cell and children in the value cell; with `tier`, a confidence dot follows the value.
- [ ] **Step 2 — Implement** over the existing scout classes + `ConfidenceDot`.
- [ ] **Step 3 — PASS; typecheck; export; commit** `feat(ds): add ScoutRow over the existing scout-file rows`.

### Task 2.8: DiamondMark — renders existing `.rfx-diamond`

**Files:** Create `src/components/ds/DiamondMark.tsx`, `.test.tsx`; Read `.rfx-diamond` (~511) + its inline use in `src/components/refractor/RefractorCard.tsx`.

**Interfaces — Produces:** `DiamondMark({ label?, gold?, size?, className?, ...HTMLAttributes<HTMLSpanElement> })`, defaults `label='PA'`, `gold=false`, `size=48`. Renders `.rfx-diamond` (+ `.is-gold`), `width/height = size`, inner glyph = `label`.

- [ ] **Step 1 — Test:** renders `.rfx-diamond` with `PA`; `gold` adds `.is-gold`; `size` sets the box size.
- [ ] **Step 2 — Implement** matching the inline `.rfx-diamond` markup; replace the two inline copies in `RefractorCard.tsx` with `<DiamondMark>` in Phase 3 (note here, do not change RefractorCard yet).
- [ ] **Step 3 — PASS; typecheck; export; commit** `feat(ds): add DiamondMark over the existing rfx-diamond`.

### Task 2.9: Thin wrappers over existing solid components/classes

**Files:** Create `src/components/ds/{Stamp,Kicker,Hairline,Card,ConfidenceDot,BrandMark,PitchSpecimenCard}.tsx`; Modify `ds/index.ts`.

Each is a re-export or 3–5-line wrapper — **no behavior or visual change**:
- `Stamp` → renders `.rfx-stamp` (`{ children, className, ...HTMLAttributes }`).
- `Kicker` → renders `.rfx-skick` with `rule?: boolean` (default true → leading rule; false → `no-rule`). Confirm against `SectionHero`'s eyebrow.
- `Hairline` → `<div className={cn('hairline', cream && 'hairline-cream')} />`; match existing `.hairline`/`.hairline-stage` names.
- `Card` → renders `.rfx-panel` with `interactive?`/`foil?` modifiers mapped to the existing modifier classes.
- `ConfidenceDot` → `export { ConfidenceDot } from '../provenance/RefractorClaim'` (re-export; do not reimplement).
- `BrandMark` → `export { BrandMark } from '../brand/BrandMark'` (re-export).
- `PitchSpecimenCard` → `export { PitchSpecimenCard } from '../refractor/PitchSpecimenCard'` (re-export the signature object — never reskin).

- [ ] **Step 1 — Implement** all seven; for the three re-exports, a one-line `export { … } from …`.
- [ ] **Step 2 — Smoke test** `ds/wrappers.test.tsx`: each renders without throwing; `ConfidenceDot`/`BrandMark`/`PitchSpecimenCard` are the same references as their source modules.
- [ ] **Step 3 — Export all from `ds/index.ts`; typecheck; lint; commit** `feat(ds): add wrappers over the existing solid primitives`.

### Task 2.10: `/design-system` showcase route

**Files:** Create `src/pages/DesignSystemShowcase.tsx`; Modify `src/routes.tsx` (add the lazy route); Read an existing page (e.g. `RepertoirePage.tsx`) for the route/SSG pattern + `src/data/pitches` for real sample data.

**Interfaces — Consumes:** every `ds/*` export; `PITCHES[0]` for real sample data.

- [ ] **Step 1 — Build the page**: a dark-void page rendering each primitive in its states (Button ×4 variants ×3 sizes + arrow; Tag active/idle; SegmentedToggle; SearchField; Input; SourceBadge across all tiers + approximate; ScoutRow rows in a `.rfx-scout`; DiamondMark normal/gold; Stamp; Kicker; Hairline; Card; ConfidenceDot ladder; BrandMark; one `PitchSpecimenCard` bound to `PITCHES[0]`). Use real copy/data — no lorem, no fabricated figures.
- [ ] **Step 2 — Register the route** `/design-system` as route-level `lazy`, following the existing pattern. Confirm it prerenders (it must satisfy the `PITCH_ATLAS_CHECK_DIST` integrity test or be added to that test's known routes).
- [ ] **Step 3 — Verify** `npm run build` (prerender included) PASS; `npm run preview`, load `/design-system`, every primitive renders.
- [ ] **Step 4 — Commit** `feat(ds): add the /design-system showcase route`.

---

## Phase 3 — Adoption (swap surfaces onto the components)

Each task: swap inline duplication → `ds/*`, delete the now-dead code, verify parity on that surface (desktop + mobile), commit. Read each surface's current markup first.

### Task 3.1: Home (`AtlasHomeV2` + `v2/*`)

**Files:** Modify `src/pages/AtlasHomeV2.tsx`, `src/components/v2/{HeroCase,MissionCase,ChromeWall,ProvenanceStrip,TheRead,CloseCta,WingsNav,ToolsLab,FieldManual,ArchiveBand}.tsx` (only those with CTAs/eyebrows/stamps/badges); Delete the `.v2-cta` rule in `src/index.css` once no usage remains.

- [ ] **Step 1** — Replace home CTAs (`.v2-cta` + inline `<a>`/`<button>` with inline `→`) with `<Button variant=… arrow>`; section eyebrows with `<Kicker>`; hero stamp with `<Stamp>`; provenance dots/badges with `<ConfidenceDot>`/`<SourceBadge>`.
- [ ] **Step 2** — `grep -rn "v2-cta" src/`; when zero usages remain, delete the `.v2-cta*` rules from `src/index.css`.
- [ ] **Step 3 — Verify parity** `npm run typecheck && npm run lint && npm run test && npm run build`; `npm run preview`, load `/`, confirm visual parity (desktop + mobile widths).
- [ ] **Step 4 — Commit** `refactor(home): adopt the ds primitives; retire v2-cta`.

### Task 3.2: Index (`RepertoirePage` → `PitchIndex`)

**Files:** Modify `src/components/sections/PitchIndex.tsx`, `src/pages/RepertoirePage.tsx`.

- [ ] **Step 1** — Replace the inline search with `<SearchField>`; the family filter pills/`ToggleGroup` with `<Tag>` (or `<SegmentedToggle>` if it's a single-select switch); row CTAs with `<Button>`. Keep the real empty state and the filed/basic routing.
- [ ] **Step 2** — Remove the now-unused shadcn `InputGroup`/`ToggleGroup` imports here if fully replaced. Keep `.pi-toggle`/`.rfx-chip` CSS if still referenced elsewhere (note any remaining users).
- [ ] **Step 3 — Verify** suite + build; `npm run preview`, `/repertoire`: search filters, family filter narrows, results regroup, empty state shows on no match. Desktop + mobile.
- [ ] **Step 4 — Commit** `refactor(index): adopt SearchField/Tag/Button on the Pitch Index`.

### Task 3.3: Specimen (`PitchChapter`)

**Files:** Modify `src/pages/PitchChapter.tsx` (+ its local section components); optionally `src/components/refractor/RefractorCard.tsx` (swap inline `.rfx-diamond` → `<DiamondMark>`).

- [ ] **Step 1** — Replace section CTAs/back-link with `<Button>`; scout-file rows with `<ScoutRow>`; source/confidence renders with `<SourceBadge>`/`<ConfidenceDot>`; master-variant cards with `<Card>`. Replace the two inline `.rfx-diamond` in `RefractorCard` with `<DiamondMark>`. **Do not touch** the 3D ball, the scroll dissolve, `seamPoint`, or the per-source colophon.
- [ ] **Step 2 — Verify** suite + build; `npm run preview`, open a filed specimen (e.g. `/pitch/four-seam`): grip guide, scout file, master variants render; the ball + 2D schematic + colophon unchanged. Desktop + mobile.
- [ ] **Step 3 — Commit** `refactor(specimen): adopt ScoutRow/SourceBadge/Button/Card on the chapter`.

---

## Phase 4 — Verification & proof

### Task 4.1: Full green + integrity

- [ ] `npm run typecheck && npm run lint && npm run test && npm run build && npm run preview` — all PASS.
- [ ] `grep -rn "v2-cta" src/` → only the deleted definition gone, zero usages. Confirm net inline-duplication decreased (the three dot maps gone, the three source-badge copies consolidated, CTAs/toggles unified).
- [ ] Confirm `src/data/*` untouched: `git diff --name-only main... -- src/data` is empty (iOS bundle unaffected).
- [ ] Confirm README / UI copy / data model still hold sourced-not-corrected; no new mock/fabricated data; freshness still computed from `latestRetrievedAt`.

### Task 4.2: Visual proof (the completion report)

- [ ] With `npm run preview` running, capture home, `/repertoire`, a specimen, and `/design-system` — desktop and mobile.
- [ ] For each shot: describe what a visitor sees + the standing screenshot critique (annotated copy, 10+ anchored fixes/notes per image, mobile not exempt).
- [ ] Handoff report: files changed; commands + results; preview URL; known limitations (e.g. remaining `rfx-seg`/`rfx-chip` users on out-of-scope viz surfaces as a tracked follow-up); confirmation the sourced-not-corrected principle holds across README, UI copy, data model.

---

## Self-Review

**Spec coverage:** Phase 1 ⇒ spec §6 (tokens/dedupe/dot-maps). Phase 2 ⇒ §5 + §7 (component layer, showcase). Phase 3 ⇒ §8 (adoption). Phase 4 ⇒ §9 + §12 (verify/proof). Regression register §10 ⇒ Global Constraints + the "no @theme rename / no bare names / grep-before-add" steps. Non-negotiables §4 ⇒ Global Constraints. No spec section is unmapped.

**Placeholder scan:** Component contracts are exact (from the project `.d.ts`). The "read the existing `.rfx-*` markup and match" steps are deliberate (adoption over proven CSS), not placeholders — each names the exact class, line, and a usage file, with visual parity as the gate. Button ships full code + full CSS source.

**Type consistency:** `ButtonProps`/`TagProps`/`SegmentedToggleProps`/`SearchFieldProps`/`InputProps`/`SourceBadgeProps`/`ScoutRowProps`/`DiamondMarkProps` match the project `.d.ts` verbatim. `ConfidenceDot`/`BrandMark`/`PitchSpecimenCard` are re-exports of existing components (same references). `cn` import path is confirmed in Task 2.0 before use.
