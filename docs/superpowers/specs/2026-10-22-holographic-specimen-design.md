# The specimen cards become the holographic objects they were meant to be

Date: 2026-10-22. Status: built on branch `holo-specimen`, grounded in `origin/main`
@ `3f518f6` and the live site at pitch-atlas.com, both inspected the same day.

## Why

The cards were always meant to be holographic. The foil existed in code and did not
read on screen. Six lines explained it, each one verified on the live site:

1. `src/styles/world.css` drew the hero's live foil canvas at 28 percent opacity.
2. The canvas mounted inside the inner window, so it never covered the rim where the
   houndstooth frame lives. The rim was CSS only.
3. The shader multiplied every pixel by houndstooth coverage and capped alpha at .85;
   at rest the bands were nearly dark.
4. The media window, the bone cue plate and the header covered most of the field.
5. Only the hero mounted the live foil. The wall, the discovery card and the craftsman
   card used the CSS gradient stand-in slid by the pointer.
6. Hover tilt was ±10°, but ordinary cursor positions produced 2–4°.

Austin's own words on the intended finish (2026-07-25): electric burnt orange, powder
ice, chromium, a flashy finish with dynamic movement, premium chrome with an 80s–90s
Topps register blended with the modern. A refractor is a dark mirror that throws a
spectrum when light rakes it; the blacks and chromium greys are the mirror.

## What is true now

**The material is the card's whole face.** One WebGL2 canvas the size of the card sits
between the stock and the print. While it is live the print leaves its own stacking
context so the canvas can be under the header, the cue plate and the strip and over the
field and the media. The rim and the field carry the foil; only a thin lamination glaze
crosses the media window, so the hand, the seams and the source chip stay intact.

**The shader** draws, in order: the stock (near-black mirror, tooth, vignette, sheen
toward the key light); the micro-structure (brushed hairline, pillar columns,
crosshatch, cracked-ice cells, glitter sites, ripple, cat-eye, and the houndstooth's two
groove populations, each perturbing the normal or the tangent the light model sees);
the light (a point key light above the card and a viewer straight on, both expressed in
the card's own frame after its tilt, so turning the card under a still light and moving
the light over a still card are one calculation); the interference colour (thin-film
phase sampled from the brand ramp, leaned toward a prism by `spectral`); coverage
(rim 1.0, field 0.22, head and strip attenuated and luminance-capped); the bevel at the
cut, the step down into the field, and the black / ring / black bezel the CSS used to
draw; and the ember register (warm lacquer stock, warmed glints) for the 1/1.

**One ramp, two readers.** `material/foilRamp.ts` carries the stop lists for `--foil`,
`--foil-type`, `--ember` and the two throwback `--card-foil` ramps; a test pins the CSS
strings in `index.css` to `rampToCss()` and the texture the shader samples to the same
stops. The hero's preset samples the brand ramp (burnt orange holding the widest
territory, the powder-ice → cyan arc arriving as the card turns) with `ember` warming
the stock and the glints; the pure lacquer ramp stays available as a Finish choice.

**Motion.** The hero turns slowly on its own: a closed drift of ±3.5° / ±2.5° on 11 s
and 7⅓ s clocks with the key light on its own slower clock, one intro light sweep on
first view, 30 fps, yielding to the hand and resuming after 1.5 s idle. A "Pause motion"
control beside Compare remembers the choice on the device. Hover tilt is ±12°; the
inspector grabs on both axes to ±28° with a softer spring that glides home.

**Surfaces.** The hero is always live. The filed set and the discovery card mount the
material as they scroll into view, draw one rest frame, and re-render only when moved.
The back is its own card: the dark scout record, extracted into `SpecimenBack`, with
its own tilt engine and the Quiet Ink & Bone material, mounted only while it shows.
Live material canvases are capped at eight; past the cap the CSS stand-in holds.

**The inspector.** "Inspect card" (under the hero, on the discovery card, in the wall's
action row) opens the specimen large in a dark room with a compact rail: Front /
Sources, Study grip (into `/pitch/<slug>#grip-lab`), Compare, Finish, Export, Pause /
Reset. `?inspect=<slug>` carries the state. Finish choices are remembered per card face
on the device and never touch a record or any page surface.

**Export.** A 1500-pixel PNG, composed natively from the record (media, bezel, chip,
header, plate, strip), posed in perspective with a stock edge, contact and cast shadows,
a dark or transparent backdrop and an attribution caption; and a 7-second, 30 fps WebM
of the 1200-pixel card face, posed into a 1440×2010 frame, whose pose and light run one
closed cycle so the last frame hands off to the first. Each WebM frame goes to the browser's own encoder (WebCodecs, written into
WebM by mediabunny) stamped with its time, and the next is drawn only when the encoder
can take it, so the file always holds all 210 frames; a live recorder, which keeps only
the frames its encoder has time for, is the fallback. A transparent backdrop keeps its
alpha. Where the browser cannot make a WebM the panel says so before the click, and the
PNG still works.
Faces filed under terms that do not allow a copy to leave the page are refused with the
reason.

**Floors kept.** Reduced motion mounts the material and draws exactly one still frame;
no WebGL2 leaves the CSS card standing (the same ramp at rest); keyboard reaches
everything; routes, prerendering, the compare flow and every existing test gate stay as
they were.

## Not done, on purpose

- A WebM needs a browser whose encoder writes VP9 or VP8 at the export's frame, or a
  recorder that records WebM. The inspector asks the browser before the click and, where
  neither answers, leaves the button off and says why.
- Safari, checked 2026-10-23 on the M3 laptop with an unattended local probe: Safari
  27.2's encoder writes VP9 and VP8 at 1440×2010 and refuses an alpha channel, which does
  not matter here, because the encoder library carries transparency as its own second
  stream. The library's full loop of 210 frames came back at exactly 7 seconds, dark and
  transparent (transparency on all 210). The card painter and the panel themselves have
  not been driven in Safari.
- The WebM takes about 40 seconds to make in Chrome on the M3 laptop (76 with a
  transparent backdrop). Both times are for the 1440×2010 posed frame, made from the
  1200 px card face: VP9 in software is the slow part, and its realtime mode was no faster
  on a card's detail. Safari's encoder ran the same size of loop, on simpler test frames,
  in 5 seconds (9 transparent). The progress bar moves frame by frame and Cancel stops
  the encoder.
- The exported back leaves out the spin-direction dial the page's back carries.
- A face whose page media is the live 3D grip model exports as the seam-informed
  schematic twin, labelled "Reference schematic".
- Device-orientation tilt is off by the site's own Permissions-Policy.
- `design-sync:check` needs its `cssEntry` re-pointed after the CSS changes; that is
  the repo's existing follow-up convention.
