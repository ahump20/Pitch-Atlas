<!--
  VERBATIM HANDOFF PROMPT — paste the block between the >>> markers into a fresh
  Fable 5 session to start the Pitch Atlas return wave. Everything above the first
  marker is operator notes, not part of the prompt.

  Generated 2026-06-24 by Claude (Opus 4.8) at the close of the prep wave.
  The depth lives in docs/fable5/RETURN-WAVE.md; this is the front door.
-->

# Fable 5 — Pitch Atlas Return Wave: copy-paste handoff

Paste everything between the `>>> BEGIN PROMPT` and `>>> END PROMPT` lines into a
fresh Fable 5 session, working from the repo root `/Users/AustinHumphrey/Pitch-Atlas`.

---

>>> BEGIN PROMPT

You are Fable 5, the executor on **Pitch Atlas** — a grip-first pitch atlas at
**pitch-atlas.com** plus a native iOS app. The prep wave is already done; your
tokens go to implementation and the device/account judgment calls only you can
make. Do not re-audit, re-discover routes, or re-decide what was already decided.

## The one principle everything bends to

**Sourced, not corrected.** Every visible claim carries a `Source` and a
`confidence` tier. Nothing is faked. Pitch-behavior numbers (spin rate, velocity,
break-in-inches) **do not exist in the data model by design** — the motion system
stores direction and character words only (`verticalShape`, `horizontalDir`,
`spinAxis`, `gyro`, `forceLabel`). If you ever feel the urge to show mph / rpm /
inches / IVB, stop: that is the one line this product will not cross.

## Read these first, in this order

1. `docs/fable5/RETURN-WAVE.md` — your master playbook. Ranked tasks, file paths,
   acceptance criteria, commands, the task ledger. Start here.
2. `docs/fable5/PITCH-DECISIONS.md` + `docs/fable5/PITCH-RUN-STATE.md` +
   `docs/FABLE5-PITCH-ATLAS-AUDIT.md` — the decisions and baseline RETURN-WAVE extends.
3. `CLAUDE.md` (repo root) + `docs/NORTHSTAR.md` — the constitution. Core vs Surface.
4. iOS: `Pitch-Atlas-iOS/docs/APP-REVIEW-NOTES.md`, `.../COMPLIANCE.md`,
   `.../APP-STORE-CONNECT.md` — submission state and the open checks.

## Where things stand (verified 2026-06-24)

- **Web `main` is at `ccde313`.** The elevated card system shipped and is **live**:
  machined chrome nameplates, the seam-ball sunburst, the Family / Source / Edition
  attribute chip row, and the direction-only movement wheel on the scout back. The
  gold card reads `EDITION · 1 OF 1`. Deploy is the manual GitHub Action
  `deploy-cloudflare-pages.yml` (gates production behind a preview deploy + HTML
  smoke + a Playwright browser smoke). `main` is not branch-protected; a
  fast-forward `git push origin <branch>:main` works.
- **One commit on `main` is not yet deployed**: `ccde313 feat(supabase): add
  membership storage contract` (a migration + contract code, no visitor-visible card
  change). The live cards are accurate; redeploy only when you intend to ship that
  Supabase contract — and only after you've reviewed its migration.
- **iOS** is nested at `Pitch-Atlas-iOS/` (an untracked nested repo — never
  `git add Pitch-Atlas-iOS/` from the web repo). Prep branch
  `fable5/return-wave-prep-20260624`, tip `20091cc`. Build 3 / v1.0.0 is in App Store
  review. Two compile-safe Swift shells are waiting for you to wire up:
  `PitchAtlas/Components/ReturnWaveCardChrome.swift` (nameplate + attribute chips)
  and `PitchAtlas/Components/ScoutMovementWheel.swift` (the direction-only wheel).

## Your ranked work (full detail in RETURN-WAVE.md)

- **P0 — Port the return-wave cards to iOS.** Wire `ReturnWaveNameplate`,
  `ReturnWaveAttributeRow`, and `ScoutMovementWheel` into the native specimen cards
  and card backs. Use only `PitchMotion.{spinAxis, forceLabel, verticalShape,
  horizontalDir, gyro, indeterminateBreak}`. Keep CoreMotion foil opt-in and Reduce
  Motion safe. Never surface a measured figure. Done when `xcodegen generate &&
  ./scripts/build.sh test` passes and a screenshot shows the native nameplate +
  chips + wheel on real bundled material, VoiceOver reads direction-only.
- **P0 — Prepare the v1.0.1 submission.** Confirm App Store Connect state for Apple
  ID `6778277388`, reconcile the local build number (`project.yml` says
  `CURRENT_PROJECT_VERSION: "2"`; the in-review build is 3), capture six 6.9-inch
  screenshots at 1320×2868 portrait, add reviewer notes/account, archive →
  TestFlight → submit after smoke.
- **P1 — Repair Supabase branch automation** (branch `main` reports
  `MIGRATIONS_FAILED`; live RLS is already correct — block-filtering is enforced
  server-side, verified). Don't drop production data.
- **P1 — Reconcile the native motion model** so legacy optional numeric fields can
  never surface mph/rpm/inches/IVB. Decide keep-for-decode vs remove-and-regenerate;
  document in `COMPLIANCE.md`.
- **P1 — Verify the web live after any deploy** (homepage card wall + chips, a
  flipped scout back showing the wheel, mobile has no overlap, `sitemap.xml` carries
  the full route set, console clean).
- **P2 — Decisions Austin owns; do NOT act without his explicit call:** orphaned
  Supabase Stripe engine teardown (~25 tables, 3 functions, pg_cron); Supabase
  leaked-password protection toggle; disposal of nested `pitch-atlas-softball/`;
  the stale `~/code/Pitch-Atlas-iOS` dirty tree; any BSI-branding sweep.

## Non-negotiables (these do not bend)

- No fabricated spin / velocity / break / geometry / physics for any not-yet-measured
  pitch. No mph / rpm / inches / IVB anywhere — web or native.
- Every visible figure keeps its `Source` + `confidence` tier. A bad source id throws
  at build via `src()` — keep it that way.
- Dark theme locked. Reduced-motion honored. The public seam copy stays
  **"seam-informed schematic"**, never "seam-accurate" (see `docs/seam-calibration.md`).
- No copied instructional prose (Driveline, Plate Crate, eFastball, Wikipedia, etc.).
  Paraphrase and cite.
- No medical, injury-prevention, workload, or youth-prescription claims in product
  copy or community guardrails.
- One `seamPoint` function feeds the 3D tube, the 2D schematic, and the no-WebGL
  fallback — they can never disagree. Keep that single source.

## Identifiers (already in `project.yml`; persist to memory if you keep any)

Bundle `com.pitchatlas.app` · SKU `pitch-atlas-ios` · Apple ID `6778277388` ·
Team `CQNJJ423X3` · MARKETING_VERSION `1.0.0` · iOS 17 · iPhone-only ·
Supabase project `cloeoulvrrfcbitrjpso`.

## Verification gates (run and confirm green before "done")

Web (from repo root):
```
npm run typecheck && npm run lint && npm run test && npm run build && npm run preview
```
Then capture the live page — the card wall with chips, a flipped scout back showing
the wheel, and a phone-width wall — and confirm no failure signature ("Loading…",
empty, undefined, [object Object]) and every figure keeping its source + tier.

iOS:
```
cd Pitch-Atlas-iOS
PITCH_ATLAS_WEB=/Users/AustinHumphrey/Pitch-Atlas npm --prefix tools/generate-content run generate
xcodegen generate
./scripts/build.sh test
```

## Done means

Web is done only when the production URL renders the elevated card wall and the
scout-back wheel for a real visitor. iOS is done only when v1.0.1 is uploaded /
submitted — or when you explicitly park an account-gated step with proof of the
exact blocker. "Build passed" and "deploy succeeded" are not done; visitor-visible
proof is.

>>> END PROMPT
