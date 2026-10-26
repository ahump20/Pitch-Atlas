# Holo-card handoff: original Design export against the current repository

Inspected 2026-10-23. This comparison preceded implementation in the saved Pitch
Atlas cloud environment. No remote branch, PR, or deployment was changed.

## Baselines and source identity

- Current `main`: `3f518f690629cf05f156801a1ecfe0878d90fa0a`, confirmed by
  `git ls-remote` and the GitHub PR API.
- Existing [PR #245](https://github.com/ahump20/Pitch-Atlas/pull/245),
  `holo-specimen`: `94f88e271fb54f3d94b2d9eed0a9d6a6891a55cc`. The implementation
  already exists there (37 commits, 106 changed files). This follow-up branch,
  `codex/holo-card-handoff-20261023`, starts at that exact head.
- Other open work is separate: #246 design-sync documentation, #247 community
  outage copy, #248 shape-map point of view, #227 security, and #128 Fable prep.
  Their changes were not imported. The starting working tree was clean.
- Original [Claude Design project](https://claude.ai/design/p/e8154c97-53f1-4412-aa6b-9d019bc85e0c):
  Library `libfile_e29b6842c750819181c1dc7a0eb6db91`, version 0,
  `original-design-project.zip`, 14,358,749 bytes. Downloaded via the Library
  materialization tool and verified locally; SHA256
  `3e62f7a2b1be769e15e7c6b06603268f8403b37e851856c55338e5a1b12e670c`.
  The archive stays outside the repository.

## Evidence-based gap map

| Original source / intent | Current `main` | Existing PR #245 | Handoff decision |
|---|---|---|---|
| `templates/holo-foil-card/HoloFoilCard.dc.html`: 14-stop, 115-degree glossy fan; 3px foil, 18px inner radius; 9s foil loop and 5.5s ice sweep; only `iceFlash` and `stackDepth` props | The brand already moved to a 21-stop, 112-degree burnt-chrome ramp and 5:7 specimen cards | `material/foilRamp.ts` pins the current CSS ramps to shader textures; Ember, powder/red/navy, turquoise and bone identities survive | No missing 14-stop token transplant. Keep the current palette, card proportions and sourced content. No glossy fan or unsourced statistics port. |
| `templates/pitch-grip-atlas/index.html`: different **15-stop** `--foil-heritage`, 7px black inner border, narrow 11s sheen | Current cards already have black framing, neutral stock edges and a grip-led face | Whole-card material, bevel and bezel extend that system | Keep the material intent; do not conflate the two templates or import their geometry. |
| `tokens/effects.css`: still the older 8-stop rainbow and gold chase | Gold has already been retired in the relevant card palette by merged work (#208, #211, #212, #213, #216) | Uses the current burnt-orange hero and two throwback finishes | Export-internal drift is established; it is not evidence of a missing production palette change. |
| `components/refractor/PitchSpecimenCard/*`, root `_ds_bundle.js`, `_preview/PitchSpecimenCard.js` | Shared `PitchSpecimenCard` / `RefractorCard`; real clip/photo/model/schematic resolver; original grip routes and compare | Same shared components extended, no second app; `foil/` replaced by `material/` | Preserve the current shared implementation. The `.jsx` export is a re-export, the permissive `.d.ts` is not the source implementation. |
| Angle/light response | Spring tilt and inner-window foil already exist | Whole-card material, masks, eight combinable finish controls, five presets, quiet independent back, enlarged inspector and PNG/WebM export already exist | No rebuild. Validate existing integration. |
| Real media, provenance, independent backs, compare, `/pitch/:slug#grip-lab` | Present | `specimenFace`, `SpecimenBack`, `InspectorRail`, shared compare and `GripStudy` preserve them | Keep the existing records, routes and original seam function. No anatomy or new statistics. |
| Reduced motion / mobile | Repo improves on the fixed desktop glossy template, which has no reduced-motion query | Static material and no-WebGL fallback exist; the inspector's static card still computes `touch-action: none` | **Verified remaining gap:** allow vertical scrolling over a card that cannot be tilted under reduced motion. |
| Inspector closes back into the collection | Inspector absent on main | Escape closes and clears the URL, but browser verification leaves `document.activeElement` on `BODY` | **Verified remaining gap:** return focus to the actual opener, including the failed-chunk dialog, without scrolling the collection. |
| Code-to-Design sync | `.design-sync/config.json` points at the accepted main CSS build | CSS changed; the branch already documents a post-merge repoint and re-sync | Keep the accepted convention. Do not overwrite tokens or publish a new Design artifact from an unaccepted branch. |

## Source-to-repository mapping

- Glossy `foilshift` / `iceSweep` intent → `useCardTilt.ts`,
  `material/useAmbientMotion.ts`, `material/shaders.ts`, `MaterialLayer.tsx`.
  The current implementation uses angle, viewer and light instead of copying the
  template's perpetual background-position animation.
- Heritage framing → `RefractorCard.tsx`, `src/index.css`,
  `material/measureLayout.ts`, `cardMaterialProgram.ts`.
- Imported `PitchSpecimenCard` → `src/components/refractor/PitchSpecimenCard.tsx`,
  `specimenFace.tsx`, `accents.ts`. Hero and collection callers are `HeroCase.tsx`,
  `ChromeWall.tsx`, and `ArchiveDiscovery.tsx`.
- Existing grip geometry → `GripStudy.tsx` and `GripViewer.tsx`; the seam bridge
  remains `RefractionBridge.tsx`. No template hand model is imported.
- Finish / inspector / export → `src/components/refractor/material/`,
  `src/components/inspector/`, `SpecimenBack.tsx`, and `src/styles/inspector.css`.
- Future imported preview → `.design-sync/previews/PitchSpecimenCard.tsx` and
  `.design-sync/config.json`; publication remains separate from this local handoff.

Archive fingerprints: glossy template
`43a44696c0148369ab16598adc10018abac7a59401257fcc39931ef52371b9bf`;
heritage template
`d311b65de7f4f7c0e739f953c2d1be02c30c2aae547dabfa7bc082fdf1d73bd0`;
compiled `_ds_bundle.js`
`b530413d557c0757c0aeabdd1eacad32a50f26acddcde8a5c33b30433c6bd84a`.
`_ds_sync.json` reports PitchSpecimenCard render key `570401ff9796b21e`, source key
`5aa7d89508c34174`, and styleSha
`f75371d2baf8a84f3af35cc2983554811b8aa5c60659717c215865f89c3559cc`.
These identify the exported snapshot; they do not make its templates current code.

The actual glossy thumbnail and locally rendered templates were viewed. The
heritage page's external Three.js module failed to load here; its frame and sheen
were visible, its 3D behavior was not verified. That failure does not justify
inventing replacement geometry.

## Implementation scope and verification

Only the two reproduced inspector integration gaps above are selected for code
changes. Existing PR #245 remains the material handoff; this is a follow-up to it.
Fresh verification results and exact final commit are recorded in the companion
handoff report after implementation.

Repository `AGENTS.md`, `docs/NORTHSTAR.md`, README, CI and preview gates were read.
The available Superpowers verification skill was read before the cloud skill
catalog became unavailable. No local `.agents/skills`, Parallax Card or Impeccable
skill is installed. The Library skill package was unavailable at materialization
time; the exposed Library tool's documented consumer-local signed transfer was
used. Tripo is not warranted: no geometry change is needed.
