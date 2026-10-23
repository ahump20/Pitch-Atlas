# Pitch Atlas holo-card handoff

The original Design archive was compared with today's main and open branches
before implementation. [The gap map](2026-10-23-holo-card-handoff-audit.md) records
the source identities, hashes, source-to-repository mappings, and decisions.
The historic template is not a stranded implementation gap: open PR #245 already
contains the shared material, independent backs, finishes, inspector, and exports.

## Branch and commits

- Feature branch: `codex/holo-card-handoff-20261023` (local, unpublished).
- Accepted main at inspection: `3f518f690629cf05f156801a1ecfe0878d90fa0a`.
- Follow-up base: PR #245's `94f88e271fb54f3d94b2d9eed0a9d6a6891a55cc`.
- Tested implementation commit: `ecc3e42a86ca7125f90f3dab80a132409bccfee4`.
- The following documentation commit contains this report and browser evidence;
  its exact head is supplied in the final handoff. The code delta above is one
  commit on top of the existing PR, not a replacement for its 37 commits.

No push, PR publication, merge, Design re-sync, or deployment was performed.
Main and other branches were preserved. Publication scope remains for the parent
thread to confirm.

## What changed

The inspector now returns keyboard focus to the actual card button on Escape,
Close, or browser Back. Its failed-download dialog uses the same return path.
Focus restoration uses `preventScroll` and skips a disconnected opener after
navigation into a specimen.

Under reduced motion, the inspector's static card permits vertical touch
scrolling. It previously retained the two-axis drag capture even though its tilt
handlers were disabled. The interactive card's gesture behavior is preserved.

The existing smoke gate gained focus-return and real touch-swipe checks. Focus,
scrolling and deep-route data checks use the no-WebGL path so their assertions
do not compete with software-rendered Three.js. Both existing browser scripts
accept `PLAYWRIGHT_EXECUTABLE_PATH`, alongside their existing channel option;
CI's default browser selection is unchanged.

Changed implementation files, relative to the follow-up base:

| File | Purpose |
|---|---|
| `src/components/inspector/InspectButton.tsx` | Pass the actual opener |
| `src/components/inspector/inspectorContext.ts` | Type the optional opener |
| `src/components/inspector/SpecimenInspectorHost.tsx` | Retain and restore focus for both dialogs |
| `src/components/inspector/SpecimenInspector.tsx` | Forward the close-autofocus callback |
| `src/components/inspector/SpecimenInspector.test.tsx` | Escape returns to the opener |
| `src/components/inspector/SpecimenInspectorHost.test.tsx` | Failed-download Close returns to the opener |
| `src/styles/inspector.css` | Static-card vertical scrolling |
| `scripts/preview-browser-smoke.mjs` | Focus and swipe regressions; executable override |
| `scripts/archive-browser-acceptance.mjs` | Executable override |

Documentation adds this report, the gap map, and
`docs/superpowers/captures/2026-10-23-holo-card-handoff/` (ten WebP browser captures,
two JSON check records, and the unsuppressed smoke failures).

## Fresh verification

Node `24.19.0`, npm `11.9.0`. Installation succeeded with
`npm ci --cache /workspace/.npm-cache --no-audit --no-fund`. The first attempt used
an unwritable default cache and failed; no lockfile change was needed.

| Command / check | Result |
|---|---|
| `npm run typecheck` | Passed |
| `npm run lint` | Passed, zero errors |
| `npm run test` | Passed: 115 files, 1 skipped file; 1,128 tests passed, 10 skipped; 44 node tests passed |
| Focused inspector Vitest files | Passed: 19/19; new focus regression first failed against the original behavior |
| `npm run build` | Passed: 109/109 routes prerendered; post-build 7 passed / 1 skipped; JS bundle budget passed |
| `npm run preview -- --host 127.0.0.1 --port 4173` | Running at `http://127.0.0.1:4173/` |
| `PLAYWRIGHT_EXECUTABLE_PATH=/usr/bin/chromium npm run test:preview:browser -- http://127.0.0.1:4173` | **Failed overall:** 15 passed, 8 failed; both new inspector checks passed. All eight failed steps report unreachable Supabase requests. |
| `PLAYWRIGHT_BROWSERS_PATH=/workspace/.cache/ms-playwright PLAYWRIGHT_EXECUTABLE_PATH=/usr/bin/chromium npm run test:archive:browser -- http://127.0.0.1:4173` | Passed: desktop, phone and landscape reduced-motion/no-WebGL journeys; compare, study, inspection, zoom/reset, Escape, Back and recorded selection journey |
| New smoke functions run alone with bundled Chromium 149 | Passed: focus return and actual touch scrolling, using their final static setup |
| Custom WebGL visual acceptance, system Chromium 154 | Passed 16 checks; one expected WebGL-context error was recorded while explicitly testing the no-WebGL fallback |
| `npm run design-sync:check` | **Blocked:** `.ds-sync/resync.mjs not found`; the per-machine gitignored driver is absent |
| `git diff --check`, both browser scripts' `node --check` | Passed |

The full smoke failures were not suppressed. Requests to
`https://cloeoulvrrfcbitrjpso.supabase.co/rest/v1/external_content_items` and
`/rest/v1/rpc/list_public_field_notes` fail with
`net::ERR_TUNNEL_CONNECTION_FAILED`. The untouched PR #245 head was archived and
built separately, then its original smoke suite was run at port 4174: 12 passed,
9 failed, with the same backend failures plus two bundled-browser inspector-close
position failures. The bundled browser also stalled on DOM replacement during a
first focus run here. System Chromium passed the close hit-target checks at every
tested size. The dedicated final static inspector regressions passed in bundled
Chromium too. This is not a clean overall smoke result or proof that live community
services work.

The build budget remains the repository's existing 500 KiB per JS chunk, with an
800 KiB allowance for Three core. The inspector is 44.70 kB (15.37 kB gzip) and the
lazy WebM encoder 164.27 kB (43.39 kB gzip). No new dependency or rendering loop was
added. The earlier PR's M3 GPU/frame benchmark was not repeated on this cloud CPU.

## Browser evidence

The original glossy thumbnail and rendered template frames were viewed, as were
the actual current card and exports. These are captures of the existing product,
not newly generated art.

- [Desktop front](../captures/2026-10-23-holo-card-handoff/desktop-front.webp),
  [independent back](../captures/2026-10-23-holo-card-handoff/desktop-back.webp),
  [filed set](../captures/2026-10-23-holo-card-handoff/desktop-filed-set.webp).
- [390×844](../captures/2026-10-23-holo-card-handoff/inspector-390.webp),
  [667×375](../captures/2026-10-23-holo-card-handoff/inspector-667.webp),
  [568×320](../captures/2026-10-23-holo-card-handoff/inspector-568.webp).
- [Reduced motion](../captures/2026-10-23-holo-card-handoff/reduced-motion.webp),
  [no WebGL](../captures/2026-10-23-holo-card-handoff/no-webgl.webp),
  [check details](../captures/2026-10-23-holo-card-handoff/browser-checks.json),
  [archive journeys](../captures/2026-10-23-holo-card-handoff/archive-checks.json),
  [smoke failures](../captures/2026-10-23-holo-card-handoff/browser-smoke-failures.txt).

The hero answered pointer input at approximately +7.15° / +4.09°. Cards held 5:7,
source links and real media were present, the three filed-set identities survived,
and Study grip navigated to `/pitch/twelve-six#grip-lab`. A touch swipe over the
reduced-motion card stayed at 0px with the old gesture rule and scrolled 211px
with the fix. PNG front and back both downloaded at 1800×2513 and were opened for
inspection. Their raw files are `/tmp/pitch-atlas-handoff/front.png` and `back.png`.
WebP captures are encodings of the raw browser screenshots; raw PNG captures remain
under `/tmp/pitch-atlas-handoff/captures-original/`.

## Limits and next step

- Community service connectivity remains unverified and blocks a green broad
  smoke gate. No backend settings, billing, or moderation policy were changed.
- The Design-sync driver is unavailable. The existing convention also requires a
  separate CSS entry repoint and artifact re-sync from accepted main after #245
  merges. Nothing was published back to Claude Design.
- No real iPhone, shipped Safari, WebKit, Firefox, or device-orientation run was
  performed here. No fresh WebM export/frame count, transparent export, offline
  PWA (`ARCHIVE_BUILT=1`), or hardware GPU benchmark was run. Existing unit tests
  cover encoder eligibility, composition and fallback; they do not replace those
  browser checks.
- The original heritage template's external Three.js import failed to load in
  this environment. Its frame/sheens were visible, its geometry was not verified
  or imported.
- PR #245's deferred mobile Finish-sheet redesign remains outside this handoff.

README and UI still carry the pitching-craft mission. Canonical pitch records,
provenance/source models, media rights, geometry, and routes were preserved. There
are no new statistics or anatomy. Review this small follow-up with existing PR
#245; confirm publication scope with the parent before any push or PR update.
