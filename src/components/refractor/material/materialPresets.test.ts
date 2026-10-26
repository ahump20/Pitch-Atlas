import { describe, expect, it } from 'vitest'
import { backMaterial, clampMaterial, FINISHES, finishVector, mergeMaterial, PRESETS, presetForEntry } from './materialPresets'

describe('presetForEntry', () => {
  it('gives the 1/1 the ember register and keeps the gold name out of the material', () => {
    const m = presetForEntry({ gold: true })
    expect(m.preset).toBe('ember-chrome')
    expect(m.ember).toBe(true)
    expect(m.ramp).toBe('brand')
    expect(m.finishes.houndstooth).toBe(1)
  })
  it('keeps the two throwback uniforms', () => {
    expect(presetForEntry({ gold: false, finish: 'powder' }).preset).toBe('powder-refractor')
    expect(presetForEntry({ gold: false, finish: 'teal' }).preset).toBe('turquoise-archive')
  })
  it('dresses the rest of the set in base chrome on the brand ramp', () => {
    const m = presetForEntry({ gold: false })
    expect(m.preset).toBe('base-chrome')
    expect(m.ramp).toBe('brand')
    expect(m.ember).toBe(false)
  })
  it('the back is quiet ink and bone', () => {
    expect(backMaterial().preset).toBe('quiet-ink-bone')
    expect(backMaterial().exposure).toBeLessThan(1)
  })
})

describe('merge and clamp', () => {
  it('layers a patch over a preset and clamps every knob', () => {
    const m = mergeMaterial(PRESETS['base-chrome'], {
      exposure: 9,
      spectral: -1,
      finishes: { glitter: 4, hairline: 0.3 },
      glint: { density: 2 },
      patternAngle: 400,
    })
    expect(m.exposure).toBe(2)
    expect(m.spectral).toBe(0)
    expect(m.finishes.glitter).toBe(1)
    expect(m.finishes.hairline).toBe(0.3)
    expect(m.finishes.pillar).toBe(PRESETS['base-chrome'].finishes.pillar)
    expect(m.glint.density).toBe(1)
    expect(m.glint.size).toBe(PRESETS['base-chrome'].glint.size)
    expect(m.patternAngle).toBe(40)
  })
  it('never lets a non-number through to the shader', () => {
    const broken = { ...PRESETS['base-chrome'], finishes: { ...PRESETS['base-chrome'].finishes, ripple: Number.NaN } }
    expect(clampMaterial(broken).finishes.ripple).toBe(0)
  })
  it('orders the finish vector the way the shader indexes it', () => {
    const v = finishVector(PRESETS['ember-chrome'])
    expect(v.length).toBe(8)
    expect(v[FINISHES.indexOf('houndstooth')]).toBe(1)
    expect(v[FINISHES.indexOf('hairline')]).toBe(0.5)
  })
})
