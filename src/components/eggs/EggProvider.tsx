import { useCallback, useMemo, useState, useSyncExternalStore, type ReactNode } from 'react'
import { tidbitById, TIDBIT_COUNT } from '../../data/tidbits'
import { EggContext, type EggContextValue } from './EggContext'
import {
  discoverTidbit,
  subscribeTidbits,
  getFoundSnapshot,
  getFoundServerSnapshot,
} from './tidbitStore'

/*
  The hidden-tidbit layer. Each easter egg, when triggered on its historical
  surface, reveals one real, sourced fact and files it to a found-index kept in the
  browser (localStorage, anonymous-first - no account, no server, matching the
  no-billing posture). The found set is read through an external store so it is
  SSR-safe and never sets state inside an effect; the reveal and the index are
  transient UI state, set only from event handlers.
*/

export function EggProvider({ children }: { children: ReactNode }) {
  const found = useSyncExternalStore(subscribeTidbits, getFoundSnapshot, getFoundServerSnapshot)
  const [activeId, setActiveId] = useState<string | null>(null)
  const [indexOpen, setIndexOpen] = useState(false)

  const reveal = useCallback((id: string) => {
    if (!tidbitById(id)) return
    setActiveId(id)
    discoverTidbit(id)
  }, [])

  const has = useCallback((id: string) => found.includes(id), [found])

  const value = useMemo<EggContextValue>(
    () => ({
      found,
      count: found.length,
      total: TIDBIT_COUNT,
      has,
      reveal,
      active: activeId ? tidbitById(activeId) ?? null : null,
      dismiss: () => setActiveId(null),
      indexOpen,
      openIndex: () => setIndexOpen(true),
      closeIndex: () => setIndexOpen(false),
    }),
    [found, has, reveal, activeId, indexOpen],
  )

  return <EggContext.Provider value={value}>{children}</EggContext.Provider>
}
