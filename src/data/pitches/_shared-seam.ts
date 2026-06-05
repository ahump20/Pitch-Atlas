import type { SeamGeometryReference } from '../types'
import { claim } from '../sources'

/*
  One baseball cover, shared by every specimen. The pitches differ by spin axis,
  grip, and break, never by the leather: the seam geometry is identical across
  the atlas, drawn from the single figure-eight curve in lib/seam.ts. Labeled a
  seam-informed schematic, the same honest disclosure the four-seam carries.
*/
export const sharedSeam: SeamGeometryReference = {
  equationPlain: 'x = 2 sin t + sin 3t,   y = 2 cos t - cos 3t,   z = 2√2 cos 2t',
  parameterization: 't from 0 to 2π, each point normalized to the ball radius, the whole curve rotated by the spin-axis quaternion.',
  stitchCount: claim('108 double stitches, 216 individual', 'wiki-baseball-ball', 'reputable-analysis', {
    note: 'A manufacturing convention, not a number written into the rulebook, which fixes only weight and circumference.',
  }),
  accuracyLevel: 'seam-informed schematic',
  accuracyNote: claim(
    'The published closed-form figure-eight seam curve is laid on the sphere, but the exact regulation cover constants and the full 108-stitch pattern are approximated, not measured.',
    'mathcurve',
    'reputable-analysis',
    {
      approximate: true,
      note: 'The canonical degree-6 cover constants were not pinnable, so the documented figure-eight closed form stands in. The honest label is seam-informed schematic, never seam-accurate.',
    },
  ),
  calibrationDoc: 'docs/seam-calibration.md',
}
