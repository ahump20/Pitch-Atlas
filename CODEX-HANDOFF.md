# Codex handoff — Pitch Atlas: `/v2` Refractor Case + Design-System sync

From: Claude (head coach). To: Codex (second angle). Two bodies of work to cold-read.
Disagree where you see it — Austin breaks ties.

---

## 1. The `/v2` "Refractor Case" landing prototype  ← the main review target

**Branch:** `redesign/v2-refractor-case` (tip `436bf08`). `/` (production home) is
untouched; `/v2` is `noindex` + sitemap-excluded; `main` does not auto-deploy, so the
live site is safe.

**What it is:** a bolder re-imagining of the pitch-atlas.com landing — a vintage-chrome
material language over matte Topps-Now card surfaces, an original-geometry 3D ball that
dissolves into a 2D seam schematic, packed micro-motion. The locked brand-voice change:
**"Pitchers Progressing Pitches"** is now the hero line; **"Sourced, not corrected"** was
*relocated* (not deleted) to the trust surfaces (provenance strip + the close) and stays
byte-identical in the data model / README / NORTHSTAR.

**Checkout:**
```sh
git checkout redesign/v2-refractor-case
npm ci && npm run build && npm run preview   # /v2 returns 200
# open http://localhost:4173/v2
```

**Cold-read these specifically:**
- **Motion honesty.** All reveals are double-gated (`@supports animation-timeline` +
  `prefers-reduced-motion: no-preference`) and carry NO base `opacity:0` — so
  reduced-motion / no-support / prerender default to fully visible. Verify a section
  never ships blank. Confirm `prefers-reduced-transparency` fallbacks on the glass/blur.
- **WebGL budget.** Two live GPU surfaces, both hard-gated: one R3F canvas (the grip-lab
  ball, `TheRead` → `BallStage` → `BallScene`) and one raw-WebGL foil shader (`FoilLayer`
  on the hero card, not R3F). For the featured four-seam the hero face is its grip clip (a
  muted video), not a ball. The chrome wall stays SVG; no third context. (Corrected from an
  earlier "two R3F canvases" miscount.)
- **The shared-material edit.** `Ball.tsx` + `Studio.tsx` got a 20-line realism pass
  (sharper seam/stitch clearcoat, a faint waxed-thread emissive, a lower/warmer key light).
  The live home `/` does NOT render this 3D ball; it uses an SVG ball (`RefractorBall`), so
  `/` is genuinely untouched. The shared 3D ball renders on `/pitch/*` and `/grips`, which
  DO take the new look; the change is material/lighting only (no prop/API/structural
  change), non-regressive. Worth eyeballing the ball at small scale on those two pages.
- **No fabricated numbers.** `canonical.physics` carries qualitative shape + render-only
  spin-axis vectors, never spin-rate/velocity/break. The grip-lab "shape" read should be
  words + a dashed axis, nothing measured.
- **Anti-slop.** No gradient text, no >1px side-stripe borders, chrome lives in materials
  never in letters. Flag any tell.

**Cold-read results (run this session — 5 surfaces, every flagged violation independently re-verified):**
- Motion honesty — holds. Every v2 reveal's `opacity:0` lives inside the double gate; reduced-motion / no-support / prerender all rest fully visible. (The one base `opacity:0`, `.dissolve-schem`, is the 2D schematic overlay on top of an always-visible ball — safe by design.)
- Shared material — holds; the home `/` is genuinely untouched (SVG ball). See the corrected bullet above.
- Anti-fabrication — holds. Every rendered field traces to qualitative shape prose; the spin axis is a render-only dashed line; the only numerals are card serials and directory counts.
- WebGL budget — intent holds (two gated GL contexts, chrome wall SVG, no third); the count wording was corrected above.
- Anti-slop — clean on the design tells. No gradient text on `/v2` (the only clipped-text is v1 `.rfx-holo` on `/repertoire`); no `/v2` side-stripe borders (the 3px `.rfx-plate` edge is v1, on the knowledge/craftsmen/lost-pitch pages); chrome stays in materials, not letterforms. I recast one `/v2` caption em-dash (`TheRead`) and squared the OG title/alt to colons for consistency with the page title — optional polish, not a defect. The em-dashes still rendered on `/v2` come from the canonical pitch teaching prose (the data, rendered site-wide including the home `/`); they are intentional voice and stay, per the project's prose rule — do NOT strip them. Separate note for the live site (not `/v2`): `/repertoire` clips foil to the word "Index", and those v1 cards carry the 3px accent border — pre-existing tells worth their own pass someday.

**Deferred (out of scope, not bugs):** RefractorBall SVG specular pip; hero→bridge hairline
border; seam-rule act-marker separator; tube radial-segment bump 14→18; an in-canvas
spotLight (I skipped it to avoid editing shared BallScene). `/design-sync` of the new v2
components was not run — they're page sections, not reusable primitives (see §2).

---

## 2. Design-System sync to claude.ai/design  ← just shipped this session

**Project:** "Pitch Atlas Design System" — https://claude.ai/design/p/aa4ea331-5881-4e4c-a982-988929d543ac
73 components imported (the 18 `src/components/ui` shadcn-style primitives, expanded),
27 with authored previews (all graded good), 46 floor cards (composed sub-parts). Render
check 73/73 clean. Tokens + Anton/Hanken/Martian/Newsreader fonts ship. Bundle is the
repo's real compiled code, not a reimplementation.

**The judgment call to cold-read:** Pitch Atlas is an SSG *app*, not a component library.
I scoped the DS to `src/components/ui` only — page sections (HeroCase, etc.) and the 3D
ball are app surfaces, not reusable cards, and a full-`src` scan fails the bundle (webp
imports). Question for you: **is ui-only the right scope, or should the provenance atoms
(ClaimCard, confidence badges) be added?** They'd carry more of the brand than generic
shadcn primitives do.

**Sync infra (durable, committed under `.design-sync/`):** `config.json`, `conventions.md`
(the design-agent header), `previews/*.tsx`, `NOTES.md` (re-sync runbook — read the
"Re-sync risks" section; the `cssEntry` hash and the `node_modules/pitch-atlas` symlink are
the two things that silently break a re-sync).

---

## Verification status
- `/v2`: typecheck + lint + build green. **Test suite is timing-flaky under heavy local
  load and did not give a clean local pass this session** — different async-sensitive tests
  fail run to run (`routes.test.tsx` once; `DiscussionPanel`/`PitchIndex` the next), one run
  stretched to ~19 min, which points at machine thrash plus a fragile design (`maxWorkers:1`,
  serial files, heavy cold 3D transforms), not a logic regression. It is pre-existing and
  main-wide: `routes.test.tsx` and `sources.ts` are byte-identical to `main`, and `/v2`
  changed only `sitemap.test.ts` (4 lines). I tried aligning `COLD_LOAD` to `testTimeout`;
  it didn't hold (failures just moved files), so I reverted it. **Recommendation: confirm the
  suite on a clean machine / CI, and treat the timing-fragility as its own `fix(test)` task.**
  This supersedes the earlier, too-optimistic "546 green at 436bf08" note.
- Sync: 73/73 render clean; repo `typecheck` + `lint` green after adding `.design-sync` /
  `.ds-sync` / `ds-bundle` to eslint ignores.

If you take a swing, branch `codex/` and tag `@claude-review`.
