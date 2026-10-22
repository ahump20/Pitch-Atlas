import { clampMaterial, PRESETS, type CardMaterial } from '../refractor/material/materialPresets'

/*
  The visitor's finish for one face of one card, kept on the device. A preference,
  never a record: the pitch's own preset is what every page surface shows; the
  inspector alone reads these. Anything that does not parse as a material is ignored.
*/
export type FinishFace = 'front' | 'back'

export const FINISH_PREF_PREFIX = 'pa:finish:'

export function finishPrefKey(slug: string, face: FinishFace): string {
  return `${FINISH_PREF_PREFIX}${slug}:${face}`
}

function isMaterial(value: unknown): value is CardMaterial {
  if (!value || typeof value !== 'object') return false
  const m = value as Partial<CardMaterial>
  return typeof m.preset === 'string' && m.preset in PRESETS && typeof m.finishes === 'object' && m.finishes !== null
}

export function readFinishPref(slug: string, face: FinishFace): CardMaterial | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = window.localStorage.getItem(finishPrefKey(slug, face))
    if (!raw) return null
    const parsed: unknown = JSON.parse(raw)
    return isMaterial(parsed) ? clampMaterial({ ...PRESETS[parsed.preset], ...parsed }) : null
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
