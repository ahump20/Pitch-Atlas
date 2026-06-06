import { describe, expect, it } from 'vitest'
import { REPERTOIRE } from './repertoire'

function entry(id: string) {
  const found = REPERTOIRE.find((pitch) => pitch.id === id)
  if (!found) throw new Error(`Missing repertoire entry: ${id}`)
  return found
}

describe('repertoire grip cues', () => {
  it('keeps changeup and split-finger visual tells separate', () => {
    expect(entry('straight-three-finger-changeup').plain).toContain('three close fingers')
    expect(entry('circle-changeup').plain).toContain('visible thumb-index circle')
    expect(entry('palmball').plain).toContain('four fingers together')
    expect(entry('splitter').grip.value).toContain('outside the seam tracks')
  })
})
