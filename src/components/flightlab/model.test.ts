import { describe, expect, it } from 'vitest'
import { DEFAULT_STANCE, IN } from '../../lib/slowpitch'
import { buildLabModel, defaultLobParams, heightLabel, lookForRange, signed } from './model'
import { DEFAULT_SETTINGS, parseSettings } from './labSettings'

/*
  The lab model against the original build's own readout for the measured
  batter under USSSA (its 1440 px screenshot): belt-high lob, "Your pitch",
  look for 6–37 in, barrel 44 in high and 31 in out front, over the plate at
  20 in, the four landmarks, and the 32 in compare.
*/

const base = () =>
  buildLabModel({ rule: 'usssa', stance: { ...DEFAULT_STANCE }, compareIn: 32, params: defaultLobParams(), selected: 'belt' })

describe('flight lab model', () => {
  it('reads the measured batter the way the original did', () => {
    const m = base()
    expect(m.selected.reading.verdict.word).toBe('Your pitch')
    expect(lookForRange(m)).toBe('6–37')
    expect(Math.round(m.selected.reading.barrel!.heightIn)).toBe(44)
    expect(Math.round(m.selected.reading.barrel!.outFrontIn)).toBe(31)
    expect(Math.round(m.selected.reading.overPlateIn)).toBe(20)
    expect([m.zone.top, m.marks.chest, m.marks.belt, m.zone.bottom].map((y) => Math.round(y / IN))).toEqual([49, 41, 31, 15])
    expect(signed(m.comparison!.reachGapIn)).toBe('+2.0')
    expect(signed(m.comparison!.matchShiftIn)).toBe('+2.4')
  })

  it('gives every example lob the short verdict the original listed', () => {
    const shorts = base().lobs.map((l) => l.reading.verdict.short)
    expect(shorts).toEqual(['Your pitch', 'Your pitch', 'Too high', 'Too high', 'Your pitch', 'Illegal'])
  })

  it('drops the strike lane under Senior rules and keeps the look-for window', () => {
    const m = buildLabModel({ rule: 'senior', stance: { ...DEFAULT_STANCE }, compareIn: 0, params: defaultLobParams(), selected: 'belt' })
    expect(m.laneZ).toBeNull()
    expect(m.comparison).toBeNull()
    expect(m.reachOld).toBe(0)
    expect(m.hotZ).not.toBeNull()
  })

  it('formats heights and signed readouts without stray symbols', () => {
    expect(heightLabel(62)).toBe('5 ft 2 in')
    expect(signed(-0.4)).toBe('-0.4')
    expect(signed(0.01)).toBe('+0.0')
  })
})

describe('flight lab settings', () => {
  it('falls back to the measured batter on missing or broken storage', () => {
    expect(parseSettings(null)).toEqual(DEFAULT_SETTINGS)
    expect(parseSettings('{not json')).toEqual(DEFAULT_SETTINGS)
  })

  it('keeps only values the controls can show', () => {
    expect(parseSettings(JSON.stringify({ heightIn: 70, toesIn: 99, box: 'side', compareIn: 31 }))).toEqual({
      heightIn: 70,
      toesIn: DEFAULT_SETTINGS.toesIn,
      box: DEFAULT_SETTINGS.box,
      compareIn: 31,
    })
  })
})
