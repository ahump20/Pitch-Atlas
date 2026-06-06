# Pitch Atlas

A persistent, sourced, interactive reference for how pitches are gripped and thrown.

The knowledge of how a pitch works is scattered and ephemeral. The best footage has no structure; every grip reference is a flat photo or a PDF. Pitch Atlas is the layer underneath that footage: a structured archive where each pitch carries an original interactive specimen and every claim wears the label of where it came from.

## The model: sourced, not corrected

**Many ways can work. Nothing here is marked right or wrong. Everything is marked by where it came from and how confident the source is.**

A four-seam fastball can be thrown a dozen credible ways. Pitch Atlas does not adjudicate which grip is correct. It records what is known, attributes it, and labels the confidence of each claim. A number from Statcast and a number repeated by a beat writer are both welcome on the page, but they do not look the same: one reads as official data, the other reads as secondhand and attributed. The reader judges. The atlas only sources.

This principle governs the README, the UI copy, and the data model in equal measure.

## What the atlas is

A navigable index of pitch specimens. Five are live, in the order they teach best, each its own deep-linkable page (`#/four-seam`, `#/two-seam`, `#/circle-change`, `#/twelve-six`, `#/slider`):

| Specimen | The pitch it teaches |
|---|---|
| 00 Four-seam | Pure backspin, Magnus up, the ball that rides |
| 01 Sinker | The axis tilted toward the arm, ride traded for run and sink |
| 02 Circle change | Fastball arm, the velocity off, arm-side fade |
| 03 12-6 curve | The fastball mirrored, topspin, Magnus down, the ball that drops |
| 04 Slider | Gyro spin pointed at the plate, almost no Magnus, late and short |

Every specimen proves the same two things:

1. **The signature medium.** An original-geometry interactive 3D ball that teaches the pitch. A pitch is defined by its spin axis, so the axis is authored and the **Magnus force is computed from it, not hand-placed** (`spin × velocity`): it points up for the four-seam, down for the curve, leaned for the sinker and change, and runs short for the gyro slider, whose force arrow shrinks because most of its spin does no work. The hero dissolves on scroll into a 2D schematic of the same seam-point function. The four-seam shows a gravity-ghost carry diagram; the breaking and offspeed pitches show a catcher's-eye movement plot, both scaled from sourced break figures and labeled schematic.
2. **The provenance model.** Every visible number carries a source and a confidence label. Nothing is faked. The page is fully usable with zero WebGL.

The front door is the **Pitch Index**: a searchable directory of every accepted pitch by family, plus the lost pitches of the Negro Leagues. A filed pitch opens its full specimen; an unfiled pitch opens a basic file with its sourced one-liners and a plain-language read; nothing fabricates geometry or physics for a pitch the atlas has not measured. Every pitch and topic also carries a **discussion** layer (Supabase-backed, opt-in, anonymous sign-in, native photo/video uploads behind a safety floor — see below). What stays excluded on purpose: any runtime API call for pitch data, and any *fabricated* community content — no fake posts, no fake adoption counts, no fake verified-pro badges. Every figure was sourced by parallel research and put through an independent verification pass before it was allowed onto a page; the corrections that pass forced are noted in the data files.

## Provenance and rights policy

- **No MLB, team, or player photos, logos, footage, or likenesses.** The atlas uses original 3D geometry, original diagrams, and outbound source links only. A master-variant visual is our own seam schematic, never a player image.
- **No copied instructional prose.** Grip and mechanics text is paraphrased in our own words and cited with a link.
- **Every real-player number carries a `Source`** (`id`, `label`, `url`, `retrievedAt`, optional `season`) and a `confidence` label. Anything that cannot be verified renders as `approximate` or `unverified`. Nothing ships bare.
- **No runtime API dependencies.** All data is static and sourced in the repo. There are no runtime calls to Statcast, Baseball Savant, Rapsodo, TrackMan, MLB, or any external source.

## Seam accuracy is auditable

The seam geometry, equation, constants, coordinate system, and stitch-count assumption are documented in [`docs/seam-calibration.md`](docs/seam-calibration.md), including what is exact and what is schematic. The public copy states the honest level of precision. If a permitted reference cannot pin the geometry, the copy says "seam-informed schematic" rather than claiming measured precision.

## Youth and safety

The discussion layer is live, with the safeguards it always promised: a standing safety note (grip and technique only — no medical, injury, workload, or youth-training prescription), source labels, anonymous sign-in, and report-driven auto-hide. Native uploads ride a safety floor — a one-time terms acceptance (own-the-rights, no copyrighted footage, no minors), magic-byte type validation, per-kind size caps, and report-driven takedown that stops serving a hidden item the instant its row flips. The full runbook and the honest list of deferred limitations (no automated content scanning, no bot protection yet) live in [`docs/community-media-moderation.md`](docs/community-media-moderation.md). Pitch Atlas itself makes no medical, injury-prevention, or age-appropriate-prescription claims.

## Stack

- **Build:** Vite + React + TypeScript + Tailwind CSS v4 (CSS-first, no `tailwind.config.js`).
- **3D:** Three.js with React Three Fiber and drei, classic WebGLRenderer. The 3D ball is original parametric geometry, not a downloaded model.
- **Fonts (self-hosted, no runtime external request):** Newsreader for editorial display, Hanken Grotesk for prose, Martian Mono for data, gauges, source badges, and on-ball annotations.
- **Deploy:** Cloudflare Pages (static), live at [pitch-atlas.com](https://pitch-atlas.com).
- **Routing:** the selected specimen lives in the URL hash (`#/<slug>`), so each pitch is deep-linkable with no router dependency and no server rewrite.
- **Community backend:** Supabase (anonymous sign-in + Postgres with row-level security + Storage for uploads). The publishable key ships in the bundle by design; RLS is the boundary. Per-topic discussion with one-level replies and native media, governed by the safety floor in `docs/community-media-moderation.md`.

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

No fake community posts. No fake adoption counts. No fake verified-pro badges. No hardcoded freshness strings. No MLB, team, or player photos, logos, footage, or likenesses. No copied instructional prose. No unsourced grip claims. No runtime API dependency for pitch data. No fabricated geometry or physics for a pitch the atlas has not measured. Community content is real, contributor-supplied, source-labeled, and moderated — never seeded with fakes. Unsourced becomes `unverified` or `approximate`.

## License

Source content paraphrased and cited. Original geometry, diagrams, and code are this project's own. See source links in the colophon for every figure.
