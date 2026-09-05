import { pitchBySlug } from '../../data/pitches'
import type { GripView, Handedness } from '../../data/types'

export type CompareView = 'grips' | 'cues' | 'movement'
export interface CompareSelection {
  a: string | null
  b: string | null
  view: CompareView
  hand: Handedness
  orientation: GripView
}
export const EMPTY_SELECTION: CompareSelection = { a: null, b: null, view: 'grips', hand: 'right', orientation: 'top' }
export const COMPARE_KEY = 'pitch-atlas:compare:v1'
export function validSlug(value: unknown): string | null {
  return typeof value === 'string' && pitchBySlug(value) ? value : null
}
export function normalizeSelection(value: Partial<CompareSelection>): CompareSelection {
  const a = validSlug(value.a)
  const b = validSlug(value.b)
  return {
    a, b: a === b ? null : b,
    view: value.view === 'cues' || value.view === 'movement' ? value.view : 'grips',
    hand: value.hand === 'left' ? 'left' : 'right',
    orientation: value.orientation === 'side' || value.orientation === 'thumb' ? value.orientation : 'top',
  }
}
export function parseSelection(search: string): CompareSelection {
  const p = new URLSearchParams(search)
  return normalizeSelection({ a: p.get('a'), b: p.get('b'), view: p.get('view') as CompareView, hand: p.get('hand') as Handedness, orientation: p.get('orientation') as GripView })
}
export function compareUrl(selection: CompareSelection): string {
  const p = new URLSearchParams({ a: selection.a ?? '', b: selection.b ?? '', view: selection.view, hand: selection.hand, orientation: selection.orientation })
  return `/compare?${p}`
}
