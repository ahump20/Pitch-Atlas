# Pitch Atlas

A persistent, sourced, interactive reference for how pitches are gripped and thrown.

The knowledge of how a pitch works is scattered and ephemeral. The best footage has no structure; every grip reference is a flat photo or a PDF. Pitch Atlas is the layer underneath that footage: a structured archive where each pitch carries an original interactive specimen and every claim wears the label of where it came from.

## The model: sourced, not corrected

**Many ways can work. Nothing here is marked right or wrong. Everything is marked by where it came from and how confident the source is.**

A four-seam fastball can be thrown a dozen credible ways. Pitch Atlas does not adjudicate which grip is correct. It records what is known, attributes it, and labels the confidence of each claim. A number from Statcast and a number repeated by a beat writer are both welcome on the page, but they do not look the same: one reads as official data, the other reads as secondhand and attributed. The reader judges. The atlas only sources.

This principle governs the README, the UI copy, and the data model in equal measure.

## What v1 is

v1 is a single reference prototype for the **four-seam fastball**. It is a visual proof of two things and nothing more:

1. **The signature medium.** An original-geometry interactive 3D ball that teaches a pitch: the backspin axis, the Magnus force, the carry that makes the pitch ride. It dissolves on scroll into a 2D schematic of the same seam-point function, then into a gravity ghost that draws the induced-vertical-break gap as a dimension line.
2. **The provenance model.** Every visible number carries a source and a confidence label. Nothing is faked. The page is fully usable with zero WebGL.

v1 deliberately excludes auth, real community posts, voting, reproduction logs, any second pitch, and any runtime API call. The data model names the full future shape (canonical record, master variants, community variants, reproduction logs); v1 populates only the four-seam canonical record and three sourced master variants, and shows an honest empty state for community.

## Provenance and rights policy

- **No MLB, team, or player photos, logos, footage, or likenesses.** v1 uses original 3D geometry, original diagrams, and outbound source links only. A master-variant visual is our own re-posed schematic tuned to a sourced figure, never a player image.
- **No copied instructional prose.** Grip and mechanics text is paraphrased in our own words and cited with a link.
- **Every real-player number carries a `Source`** (`id`, `label`, `url`, `retrievedAt`, optional `season`) and a `confidence` label. Anything that cannot be verified renders as `approximate` or `unverified`. Nothing ships bare.
- **No runtime API dependencies.** All data is static and sourced in the repo. There are no runtime calls to Statcast, Baseball Savant, Rapsodo, TrackMan, MLB, or any external source.

## Seam accuracy is auditable

The seam geometry, equation, constants, coordinate system, and stitch-count assumption are documented in [`docs/seam-calibration.md`](docs/seam-calibration.md), including what is exact and what is schematic. The public copy states the honest level of precision. If a permitted reference cannot pin the geometry, the copy says "seam-informed schematic" rather than claiming measured precision.

## Youth and safety

Community variants are not in v1. When they launch, they launch with age-aware visibility, source labels, and coach and parent safeguards. Pitch Atlas makes no medical, injury-prevention, or age-appropriate-prescription claims. Grip and workload copy stays descriptive and sourced, never prescriptive.

## Stack

- **Build:** Vite + React + TypeScript + Tailwind CSS v4 (CSS-first, no `tailwind.config.js`).
- **3D:** Three.js with React Three Fiber and drei, classic WebGLRenderer. The 3D ball is original parametric geometry, not a downloaded model.
- **Fonts (self-hosted, no runtime external request):** Hanken Grotesk for prose, Commit Mono for data, gauges, source badges, and on-ball annotations.
- **Deploy:** Cloudflare Pages (static).
- **Community backend:** none in v1. Later: Cloudflare D1 + KV + Supabase auth + one Worker.

## Develop

```bash
npm install
npm run dev        # local dev server
npm run typecheck  # tsc, no emit
npm run lint       # eslint
npm run test       # vitest
npm run build      # production build to dist/
npm run preview    # serve the production build
```

## Honesty contract

No auth. No fake community posts. No fake adoption counts. No fake verified-pro badges. No hardcoded freshness strings. No MLB, team, or player photos, logos, footage, or likenesses. No copied instructional prose. No unsourced grip claims. No runtime API dependencies. Unsourced becomes `unverified` or `approximate`.

## License

Source content paraphrased and cited. Original geometry, diagrams, and code are this project's own. See source links in the colophon for every figure.
