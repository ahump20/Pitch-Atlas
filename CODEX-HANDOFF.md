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
- **WebGL budget.** Exactly two live R3F canvases (hero specimen card + grip-lab ball);
  the chrome wall stays SVG. Confirm no third canvas crept in.
- **The shared-material edit.** `Ball.tsx` + `Studio.tsx` got a realism pass that ALSO
  affects the live `/` grip viewer (shared components). I verified it non-regressive on
  `/`; please re-verify — that's the one place `/v2` work touches production surfaces.
- **No fabricated numbers.** `canonical.physics` carries qualitative shape + render-only
  spin-axis vectors, never spin-rate/velocity/break. The grip-lab "shape" read should be
  words + a dashed axis, nothing measured.
- **Anti-slop.** No gradient text, no >1px side-stripe borders, chrome lives in materials
  never in letters. Flag any tell.

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
- `/v2`: typecheck / lint / 546 tests / build all green at `436bf08`; clean screenshots delivered.
- Sync: 73/73 render clean; repo `typecheck` + `lint` green after adding `.design-sync` /
  `.ds-sync` / `ds-bundle` to eslint ignores.

If you take a swing, branch `codex/` and tag `@claude-review`.
