import { describe, expect, it } from 'vitest'
import { CALLABLE, NEW_SCORE, addToScore, deal, judgeCalls, parseBest } from './callThePitch'

/*
  Call the pitch's rules: the deal covers the whole arsenal and all six spots,
  a spin read in the air counts double, swing is right only on "Your pitch",
  and the streak needs both calls right.
*/

const dice = (...rolls: number[]) => {
  let i = 0
  return () => rolls[i++ % rolls.length]
}

describe('deal', () => {
  it('reaches every pitch in the arsenal and every spot, never the plain lob', () => {
    const pitches = new Set<string>()
    const lobs = new Set<string>()
    for (let a = 0; a < 4; a++) for (let b = 0; b < 6; b++) {
      const d = deal(1, dice((a + 0.5) / 4, (b + 0.5) / 6, 0.3))
      pitches.add(d.pitch)
      lobs.add(d.lob)
    }
    expect([...pitches].sort()).toEqual([...CALLABLE].sort())
    expect(lobs.size).toBe(6)
    expect(pitches.has('lob')).toBe(false)
  })

  it('stays in range on a roll of 1 and starts the seams round the ball', () => {
    const d = deal(7, dice(0.9999999, 0.9999999, 0.5))
    expect(d.n).toBe(7)
    expect(d.pitch).toBe('sidespin')
    expect(d.lob).toBe('rainbow')
    expect(d.seam).toBeCloseTo(Math.PI, 6)
  })
})

describe('judging the calls', () => {
  const knuckler = { n: 1, pitch: 'knuckler' as const, lob: 'belt' as const, seam: 0 }

  it('pays double for a spin read in the air', () => {
    expect(judgeCalls(knuckler, { spin: 'knuckler', swing: 'swing', early: true }, true).points).toBe(3)
    expect(judgeCalls(knuckler, { spin: 'knuckler', swing: 'swing', early: false }, true).points).toBe(2)
  })

  it('makes swing right only on your pitch, and take right on everything else', () => {
    expect(judgeCalls(knuckler, { spin: 'backspin', swing: 'take' }, false)).toMatchObject({ spinRight: false, swingRight: true, points: 1 })
    expect(judgeCalls(knuckler, { spin: 'backspin', swing: 'swing' }, false)).toMatchObject({ swingRight: false, shouldSwing: false, points: 0 })
  })

  it('runs the streak on both calls right and breaks it on either wrong', () => {
    const both = judgeCalls(knuckler, { spin: 'knuckler', swing: 'swing' }, true)
    const half = judgeCalls(knuckler, { spin: 'topspin', swing: 'swing' }, true)
    const s1 = addToScore(NEW_SCORE, both)
    const s2 = addToScore(s1, both)
    const s3 = addToScore(s2, half)
    expect([s1.streak, s2.streak, s3.streak]).toEqual([1, 2, 0])
    expect(s3.best).toBe(2)
    expect(s3.dealt).toBe(3)
    expect(s3.points).toBe(2 + 2 + 1)
  })
})

describe('the stored best streak', () => {
  it('keeps only a sane whole number', () => {
    expect(parseBest('4')).toBe(4)
    expect(parseBest(null)).toBe(0)
    expect(parseBest('-2')).toBe(0)
    expect(parseBest('3.5')).toBe(0)
    expect(parseBest('lots')).toBe(0)
  })
})
