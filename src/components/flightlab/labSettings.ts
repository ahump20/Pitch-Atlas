import { useCallback, useSyncExternalStore } from 'react'
import { DEFAULT_STANCE, type BoxPosition } from '../../lib/slowpitch'
import { COMPARE_OPTIONS, HEIGHT_RANGE, TOES_RANGE } from './model'

/*
  The visitor's own batter, kept in their browser only: height, toes to plate,
  box and the compare bat. Every storage touch is wrapped, so a private window,
  blocked storage or a thrown accessor leaves the lab on the measured batter
  instead of breaking it. The server snapshot is always the measured batter, so
  the prerender and the first client render agree.
*/

export interface LabSettings {
  heightIn: number
  toesIn: number
  box: BoxPosition
  compareIn: number
}

const STORAGE_KEY = 'pa-flight-lab:batter:v1'

export const DEFAULT_SETTINGS: LabSettings = {
  heightIn: DEFAULT_STANCE.heightIn,
  toesIn: DEFAULT_STANCE.toesIn,
  box: DEFAULT_STANCE.box,
  compareIn: 32,
}

function intIn(value: unknown, min: number, max: number, fallback: number): number {
  return typeof value === 'number' && Number.isFinite(value) && value >= min && value <= max ? Math.round(value) : fallback
}

/** Parse whatever was stored, keeping only values the controls can show. */
export function parseSettings(raw: string | null): LabSettings {
  if (!raw) return DEFAULT_SETTINGS
  try {
    const v = JSON.parse(raw) as Partial<Record<keyof LabSettings, unknown>>
    return {
      heightIn: intIn(v.heightIn, HEIGHT_RANGE.min, HEIGHT_RANGE.max, DEFAULT_SETTINGS.heightIn),
      toesIn: intIn(v.toesIn, TOES_RANGE.min, TOES_RANGE.max, DEFAULT_SETTINGS.toesIn),
      box: v.box === 'front' || v.box === 'back' || v.box === 'middle' ? v.box : DEFAULT_SETTINGS.box,
      compareIn: (COMPARE_OPTIONS as readonly number[]).includes(v.compareIn as number)
        ? (v.compareIn as number)
        : DEFAULT_SETTINGS.compareIn,
    }
  } catch {
    return DEFAULT_SETTINGS
  }
}

let cache: LabSettings | null = null
const listeners = new Set<() => void>()

function read(): LabSettings {
  if (cache) return cache
  let raw: string | null
  try {
    raw = window.localStorage.getItem(STORAGE_KEY)
  } catch {
    raw = null
  }
  cache = parseSettings(raw)
  return cache
}

function write(next: LabSettings) {
  cache = next
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
  } catch {
    // Storage is a convenience; the lab keeps working on in-memory settings.
  }
  listeners.forEach((l) => l())
}

function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

const serverSnapshot = () => DEFAULT_SETTINGS

export function useLabSettings(): [LabSettings, (patch: Partial<LabSettings>) => void, () => void] {
  const settings = useSyncExternalStore(subscribe, read, serverSnapshot)
  const update = useCallback((patch: Partial<LabSettings>) => write({ ...read(), ...patch }), [])
  const reset = useCallback(() => write(DEFAULT_SETTINGS), [])
  return [settings, update, reset]
}

/** Test seam: forget the in-memory copy so the next read goes back to storage. */
export function resetLabSettingsCache() {
  cache = null
}
