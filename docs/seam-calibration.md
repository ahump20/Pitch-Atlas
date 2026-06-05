# Seam calibration

This documents the geometry behind every specimen so the claim on the page is
auditable. The page says **seam-informed schematic**, not seam-accurate, and this
file is why.

## The curve

The seam is the canonical closed-form figure-eight curve on a sphere:

```
x(t) = 2 sin t + sin 3t
y(t) = 2 cos t - cos 3t
z(t) = 2 sqrt(2) cos 2t          for t in [0, 2 PI]
```

The raw curve does not lie on a sphere, so every point is normalized to the ball
radius before use (`seamPoint` in `src/lib/seam.ts`). One function produces this
curve; the 3D tube, the 3D stitch placement, the 2D schematic, and the no-WebGL
fallback all read it, so the model and the diagram cannot disagree.

## Coordinate system

- Ball centered at the origin, radius 1.
- Surface normal at any seam point is the normalized position vector.
- Spin axis: a near-horizontal backspin axis, `SPIN_AXIS` in `seam.ts`, a slight
  tilt off pure horizontal so it does not read as a lifeless flat line.
- A shared presentation tilt (`SEAM_VIEW_TILT`) orients the horseshoe toward the
  viewer identically in the 2D schematic and the 3D rest pose.

## Stitch count

The render lays down **108 stitches**, matching the widely cited figure of 108
double stitches on a regulation baseball (Wikipedia, "Baseball (ball)"). Note
two honest caveats:

- 108 double stitches is the same count as **216 individual** stitches. We draw
  108 single slanted ticks, a herringbone hint, not the true 216-pass double
  pattern.
- 108 is a manufacturing convention (Rawlings), **not** a constant written into
  the MLB rulebook, which fixes weight (5 to 5.25 oz) and circumference (9 to
  9.25 in), not a stitch count.

## What is exact, what is schematic

Exact, or faithfully sourced:

- The seam is one published closed-form curve, a single closed loop that divides
  the sphere into two regions, consistent with the cover-piece boundary geometry.
- The stitch **count** (108) matches the standard figure.
- The backspin axis orientation and the Magnus direction (up, opposing gravity)
  are physically correct.

Schematic or approximate, and therefore not claimed as measured:

- The exact regulation cover constants (the Ferreol / Esculier degree-6 a/b/c
  coefficients, baseball shape near c = 0.98) were **not** pinned down during
  research; the figure-eight closed form stands in for them.
- The figure-eight describes an idealized seam **path**, not the manufactured
  cover geometry, and the stitches are slanted single ticks, not the true
  216-pass herringbone.
- Grip-marker seam positions (`fingerPlacement` in the four-seam record) are
  tuned visually to read correctly, not measured from a real grip.

## Across the atlas

The cover is one baseball for every pitch. All five specimens share the same seam
curve, the same stitch geometry, and the same `sharedSeam` record; nothing about
the leather changes from pitch to pitch. What changes per specimen is three
things, all carried in each pitch's `motion` block:

- **The spin axis** (`motion.spinAxis`, render space), authored per pitch: pure
  backspin for the four-seam, tilted toward the arm for the sinker and change,
  topspin for the curve, pointed at the plate for the gyro slider.
- **The Magnus force**, which is **not stored but computed** from that axis as
  `spin × velocity` (`magnusForceRender` in `src/lib/physics.ts`). Its drawn
  length scales with `magnusStrength`, the transverse-spin fraction, so a gyro
  slider's arrow is short because most of its spin does no Magnus work. A data
  test asserts the drawn force direction agrees in sign with each pitch's sourced
  induced vertical break.
- **The grip contacts** (`fingerPlacement`), tuned visually per pitch, the same
  schematic caveat as the four-seam.

So the axis-to-seam registration is still a schematic, not a measured grip: the
seam does not rotate to match each spin axis. That is part of why the label
remains seam-informed schematic across the whole atlas.

## Sources

- Wolfram MathWorld, "Baseball Cover" (Thompson 1996), the rigorous engineering
  treatment, which is explicitly **not** closed form.
- mathcurve.com, "Seam line of a tennis ball" (Ferreol / Esculier), the cleanest
  published closed-form family (degree-6, shape constant c near 0.98).
- Frontiers in Applied Mathematics and Statistics (2018), which uses the
  figure-eight closed form implemented here.
- Wikipedia, "Baseball (ball)" for the 108 double / 216 individual stitch count.

## How to earn "seam-accurate" later

Two steps, both verified visually on the render before the copy changes:

1. Replace the figure-eight with the Ferreol / Esculier degree-6 spherical curve
   tuned to c near 0.98, with its exact a/b/c constants pinned from the source,
   or implement Thompson 1996 cover geometry from circumference 9.125 in and seam
   spacing 1.1875 in.
2. Lay 216 individual stitches in the true double-stitch herringbone along that
   curve and confirm the count on the rendered sphere.

Until both are done and checked, the honest label is **seam-informed schematic**.
