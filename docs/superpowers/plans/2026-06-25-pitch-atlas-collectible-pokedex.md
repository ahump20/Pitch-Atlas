# Pitch Atlas — "Pokédex of Pitching" Collectible System + Staleness/Polish Pass

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans (inline; the
> file overlaps below make subagent-per-task collision-prone). Steps use checkbox (`- [ ]`).

**Goal:** Make every filed pitch read as an honestly-graded collectible specimen (the
"Pokédex of Pitching" feel) using only data already on the page, and clear the stale-language
and polish drift a three-front audit surfaced — with zero fabrication.

**Architecture:** Three lanes. (A) Strip the disavowed "Sourced, not corrected" phrase from
the external-facing slogan slots and retire the dead "living field manual" frame; keep the
phrase only on charter-sanctioned trust surfaces. (B) Polish: micro-type legibility floor,
hero H1 balance, de-duped close. (C) The collectible slice: a pure `specimenGradeFor()` switch
over existing fields, rendered as a single rarity stamp that *replaces* the redundant attr-row,
plus a rarity legend that frames `/repertoire` as a graded collection.

**Tech Stack:** Vite, React 19, TS, Tailwind v4 (CSS-first), React Router 7, Vitest, Playwright,
Cloudflare Pages.

## Global Constraints (every task inherits these)

- **Anti-fabrication:** rarity derives ONLY from fields already shipping (`specimenNo`, first-party
  clip/photo presence, `gripImages`, `filedSlug`, `RepertoireStatus`). No RNG, no numeric score,
  no percentile, no "N left" scarcity language, no live request → no faked four-state.
- **Charter boundary:** "Sourced, not corrected" stays VERBATIM in the data model, README,
  NORTHSTAR, the `/sources` body + H1 (`routes.test.tsx:183` asserts it), the home "The Model"
  H2 (`ProvenanceStrip.tsx:53`), the `FieldNotes` method line, and the home close
  (`CloseCta.tsx:143`). It is the sourcing METHOD, never a public tagline.
- **Edge honesty:** `alias` / `illusion` / `not-a-pitch` / `banned` stay labeled as honest edges,
  never reframed as a desirable chase tier.
- Do not touch Austin's handwritten grip/pitch prose. Node 24. Canonical repo `ahump20/Pitch-Atlas`.

## Phased roadmap (what ships now vs. later)

**Shipping this pass:** Lanes A + B + the collectible Phase-1 slice (the grade stamp + the
rarity-graded `/repertoire`). All read-only static data, no migration, no live read.

**Deferred (documented, not built this pass — bigger live-data work):**
- P2 — Render community photo/video uploads as collectible specimen cards (`discussion_media` →
  RefractorCard face, `community-firsthand` confidence). Effort L; touches `DiscussionForum`,
  `lib/discussion`. Fabrication risk: must keep the rights label + four-state live read honest.
- P3 — Surface the real Supabase recognition counts (`contribution_score`, `adoptionCount`,
  `helpfulCount`, `countThread`) on a contributor's own card as "N pitchers tried this," four-state.
  Effort M. Recognition, not reward — no leaderboard, no payoff currency.
- P4 — Drive the existing live-WebGL `foil` polish from "this card carries a real first-party
  artifact," so the premium foil is *earned* by a contribution, not keyed to hero placement. Effort M.

---

### Task A1: Retire the dead "living field manual" frame in `index.html`

**Files:** Modify `index.html:50,58,62,69`. (`site.ts` is already `'living archive'`; `seo.ts`
reads `SITE.positioning`, already correct — do NOT touch them.)

- [ ] `index.html:58` `<title>` → `Pitch Atlas: The Living Archive of Pitching Craft`
- [ ] `index.html:50` description → `A living archive of pitching craft: textbook foundations, verified master variants, and community field notes, every claim labeled by its source.`
- [ ] `index.html:62` og:title → `Pitch Atlas: the living archive of pitching craft`
- [ ] `index.html:69` og:image:alt → `Pitch Atlas — the living archive of pitching craft`
- [ ] Verify: `grep -in "field manual" index.html` → no output. Commit.

### Task A2: Strip the "Sourced, not corrected" sign-off from external meta + two hero subs + card back

**Files:** Modify the `description`/`ogDescription` fields on `RepertoirePage.tsx:24`,
`AboutPage.tsx:110`, `ComparePage.tsx:19`, `MovementMapPage.tsx:19`, `KnowledgeHub.tsx:114`,
`CraftsmenHall.tsx:31`, `LostPitchesHall.tsx:26,28`, `SoftballFastpitchPage.tsx:25`,
`SoftballSlowpitchPage.tsx:22,24`, `SoftballHub.tsx:124`, `SourcesPage.tsx:46,60`,
`GripsPage.tsx:23,25,50`, `PitchChapter.tsx:701`; the hero subs `GripsPage.tsx:62`,
`SoftballHub.tsx:152`; the card back `ChromeWall.tsx:154`.
**Leave:** `SourcesPage.tsx:69` (H1), `ProvenanceStrip.tsx:53` (H2), `FieldNotes.tsx:460`,
`CloseCta.tsx:143`, `SiteFooter.tsx:65`, and all code comments.

- [ ] For each meta field, delete the trailing ` Sourced, not corrected.` (or `, sourced not
  corrected` in GripsPage:23,50) so the body sentence stands alone. The exact replacements are
  in the audit; each ends the prior sentence cleanly.
- [ ] `GripsPage.tsx:62` hero sub → end at `…one arm's actual hold.` (drop ` Sourced, not corrected.`)
- [ ] `SoftballHub.tsx:152` → `…the anchor. Slowpitch is filed honestly and lighter. Early innings.`
- [ ] `ChromeWall.tsx:154` → `pitch-atlas.com · filed specimen`
- [ ] Verify the sanctioned set still reads the phrase: `grep -rn "Sourced, not corrected" src/pages/SourcesPage.tsx src/components/v2/ProvenanceStrip.tsx src/components/v2/CloseCta.tsx` → present.
- [ ] Add a guard test (Task A3) before committing.

### Task A3: Guard test — meta descriptions carry no slogan sign-off

**Files:** Modify `src/routes.test.tsx`.

- [ ] Add a test that mounts a representative sample of routes (`/repertoire`, `/compare`,
  `/about`, `/grips`) and asserts the rendered `<meta name="description">`/`og:description`
  content does not end in `Sourced, not corrected.` — fails before A2, passes after.
- [ ] Keep the existing `/sources` H1 assertion (`routes.test.tsx:183`) intact.
- [ ] Run `npm run test -- src/routes.test.tsx`; commit A1–A3 together.

### Task B1: Lift the card + index micro-type off the illegibility floor

**Files:** Modify `src/index.css` (`.rfx-seal-label` ~728, `.rfx-gripchip` ~742, `.rfx-strip`
~902); `src/components/sections/PitchIndex.tsx:164`.

- [ ] `.rfx-seal-label` font-size `7px → 8px`; `.rfx-gripchip` `7.5px → 8px`; `.rfx-strip` `7.5px → 8px`.
- [ ] `PitchIndex.tsx:164` status Badge `text-[8px] → text-[9.5px]` (unique signal, front door).
- [ ] Verify no horizontal overflow / clipping in preview at 390px. (The `.rfx-attrrow` chips are
  removed by Task C2, not bumped, so no change needed there.)

### Task B2: Balance the hero H1 and gate its hard break to desktop

**Files:** Modify `src/components/v2/HeroCase.tsx:38-45`.

- [ ] Add `[text-wrap:balance]` to the h1 className.
- [ ] Replace the unconditional `<br />` with `<br className="hidden md:inline" />` so the poetic
  two-line break holds on desktop but phones wrap evenly instead of stacking three ragged lines.
- [ ] Verify mobile (390px) shows a balanced two/three-line headline with no orphan.

### Task B3: De-duplicate the CloseCta refrain

**Files:** Modify `src/components/v2/CloseCta.tsx` (the `.v2-wall-line` repeat ~146).

- [ ] Read the file first to confirm current line numbers. Replace the verbatim repeat of the
  "Preserve…/Progress…" couplet with a distinct closing beat, e.g.
  `Every grip filed before it's forgotten. Every claim still wearing its source.` — or delete the
  `.v2-wall-line` paragraph so the brand line is the last word. Keep `CloseCta.tsx:143`
  (`{SITE.sourcePrinciple}.`) intact.
- [ ] Commit B1–B3.

### Task C1: The honest specimen grade — pure function + test (TDD)

**Files:** Create `src/data/specimen-grade.ts`; Create `src/data/specimen-grade.test.ts`.

**Interfaces — Produces:**
```ts
export type SpecimenGradeKey = 'gold' | 'in-motion' | 'first-party' | 'reference' | 'basic'
export interface SpecimenGrade { key: SpecimenGradeKey; label: string }
export function specimenGradeFor(entry: PitchAtlasEntry): SpecimenGrade
```

- [ ] **Step 1 — failing test** `src/data/specimen-grade.test.ts`:
```ts
import { describe, it, expect } from 'vitest'
import { specimenGradeFor } from './specimen-grade'
import { PITCHES } from './pitches'

const bySlug = (s: string) => PITCHES.find((p) => p.display.slug === s)!

describe('specimenGradeFor', () => {
  it('grades the four-seam (specimenNo 00) as the gold 1/1 chase', () => {
    expect(specimenGradeFor(bySlug('four-seam')).key).toBe('gold')
  })
  it('grades a first-party moving-clip pitch as in-motion', () => {
    // two-seam carries Austin's own moving grip clip
    expect(specimenGradeFor(bySlug('two-seam')).key).toBe('in-motion')
  })
  it('grades a reference-only filed pitch (circle-change, note-only) as reference', () => {
    expect(specimenGradeFor(bySlug('circle-change')).key).toBe('reference')
  })
  it('is a pure function — identical input, identical grade', () => {
    const a = specimenGradeFor(bySlug('slider'))
    const b = specimenGradeFor(bySlug('slider'))
    expect(a).toEqual(b)
  })
  it('never returns a number or scarcity-count language', () => {
    for (const p of PITCHES) {
      const g = specimenGradeFor(p)
      expect(g.label).not.toMatch(/\d/)
      expect(g.label).not.toMatch(/left|mint|only/i)
    }
  })
})
```
- [ ] **Step 2 — run, verify it fails** `npm run test -- src/data/specimen-grade.test.ts` (module not found).
- [ ] **Step 3 — implement** `src/data/specimen-grade.ts` as a pure precedence switch over
  `display.specimenNo`, `gripEntryFor(slug)?.clip`, `gripEntryFor(slug)?.photos`,
  `canonical.gripImages`. Labels: gold=`1/1 Gold`, in-motion=`First-party · in motion`,
  first-party=`First-party grip`, reference=`Reference specimen`, basic=`Basic file`.
  Verify the clip/photo lookup matches `PitchSpecimenCard.tsx:62-71` (reuse `gripEntryFor`).
- [ ] **Step 4 — run, verify pass.** Adjust the expected slugs only if a real data check
  (`gripEntryFor('two-seam').clip`, `circle-change` note-only) proves a different truth — the test
  encodes the data, not a wish. Commit.

### Task C2: Render the grade as one stamp, replacing the redundant attr-row

**Files:** Modify `src/components/refractor/RefractorCard.tsx` (props + the `.rfx-attrrow`
block 203-209); `src/components/refractor/PitchSpecimenCard.tsx`; `src/components/v2/ChromeWall.tsx`;
`src/index.css` (new `.rfx-grade` near 822).

**Interfaces — Consumes:** `SpecimenGrade` from C1.

- [ ] First grep tests for the strings being removed: `grep -rn "Family ·\|Source ·\|Edition ·" src`.
  If any test asserts them, update that test in this task.
- [ ] Add `grade?: { key: string; label: string }` to `RefractorCardProps`. Replace the three-chip
  `.rfx-attrrow` (Family/Source/Edition — Family already shows in the seal coin, Source already
  shows as the plate confidence dot/badge) with a single `.rfx-grade` stamp rendering
  `grade.label`, carrying `data-grade={grade.key}` for per-tier styling and reusing `is-gold` for
  the gold case. Keep it `aria-label`'d ("Specimen grade: …").
- [ ] `PitchSpecimenCard.tsx`: compute `const grade = specimenGradeFor(entry)` and pass it.
- [ ] `ChromeWall.tsx`: pass `grade={specimenGradeFor(entry)}` to its wall cards.
- [ ] `src/index.css`: add `.rfx-grade` — a foil-edged uppercase mono stamp at ≥8px under the
  banner, with a gold variant under `.rfx-card.is-gold` and a phone rule in the existing
  `@media (max-width: 480px)` block. Match the chip vocabulary already there.
- [ ] Run `npm run typecheck && npm run test`. Verify the card in preview: banner → grade stamp →
  READ plate, gold four-seam reads "1/1 Gold". Commit.

### Task C3: Frame `/repertoire` as a graded collection (rarity legend)

**Files:** Modify `src/components/sections/PitchIndex.tsx` (add a compact legend above the family
groups, using the existing `STATUS` map ~44-53).

- [ ] Add a small, dismissible-free legend strip that names the four live tiers
  (Standard · Niche · Rare · Near-extinct) with their existing accent dots and a one-line read
  ("how rare the pitch is in the game"), and a short note that banned/alias/illusion/not-a-pitch
  are honest edges, not chase tiers. Read every label/count off `REPERTOIRE` + the `STATUS` map —
  invent nothing. Keep the edge styling (`text-seam`) intact.
- [ ] Verify the legend renders on `/repertoire` at desktop + mobile, no overflow. Commit.

### Task D: Verify, review, ship

- [ ] `npm run typecheck && npm run lint && npm run test && npm run build` all green.
- [ ] `npm run preview` + the browser smoke (`npm run test:preview:browser -- http://127.0.0.1:4173`).
- [ ] Visual proof: capture home hero card, the chrome wall, `/repertoire`, a pitch detail, at
  desktop + mobile. Confirm the grade stamp, the legend, the legibility bumps, no slogan sign-off.
- [ ] Dispatch `design-for-ai:design-review-agent` on the rendered surface; fix any real finding.
- [ ] Open a PR to `main`, watch checks, merge, trigger `deploy-cloudflare-pages.yml`, verify live.

## Self-Review

- **Spec coverage:** Stale language → A1/A2/A3. Polish → B1/B2/B3. Collectible "Pokédex" slice
  (grade-from-truth + dex framing) → C1/C2/C3. Deferred live-data phases documented (P2–P4). ✔
- **Anti-fabrication:** C1 is a pure switch with a test asserting no digits / no scarcity words;
  C3 reads only existing counts/labels. ✔
- **Charter:** the sanctioned "Sourced, not corrected" homes are explicitly left untouched and
  re-verified by A2; `routes.test.tsx:183` stays valid. ✔
- **Type consistency:** `specimenGradeFor`/`SpecimenGrade`/`SpecimenGradeKey` used identically in
  C1→C2; the `grade` prop shape (`{ key, label }`) matches across RefractorCard/PitchSpecimenCard/
  ChromeWall. ✔
