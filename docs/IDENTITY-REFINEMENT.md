# Pitch Atlas — selective color and collectible balance

Evidence date: 2026-09-05. This follow-up corrects the overuse of orange in the preceding [connected archive delivery](ARCHIVE-WORLD-EVIDENCE.md). It preserves the established identity rather than introducing another design system.

## Web review

Runtime `fc3d50c9d4d5129c24d6b91677987180cce8299f` is available at the [immutable Cloudflare preview](https://06c6afb0.pitch-atlas.pages.dev), on the existing [draft PR 191](https://github.com/ahump20/Pitch-Atlas/pull/191).

The burnt-orange signature card and existing iridescent lettering remain unchanged. Standard cards recover the existing refractor foil over neutral stacked edges. Charcoal/slate study, comparison, reading and discovery panels replace broad orange/brown fills. Recessed media, pressed frames, stock thickness, athletic nameplates and ivory reference plates remain. The rejected beige seam canvas has not returned.

Only `src/index.css`, `src/styles/archive.css`, `src/styles/world.css` and `src/styles/compare.css` changed product styling in this refinement. `docs/PITCH-ATLAS-WORLD-GOAL.md` records the user's corrected direction. No behavior, content, dimensions or animation timing changed.

Verification:

- `npm run typecheck` and `npm run lint`: passed.
- `npm run test -- --maxWorkers=1`: **971 passed, 9 existing skips**.
- `npm run build`: passed; **109/109 prerendered routes**, six distribution integrity checks passed, one existing skip.
- Built local preview on port 5181 and [exact-runtime CI 33990806095](https://github.com/ahump20/Pitch-Atlas/actions/runs/33990806095): passed. CI's hosted-preview step was skipped; the separately executed hosted check below supplies that evidence.
- `PLAYWRIGHT_CHANNEL=chrome npm run test:preview:browser -- https://06c6afb0.pitch-atlas.pages.dev`: **19 passed**, including mobile, short landscape, reduced-motion branding, source/card interactions and representative route layouts.

Logs are `/tmp/pitch-atlas-identity-{typecheck,lint,tests,build,preview,hosted-smoke}.log`. Accepted actual-browser frames in `output/playwright/`:

| Artifact | Scope |
| --- | --- |
| `identity-home-desktop.png` | Local final styling, preserved orange signature composition. |
| `identity-cards-desktop-ready.png`, `identity-discovery-desktop.png`, `identity-card-mobile.png` | Local final styling, visually compared against the earlier `f44-` frames. |
| `identity-hosted-cards.png`, `identity-hosted-discovery.png` | Deployed final styling at 1440×1000; root viewed both. |
| `identity-hosted-mobile.png` | Deployed 390×844 view; complete ordinary card, credit and action; document width 390px. |

The independent scoped review passed the desktop card/discovery comparison and bounded CSS diff. Root also accepted the hosted desktop and mobile frames. Motion is unchanged; still-image acceptance is not a fresh motion or device-performance measurement.

## Native review

The corresponding four-file SwiftUI material refinement restores neutral shared panels and limits orange to the gold signature grade. Ordinary in-motion cards use the existing chrome base with the existing foil at 0.30 opacity and a dark inner separator. The first bright continuous rainbow rim was rejected and retained only as a diagnostic capture.

Accepted actual Atlas, Study, Comparison and Practitioner stills are at `/Users/AustinHumphrey/Pitch-Atlas/artifacts/native/archive-world/restored-motif/`: `atlas-after.png`, `study-after.png`, `compare-after.png` and `practitioner-after.png`, with matching `*-before.png` frames. Both root and scoped reviewer accepted the final card edge and neutral panels. The final Atlas image has SHA-256 `9ab89853675b6c537ba212298338eebb236ba78528a7309091eeed032efcfd4b`; `atlas-initial-rim.png` remains rejected. These are actual simulator views; some use existing QA launch shortcuts to reach the view and are not a newly recorded navigation journey.

Native source `9f7e7c4fbfce0663c1870178f2563663b5fc6c75` is pushed to the existing [draft PR 35](https://github.com/ahump20/Pitch-Atlas-iOS/pull/35). The final simulator build passed (`restored-motif/build.log`). The four changed native source files are `Components/CardBackPanel.swift`, `Components/ContentCards.swift`, `Components/PitchAtlasUI.swift` and `Core/Theme/PitchAtlasTheme.swift`, under `PitchAtlas/`; `docs/ARCHIVE-STUDY.md` records the native evidence. [Exact-source CI 33991372182](https://github.com/ahump20/Pitch-Atlas-iOS/actions/runs/33991372182) passed build, bundled-content drift and **71 tests with zero failures**; the terminal log is `restored-motif/ci-9f7e7c4.log`. Protected untracked assets and temporary QA launch hooks were not committed.

The token contrast receipt (`contrast.json`) gives primary/secondary text 14.36:1/11.61:1, utility blue 4.58:1 on the brightest neutral stock, and signature secondary labels 5.00:1. The unchanged legacy secondhand accent measures 3.87:1 on that stock; this is not an app-wide contrast or accessibility certification. Existing Dynamic Type, Reduce Motion and reduced-transparency behavior was not changed.

## Trust and release boundaries

README, source/confidence UI, canonical data model, source registry, grip/media rights, moderation and shared seam/contact geometry remain unchanged and continue to uphold **sourced, not corrected**. The repaired white-leather rendering remains an explicitly labeled seam-informed schematic; it is not a calibrated scan.

Earlier continuous web/native recordings demonstrate the unchanged learning behavior with the previous material styling. They remain baseline interaction evidence and are not relabeled as recordings of this palette. Earlier accessibility-size and reduced-preference native captures likewise precede this style-only correction.

This is a preview and native source review. Production, signing/export, physical-device performance, full VoiceOver traversal, first-launch offline and swipe-back acceptance, and TestFlight/App Store delivery remain separate in the [release checklist](ARCHIVE-RELEASE-CHECKLIST.md). The existing unsigned native archive is from `1e2b854`, not this follow-up.
