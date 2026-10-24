import type { RampName } from './foilRamp'

/*
  What a card is made of, as data. A CardMaterial is the finish a visitor can tune in
  the inspector; the pitch's identity (its accent triad and bezel ring) travels
  separately, because the finish is a preference and the identity is the record.

  Four named presets plus the base chrome the rest of the set wears. Every preset is
  the same material program with different knobs, so stacking finishes or switching
  presets never changes what the card says, only how its surface answers the light.
*/

export const FINISHES = [
  'hairline',
  'pillar',
  'crosshatch',
  'crackedIce',
  'glitter',
  'ripple',
  'catEye',
  'houndstooth',
] as const
export type FinishName = (typeof FINISHES)[number]

export type Coverage = 'full' | 'window' | 'frame'
export type PresetId = 'ember-chrome' | 'powder-refractor' | 'turquoise-archive' | 'quiet-ink-bone' | 'base-chrome'

export interface GlintSettings {
  intensity: number
  size: number
  density: number
}

export interface CardMaterial {
  preset: PresetId
  ramp: RampName
  /** the 1/1 register: ramp collapses to burnt heat, specular goes warm */
  ember: boolean
  coverage: Coverage
  /** 0 = off, 1 = full strength, combinable */
  finishes: Record<FinishName, number>
  /** 0..2 */
  exposure: number
  /** 0..1 how far the interference colour leans from the brand ramp toward a prism */
  spectral: number
  /** 0.5..2 multiplier on every micro-structure period */
  patternScale: number
  /** degrees, the hairline / crosshatch groove direction */
  patternAngle: number
  /** 0..1 specular lobe width */
  roughness: number
  /** 0..1 how much the dark stock itself answers the light */
  sheen: number
  glint: GlintSettings
  /** 0..1 the lamination gloss that passes over the media window */
  glaze: number
  /** 0..1 bevel and cut strength */
  depth: number
}

export const PRESET_LABELS: Record<PresetId, string> = {
  'ember-chrome': 'Ember Chrome',
  'powder-refractor': 'Powder Refractor',
  'turquoise-archive': 'Turquoise Archive',
  'quiet-ink-bone': 'Quiet Ink & Bone',
  'base-chrome': 'Base Chrome',
}

export const FINISH_LABELS: Record<FinishName, string> = {
  hairline: 'Brushed hairline',
  pillar: 'Pillar',
  crosshatch: 'Crosshatch',
  crackedIce: 'Cracked ice',
  glitter: 'Glitter',
  ripple: 'Ripple',
  catEye: 'Cat-eye',
  houndstooth: 'Houndstooth',
}

export const COVERAGE_LABELS: Record<Coverage, string> = {
  full: 'Full card',
  window: 'Illustration window',
  frame: 'Frame',
}

function finishes(on: Partial<Record<FinishName, number>>): Record<FinishName, number> {
  const all = {} as Record<FinishName, number>
  for (const name of FINISHES) all[name] = on[name] ?? 0
  return all
}

const COMMON = {
  coverage: 'full' as Coverage,
  patternScale: 1,
  patternAngle: 57,
  roughness: 0.35,
  sheen: 0.55,
  glint: { intensity: 0.5, size: 0.45, density: 0.5 },
  glaze: 0.35,
  depth: 0.8,
}

export const PRESETS: Record<PresetId, CardMaterial> = {
  'ember-chrome': {
    ...COMMON,
    preset: 'ember-chrome',
    // the brand ramp, not the lacquer: burnt orange holds the widest territory and
    // the powder-ice → cyan arc still arrives as the card turns. `ember` warms the
    // stock and the glints so the 1/1 stays the warm card in the case.
    ramp: 'brand',
    ember: true,
    finishes: finishes({ houndstooth: 1, hairline: 0.5 }),
    exposure: 1.1,
    spectral: 0.22,
    roughness: 0.3,
    glint: { intensity: 0.6, size: 0.4, density: 0.45 },
  },
  'powder-refractor': {
    ...COMMON,
    preset: 'powder-refractor',
    ramp: 'powder',
    ember: false,
    finishes: finishes({ pillar: 0.9, crackedIce: 0.6 }),
    exposure: 1,
    spectral: 0.5,
  },
  'turquoise-archive': {
    ...COMMON,
    preset: 'turquoise-archive',
    ramp: 'teal',
    ember: false,
    finishes: finishes({ crosshatch: 0.8, catEye: 0.5 }),
    exposure: 1,
    spectral: 0.45,
  },
  'quiet-ink-bone': {
    ...COMMON,
    preset: 'quiet-ink-bone',
    ramp: 'chrome',
    ember: false,
    finishes: finishes({ hairline: 0.25 }),
    exposure: 0.7,
    spectral: 0.12,
    roughness: 0.5,
    glint: { intensity: 0.2, size: 0.4, density: 0.3 },
    glaze: 0.2,
  },
  'base-chrome': {
    ...COMMON,
    preset: 'base-chrome',
    ramp: 'brand',
    ember: false,
    finishes: finishes({ hairline: 0.6, pillar: 0.4 }),
    exposure: 1,
    spectral: 0.4,
  },
}

/** The default finish a pitch wears, from its identity: the 1/1 is ember, the two
    throwback frames keep their uniforms, the rest of the set is base chrome. */
export function presetForEntry({ gold, finish }: { gold: boolean; finish?: 'powder' | 'teal' }): CardMaterial {
  if (gold) return PRESETS['ember-chrome']
  if (finish === 'powder') return PRESETS['powder-refractor']
  if (finish === 'teal') return PRESETS['turquoise-archive']
  return PRESETS['base-chrome']
}

/** The back of every card: ink and bone, calm, a faint hairline. */
export function backMaterial(): CardMaterial {
  return PRESETS['quiet-ink-bone']
}

const clamp01 = (v: number) => Math.min(1, Math.max(0, v))

/** Bring any patched material back inside the ranges the shader is tuned for. */
export function clampMaterial(m: CardMaterial): CardMaterial {
  const f = {} as Record<FinishName, number>
  for (const name of FINISHES) f[name] = clamp01(Number.isFinite(m.finishes[name]) ? m.finishes[name] : 0)
  return {
    ...m,
    finishes: f,
    exposure: Math.min(2, Math.max(0, m.exposure)),
    spectral: clamp01(m.spectral),
    patternScale: Math.min(2, Math.max(0.5, m.patternScale)),
    patternAngle: ((m.patternAngle % 180) + 180) % 180,
    roughness: clamp01(m.roughness),
    sheen: clamp01(m.sheen),
    glint: { intensity: clamp01(m.glint.intensity), size: clamp01(m.glint.size), density: clamp01(m.glint.density) },
    glaze: clamp01(m.glaze),
    depth: clamp01(m.depth),
  }
}

export type MaterialPatch = Partial<Omit<CardMaterial, 'finishes' | 'glint'>> & {
  finishes?: Partial<Record<FinishName, number>>
  glint?: Partial<GlintSettings>
}

/** A preset plus the visitor's adjustments, clamped. */
export function mergeMaterial(base: CardMaterial, patch: MaterialPatch): CardMaterial {
  return clampMaterial({
    ...base,
    ...patch,
    finishes: { ...base.finishes, ...(patch.finishes ?? {}) },
    glint: { ...base.glint, ...(patch.glint ?? {}) },
  })
}

/** Finish order as the shader's uFinish[8] array. */
export function finishVector(m: CardMaterial): Float32Array {
  return Float32Array.from(FINISHES.map((name) => m.finishes[name]))
}
