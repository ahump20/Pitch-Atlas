# Pitch Workbench Implementation Plan

> **For Claude:** execute inline with superpowers:executing-plans, task by task, in one session, one branch. Ship it the same session.

**Goal:** turn the card library + inspector into one connected bench (pitch → grip → release → flight), with two-pitch comparison as the signature interaction, and ship it live.

**Architecture:** the existing inspector dialog becomes the bench and mounts on every page. Its state stays in the URL so Back closes it. It grows four aspects (Card · Grip · Release · Flight) and a compare mode. The compare mode is one component, shared by the dialog and the `/compare` page. A small linked-orbit store keeps two ball canvases on the same camera.

**Tech stack (as is):** Vite 8, React 19.2, react-router 7, Radix, three 0.185 / r3f 9.7 / drei 10.7, Tailwind v4, vitest 5, Playwright, Node 24.

---

## Context

Austin asked for a connected pitching workbench. The atlas stays a field manual for grip craft, and the card's beauty supports the lesson. Two references set the bar:
- Hangzhou miniature: overview to detail, with the selected model in your hands and a sense of place.
- Codebase City: select one thing and only its relationships light up.

What a visitor hits today (live site and `origin/main` @ 885e8ab, checked this session):
- The inspector opens only on the home page. On the Pitch Index, clicking a pitch sends you off to a long chapter page, so the collection is gone.
- On `/compare` both balls are frozen and drag does nothing. Each grip's source sits inside a collapsed "About this reference" panel.
- The compare flight plot has a sign bug. Its mid-flight bow reads the authored spin vector, whose sideways sign disagrees with the pitch's own arm/glove side. So 8 of 9 sideways pitches bend the wrong way before landing on the right side.
- Back after "Study grip" and then Close leaves a duplicate history entry.

**What a visitor gets after this ships:**
- **Open in place.** On the Pitch Index, clicking a filed pitch opens its bench right there. Filters, scroll and the row you clicked all stay.
- **Aspects of one specimen.** Card shows the holo card with finish and export, as today. Grip is a turnable ball with the hand on it, view presets and finger chips. Release shows hold, pressure and leave, plus the sourced mechanics. Flight shows the sourced shape words and an illustrative path.
- **Compare with another pitch.**
  - On desktop the two balls sit side by side. Turning one turns the other, a visible Linked/Unlinked switch breaks the link, and Reset puts both back.
  - On a phone you get one ball and an A/B switch at the same camera, so it reads as a blink comparison.
  - Pick a finger and both hands light that finger while every unrelated row dims.
- **Honest labels.** Every sourced line wears its confidence badge. Lines the reference hand model wrote (where a finger meets the seam, the release cues) carry the model's own badge instead of looking sourced. Flight says "Illustrative" and shows no numbers.
- **Close puts you back.** Close or Back returns you to the same filtered list, at the same scroll, with focus on the row you came from.

## Decisions (load-bearing)

1. **The bench is the inspector dialog, mounted in RootLayout.** It is not a new page. `/compare` stays as the full-page, shareable host of the same compare component, and its URL contract (`a, b, view, hand, orientation`) is unchanged.
2. **URL contract for the dialog:** `?inspect=<a>&with=<b>&aspect=card|grip|release|flight&orientation=top|side|thumb&hand=right|left`.
   - `with` and `aspect` are the only new names. `view` is already taken by the index (`rows|binder`), so the ball preset reuses compare's `orientation`.
   - Opening pushes one entry carrying history state `{ bench: true }`. Changing aspect, partner, orientation or hand replaces it. Close goes back when the entry carries the state and otherwise replaces, which fixes the duplicate-entry bug. Opening the slug that is already open does nothing.
3. **There is no per-pitch seam orientation in the data.** All pitches share one cover, and the seam is never rotated. The "seam" difference is therefore where each finger meets the seam: contacts matched by `finger`, never by `label`, since labels differ per pitch and circle-change has four contacts.
   - Nothing derives an angle, tilt or orientation from `motion.spinAxis`.
   - The spin/Magnus vector stays off: its sideways sign contradicts `horizontalDir`.
4. **Provenance shows what's sourced and what's model-authored.**
   - Claim badges sit on `grip`, `gripDetails`, `mechanics`, `voice` and `physics.*`.
   - One `GripSourceBadge` per hand, carrying `gripModel.provenance`, sits beside its stage. It covers contacts, `palmGapCue`, `pressureRole` and `releaseCue`, which carry no Claim of their own.
   - `visualCaveat` sits on the stage.
   - The stage chip reads "Reference model" on 3D and "Seam-informed schematic" on 2D.
5. **Flight is illustrative only.** `TunnelPlot` is reused after the sign fix. There is no Flight Lab link: it is a slow-pitch batters' lab, baseball mode is parked by Austin's 2026-10-24 decision, and no pitch pair has a measured or simulated path.
6. **Reduced motion or no WebGL:** `SeamSchematic` per side, the same rule `GripViewer` uses. It still takes `view` and `handedness`, so presets and hand still work. Link and drag hide because there is nothing to turn.
7. **Compare mode has no Card aspect,** so no foil canvas is mounted. That keeps compare to two ball canvases.

## Global constraints

- Work in a fresh worktree off `origin/main`. Never write in the dirty `flight-room` checkout, which holds 46 modified files of someone's uncommitted work. Never push to main: merge by PR with a merge commit, as the repo does.
- The seam copy says "seam-informed schematic", never "seam-accurate". No spin, velocity or break figures; pitch behavior is shape language. Every visible claim keeps its Source and confidence. No medical, injury, workload or youth claims. No fake live indicators, adoption counts or performance promises.
- Leave `Ball.tsx`, `Hand.tsx`, `MovementMap.tsx` and `MovementPlot` code, and `MovementMapPage.tsx` untouched, so `feat/flight-room` stays mergeable.
- Design system:
  - `rfx` controls (`.rfx-seg`, `.rfx-chip`, `.rfx-select`)
  - cyan `#5FE0EA` only on interactive state
  - family accent via `accentForSlug`
  - foil on the Card aspect only
  - no new glow or gradients
  - matte plates behind text
  - no helper text or taglines
- Four states on every surface. One canvas per stage, disposed on unmount. Every gesture has a visible control. Canvas text also lives in the DOM. Reduced motion uses the root hook (`src/hooks/useReducedMotion.ts`).
- Delete replaced code in the same commit: the frozen-ball grips view on `/compare`, the collapsed `<details>` badge, `GripCompare`'s unreachable no-provider branch, and `CompareButton`'s no-provider fallback.
- Commits use `type(scope): description`, plus the attribution lines. Use Context7 before relying on any drei, three or Radix API.
- Measured headroom: three-core is 725 kB of its 800 kB budget, react-three 424 of 500, and the SpecimenInspector chunk is 45 kB. The aspects can live in the inspector chunk; the budget test confirms.

## Review focus

History behavior across open, aspect, partner, close, Back, Forward and a deep link. The linked-orbit feedback guard. No camera reset on the phone A/B swap. Badge honesty: no model string reads as sourced. The TunnelPlot sign fix across all 11 filed pitches. Focus return to the opener.

---

## Task 0: Land the work this builds on, set up, take a baseline

1. **#249** (Codex, focus restore, reduced-motion scrolling, tall-screen fit) is still draft and `verify`=FAILURE from the Supabase DNS outage.
   - Run `gh run rerun <id> --failed`. If it goes green, review the diff (opener focus, `pan-y`, `--room-height`), then `gh pr ready 249` and `gh pr merge 249 --merge`.
   - If it fails for a non-DNS reason, don't cherry-pick Codex's work. Branch the bench from `codex/holo-card-handoff-20261023` and land it after #249.
2. **#248** (pitcher's-view wording, green) → `gh pr merge 248 --merge`.
3. **Leave alone:** #246, #247, #227, #128, the Dependabot PRs (#236 included) and `feat/flight-room`.
4. **Worktree:**
   - `git fetch && git worktree add .claude/worktrees/pitch-workbench -b feat/pitch-workbench origin/main`
   - EnterWorktree with `path`
   - `nvm use && npm ci`
   - `df -h ~` (41 GB free now)
5. **Baseline:**
   - `npm run build`, recording the `dist/assets` chunk sizes
   - Lighthouse mobile on `/repertoire/` and `/compare` (headless chrome-devtools, anonymous pages)
   - desktop 1440×900 and phone 390×844 captures of the index, the inspector and `/compare`
6. **Musepool precedent**, one query per dimension, kept to the retrieval budget:
   - side-by-side specimen comparison with linked views
   - relationship highlighting that dims the unrelated
   - phone A/B blink comparison

   Record the borrowed constraints, and the palette JSON = design-language tokens (a hard constraint), in `docs/superpowers/specs/2026-10-26-pitch-workbench-design.md`. Copy this plan to `docs/superpowers/plans/2026-10-26-pitch-workbench.md`. Commit with `docs(bench): …`.

## Task 1: One URL contract for the bench

**Files:** `src/components/inspector/useInspector.ts`, `inspectorContext.ts`, `InspectButton.tsx`; test `src/components/inspector/useInspector.test.tsx` (new).

```ts
export type Aspect = 'card' | 'grip' | 'release' | 'flight'
export interface InspectorApi {
  slug: string | null
  partner: string | null
  aspect: Aspect
  orientation: GripView
  hand: Handedness
  collection: string[] | null // filtered filed order from the index; in memory only, not in the URL
  open(slug: string, opts?: { aspect?: Aspect; partner?: string; opener?: HTMLElement | null; collection?: string[] }): void
  set(patch: Partial<{ slug: string; aspect: Aspect; partner: string | null; orientation: GripView; hand: Handedness }>): void // replaces
  close(): void
}
```

- Keep the existing filed-slug guard. Drop `with` when it isn't a different filed slug. Compare mode forces `aspect` off `card`, landing on `grip`. Default aspect: `card` from a card, `grip` from the index or tray.
- Validate hand and orientation through `normalizeSelection` in `src/components/compare/selection.ts`; no second store. Choosing a partner also writes the pair to the compare store, so the tray stays in sync after close.
- **Write the failing tests first:**
  1. open→close leaves history length unchanged
  2. closing a deep link replaces
  3. chapter → Back to `?inspect=` → Close leaves no extra entry
  4. a bad `with` is dropped
  5. `set` replaces
  6. a second open of the same slug is a no-op
  7. compare plus `aspect=card` becomes `grip`

  Run `npx vitest run src/components/inspector`: red, then implement, then green.
- Commit `feat(bench): one address for the bench, its aspect and its pair`.

## Task 2: Mount the bench on every page

**Files:** `src/components/layout/RootLayout.tsx` (wrap the outlet in `SpecimenInspectorHost`, inside `CompareProvider`), `src/pages/AtlasHomeV2.tsx` (remove its host, lines 44–58), `SpecimenInspectorHost.tsx` (fix the "home page" comment; pass `partner` and `aspect`), `SpecimenInspectorHost.test.tsx`.

- Test: with no `?inspect`, the host renders no dialog markup, so the prerender gate stays clean. `?inspect=slider` on `/repertoire` opens it.
- Commit `feat(bench): open the bench from any page`.

## Task 3: Aspects inside the inspector (single specimen)

**Files:** `SpecimenInspector.tsx` (Radix Tabs "Card · Grip · Release · Flight" in the header; Card = today's content untouched; the tab panels below), new `src/components/inspector/aspects/GripAspect.tsx`, `ReleaseAspect.tsx`, `FlightAspect.tsx`; new `src/components/pitch/ReleaseRoom.tsx` and `src/components/pitch/ShapeRead.tsx`, moved out of `src/pages/PitchChapter.tsx` (Release Room L295–333, Movement read L336–420); `src/styles/inspector.css`.

- **GripAspect:**
  - `BallStage` with `grip faceGrip interactive autoSpin={false} view={orientation} handedness={hand} activeContact` (not `GripViewer`: its local view and hand state would drift from the URL)
  - presets and hand as `.rfx-seg`
  - finger chips in `label · pressureRole` form; a chip sets `activeContact` to that pitch's contact label
  - stage chip and `GripSourceBadge`, the `visualCaveat` line, and `canonical.grip` via `ClaimProse`
  - unfiled → `GripUnfiledState`
  - R resets the camera
- **ReleaseAspect:** the moved `ReleaseRoom` (Hold = `palmGapCue`, Pressure = the primary finger's `pressureRole`, Leave = `releaseCue`) gains the hand-model badge, and `mechanics`/`voice` keep their own Claim badges. The chapter renders the same component.
- **FlightAspect (single):** the moved `ShapeRead` (shape words, the `physics.*` Claims, the craft read).
- **Bench header:**
  - a "Compare with" `.rfx-select` of the filed pitches, which sets `with`
  - the rail's Compare toggle goes, so there is one compare control
  - ‹ n of N › appears only when opened with a `collection`; it replaces the slug
  - each aspect ends with one link to its chapter section; the rail's "Study grip →" stays on Card
- **Tests** (`SpecimenInspector.test.tsx`):
  - tabs render and switching calls `set`
  - Card still offers Finish and Export
  - Grip shows the badge, the chips and the "Seam-informed schematic" chip (jsdom has no WebGL)
  - Release badges sit on the mechanics
  - Flight shows the physics Claims
  - eephus → unfiled state
  - the chapter still renders the Release Room and the shape read
- One commit per aspect: `feat(bench): the grip aspect`, and so on.

## Task 4: Compare mode, the signature

**Files:** new `src/components/ball/orbitLink.ts` (+ `orbitLink.test.ts`), `src/components/ball/BallStage.tsx` and `three/BallScene.tsx` (optional `link` and `linkId` props), new `src/components/inspector/CompareBench.tsx`, `src/pages/ComparePage.tsx`, `src/components/compare/CompareTray.tsx`, `src/components/sections/TunnelPlot.tsx` (+ `TunnelPlot.test.ts`).

```ts
// orbitLink.ts: a tiny external store, no React
export interface CameraPose { azimuth: number; polar: number }
export interface OrbitLink {
  linked: boolean
  setLinked(v: boolean): void
  publish(from: 'a' | 'b', pose: CameraPose): void
  subscribe(id: 'a' | 'b', fn: (pose: CameraPose) => void): () => void
  reset(): void
  onReset(fn: () => void): () => void
}
export function createOrbitLink(): OrbitLink
```

- **BallScene wiring.**
  - When linked, OrbitControls `onChange` publishes `{ azimuth: getAzimuthalAngle(), polar: getPolarAngle() }`.
  - The receiver calls `camera.position.setFromSphericalCoords(r, polar, azimuth)`, then `controls.update()` and **`invalidate()`**, since both canvases are `frameloop="demand"`. A re-entrancy flag stops echo loops.
  - Reset calls `controls.reset()` on both stages, then invalidate.
  - Presets turn the ball (FaceGroup) while orbit moves the camera. They compose; don't merge them.
- **Desktop layout:**
  - Both stages sit side by side, each with its name, a 2 px family-accent edge, the stage chip and its badge.
  - A toolbar sits under them: Linked/Unlinked (`aria-pressed`), Reset, presets, hand, Swap, Remove.
  - Unlinked, each ball turns on its own.
- **Phone (<640 px):**
  - One stage with an A/B `.rfx-seg` above it. Swap the `entry` prop inside the one mounted canvas: never key it by slug, so the camera holds.
  - Link is hidden, since the camera is shared by construction.
- **Rows under the stages, per aspect:**
  - **Grip:** "Where it meets the seam" (both `canonical.grip` Claims), then one row per finger (Index / Middle / Ring / Thumb). Each finger row shows A's and B's `label · seamRelation · pressureRole`, or "No contact".
    - A quiet "differs" mark appears only when the model's `engagement` or `pressureTier` enums differ.
    - Selecting a row sets `activeContact` on both balls, mapped by `finger`, and dims the other rows (`data-dim`).
  - **Release:** Hold / Pressure / Leave rows (model badge) and both `mechanics` Claims.
  - **Flight:** `TunnelPlot selection={{a, b, hand}} hideControls` takes the stage area, with an "Illustrative" chip and one line: shared release, seen from the mound, left-handed is a mirror, no magnitudes; a grip does not guarantee this shape. Both `ShapeRead`s sit side by side.
- **`/compare` page:** render `CompareBench` full page, mapping `view` (grips→grip, cues→release, movement→flight). Delete the frozen grips view, the `<details>` badge and `CueComparison` in favour of the shared rows; the empty state stays.
- **CompareTray:** its Compare action calls `open(a, { partner: b, aspect: 'grip' })` in place, keeping its `href` to `/compare` for no-JS.
- **TunnelPlot fix.**
  - L94: `ctrlX = baseX + hSign * Math.abs(force.x) * handFactor * bow`. The side comes from `horizontalDir` (`hSign`, L75); only the magnitude comes from the vector.
  - L12: "catcher's-eye" becomes the pitcher's view.
  - Export `plot` for the test, which asserts across all 11 filed pitches that the bow leans to the same side as the endpoint and that `horizontalDir: 'none'` doesn't bow sideways.
- **Tests:**
  - orbitLink: publishes only while linked, has no echo, and reset fans out
  - CompareBench (jsdom/schematic): two stages at desktop width and one with A/B under 640 px, finger mapping by `finger` (circle-change's ring with no partner shows "No contact"), and row dimming
  - `compare.test.tsx` updated
- Commits: `fix(tunnel): …`, `feat(compare): …`.

## Task 5: Collection to bench and back

**Files:** `src/components/sections/PitchIndex.tsx` (`EntryRow` L213–264, `BinderSheet` / `RepertoirePocket`), `PitchIndex.test.tsx`.

- A plain primary click on a filed row or pocket calls `open(slug, { aspect: 'grip', opener: e.currentTarget, collection: filteredFiledSlugs })` with `preventDefault`.
- Meta, ctrl, shift and middle clicks, and no-JS, follow the `href` to the chapter.
- Unfiled basic files keep their `/repertoire/<id>` links.
- Tests:
  - a plain click opens with filters intact
  - a meta-click doesn't intercept
  - the collection follows the filtered order
  - the 13 existing tests still pass
- Commit `feat(index): a pitch opens in place, the list stays put`.

## Task 6: States, motion, access

- **Loading:** `BallStage` already shows the schematic, so there's no spinner.
- **No WebGL or reduced motion:** schematic per side.
- **Context loss:** the `SpecimenBoundary` fallback shows the schematic plus one plain line.
- **Unfiled pitch:** `GripUnfiledState`, with that side's rows reading "Not filed".
- **Repeat clicks:** idempotent.
- **Switching:**
  - Repeated A/B toggles don't grow geometry. Check `renderer.info.memory.geometries` over 20 toggles and cache per slug if it does.
  - Opening compare over the home page throws no "too many WebGL contexts".
- **Close:** focus goes to the opener (from #249).
- **Back:** closes the bench and restores scroll (`ScrollManager` keeps the same pathname and restores on POP).
- **Reduced motion:** damping off and presets instant.
- **Access:**
  - Tabs use Radix's roving focus.
  - Each stage's `aria-label` names the pitch, the preset and the link state.
  - Chips and rows are real buttons with `aria-pressed`.

## Task 7: Collectible finish

- Matte plates behind all text over stages, the family-accent edge, and cyan only on Linked-on and the selected row. The active finger keeps `Hand.tsx`'s existing `#4B92DB`, untouched.
- No glow on the stages. Foil never shows in compare.
- Run `python3 ~/.claude/skills/synced/7613321f-aa97-4c1f-8685-2f3fc98a0fbd_aa751d02-dd7a-4eec-af1e-25acc3094a09/musepool/scripts/muse_audit.py src/components/inspector src/components/ball/orbitLink.ts src/styles/inspector.css --fail-on fail`, fix, rerun.
- Look at the captures against the two references and fix real defects only.

## Task 8: Prove it

1. **Smoke:** extend `scripts/preview-browser-smoke.mjs` with `checkBench(page, viewport, { webgl, reduced })` and bump `Smoke N/24`. It walks:
   - `/repertoire/?family=breaking`, scroll, click Slider
   - the URL keeps `family=breaking` and gains `inspect=slider&aspect=grip`
   - Release tab → `aspect=release` with no new history entry
   - Compare with Cutter → `with=cutter`, two stages at 1280 and one plus A/B at 390
   - Linked `aria-pressed`, and Reset is present
   - the Index row → other rows `data-dim`
   - Flight → the TunnelPlot svg and "Illustrative"
   - no `/\d+\s?(mph|rpm|in\b|inches|°)/` inside the dialog
   - Close → dialog detached, the URL equals the filter URL, `scrollY` within 2 px, focus on the Slider link
   - zero console errors

   Run it at 1280×900, at 390×844, with `{ webgl: false }`, and with `{ reduced: true }` (`emulateMedia`).
2. **Gates:** `npm run typecheck && npm run lint && npm run test && npm run build`, then `npm run preview` + `node scripts/preview-browser-smoke.mjs http://localhost:4173`.
3. **Exports:** from the bench's Card aspect, export PNG (1800×2513) and WebM (1440×2010, about 7 s) and check that both download and open.
4. **Performance:** rebuild and compare chunk sizes against the baseline (the budget test enforces them). Rerun Lighthouse mobile on `/repertoire/` and `/compare`, and report the deltas as measured.
5. **Look:**
   - Desktop and phone captures of the central proof: index → Slider grip → compare Cutter, linked → drag A (B follows) → finger row → Flight → Close → the same index.
   - Judge against the references and against the job: can a reader see where the two hands differ? List only real problems, fix them, recapture.
6. Checkpoint: commit and refresh the `/remember` handoff.

## Task 9: Ship

- Push the branch. `gh pr create`; the body covers what visitors see, the evidence and the limits, and ends with the Claude Code line.
- Wait for CI `verify`, which includes the hosted PR-preview smoke, and for CodeRabbit. Fix real findings.
- `gh pr merge <n> --merge`.
- `gh workflow run deploy-cloudflare-pages.yml --ref main` and `gh run watch`. The workflow runs preview → smoke → production.
- Live check in Austin's Chrome (claude-in-chrome): walk the central proof on pitch-atlas.com at desktop and phone width, then close my tabs.
- Same-pass doc fixes:
  - `src/data/pitches/_shared-seam.ts` L12: drop the untrue "rotated by the spin-axis quaternion"
  - `docs/seam-calibration.md`: 108 → 216 stitches, and "all five specimens" → the 11 filed
  - `MovementPlot`'s false "oriented to the pitch's spin axis" comment (comment only)

## Not in this pass (said plainly)

- Seam-tube highlighting: its materials are fixed, so it needs new material work in `Ball.tsx`.
- Spin or force arrows: their sign contradicts `horizontalDir`.
- Any Flight Lab link.
- A Card aspect in compare mode.
- Changing the `official-data` label on paraphrased master prose. That's Austin's provenance call, so it gets flagged, not changed.

## Report to Austin must name

- No Flight Lab link, and why.
- `feat/flight-room` overlaps the shape map and compare slots, and its fate is still his open call. This work avoids its files.
- Hero and compare headings are serif, but the design language says Anton. Flagged, not changed site-wide.
- The frame-wording fixes.
- The untrue seam-rotation line and the stale seam-doc lines.
- The `official-data` label question.
- #246 and #247 are green and still his to merge.
- The measured performance deltas.
- The live link.

## Self-review

- **Spec coverage:**
  - coherent bench → T1–T3, T5
  - signature compare (sync, unlink, matching views, reset, independent inspection, differences, mobile) → T4
  - relationships teach → T4 rows and T3 badges
  - collectible quality → T7
  - every state, no-WebGL, reduced motion → T6
  - central proof → T8.1 and T8.5
  - process (PRs, review, gates, performance, exports, deploy, production) → T0, T8, T9
- **Types:** `Aspect`, `InspectorApi`, `CameraPose`, `OrbitLink` are the same names wherever they're used.
- **Placeholders:** none. The run id in T0 comes from `gh pr checks 249`.
