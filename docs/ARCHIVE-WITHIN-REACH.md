# Archive Within Reach — implementation and evidence

Pitch Atlas now has a shared study flow: select a pitch while browsing, inspect its reference hold, keep a master distinction beside it, and compare two records without losing the selection. The homepage uses a shorter, warmer composition with the original specimen card and the headline “The pitch, in your hand.”

## What changed

- The app shell owns the two-slot comparison state, replacement dialog, tray, URL representation, session persistence, and history scroll restoration. `/compare` provides Grips, Cues, and Movement. Invalid/unavailable slugs leave an explicit open slot. `/grips#grip-compare` remains a working deep link.
- Filed cards and index rows/binder pockets expose comparison. Grip-library search is URL-backed. Both indexes preserve browsing context through history.
- Baseball study has Hold, Fingers, Seam, and Sourced cue steps; source-backed contact controls; a retained master selection; photo/model inspection with zoom/reset; and chapter links. Softball uses its available written evidence and does not acquire invented models or variants.
- Shared presentation quaternions make SVG orientation controls work without WebGL. The seam equation and contact data are untouched. The 3D/2D homepage transition uses matching orthographic projection.
- Paper reading areas, chapter progress, and editorial typography carry into Learn, Craftsmen, and Lost Pitches. Shared section heroes carry the visual system into the remaining reference and utility pages.
- External lessons require explicit loading and release their iframe offscreen. Community video pauses offscreen or when the document hides. Upload status reports note-saving and actual file completions; a failed attachment does not ask the contributor to submit the saved note again.
- Decorative lighting is static at rest. Existing tilt/reveal machinery, scroll timelines, a cancellable study transition, and route view transitions supply motion. No animation dependency, data API, or schema was added.
- Interrupted route transitions handle readiness cancellation without hiding invalid snapshots. A bounded runtime cache retains successfully loaded application scripts/styles so a previously loaded study remains interactive offline; heavy 3D bundles are still excluded from installation precaching.

## Evidence

Local web checkout: `/Users/AustinHumphrey/Pitch-Atlas-living-media`, branch `codex/archive-within-reach`, starting revision `d2f77d1`.

The matched baseline was rendered from that revision in an isolated temporary worktree. Captures are deliberately local, consistent with this repository’s screenshot policy:

- `artifacts/archive-within-reach/before-home-desktop.png`
- `artifacts/archive-within-reach/after-home-desktop.png`
- Corresponding `mobile` (390×844) and `landscape` (568×320) frames.
- `study-*.png` and `compare-cues-*.png` / `compare-movement-*.png`.
- `artifacts/archive-within-reach/study-comparison-journey.webm`: index selection → staged study → inspection → Back → comparison → specimen → Back.
- `artifacts/archive-within-reach/browser-results.json` records the capture origin and time.

The stills use Reduced Motion with WebGL unavailable. The recording uses normal motion with the SVG fallback. Neither establishes physical-device frame rate.

## Validation

- `npm run typecheck`: passed.
- `npm run lint`: passed.
- `npm run test`: 956 passed, 9 skipped. After final review added the explicit unfiled comparison state and model provenance, the affected route suite passed all 75 tests, including its new provenance regression check.
- `npm run build`: passed; 109 routes prerendered, none skipped. Post-build integrity checks: 6 passed, 1 skipped.
- `npm run test:archive:browser -- <origin>`: desktop, 390px mobile, short landscape, primary action in first viewport, no horizontal overflow, comparison views, study, zoom/reset, Escape, no-WebGL, Reduced Motion, index/history context, and selection continuity passed against the development origin.
- The final comparison suite passed 7 tests; transition cancellation/error-reporting tests passed all 3.
- `ARCHIVE_BUILT=1 npm run test:archive:browser -- http://127.0.0.1:4177`: passed the same layout/journey checks plus interactive offline reload of a previously loaded specimen and prerendered reading without JavaScript. Offline narration and external lessons are not guaranteed; the loaded-asset cache is bounded to 20 entries/30 days.
- `npm run test:preview:browser -- http://127.0.0.1:4177`: passed.
- Built captures and result metadata are retained alongside the matched baseline in `artifacts/archive-within-reach/`; hosted preview results follow in the review PR.

## Trust and release boundary

README, UI claims, and the data model retain sourced-not-corrected behavior: attributed claims and confidence labels stay visible; canonical records, rights, moderation rules, and the shared seam geometry are unchanged. Unfiled grip models remain explicit in comparison; a filed pitch record does not imply a filed grip model.

Native work lives in the existing `ahump20/Pitch-Atlas-iOS` repository, with its own build/test evidence and draft PR. Web preview, production, native simulator/device evidence, signing/export, and TestFlight delivery are separate states. Physical iPhone 13-class 60fps acceptance and TestFlight delivery are not established by the web evidence here.

Native draft review: https://github.com/ahump20/Pitch-Atlas-iOS/pull/35. Source implementation `c9881fd`, evidence update `46ebd4f`: 68 native tests passed, an unsigned archive and simulator build were produced. The Air signed archive fails with `CodeSign errSecInternalComponent`; the Pro has no signing identity/profile. Simulator UI startup stalled at BackBoard, so clean native visual captures, accessibility/device inspection, and first-launch offline acceptance remain open. No TestFlight upload occurred.
