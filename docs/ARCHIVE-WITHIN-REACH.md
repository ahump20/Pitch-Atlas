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
- Homepage Source/Card and Compare controls share a stable toolbar outside the rotating faces. Keyboard focus stays on the same toggle; scroll-driven dealing applies to the card alone.
- A grip schematic remains visible until the WebGL renderer completes its first draw. Module loading alone no longer reveals an empty canvas, including inside inspection.
- Canvas event setup ignores cleared or detached DOM targets when asynchronous initialization finishes after navigation. The normal R3F event manager and disposal remain authoritative; both canvas sites share the guard.

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
- `npm run test`: hosted checkpoint `0f538ed` passed 963 tests / 9 skipped in GitHub verification, plus typecheck, lint, build and browser smoke. The first-frame loading repair also passed its local focused loading/study/route suite (81 tests), lint, build, and an actual WebGL inspection check.
- `npm run build`: passed; 109 routes prerendered, none skipped. Post-build integrity checks: 6 passed, 1 skipped.
- `npm run test:archive:browser -- <origin>`: desktop, 390px mobile, short landscape, primary action in first viewport, no horizontal overflow, comparison views, study, zoom/reset, Escape, no-WebGL, Reduced Motion, index/history context, and selection continuity passed against the development origin.
- The final comparison suite passed 7 tests; transition cancellation/error-reporting tests passed all 3.
- `ARCHIVE_BUILT=1 npm run test:archive:browser -- http://127.0.0.1:4177`: passed the same layout/journey checks plus interactive offline reload of a previously loaded specimen and prerendered reading without JavaScript. Offline narration and external lessons are not guaranteed; the loaded-asset cache is bounded to 20 entries/30 days.
- `npm run test:preview:browser -- http://127.0.0.1:4177`: passed.
- Both browser suites passed against the Cloudflare checkpoint at https://14fa5c3f.pitch-atlas.pages.dev (runtime source `0f538ed`). Alias: https://archive-within-reach.pitch-atlas.pages.dev. GitHub verification: https://github.com/ahump20/Pitch-Atlas/actions/runs/33972056771. Hosted stills, the no-WebGL journey, and results are under `artifacts/archive-within-reach/final-preview/`. No production deployment occurred.
- Desktop Chromium also rendered the WebGL seam bridge and study model. The two projection captures align visually; manual specimen/diagram controls respond, and the bridge canvas unmounts offscreen. Reduced Motion intentionally uses the study schematic. Captures and metadata are in `artifacts/archive-within-reach/webgl/`; this is not physical-device performance evidence.
- Built and hosted captures and result metadata are retained alongside the matched baseline in `artifacts/archive-within-reach/`. Web draft review: https://github.com/ahump20/Pitch-Atlas/pull/191.

The subsequent real-WebGL walkthrough exposed an asynchronous R3F event-connection race when leaving Grips for Cues. The shared event guard passed two real-event-manager regression tests, typecheck, lint, and the 109-route build. The identical recorded journey then completed on the built local preview with no page errors. This includes hero selection, all study steps, first-frame inspection, zoom/reset, and all comparison views. The PR records the final deployed commit, immutable preview URL, and its GitHub verification; the branch preview alias follows that reviewed runtime. Physical-device frame rate remains unmeasured.

## Trust and release boundary

README, UI claims, and the data model retain sourced-not-corrected behavior: attributed claims and confidence labels stay visible; canonical records, rights, moderation rules, and the shared seam geometry are unchanged. Unfiled grip models remain explicit in comparison; a filed pitch record does not imply a filed grip model.

Native work lives in the existing `ahump20/Pitch-Atlas-iOS` repository, with its own build/test evidence and draft PR. Web preview, production, native simulator/device evidence, signing/export, and TestFlight delivery are separate states. Physical iPhone 13-class 60fps acceptance and TestFlight delivery are not established by the web evidence here.

Native draft review: https://github.com/ahump20/Pitch-Atlas-iOS/pull/35. Source implementation `c9881fd`: 68 native tests passed, an unsigned archive and simulator build were produced. The simulator subsequently recovered. Clean captures demonstrate Grips/Cues/Movement, Side/Thumb, accessibility text sizing, four-seam study, and invalid-link UI. A native navigation-title contrast repair (`8ed716d`) was rebuilt and visually verified; evidence update `930da74` records the detailed scope. A 32-second interaction recording and stills live locally at `/Users/AustinHumphrey/Pitch-Atlas/artifacts/native/archive-study/`.

Native evidence update `574b937` additionally proves the pair remains through Done, the Index tab deep link, and reopening comparison. Reduce Motion and reduced transparency were enabled together, comparison rendered completely, and both settings were restored.

The native four-seam redesign now has a genuine baseline from `dbfb3ca` captured on the same simulator. Review exposed an initially weak composition change; `413c87c` then moved Study/Compare actions directly below the title, compacted the grip film, preserved its full frame with aspect-fit playback, and made Study jump to the native study panel. All 68 tests passed after that change. The final paper/ink action contrast fix `65c3314` was rebuilt and captured. Compare `pitch-atlas-baseline-dbfb3ca-four-seam.png` with `pitch-atlas-current-four-seam-paper-action.png` in the native artifact directory; the separate `composition-v2-axxxl` capture establishes the revised accessibility-size layout. Earlier “before fix” comparison captures document only the navigation-title fix, not the redesign baseline.

Native review head `3a130d6` merges its current base and repairs a content-drift CI failure through the existing generator. Relative to current native `main`, the content diff is exactly three attribution-phrase replacements in `repertoire.json`, matching authoritative web `main` `d2f77d1`. Pitch facts, source records, and confidence values are unchanged. Fresh regeneration is clean and byte-stable. GitHub build/test and content drift checks passed at https://github.com/ahump20/Pitch-Atlas-iOS/actions/runs/33972518450 (67 committed tests); the local QA checkout also included the protected, untracked snapshot test and passed 68 tests.

A fresh unsigned archive from exact native head `3a130d669319518900a0dc2c8e0ec13a545c30d8` subsequently succeeded on the Air at `/Users/AustinHumphrey/Pitch-Atlas-iOS/.build/ArchiveWithinReach-3a130d6-unsigned.xcarchive` (55 MB, app payload present). Its adjacent `.log` ends `ARCHIVE SUCCEEDED`; SHA-256 `9909aca7349e32ae703d0f2d359c519e33f5f1123c27353662641434ccfaecda`. `codesign -dv` reports `code object is not signed at all`. The older archive was retained. This prepares the final source for the remaining signing step and is not an exportable TestFlight build.

The Air signed archive still fails with `CodeSign errSecInternalComponent`; the Pro has no signing identity/profile. First-launch offline, complete assistive-technology/device acceptance, and physical performance remain open. No TestFlight upload occurred. Refer to the native PR's `docs/ARCHIVE-STUDY.md` for subsequent runtime checks and remaining gates.
