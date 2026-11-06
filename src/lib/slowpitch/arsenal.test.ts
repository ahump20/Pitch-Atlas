import { describe, expect, it } from 'vitest'
import { IN, PLATE } from './geometry'
import { knuckleCoefficients, solveLob, type LobParams } from './flight'
import { PITCH_KINDS, isPitchKind, seamFor, withPitch } from './arsenal'

/*
  The arsenal against the flight model: each pitch is a spin laid over a lob,
  and the spin has to bend the path the way the pitch is known for, measured
  against the same throw with no spin. The knuckler is aimed as if it had no
  seams, and the seams take it somewhere else.
*/

const BELT: LobParams = { apex: 9, land: 36, side: 0, rpm: 110, push: 0 }
const landIn = (z: number) => (z - PLATE.front) / IN

describe('withPitch', () => {
  it('leaves the lob alone as a plain lob', () => {
    expect(withPitch(BELT, 'lob')).toEqual(BELT)
  })

  it('keeps where the lob peaks and lands, and swaps the spin', () => {
    const top = withPitch(BELT, 'topspin')
    expect([top.apex, top.land, top.side]).toEqual([9, 36, 0])
    expect(top.push).toBe(180)
    expect(top.knuckle).toBeUndefined()
  })

  it('gives only the knuckler a seam force, starting where it is told', () => {
    const k = withPitch(BELT, 'knuckler', 1.5)
    expect(k.knuckle).toBeGreaterThan(0)
    expect(k.seam).toBe(1.5)
    for (const kind of PITCH_KINDS.filter((p) => p !== 'knuckler')) expect(withPitch(BELT, kind).knuckle).toBeUndefined()
  })

  it('knows its own pitch names', () => {
    expect(isPitchKind('knuckler')).toBe(true)
    expect(isPitchKind('screwball')).toBe(false)
    expect(isPitchKind(null)).toBe(false)
  })
})

describe('what each spin does to the same throw', () => {
  const flight = (kind: Parameters<typeof withPitch>[1]) => solveLob(withPitch(BELT, kind))

  it('backspin carries it deeper than no spin, topspin dives it short', () => {
    expect(flight('backspin').spinCarryIn).toBeGreaterThan(15)
    expect(flight('topspin').spinCarryIn).toBeLessThan(-15)
  })

  it('side spin moves it across the plate, not along it', () => {
    const f = flight('sidespin')
    expect(Math.abs(f.spinDriftIn)).toBeGreaterThan(15)
    expect(Math.abs(f.spinCarryIn)).toBeLessThan(3)
  })

  it('every spinning pitch still lands where it was aimed', () => {
    for (const kind of ['lob', 'backspin', 'topspin', 'sidespin'] as const) {
      const f = flight(kind)
      expect(f.converged).toBe(true)
      expect(f.knuckled).toBe(false)
      expect(landIn(f.land.z)).toBeCloseTo(36, 0)
      expect(f.land.x / IN).toBeCloseTo(0, 0)
    }
  })

  it('draws the no-spin ghost of the same throw from the same hand', () => {
    const f = flight('backspin')
    expect(f.ghost.length % 3).toBe(0)
    expect(f.ghost[0]).toBeCloseTo(f.positions[0], 5)
    expect(f.ghost[2]).toBeCloseTo(f.positions[2], 5)
    // backspin out-carries its ghost, so the ghost comes down first
    expect(f.ghost[f.ghost.length - 1]).toBeLessThan(f.land.z)
  })
})

describe('the knuckler', () => {
  const thrown = (n: number) => solveLob(withPitch(BELT, 'knuckler', seamFor(n)))

  it('is aimed true but lands off its spot, a different way each throw', () => {
    const misses = [0, 1, 2, 3, 4, 5].map((n) => {
      const f = thrown(n)
      expect(f.converged).toBe(true)
      expect(f.knuckled).toBe(true)
      expect(landIn(f.aim.z)).toBeCloseTo(36, 0)
      return [landIn(f.land.z) - 36, f.land.x / IN]
    })
    for (const [along, across] of misses) expect(Math.hypot(along, across)).toBeGreaterThan(3)
    // the misses scatter both ways, along and across
    expect(misses.some(([a]) => a > 0) && misses.some(([a]) => a < 0)).toBe(true)
    expect(misses.some(([, c]) => c > 0) && misses.some(([, c]) => c < 0)).toBe(true)
  })

  it('throws the same dance from the same seams', () => {
    expect(thrown(3).land).toEqual(thrown(3).land)
  })

  it('barely turns on the way in: under half a turn', () => {
    const f = thrown(0)
    expect((f.spinRate * f.duration) / (2 * Math.PI)).toBeLessThan(0.5)
  })

  it('pushes with the four-fold beat of the seams', () => {
    const [g0] = knuckleCoefficients(0.25, 0, 0)
    const [gq] = knuckleCoefficients(0.25, Math.PI / 8, 0)
    const [gh] = knuckleCoefficients(0.25, Math.PI / 2, 0)
    expect(g0).toBeCloseTo(0, 9)
    expect(gq).toBeCloseTo(0.25, 9)
    expect(gh).toBeCloseTo(0, 9)
  })

  it('never throws the next knuckler as a mirror of the last', () => {
    // the seam force repeats every quarter turn; a step that lands near half a beat flips the dance
    for (let n = 0; n < 8; n++) {
      const a = thrown(n)
      const b = thrown(n + 1)
      const mirrored = Math.abs(landIn(a.land.z) - 36 + (landIn(b.land.z) - 36)) < 2 && Math.abs(a.land.x + b.land.x) / IN < 2
      expect(mirrored).toBe(false)
    }
  })

  it('spreads its seam starts round the ball', () => {
    const seams = Array.from({ length: 12 }, (_, n) => seamFor(n))
    for (const s of seams) expect(s).toBeGreaterThanOrEqual(0)
    for (const s of seams) expect(s).toBeLessThan(2 * Math.PI)
    expect(new Set(seams.map((s) => s.toFixed(3))).size).toBe(12)
  })
})
