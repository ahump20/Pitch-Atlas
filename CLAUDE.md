# Claude Code instructions for Pitch Atlas

Work in `ahump20/Pitch-Atlas`. Do not create a new repository.

## Source of truth

Core principle:

> Sourced, not corrected. Many ways can work. Claims are labeled by provenance.

The README, the UI copy, and the data model all preserve that principle. They
are already wired to it in the committed code (`README.md`, `src/data/types.ts`,
`src/data/sources.ts`, `src/data/pitches/four-seam.ts`). Keep them in lockstep:
a change to one of these without the others is a regression.

## What this repo is

Pitch Atlas is a grip-first atlas with a searchable **Pitch Index** front door.
Seven sourced specimens (four-seam, two-seam, circle change, 12-6 curve, slider,
splitter, splinker) each get a deep multi-page route (`/pitch/<slug>`, real
prerendered HTML via react-router + vite-plugin-react-ssg); the page leads with the
grip a human can hold, then tucks the physics behind a disclosure. Production home:
**pitch-atlas.com**. It proves two things:

- the signature medium: an original-geometry interactive 3D ball — warm aged
  leather, pressed fingertip pads on the seam — that dissolves on scroll into a
  2D schematic of the same seam-point function; fully usable with zero WebGL.
- the provenance model: every visible number carries a `Source` and a
  `confidence` label; nothing is faked.

The front door is the **Pitch Index** (`/repertoire`): a searchable directory of
every accepted pitch by family plus the lost-pitches wing, routing a filed pitch to
its full specimen and an unfiled pitch to a basic file (sourced one-liners + a
plain-language lede + an honest "fuller breakdown coming" marker). Seven filed
specimens carry the deep 3D treatment.

Community is now LIVE (the earlier "not in v1" exclusion is superseded, 2026-06-06):
every pitch and topic carries a **discussion** layer — Supabase-backed, anonymous
sign-in, one-level replies, and native photo/video uploads behind a mandatory
safety floor (own-the-rights terms gate, magic-byte type validation, per-kind size
caps, banned-term filter, per-account rate limits, report-driven auto-hide that
stops serving a hidden item the instant its row flips). The runbook + the honest
list of deferred limits live in `docs/community-media-moderation.md`. Tables:
`discussion_posts` / `discussion_media` / `discussion_reports` (migration
`supabase/migrations/20260606090000_discussion_forum.sql`); the structured
`field_notes` grip-tweak engine stays alongside it, dormant.

Still excluded on purpose (these have NOT changed):

- fake community posts, fake adoption counts, fake verified-pro badges (community
  content is real, contributor-supplied, and source-labeled — never seeded)
- runtime external API calls for pitch data
- fabricated numbers, geometry, or physics for a not-yet-measured pitch (roadmap
  and basic cards stay honest; the basic page renders a schematic ball, not a fake
  movement plot)
- copied instructional prose; MLB/team/player photos, logos, footage, likenesses

The data model names the full shape (canonical record, master variants, community,
reproduction logs). It populates seven canonical records + their sourced master
variants, an optional plain-language `GripGuide` per filed pitch and an optional
`plain` lede per repertoire entry (no measured numbers — those stay in
`canonical.physics`/the Claims), and the live discussion layer. Extend that shape;
do not gut it.

## Repository discipline

Inspect the current repo before changing anything. The app already exists — Vite
+ React 19 + TypeScript + Tailwind v4 (`@tailwindcss/vite`, CSS-first, no
`tailwind.config.js`). Preserve it. Do not scaffold a second app shell, do not
scaffold into a nested folder, and replace files intentionally rather than
stacking duplicates.

Node is pinned to 24 in `.nvmrc` (use it for `.node-version`, GitHub Actions,
and Cloudflare Pages). `package.json` `engines.node` is a looser floor
(`>=20.19`); the build target is Node 24.

## Data and source rules

All v1 pitch content is static. There are no runtime calls to Statcast,
Baseball Savant, Rapsodo, TrackMan, MLB, or any external source. The data lives
in:

- `src/data/types.ts` — the provenance model (`Claim`, `Source`,
  `ClaimConfidence`, the pitch records)
- `src/data/sources.ts` — the citation registry plus the `claim`, `secondhand`,
  `unverified`, `latestRetrievedAt`, and `allSources` helpers
- `src/data/pitches/*.ts` — the five pitch records (`index.ts` exports `PITCHES`)

Every `Source` record carries `id`, `label`, `url`, `retrievedAt`, and optional
`season`. `retrievedAt` is a real ISO date and is the only thing the colophon's
“as of” line is allowed to compute from (`latestRetrievedAt`). Never hardcode a
freshness string.

Every claim carries a `confidence` from this exact union (see `types.ts`):
`official-data`, `pitcher-own-words`, `coach-observed`, `reputable-analysis`,
`secondhand-attributed`, `community-firsthand`, `unverified`. A claim that no
source corroborates is `unverified` and must carry a note. A claim relayed
through a secondary source is `secondhand-attributed` and must carry a note.
`approximate` is a separate boolean flag on an otherwise sourced claim — a real
figure that is rounded, era-dependent, or methodology-bound — not a confidence
level. A bad source id throws at build via `src()`, so a broken citation can
never ship.

## Rights and safety

Do not use MLB, team, or player photos, logos, footage, or likenesses. Use
original geometry, original diagrams, outbound source links, and paraphrased
prose only. A master-variant visual is our own re-posed schematic tuned to a
sourced figure, never a player image.

Do not copy instructional prose from Driveline, Plate Crate, eFastball,
Wikipedia, or any source. Paraphrase and cite.

Do not make medical, injury-prevention, workload, or youth-prescription claims.

The community discussion layer is live (2026-06-06) with the safeguards it always
promised: a standing safety note (grip/technique only — no medical, injury,
workload, or youth-training prescription), source labels, anonymous sign-in, an
own-the-rights upload-terms gate, and report-driven auto-hide. Make no medical,
injury, workload, or youth-prescription claims in product copy or community
guardrails.

## Seam accuracy

The seam geometry is documented in `docs/seam-calibration.md`: the figure-eight
equation actually implemented in `src/lib/seam.ts`, the coordinate system, the
108/216 stitch caveat, what is exact versus schematic, and the two steps that
would earn “seam-accurate” later. The public copy says **seam-informed
schematic**, never **seam-accurate**, because the regulation cover constants
were not pinned during research. Do not change that label without doing the work
in the calibration doc and verifying it on the render first. One function
(`seamPoint`) feeds the 3D tube, the 2D schematic (`src/lib/seam2d.ts`), and the
no-WebGL fallback, so the model and the diagram can never disagree — keep it
that way.

## Verification

Before handoff, run and confirm green:

```bash
npm run typecheck
npm run lint
npm run test
npm run build
npm run preview
```

(`npm run test` runs `vitest run`; `npm run build` typechecks then builds to
`dist/`.) If any command fails, fix it or document the exact blocker.

Final handoff must include: files changed; commands run and results; deployed or
local preview URL; known limitations; and confirmation that the README, UI copy,
and data model all still hold the sourced-not-corrected principle.
