# Pitch Atlas — connected archive and material revision

Evidence date: 2026-09-05. This records the delivery in [PITCH-ATLAS-WORLD-GOAL.md](PITCH-ATLAS-WORLD-GOAL.md), including Austin's rejection of the beige seam presentation and the low-quality baseball finish. Earlier Archive Within Reach evidence is a baseline, not proof of this revision.

**Material follow-up:** [Identity refinement](IDENTITY-REFINEMENT.md) supersedes the palette and card-finish review below. It restores selective signature orange, standard refractor rims and neutral shared panels. The following source versions and recordings remain the preceding implementation checkpoint; they are not recordings of the new finish.

## Review builds

- Web runtime: `f13f6f42b7c518fcaec700a29e94ae638db10cf0` on branch `codex/archive-within-reach`, [immutable Cloudflare preview](https://f44c9def.pitch-atlas.pages.dev). [Draft PR 191](https://github.com/ahump20/Pitch-Atlas/pull/191).
- Native source: `1e2b8547d14d0083fadc8af55feaf21f6e5d1871`, existing SwiftUI app and [draft PR 35](https://github.com/ahump20/Pitch-Atlas-iOS/pull/35). Current simulator build, **71-test CI**, unsigned archive and complete discovery/study/comparison/return recording passed.
- The [release checklist](ARCHIVE-RELEASE-CHECKLIST.md) separately tracks signing, physical-device inspection and delivery. This is a preview implementation review; no production deployment or TestFlight/App Store upload is asserted.

## What changed and why

The front door now joins an original 12–6 grip demonstration, Wainwright's sourced account, his practitioner file, and Foster's historical fadeaway. The reader can move from a hand to a person or historical question and back to the pitch. The demonstration is explicitly credited to Austin H.; the adjacent quotation retains its own author, source and confidence.

Study records its active step, selected master and reference photograph in the URL. Exact practitioner/pitch relationships produce the story link. Compare retains the pair and shared view, with aligned sourced cue rows and direct returns to each specimen. Index results precede supplementary media so search and the selected row remain close together. Existing discussion entry points now invite a useful observation and retain real, unseeded forms and their rights/moderation controls.

Charcoal and copper replace the rejected beige seam canvas and the large reading surfaces in the revised journey. The collectible set shares recessed media mounts, pressed edges, layered stock shadows, restrained wear and one light direction. The orange cover remains distinct while the standard cards receive the same construction detail.

The baseball now has natural white leather, fine grain, a recessed neutral cover join and curved dark-red paired lacing. The SVG cover is opaque, hiding the rear seam. A hand-mesh winding defect that exposed the inside of finger tubes was repaired; the fingers are now closed volumes. Card models stay still at rest. The seam stage retains its complete drawing until the model's first rendered frame, and resets readiness after offscreen disposal. It remains a **seam-informed schematic**, with simplified hand forms; it is not a calibrated scan or anatomical reconstruction.

Main source changes for review:

| Area | Files |
| --- | --- |
| Collectible composition and materials | `src/index.css`, `src/styles/archive.css`, `src/styles/world.css`, `src/components/v2/HeroCase.tsx`, `src/components/refractor/specimenFace.tsx` |
| Ball finish, solid hand geometry and matching fallback | `src/components/ball/three/Ball.tsx`, `Studio.tsx`, `Hand.tsx`, `src/lib/taperedTube.ts`, `src/lib/seam2d.ts`, `src/components/fallback/BaseballCover.tsx`, `SeamSchematic.tsx` |
| Seam startup and offscreen continuity | `src/components/ball/three/FirstFrame.tsx`, `src/components/v2/AlignedSeamScene.tsx`, `RefractionBridge.tsx` and its regression test |
| Discovery and contextual next steps | `src/components/v2/ArchiveDiscovery.tsx`, `src/lib/archiveConnections.ts`, `src/components/pitch/PitchConnections.tsx`, `src/pages/AtlasHomeV2.tsx`, `CraftsmanChapter.tsx`, `LostPitchChapter.tsx`, `SoftballPitchChapter.tsx` |
| Study, comparison and return | `src/components/study/GripStudy.tsx`, `src/pages/ComparePage.tsx`, `RepertoirePage.tsx`, `PitchChapter.tsx`, `src/styles/compare.css`, `study.css` |
| Media and real discussion | `src/components/media/ExternalMediaCard.tsx`, `src/components/sections/DiscussionPanel.tsx`, `KnowledgePage.tsx` and the media lifecycle regression test |
| Native materials and media | `PitchAtlas/Components/ContentCards.swift`, `CardBackPanel.swift`, `PitchAtlasUI.swift`, `GripFilm.swift`, `Core/Theme/PitchAtlasTheme.swift`, `Core/Scene3D/LeatherMaps.swift`, `SpecimenSceneBuilder.swift`, `Features/PitchDetail/SeamBall.swift` in PR 35 |
| Native discovery, study and comparison | `PitchAtlas/Features/Atlas/AtlasView.swift`, `Craftsmen/CraftsmanDetailView.swift`, `Learn/KnowledgeWingView.swift`, `PitchDetail/PitchDetailView.swift`, `Study/CompareSelection.swift`, `Core/Data/ContentModels.swift`, `PitchStore.swift` and focused native tests in PR 35 |

The draft PR contains the full diff, including focused relationship, geometry, lifecycle and route tests. The preview browser scripts' optional Chrome channel affects verification only.

## Representative journeys

| Required journey | Current evidence |
| --- | --- |
| Find → inspect → compare → return | Hosted browser acceptance: filtered row selection, all study steps, inspection zoom/reset, Back restores the index query/scroll, second-pitch selection, shared hand/orientation, specimen entry and Back preserve the pair. Continuous recording in `final-hosted-acceptance/`. A separate WebGL recording shows the current material presentation. |
| Curiosity → practitioner → grip → restored context | Actual hosted CLI journey: home discovery folio → Wainwright → 12–6 study → select Wainwright and Seam → follow his story → Back. URL, selected master and pressed Seam step were asserted after returning. The continuous discovery recording includes the subsequent discussion entry. |
| Historical experiment → relevant pitch | Hosted home → Rube Foster's Fadeaway → “Open the screwball file” → `/repertoire/screwball`, verified from the rendered page and route. The bridge explicitly says it does not reconstruct Foster's undocumented hold. |
| Lesson and softball discovery → retained comparison | Home → sequencing lesson → Back → softball wing → Compare pair. Both destinations rendered; the final comparison retained Four-seam/Slider and the Side orientation. |
| Studied pitch → real conversation | The hosted 12–6 discussion opens its live form, labeled Name/Comment fields, ownership terms and real empty state. The recording and still preserve this state. No post, terms acceptance or upload was submitted. |
| Native connected discovery, study, compare and return | See the native receipts below. Bundled reference records and existing native community capabilities are retained. |

## Goal audit

| Product criterion | Evidence and limit |
| --- | --- |
| Inviting front door | Final desktop/mobile home stills show the grip, headline, index and direct study actions. Native `materials/card-final.png` now shows the actual filed rail and discovery entry points. |
| Meaningful connections | Recorded web practitioner/master, Foster/screwball and sequencing/softball paths use documented relationships. Native's fresh recording follows Atlas → Nolan Ryan → his filed Four-seam through bundled signature relationships. |
| Memorable point of view | The original hand demonstration, separate Wainwright quotation/source and Foster historical question form the discovery folio. Native cards retain real, accurately attributed reference media. |
| Learning continuity | Hosted recordings and route assertions prove retained study step, master, comparison pair and return context. The new native recording continues through Fingers, comparison with Slider, Cues, Done and Back to Nolan Ryan. |
| Living archive | The actual web discussion form, firsthand prompt and ownership controls are visible in the discovery recording. Native's current Four-seam Discussion was opened and inspected with an honest empty state and unaccepted guidelines/age gates. No posts, uploads or authentication actions were submitted. |
| Coherent surfaces | Web stills and journeys cover home, index, study, comparison, practitioner, history, lessons and softball at the requested viewport classes. Native actual card and comparison stills carry the same orange stock, light cover and dark-red lacing; accessibility-size and reduced-preference captures are indexed below. |
| Useful detail and motion | Static compositions remain complete. Shared seam geometry, first-frame fallback, paused offscreen media, explicit study controls and still comparison models make the visual treatment serve inspection. Physical-device 60fps remains a separately listed release check. |

This audit applies to the representative bounded delivery in the goal document. It does not certify exhaustive relationship curation, every route at every accessibility setting, or production/store delivery.

**Bounded implementation delivery complete:** source is reviewable in the existing web/native draft PRs, the web preview is verified, current native build/test and actual simulator journey evidence passed, and the materials are demonstrated against earlier stills. External release conditions remain explicitly separate below and in the release checklist.

## Web verification

Exact-runtime [CI run 33984087979](https://github.com/ahump20/Pitch-Atlas/actions/runs/33984087979) passed lint, **971 tests / 9 existing skips**, typechecking through build, **109/109 prerendered routes**, six distribution integrity checks and the browser smoke suite. The separate CodeQL checks also passed.

Local commands and retained logs:

| Command | Result / receipt |
| --- | --- |
| `npm run typecheck` | Passed before the material pass; final `npm run build` reran `tsc --noEmit` successfully. |
| `npm run lint` | Passed, `/tmp/pitch-atlas-world-final-lint.log`; final evidence-script check `/tmp/pitch-atlas-evidence-final-lint.log`. |
| `npm run test -- --maxWorkers=1` | **971 passed, 9 skipped**, `/tmp/pitch-atlas-world-final-tests-resumed.log`. The earlier interrupted process has no completion claim. |
| `npm run build` | Passed, `/tmp/pitch-atlas-world-final-build.log`; 109 prerendered routes, six integrity tests passed / one existing skip. |
| `npm run preview -- --host 127.0.0.1 --port 5181` | Local built preview available during review; `/tmp/pitch-atlas-world-preview-server.log`. |
| `PLAYWRIGHT_CHANNEL=chrome npm run test:preview:browser -- https://f44c9def.pitch-atlas.pages.dev` | All **19 checks passed**, `/tmp/pitch-atlas-f44-hosted-smoke.log`. Includes 320/375/390px and short landscape, sourced card backs, mobile menu, real public field-notes response, Support/Privacy and Learn layout. |
| `PLAYWRIGHT_CHANNEL=chrome ARCHIVE_BUILT=1 npm run test:archive:browser -- <preview>` | Desktop 1440×1000, mobile 390×844 and landscape 568×320 layout/study/inspection phases passed. Recording then encountered a missing local FFmpeg executable. After installing the 1 MB Playwright FFmpeg runtime, the unchanged recorded/offline/no-JS phases passed with `ARCHIVE_JOURNEY_ONLY=1`. Logs: `/tmp/pitch-atlas-f44-archive-browser-chrome.log`, `/tmp/pitch-atlas-f44-archive-journey.log`. |
| Seam first-frame and remount checks | Four focused tests passed. Actual WebGL CLI check observed first draw, offscreen canvas removal, remount readiness and diagram control. The final code received a separate scoped review. |

The optional `PLAYWRIGHT_CHANNEL` changes only the verification browser. Unset CI behavior is preserved. It avoids dependence on a removed local headless-shell cache and a previously observed teardown hang; no product assertion was removed. The first full test attempt under concurrent load had a route timeout; the final sequential local run and exact-runtime CI both passed.

## Rendered evidence index

Web evidence root on the Pro: `/Users/AustinHumphrey/Pitch-Atlas-living-media/output/playwright/`.

| Artifact | Meaning and boundary |
| --- | --- |
| `review-web-home.png`, `review-web-home-second.png` | Earlier implementation baseline. |
| `before-e52-home-desktop.png`, `before-e52-seam-desktop.png`, `before-e52-home-mobile.png` | Matched baseline captures from immutable `e52cc2f` preview `https://2d8e53d4.pitch-atlas.pages.dev`: desktop 1440×1000 and mobile 390×844. Compare directly with the final `f44-` views below. The seam baseline retains the rejected beige canvas and coarse cover/red cord. |
| `world-discovery-first.png`, `world-compare-desktop-first.png` | First connected-archive compositions, before the rejected beige material was replaced. |
| `f44-home-desktop.png`, `f44-cards-desktop.png`, `f44-discovery-desktop.png`, `f44-seam-desktop.png` | Final hosted runtime: cover, standard set, connected discovery folio and rendered seam. The selected pair remains visible in the tray while browsing. |
| `f44-home-mobile.png`, `f44-cards-mobile-ready.png`, `f44-compare-mobile.png` | Final hosted 390px views. The settled mobile card shows the complete reference credit, cue plate and action. |
| `final-seam-first-frame-fixed.png`, `final-seam-drawing.png` | Built `f13f6f4` seam model and matching drawing, following the startup/remount fix. |
| `material-compare-mobile.png` | WebGL 390px comparison with repaired solid fingers and tighter framing; unchanged by the later seam-startup fix. |
| `final-hosted-acceptance/after-home-*.png`, `compare-cues-*.png`, `compare-movement-*.png`, `study-*.png` | Final hosted runtime at all three requested sizes, Reduced Motion and no WebGL. |
| `final-hosted-acceptance/page@10e39fea83834d535894bcfd7c536995.webm` | Continuous final-runtime index → study → inspection → Back → comparison → specimen → Back. No WebGL. |
| `final-hosted-study-comparison.webm` | **15.12-second** continuous WebGL selection → study steps → comparison → returned pair on the final hosted runtime. The extracted 6s and 13s frames were inspected. |
| `final-hosted-discovery-journey.webm` | Continuous hosted discovery → Wainwright → 12–6 master/step → story → restored study → discussion. Includes natural pauses; 118.16 seconds. |
| `final-hosted-history-connection.png`, `final-hosted-screwball-file.png`, `final-hosted-discussion.png` | Actual history bridge, resulting basic file and contribution form. |
| `final-hosted-sequencing.png`, `final-hosted-softball.png` | Current hosted lesson and softball entry points, reached through home discovery links. |

Blank first-frame captures, a card capture taken during resize/repaint and earlier open-finger images are diagnostic artifacts, not accepted final proof. The original native `card-final.png` attempt was rejected when it showed an unloaded hero instead of the filed rail. Its replacement captured at 14:23 and independently viewed by root shows the actual Four-seam/Two-seam rail; that replacement is accepted.

## Accessibility, performance and trust boundaries

- Browser checks cover keyboard-operated controls, Escape dismissal, focusable native buttons, visible selected states, restored URLs, Reduced Motion, no WebGL and no-JavaScript reading. A final hosted keyboard walkthrough explicitly verified arrows change the grip view, F flips handedness, H lifts/restores the hand, Enter opens inspection, and Escape closes it with focus returned to the inspection trigger. The material review checked key foreground/background contrast pairs. These are representative checks, not a claim of a complete WCAG conformance audit.
- The PWA test proves a **previously loaded** specimen can reload and study offline. It does not prove every remote photograph/video is cached or genuine first-launch offline behavior.
- Offscreen media retains its opened layout while the third-party iframe is removed. Card models have no decorative spin; the seam canvas is demand-rendered and removed offscreen. Desktop recordings and source inspection do not prove 60fps on an iPhone 13-class device.
- The final source diff leaves README, canonical pitch records, `src/data/types.ts`, `src/data/sources.ts`, `seamPoint`, grip contact definitions, Supabase migrations, moderation and rights records unchanged. The README, visible source/confidence UI and data model continue to uphold sourced-not-corrected. The current Northstar expresses that as trust infrastructure within the larger craft archive.
- New links are exact stored relationships or explicitly documented historical connections. No new pitch-data API, fabricated movement measurement, community activity, source freshness date or celebrity media was introduced.

## Qualitative review

The strongest improvement is coherence: a card now opens a useful sequence of visual study, sourced perspective and a return path. The discovery folio gives that sequence emotional context by placing a real hand next to a practitioner's own account. The standard cards now have comparable construction detail to the burnt-orange cover, and the white leather/red lacing reads clearly against the charcoal stage even without motion.

The independent scoped review rated the seam bridge and hero around **A−**, the filed set and connected web experience **B+**. Those are aesthetic judgments, not release certifications. The hand models remain visibly stylized; a future anatomical model would require its own sourced geometry and render validation. Relationship curation is representative rather than exhaustive: this delivery demonstrates real useful paths without pretending every archive record has a fully authored web of related material.

## Native receipts

Native branch `codex/archive-within-reach`, exact source `1e2b8547d14d0083fadc8af55feaf21f6e5d1871`, has green [CI run 33987500529](https://github.com/ahump20/Pitch-Atlas-iOS/actions/runs/33987500529): **71 tests, zero failures**, build and bundled-content drift check. The final local simulator build passed. The exact-source unsigned archive on Air succeeded at `/Users/AustinHumphrey/Pitch-Atlas-iOS/.build/PitchAtlas-archive-world-route-final.xcarchive`, bundle `com.pitchatlas.app`, version 1.1.0/build 11. Receipts copied to `materials/ci-1e2b.log`, `route-final-build.log` and `unsigned-archive-1e2b.log`. The archive is unsigned preparation, not a signed export or TestFlight delivery.

The card changes enlarge the collectible thumbnail within its clipped frame, use `#E8D8C7` for small specimen-card text on orange (at least 4.99:1 against the brightest fill), and stack first-party attribution at narrow widths. This contrast result applies to the repaired card labels, not all legacy accent text in the app. Full inspection photographs remain aspect-fit and accurately attributed. Card family colors remain in dots and borders.

Accepted material/comparison artifacts at `/Users/AustinHumphrey/Pitch-Atlas/artifacts/native/archive-world/materials/`: `compare-normal.png`, `compare-cues.png`, `compare-side.png`, `compare-thumb.png`, `compare-left.png`, `compare-a11y.png`, `compare-reduced.png`, `return-context.png`, and the 80.31-second continuous `comparison-cues-return.mp4`. These show the material/geometry checkpoint before the final card-only framing and small-label changes. Shared orientation is identical across both diagrams; rear contacts are intentionally hidden by the opaque ball. Maximum accessibility text and reduced motion/transparency preferences were inspected; test settings were restored. The directly comparable baseline is `archive-world/round-1/compare-normal.png`, with the prior golden cover and continuous red lines; root viewed it alongside the new white-leather/red-lacing composition.

The poster continuity correction is `f29898d3d52a93cb5237fa62fde46c9615507b84`. The original decoded image remains visible until AVPlayerLayer has a displayable frame. Player, current-item and looper failures restore it; looper observation is necessary because a failure can occur before a current item exists. The actual invalid-file playback test and bundled-film/rights test passed locally (2/2). Exact-source [CI run 33986746584](https://github.com/ahump20/Pitch-Atlas-iOS/actions/runs/33986746584) passed **71 tests, zero failures**, build and content drift. Its unsigned archive succeeded. These are checkpoints preceding the subsequent Atlas navigation correction. A separate scoped source review approved the poster change, including failure handling and observer teardown.

Current `materials/card-final.png` and `discovery-final.png` show the same combined Atlas discovery/filed-rail composition: centered real hand/ball photographs, complete dark nameplates and readable warm labels. Both were viewed by root. The fresh journey exposed a mixed-navigation defect in the new Atlas entry: the practitioner hall opened, but a practitioner selected inside it did not advance. `1e2b854` repairs all seven Atlas wing entries with a consistent value-based route and destination mapping, preserving the existing five tabs and native navigation. The scoped source review and actual repeated journey both passed.

The new continuous `materials/discovery-practitioner-study-compare-final.mp4` is **268.63 seconds** with natural interaction pauses: Atlas → Craftsmen → Nolan Ryan → signature Four-seam → Fingers → compare Slider → Cues → Done → Back to Nolan. Current `practitioner-final.png`, `study-final.png`, `journey-compare-final.png` and `practitioner-return-final.png` show that route. Root inspected the practitioner, selected Fingers step and returned practitioner stills, plus the recording's 120s/220s/260s frames showing selection, sourced Cues and the retained specimen. `materials/final-evidence-manifest.json` records final artifact hashes and sizes.

Additional final-source native smoke passed: Atlas → Learn → Kinetic Chain, Atlas → Lost Pitches → Satchel Paige, and `pitchatlas://pitch/four-seam`. `lesson-route-final.png`, `lost-route-final.png`, `discussion-final.png` and `atlas-return-final.png` retain the results. The last image shows the Four-seam/Slider pair still present after returning across the five-tab experience. Discussion was inspection only; no guidelines acceptance, age confirmation, post, upload or sign-in was performed.

Capture custody: `materials/source-parity-final.json` records that 145 of 146 tracked source/resource/test inputs match the authoritative Air checkout. The only different file is the temporary QA clone's `PitchAtlasApp.swift`. The subsequent exact-source audit clarifies that `PA_TAB`, `PA_PITCH` and `PA_CRAFTSMAN` were already committed DEBUG shortcuts; the extra `PA_COMPARE` handler was the QA-only overlay. None were exercised in the 268.63-second recording: it used a normal launch without `PA_*` overrides and real UI taps/swipes. The extra handler and protected untracked assets were not pushed. Captures demonstrate actual SwiftUI views, not recreated mockups.

The disposable task-owned simulator's test host and actual app now launch successfully; no CoreSimulatorService restart was needed. The original simulator and data are preserved. No failed capture is accepted as current journey proof, and no simulator condition is recast as a signing or production result.
