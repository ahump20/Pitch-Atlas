# Native reading-place acceptance

This follow-up checks the approved requirement to return from a specimen without
losing the Index reading context. It does not replace the broader
[learning evidence](APP-SCOPE-RECONCILIATION.md) or
[release checklist](ARCHIVE-RELEASE-CHECKLIST.md).

## Current result

Source `e48650169741f41bef978de95f2de8512c370a39` retains the native Index reading
row and query/filter context, makes basic-file study links tappable across their
labels, and opens related specimens within the current native reading stack.
The updated sibling build passed in14.9seconds; five changed Swift files match
clean source and temporary Index prints are absent.

Actual full chain passed: Index → Four-Seam Basic → Four-Seam specimen → Two-Seam
sibling → Four-Seam specimen → Four-Seam Basic → Index. Rendered titles, native
Back labels and the selected Index tab were checked. Root inspected the actual
Two-Seam destination still. Separate Split-Finger Basic → Splitter → Basic → Index,
deep-row restoration, header reversal and cross-tab query/filter checks passed.
Restoration preserves the intersecting row while normalizing its partial-row
offset; it does not promise exact pixel restoration.

Clean exact-source archive `/tmp/PitchAtlas-learning-e486501-Pro.xcarchive`
succeeded on Pro at2026-09-06T03:52:48Z, exit0:unsigned arm64,
com.pitchatlas.app1.1.0(11), minimum iOS17. Receipt SHA256:
`accaf8ad3bdf08cad2a5648d63d3e528a54f11e37d1254fbc82ceb37927c5539`.
Archive log SHA256:
`03358325f09fbe00093eca8ca71b80a233516053c857a98358bac874c1841078`.
CI34009999020 passed for head e486501 on GitHub merge ref a050710:83tests,
zero failures, build and content-bundle drift. The74-file archive ledger matched
after transfer to Air at
`/tmp/PitchAtlas-e486501-transfer/PitchAtlas-learning-e486501-Pro.xcarchive`.
Ledger SHA256 `d9c6d9df32ff8b44201f37c51ac8ec5b60543043b57a47943e490f5e18af19d3`;
transfer ZIP SHA256 `52bf9bd04c658f90fcd80687f397cf0967fc312887f45c704f2245ab19056214`.
No new signing attempt followed the transfer. Physical acceptance and signing
remain separate. Earlier f285654 archive and CI
receipts below retain their original source boundary.

## Observed failure and repair

On native source `53985e7`, Index query `a` and the Fastballs filter survived
opening Sinker and tapping Back, but the reading position returned to the search
controls. Source `6151e1c` compiled and passed CI yet reproduced that failure.
Source `5414add` kept the controls offscreen and aligned Four-Seam at the top.
The initial review called this a wrong-row failure, but the later direct image
and coordinate review exposed a mislabeled starting row. That earlier judgment
is not reliable evidence of a wrong-row defect.

Source `6bb960cc9d3286565c6a3663df51f5aded331058` saves the observed row in the
accessible row button's action before beginning native navigation. A small pure
state helper ignores covered-view layout changes and preserves that snapshot
through either appearance/dismissal callback order. Reversing to the controls
clears the old deep-row anchor. Query, family, status and sort changes reset the
position. Restoration normalizes to a row's top or the masthead; it does not
promise the exact intra-row pixel offset.

Independent source review found no confirmed blocking defect. Eight focused
`IndexScrollRestorationTests` passed with zero failures on the task's iPhone
simulator in 43.4 seconds, including build time. The new app was installed and
launched. The first runtime report incorrectly labeled the cropped starting row as
Two-Seam. Root inspected the before image and a temporary QA coordinate log:
Four-Seam actually crossed the top at -47.333 points, with a 95.333-point height;
Two-Seam began at +48 points. The app saved Four-Seam, requested Four-Seam on
return, and placed that row at zero. This is correct row restoration with the
documented intra-row normalization, not a wrong-row failure. A genuinely deeper
Split-Finger row also passed: its -11.667-point starting offset normalized to
zero after Sinker and Back. Second navigation and nested history are tracked below. The QA
prints are diagnostic only and will not ship. Helper tests alone do not prove
SwiftUI scroll or navigation behavior.

## Basic-file study link follow-up

The first nested-history report claimed that Study this first switched tabs and
evicted the basic file. Root returned to Index and found the same basic file still
present; the automated tap had hit the Grips tab while the link was obscured by
the floating tab bar. That report does not establish a navigation defect.

Root scrolled the link fully above the tab bar and tried the center of its label
twice. Neither tap opened the specimen. Source `f285654724be2e2379916edc7f9f42f3074a45a4`
adds a rectangular hit area across the study link's label, including its spacer,
and uses direct native destinations for both basic-file specimen links. The
inherited value destination remains registered for the specimen's related-family
links. Independent source review passes. The candidate runtime opened actual Splitter,
showed Split-Finger Fastball as its native Back label, returned to that basic
file with Index as its Back label, then returned to the filtered Index. Reversing
to the header and Grips→Index retained query `a` and Fastballs. The final build
with the inherited route registration restored passed in10.9seconds. Its sibling
link failure and subsequent e486501 repair are recorded below. No routing data or sourced relationship changed.

PR35 CI34008866623 passed for head6bb960c on GitHub merge ref856ee65:83 tests,
zero failures, native build and content-bundle drift. Clean source6bb960c also
produced an unsigned Pro archive at `/tmp/PitchAtlas-learning-6bb960c-Pro.xcarchive`,
exit0, completed2026-09-06T03:29:04Z. It excludes the later f285654 link refinement.

The related-family source follow-up `e486501` addresses the next observed
failure: a fully visible Two-Seam pill did not open from the Four-Seam specimen.
The pill now pushes its explicit bundled destination directly and has a44-point
minimum full-label hit area. Independent source review and the actual complete sibling/Back chain passed.
The original227.02-second recording preserves the uninterrupted UI session; a
separately labeled57.19-second4x accelerated derivative is for review, not frame-rate proof.
The earlier basic and sibling failures are retained with their source boundaries; a build/archive
success is not counted as successful navigation.

## Photograph inspection

Actual Grips → Split-Finger side photograph → 150% zoom → deliberate right pan →
Reset → Close passed. The panned frame shows the hand and ball at the right crop;
Reset restores the full centered, aspect-fit photograph at 100%. Root inspected
both frames. This resolves the earlier deliberate-pan reset gap without changing
or mirroring a photograph. It is not spoken VoiceOver evidence.

## Local evidence custody

Artifacts remain local under
`/Users/AustinHumphrey/Pitch-Atlas/artifacts/native/archive-world/context-acceptance/`:

- `index-filtered-scrolled-before.jpg` and `index-after-back-scroll-loss.jpg`.
- `post6151-index-filtered-scrolled-before.jpg` and
  `post6151-index-after-back-scroll-loss.jpg`.
- `round2-5414add-index-filtered-scrolled-before.jpg` and
  `round2-5414add-index-after-back-four-seam-anchor.jpg`.
- `photo-150-panned-right.jpg` and `photo-reset-100-centered.jpg`.
- `index-6bb960c-tests.log` records the eight focused tests.
- `sibling-followup-two-seam-destination.jpg`, `sibling-followup-chain.mp4` and
  `sibling-followup-chain-edited-4x.mp4` retain the final related-pitch proof.
- `final-source-parity-e486501.json` and `related-family-direct-build.log` identify
  the latest five-file parity and build.
- `finalcandidate-study-first-clear-of-tabbar.jpg` and
  `finalcandidate-nested-back-index.jpg` document the corrected nested journey.
- `final-f285654-build.log` and `final-source-parity.json` identify the final
  source-matched build and removal of the temporary Index prints.
- `index-6bb960c-coordinate-diagnostic.log` records the captured row frames,
  restore request and post-return frames for the corrected first judgment.

No current-source signed export, physical-device acceptance, production release
or TestFlight delivery follows from these checks. The successful unsigned archive
now includes the Index, study-link and related-family repairs at `e486501`. Provenance, bundled
claims, rights, moderation and seam geometry are unchanged.
