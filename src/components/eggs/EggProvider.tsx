import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from 'react'
import { tidbitById, TIDBIT_COUNT, type Tidbit } from '../../data/tidbits'
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

interface EggContextValue {
  found: string[]
  count: number
  total: number
  has: (id: string) => boolean
  /** Trigger an egg: file the tidbit (if new) and open its reveal. */
  reveal: (id: string) => void
  active: Tidbit | null
  dismiss: () => void
  indexOpen: boolean
  openIndex: () => void
  closeIndex: () => void
}

const EggContext = createContext<EggContextValue | null>(null)

export function useEgg(): EggContextValue {
  const ctx = useContext(EggContext)
  if (!ctx) throw new Error('useEgg must be used within an EggProvider')
  return ctx
}

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
