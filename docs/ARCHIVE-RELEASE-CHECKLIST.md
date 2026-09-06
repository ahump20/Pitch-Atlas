# Pitch Atlas — release checklist

This is the separate release stage created by Austin's 2026-09-05 goal revision. External checks remain separate from implementation. The full-app reconciliation also records any product or runtime verification gaps; this checklist does not declare the entire approved plan complete.

## Learning continuity — 2026-09-05

[Scope and runtime reconciliation](APP-SCOPE-RECONCILIATION.md) records web runtime `d4d4b43` at [preview5fe32fee](https://5fe32fee.pitch-atlas.pages.dev), green995-test CI and19 hosted smoke checks, plus current study/comparison/offline/no-JavaScript evidence. Native source `53985e721e7f2fc9bae823399b0861d41d91f02b` passed [CI34000133588](https://github.com/ahump20/Pitch-Atlas-iOS/actions/runs/34000133588):75 tests/0 failures, build and bundled-content drift. Actual search/study/variant/compare/return, chapter, photo controls, contrast and representative large-text/utility views were inspected. The single current unsigned archive stalled in asset-catalog compilation and was stopped; no accepted53985e7 archive exists. No production or store delivery is asserted.

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
| Current unsigned learning archive | Exact53985e7 attempt stalled in `actool`/`ibtoold` while CoreSimulator loaded runtime-profile metadata; build log and helper CPU stopped progressing. Only owned build processes were stopped, preserving diagnostics and partial output. | Resolve the asset-tool/runtime metadata read obstruction, then make one new exact-source archive. The existing1e2b archive is not the current learning build. |
| Signed native archive and export | Fresh exact-head Air retry failed at CodeSign with `PitchAtlas.app: errSecInternalComponent`, exit 65; no signed archive was produced. Pro reports zero valid signing identities. | Make the existing Air signing key available in its interactive macOS session. Then archive final native source, validate/export, and inspect the IPA. No password or keychain-permission changes are part of this plan. |
| Physical native inspection | The paired iPhone 16 was most recently reported `unavailable` by devicectl. Simulator evidence is retained separately. | Connect/unlock the available development device, install the signed build, and complete the study/compare/return journey. |
| Native swipe-back | Source audit found standard NavigationStack/navigationDestination/NavigationLink behavior and no disabled or intercepted pop gesture. Automated edge gestures did not complete navigation; the tool capped travel and reported snapshot timeouts. A tap on Back is not treated as swipe evidence. | On the signed device build, select a pair, filter Index, open a specimen, complete and cancel an edge swipe, then verify search, scroll, and pair restoration. Repair an observed product defect if one appears. |
| VoiceOver task completion | Named accessibility elements and large-text simulator layouts were inspected. [Apple requires a physical device for VoiceOver testing](https://developer.apple.com/documentation/accessibility/performing-accessibility-testing-for-your-app). | Complete find → study → variant/source → compare → return using VoiceOver, including focus order, announcements, dismissal, and selection state. |
| Native first-launch offline | Reference records are bundled; no new data network request was introduced. A genuine first-launch disconnected runtime flow has not been demonstrated. | Use a fresh test installation on the device with networking disabled, then verify index, study, comparison, sources, and unavailable-media behavior. Restore device settings afterward. |
| iPhone 13-class 60fps and idle cost | Desktop recordings and simulator stills are not physical-device frame-rate measurements. | Profile representative web and native interactions on the agreed physical device class, including reverse scrolling and offscreen/idle rendering. Fix sustained work or dropped-frame defects found. |
| Production and TestFlight/App Store delivery | Cloudflare preview exists; no production or store deployment occurred. | After the applicable release checks pass, perform the separately authorized deployment/upload and inspect the delivered version. |

The earlier Air signing retry log is `.build/ArchiveWithinReach-3a130d6-signed-retry.log`; SHA-256 `9a343660440d765a229fb99a35b224ebd51a54c5700facf79cb92c9d2b0bf077`. Native swipe evidence is `/Users/AustinHumphrey/Pitch-Atlas/artifacts/native/archive-study/pitch-atlas-edge-swipe-unchanged.png` on the Pro. The task-owned native app and temporary web preview server for that earlier checkpoint were stopped after its inspection; this is not a statement about the current review preview.

Provenance, rights, moderation, and canonical seam/data integrity remain release requirements. The goal revision changes when external checks are performed; it does not assert that they passed.
