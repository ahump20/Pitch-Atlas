# Archive Within Reach Implementation Plan

Approved by Austin in the implementation request. Work in existing ahump20 repositories; preserve provenance, rights, moderation and offline reference content.

## Delivery ledger
- [x] Web app-wide CompareSelection with URL/session state, two-slot tray, replacement dialog and three-view workspace.
- [x] Homepage depth composition and parallax; coordinated card selection and seam projection.
- [x] Grip study, inspection, chapter navigation and selected variants on baseball/softball records.
- [x] Index restoration; shared editorial, utility and community surface refinements.
- [x] Native SwiftUI study and compare, deep links, preserved offline data, native material and motion source changes (runtime acceptance remains separate).
- [x] Web behavioral tests, typecheck, lint, build, local preview and browser acceptance evidence.
- [x] Native source build/tests, scoped simulator captures, GitHub draft PRs, and Cloudflare preview.
- [ ] Complete native device/accessibility/offline acceptance, physical performance, signed export and TestFlight preparation (Air keychain blocker).

## Interfaces
Web CompareSelection: a/b nullable filed slugs, view grips|cues|movement, hand right|left, orientation top|side|thumb. URL /compare?a=&b=&view=&hand=&orientation= is canonical when on comparison route. Explicit invalid inputs clear the affected slot. App state survives route changes and session reload; adding a third opens an accessible replacement choice. Legacy /grips#grip-compare continues working through the unified workspace.

CompareButton accepts slug and optional className. RootLayout owns CompareProvider and CompareTray. Existing grip/tunnel widgets accept controlled selection without changing canonical records.

## Validation contract
Test parsed invalid/duplicate slugs, persistence and Back navigation, replacement cancel/confirm, tab continuity, both orientations, source-backed cues, inspection and chapter links. Verify 390px and short landscape, reduced motion, no WebGL, no JS reading, offline and blocked media. Capture before/after where tools permit; never claim physical-device 60fps, production or TestFlight without evidence.

## Review and verification checkpoint

Web source implementation reviewed; unfiled-model provenance, canonical trailing-slash comparison, offline application assets, interrupted transitions, stationary Source controls, and first-frame schematic continuity passed scoped review. Hosted checkpoint `0f538ed` passed GitHub typecheck/lint, 963 tests / 9 skipped, 109/109 prerendered build, integrity 6 passed / 1 skipped, and browser smoke. Both archive acceptance and existing smoke passed on that Cloudflare preview. A subsequent canvas connection guard passed its real-event-manager regression tests and the full built WebGL walkthrough with no page errors; PR #191 records its final hosted verification. Matched stills and recordings are in local artifacts/archive-within-reach. Native final head `3a130d6` passed GitHub build/test and content-drift checks and produced a fresh unsigned archive. Simulator captures, a genuine redesign baseline, the stronger study composition, and preference/navigation checks are recorded, while signed export, complete device/accessibility/offline acceptance and physical performance remain unfinished; see docs/ARCHIVE-WITHIN-REACH.md.
