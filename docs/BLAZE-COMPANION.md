# Blaze Companion

Blaze is Austin's chonky red-brown dachshund from the existing Codex pet package. In Pitch Atlas, Blaze is a quiet orientation cue at the edge of the work: he follows the baseball from pitch to pitch, wears a small baseball helmet, reacts to real feedback states, and gets out of the way on serious surfaces.

## Source Of Truth

- Canonical source package: `/Users/AustinHumphrey/.codex/pets/blaze/`
- Web asset copy: `src/assets/blaze/spritesheet.webp`
- Web runtime pose strips: `src/assets/blaze/blaze-*.webp`
- Metadata copy: `src/assets/blaze/pet.json`
- Frame manifest: `src/assets/blaze/frameManifest.ts`
- Verified source checksums on 2026-06-09:
  - `spritesheet.webp`: `992ed0f946edd8ea694c04977f22de162f191fd5aa5e8abc910d816320fa0a7b`
  - `pet.json`: `d5f6fc46f71fd672375e40263cf5fb08dda5d81bd66b505e3a32d63358af24d2`

Do not regenerate Blaze or replace him with stock art. Runtime dog assets are compact crops derived from the same source pet sheet: web uses pose strips, and iOS uses native image-set exports.

## Product Rules

- Keep Blaze optional, small, useful, and page-native.
- Setting key: `pitchAtlas.showBlazeCompanion`.
- The sprite art is decorative. The web rail exposes only one intentional control: a pat button labeled "Give Blaze a quick pat".
- Hide Blaze on source-label, privacy, report, block, account, and delete-account flows.
- Hide Blaze whenever bottom system notices or update prompts reserve the viewport.
- Reduced-motion users get a still frame or no Blaze.
- No heavy animation libraries, runtime generation, fake progress, fake freshness, or fake data.

## Frame Manifest

The spritesheet is 1536 by 1872 with 8 columns and 9 rows. Each cell is 192 by 208.

- `idle`: row 0, columns 0-5.
- `chasing`: row 1, columns 0-7.
- `caught`: row 3, columns 0-3.
- `sniffing`: row 5, columns 0-3.
- `napping`: row 7, columns 0-5.
- `concerned`: row 8, columns 0-3.
- `still`: row 0, column 0.

## Route And State Mapping

- `/`: home-plate persona. Blaze sniffs near the entry point, then idles or naps after real inactivity.
- `/repertoire`, `/grips`: hidden by default because dense cards and controls take the rail space. Empty/search states may dispatch a one-shot sniffing event when there is a clear open margin.
- `/pitch/:slug`: pitch-mound persona. The baseball rolls along a low rail and Blaze follows with inertial scroll motion.
- `/repertoire/:id`: scorecard persona. Same low rail, with a scorecard route prop.
- `/craftsmen`: rosin-bag persona.
- Data-tool routes (`/sandbox`, `/movement-map`, `/compare`, `/kinetic-chain`, `/classify`): chalk-talk persona or still, depending on available safe space.
- `/sources`, privacy, report, block, account, and delete-account routes: hidden.
- Patting Blaze on web: one tiny bark bubble plus a generated local bark chirp if browser audio is allowed.
- Success events: `caught` plus a belly-roll reaction, then back to the route mood.
- Recoverable errors: `concerned` plus a small oops/ear-dip reaction, then back to the route mood.

## Implementation Notes

Web writes scroll progress to CSS variables on the companion ref through `requestAnimationFrame`; it does not update React state per animation frame. The key variables are `--blaze-progress`, `--blaze-x`, `--blaze-y`, `--blaze-speed`, `--blaze-tilt`, `--blaze-ball-spin`, `--blaze-paw-opacity`, `--blaze-hop`, `--blaze-squash`, `--blaze-ear-lag`, and `--blaze-opacity`.

iOS uses `@AppStorage("blazeCompanionEnabled")`, SwiftUI's reduced-motion environment, and exported frame assets cut from the canonical sheet. The persistent companion remains outside hit testing, mounted as a bottom safe-area inset, and hidden or still on source/account/privacy/report/block/delete-account flows. On compact-width iPhone screens, the persistent rail hides when there is no safe rail above the system tab bar; page-native inline cameos carry the personality instead.

The helmet, collar tag, baseball, dirt base, scorecard, mound, rosin bag, chalkboard, paw prints, and rail graphics are code-native overlays. The dog likeness remains the original pet-derived raster asset.
