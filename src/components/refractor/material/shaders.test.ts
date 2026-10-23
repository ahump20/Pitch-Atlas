import { describe, expect, it } from 'vitest'
import { MATERIAL_FRAG } from './shaders'

/*
  jsdom has no WebGL, so the material's pixels are checked by render; this pins the one
  rule a render cannot keep on its own: the finishes are laid out on the card, not on the
  pixel. A 1500px export of a card tuned at 486px once carried four times its pillar
  columns, because the columns, the ice cells, the glitter sites, the ripple and the
  brushed streak were all measured in pixels.
*/
const finishBlock = MATERIAL_FRAG.slice(
  MATERIAL_FRAG.indexOf('// ── micro-structure'),
  MATERIAL_FRAG.indexOf('float smoothLobe'),
)

describe('the finishes', () => {
  it('lay out on a 360px card and enlarge with a bigger one, so a larger or exported card keeps its finish', () => {
    expect(MATERIAL_FRAG).toMatch(/vec2 pf = p \* min\(1\.0, 360\.0 \/ uSize\.x\);/)
  })

  it('never read the raw pixel position, except to make the card-relative one', () => {
    // allowed: the line that makes it, the houndstooth (already a fixed 52 cells across the
    // card at any size) and the cat-eye, which takes only a direction from the centre
    const allowed = ['vec2 pf = p *', 'p / (uSize.x', 'normalize(p - hsz']
    const raw = [...finishBlock.matchAll(/(?<![\w.])p(?!\w)/g)].map((m) => finishBlock.slice(m.index - 14, m.index + 14))
    expect(raw.filter((context) => !allowed.some((a) => context.includes(a)))).toEqual([])
  })
})
