# Archive Within Reach — revised implementation goal

Revision authorized by Austin on 2026-09-05: “Please update and revise your goal and then implement it for yourself so that we stop getting blocked.”

## Objective

Complete the Archive Within Reach design and study/compare implementation in the existing web and SwiftUI repositories. Deliver reviewable changes, a verified Cloudflare web preview, native build/test and simulator evidence, an unsigned native archive when signing access is unavailable, and a concrete release checklist.

The original art direction, full-app implementation scope, provenance, rights, moderation, canonical pitch facts, and seam invariants remain in force. This revision separates implementation completion from credential- and device-dependent release acceptance. Physical-device frame rate, native assistive-technology completion, signing/export, and store delivery remain requirements for the release stage documented in [ARCHIVE-RELEASE-CHECKLIST.md](ARCHIVE-RELEASE-CHECKLIST.md).

## Implementation completion evidence

- [x] Existing React/Vite and SwiftUI implementations extended; no new app shell, animation dependency, pitch-data API, or schema.
- [x] Warmer archive composition, controlled parallax, coordinated card state, shared study/inspection and comparison flow, context restoration, editorial and utility treatment.
- [x] Desktop, 390px mobile, short landscape, no-WebGL, reduced-motion, offline previously loaded web study, no-JavaScript reading, and interrupted navigation verified on the hosted preview.
- [x] Actual WebGL card → study → inspection → comparison walkthrough completed with zero page errors; first-frame continuity and interrupted canvas initialization repaired and tested.
- [x] Web typecheck, lint, 965 tests / 9 skipped, 109-route build, integrity checks, preview and browser smoke passed at implementation source `e52cc2f`.
- [x] Native implementation `3a130d6` passed build, 67 committed CI tests, and generated content parity. Local QA included the preserved untracked snapshot test and passed 68 tests.
- [x] Native normal/accessibility-size, reduced-effects, comparison, study, invalid-link, and tab/pair-continuity simulator evidence captured. Real native redesign baseline and final stills retained.
- [x] Final native source produced a 55 MB unsigned archive on the Air; its app payload exists and signing status is explicitly unsigned.
- [x] [Web review](https://github.com/ahump20/Pitch-Atlas/pull/191), [native review](https://github.com/ahump20/Pitch-Atlas-iOS/pull/35), and [immutable web preview](https://2d8e53d4.pitch-atlas.pages.dev) are available.
- [x] README, UI claims, data model, source/confidence records, rights, moderation, and seam invariants preserved. Native generated content has only three attribution-phrase parity changes against its current base.
- [x] Remaining external release requirements have evidence, prerequisites, and next actions in the separate checklist.

Detailed final local artifacts: `artifacts/archive-within-reach/review-ready/EVIDENCE.md`. Source implementation and verification history: [ARCHIVE-WITHIN-REACH.md](ARCHIVE-WITHIN-REACH.md).

## Execution policy for this goal

Work on all remaining implementation tasks that can be completed within existing access. Fix demonstrated product defects. For an unavailable credential or device, record the exact failed action and the condition needed to retry, then continue independent work. Do not repeatedly retry unchanged signing/access failures or substitute an accessibility snapshot for a completed VoiceOver flow. Do not alter keychain permissions, create credentials, weaken safeguards, or claim release success to satisfy this goal.

Close this implementation goal when the evidence above is complete. Start the separate release work when its required access and hardware are available; no unattended polling or repeated permission requests are needed for this completed implementation goal.
