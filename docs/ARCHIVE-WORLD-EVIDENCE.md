# Pitch Atlas — connected archive and material revision

Evidence date: 2026-09-05. This records the delivery in [PITCH-ATLAS-WORLD-GOAL.md](PITCH-ATLAS-WORLD-GOAL.md), including Austin's rejection of the beige seam presentation and the low-quality baseball finish. Earlier Archive Within Reach evidence is a baseline, not proof of this revision.

## Review builds

- Web runtime: `f13f6f42b7c518fcaec700a29e94ae638db10cf0` on branch `codex/archive-within-reach`, [immutable Cloudflare preview](https://f44c9def.pitch-atlas.pages.dev). [Draft PR 191](https://github.com/ahump20/Pitch-Atlas/pull/191).
- Native source: `d0900e0b1d591015b51f746ab3c54dd9041950c2`, existing SwiftUI app and [draft PR 35](https://github.com/ahump20/Pitch-Atlas-iOS/pull/35). Exact-source CI and unsigned archive passed; current card/discovery runtime capture remains pending below.
- The [release checklist](ARCHIVE-RELEASE-CHECKLIST.md) separately tracks signing, physical-device inspection and delivery. This is a preview implementation review; no production deployment or TestFlight/App Store upload is asserted.

## What changed and why

The front door now joins an original 12–6 grip demonstration, Wainwright's sourced account, his practitioner file, and Foster's historical fadeaway. The reader can move from a hand to a person or historical question and back to the pitch. The demonstration is explicitly credited to Austin H.; the adjacent quotation retains its own author, source and confidence.

Study records its active step, selected master and reference photograph in the URL. Exact practitioner/pitch relationships produce the story link. Compare retains the pair and shared view, with aligned sourced cue rows and direct returns to each specimen. Index results precede supplementary media so search and the selected row remain close together. Existing discussion entry points now invite a useful observation and retain real, unseeded forms and their rights/moderation controls.

Charcoal and copper replace the rejected beige seam canvas and the large reading surfaces in the revised journey. The collectible set shares recessed media mounts, pressed edges, layered stock shadows, restrained wear and one light direction. The orange cover remains distinct while the standard cards receive the same construction detail.

The baseball now has natural white leather, fine grain, a recessed neutral cover join and curved dark-red paired lacing. The SVG cover is opaque, hiding the rear seam. A hand-mesh winding defect that exposed the inside of finger tubes was repaired; the fingers are now closed volumes. Card models stay still at rest. The seam stage retains its complete drawing until the model's first rendered frame, and resets readiness after offscreen disposal. It remains a **seam-informed schematic**, with simplified hand forms; it is not a calibrated scan or anatomical reconstruction.

## Representative journeys

| Required journey | Current evidence |
| --- | --- |
| Find → inspect → compare → return | Hosted browser acceptance: filtered row selection, all study steps, inspection zoom/reset, Back restores the index query/scroll, second-pitch selection, shared hand/orientation, specimen entry and Back preserve the pair. Continuous recording in `final-hosted-acceptance/`. A separate WebGL recording shows the current material presentation. |
| Curiosity → practitioner → grip → restored context | Actual hosted CLI journey: home discovery folio → Wainwright → 12–6 study → select Wainwright and Seam → follow his story → Back. URL, selected master and pressed Seam step were asserted after returning. The continuous discovery recording includes the subsequent discussion entry. |
| Historical experiment → relevant pitch | Hosted home → Rube Foster's Fadeaway → “Open the screwball file” → `/repertoire/screwball`, verified from the rendered page and route. The bridge explicitly says it does not reconstruct Foster's undocumented hold. |
| Lesson and softball discovery → retained comparison | Home → sequencing lesson → Back → softball wing → Compare pair. Both destinations rendered; the final comparison retained Four-seam/Slider and the Side orientation. |
| Studied pitch → real conversation | The hosted 12–6 discussion opens its live form, labeled Name/Comment fields, ownership terms and real empty state. The recording and still preserve this state. No post, terms acceptance or upload was submitted. |
| Native connected discovery, study, compare and return | See the native receipts below. Bundled reference records and existing native community capabilities are retained. |

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

Blank first-frame captures, a card capture taken during resize/repaint and earlier open-finger images are diagnostic artifacts, not accepted final proof. The first native `card-final.png` attempt was also rejected when it showed an unloaded hero instead of the filed card rail; it is not accepted final evidence.

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

Native branch `codex/archive-within-reach`, exact source `d0900e0b1d591015b51f746ab3c54dd9041950c2`, has green [CI run 33984976940](https://github.com/ahump20/Pitch-Atlas-iOS/actions/runs/33984976940): **70 tests, zero failures**, build and bundled-content drift check. The local simulator build also passed. The exact-source unsigned archive on the Air succeeded; the copied receipt is `/Users/AustinHumphrey/Pitch-Atlas/artifacts/native/archive-world/materials/unsigned-archive-d090.log`.

The last changes enlarge the collectible thumbnail within its clipped frame, use `#E8D8C7` for small text on orange (at least 4.99:1 against the brightest fill), and stack first-party attribution at narrow widths. Full inspection photographs remain aspect-fit and accurately attributed. Family colors remain in dots and borders.

Accepted material/comparison artifacts at `/Users/AustinHumphrey/Pitch-Atlas/artifacts/native/archive-world/materials/`: `compare-normal.png`, `compare-cues.png`, `compare-side.png`, `compare-thumb.png`, `compare-left.png`, `compare-a11y.png`, `compare-reduced.png`, `return-context.png`, and the 80.31-second continuous `comparison-cues-return.mp4`. These show the material/geometry checkpoint before the final card-only framing and small-label changes. Shared orientation is identical across both diagrams; rear contacts are intentionally hidden by the opaque ball. Maximum accessibility text and reduced motion/transparency preferences were inspected; test settings were restored.

Fresh final card/discovery capture remains pending. The original QA simulator's launch service stalled before the app started. A new disposable task-owned simulator is completing first boot; the original device and data are preserved. No failed capture is accepted as current card proof, and no simulator condition is recast as a signing or production result.
