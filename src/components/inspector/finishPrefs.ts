import type { RampName } from '../refractor/material/foilRamp'
import {
  clampMaterial,
  FINISHES,
  PRESETS,
  type CardMaterial,
  type Coverage,
  type FinishName,
  type PresetId,
} from '../refractor/material/materialPresets'

/*
  The visitor's finish for one face of one card, kept on the device. A preference,
  never a record: the pitch's own preset is what every page surface shows; the
  inspector alone reads these.

  What comes back out of storage is untrusted, so it is rebuilt field by field on
  top of its own preset: a value of the wrong kind falls back to the preset's, an
  unknown ramp or coverage never reaches the shader, and a preset name only counts
  if it is one of ours (not a key every object inherits).
*/
export type FinishFace = 'front' | 'back'

export const FINISH_PREF_PREFIX = 'pa:finish:'

const RAMPS: readonly RampName[] = ['brand', 'ember', 'powder', 'teal', 'chrome']
const COVERAGES: readonly Coverage[] = ['full', 'window', 'frame']

export function finishPrefKey(slug: string, face: FinishFace): string {
  return `${FINISH_PREF_PREFIX}${slug}:${face}`
}

const isRecord = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null && !Array.isArray(v)
const num = (v: unknown, fallback: number) => (typeof v === 'number' && Number.isFinite(v) ? v : fallback)
const oneOf = <T extends string>(v: unknown, allowed: readonly T[], fallback: T): T =>
  typeof v === 'string' && (allowed as readonly string[]).includes(v) ? (v as T) : fallback

/** A stored value rebuilt as a material, or null when it names no preset of ours. */
export function materialFromStorage(value: unknown): CardMaterial | null {
  if (!isRecord(value)) return null
  const { preset } = value
  if (typeof preset !== 'string' || !Object.hasOwn(PRESETS, preset)) return null
  const base = PRESETS[preset as PresetId]
  const storedFinishes = isRecord(value.finishes) ? value.finishes : {}
  const finishes = {} as Record<FinishName, number>
  for (const name of FINISHES) finishes[name] = num(storedFinishes[name], base.finishes[name])
  const glint = isRecord(value.glint) ? value.glint : {}
  return clampMaterial({
    preset: base.preset,
    ramp: oneOf(value.ramp, RAMPS, base.ramp),
    ember: typeof value.ember === 'boolean' ? value.ember : base.ember,
    coverage: oneOf(value.coverage, COVERAGES, base.coverage),
    finishes,
    exposure: num(value.exposure, base.exposure),
    spectral: num(value.spectral, base.spectral),
    patternScale: num(value.patternScale, base.patternScale),
    patternAngle: num(value.patternAngle, base.patternAngle),
    roughness: num(value.roughness, base.roughness),
    sheen: num(value.sheen, base.sheen),
    glint: {
      intensity: num(glint.intensity, base.glint.intensity),
      size: num(glint.size, base.glint.size),
      density: num(glint.density, base.glint.density),
    },
    glaze: num(value.glaze, base.glaze),
    depth: num(value.depth, base.depth),
  })
}

export function readFinishPref(slug: string, face: FinishFace): CardMaterial | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = window.localStorage.getItem(finishPrefKey(slug, face))
    if (!raw) return null
    return materialFromStorage(JSON.parse(raw))
  } catch {
    return null
  }
}

export function writeFinishPref(slug: string, face: FinishFace, material: CardMaterial | null): void {
  if (typeof window === 'undefined') return
  try {
    if (material) window.localStorage.setItem(finishPrefKey(slug, face), JSON.stringify(material))
    else window.localStorage.removeItem(finishPrefKey(slug, face))
  } catch {
    /* private mode: the session keeps the choice in memory */
  }
}

/** The face's material: the remembered finish if there is one, else the given default. */
export function materialFor(slug: string, face: FinishFace, fallback: CardMaterial): CardMaterial {
  return readFinishPref(slug, face) ?? fallback
}
