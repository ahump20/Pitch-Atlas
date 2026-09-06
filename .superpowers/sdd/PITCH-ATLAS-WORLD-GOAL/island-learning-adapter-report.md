# Island learning adapter report

Status: implemented and locally verified on `codex/archive-within-reach`.

## Source and artifact

- Source commit: `ab649526bcbf9f60e1722484495d1ff522604030`
- Package/version: `@pitch-atlas/island-learning@0.1.0+ab64952`
- Artifact: `output/island-learning/0.1.0+ab64952/`
- Receipt SHA-256: `53ee809e9444dbf476f7851f6f9362c216b1b6f551a922f5cfb6566dfa751e69`
- Runtime entry SHA-256: `900affa3f9a061db3cf858a6543a6c4436cc083b952c94bf3191eb095b50518d`
- Declaration entry SHA-256: `1dbdae12a33a5845260f5adc671ea563c1b7af4b29eb9560ec3a9b4123113f75`

`receipt.json` records the full source commit, package identity, Pitch Atlas
maintenance attribution, and hashes for the ESM entry, source map, declaration
entry, declaration map, and package metadata. The artifact is generated outside
`dist/`, is not included in the app build, and was neither published nor deployed.

## Public exports

- Canonical `PITCHES`, `pitchBySlug`, `CONFIDENCE_META`, and all canonical data
  types, including `Claim`, `Source`, `ClaimConfidence`, and `RightsStatus`.
- Existing comparison contract: `CompareSelection`, `CompareView`, constants,
  validation, normalization, URL parsing, and URL generation.
- Existing seam math and 2D helpers: vectors, raw/oriented seam points and
  polylines, projection, path/run generation, stitches, and lacing.

The ESM bundle contains the original source modules. It does not copy the pitch
registry and has no React, router, SEO, browser-global, storage, or network
startup. Media remains unmirrored and is referenced only through original paths
and the canonical rights/source/attribution records.

## Verification

- `npm run typecheck` — passed.
- `npm run lint` — passed.
- `npx vitest run src/test/island-learning.test.ts --reporter=verbose` — 3 passed.
- `npm run test` — 96 files passed, 1 skipped; 1001 tests passed, 9 skipped.
- `npm run build:island-learning` — passed; emitted the versioned artifact above.
- Direct Node ESM import — passed; 12 canonical pitches and slug lookup verified.
- Strict TypeScript consumer compile against built `index.js`/`index.d.ts` — passed.
- Bundle side-effect scan for React, router, Unhead, `window`, `document`, and
  `fetch` — no matches.
- `npm run build` — passed; 109/109 routes prerendered and the integrity suite
  passed (6 passed, 1 skipped).
- `npm run preview -- --host 127.0.0.1 --port 4317` plus `GET /repertoire/` —
  local preview returned `200 text/html` at `http://127.0.0.1:4317/repertoire/`.

## Limits and provenance contract

Movement remains qualitative shape language; the model intentionally provides no
fabricated velocity, spin, or break figures. Seam output remains a seam-informed
schematic rather than measured cover geometry. The adapter performs no runtime API
calls. A host may vendor and self-host this maintained export but must keep Pitch
Atlas attribution and may not imply host authorship. Reproducing any referenced
photograph remains subject to its canonical rights, attribution, and source record.

README, UI copy, canonical data, compare behavior, seams, routes, renderer, CSS,
native surfaces, CSP, travel/save/arena code, and backend were not changed. The
Pitch Atlas mission and sourced provenance model remain intact and in lockstep.
