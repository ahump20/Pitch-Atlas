# Fable 5 Return Wave

Last updated: 2026-06-24.

This is the start doc for the next build wave. It extends `docs/fable5/PITCH-DECISIONS.md`, `docs/FABLE5-PITCH-ATLAS-AUDIT.md`, and `docs/fable5/PITCH-RUN-STATE.md`; it does not replace them.

## Frame

Goal: ship the safe web wins now, leave account-gated/destructive calls explicit, and hand Fable 5 the smallest possible implementation surface for the iOS card port and v1.0.1 submission.

Assumptions:

- [verified] Web repo is `/Users/AustinHumphrey/Pitch-Atlas`; current web branch is `design/cards-elevation-r2`, based on `origin/main`.
- [verified] iOS repo is nested at `/Users/AustinHumphrey/Pitch-Atlas/Pitch-Atlas-iOS`; current prep branch is `fable5/return-wave-prep-20260624`.
- [verified] The parent web repo still treats `Pitch-Atlas-iOS/` as an untracked nested repo. Do not `git add Pitch-Atlas-iOS/` from the web repo.
- [reasoned] Fable 5 should spend tokens on implementation and device/App Store judgment, not route inventory, file discovery, or wording.

## What Shipped In This Prep

Web cards:

- [verified] `src/components/refractor/RefractorCard.tsx` now renders a formal attribute row under the nameplate: family, source tier, edition.
- [verified] `src/index.css` tightens the card: machined nameplate, mobile chip sizing, stronger source button contrast, whole-line scout shape clamp, empty wheel state.
- [verified] `src/components/sections/ScoutMovementWheel.tsx` is direction-only. It uses `PitchMotion` enums and `spinAxis`, not speed/spin/break figures.
- [verified] `src/components/sections/ScoutMovementWheel.test.tsx` covers missing motion, forbidden metric labels, and filed motion integrity.
- [verified] `src/pages/ComparePage.tsx` and `src/pages/MovementMapPage.tsx` now state the tracked-data boundary in plainer words.

Web sitemap:

- [verified] `dist/sitemap.xml` has 104 public URLs after build.
- [verified] The route set called out in the brief is present: `/repertoire/`, `/lost-pitches/`, `/learn/`, `/sandbox/`, `/movement-map/`, `/compare/`, `/grips/`, `/softball/`, `/softball/fastpitch/`, `/softball/slowpitch/`.
- [reasoned] No sitemap generator rewrite was needed in this pass; `vite.config.ts` already draws from `src/lib/sitemap.ts`, which shares route arrays with SSG.

iOS prep:

- [verified] `PitchAtlas/Components/ScoutMovementWheel.swift` is a compile-safe native shell for the direction-only scout-back wheel.
- [verified] `PitchAtlas/Components/ReturnWaveCardChrome.swift` is a compile-safe shell for the machined nameplate and attribute-chip row.
- [verified] Bundled content was regenerated from the web repo: 12 pitches, 40 repertoire entries, 12 craftsmen, 15 lost pitches, 10 knowledge wings, 7 grip entries, 274 sources.
- [verified] `docs/APP-REVIEW-NOTES.md` now carries reviewer path, live checks, metadata draft, 6.9-inch screenshot plan, and app-icon spec.
- [verified] `docs/COMPLIANCE.md` now reflects the current Supabase branch state and the open redirect/model-cleanup checks.

## Proof So Far

Web local:

- [verified] `npm run typecheck` passed.
- [verified] `npm run lint` passed with existing Fast Refresh warnings.
- [verified] `npm run test` passed: 40 files passed, 1 skipped; 553 tests passed, 7 skipped.
- [verified] `npm run build` passed; React SSG generated 105 routes, all prerendered.
- [verified] `PREVIEW_URL=http://127.0.0.1:4173 npm run test:preview:browser` passed.
- [verified] Headless screenshot check found the card wall, a front card, a flipped scout back with `RIDES MAGNUS - DIRECTION ONLY`, and a 390px mobile wall. It found 100 source/tier surfaces and no hydration/load/WebGL-lost failure signature.

iOS local:

- [verified] XcodeBuildMCP had no defaults set, so the repo script path was used.
- [verified] `xcodegen generate && ./scripts/build.sh test` passed on iPhone 17 Pro simulator, iOS 26.5 SDK: 21 tests, 0 failures.
- [verified] Simulator logs emitted CoreMotion/media noise; the test session still ended `TEST SUCCEEDED`.

Supabase:

- [verified] `cloeoulvrrfcbitrjpso` live branch list reports `main` status `MIGRATIONS_FAILED`; preview project status is `ACTIVE_HEALTHY`.
- [verified] Live migrations include the iOS preflight pair and hardening through `20260615204244_pin_remaining_helper_search_paths`.
- [verified] Live RLS policies for `field_notes`, `discussion_posts`, and `discussion_media` call `private.blocked_between((select auth.uid()), ...)`.
- [verified] Live grants for `blocked_users` are column-narrowed: authenticated clients can insert only `blocked_id`; no anon `blocked_users` grant appeared in the query.
- [verified] Security advisors still warn on public read policies for public community content, `cron` anonymous policies, and leaked-password protection disabled.

Apple:

- [verified] Apple screenshot docs currently accept one to ten JPEG/JPG/PNG screenshots per device class. For 6.9-inch iPhone portrait, accepted sizes include 1260 x 2736, 1290 x 2796, and 1320 x 2868. Use 1320 x 2868 as the master.
- [unknown] App Store Connect review state was not checked. It requires the logged-in Apple account.

## Ranked Tasks For Fable 5

### P0 - Port Return-Wave Cards To iOS

Why: web now has the elevated card system; v1.0.1 should not ship the old native card look.

Files:

- `PitchAtlas/Components/ContentCards.swift`
- `PitchAtlas/Components/CardBackPanel.swift`
- `PitchAtlas/Components/ScoutMovementWheel.swift`
- `PitchAtlas/Components/ReturnWaveCardChrome.swift`
- `PitchAtlas/Core/Motion/MotionProvider.swift`
- `PitchAtlas/Core/Theme/PitchAtlasTheme.swift`

Do:

- Wire `ReturnWaveNameplate` and `ReturnWaveAttributeRow` into the specimen cards.
- Wire `ScoutMovementWheel` into the card back.
- Use only `PitchMotion.spinAxis`, `forceLabel`, `verticalShape`, `horizontalDir`, `gyro`, and `indeterminateBreak` for the wheel.
- Keep CoreMotion foil opt-in and Reduce Motion safe.
- Do not show `spinRateRpm`, `ivbInches`, `horizontalInches`, `velocity`, mph, rpm, inches, or IVB in the card port.

Acceptance:

- `xcodegen generate && ./scripts/build.sh test` passes.
- Atlas screenshot shows a native card with nameplate, source-tier chip, family chip, edition chip, and real bundled grip/ball material.
- Scout back screenshot shows the movement wheel and source row.
- VoiceOver label says direction-only/no measured figures.
- Reduce Motion leaves foil static.

### P0 - Prepare v1.0.1 Submission

Why: build 3 / v1.0.0 is user-reported as in review; next build is card-port + cleanup.

Files:

- `project.yml`
- `docs/APP-REVIEW-NOTES.md`
- `docs/COMPLIANCE.md`
- App Store Connect metadata fields

Do:

- Confirm current ASC state for Apple ID `6778277388`.
- Resolve local build number vs ASC build number: `project.yml` has `CURRENT_PROJECT_VERSION: "2"`, while the brief says build 3 is in review.
- Set v1.0.1 version/build only after ASC check.
- Capture six 6.9-inch screenshots from `docs/APP-REVIEW-NOTES.md`.
- Add reviewer account/instructions.
- Archive, upload to TestFlight, then submit after smoke.

Acceptance:

- The selected build is visible in App Store Connect.
- Screenshot set passes App Store Connect size validation.
- Reviewer notes mention bundled logged-out reference plus optional signed-in community layer.
- No screenshot shows private account data or fake community content.

### P1 - Repair Supabase Branch Automation

Why: live RLS is good enough for the in-review app, but branch automation still says `MIGRATIONS_FAILED`.

Files:

- web repo `supabase/migrations/*`
- Supabase dashboard/branch tooling

Do:

- Recheck branches with the Supabase connector.
- Compare repo migrations to live list.
- Repair branch automation without dropping production data.

Acceptance:

- Supabase branch `main` no longer reports `MIGRATIONS_FAILED`.
- Production migrations remain intact.
- Security advisors are reviewed and any accepted public-read warnings are documented.

### P1 - Reconcile Native Motion Model

Why: the web type system now forbids movement metrics; native still decodes old optional fields.

Files:

- `PitchAtlas/Core/Data/ContentModels.swift`
- `PitchAtlas/Resources/Content/pitches.json`
- `tools/generate-content/generate.ts`
- web `src/data/types.ts`

Do:

- Decide whether native keeps legacy optional fields for decode compatibility only, or removes them after generated JSON no longer carries them.
- If kept, comment them as non-display compatibility fields.
- If removed, regenerate content and prove tests still decode.

Acceptance:

- Native UI cannot surface mph/rpm/inches/IVB by accident.
- `testBundleDecodesCleanly` and `testProvenanceContractHolds` pass.
- The model state is documented in `docs/COMPLIANCE.md`.

### P1 - Web Live Verification After Deploy

Why: build success is not done; the live page has to render.

Routes:

- `https://pitch-atlas.com/`
- `https://pitch-atlas.com/compare`
- `https://pitch-atlas.com/movement-map`
- `https://pitch-atlas.com/grips`
- `https://pitch-atlas.com/sitemap.xml`

Acceptance:

- Homepage shows elevated card wall with attribute chips.
- A flipped scout back shows the wheel.
- Mobile width card has no incoherent overlap.
- `sitemap.xml` includes the route set above.
- Console has no hydration/load failure signature.

### P2 - Product Decisions Austin Owns

Do not act without Austin's explicit call:

- Orphaned Supabase Stripe engine teardown: roughly 25 tables, 3 functions, pg_cron.
- Supabase leaked-password protection toggle.
- Disposal of nested `pitch-atlas-softball/`.
- Disposal/reconciliation of stale `~/code/Pitch-Atlas-iOS` dirty tree.
- BSI-branding sweep on public Pitch Atlas surfaces.

## Task Ledger

TaskCreate was not available in this runtime. Use this ledger as the seeded backlog.

1. `web-card-live-proof`: deploy web card changes, then verify homepage, scout back, mobile, and sitemap live.
2. `ios-port-nameplate`: wire `ReturnWaveNameplate` into native specimen cards.
3. `ios-port-attribute-row`: wire family/source/edition chips into native specimen cards.
4. `ios-port-movement-wheel`: wire `ScoutMovementWheel` into native card backs.
5. `ios-motion-model-cleanup`: reconcile legacy optional movement numeric fields.
6. `ios-asc-state`: confirm App Store Connect state for Apple ID `6778277388` and local build number.
7. `ios-screenshot-set`: capture six 6.9-inch screenshots at 1320 x 2868 portrait.
8. `ios-reviewer-path`: add reviewer account/instructions or prove no account needed.
9. `supabase-branch-health`: repair `MIGRATIONS_FAILED` branch automation.
10. `supabase-auth-redirects`: verify `https://pitch-atlas.com/*` and `pitchatlas://auth-callback` in Supabase Auth allowlist.

## Commands

Web:

```bash
npm run typecheck
npm run lint
npm run test
npm run build
npm run preview -- --host 127.0.0.1 --port 4173
PREVIEW_URL=http://127.0.0.1:4173 npm run test:preview:browser
```

iOS:

```bash
cd Pitch-Atlas-iOS
PITCH_ATLAS_WEB=/Users/AustinHumphrey/Pitch-Atlas npm --prefix tools/generate-content run generate
xcodegen generate
./scripts/build.sh test
```

Supabase read-only checks:

```sql
select schemaname, tablename, policyname, roles, cmd, qual, with_check
from pg_policies
where schemaname = 'public'
  and tablename in ('blocked_users', 'field_notes', 'discussion_posts', 'discussion_media')
order by tablename, policyname;
```

## Final Gate

Web is done only when the production URL renders the elevated card wall and scout-back wheel. iOS is done only when the v1.0.1 build is uploaded/submitted or when Fable explicitly parks the account-gated step with proof of the blocker.
