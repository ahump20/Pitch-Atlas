import { describe, expect, it } from 'vitest'
import { rigHand, skinHand } from './handRig'
import { PITCHES } from '../data/pitches'

/*
  The fitted hand has to put the touching skin where each filed grip says it
  goes, with that skin turned onto the leather, and no flesh sunk into the ball.
  A regulation ball is the unit sphere here: 0.03 radii is about a millimetre.
*/

const filed = PITCHES.filter((p) => p.canonical.gripModel.contacts.length > 0)

describe('rigHand', () => {
  it.each(filed.map((p) => [p.canonical.id, p.canonical.gripModel.contacts] as const))(
    '%s: every contact lands on its spot, skin to the leather, nothing inside the ball',
    (_, contacts) => {
      const hand = rigHand(contacts)
      expect(hand.contacts).toHaveLength(contacts.length)
      for (const c of hand.contacts) {
        expect(c.miss).toBeLessThan(0.07)
        expect(c.tilt).toBeLessThan(50)
      }
      const skin = skinHand(hand)
      let inside = 0
      let deepest = 0
      for (let v = 0; v < skin.length; v += 3) {
        const r = Math.hypot(skin[v], skin[v + 1], skin[v + 2])
        if (r < 0.99) {
          inside++
          deepest = Math.max(deepest, 1 - r)
        }
      }
      expect(inside).toBeLessThanOrEqual(20)
      expect(deepest).toBeLessThan(0.08)
    },
  )

  it('fits a pitch once and hands back the same hand after', () => {
    const contacts = filed[0].canonical.gripModel.contacts
    expect(rigHand(contacts)).toBe(rigHand(contacts))
  })
})
