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

  it('clamps a remembered finish back into range', () => {
    writeFinishPref('slider', 'front', { ...PRESETS['base-chrome'], exposure: 40 })
    expect(readFinishPref('slider', 'front')?.exposure).toBe(2)
  })
})
