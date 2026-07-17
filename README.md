# Pitch Atlas

Austin Humphrey's living archive of pitching craft: how pitchers hold, describe, preserve, and carry forward the art.

The knowledge of how a pitch works is scattered and easy to lose. The best footage has no structure. A grip reference is often a flat photo, a PDF, a clip, or a coach's memory. Pitch Atlas is the layer underneath that footage: a structured archive where each pitch carries an original interactive specimen and every claim wears the label of where it came from.

## Mission

Pitch Atlas exists to preserve and progress the art of the pitch.

It canonizes, catalogs, and contextualizes the craft knowledge of baseball: the grips, variants, feel cues, forgotten experiments, master examples, and field notes that too often disappear when a player ages out, a coach retires, or a pitch falls out of fashion.

Every pitch is treated as a specimen with history. Every grip is preserved as evidence. Every upload can become part of a living archive.

The goal is not nostalgia. It is continuity.

Pitch Atlas keeps the art from vanishing quietly into memory, rumor, and half-told stories, then gives the next generation something to study, challenge, refine, and carry forward. Preserve the pitches baseball almost forgot. Progress the craft for the pitchers still searching.

## The model: sourced, not corrected

**Many ways can work. Nothing here is marked right or wrong. Everything is marked by where it came from and how confident the source is.**

A four-seam fastball can be thrown a dozen credible ways. Pitch Atlas does not adjudicate which grip is correct. It records what is known, attributes it, and labels the confidence of each claim. Sourced biography facts stay when they are real. Pitch behavior is written as shape language unless the pitch was actually measured by this atlas. The reader judges. The atlas only sources.

This principle governs the README, the UI copy, and the data model in equal measure.

## What the atlas is

A navigable index of pitch specimens. Filed specimens are generated from
`src/data/pitches`, and each one gets a deep-linkable route at `/pitch/<slug>`.
The current set is source data, not a hand-counted doc promise; add a pitch to
`PITCHES` and the prerender list follows.

Every specimen proves the same two things:

1. **The signature medium.** An original-geometry interactive 3D ball that teaches the pitch. A pitch is defined by its authored spin-axis direction and rendered as qualitative shape: ride, drop, arm-side run, glove-side sweep, fade, or tumble. The hero dissolves on scroll into a 2D schematic of the same seam-point function. The diagrams show direction and character, not fabricated pitch-behavior figures.
2. **The provenance model.** Every visible claim carries a source and a confidence label. Nothing is faked, and pitch-behavior gauges are not invented for untracked grips. The page is fully usable with zero WebGL.

The front door is the **Pitch Index**: a searchable directory of every accepted pitch by family, plus the lost pitches of the Negro Leagues. A filed pitch opens its full specimen; an unfiled pitch opens a basic file with its sourced one-liners and a plain-language read; nothing fabricates geometry or physics for a pitch the atlas has not measured. Every pitch and topic also carries a **discussion** layer (Supabase-backed, opt-in, anonymous sign-in, native photo/video uploads behind a safety floor — see below). What stays excluded on purpose: any runtime API call for pitch data, and any *fabricated* community content — no fake posts, no fake adoption counts, no fake verified-pro badges. Every claim was sourced by parallel research and put through an independent verification pass before it was allowed onto a page; the corrections that pass forced are noted in the data files.

## Provenance and rights policy

- **Real grip photos ship only from clean sources.** First-party photography and geometry, community own-grip uploads (through the own-the-rights gate), verified Creative Commons and public-domain photos with attribution, and properly licensed images. What never ships: unlicensed agency or photographer photos of identifiable players, team or league logos and marks, and broadcast footage. The grip is the lesson, not the celebrity; the full policy lives in [`docs/NORTHSTAR.md`](docs/NORTHSTAR.md).
- **No copied instructional prose.** Grip and mechanics text is paraphrased in our own words and cited with a link.
- **Every real figure that survives carries a `Source`** (`id`, `label`, `url`, `retrievedAt`, optional `season`) and a `confidence` label. Biography facts, dates, title counts, and cited historical records can ship. Pitch behavior is written as shape language unless this atlas measures it itself.
- **No runtime API dependencies.** All data is static and sourced in the repo. There are no runtime calls to Statcast, Baseball Savant, Rapsodo, TrackMan, MLB, or any external source.

## Seam accuracy is auditable

The seam geometry, equation, constants, coordinate system, and stitch-count assumption are documented in [`docs/seam-calibration.md`](docs/seam-calibration.md), including what is exact and what is schematic. The public copy states the honest level of precision. If a permitted reference cannot pin the geometry, the copy says "seam-informed schematic" rather than claiming measured precision.

## Safety boundary

Pitch Atlas does not publish medical, injury, pain, rehabilitation, recovery, workload, durability, health-outcome, or youth-training claims. A citation or disclaimer does not create an exception. The route-stable `/learn/arm-health` and `/learn/youth` pages are claim-free scope boundaries; the product itself stays with grips, qualitative pitch shape, provenance, history, and firsthand craft.

The discussion layer keeps its safety floor: a standing note that posts are shared experience and technique, not personal medical advice; source labels; anonymous sign-in; and report-driven auto-hide. Native uploads ride a one-time terms acceptance (own-the-rights, no copyrighted footage, no minors), magic-byte type validation, per-kind size caps, and report-driven takedown. Hiding a media row stops new URL signing immediately; a URL signed before the hide can remain valid until its one-hour expiry. The full runbook and the honest list of deferred limitations (no automated content scanning, no bot protection yet) live in [`docs/community-media-moderation.md`](docs/community-media-moderation.md).

Structured Field Notes enter a private review state on submission. Only approved notes appear in the public ranked drawer; contributors see an explicit review receipt instead of a false claim that the note is already live.

## Stack

- **Build:** Vite + React + TypeScript + Tailwind CSS v4 (CSS-first, no `tailwind.config.js`).
- **3D:** Three.js with React Three Fiber and drei, classic WebGLRenderer. The 3D ball is original parametric geometry, not a downloaded model.
- **Fonts (self-hosted, no runtime external request):** Newsreader for editorial display, Hanken Grotesk for prose, Martian Mono for data, gauges, source badges, and on-ball annotations.
- **Deploy:** Cloudflare Pages (static), live at [pitch-atlas.com](https://pitch-atlas.com).
- **Routing:** React Router plus vite-plugin-react-ssg prerenders real path routes (`/pitch/<slug>`, `/repertoire/<id>`, `/craftsmen/<slug>`, and the other data-derived pages).
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

No fake community posts. No fake adoption counts. No fake verified-pro badges. No hardcoded freshness strings. No unlicensed agency photos of identifiable players, team/league logos, or broadcast footage (real grip photos from clean sources are welcome). No copied instructional prose. No medical, injury, workload, durability, health-outcome, or youth-training claims. No unsourced grip claims. No runtime API dependency for pitch data. No fabricated geometry or physics for a pitch the atlas has not measured. Community content is real, contributor-supplied, source-labeled, and moderated, never seeded with fakes. Unsourced becomes `unverified` or `approximate`.

## License

Source content paraphrased and cited. Original geometry, diagrams, and code are this project's own. See source links in the colophon for every figure.
