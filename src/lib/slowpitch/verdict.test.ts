import { describe, it, expect } from 'vitest'
import { EXAMPLE_LOBS } from '../../data/softball/flightLab'
import { DEFAULT_STANCE, type Stance } from './batter'
import { solveLob } from './flight'
import { judgePitch, verdictFor, type PitchCall, type BatterContact } from './verdict'
import type { RuleKey } from './zone'

/*
  Pinned to the original Flight Lab. The expected values come from running the
  original published build's own model functions in Node (sliced from its
  bundle, outside this repo) for each rulebook x example lob x batter, with one
  deliberate change: USA Softball's adult arc ceiling is 10 ft (its 2026 Rule
  6C Sec. 3 H), where the original used 12 ft. That moves exactly one verdict
  (the USA rainbow becomes an illegal arc).

  The port reproduces the original to float precision. The table is rounded to
  two decimals, so lengths are checked to within 0.05 in.
*/

const BATTERS: Record<string, Stance> = {
  default: DEFAULT_STANCE,
  h66: { ...DEFAULT_STANCE, heightIn: 66 },
  h54: { ...DEFAULT_STANCE, heightIn: 54 },
  front: { ...DEFAULT_STANCE, box: 'front' },
  back: { ...DEFAULT_STANCE, box: 'back' },
  toes10: { ...DEFAULT_STANCE, toesIn: 10 },
  toes34: { ...DEFAULT_STANCE, toesIn: 34 },
}

const lob = (key: string) => {
  const found = EXAMPLE_LOBS.find((l) => l.key === key)
  if (!found) throw new Error(`no lob ${key}`)
  return solveLob(found.params.value)
}

type Row = [
  batter: string,
  rule: RuleKey,
  lob: string,
  headline: string,
  call: PitchCall['call'],
  lookFor: [number, number] | null,
  barrel: [heightIn: number, outFrontIn: number] | null,
  strikeWindow: [number, number],
]

// prettier-ignore
const ROWS: Row[] = [
  ["default", "usssa", "belt", "Your pitch", "strike", [6.47,37.18], [43.83,30.99], [14.85,99.2]],
  ["default", "usssa", "low", "Your pitch", "strike", [23.52,73.13], [29.17,30.91], [22.04,144.18]],
  ["default", "usssa", "deep", "Strike · over your shoulders", "strike", [9.02,42.48], [64.13,31.63], [16.2,105.45]],
  ["default", "usssa", "inside", "Strike · up at your shoulders", "strike", [6.47,37.18], [47.47,37.76], [14.85,99.2]],
  ["default", "usssa", "flat", "Your pitch", "strike", [26.63,78.99], [40.19,31.4], [23.4,152.17]],
  ["default", "usssa", "rainbow", "Illegal arc · too high", "illegal", [-3.53,18.13], [50.5,30.84], [10.19,76.14]],
  ["default", "usa", "belt", "Your pitch", "strike", [6.47,37.18], [43.83,30.99], [14.85,99.2]],
  ["default", "usa", "low", "Your pitch", "strike", [23.52,73.13], [29.17,30.91], [22.04,144.18]],
  ["default", "usa", "deep", "Strike · over your shoulders", "strike", [9.02,42.48], [64.13,31.63], [16.2,105.45]],
  ["default", "usa", "inside", "Strike · up at your shoulders", "strike", [6.47,37.18], [47.47,37.76], [14.85,99.2]],
  ["default", "usa", "flat", "Your pitch", "strike", [26.63,78.99], [40.19,31.4], [23.4,152.17]],
  ["default", "usa", "rainbow", "Illegal arc · too high", "illegal", [-3.53,18.13], [50.5,30.84], [10.19,76.14]],
  ["default", "senior", "belt", "Your pitch", "strike", [6.47,37.18], [43.83,30.99], [0,41]],
  ["default", "senior", "low", "Your pitch", "strike", [23.52,73.13], [29.17,30.91], [0,41]],
  ["default", "senior", "deep", "Ball · past the mat", "ball", [9.02,42.48], [64.13,31.63], [0,41]],
  ["default", "senior", "inside", "Strike · up at your shoulders", "strike", [6.47,37.18], [47.47,37.76], [0,41]],
  ["default", "senior", "flat", "Ball · past the mat", "ball", [26.63,78.99], [40.19,31.4], [0,41]],
  ["default", "senior", "rainbow", "Strike · over your shoulders", "strike", [-3.53,18.13], [50.5,30.84], [0,41]],
  ["h66", "usssa", "belt", "Your pitch", "strike", [6.47,39.94], [45.12,33.35], [16.41,104.74]],
  ["h66", "usssa", "low", "Your pitch", "strike", [25.49,79.82], [30.09,33.28], [24.87,155.82]],
  ["h66", "usssa", "inside", "Strike · up at your shoulders", "strike", [6.47,39.94], [48.57,39.86], [16.41,104.74]],
  ["h66", "usa", "belt", "Your pitch", "strike", [6.47,39.94], [45.12,33.35], [16.41,104.74]],
  ["h66", "usa", "low", "Your pitch", "strike", [25.49,79.82], [30.09,33.28], [24.87,155.82]],
  ["h66", "usa", "inside", "Strike · up at your shoulders", "strike", [6.47,39.94], [48.57,39.86], [16.41,104.74]],
  ["h66", "senior", "belt", "Your pitch", "strike", [6.47,39.94], [45.12,33.35], [0,41]],
  ["h66", "senior", "low", "Your pitch", "strike", [25.49,79.82], [30.09,33.28], [0,41]],
  ["h66", "senior", "inside", "Strike · up at your shoulders", "strike", [6.47,39.94], [48.57,39.86], [0,41]],
  ["h54", "usssa", "belt", "Strike · up at your shoulders", "strike", [6.08,31.67], [41.15,26.11], [11.75,86.56]],
  ["h54", "usssa", "low", "Your pitch", "strike", [20.37,61.32], [27.25,26.03], [18.27,123.89]],
  ["h54", "usssa", "inside", "Strike · over your shoulders", "strike", [6.08,31.67], [45.22,33.54], [11.74,86.56]],
  ["h54", "usa", "belt", "Strike · up at your shoulders", "strike", [6.08,31.67], [41.15,26.11], [11.75,86.56]],
  ["h54", "usa", "low", "Your pitch", "strike", [20.37,61.32], [27.25,26.03], [18.27,123.89]],
  ["h54", "usa", "inside", "Strike · over your shoulders", "strike", [6.08,31.67], [45.22,33.54], [11.74,86.56]],
  ["h54", "senior", "belt", "Strike · up at your shoulders", "strike", [6.08,31.67], [41.15,26.11], [0,41]],
  ["h54", "senior", "low", "Your pitch", "strike", [20.37,61.32], [27.25,26.03], [0,41]],
  ["h54", "senior", "inside", "Strike · over your shoulders", "strike", [6.08,31.67], [45.22,33.54], [0,41]],
  ["front", "usssa", "belt", "Strike · over your shoulders", "strike", [-9.67,21.04], [52.37,47.25], [14.85,99.2]],
  ["front", "usssa", "low", "Your pitch", "strike", [7.77,56.98], [35.3,47.18], [22.04,144.18]],
  ["front", "usssa", "inside", "Strike · over your shoulders", "strike", [-9.67,21.04], [55.62,53.76], [14.85,99.2]],
  ["front", "usa", "belt", "Strike · over your shoulders", "strike", [-9.67,21.04], [52.37,47.25], [14.85,99.2]],
  ["front", "usa", "low", "Your pitch", "strike", [7.77,56.98], [35.3,47.18], [22.04,144.18]],
  ["front", "usa", "inside", "Strike · over your shoulders", "strike", [-9.67,21.04], [55.62,53.76], [14.85,99.2]],
  ["front", "senior", "belt", "Strike · over your shoulders", "strike", [-9.67,21.04], [52.37,47.25], [0,41]],
  ["front", "senior", "low", "Your pitch", "strike", [7.77,56.98], [35.3,47.18], [0,41]],
  ["front", "senior", "inside", "Strike · over your shoulders", "strike", [-9.67,21.04], [55.62,53.76], [0,41]],
  ["back", "usssa", "belt", "Your pitch", "strike", [22.22,52.93], [34.66,14.72], [14.85,99.2]],
  ["back", "usssa", "low", "Strike · at your knees", "strike", [39.66,89.27], [22.62,14.65], [22.04,144.18]],
  ["back", "usssa", "inside", "Your pitch", "strike", [22.22,52.93], [38.71,21.77], [14.85,99.2]],
  ["back", "usa", "belt", "Your pitch", "strike", [22.22,52.93], [34.66,14.72], [14.85,99.2]],
  ["back", "usa", "low", "Strike · at your knees", "strike", [39.66,89.27], [22.62,14.65], [22.04,144.18]],
  ["back", "usa", "inside", "Your pitch", "strike", [22.22,52.93], [38.71,21.77], [14.85,99.2]],
  ["back", "senior", "belt", "Your pitch", "strike", [22.22,52.93], [34.66,14.72], [0,41]],
  ["back", "senior", "low", "Strike · at your knees", "strike", [39.66,89.27], [22.62,14.65], [0,41]],
  ["back", "senior", "inside", "Your pitch", "strike", [22.22,52.93], [38.71,21.77], [0,41]],
  ["toes10", "usssa", "belt", "Strike · over your shoulders", "strike", null, [49.25,41.16], [14.85,99.2]],
  ["toes10", "usssa", "low", "Your pitch", "strike", null, [33.07,41.12], [22.04,144.18]],
  ["toes10", "usssa", "inside", "Strike · jams you", "strike", null, [50.94,44.43], [14.85,99.2]],
  ["toes10", "usa", "belt", "Strike · over your shoulders", "strike", null, [49.25,41.16], [14.85,99.2]],
  ["toes10", "usa", "low", "Your pitch", "strike", null, [33.07,41.12], [22.04,144.18]],
  ["toes10", "usa", "inside", "Strike · jams you", "strike", null, [50.94,44.43], [14.85,99.2]],
  ["toes10", "senior", "belt", "Strike · over your shoulders", "strike", null, [49.25,41.16], [0,41]],
  ["toes10", "senior", "low", "Your pitch", "strike", null, [33.07,41.12], [0,41]],
  ["toes10", "senior", "inside", "Strike · jams you", "strike", null, [50.94,44.43], [0,41]],
  ["toes34", "usssa", "belt", "Strike · off the end", "strike", null, [26.68,1.42], [14.85,99.2]],
  ["toes34", "usssa", "low", "Strike · off the end", "strike", null, [16.97,1.42], [22.04,144.18]],
  ["toes34", "usssa", "inside", "Your pitch", "strike", null, [39.9,23.87], [14.85,99.2]],
  ["toes34", "usa", "belt", "Strike · off the end", "strike", null, [26.68,1.42], [14.85,99.2]],
  ["toes34", "usa", "low", "Strike · off the end", "strike", null, [16.97,1.42], [22.04,144.18]],
  ["toes34", "usa", "inside", "Your pitch", "strike", null, [39.9,23.87], [14.85,99.2]],
  ["toes34", "senior", "belt", "Strike · off the end", "strike", null, [26.68,1.42], [0,41]],
  ["toes34", "senior", "low", "Strike · off the end", "strike", null, [16.97,1.42], [0,41]],
  ["toes34", "senior", "inside", "Your pitch", "strike", null, [39.9,23.87], [0,41]],
]

describe('judgePitch, pinned to the original build', () => {
  for (const [batter, rule, key, headline, call, hot, barrel, window] of ROWS) {
    it(`${batter} · ${rule} · ${key}: ${headline}`, () => {
      const r = judgePitch(lob(key), rule, BATTERS[batter])
      expect(r.verdict.word).toBe(headline)
      expect(r.call.call).toBe(call)
      if (hot === null) expect(r.lookFor.hot).toBeNull()
      else {
        expect(r.lookFor.hot![0]).toBeCloseTo(hot[0], 1)
        expect(r.lookFor.hot![1]).toBeCloseTo(hot[1], 1)
      }
      if (barrel === null) expect(r.barrel).toBeNull()
      else {
        expect(r.barrel!.heightIn).toBeCloseTo(barrel[0], 1)
        expect(r.barrel!.outFrontIn).toBeCloseTo(barrel[1], 1)
      }
      expect(r.strikeWindowIn[0]).toBeCloseTo(window[0], 1)
      expect(r.strikeWindowIn[1]).toBeCloseTo(window[1], 1)
    })
  }
})

describe('the live app at its defaults (USSSA, belt-high lob)', () => {
  const r = judgePitch(lob('belt'), 'usssa', DEFAULT_STANCE)

  it('headlines "Your pitch"', () => {
    expect(r.verdict.word).toBe('Your pitch')
    expect(r.verdict.short).toBe('Your pitch')
  })

  it('says "Look for 6–37 in past the front of the plate"', () => {
    expect(r.lookFor.hot!.map(Math.round)).toEqual([6, 37])
  })

  it('meets it 44 in high, 31 in out front, and it crosses the plate 20 in high', () => {
    expect(Math.round(r.barrel!.heightIn)).toBe(44)
    expect(Math.round(r.barrel!.outFrontIn)).toBe(31)
    expect(Math.round(r.overPlateIn)).toBe(20)
  })

  it('carries the call details the page reads', () => {
    expect(r.call.arcLegal).toBe(true)
    expect(r.apexFt).toBeCloseTo(9, 3)
    expect(r.call.depthMarginIn).toBeCloseTo(21.146, 2)
    expect(r.call.sideMarginIn).toBeCloseTo(10.41, 2)
    expect(r.lookFor.warm![0]).toBeCloseTo(-6.52, 2)
    expect(r.lookFor.warm![1]).toBeCloseTo(45.055, 2)
    expect(r.fallingAngleDeg).toBeCloseTo(32.653, 2)
  })
})

describe('verdict words', () => {
  const contact = (kind: BatterContact['kind'], y = 1): BatterContact => ({
    contact: { x: 0, y, z: 0, forward: 0, angleDeg: 0 },
    lateral: 1,
    vertical: 1,
    score: 1,
    kind,
  })
  const call = (over: Partial<PitchCall>): PitchCall => ({
    arcLegal: true,
    arcWhy: 'ok',
    strike: true,
    call: 'strike',
    miss: 'none',
    lane: { min: 0, max: 0 },
    depthMarginIn: 0,
    sideMarginIn: 0,
    ...over,
  })

  it('names an illegal arc before anything else', () => {
    expect(verdictFor(call({ call: 'illegal', arcWhy: 'flat' }), contact('pitch'), 1, 'usssa').word).toBe('Illegal arc · too flat')
    expect(verdictFor(call({ call: 'illegal', arcWhy: 'high' }), contact('pitch'), 1, 'usssa').short).toBe('Illegal')
  })

  it('reads a ball against the zone, or against the mat for Senior', () => {
    expect(verdictFor(call({ call: 'ball', miss: 'short' }), contact('pitch'), 1, 'usssa').word).toBe('Ball · under your knees')
    expect(verdictFor(call({ call: 'ball', miss: 'long' }), contact('pitch'), 1, 'senior').word).toBe('Ball · past the mat')
    expect(verdictFor(call({ call: 'ball', miss: 'inside' }), contact('pitch'), 1, 'senior').word).toBe('Ball · off the mat')
  })

  it('splits "too high" at the shoulder', () => {
    expect(verdictFor(call({}), contact('high', 2), 1, 'usa').word).toBe('Strike · over your shoulders')
    expect(verdictFor(call({}), contact('high', 0.5), 1, 'usa').word).toBe('Strike · up at your shoulders')
  })
})
