# Electric Burnt Chrome — art direction correction

**Date:** 2026-07-25
**Status:** Palette + frame landed; card face outstanding
**Decisions taken by Austin:** foil ramp **B (Full Refractor)**; accents **pulled fully into the metal family**

---

## The brief

> "change the color of the `--foil` to add a electric burnt orange powder ice chromium
> rainbow as the holographic foil to complement. the cards foil is also wrong. It needs
> more solid black borders with contrast and boldness. burnt orange is what i want more
> of, bordered on the black, powder blue, cyan, etc., with a flashy finish and interactive
> dynamic movement as well as a mechanically and aesthetically compelling and beautiful
> baseball with the real-to-life basic pitching grips with real hand positioning and tips
> considered and added. this should be a 3d object and include animated video components
> as well. they should have a premium-vintage-heritage-chromium foil feel and fit the
> current design system we are in. The PitchSpecimenCard might be the weakest aspect of
> it all. the finish of the whole platform looks too glossy and cartoonish and pixelated
> when it should be premium chrome vintage Topps Now baseball card inspired with 80s-90s
> aesthetic nearly blended with the modern"

## The diagnosis

Three distinct causes. Only one is the foil.

**Pixelated** — the ball on the specimen card is flat SVG (`RefractorBall.tsx`): a 300-unit
viewBox carrying `filter: blur(7px)` / `blur(2px)` speculars and a `feGaussianBlur` cast
shadow, then scaled into the card window. SVG blur rasterizes at viewBox resolution and
upscales, so it resamples soft on a high-DPI display every time. Not compression — the
blur filter.

**Cartoonish** — two sources.
1. `--foil` carried eight fully saturated hues and **no grey and no black**. A refractor is
   a dark mirror that throws a spectrum when light rakes it, not a card printed in rainbow.
   That distinction lives in the value curve, not the hues.
2. `accents.ts` carried eighteen neon per-pitch triads (`#1CF0A6`, `#7CFF52`, `#FF6FB3`,
   `#8A6BFF`). Because a pitch wears its accent on its card, its index plate *and* its
   chapter, that saturation reached every surface. Fixing only the foil would have left it.

**Glossy** — the card frame emitted a 48px accent bloom (104px double bloom on the gold 1/1)
sitting outside a black ring that was only 2px at 82% alpha; the halo was wider and brighter
than the frame. Plus 20px/16px corner radii and a broad 340px white gloss sweep at .72
opacity. Cards sit on a surface. They do not emit light.

## The palette

Not invented. Recovered from `tmp/electric-burnt-chrome/Electric Burnt Chrome.dc.html`,
designed 2026-07-07, transferred to staging, and never landed — the product carried zero
burnt-orange tokens. Now named in `src/index.css` as `--ebc-*`:

| Token | Value | Role |
|---|---|---|
| `--ebc-orange` | `#ff6a29` | electric burnt orange — the hero note |
| `--ebc-burnt-1/2/3` | `#d24309` `#7e2909` `#140a05` | its shadow ladder |
| `--ebc-ice` | `#b9d4e5` | powder ice |
| `--ebc-powder` | `#8fbad6` | powder blue |
| `--ebc-cyan` / `-2` / `-3` | `#5fe0ea` `#1f97a2` `#274253` | the cold arc |
| `--ebc-chrome-1/2/3` | `#a7adb0` `#6e757b` `#2a3035` | the chromium ladder |
| `--ebc-brass` | `#e4b45a` | the vintage note |
| `--ebc-specular` | `#fff3ec` | the one narrow white-hot stop |
| `--ebc-black` / `-2` | `#08090a` `#0a0b0c` | the mirror, and the horizon band |

### The foil (ramp B)

Twenty-one stops. What makes it read as metal, in order of importance:

- **Three black anchors** — 0%, the 56% horizon, 100%. Without them the ramp reads candy
  regardless of hue choice.
- **Burnt orange holds the widest territory.** It is the brand's warm voice.
- **One narrow white specular at 26%**, not a broad bright region.
- **Powder ice → cyan is the cold arc**, sitting opposite burnt orange on the wheel.
- **Chromium greys at 61–70%.** The previous ramp had none. This is the single change that
  moves it from printed rainbow to mirror.

> Do not "brighten" this by pulling the blacks or greys out. They are the mirror.
> Fourteen CSS rules and two components consume `--foil`; a change re-skins the wordmark,
> the primary CTA rim, and every specimen card at once.

`--gold` stays the separate 1/1 register and never goes rainbow. Warmed to the EBC brass so
the two metals sit in one world.

### The accents

All eighteen triads moved into the palette. Identity survives: the fastball family stays
warm, the breaking family goes cold, and no two pitches share a `c3`. Selected examples —
four-seam powder ice, two-seam deep cyan, circle change bone, slider seam red, splitter
chromium, splinker electric burnt orange, knuckleball chrome grey, eephus brass.

## The frame

Black → foil → black → field. Fully opaque on the blacks.

- Card radius 20px → **8px**; field radius 16px → **4px**.
- Outermost edge is `0 0 0 3px #000` solid; the accent survives only as a 1px seat.
- The 48px / 104px blooms are gone, replaced by a cast shadow (`0 26px 42px -20px`) so the
  card sits on the void instead of hovering over it.
- The gloss sweep narrowed from a 340px/.58 wash at .72 opacity to 190px/.5 at .46.
- The 1/1 still outshines the run — by frame weight and brass density, not by bloom.

The cracked-ice hatch, the woven check, and the worn-matte turbulence pass are **kept**.
They were good and they are period-correct.

## The card face — outstanding

The capability already exists and simply never reaches the card. This is routing, not
invention.

- **`Hand.tsx`** solves finger spines from the grip model, sweeps them as warm
  soft-roughness fingers, flattens the pad where the pressing finger meets leather, presses
  a falloff contact shadow into the cover, and hangs a pin on each fingertip carrying its
  sourced pressure role and cue. It runs on the pitch pages via `BallStage`. The card has
  never shown it.
- **`GripClip`** already loops real grip footage — muted, viewport-gated, poster fallback,
  reduced-motion still. Four pitches have footage today.
- **Material.** A refractor is thin-film interference over metal, which is exactly
  `MeshPhysicalMaterial`'s `iridescence` / `iridescenceThicknessRange`. Driving it
  physically rather than painting a gradient removes the last of the plastic.

**Planned shape:** card at rest shows a pre-rendered loop of the real 3D grip (ambient,
cheap, every card gets the real hand); hero and detail pages mount live interactive 3D.
That satisfies both "3D object" and "animated video components" without paying for a WebGL
context per card in a grid.

## Constraints that do not move

- No fabricated pitch behavior, spin, velocity, break, geometry, or physics.
- Every visible claim keeps its `Source` and `confidence`. Foil is decoration; provenance
  is not.
- No unlicensed agency or photographer images of identifiable players, no team or league
  marks, no broadcast footage. Grip visuals are first-party renders or own-rights uploads.
- No medical, injury-prevention, workload, or youth-prescription claims — grip and
  technique only. "Tips" means sourced grip cues, nothing else.
- Seam copy stays **seam-informed schematic**, never "seam-accurate."
- Every ambient loop still collapses to its final state under `prefers-reduced-motion`, and
  gradient-clipped type still falls back to a solid color under `forced-colors`.

## Verification

`npm run typecheck` · `lint` · `test` · `build`, then render the real pages at desktop and
mobile and read the pixels. Build output is not proof; the rendered card is.

---

## Addendum — the media pass (2026-07-25)

Austin, looking at the front door: *"Why aren't you using actual video assets that you have
in the card frames? Specifically with the landing page heroes."* He was right, and the
cause was mechanical.

### Cause 1 — a duplicated card, drifting

`PitchSpecimenCard` resolved the card face down a ladder (clip → photo → seam ball).
`ChromeWall`'s `WallCard` — the three cards on the home page — carried a hand-copied
version that always passed `RefractorBall` and always printed the words "Reference
schematic." So the four-seam and the 12-6, both of which Austin filmed, showed a drawing on
the front door while `/public/grips/*.mp4` sat unused. A test pinned the bug in place:
`expect(getAllByText('Reference schematic')).toHaveLength(3)`.

Identical failure shape to the binder tab that carried three of five families. Both are now
fixed the same way: **one resolver**, `specimenFace`, read by every card surface, plus one
`CARD_INK` table replacing the two hand-maintained confidence-color maps that had already
drifted apart. The replacement test derives its expectation from the grip library, so a new
clip can never be shadowed silently again.

### Cause 2 — the 3D existed and never reached a card

`BallStage` → `BallScene` → `Hand` already renders the real specimen: leather, the solved
seam, and the hand seated on the pitch's filed contacts with sourced pressure pins. It ran
only on the specimen pages. `specimenFace` now takes a `model` flag: on showcase surfaces
(the home wall), a pitch with a filed grip model and no footage mounts the live specimen
instead of the flat drawing, chipped **Reference grip model**. Everywhere else keeps the
cheap SVG, so the WebGL context cost stays bounded.

Two supporting props were needed:

- `interactive` — off inside a card. The card is a link, so a drag released on it would
  navigate; the stage also stops swallowing pointer events so the card's tilt and click
  still work. Handling the ball stays the Grip Lab's job.
- `distance` — the Grip Lab's camera framing runs the fingers off the top of a 10:9 card
  window. Cards sit back at 7.7.

### Cause 3 — the page promised a 3D specimen it never showed

`RefractionBridge` reads *"One seam. Two media."* and *"This flat diagram and the tilting 3D
specimen are two draws of a single function"* — beside a single flat diagram. The claim was
asking the visitor to take the specimen on faith. The live `BallStage` now stands there at
size, with the 2D schematic struck small beneath it.

Deliberately **no grip hand on that beat**: the subject is the seam, not the grip. It also
avoids the honest weak point below.

### Known weak point, fixed in the pass below

The hand geometry is finger tubes with no palm, knuckles, or web behind them. At card scale,
cropped like a photograph, it reads. At size it reads as tubes. Giving `solveGripPose` a
palm mass is the next real piece of work on "real hand positioning," and it touches every
specimen page's Grip Lab, so it wants its own pass and its own verification.

---

## Addendum — the hand (2026-07-25)

### It was worse than "no palm"

The first read was that the render lacked a palm. Measuring the solver said something
harder: **the fingers were never a hand at all.** `solveGripPose` answers one question per
contact, independently — each spine walked a full finger length across the cover from its
own contact point. Dumping the base of every filed pitch:

| pitch | index base → middle base |
|---|---|
| four-seam | 0.48 ball radii |
| circle change | 1.08 |
| splinker | 2.20 |
| splitter | **2.87** |

A splitter's two finger roots ended nearly three ball radii apart, and the knuckleball's
index root sat three radii from the ball's center, in open space. There was nothing to
attach a palm to. Fingers converge on knuckles; knuckles sit on a palm; that had to become
part of the solve.

### solveHand

`solveGripPose` is untouched and still owns the leather: same seam point, same azimuth,
same hug arc, same pressure. A test asserts that for every filed pitch, byte for byte.
`solveHand` owns everything behind the contact:

- **The palm frame is walked around the cover**, not floated above it. From the mean contact
  point, back along the mean finger direction by 0.95 radians of surface arc — that lands
  the knuckle line where the hand actually is. The first attempt placed it on a tangent
  above the contacts and rendered as a plate resting on a lid.
- **Across is read off the data.** Whether index-to-pinky runs one way or the other depends
  on the pitch, so the axis is fitted to the authored contacts' own ordering and flipped if
  they come out descending.
- **Each finger is re-laid** from its knuckle down to its contact: a quadratic that leaves
  the leather along the finger's own direction and bows out, curled fingers bowing more.
  The thumb's run under the ball is a chord through the leather, so its samples ride out
  onto the cover — which is how it wraps.
- **The palm is a loft, not an extrusion.** Six cross-sections swept knuckles-to-heel, each
  a superellipse so the mass stays flat like a hand with edges that roll, cupping back
  toward the ball as it runs to the heel, both ends rounding closed.

### Four things that had to be looked at to be found

Build output proved none of these. Each came off a rendered frame.

1. **The plate.** A flat extruded outline above the ball read as a wedge of cheese. Fixed by
   walking the frame around the cover and lofting instead of extruding.
2. **Bead knuckles.** Rendering the MCPs as separate ellipsoids put four beans on the back
   of the hand. Deleted; the finger's own swell into the mass carries it.
3. **Curled fingers.** The ring and pinky, drawn folded, read as a claw when they cleared
   the palm's silhouette and were invisible when they didn't. Deleted — the palm spans the
   full four-knuckle width, so a closed finger is read inside that silhouette instead of
   drawn as a loose digit.
4. **The notches.** Every finger had a scoop cut out of it where it crossed the ball's
   silhouette. The spine sat flat on the cover, which buried most of the swept tube inside
   the ball; the leather then cut the finger open along the intersection. The centerline
   now rides its own radius above the surface, less a little for the flesh giving.

### What is authored and what is rendered

Unchanged and worth restating, because the hand grew: contacts, engagement, pressure tier
and cue are authored and sourced, and every label on screen still comes from one of those.
The palm and the knuckles are rendered proportions — the same status as the finger lengths
that were always in the solver. No claim hangs on them; none is labeled.

### Two surface calls that came out of looking

- **The 2D twin clips to the cover.** The hand now converges off the ball, so projecting it
  whole spilled a grey slab past the frame of a 240px diagram. The schematic draws the part
  of the hold that is on the leather and stops at the rim.
- **Cards drop the fingertip pins and show the side view.** Three labels in a 300px window
  sit on top of the grip they name, and a pitch's own default view is tuned for the Grip
  Lab, where the ball is big enough to read a thumb-side angle. Pins stay on the specimen
  page, where handling the ball is the point.
