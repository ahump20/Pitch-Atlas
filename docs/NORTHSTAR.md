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

> Pitch Atlas preserves the heritage, history, and art of pitching—one place to
> learn from trusted minds, discover creative voices, and talk about the craft.

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

## The pillars (why a pitcher picks this over everything else)

The Core below is the builder's list: seven things that must never break. This is
the visitor's list: five reasons someone opens Pitch Atlas instead of a search bar,
a forum thread, or a movement plot. Each pillar leans on a Core principle, but says
it as a promise to the person holding the ball rather than a rule for the person
writing the code.

**1. Lead with the hand.**
You get something you can do in the next ten minutes: where the fingers go, which
way the seams face, the one feel cue that makes it click. Everywhere else opens
with spin efficiency and a movement chart. Here the physics waits behind a
disclosure until you want it. (Core: grip-first.)

**2. One roof over the whole history.**
A dead-ball experiment, a Negro Leagues pitch the record barely kept, a modern
craftsman's signature curve, a fastpitch riseball, and a field note somebody wrote
last night all sit in the same catalog with the same structure. Nothing is exiled to
a novelty wing. The forgotten stuff gets the same specimen treatment as the famous
stuff. (Core: preserve the living art.)

**3. Traceable, so you can decide for yourself.**
Every claim shows where it came from and how much weight it carries — a pitcher's
own words, a coach's observation, official tracking, or an honest "unverified."
This is not rigor as decoration. It is so you can tell the difference between
something measured and something remembered, and choose what to try. (Core:
provenance on every claim; real, never faked.)

**4. Built for the bullpen, not the desk.**
Gloves on, sun on the screen, one bar of signal, an old phone with no WebGL. The 3D
ball is the hook, never the gate — the same seam function draws the model, the flat
schematic, and the fallback, so they can't disagree. If it only works on a good
laptop, it doesn't work. (Core: usable with zero WebGL; four states or it isn't
done.)

**5. The conversation is part of the archive.**
What you tried and what happened is not a comment section bolted to a reference
page. It is the next layer of the record. An unknown pitcher who moved a thumb and
learned something has a real place here next to the verified master — labeled
honestly as what it is, never dressed up as more. (Core: preserve the living art;
real, never faked; the safety floor.)

---

## Vision scenarios

Three illustrative futures, written in present tense as if they already work. These
are design targets, not research findings and not user testimony — no one said
these words. They exist so a trade-off argument has something concrete to check
itself against.

**The bullpen, between innings.**
A junior-college fastpitch pitcher has lost her riseball. She opens Pitch Atlas on
her phone with dirt on her hands. The page loads without the 3D ball because the
signal is bad, and it doesn't matter — the flat seam diagram and the grip photo are
right there. She reads one feel cue about wrist position she has never heard phrased
that way. She tries it in the pen. Two days later she comes back and writes what
happened, and it lands in the record with her name on it and a label saying exactly
what kind of evidence it is.

**The coach with a retiring mentor.**
A pitching coach spent nine years around an older instructor who is about to stop
teaching. The man throws a changeup grip nobody else uses and has never written a
word about it. The coach films his hands, uploads it through the rights gate, and
writes the grip up in the atlas's structure: finger placement, seam orientation,
what it feels like, who taught it to whom. It is marked coach-observed, not
official. Ten years from now, when the old instructor is gone, the grip is still
here — and it is here honestly, wearing exactly the confidence it earned.

**The stranger who fell in.**
Someone with no stake in pitching follows a link about a forgotten dead-ball pitch.
An hour later they are four chapters deep in the Lost Pitches wing, reading about
what the record can and cannot support, and they have learned something true about
how a craft loses its own history. They send it to a friend. Nothing was sold to
them. The archive did the work.

---

## The Core (change these and it stops being Pitch Atlas)

**1. Preserve the living art.**
Pitching knowledge belongs in one place where history, trusted instruction,
creative experimentation, and real conversation can meet. The atlas preserves
what came before without freezing the craft in place, and it makes room for both
established minds and unknown pitchers who have something useful to share.

Provenance is the trust infrastructure supporting that mission. Claims keep their
source and confidence labels; media keeps its rights record; official tracking
context and a coach's observation never wear the same badge. That machinery earns
trust, but it is not the product's personality.

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
This teaches grip and technique. It publishes no medical, injury, pain,
rehabilitation, recovery, workload, durability, health-outcome, or youth-training
claims. A source, confidence label, or disclaimer does not create an exception.
Route-stable safety pages may state this boundary and must remain claim-free. This
is non-negotiable in product copy, community guardrails, and everything the plugin
generates.

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

## The product shape today (snapshot, 2026-08-31)

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
- **Softball wing:** `/softball` with fastpitch and slowpitch halls plus their own
  pitch and craftsman chapters, wired into the top nav and carrying its own data
  wing. Baseball and softball are both in scope; "pitching" in this document means
  the craft in both games.
- **Grips index:** `/grips`, a direct index into the grip layer itself.
- **Knowledge hub:** `/learn` and its chapters, guarded by a safety-copy test so the
  safety floor is enforced by the suite and not by memory.
- **Tool and reference routes:** `/movement-map`, `/sandbox`, `/compare`, `/sources`,
  and the design-system showcase.

---

## Where it's heading (horizons, not a contract)

Three time horizons. None of this is a promise; it is the current read, and the
further out it goes the less it should be trusted as a plan and the more it should
be read as a direction. The execution detail for any of it lives in its own dated
plan. This file just keeps them pointed at the Northstar.

### Near (the next year) — make what exists complete

- **The visual grip library.** Stand up the clean-channel photo layer so a grip
  carries a real reference image, not just geometry. Community uploads first; CC and
  first-party shots alongside.
- **Softball to parity.** The wing is live and in the top nav. Bring fastpitch and
  slowpitch up to the same specimen depth, craftsmen coverage, and sourcing bar the
  baseball side already holds, so "one roof over the whole history" is true of both
  games and not just claimed.
- **Deeper atlas.** More filed specimens, more craftsmen, the long tail of the
  encyclopedia promoted from one-liners to full files as the sourcing clears the bar.
- **My Bullpen (iOS), phase 0.** The service-worker step, not a second codebase. The
  plan is `docs/ios-app-plan.md`.

### Mid (two to three years) — make it a habit, not a visit

- **The return habit.** The structured field-note / grip-tweak engine that turns
  "I moved my thumb and it did this" into a reproducible, ranked, sourced entry —
  the thing that makes pillar five real rather than aspirational.
- **iOS in pitchers' hands.** Past phase 0, on the field, where the signal is bad
  and the hands are dirty.
- **Contribution that earns standing.** A way for a coach or pitcher who keeps
  submitting good, honest, well-sourced work to accumulate visible standing — without
  ever inventing a badge, a count, or a credential nobody earned.

### Long (five years and out) — the aspiration

- **The default reference for the craft.** When a pitcher, coach, or writer wants to
  know how a pitch is actually held and where it came from, this is where they go
  first, the way you'd reach for a field guide.
- **Knowledge here that would otherwise be gone.** The real test of a living museum:
  grips, cues, and experiments preserved in the atlas that exist nowhere else because
  the person who knew them stopped teaching, and somebody wrote it down in time.

---

## How we'd know it's working

The Northstar already says what the win condition is not: traffic. This is what to
watch instead. Signals first, because they are readable long before any number is
meaningful at this stage.

**Qualitative signals (the ones that actually matter first)**

- Someone returns and writes down what happened after trying a grip. That single
  loop — read, try, come back, report — is the whole product working.
- A contribution arrives that could not have been found anywhere else: a grip with no
  prior public write-up, from someone who learned it in person.
- A coach cites the atlas to a student, or a writer cites it in a piece, and the
  citation survives scrutiny because the provenance holds up.
- Someone corrects the atlas and is right. A record that can be corrected is alive;
  one that never is has stopped being read carefully.

**Quantitative signals worth instrumenting**

Named here as *what to measure*, not as targets. No goal numbers are written in this
document, because none have been set — inventing one would violate "real, never
faked" in the one place it would be least visible.

- Return rate of contributors (people who submit more than once), not raw visitors.
- Filed specimens with full sourced depth, versus one-line encyclopedia entries —
  the ratio, tracked over time, is the honest measure of "deeper atlas."
- Share of filed specimens carrying a real grip image versus geometry alone.
- Softball depth as a fraction of baseball depth, until parity closes.
- Moderation load per contribution, watched as a health signal rather than a target:
  rising load means the safety floor is doing work; a sudden drop usually means
  contribution stopped, not that behavior improved.

**Milestones (binary, so they can't be fudged)**

- First community-contributed grip that becomes a filed specimen.
- Softball reaches specimen parity with baseball.
- The field-note engine produces its first reproducible, ranked, sourced tweak.
- A pitch is preserved here whose only surviving public record is this one.

Anything that would require a number to be invented rather than measured stays out
of this section until it can be measured for real.

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

### 2026-08-31: Give the charter pillars, scenarios, horizons, and a scoreboard

**Decision.** The Northstar keeps its one-line mission and its seven Core
principles. Added around them: five **pillars** stating why a pitcher chooses this
(the visitor's list, where the Core is the builder's list), three **vision
scenarios** written as illustrative design targets, a **near / mid / long** split
replacing the flat direction list, and a **"How we'd know it's working"** section
naming qualitative signals, metrics worth instrumenting, and binary milestones.

**Why.** The charter could say what Pitch Atlas must never do and could not say what
would make someone come back. Seven guardrails are not a reason to visit. Trade-off
arguments had nothing concrete to check against, and "the win condition isn't
traffic" named only what success is not.

**The correction that forced it.** The product snapshot was three months stale and
never recorded the softball wing, which is live, routed, in the top nav, and carries
its own data. A vision document describing a smaller product than the one that
shipped cannot be extended honestly, so the snapshot was refreshed first: softball,
the grips index, the knowledge hub, and the tool routes are now on the page.

**No numbers were invented.** The success section names what to measure and states
plainly that no targets have been set. Writing a goal number nobody chose would
break "real, never faked" in the least visible place in the repo.

**Touches.** `docs/NORTHSTAR.md` only. No Core principle changed; no code, copy, or
data model moved.

**Respects.** Preserve the living art. Grip-first. Real, never faked. The safety
floor. Usable with zero WebGL. Four states or it is not done.

### 2026-08-31: Recover the living-museum mission; keep provenance as infrastructure

**Decision.** Pitch Atlas is a living museum and conversation space for the
heritage, history, craft, and evolving art of pitching. It brings trusted minds,
creative unknowns, historical context, first-party grip evidence, and real
community discussion into one distributed experience. The former sourcing phrase
is retired as product vision. Source, confidence, rights, and moderation labels
remain intact as the trust infrastructure underneath the mission.

**Why.** The sourcing method had drifted from a supporting quality system into the
personality of the product. That framing narrowed a project meant to preserve and
advance pitching culture. The mission now says what the atlas is for; provenance
still determines what has earned a place in it.

**Touches.** README, this charter, agent operating documents, metadata, public
copy, route tests, and the living external-media layer. The Claim/Source types,
rights ledger, confidence union, and moderation floor remain compatible.

**Respects.** Preserve the living art. Grip-first. Real, never faked. The safety
floor. Four states or it is not done.

### 2026-07-16: Make the safety floor an absolute product boundary

**Decision.** Pitch Atlas publishes no medical, injury, pain, rehabilitation,
recovery, workload, durability, health-outcome, or youth-training claims, even when
a source exists and even behind a disclaimer. `/learn/arm-health` and `/learn/youth`
remain as claim-free boundary pages so existing links resolve and the limit stays
visible.

**Why.** A sourced conclusion is still a product conclusion. The earlier
source-record model left Pitch Atlas reading like a health and workload adviser,
which is outside a grip-first archive's job.

**Touches.** The Learn data model and boundary routes, mechanics and pitch-design
copy, baseball and softball pitch records, repertoire and craftsmen records, public
SEO copy, README, and the web/iOS platform contract.

**Respects.** The safety floor. The trust model still governs every claim that is
eligible to ship; provenance does not grant permission to cross the product
boundary. Real, never faked remains intact.

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

**Respects.** The trust model (the method stays in the data and source registry,
never coined as a card or meta tagline). Real,
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
**Respects.** Preserve the living art. Grip-first. Real, never faked.

### 2026-06-09: Craft-over-numbers doctrine replaces pitch-behavior gauges

**Decision.** Pitch behavior is rendered as shape language, not as velocity,
spin-rate, or break-in-inches figures. Sourced biography figures still belong when
they are real. The old analytics routes are retired or reframed around craft.
**Why.** Austin's own pitches were not tracked, and treating invented precision as
structure made the product less honest and less useful. The archive needs the hand,
the seam, the release, and the claim boundary first.
**Touches.** README, agent operating docs, data model language, route framing,
cards, and the tool surfaces.
**Respects.** The trust model. Grip-first. Real, never faked.

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
**Respects.** The trust model (every image carries rights + attribution).
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
