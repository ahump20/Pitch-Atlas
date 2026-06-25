# Pitch Atlas: Northstar & Evolution Charter

Owner: Austin Humphrey
Started: 2026-06-06 (the web app was ~48 hours old)
Status: living document. This is the one that outlasts the code.

---

## What this document is

Code changes weekly. Frameworks get replaced. A surface that feels right today
gets rebuilt next quarter. This document is the part that doesn't move that fast,
and the rules for moving the part that should.

It has two tiers, and the whole point is to keep them separate:

- **The Core.** The handful of commitments that *are* Pitch Atlas. Break one and
  you've built a different product wearing the same name. These change rarely, and
  only on purpose, with a logged reason.
- **The Surface.** Everything else: which surfaces it ships on, what it's built
  with, which pitches are filed, how the rights policy reads, what the community
  can do. This is supposed to change. It's where the product gets better.

If you ever feel stuck, the question isn't "can I change this." It's "is this Core
or Surface." Surface is yours to move this afternoon. Core gets a Decision Log
entry and a night to sleep on it.

A note on the other docs so this one stays in its lane:

- This file holds the *why* and the *what must not drift*.
- `README.md` is the public-facing statement of the same thing, for visitors.
- The root `CLAUDE.md` and `AGENTS.md` files are the operating contract for anyone
  (human or agent) changing the repo.
- `docs/field-manual-elevation-plan.md` is a dated execution snapshot, not a
  constitution. Plans expire. This doesn't.
- The runbooks (`seam-calibration.md`, `community-media-moderation.md`,
  `custom-domain.md`) are how specific machinery works.

When this file and any of those disagree, this file wins on principle and they get
updated to match. A change to the Core here that doesn't reach README, CLAUDE.md,
and the data model is a half-finished change.

---

## The Northstar

One line:

> Pitch Atlas exists to preserve and progress the art of the pitch.

The moral spine: preserve and progress the art before baseball's craft knowledge
disappears into memory, rumor, and half-told stories.

Pitch Atlas canonizes, catalogs, and contextualizes the craft knowledge of baseball:
the grips, variants, feel cues, forgotten experiments, master examples, and field
notes that too often disappear when a player ages out, a coach retires, or a pitch
falls out of fashion. Every pitch is treated as a specimen with history. Every grip
is preserved as evidence. Every upload can become part of a living archive.

The goal is not nostalgia. It is continuity. Pitch Atlas keeps the art from
vanishing quietly into the dim light, then gives the next generation something to
study, challenge, refine, and carry forward.

The win condition isn't traffic. It's the pitcher who opens it in the bullpen,
checks a grip, tries the tweak, comes back, and writes down what happened. Verified
masters set the floor. Community field notes create the reason to return.

---

## The Core (change these and it stops being Pitch Atlas)

**1. Sourced, not corrected.**
Many grips work. The atlas does not pick a winner. It records what's known,
attributes it, and labels how confident the source is, then lets the reader judge.
Official tracking context and a beat writer's quote can both support a claim, but
they must never wear the same badge. Sourced biography facts stay when they are
real; pitch behavior is described as shape unless this atlas has measured it. This
principle governs the README, the UI copy, and the data model in equal measure. It
is the whole personality of the product.

**2. Grip-first.**
The thing a human can physically hold leads. Finger placement, seam orientation, the
one feel cue. The physics is real and it matters, but it tucks behind a disclosure
and supports the grip. Lead with the hand, not the Magnus equation.

**3. Real, never faked.**
No fake community posts. No fake adoption counts. No fake verified-pro badges. No
hardcoded freshness ("updated today" only if it actually was). Community content is
contributor-supplied, source-labeled, and moderated, never seeded with invented
activity. An empty state that says "no field notes yet" is honest and fine. A
populated state full of fabricated ones is the one thing that kills the trust the
whole product runs on.

**4. The safety floor.**
This teaches grip and technique. It does not practice medicine. No diagnosis, no
injury triage, no rehab prescription, no "this grip is safe." No youth workload or
"throw this at this age" calls beyond citing published Pitch Smart guidance. Pain
questions go to a qualified professional. This is non-negotiable in product copy,
in community guardrails, and in everything the plugin generates.

**5. Provenance on every claim and real figure.**
Every real figure that survives carries a `Source` (id, label, url, retrievedAt,
optional season) and a `confidence` from the model's vocabulary. Biography facts,
dates, title counts, and cited historical records can ship. Pitch behavior is
shape language unless this atlas measures it itself. Anything that can't be
verified renders as `unverified` or `approximate`, with a note. Nothing ships bare.
A broken citation throws at build, so a dead source can't reach a visitor.
Freshness comes from real `retrievedAt` metadata, never a typed-in string.

**6. Usable with zero WebGL.**
The signature 3D ball is the hook, not the gate. The page works fully without it:
the same seam-point function feeds the 3D tube, the 2D schematic, and the no-WebGL
fallback, so the model and the diagram can never disagree. Accessibility isn't a
feature here. It's a floor.

**7. Four states or it isn't done.**
Every data surface handles loading, error, empty, and populated. "Done" means a
real visitor sees correct output at a real URL. A green build and a 200 response are
not done. The rendered page is the proof.

---

## The Surface (built to move)

These are expected to evolve. Change them when you have a reason, note the
load-bearing ones in the Decision Log, and keep the Core intact while you do.

- **Surfaces.** Web today. iOS ("My Bullpen") next (see `docs/ios-app-plan.md`).
  More later if they earn it. The Core travels with every surface; the layout,
  navigation, and interaction model are free to differ per platform.
- **Tech stack.** Vite + React 19 + TypeScript + Tailwind v4 + Three.js today,
  pinned to Node 24. None of that is sacred. The sourced-not-corrected data model is;
  the renderer under it isn't. Swap tools when a swap pays for itself.
- **Scope.** Filed specimens from `src/data/pitches`, the Craftsmen wing, the Lost
  Pitches wing, the Pitch Index front door, the live discussion layer, and the
  shape-focused tool routes. Which pitches get the deep treatment, which wings
  exist, how deep each goes: all movable. The honesty about the edges (an alias,
  an illusion, a not-a-pitch, a legend) stays.
- **The rights & visual policy.** See the next section. This one changed on day one
  and will keep getting sharper as the licensing picture changes.
- **Community.** The discussion layer is live with its safety floor. What it can do
  (replies, media, field notes, ranking, the structured grip-tweak engine) grows
  over time inside the safety floor, never past it.
- **The plugin and skills.** `claude-plugin/pitch-atlas/` (the `pitching-coach`
  skill, the commands, the `pitch-analyst` agent) is the working brain behind the
  product. It's meant to grow new capability. It inherits this Core like everything
  else: the safety floor and the confidence tags are not optional in generated
  output.

---

## The rights & visual policy (refined 2026-06-06)

The old rule was a blanket "no photos at all." That was too strict, and it's now
loosened on purpose. Here's the precise version, written around one goal: real,
accurate visual references that can't get the project sued.

The thing that sues you over a photo of a named pitcher gripping a ball is not the
player and it is not trademark. It's the **photo agency** (Getty, AP, MLB Photos)
that owns the copyright on the shot, plus the player's **right of publicity** when
their image is used to populate or promote a commercial product. Agencies run
automated enforcement and bill unlicensed use of exactly the kind of "basic"
photo that looks harmless. So the line isn't about taste. It's about which images
carry a bill.

**Ships in the product:**

- **First-party photography and geometry.** Our own grip photos, our own diagrams,
  the parametric 3D ball. We own these outright. Most accurate of all, because we
  control the framing. `rights: original`.
- **Community own-grip uploads.** A real pitcher's real hand on a real ball, through
  the existing own-the-rights upload gate (no copyrighted footage, no minors,
  magic-byte validation, report-driven takedown). `rights: original`,
  `confidence: community-firsthand`.
- **Creative Commons and public-domain photos**, with the license verified and the
  attribution carried. `rights: public-domain` or `rights: licensed` with the
  attribution recorded.
- **Properly licensed photos** (a paid license, or an official embed where the terms
  allow it) when a license actually exists. `rights: licensed`.

**Does not ship:**

- Scraped agency or photographer images of identifiable players, with no license.
  This is the lawsuit lane. These can live as **private, gitignored research**
  (the `Pitcher Analysis Assets` habit), informing an original render or diagram,
  never reaching a visitor.
- Team or league logos and marks. MLB broadcast footage. Anything that implies a
  player or league endorses the product.

**The doctrine that makes this easy:** the grip is the lesson, the celebrity is
decoration. A correct curveball grip teaches the curveball whether it's Adam
Wainwright's hand or a clean Creative Commons photo of any hand in the same grip.
We don't need the specific famous frame. We need the correct grip, sourced and
labeled. If an iconic licensed shot becomes available later, the data model already
has a slot for it (`RightsStatus` carries `licensed` and `public-domain`); it drops
in without rearchitecting anything.

This policy is Surface. It will get sharper as licensing options change. The Core it
serves (sourced, real, never faked) does not move.

---

## The product shape today (snapshot, 2026-06-09)

So a future reader knows the starting line:

- **Front door:** the Pitch Index (`/repertoire`), a searchable directory of every
  accepted pitch by family plus the Lost Pitches wing. A filed pitch opens its full
  specimen; an unfiled pitch opens an honest basic file.
- **Filed specimens** with the deep treatment live at `/pitch/<slug>` and are
  generated from `src/data/pitches`. Each leads with the holdable grip, then the
  interactive 3D ball, then the physics behind a disclosure.
- **Craftsmen wing:** a curated hall of arms who defined a pitch (Wainwright's curve
  is filed), plus the gyroball as a flagged legend. No likenesses; the visual is the
  seam specimen of their signature pitch.
- **Lost Pitches wing:** the Negro Leagues and dead-ball deep dive, every entry
  wearing a documentation tier instead of faking a precision the record can't
  support.
- **Tool routes:** Shape Map, Shape Lab, and Compare teach direction, grip, and
  deception in words. The old classification and kinetic-chain analytics routes
  redirect to craft-first pages.
- **Discussion layer:** live, Supabase-backed, anonymous sign-in, one-level replies,
  native photo/video uploads behind the safety floor.
- **The plugin:** `pitch-atlas` with the `pitching-coach` skill, six commands
  (grip, design, arsenal, translate, field-note, breakdown), the `pitch-analyst`
  agent, and handoffs to `gibby` and `video-visual-intelligence-v2`.

---

## Where it's heading (directions, not a contract)

Horizon, in rough priority. None of this is a promise; it's the current read.

- **My Bullpen (iOS).** Get it in pitchers' hands where they actually pitch. Phased
  so a 48-hour-old web app doesn't get split across two codebases too early. The
  plan is `docs/ios-app-plan.md`.
- **The visual grip library.** Stand up the clean-channel photo layer so a grip
  carries a real reference image, not just geometry. Community uploads first; CC and
  first-party shots alongside.
- **Deeper atlas.** More filed specimens, more craftsmen, the long tail of the
  encyclopedia promoted from one-liners to full files as the sourcing clears the bar.
- **The return habit.** The structured field-note / grip-tweak engine that turns
  "I moved my thumb and it did this" into a reproducible, ranked, sourced entry.

The execution detail for any of these lives in its own dated plan. This file just
keeps them pointed at the Northstar.

---

## How this document evolves

This is the mechanism that lets the product change without losing itself.

- **Surface changes** don't need a ritual. Build them. If one is load-bearing
  (a stack swap, a scope cut, a policy shift), drop a line in the Decision Log so
  the next person knows why.
- **Core changes** are rare and deliberate. Before changing a Core item: write the
  Decision Log entry first, state what breaks, name what you're trading for what,
  and confirm README + CLAUDE.md + the data model move with it. If you can't write a
  clean reason, it isn't ready.
- **Review cadence.** Read this top to bottom when a major surface ships (the iOS
  app, the visual library, a backend cutover). If reality has drifted from the page,
  fix the page.

---

## Decision Log (append-only)

Newest first. Each entry: what was decided, why, what it touches, which Core
principle it respects.

### 2026-06-25: Deepen the specimen artifact (grade kept, grip on the card, family shelves, gold grail)

**Decision.** The collectible cards are pushed the last distance toward grail-grade
without adding game mechanics. The specimen grade stays as the read of how richly
each pitch is preserved (gold 1-of-1, first-party motion, first-party grip,
reference); it is provenance depth, not a reward ladder, and it replaced a chip row
that duplicated the family seal and the source badge. On top of it: the sourced
grip silhouette is surfaced on the card back itself (the same seam schematic the
no-WebGL path and the 3D ball draw, filed grips only); the chrome wall groups
specimens by family so the taxonomy reads at a glance; the gold four-seam gains
real radiance and a foil back so the 1-of-1 reads like the grail; the seam dissolve
keeps its plain-words teaching, pinned by a test. Residual utility copy (the Shape
Lab control label, the 404 eyebrow, the softball breadcrumb terminal) is brought
into the archive voice. No pitch-behavior numbers are introduced.

**Why.** After the preserve-and-progress refresh the product was roughly 85 to 90
percent living its own frame, but the gold 1/1 did not feel like the grail, the
wall did not read by family, and the sourced grip hid inside a tool instead of
riding the card. This is table-stakes polish, necessary so the artifact can carry
archival weight, not the mission move. The mission (real pitchers contributing real
grips, the art preserved and progressed together) is a separate, larger track and
stays scoped, wired to real community data, never invented numbers.

**Touches.** src/index.css; src/components/v2/{ChromeWall,RefractionBridge}.tsx and
their tests; src/components/fallback/fallback.test.tsx; src/pages/{SandboxPage,
NotFound,KnowledgeHub,SoftballPitchChapter,SoftballCraftsmanChapter}.tsx. The
specimen grade (specimen-grade.ts) is kept and pinned by a guard test.

**Respects.** Sourced, not corrected (the method stays in the data, the /sources
headline, and the four-seam body, never coined as a card or meta tagline). Real,
never faked (no invented movement numbers, no fabricated edition counts, the
colophon "as of" stays computed). Grip-first (the hold is surfaced on the card,
schematic and sourced). Four states or it is not done (the 404 stays an honest,
named empty state).

### 2026-06-25: Preserve and progress becomes the canonical why

**Decision.** Pitch Atlas now frames its public why as preserving and progressing
the art of the pitch. It canonizes, catalogs, and contextualizes craft knowledge
without freezing the craft in boxes.
**Why.** The collectible-card language, archive finish, and discovery loop are
visual grammar. The deeper reason is continuity: keeping grips, variants, feel
cues, forgotten experiments, master examples, and field notes from disappearing
into memory, rumor, and half-told stories.
**Touches.** README, this charter, home page, About, footer, sources/support/privacy
copy, SEO metadata, and route tests.
**Respects.** Sourced, not corrected. Grip-first. Real, never faked.

### 2026-06-09: Craft-over-numbers doctrine replaces pitch-behavior gauges

**Decision.** Pitch behavior is rendered as shape language, not as velocity,
spin-rate, or break-in-inches figures. Sourced biography figures still belong when
they are real. The old analytics routes are retired or reframed around craft.
**Why.** Austin's own pitches were not tracked, and treating invented precision as
structure made the product less honest and less useful. The archive needs the hand,
the seam, the release, and the claim boundary first.
**Touches.** README, agent operating docs, data model language, route framing,
cards, and the tool surfaces.
**Respects.** Sourced, not corrected. Grip-first. Real, never faked.

### 2026-06-06: iOS plan pressure-tested — Phase 0 rescoped to the service worker; reuse and 3D claims corrected

**Decision.** The phased iOS approach stands. But the committed plan was checked
against the repo and current platform facts, and three claims were corrected: (1)
add-to-home-screen installability is already shipped, so Phase 0's only real
remaining work is a safe offline service worker plus minor iOS meta polish (the
polish landed with this entry); (2) Expo reuse is "one data layer, two UIs," not
"one codebase" — the data/physics/Supabase brain ports, the entire UI is rebuilt;
(3) react-three-fiber on native is currently unstable on real devices, so the 2D
seam schematic is the native default and the 3D ball is a contingent stretch goal.
The plan now also names what it omitted: first-party measurement, the
service-worker update strategy, the offline write-conflict model, the App Store
user-block + content-screening gates, and a real minors/age posture.
**Why.** "Decide Phase 1 with evidence" only works if the plan states the real cost
and the real remaining work. The original prose softened the three hardest parts
and mis-scoped a mostly-finished Phase 0 as the week's work.
**Touches.** `docs/ios-app-plan.md` (Reality-check section), `public/site.webmanifest`
and `index.html` (the safe Phase 0 polish), and the roadmap above.
**Respects.** Real, never faked (no overstated readiness; measurement must be
honest first-party signal). Four states or it isn't done (a service worker can
never strand an installed pitcher on a stale build).

### 2026-06-06: Rights policy loosened from "no photos" to "no *unlicensed agency* photos"

**Decision.** Real grip photos may ship, from clean sources only (first-party
photography, community own-rights uploads, verified Creative Commons / public
domain, paid licenses). Scraped copyrighted agency/photographer images of
identifiable players still never ship; they stay private research.
**Why.** The blanket ban blocked legitimate, high-value references for no legal
reason. The actual exposure is agency copyright + right of publicity, not the
players and not trademark. This version gets the accurate references in while
keeping the one line that prevents a lawsuit.
**Touches.** This charter, `README.md`, root `CLAUDE.md`, `src/data/types.ts`
(an additive `VisualReference` type), the `pitching-coach` skill.
**Respects.** Sourced, not corrected (every image carries rights + attribution).
Real, never faked.

### 2026-06-06: iOS is phased, not a from-scratch native build now

**Decision.** Ship an installable PWA first (home-screen, offline, the login and
lock-in feel) at near-zero cost; build the App Store app with Expo / React Native
once the core loop proves out, reusing the existing React/TS code and `src/data`;
reserve native Swift for later, only if polish demands it.
**Why.** The web app was ~48 hours old. A separate Apple-only codebase that early
splits a solo effort before the loop is proven. PWA captures most of the benefit
immediately; Expo keeps it one codebase when the time comes.
**Touches.** `docs/ios-app-plan.md`, the roadmap above.
**Respects.** The Core travels to every surface; the Surface (which platform, which
tooling) is free to move.
