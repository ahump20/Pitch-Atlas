# Pitch Atlas — Fable 5 Return Wave

Date: 2026-06-24
Branch: `fable5/return-wave-prep`
Executor target: Fable 5
Scope: next build wave, not a re-audit

This extends, not replaces:

- `docs/FABLE5-PITCH-ATLAS-AUDIT.md`
- `docs/fable5/PITCH-RUN-STATE.md`
- `docs/fable5/PITCH-DECISIONS.md`
- `docs/PITCH-ATLAS-IOS-SYNC.md`

## Mission

Erase pre-implementation cost so Fable 5 spends tokens on code and hard calls only.

Three tracks:

1. Elevate the Sluggers-inspired card language on web, then port it to iOS.
2. Ship safe web polish and sitemap fixes.
3. Support the in-review iOS build and prep the next card-port build.

## Non-negotiables

Do not touch or weaken these contracts:

- Dark/void Pitch Atlas theme.
- Real seam ball / seam-informed schematic copy.
- Every visible figure or claim keeps source + confidence tier.
- No fabricated spin rate, velocity, break inches, freshness, counts, or community activity.
- Reduced Motion remains honored.
- Do not reproduce Sluggers marks, names, characters, product photos, candy palette, or third-party IP.
- Field Notes write/submission UI stays waitlist-gated unless Austin explicitly opens it.
- Supabase destructive decisions stay Austin-gated.

## Current proof snapshot

### GitHub

- Web repo: `ahump20/Pitch-Atlas`.
- iOS repo: `ahump20/Pitch-Atlas-iOS`.
- Prep branches created in both repos: `fable5/return-wave-prep`.

### Supabase

Project: `cloeoulvrrfcbitrjpso`.

Read-only branch check on 2026-06-24:

- only branch listed: `main`
- `project_ref`: `cloeoulvrrfcbitrjpso`
- `preview_project_status`: `ACTIVE_HEALTHY`
- branch `status`: `MIGRATIONS_FAILED`

Interpretation: app/runtime may be healthy, but branch automation still carries a release-trust blocker. Do not reset, rebase, merge, or repair automatically.

Read-only RLS policy inspection on 2026-06-24 confirmed server-side block filtering exists in policies for:

- `public.field_notes`
- `public.discussion_posts`
- `public.discussion_media`
- `storage.objects` for `discussion-media`
- `public.blocked_users` own-row policies

The important release fact: block hiding is not client-only.

### iOS reality

Current repo read from `Pitch-Atlas-iOS/project.yml`:

- bundle: `com.pitchatlas.app`
- team: `CQNJJ423X3`
- iOS deployment target: `17.0`
- iPhone only: `TARGETED_DEVICE_FAMILY = 1`
- `MARKETING_VERSION`: `1.0.1`
- `CURRENT_PROJECT_VERSION`: `5`

Current `docs/APP-STORE-CONNECT.md` says App Store Connect has version `1.0.1` / build `5` selected for review and state `WAITING_FOR_REVIEW`. Treat earlier `1.0.0 build 3` language as stale unless App Store Connect proves otherwise.

## Track A — Card elevation

### A0 — Shared primitive extraction

Risk: MEDIUM
Token weight: high
Primary files:

- `src/components/refractor/RefractorCard.tsx`
- `src/components/refractor/RefractorBall.tsx`
- `src/components/v2/ChromeWall.tsx`
- `src/components/refractor/foil/FoilLayer.tsx`
- `src/components/refractor/foil/shaders.ts`
- `src/components/refractor/foil/foilProgram.ts`
- `src/index.css`

Target primitives:

- `BannerPlate`
- `FoilLayer`
- `AttributeChip`
- `EditionChip`
- `ConfidenceBadge`
- `SourceBadge`
- `ScoutMovementWheel`
- `SunburstLayer`

Acceptance:

- Card front/back can be reasoned about as composable primitives.
- No visual primitive introduces new pitch data fields.
- Existing surfaces still render before integration.

Rollback:

- Revert primitive extraction commit only.
- Leave data model untouched.

### A1 — Chrome/gold nameplate

Risk: SAFE
Token weight: low
Primary file: `src/index.css`
Selectors:

- `.rfx-banner`
- `.rfx-card.is-gold .rfx-banner`

Implementation:

- CSS-only.
- Multi-stop chrome gradient.
- pseudo-element extrusion edge.
- stacked inset/outer shadows.
- thicker chromatic outline.
- gold-chrome variant for `.is-gold`.

Acceptance:

- No DOM changes.
- Nameplate reads machined, not a flat pill.
- Gold card reads gold-chrome, not yellow.
- Text contrast remains legible at phone width.

Rollback:

- Revert CSS block for `.rfx-banner` only.

### A2 — Scout movement wheel

Risk: MEDIUM
Token weight: medium
Primary new file:

- `src/components/sections/ScoutMovementWheel.tsx`

Already scaffolded on this branch with `TODO(fable5)` integration space.

Consumers:

- `src/components/v2/ChromeWall.tsx`
- optional: specimen page after web proof

Allowed data only:

- `PitchMotion.spinAxis`
- `PitchMotion.verticalShape`
- `PitchMotion.horizontalDir`
- `PitchMotion.gyro`
- `PitchMotion.breakView`
- sourced shape/family/confidence labels already present on the card

Forbidden:

- rpm
- mph
- inches
- break magnitude
- confidence invented from motion shape

Acceptance:

- Back of ChromeWall card shows clock/radial movement language.
- Empty or missing motion renders gray/quiet and says unfiled/missing.
- Test keeps no-number copy locked.
- Existing source tier remains visible.

Rollback:

- Remove import/usage from `ChromeWall.tsx`.
- Keep scaffold if unused, or delete `ScoutMovementWheel.tsx` and its test.

### A3 — Prismatic foil richness

Risk: MEDIUM/HIGH
Token weight: high
Primary files:

- `src/components/refractor/foil/shaders.ts`
- `src/components/refractor/foil/foilProgram.ts`
- `src/components/refractor/foil/FoilLayer.tsx`

Implementation:

- Break uniform tooth pattern into irregular facets.
- Add low-frequency modulation so it reads cracked/cut, not horizontal banding.
- Add RGB phase offsets in thin-film calc.
- Keep reduced-motion and WebGL context gates.
- Add cheap fallback path if low-end WebGL2 stutters.

Performance budget:

- no extra WebGL contexts
- no route-wide eager 3D imports
- no card-wall jank on iPad 2024 class hardware
- preserve existing lazy Three/vendor budget

Acceptance:

- Foil reads as cut refractor foil in screenshot.
- Reduced Motion disables shimmer/rake.
- Browser smoke still green.

Rollback:

- Restore previous shader body.
- Keep CSS/static card upgrades.

### A4 — Sunburst + chip hierarchy

Risk: SAFE/MEDIUM
Token weight: low
Primary file:

- `src/components/refractor/RefractorBall.tsx`

Implementation:

- Add low-opacity radial/sunburst behind seam-ball window.
- Clamp opacity around `0.04–0.18`.
- Dial down high-saturation accents.
- Add formal chip row: family, source tier, edition.

Acceptance:

- Ball no longer floats in a flat window.
- Header hierarchy is clearer without crowding the ball.
- Every chip is sourced/semantic, not decorative fake data.

Rollback:

- Remove SVG defs/background layer and chip row.

### A5 — Safe critique fixes

Risk: SAFE
Token weight: low
Inputs:

- `.qa-shots/sluggers-ship-2026-06-24/critique-data.json` if available locally

Ship only:

- mid-word SHAPE ellipsis to whole-line clamp
- SOURCE control contrast/affordance
- unified number badge
- crumb chip detached from ball edge
- equalized nameplate width

Do not ship:

- structural redesigns without visual proof
- anything that weakens source labels
- candy-bright palette drift

## Track B — Web polish / finish

### B1 — Sitemap generator drift

Risk: SAFE
Token weight: medium
Primary files:

- `vite.config.ts`
- `src/lib/sitemap.ts`
- SSG path source files

Current note: `vite.config.ts` already states sitemap generation should come from `src/lib/sitemap.ts`; verify the actual built `sitemap.xml` covers the same route set as SSG.

Routes that must be represented if live/prerendered:

- `/repertoire`
- `/lost-pitches`
- `/learn`
- every `/learn/:slug` wing
- `/sandbox`
- `/movement-map`
- `/compare`
- `/grips`
- `/softball/*`

Acceptance:

- `npm run build` emits `dist/sitemap.xml`.
- Sitemap URL count matches expected route map.
- No `lastmod` build-date noise.
- `src/test/prerender-integrity.test.ts` remains green.

### B2 — Taste pass on thin utility surfaces

Risk: MEDIUM
Token weight: medium
Primary routes:

- `/compare`
- `/grips`
- `/movement-map`

Acceptance:

- Better hierarchy, spacing, affordance clarity.
- No new product concepts.
- No new unsourced claims.
- Real browser screenshots captured before/after.

### B3 — Leave for backlog

Do not implement in this wave without Austin:

- Field Notes submission/write flow
- automated media scanning
- EXIF scrub workflow
- bot protection vendor decisions
- in-app moderator UI
- destructive Stripe/Supabase teardown

## Track C — iOS support + next card-port build

Repo: `ahump20/Pitch-Atlas-iOS`
Branch: `fable5/return-wave-prep`

### C1 — App Review support

Risk: SAFE
Token weight: low
Primary docs:

- `docs/APP-STORE-CONNECT.md`
- `docs/APP-REVIEW-NOTES.md` if present/created

Acceptance:

- Docs match current truth: `1.0.1` / build `5`, waiting for review.
- Marketing/support/privacy URLs remain public.
- App privacy matches `PrivacyInfo.xcprivacy`.
- Reviewer account is only supplied by Austin/Fable from account-gated context.

### C2 — iOS card-port scaffold

Risk: MEDIUM
Token weight: high
Primary files:

- `PitchAtlas/Components/ContentCards.swift`
- `PitchAtlas/Components/CardBackPanel.swift`
- `PitchAtlas/Core/Motion/MotionProvider.swift`
- new scaffold: `PitchAtlas/Components/ScoutMovementWheel.swift`

Acceptance:

- Native cards inherit the same language as web: chrome plate, dark foil, movement wheel, source chips.
- Device motion only affects foil lighting and honors Reduce Motion.
- No web-only CSS assumptions leak into SwiftUI.
- Screenshots show web/app siblings, not strangers.

### C3 — Screenshots and submission assets

Fable/account-gated:

- capture 6.9-inch screenshots
- provide reviewer test account
- archive/TestFlight/submit if v1.0.1 needs resubmission after card port

Screenshot set:

1. Atlas home
2. Pitch Index
3. Pitch detail
4. Grip Library
5. Sources
6. Account / community safety

## Destructive / Austin-gated decisions

Do not act automatically:

- orphaned Supabase Stripe engine teardown
- leaked-password protection dashboard toggle
- nested `pitch-atlas-softball/` worktree disposal
- stale `~/code/Pitch-Atlas-iOS` dirty tree disposal
- BSI-branding sweep if it touches cross-project assets
- Supabase branch reset/rebase/merge/repair

## Verification commands

Web:

```bash
npm run typecheck
npm run lint
npm run test
npm run build
npm run preview
npm run test:preview:browser
```

Then capture real live routes after deploy:

- card wall
- gold card
- flipped scout back with movement wheel
- phone-width wall
- `/sitemap.xml`

IOS:

```bash
cd Pitch-Atlas-iOS
xcodegen generate
./scripts/build.sh test
```

Supabase read-only proof:

- `list_branches` shows branch status.
- inspect `pg_policies` for block-filter policies.
- do not mutate prod from this playbook.

## Done means

- Card elevation branch has implementation plus proof screenshots.
- Sitemap/polish branch has built artifact proof.
- iOS docs reflect the current App Store state.
- iOS card-port scaffold compiles.
- GitHub issues are claimed/burned down.
- Any destructive/account-gated item is listed, not touched.
