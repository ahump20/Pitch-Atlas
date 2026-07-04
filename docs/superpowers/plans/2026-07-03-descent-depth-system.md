# The Descent — Depth System Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Give pitch-atlas.com a coordinated background depth system — parallax strata, section-aware accent tinting, and a generalized descent thread — built entirely from original geometry, with static reduced-motion floors.

**Architecture:** Two fixed background strata in `RootLayout` (a new tinted far stratum + scroll-parallax on the existing dot grid), an IntersectionObserver hook that publishes the active home section's accent as `--scene-tint`, and a `Descent` motion component (generalizing RefractionBridge's one-off mark) placed at every home chapter boundary. All motion is CSS transform/opacity behind `@supports (animation-timeline: …)` gates with IO one-shot fallbacks — the exact gating pattern `SeamGuide` already ships.

**Tech Stack:** React 19, TypeScript, Tailwind v4 CSS-first (`src/index.css`), vitest + @testing-library/react. No new dependencies.

## Global Constraints

- No video, gifs, or third-party imagery — original geometry only (spec §Approaches).
- No new npm dependencies; no scroll-frame JavaScript (IO one-shots + CSS timelines only).
- Every decorative layer `aria-hidden="true"`, `pointer-events: none`.
- `prefers-reduced-motion: reduce` → static, complete, present. Tint ≤6% effective opacity.
- Do not regress the #148 mobile hero (headline + CTA above the fold).
- Verification before handoff: `npm run typecheck && npm run lint && npm run test && npm run build`.

---

### Task 1: The `Descent` component

**Files:**
- Create: `src/components/motion/Descent.tsx`
- Create: `src/components/motion/descent.test.tsx`
- Modify: `src/index.css` (append to the seam-guide block near line 1813)

**Interfaces:**
- Consumes: `useReveal` from `src/components/motion/Reveal.tsx` (existing).
- Produces: `Descent({ className?: string })` — a vertical thread: hairline, three stitch ticks, open seam-point diamond. Task 4 places it.

- [ ] **Step 1: Write the failing test** (`src/components/motion/descent.test.tsx`):

```tsx
import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import { Descent } from './Descent'

describe('Descent', () => {
  it('renders a decorative, fully-present thread', () => {
    const { container } = render(<Descent />)
    const el = container.firstElementChild as HTMLElement
    expect(el.getAttribute('aria-hidden')).toBe('true')
    expect(el.className).toContain('descent')
    // jsdom has no IntersectionObserver: the fallback settles landed, not hidden
    expect(el.className).toContain('is-landed')
    // hairline, ticks svg, and the open point are all in the DOM
    expect(el.querySelector('.descent-line')).not.toBeNull()
    expect(el.querySelectorAll('.descent-ticks path').length).toBe(3)
    expect(el.querySelector('.descent-point')).not.toBeNull()
  })
})
```

- [ ] **Step 2: Run it, expect FAIL** — `npx vitest run src/components/motion/descent.test.tsx` → "Cannot find module './Descent'".

- [ ] **Step 3: Implement** `src/components/motion/Descent.tsx`:

```tsx
import { useReveal } from './Reveal'

/*
  The descent. RefractionBridge's one-off boundary mark, generalized: the
  thread dropping from one filed chapter to the next — a hairline, three
  stitch ticks, and the open seam-point it lands on. Drawn in by a CSS clip
  wipe on a view() timeline where supported, a one-shot IO class where not,
  and simply present under reduced motion. Decorative by construction.
*/
export function Descent({ className = '' }: { className?: string }) {
  const { ref, shown } = useReveal<HTMLDivElement>('0px 0px -4% 0px')
  return (
    <div
      ref={ref}
      aria-hidden="true"
      className={`descent pointer-events-none absolute left-1/2 top-0 flex -translate-x-1/2 flex-col items-center ${shown ? 'is-landed' : ''} ${className}`}
    >
      <span className="descent-line block h-9 w-px bg-gradient-to-b from-transparent via-bone/15 to-bone/30" />
      <svg className="descent-ticks" viewBox="0 0 16 34" width="16" height="34" focusable="false">
        {[5, 16, 27].map((y, i) => (
          <path
            key={y}
            d={i % 2 === 0 ? `M4 ${y - 3.5} L12 ${y + 3.5}` : `M12 ${y - 3.5} L4 ${y + 3.5}`}
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            fill="none"
          />
        ))}
      </svg>
      <span className="descent-point mt-0.5 block h-1.5 w-1.5 rotate-45 rounded-[1px] border border-bone/30" />
    </div>
  )
}
```

- [ ] **Step 4: Add the CSS** — in `src/index.css`, directly after the `.seam-guide` rules (~line 1830), inside the same `@layer`/section:

```css
  /* ── the descent thread ── the chapter boundary as the seam dropping to the
     next file. Ticks in seam red at low alpha; the wipe mirrors .seam-guide. */
  .descent { color: color-mix(in srgb, var(--color-seam) 62%, transparent); }
  .descent .descent-ticks { display: block; }
  @media (prefers-reduced-motion: no-preference) {
    @supports (animation-timeline: view()) {
      .descent {
        clip-path: inset(0 -8px 100% -8px);
        animation: descent-drop 1s cubic-bezier(0.22, 1, 0.36, 1) both;
        animation-timeline: view();
        animation-range: entry 0% entry 90%;
      }
    }
    @supports not (animation-timeline: view()) {
      .descent { clip-path: inset(0 -8px 100% -8px); transition: clip-path 0.9s cubic-bezier(0.22, 1, 0.36, 1); }
      .descent.is-landed { clip-path: inset(-8px); }
    }
  }
  @keyframes descent-drop { to { clip-path: inset(-8px); } }
```

- [ ] **Step 5: Run the test, expect PASS** — `npx vitest run src/components/motion/descent.test.tsx`.

- [ ] **Step 6: Commit** — `git add -A && git commit -m "feat(motion): file the Descent thread component"`.

---

### Task 2: Global depth strata (far stratum + dot-grid parallax)

**Files:**
- Modify: `src/components/layout/RootLayout.tsx:62-66`
- Modify: `src/index.css` (`.field-rules` block ~line 485; `@property` at file scope; keyframes near `grain-breathe` ~line 2250)

**Interfaces:**
- Produces: a `.field-depth` fixed layer consuming `--scene-tint` (registered `<color>`, initial `#6CACE4`). Task 3 writes that property.

- [ ] **Step 1: Register the tint property and add the far stratum CSS** — in `src/index.css`, immediately before the `.field-rules` rule:

```css
  /* the scene tint: the active chapter's accent, bled into the far stratum at
     single-digit opacity. Registered so the color itself cross-fades. */
  @property --scene-tint {
    syntax: '<color>';
    inherits: true;
    initial-value: #6CACE4;
  }
  /* the far stratum: two soft pools behind the dot grid, drifting on offset
     clocks so the void reads as a lit room, not a flat fill. */
  .field-depth { position: fixed; inset: 0; z-index: 0; pointer-events: none; }
  .field-depth::before,
  .field-depth::after {
    content: ""; position: absolute; inset: -12%;
    transition: --scene-tint 1.2s ease;
  }
  .field-depth::before {
    background: radial-gradient(46% 38% at 20% 24%,
      color-mix(in srgb, var(--scene-tint) 6%, transparent) 0%, transparent 70%);
  }
  .field-depth::after {
    background: radial-gradient(42% 36% at 82% 72%, rgba(246, 241, 230, 0.035) 0%, transparent 72%);
  }
  @media (prefers-reduced-motion: no-preference) {
    .field-depth::before { animation: depth-drift-a 17s ease-in-out infinite alternate; }
    .field-depth::after { animation: depth-drift-b 13s ease-in-out infinite alternate; }
  }
```

- [ ] **Step 2: Add the keyframes** next to `grain-breathe` (~line 2250):

```css
@keyframes depth-drift-a { from { transform: translate3d(0, 0, 0); } to { transform: translate3d(2.5%, 3%, 0); } }
@keyframes depth-drift-b { from { transform: translate3d(0, 0, 0); } to { transform: translate3d(-2%, -2.5%, 0); } }
@keyframes field-recede { from { transform: translateY(0); } to { transform: translateY(-120px); } }
```

- [ ] **Step 3: Give `.field-rules` its scroll parallax** — extend the existing rule:

```css
  @media (prefers-reduced-motion: no-preference) {
    @supports (animation-timeline: scroll()) {
      .field-rules {
        animation: field-recede linear both;
        animation-timeline: scroll(root);
      }
    }
  }
```

- [ ] **Step 4: Mount the layer** — in `RootLayout.tsx`, before the `field-rules` div:

```tsx
      <div className="field-depth" aria-hidden="true" />
      <div className="field-rules" aria-hidden="true" />
```

- [ ] **Step 5: Verify** — `npm run typecheck && npx vitest run src/components/layout` pass; `npm run build` green.

- [ ] **Step 6: Commit** — `git commit -am "feat(stage): light the void — far stratum pools + dot-grid parallax"`.

---

### Task 3: Scene tint coordination

**Files:**
- Create: `src/hooks/useSceneTint.ts`
- Create: `src/hooks/useSceneTint.test.ts`
- Modify: `src/pages/AtlasHomeV2.tsx` (call the hook)
- Modify (one attribute each): `src/components/v2/HeroCase.tsx`, `MissionCase.tsx`, `ArchiveBand.tsx`, `RefractionBridge.tsx`, `ChromeWall.tsx`, `TheRead.tsx`, `WingsNav.tsx`, `ToolsLab.tsx`, `FieldManual.tsx`, `ProvenanceStrip.tsx`, `CloseCta.tsx`

**Interfaces:**
- Consumes: `[data-scene-tint]` attributes on section elements; the `--scene-tint` property from Task 2.
- Produces: `useSceneTint(): void` — observes tagged sections, writes the mid-viewport section's tint to `document.documentElement`.

- [ ] **Step 1: Write the failing test** (`src/hooks/useSceneTint.test.ts`):

```ts
import { describe, it, expect, afterEach } from 'vitest'
import { renderHook } from '@testing-library/react'
import { useSceneTint } from './useSceneTint'

describe('useSceneTint', () => {
  afterEach(() => document.documentElement.style.removeProperty('--scene-tint'))

  it('is inert without IntersectionObserver and cleans up after itself', () => {
    // jsdom has no IntersectionObserver: the hook must mount and unmount cleanly
    const el = document.createElement('section')
    el.setAttribute('data-scene-tint', '#37D6FF')
    document.body.appendChild(el)
    const { unmount } = renderHook(() => useSceneTint())
    expect(document.documentElement.style.getPropertyValue('--scene-tint')).toBe('')
    unmount()
    expect(document.documentElement.style.getPropertyValue('--scene-tint')).toBe('')
    el.remove()
  })
})
```

- [ ] **Step 2: Run it, expect FAIL** — module not found.

- [ ] **Step 3: Implement** `src/hooks/useSceneTint.ts`:

```ts
import { useEffect } from 'react'

/*
  The scene-tint driver. Watches every [data-scene-tint] section on the page
  and publishes the accent of the one crossing the viewport's middle band to
  --scene-tint on <html>, where the far stratum (.field-depth) breathes it in
  at single-digit opacity. IntersectionObserver only — nothing runs on scroll
  frames. Without IO support the property is never written and the stratum
  rests on its registered initial value.
*/
export function useSceneTint(): void {
  useEffect(() => {
    if (typeof IntersectionObserver === 'undefined') return
    const root = document.documentElement
    const sections = Array.from(document.querySelectorAll<HTMLElement>('[data-scene-tint]'))
    if (sections.length === 0) return
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue
          const tint = (entry.target as HTMLElement).dataset.sceneTint
          if (tint) root.style.setProperty('--scene-tint', tint)
        }
      },
      // the band around the viewport's center decides which chapter owns the room
      { rootMargin: '-42% 0px -42% 0px' },
    )
    sections.forEach((s) => io.observe(s))
    return () => {
      io.disconnect()
      root.style.removeProperty('--scene-tint')
    }
  }, [])
}
```

- [ ] **Step 4: Run the test, expect PASS.**

- [ ] **Step 5: Tag the home sections and call the hook.** In `AtlasHomeV2.tsx` add `useSceneTint()` at the top of the component. Add to each section's root `<section>` element:

| Component | attribute value | why |
|---|---|---|
| HeroCase | `accent.c3` (featured world) | the specimen's own accent |
| MissionCase | `#6CACE4` | powder — the prose register |
| ArchiveBand | `#CDBA8E` | sand — the sepia artifact |
| RefractionBridge | `accent.c3` | same function, same world |
| ChromeWall | `#8A93AB` | neutral slate — the full set, no single world |
| TheRead | `accent.c3` | the featured read |
| WingsNav | `#6CACE4` | powder — wayfinding |
| ToolsLab | `#00A2A0` | teal-bright — the instruments |
| FieldManual | `#4B92DB` | powder-deep — the record |
| ProvenanceStrip | `#34E27E` | ok-bright — the model's own label green |
| CloseCta | `#FFD24D` | gold — the send-off |

In components with a static value the attribute is literal (e.g. `data-scene-tint="#6CACE4"`); in HeroCase/RefractionBridge/TheRead it is `data-scene-tint={accent.c3}`.

- [ ] **Step 6: Verify** — `npm run typecheck && npm run test` green.

- [ ] **Step 7: Commit** — `git commit -am "feat(stage): the room follows the chapter — scene-tint coordination"`.

---

### Task 4: Descent placement + ChapterMark draw-in

**Files:**
- Modify: `src/components/v2/RefractionBridge.tsx:27-33` (replace the inline mark with `<Descent />` — delete the old in the same commit)
- Modify: `MissionCase.tsx`, `ArchiveBand.tsx`, `ChromeWall.tsx`, `TheRead.tsx`, `WingsNav.tsx`, `ToolsLab.tsx`, `FieldManual.tsx`, `ProvenanceStrip.tsx`, `CloseCta.tsx` — add `<Descent />` as the first child of the root `<section>`
- Modify: `src/components/v2/ChapterMark.tsx` (class hooks) + `src/index.css` (draw-in)

**Interfaces:**
- Consumes: `Descent` from Task 1.

- [ ] **Step 1: Replace RefractionBridge's inline mark.** Delete the `<span aria-hidden="true" className="pointer-events-none absolute left-1/2 top-0 …">…</span>` block (lines 27–33) and render `<Descent />` in its place. Import from `'../motion/Descent'`.

- [ ] **Step 2: Place `<Descent />` at the top of the other nine sections** (first child inside `<section>`; all sections are already `relative`).

- [ ] **Step 3: ChapterMark class hooks** — give the rule span a class:

```tsx
      <span className="cm-rule h-px w-5 bg-bone/25" aria-hidden="true" />
```

and add to `src/index.css` beside the descent rules:

```css
  /* the chapter rule draws itself as the mark enters — filed, not printed. */
  @media (prefers-reduced-motion: no-preference) {
    @supports (animation-timeline: view()) {
      .cm-rule {
        transform-origin: left center;
        animation: cm-rule-in 0.8s cubic-bezier(0.22, 1, 0.36, 1) both;
        animation-timeline: view();
        animation-range: entry 0% entry 60%;
      }
    }
  }
  @keyframes cm-rule-in { from { transform: scaleX(0); } }
```

- [ ] **Step 4: Verify** — `npm run test` (SeamGuide/route tests still green), `npm run build`.

- [ ] **Step 5: Commit** — `git commit -am "feat(home): the thread drops through every chapter boundary"`.

---

### Task 5: Spacing pass on the dead gaps

**Files:**
- Modify: `src/components/v2/ArchiveBand.tsx:20`, `src/components/v2/ToolsLab.tsx:21` (candidates — confirm by measuring in preview)

- [ ] **Step 1: Measure.** `npm run build && npm run preview`, screenshot the ArchiveBand → RefractionBridge and ToolsLab → FieldManual boundaries at 1440px.
- [ ] **Step 2: Trim one notch where a gap still reads dead** (e.g. `py-20 md:py-28` → `py-16 md:py-24`) — only where the screenshot proves the problem; the descent thread may already carry the pause.
- [ ] **Step 3: Re-screenshot, confirm at 390px the #148 mobile hero still lands headline + CTA in the first screen.**
- [ ] **Step 4: Commit** — `git commit -am "refine(home): tune the chapter pauses"`.

---

### Task 6: Full verification + ship

- [ ] `npm run typecheck && npm run lint && npm run test && npm run build` — all green.
- [ ] `npm run preview` — desktop (1440) + mobile (390) screenshots of the home top-to-bottom; annotated critique per the standing screenshot rule.
- [ ] Reduced-motion spot check: emulate `prefers-reduced-motion` in the preview browser; strata static, threads complete.
- [ ] Push, open PR, merge, run the deploy workflow, verify live at pitch-atlas.com.
