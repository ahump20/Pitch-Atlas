/*
  The foil ramps as data. One stop list per material, read by two consumers:

    · the CSS custom properties in src/index.css (--foil, --foil-type, --ember and the
      two throwback --card-foil ramps), which a test pins to rampToCss() so the
      stylesheet and the shader can never drift apart;
    · the 256×1 texture the card material samples for its thin-film colour.

  Nothing is generated at build time: the CSS strings are hand-kept in index.css and
  foilRamp.test.ts fails the moment either side moves without the other.

  The value curve is the whole look (see the long note above --foil in index.css):
  dark anchors, one narrow white specular, burnt orange holding the widest territory,
  the powder-ice → cyan arc opposite it, and the chromium greys that make the ramp
  read as metal. The CSS --foil anchors are lifted to #191b1f because that ramp is
  also clipped into display type over the page void; on the card the anchors go back
  to the mirror black (MIRROR_ANCHOR), which is what the material texture uses.
*/

export type RampStop = readonly [hex: string, pct: number]

export interface FoilRamp {
  /** the CSS gradient angle, degrees */
  angle: number
  stops: readonly RampStop[]
}

/** Electric Burnt Chrome palette tokens, mirrored from --ebc-* in index.css. */
export const EBC = {
  black: '#08090a',
  black2: '#0a0b0c',
  burnt3: '#140a05',
  burnt2: '#7e2909',
  orange: '#bf5700',
  warmHi: '#ffe9de',
  specular: '#fff3ec',
  ice: '#b9d4e5',
  powder: '#8fbad6',
  cyan: '#5fe0ea',
  cyan2: '#1f97a2',
  cyan3: '#274253',
  chrome3: '#2a3035',
  chrome2: '#6e757b',
  chrome1: '#a7adb0',
  seam: '#ff4d46',
} as const

/** The legibility anchor --foil uses in CSS (it is clipped into type over the void). */
export const TYPE_ANCHOR = '#191b1f'
/** The anchor the card material uses: the mirror at rest. */
export const MIRROR_ANCHOR = EBC.black

/** --foil: the brand refractor ramp. */
export const FOIL_RAMP: FoilRamp = {
  angle: 112,
  stops: [
    ['#191b1f', 0], ['#2a1608', 4], ['#7e2909', 9], ['#bf5700', 14], ['#bf5700', 19],
    ['#ffe9de', 24], ['#fff3ec', 26], ['#b9d4e5', 31], ['#8fbad6', 36], ['#5fe0ea', 42],
    ['#1f97a2', 47], ['#274253', 51], ['#191b1f', 56], ['#2a3035', 61], ['#6e757b', 66],
    ['#a7adb0', 70], ['#bf5700', 77], ['#bf5700', 84], ['#bf5700', 90], ['#7e2909', 95],
    ['#191b1f', 100],
  ],
}

/** --foil-type: the same order with its floor lifted to the chromium band. */
export const FOIL_TYPE_RAMP: FoilRamp = {
  angle: 112,
  stops: [
    ['#6e757b', 0], ['#bf5700', 5], ['#bf5700', 19],
    ['#ffe9de', 24], ['#fff3ec', 26], ['#b9d4e5', 31], ['#8fbad6', 36], ['#5fe0ea', 42],
    ['#57b3bc', 47], ['#6b8898', 51], ['#6e757b', 56], ['#7d848a', 61], ['#949a9f', 66],
    ['#a7adb0', 70], ['#bf5700', 77], ['#bf5700', 84], ['#bf5700', 95],
    ['#6e757b', 100],
  ],
}

/** --ember: the 1/1's lacquer, oxblood shoulders to one blown warm-white core. */
export const EMBER_RAMP: FoilRamp = {
  angle: 150,
  stops: [
    ['#2a1208', 0], ['#451c09', 9], ['#6b2a08', 18], ['#5c2408', 24], ['#8a3806', 30], ['#bf5700', 38],
    ['#bf5700', 44], ['#fff0e2', 50], ['#bf5700', 56],
    ['#bf5700', 62], ['#8a3806', 70], ['#5c2408', 78], ['#451c09', 88], ['#2a1208', 100],
  ],
}

/** .is-powder --card-foil: the powder-blue road uniform, cardinal red outlined in navy. */
export const POWDER_RAMP: FoilRamp = {
  angle: 112,
  stops: [
    ['#191b1f', 0], ['#1c0a10', 4], ['#6e0f22', 9], ['#c41e3a', 14], ['#c41e3a', 18],
    ['#f3dfe4', 22], ['#fff6f7', 24.5], ['#cfe3f6', 27.5], ['#8fbde8', 31], ['#7aade0', 36],
    ['#6ca0d8', 41], ['#0c2340', 45], ['#c41e3a', 48.5], ['#c41e3a', 55], ['#0c2340', 59],
    ['#191b1f', 63], ['#2a3035', 66], ['#6e757b', 69], ['#a7adb0', 72], ['#7aade0', 78],
    ['#0c2340', 82], ['#c41e3a', 86], ['#c41e3a', 91], ['#6e0f22', 95], ['#191b1f', 100],
  ],
}

/** .is-teal --card-foil: the black road throwback with turquoise, red and white trim. */
export const TEAL_RAMP: FoilRamp = {
  angle: 112,
  stops: [
    ['#0d0e10', 0], ['#16181b', 4], ['#7a1418', 9], ['#e43c40', 14], ['#e43c40', 19],
    ['#fbe4e4', 24], ['#ffffff', 26], ['#c9f0ed', 31], ['#00b2a9', 36], ['#00b2a9', 41],
    ['#0a3f3c', 45], ['#0d0e10', 49], ['#e43c40', 52], ['#0d0e10', 55], ['#16181b', 58],
    ['#2a3035', 62], ['#6e757b', 66], ['#a7adb0', 70], ['#00b2a9', 77], ['#0a3f3c', 81],
    ['#e43c40', 85], ['#e43c40', 90], ['#7a1418', 95], ['#0d0e10', 100],
  ],
}

/** The quiet register: the chromium ladder alone, one bone specular, no colour. */
export const CHROME_RAMP: FoilRamp = {
  angle: 112,
  stops: [
    [EBC.black, 0], [EBC.chrome3, 12], [EBC.chrome2, 24], [EBC.chrome1, 34], ['#f6f1e6', 40],
    [EBC.chrome1, 46], [EBC.chrome2, 56], [EBC.black, 64], [EBC.chrome3, 74], [EBC.chrome2, 84],
    [EBC.chrome3, 94], [EBC.black, 100],
  ],
}

export type RampName = 'brand' | 'ember' | 'powder' | 'teal' | 'chrome'

const BY_NAME: Record<RampName, FoilRamp> = {
  brand: FOIL_RAMP,
  ember: EMBER_RAMP,
  powder: POWDER_RAMP,
  teal: TEAL_RAMP,
  chrome: CHROME_RAMP,
}

/** The CSS string for a ramp, byte-for-byte what index.css should carry (modulo whitespace). */
export function rampToCss(ramp: FoilRamp): string {
  return `linear-gradient(${ramp.angle}deg, ${ramp.stops.map(([hex, pct]) => `${hex} ${pct}%`).join(', ')})`
}

/** The ramp a material samples: the type-legibility anchor goes back to the mirror. */
export function materialRamp(name: RampName): FoilRamp {
  const ramp = BY_NAME[name]
  return { ...ramp, stops: ramp.stops.map(([hex, pct]) => [hex === TYPE_ANCHOR ? MIRROR_ANCHOR : hex, pct] as const) }
}

export function hexToRgb(hex: string): [number, number, number] {
  const m = /^#?([0-9a-f]{6})$/i.exec(hex.trim())
  if (!m) return [128, 128, 128]
  const n = parseInt(m[1], 16)
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255]
}

/** Sample the ramp at a position 0..100 the way CSS does: linear in sRGB between stops. */
export function sampleRamp(ramp: FoilRamp, pct: number): [number, number, number] {
  const stops = ramp.stops
  if (pct <= stops[0][1]) return hexToRgb(stops[0][0])
  for (let i = 1; i < stops.length; i++) {
    const [hexB, b] = stops[i]
    if (pct <= b) {
      const [hexA, a] = stops[i - 1]
      const t = b === a ? 1 : (pct - a) / (b - a)
      const ca = hexToRgb(hexA)
      const cb = hexToRgb(hexB)
      return [0, 1, 2].map((k) => Math.round(ca[k] + (cb[k] - ca[k]) * t)) as [number, number, number]
    }
  }
  return hexToRgb(stops[stops.length - 1][0])
}

/** The ramp as RGBA bytes for a `size`×1 texture. */
export function rampToTexture(ramp: FoilRamp, size = 256): Uint8Array {
  const out = new Uint8Array(size * 4)
  for (let i = 0; i < size; i++) {
    const [r, g, b] = sampleRamp(ramp, (i / (size - 1)) * 100)
    out[i * 4] = r
    out[i * 4 + 1] = g
    out[i * 4 + 2] = b
    out[i * 4 + 3] = 255
  }
  return out
}
