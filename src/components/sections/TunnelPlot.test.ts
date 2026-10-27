import { describe, expect, it } from 'vitest'
import { PITCHES } from '../../data/pitches'
import { CX, CY, plot, RELEASE_Y, type Spot } from '../../lib/flightPath'

/* a point on a pitch's path, and on the spinless line, a fraction t of the way down */
function at(s: Spot, t: number) {
  const u = 1 - t
  return {
    x: u * u * u * CX + 3 * u * u * t * s.c1x + 3 * u * t * t * s.c2x + t * t * t * s.x,
    y: u * u * u * RELEASE_Y + 3 * u * u * t * s.c1y + 3 * u * t * t * s.c2y + t * t * t * s.y,
  }
}
const spinlessY = (t: number) => RELEASE_Y + t * (CY - RELEASE_Y)
const sign = (n: number) => (Math.abs(n) < 1e-9 ? 0 : Math.sign(n))

/*
  The flight figure bends every path toward the side its own shape words name. The
  authored spin vector's sideways sign disagrees with those words on most of the set,
  so it may set how late a path breaks, never which way.
*/
describe('the flight figure', () => {
  for (const hand of [1, -1]) {
    for (const entry of PITCHES) {
      const { horizontalDir, verticalShape } = entry.motion
      it(`${entry.display.slug} (${hand === 1 ? 'right' : 'left'}-handed) bends toward its stated side`, () => {
        const s = plot(entry, hand)
        const side = horizontalDir === 'arm-side' ? hand : horizontalDir === 'glove-side' ? -hand : 0
        // SVG y runs down: a drop falls below the spinless line, a ride stays above it
        const down = verticalShape === 'drop' ? 1 : verticalShape === 'ride' ? -1 : 0
        for (const t of [0.25, 0.5, 0.75, 1]) {
          const p = at(s, t)
          expect(sign(p.x - CX)).toBe(side)
          expect(sign(p.y - spinlessY(t))).toBe(down)
        }
        // every path falls the whole way from the mound; a ride falls less, it never climbs
        for (let i = 1; i <= 40; i++) expect(at(s, i / 40).y).toBeGreaterThan(at(s, (i - 1) / 40).y)
      })
    }
  }
})
