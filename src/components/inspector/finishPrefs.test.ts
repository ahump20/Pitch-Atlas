import { beforeEach, describe, expect, it } from 'vitest'
import { PRESETS } from '../refractor/material/materialPresets'
import { finishPrefKey, materialFor, readFinishPref, writeFinishPref } from './finishPrefs'

describe('finishPrefs', () => {
  beforeEach(() => window.localStorage.clear())

  it('remembers a finish per card and per face, and clears it', () => {
    const tuned = { ...PRESETS['powder-refractor'], exposure: 1.4 }
    writeFinishPref('twelve-six', 'front', tuned)
    expect(readFinishPref('twelve-six', 'front')?.exposure).toBe(1.4)
    expect(readFinishPref('twelve-six', 'back')).toBeNull()
    expect(materialFor('twelve-six', 'back', PRESETS['quiet-ink-bone']).preset).toBe('quiet-ink-bone')
    writeFinishPref('twelve-six', 'front', null)
    expect(readFinishPref('twelve-six', 'front')).toBeNull()
  })

  it('ignores anything that is not a material', () => {
    window.localStorage.setItem(finishPrefKey('four-seam', 'front'), '{"preset":"nope"}')
    expect(readFinishPref('four-seam', 'front')).toBeNull()
    window.localStorage.setItem(finishPrefKey('four-seam', 'front'), 'not json')
    expect(readFinishPref('four-seam', 'front')).toBeNull()
  })

  it('never lets an unknown ramp, coverage or number reach the shader', () => {
    window.localStorage.setItem(
      finishPrefKey('four-seam', 'front'),
      JSON.stringify({ ...PRESETS['powder-refractor'], ramp: 'rainbow', coverage: 'everywhere', exposure: 'loud', glint: 3, finishes: { pillar: 'max', glitter: 0.4 } }),
    )
    const m = readFinishPref('four-seam', 'front')
    expect(m?.ramp).toBe('powder')
    expect(m?.coverage).toBe('full')
    expect(m?.exposure).toBe(PRESETS['powder-refractor'].exposure)
    expect(m?.glint).toEqual(PRESETS['powder-refractor'].glint)
    expect(m?.finishes.pillar).toBe(PRESETS['powder-refractor'].finishes.pillar)
    expect(m?.finishes.glitter).toBe(0.4)
  })

  it('does not honour a preset name every object inherits', () => {
    for (const preset of ['constructor', 'toString', '__proto__', 'hasOwnProperty']) {
      window.localStorage.setItem(finishPrefKey('four-seam', 'front'), JSON.stringify({ preset, finishes: {} }))
      expect(readFinishPref('four-seam', 'front')).toBeNull()
    }
  })

  it('clamps a remembered finish back into range', () => {
    writeFinishPref('slider', 'front', { ...PRESETS['base-chrome'], exposure: 40 })
    expect(readFinishPref('slider', 'front')?.exposure).toBe(2)
  })
})
