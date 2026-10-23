import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'
import {
  EBC,
  EMBER_RAMP,
  FOIL_RAMP,
  FOIL_TYPE_RAMP,
  MIRROR_ANCHOR,
  POWDER_RAMP,
  TEAL_RAMP,
  TYPE_ANCHOR,
  materialRamp,
  rampToCss,
  rampToTexture,
  sampleRamp,
} from './foilRamp'

/*
  The stylesheet and the shader read one stop list. These tests pin the CSS custom
  properties in index.css to rampToCss() so neither can move without the other, and
  check the texture the material samples is the same ramp.
*/

const css = readFileSync(resolve(process.cwd(), 'src/index.css'), 'utf8')
const squash = (s: string) => s.replace(/\s+/g, '')
/** Every regex metacharacter escaped, backslash included, so a selector matches literally. */
const escapeRegExp = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

function cssVar(name: string): string {
  const m = new RegExp(`${name}:\\s*(linear-gradient\\([^;]*\\));`).exec(css)
  if (!m) throw new Error(`${name} not found in index.css`)
  return m[1]
}

function cardFoil(selector: string): string {
  const m = new RegExp(`${escapeRegExp(selector)}\\s*\\{[^}]*?--card-foil:\\s*(linear-gradient\\([^;]*\\));`).exec(css)
  if (!m) throw new Error(`${selector} --card-foil not found in index.css`)
  return m[1]
}

describe('foil ramps match the stylesheet', () => {
  it('--foil is the brand ramp', () => {
    expect(squash(cssVar('--foil'))).toBe(squash(rampToCss(FOIL_RAMP)))
  })
  it('--foil-type is the type ramp', () => {
    expect(squash(cssVar('--foil-type'))).toBe(squash(rampToCss(FOIL_TYPE_RAMP)))
  })
  it('--ember is the ember ramp', () => {
    expect(squash(cssVar('--ember'))).toBe(squash(rampToCss(EMBER_RAMP)))
  })
  it('the two throwback frames carry the powder and teal ramps', () => {
    expect(squash(cardFoil('.rfx-card.is-powder'))).toBe(squash(rampToCss(POWDER_RAMP)))
    expect(squash(cardFoil('.rfx-card.is-teal'))).toBe(squash(rampToCss(TEAL_RAMP)))
  })
  it('the palette tokens match --ebc-*', () => {
    const pairs: Array<[keyof typeof EBC, string]> = [
      ['black', 'ebc-black'], ['black2', 'ebc-black-2'], ['burnt3', 'ebc-burnt-3'], ['burnt2', 'ebc-burnt-2'],
      ['orange', 'ebc-orange'], ['warmHi', 'ebc-warm-hi'], ['specular', 'ebc-specular'], ['ice', 'ebc-ice'],
      ['powder', 'ebc-powder'], ['cyan', 'ebc-cyan'], ['cyan2', 'ebc-cyan-2'], ['cyan3', 'ebc-cyan-3'],
      ['chrome3', 'ebc-chrome-3'], ['chrome2', 'ebc-chrome-2'], ['chrome1', 'ebc-chrome-1'], ['seam', 'ebc-seam'],
    ]
    for (const [key, token] of pairs) {
      const m = new RegExp(`--${token}:\\s*(#[0-9a-f]{6})`).exec(css)
      expect(m?.[1], token).toBe(EBC[key])
    }
  })
})

describe('the material texture', () => {
  it('puts the mirror black where the type ramp lifts its anchors', () => {
    const brand = materialRamp('brand')
    expect(brand.stops.some(([hex]) => hex === TYPE_ANCHOR)).toBe(false)
    expect(brand.stops[0][0]).toBe(MIRROR_ANCHOR)
    expect(brand.stops.length).toBe(FOIL_RAMP.stops.length)
  })
  it('samples the stops exactly and interpolates between them', () => {
    expect(sampleRamp(FOIL_RAMP, 14)).toEqual([0xbf, 0x57, 0x00])
    expect(sampleRamp(FOIL_RAMP, 26)).toEqual([0xff, 0xf3, 0xec])
    const mid = sampleRamp(EMBER_RAMP, 47) // between #bf5700 at 44 and #fff0e2 at 50
    expect(mid[0]).toBeGreaterThan(0xbf)
    expect(mid[1]).toBeGreaterThan(0x57)
  })
  it('fills a 256×1 RGBA texture end to end', () => {
    const tex = rampToTexture(materialRamp('ember'))
    expect(tex.length).toBe(256 * 4)
    expect([tex[0], tex[1], tex[2], tex[3]]).toEqual([0x2a, 0x12, 0x08, 255])
    expect(tex[255 * 4 + 3]).toBe(255)
  })
})
