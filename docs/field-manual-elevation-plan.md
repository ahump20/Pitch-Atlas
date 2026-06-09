# Pitch Atlas — Field Manual Elevation Plan

Date: 2026-06-05. Owner: Austin Humphrey. Status: in execution.

## The spine

Turn Pitch Atlas from a static pitch explainer into a **living field manual** where
**verified masters establish the baseline** and **community field notes create the return habit.**

North star: Baseball Savant for grip craft, Baseball Reference for pitch variants, a
field notebook for every pitcher who ever thought "what if I move my thumb here?"

## What exists (ground truth, 2026-06-05)

- Live site = the committed "Grip Theater" build (photoreal procedural ball, Leather Skin
  tokens, provenance model, 5 pitches).
- The working tree holds an **uncommitted grip-craft WIP**: AtlasHero, PitchFamilyRail,
  GripLab, ReleaseRoom, MovementTranslation, EvidenceLedger. It **buried Masters and dropped
  Community** — the opposite of this brief. Keep its craft; rebuild the architecture.
- Attributions are clean (Devin Williams Airbender on the change; Cole/Strider/Greene on
  the four-seam; Kershaw/Morton on the 12-6). No "Lindor", no "Maddox".
- Real bug: the config, `<title>`, and OG tags say "Baseball Atlas". Brand is **Pitch Atlas**.

## The four layers (the product, not just an explainer)

| Layer | Purpose | Treatment |
|---|---|---|
| Foundation | Textbook grip, mechanics, physics | Clean, canonical, diagram-heavy |
| Masters | Verified greats, named examples | Premium archive cards, source-stamped |
| Field Notes | Community variants | Structured cards, ranked by evidence |
| Community Notes | Corrections, nuance | Margin annotations, controlled |

Ranking is never "truth". It is **provenance + adoption + usefulness + context match +
community confidence**. A funny comment never outranks a useful grip variant.

## Brand system (assets -> jobs)

- Retired: horizontal banner, navy/red parchment frame, and leather notebook concepts.
  The active visual system is dark refractor-first; do not revive those parchment-era
  concepts without replacing them in the current design-language contract.
- Circular seam-"A" compass -> Atlas seal: favicon, loading mark, provenance stamp, empty state
- Colored finger-pad ball -> "Find your grip" interactive grip anatomy
- Pitcher-seal wordmark -> primary horizontal logo (footer / wide)
- Navy square ball icon -> iOS / apple-touch / PWA / favicon
- Moody workbench -> Field Notes full-width atmosphere
- Plate wordmark variation -> alternate wide lockup

## Palette (one coherent archive system)

Navy `#06233A` (archive/brand structural ink), stitch-red `#A92A22` (the one action accent),
parchment `#F4E8CF`, parchment-deep `#D8BE8A`, charcoal `#12100C`, leather `#5A331F`.
Existing black/cream = product interface layer. Navy/red/parchment = brand + archive layer.
Red is for seams, active states, CTAs, source emphasis only. Navy is a neutral, not a second accent.

## Type

Display/editorial: Newsreader (serif, sparingly). UI/body: Hanken Grotesk. Data/source labels:
Martian Mono. The distressed logo lettering is a mark, never the type system; navbar uses a
clean SVG lockup.

## Honesty contract (unchanged, load-bearing)

No fake community posts. No fake adoption counts. No fake verified-pro badges. No hardcoded
freshness. No MLB/team/player photos or likenesses. No copied instructional prose. No unsourced
grip claims. Community variants launch with age-aware visibility and coach/parent safeguards;
until the backend + moderation are real, "Add a Field Note" is waitlist-gated, not live posting.

## Build order

1. Navy archive palette over Leather Skin.
2. Pitch Atlas identity fix (config, index.html, masthead, OG).
3. Brand assets -> public/ (webp) + favicon/apple-touch/PWA + clean wordmark + seal SVGs.
4. Nav -> Atlas / Grips / Masters / Field Notes / Sources.
5. Hero elevation (living field manual framing, keep the 3D ball).
6. Foundation / Masters / Field Notes motif.
7. Pitch catalog as specimen files.
8. Masters archive restored as the trust hook.
9. Field Notes section: structured, honest, gated.
10. Verify (browser desktop+mobile) -> build -> deploy via local wrangler -> visitor-verify live.

## Parallel specialist streams (background)

- feature-dev:code-architect -> Field Notes system architecture (data model, submission flow,
  ranking, future D1+KV+Supabase+Worker backend contract, moderation + youth-safety gates).
- research+verify -> Wainwright/Maddux master sourcing to the provenance bar.
- savant-viz-architect -> Master Files archive card + movement-comparison viz spec.
- biomechanics-visualizer -> "Find your grip" interactive grip-anatomy overlay spec.

## Out of scope this pass

Standing up the live community backend (separate phase; posting stays gated). The iOS app
("My Bullpen"). A knuckleball master (no knuckleball pitch record exists yet).
