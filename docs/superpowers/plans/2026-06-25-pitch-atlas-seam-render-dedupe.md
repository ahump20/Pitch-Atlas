# Plan: De-duplicate the 2D seam-projection helpers (schematic ↔ hero ball)

> **Executor instructions**: Follow this plan step by step. This one touches the
> SIGNATURE 3D hero ball, so the render-equivalence proof in Step 2 is a hard gate —
> do not skip it. If anything in "STOP conditions" occurs, stop and report.
>
> **Drift check (run first)**:
> `git diff --stat 2dac802..HEAD -- src/lib/seam2d.ts src/components/refractor/RefractorBall.tsx src/lib/seam.ts`
> If any of those changed since this plan was written, compare the "Current state"
> excerpts to the live code before proceeding; on a mismatch, STOP.

## Status

- **Priority**: P3
- **Effort**: S
- **Risk**: MED — changes how the prerendered hero ball computes its seam path; a
  silent geometry shift would degrade the product's signature medium.
- **Depends on**: none
- **Category**: tech-debt
- **Planned at**: commit `2dac802`, 2026-06-25

## Why this matters

`src/components/refractor/RefractorBall.tsx` (the hero/grail ball, prerendered)
hand-copies four helpers — `projectSeam`, `pathOf`, `splitRuns`, `buildStitches` —
that already live, exported, in `src/lib/seam2d.ts` (the schematic / carry diagram).
The copies have already drifted (`seg = 300` vs `segments = 280`; `buildStitches`
`every=6,len=9` vs `every=5,len=6`). The *seam geometry itself* can't disagree
(both ultimately call `seamPoint`/`orientedSeamPolyline` from `lib/seam.ts`), so
this is not an active bug — but two copies of the projection/path logic mean a
future change to one silently desyncs the ball from the schematic. Collapsing to one
source removes that trap. **The differing constants are intentional visual tuning and
must be preserved as call-site arguments, not erased.**

## Current state

- `src/lib/seam2d.ts` already EXPORTS the canonical helpers:
  - `projectSeam(cx, cy, r, segments = 280): P2[]` → `orientedSeamPolyline(segments, 1)`
    mapped to screen space (`y` flipped).
  - `pathOf(run): string`, `splitRuns(points): {front, d}[]`,
    `buildStitches(points, every = 5, len = 6): Stitch[]`.
  - `splitRuns` ends with `if (cur.length > 1) runs.push(...)`. **This guard is
    correct and deliberate** — on a front/back flip the connecting point is appended
    to the closing run (`cur.push(p)` before `runs.push`), so the segment is drawn;
    the dropped trailing run is a single point whose SVG path (`M x y`) renders
    nothing. Do NOT "fix" it to `> 0`.
- `src/components/refractor/RefractorBall.tsx` lines ~17–64 re-declare local `type P`
  plus `projectSeam(cx, cy, r, seg = 300)`, `pathOf`, `splitRuns`, `buildStitches(
  points, every = 6, len = 9)`. The local `projectSeam` body is
  `v.rotateAxis(seamPoint((i/seg)*Math.PI*2, 1), SEAM_VIEW_TILT.axis, SEAM_VIEW_TILT.angle)`
  over an INCLUSIVE `for (i = 0; i <= seg; i++)` loop.
- `src/lib/seam.ts:117` — `orientedSeamPolyline(segments, radius=1)` is
  `seamPoint(t)` rotated by `SEAM_VIEW_TILT`. **Open question the executor must
  resolve in Step 2**: does `orientedSeamPolyline(N, 1)` emit the same point
  sequence (count + closure) as RefractorBall's inclusive `0..seg` loop? If the loop
  counts differ (N vs N+1 points, open vs closed), passing `seg` straight through
  will shift the path. The exported `projectSeam` returns screen-space points with
  `y` flipped (`cy - p.y * r`) — confirm RefractorBall's local copy flips `y` the
  same way (it does: `y: cy - p.y * r`).

## Commands you will need

| Purpose   | Command            | Expected on success |
|-----------|--------------------|---------------------|
| Typecheck | `npm run typecheck`| exit 0              |
| Tests     | `npm run test`     | all pass            |
| Build     | `npm run build`    | 107 routes prerendered, prerender-integrity passes |
| Lint      | `npm run lint`     | 0 errors            |
| Preview   | `npm run preview`  | serves dist/ for visual check |

## Scope

**In scope**:
- `src/components/refractor/RefractorBall.tsx` — delete the 4 local helpers + local
  `type P`; import from `seam2d.ts`; pass the ball's existing constants as args.
- `src/lib/seam2d.ts` — ONLY if Step 2 proves a parameter is needed to reproduce the
  ball's exact polyline (e.g. an `inclusive`/closed flag). Prefer not to touch it.

**Out of scope**:
- `src/lib/seam.ts` — the seam math is already the shared source of truth; do not
  change it.
- The 4 existing consumers of `seam2d.ts` (`SeamSchematic`, `PitchIndex`,
  `CarryDiagram`, `MovementPlot`) — their behavior must not change.
- `buildStitches` default values in `seam2d.ts` — the schematic relies on `5/6`.

## Steps

### Step 1: Prove point-sequence equivalence BEFORE deleting anything

In a scratch test (or a temporary `console.log` you remove), compare, for the ball's
parameters, `projectSeam` from `seam2d.ts` against RefractorBall's local
`projectSeam` for the SAME `seg`. Compare the resulting arrays element-by-element
(within a small float epsilon).

**Verify**: arrays match in length and values. If `orientedSeamPolyline(seg,1)`
yields `seg` points but the inclusive loop yields `seg+1` (or the closure differs),
do NOT proceed to a blind swap — go to STOP conditions and report the exact
mismatch with counts.

### Step 2: Swap RefractorBall to the shared helpers

Once Step 1 proves equivalence, in `RefractorBall.tsx`:
- add `projectSeam, pathOf, splitRuns, buildStitches` (and the `P2`/`Stitch` types
  if referenced) to the existing import from `../../lib/seam2d`.
- delete the four local function declarations and the local `type P`.
- at the call sites, pass the ball's tuned constants explicitly:
  `projectSeam(cx, cy, r, 300)` and `buildStitches(points, 6, 9)` — preserving
  today's `seg=300`, `every=6`, `len=9`.

**Verify**: `npm run typecheck` → exit 0; `npm run lint` → 0 errors.

### Step 3: Prove the rendered ball is unchanged

`npm run build` then `npm run preview`. Load a pitch detail page (e.g.
`/pitch/four-seam`) and the home hero. The hero ball's seam line, stitches, and
grip pins must look identical to production (`pitch-atlas.com`). Compare against a
before screenshot.

**Verify**: `npm run build` → 107 routes prerendered, prerender-integrity passes.
Visual: seam + stitches + grip pins unchanged at desktop and mobile widths.

### Step 4: Commit

Conventional-commit style (see `git log`): e.g.
`refactor(seam): share the 2D projection helpers between the hero ball and schematic`.

## Test plan

- No new unit test is strictly required (pure refactor), but if Step 1's
  equivalence check is worth keeping, land it as `src/lib/seam2d.equivalence.test.ts`
  asserting `projectSeam(...,300)` is stable. Optional.
- Verification is primarily the existing suite + the build's prerender-integrity
  test + the visual diff in Step 3.

## Done criteria

ALL must hold:
- [ ] `grep -n "function projectSeam\|function splitRuns\|function pathOf\|function buildStitches" src/components/refractor/RefractorBall.tsx` returns nothing (locals gone)
- [ ] `RefractorBall.tsx` imports those names from `../../lib/seam2d`
- [ ] `seam2d.ts` `buildStitches` defaults still `every = 5, len = 6`; `splitRuns` guard still `> 1`
- [ ] `npm run typecheck` exits 0; `npm run lint` 0 errors; `npm run test` passes
- [ ] `npm run build` prerenders 107 routes, prerender-integrity passes
- [ ] Visual: hero ball seam/stitches/grip pins unchanged vs production (Step 3)

## STOP conditions

Stop and report (do not improvise) if:
- Step 1 shows the point sequences differ (count, order, or closure) — report the
  exact difference. The fix may need a small closed/inclusive flag on the shared
  `projectSeam`, which is a design decision, not an improvisation.
- The visual diff in Step 3 shows ANY change to the hero ball — revert and report.
- The refactor appears to require changing `seam.ts` or any of the 4 existing
  `seam2d.ts` consumers.

## Maintenance notes

- After this lands, `seam2d.ts` is the single home for 2D seam projection; any future
  seam-shape change belongs there and will flow to both the schematic and the ball.
- A reviewer should confirm the ball's tuned constants (`300`, `6`, `9`) survived as
  explicit arguments and were not silently normalized to the schematic's defaults.
- The `splitRuns` `> 1` guard is intentional (documented above); a future "lint
  cleanup" that flips it to `> 0` is a regression, not an improvement.
