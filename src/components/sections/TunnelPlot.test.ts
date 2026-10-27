import { describe, expect, it } from 'vitest'
import { PITCHES } from '../../data/pitches'
import { CX, plot } from '../../lib/flightPath'

/*
  The flight figure bends every path toward the side its own shape words name. The
  authored spin vector's sideways sign disagrees with those words on most of the set,
  so it may set how hard a path bends, never which way.
*/
describe('the flight figure', () => {
  for (const hand of [1, -1]) {
    for (const entry of PITCHES) {
      const { horizontalDir, verticalShape } = entry.motion
      it(`${entry.display.slug} (${hand === 1 ? 'right' : 'left'}-handed) bends toward its stated side`, () => {
        const s = plot(entry, hand)
        const side = horizontalDir === 'arm-side' ? hand : horizontalDir === 'glove-side' ? -hand : 0
        expect(Math.sign(s.x - CX)).toBe(side)
        expect(Math.sign(s.ctrlX - s.baseX)).toBe(side)
        // SVG y runs down: a drop bows below the straight line, a ride above it
        const down = verticalShape === 'drop' ? 1 : verticalShape === 'ride' ? -1 : 0
        expect(Math.sign(s.ctrlY - s.baseY)).toBe(down)
      })
    }
  }
})
