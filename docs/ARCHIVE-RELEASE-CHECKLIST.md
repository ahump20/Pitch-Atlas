# Pitch Atlas — release checklist

This is the separate release stage created by Austin's 2026-09-05 goal revision. External checks remain separate from implementation. The full-app reconciliation also records any product or runtime verification gaps; this checklist does not declare the entire approved plan complete.

## Native Index continuity — 2026-09-06

[Native context evidence](NATIVE-CONTEXT-EVIDENCE.md) records final source
`e486501`, successful14.9-second simulator build and clean unsigned Pro archive.
Observed row restoration, basic-file study/Back, header reversal and query/filter
retention pass. Restoration aligns the retained row to the top rather than
preserving its partial-row pixel offset. Final e486501 CI34009999020 passed83tests/0failures, build and content drift on
GitHub merge refa050710. The related-family repair passed the full specimen→sibling→Back chain. The74-file archive ledger matched after transfer to Air.
No signed export or physical acceptance follows from the unsigned archive.

## Softball study and native archive — 2026-09-06

Web runtime `ad955dd` is deployed at [preview37facf4b](https://37facf4b.pitch-atlas.pages.dev). Exact CI34004442978,998 tests/9 skips,typecheck,lint,109-route build and19 hosted smoke checks passed. [Softball evidence](SOFTBALL-STUDY-EVIDENCE.md) includes three-size inspection, keyboard/Back/reduced-motion/no-JavaScript checks and an actual21.52-second hosted journey. Native exact53985e7 unsigned archive succeeded on Pro; one signed development export failed at codesign with `errSecInternalComponent`, exit70. The paired iPhone16 is available, with an existing Pitch Atlas installation preserved.

## Earlier learning continuity — 2026-09-05

[Scope and runtime reconciliation](APP-SCOPE-RECONCILIATION.md) records web runtime `d4d4b43` at [preview5fe32fee](https://5fe32fee.pitch-atlas.pages.dev), green995-test CI and19 hosted smoke checks, plus current study/comparison/offline/no-JavaScript evidence. Native source `53985e721e7f2fc9bae823399b0861d41d91f02b` passed [CI34000133588](https://github.com/ahump20/Pitch-Atlas-iOS/actions/runs/34000133588):75 tests/0 failures, build and bundled-content drift. Actual search/study/variant/compare/return, chapter, photo controls, contrast and representative large-text/utility views were inspected. At that checkpoint the Air unsigned archive stalled in asset-catalog compilation. The later Pro archive above resolves unsigned preparation for53985e7; signing remains separate. No production or store delivery is asserted.

## Selective-color refinement — 2026-09-05

The [identity refinement evidence](IDENTITY-REFINEMENT.md) records the current visual correction, exact preview, build checks and actual web/native stills. It supersedes the material styling of the following checkpoint. Its web runtime is `fc3d50c9d4d5129c24d6b91677987180cce8299f`, [preview](https://06c6afb0.pitch-atlas.pages.dev), with green exact-runtime CI and 19 independently executed hosted smoke checks. The existing native unsigned archive below remains from `1e2b854` and does not contain this refinement. No production or store delivery is asserted.

## Connected archive and material revision — 2026-09-05

- Web runtime `f13f6f42b7c518fcaec700a29e94ae638db10cf0`: [Cloudflare preview](https://f44c9def.pitch-atlas.pages.dev), [PR 191](https://github.com/ahump20/Pitch-Atlas/pull/191).
- [Exact-runtime web CI](https://github.com/ahump20/Pitch-Atlas/actions/runs/33984087979): 971 tests passed / 9 existing skips, 109 prerendered routes, lint, typechecking/build, integrity and browser smoke. Final hosted smoke and representative study/compare/offline/keyboard journeys also passed.
- Final native source `1e2b8547d14d0083fadc8af55feaf21f6e5d1871`: [PR 35](https://github.com/ahump20/Pitch-Atlas-iOS/pull/35), [green 71-test CI, build and bundle check](https://github.com/ahump20/Pitch-Atlas-iOS/actions/runs/33987500529).
- Exact `1e2b854` unsigned archive succeeded on Air at `/Users/AustinHumphrey/Pitch-Atlas-iOS/.build/PitchAtlas-archive-world-route-final.xcarchive`, version 1.1.0/build 11. This is unsigned preparation only. Current card/discovery stills and the continuous 268.63-second practitioner → study → compare → return journey passed; the poster fallback and Atlas navigation corrections are included.
- Current evidence and exact artifact boundaries: [ARCHIVE-WORLD-EVIDENCE.md](ARCHIVE-WORLD-EVIDENCE.md).

## Earlier Archive Within Reach implementation

- Web runtime `e52cc2f01a13f825b5033be1c205558283bfea0d`: https://2d8e53d4.pitch-atlas.pages.dev
- Web review: https://github.com/ahump20/Pitch-Atlas/pull/191
- Native review/head `3a130d669319518900a0dc2c8e0ec13a545c30d8`: https://github.com/ahump20/Pitch-Atlas-iOS/pull/35
- Final unsigned archive on the Air: `/Users/AustinHumphrey/Pitch-Atlas-iOS/.build/ArchiveWithinReach-3a130d6-unsigned.xcarchive` (55 MB).
- Web CI: https://github.com/ahump20/Pitch-Atlas/actions/runs/33973194114
- Native CI: https://github.com/ahump20/Pitch-Atlas-iOS/actions/runs/33972518450

## Conditions and next actions

| Requirement | Current evidence | Condition for the next action |
| --- | --- | --- |
| Current unsigned learning archive | Clean Pro exacte486501 archive succeeded, exit0, arm64,1.1.0(11), iOS17 minimum. Source, metadata and receipt hashes are recorded in native context evidence. | Unsigned preparation complete for this source. The earlier53985e7 transfer/export remains separately versioned; the final archive has not been signed or installed on a device. |
| Signed native archive and export | One export of the successful Pro archive on Air failed at codesign with `errSecInternalComponent`, exit70; no IPA. Air enumerates five valid identities, Pro zero. | Resolve signing-key access in the existing authorized macOS session, then export and verify the IPA. Identity enumeration does not prove codesign can use a private key. No keychain/password/permission change was made. |
| Physical native inspection | The paired iPhone16 currently reports available and contains com.pitchatlas.app1.1.0(11). Its existing local data was preserved. | After signed export succeeds, preserve device-local state during installation and complete the study/compare/return journey. Simulator evidence is separate. |
| Native swipe-back | Source audit found standard NavigationStack/navigationDestination/NavigationLink behavior and no disabled or intercepted pop gesture. Automated edge gestures did not complete navigation; the tool capped travel and reported snapshot timeouts. A tap on Back is not treated as swipe evidence. | On the signed device build, select a pair, filter Index, open a specimen, complete and cancel an edge swipe, then verify search, scroll, and pair restoration. Repair an observed product defect if one appears. |
| VoiceOver task completion | Named accessibility elements and large-text simulator layouts were inspected. [Apple requires a physical device for VoiceOver testing](https://developer.apple.com/documentation/accessibility/performing-accessibility-testing-for-your-app). | Complete find → study → variant/source → compare → return using VoiceOver, including focus order, announcements, dismissal, and selection state. |
| Native first-launch offline | Reference records are bundled; no new data network request was introduced. A genuine first-launch disconnected runtime flow has not been demonstrated. | Use a fresh test installation on the device with networking disabled, then verify index, study, comparison, sources, and unavailable-media behavior. Restore device settings afterward. |
| iPhone 13-class 60fps and idle cost | Desktop recordings and simulator stills are not physical-device frame-rate measurements. | Profile representative web and native interactions on the agreed physical device class, including reverse scrolling and offscreen/idle rendering. Fix sustained work or dropped-frame defects found. |
| Production and TestFlight/App Store delivery | Cloudflare preview exists; no production or store deployment occurred. | After the applicable release checks pass, perform the separately authorized deployment/upload and inspect the delivered version. |

The earlier Air signing retry log is `.build/ArchiveWithinReach-3a130d6-signed-retry.log`; SHA-256 `9a343660440d765a229fb99a35b224ebd51a54c5700facf79cb92c9d2b0bf077`. Native swipe evidence is `/Users/AustinHumphrey/Pitch-Atlas/artifacts/native/archive-study/pitch-atlas-edge-swipe-unchanged.png` on the Pro. The task-owned native app and temporary web preview server for that earlier checkpoint were stopped after its inspection; this is not a statement about the current review preview.

Provenance, rights, moderation, and canonical seam/data integrity remain release requirements. The goal revision changes when external checks are performed; it does not assert that they passed.
