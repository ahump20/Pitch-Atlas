import { COMPARE_KEY, EMPTY_SELECTION, normalizeSelection, type CompareSelection } from './selection'

/** A provider-owned external store: SSR always paints the empty selection. */
export function createSelectionStore() {
  let current = EMPTY_SELECTION
  if (typeof window !== 'undefined') {
    try {
      const raw = window.sessionStorage.getItem(COMPARE_KEY)
      if (raw) current = normalizeSelection(JSON.parse(raw))
    } catch { /* In-memory comparison remains available. */ }
  }
  const listeners = new Set<() => void>()
  return {
    getSnapshot: () => current,
    getServerSnapshot: () => EMPTY_SELECTION,
    subscribe: (listener: () => void) => { listeners.add(listener); return () => { listeners.delete(listener) } },
    set(next: CompareSelection) {
      if (JSON.stringify(current) === JSON.stringify(next)) return
      current = next
      try { window.sessionStorage.setItem(COMPARE_KEY, JSON.stringify(current)) } catch { /* optional storage */ }
      listeners.forEach(listener => listener())
    },
  }
}
