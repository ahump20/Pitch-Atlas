# Island learning adapter

`@pitch-atlas/island-learning` is the small, framework-independent export of the
Pitch Atlas learning model. It lets a maintained host such as BSI vendor and
self-host a version-pinned snapshot while keeping Pitch Atlas named as the author
and maintainer of the underlying record.

Build it with `npm run build:island-learning`. The command writes outside the app
deployment directory at `output/island-learning/<package-version>+<commit>/`.
That folder contains bundled ESM, source maps, TypeScript declarations, package
metadata, and `receipt.json` with the source commit, committed input hashes, and
SHA-256 hashes for every emitted file in the importable closure. The build refuses
to attribute dirty or untracked adapter inputs to `HEAD`. It is not
an npm publication and the normal Vite app build does not deploy it.

The public entrypoint exports the canonical `PITCHES` array and `pitchBySlug`, the
unchanged data-model types (including `Claim`, `Source`, `ClaimConfidence`, and
`RightsStatus`), `CONFIDENCE_META`, the comparison selection contract and helpers,
and the shared 3D/2D seam functions. Vite bundles those original modules into the
ESM artifact; there is no copied pitch registry or translated data layer. The
entrypoint has no React, router, SEO, DOM, network, or storage startup. Its compare
helpers intentionally use the standard `URLSearchParams` Web API, available in Node.

Consumers should treat records as evidence-bearing material. Claims retain their
source and confidence labels; visual references retain rights and attribution.
Some fields are intentionally absent: movement is qualitative shape language,
not fabricated velocity, spin, or break measurements. The seam is a
**seam-informed schematic**, not measured cover geometry. The adapter performs no
runtime API calls.

Media is referenced by its original `src` path and is not mirrored into this
artifact. A host that chooses to reproduce a referenced photograph must separately
carry its `rights`, `attribution`, and `source` record and verify that its license
permits the host's use. An unmirrored path is not permission to copy a photograph.
Pitch Atlas remains the named maintainer; vendoring this artifact does not transfer
authorship to the host.

Example:

```ts
import {
  PITCHES,
  compareUrl,
  normalizeSelection,
  projectSeam,
  type Claim,
  type Source,
} from '@pitch-atlas/island-learning'
```
