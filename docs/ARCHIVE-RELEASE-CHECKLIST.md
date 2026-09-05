# Archive Within Reach — release checklist

This is the separate release stage created by Austin's 2026-09-05 goal revision. These checks remain open and do not hold the completed implementation goal in a retry loop.

## Delivered implementation

- Web runtime `e52cc2f01a13f825b5033be1c205558283bfea0d`: https://2d8e53d4.pitch-atlas.pages.dev
- Web review: https://github.com/ahump20/Pitch-Atlas/pull/191
- Native review/head `3a130d669319518900a0dc2c8e0ec13a545c30d8`: https://github.com/ahump20/Pitch-Atlas-iOS/pull/35
- Final unsigned archive on the Air: `/Users/AustinHumphrey/Pitch-Atlas-iOS/.build/ArchiveWithinReach-3a130d6-unsigned.xcarchive` (55 MB).
- Web CI: https://github.com/ahump20/Pitch-Atlas/actions/runs/33973194114
- Native CI: https://github.com/ahump20/Pitch-Atlas-iOS/actions/runs/33972518450

## Conditions and next actions

| Requirement | Current evidence | Condition for the next action |
| --- | --- | --- |
| Signed native archive and export | Fresh exact-head Air retry failed at CodeSign with `PitchAtlas.app: errSecInternalComponent`, exit 65; no signed archive was produced. Pro reports zero valid signing identities. | Make the existing Air signing key available in its interactive macOS session. Then archive final native source, validate/export, and inspect the IPA. No password or keychain-permission changes are part of this plan. |
| Physical native inspection | The paired iPhone 16 was most recently reported `unavailable` by devicectl. Simulator evidence is retained separately. | Connect/unlock the available development device, install the signed build, and complete the study/compare/return journey. |
| Native swipe-back | Source audit found standard NavigationStack/navigationDestination/NavigationLink behavior and no disabled or intercepted pop gesture. Automated edge gestures did not complete navigation; the tool capped travel and reported snapshot timeouts. A tap on Back is not treated as swipe evidence. | On the signed device build, select a pair, filter Index, open a specimen, complete and cancel an edge swipe, then verify search, scroll, and pair restoration. Repair an observed product defect if one appears. |
| VoiceOver task completion | Named accessibility elements and large-text simulator layouts were inspected. [Apple requires a physical device for VoiceOver testing](https://developer.apple.com/documentation/accessibility/performing-accessibility-testing-for-your-app). | Complete find → study → variant/source → compare → return using VoiceOver, including focus order, announcements, dismissal, and selection state. |
| Native first-launch offline | Reference records are bundled; no new data network request was introduced. A genuine first-launch disconnected runtime flow has not been demonstrated. | Use a fresh test installation on the device with networking disabled, then verify index, study, comparison, sources, and unavailable-media behavior. Restore device settings afterward. |
| iPhone 13-class 60fps and idle cost | Desktop recordings and simulator stills are not physical-device frame-rate measurements. | Profile representative web and native interactions on the agreed physical device class, including reverse scrolling and offscreen/idle rendering. Fix sustained work or dropped-frame defects found. |
| Production and TestFlight/App Store delivery | Cloudflare preview exists; no production or store deployment occurred. | After the applicable release checks pass, perform the separately authorized deployment/upload and inspect the delivered version. |

The final Air signing retry log is `.build/ArchiveWithinReach-3a130d6-signed-retry.log`; SHA-256 `9a343660440d765a229fb99a35b224ebd51a54c5700facf79cb92c9d2b0bf077`. Native swipe evidence is `/Users/AustinHumphrey/Pitch-Atlas/artifacts/native/archive-study/pitch-atlas-edge-swipe-unchanged.png` on the Pro. The task-owned native app and temporary web preview server were stopped after inspection.

Provenance, rights, moderation, and canonical seam/data integrity remain release requirements. The goal revision changes when external checks are performed; it does not assert that they passed.
