/*
  The discovered-tidbit store: the found set, kept in the browser only
  (localStorage, anonymous-first, no server). Read through useSyncExternalStore so
  it is SSR-safe by construction - the server and the first client paint see the
  empty set, then the real set loads after hydration, with no mismatch and no
  setState-in-effect. The snapshot reference only changes when something is found,
  so the store is stable for React.
*/

const STORAGE_KEY = 'pa-tidbits-found-v1'
const EMPTY: string[] = []

let ids: string[] = EMPTY
let loaded = false
const listeners = new Set<() => void>()

function ensureLoaded(): void {
  if (loaded || typeof window === 'undefined') return
  loaded = true
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const parsed: unknown = JSON.parse(raw)
      if (Array.isArray(parsed)) ids = parsed.filter((x): x is string => typeof x === 'string')
    }
  } catch {
    /* storage unavailable; the layer simply does not persist */
  }
}

export function discoverTidbit(id: string): void {
  ensureLoaded()
  if (ids.includes(id)) return
  ids = [...ids, id]
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(ids))
  } catch {
    /* ignore */
  }
  listeners.forEach((l) => l())
}

export function subscribeTidbits(cb: () => void): () => void {
  listeners.add(cb)
  return () => {
    listeners.delete(cb)
  }
}

export function getFoundSnapshot(): string[] {
  ensureLoaded()
  return ids
}

export function getFoundServerSnapshot(): string[] {
  return EMPTY
}
