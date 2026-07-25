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
