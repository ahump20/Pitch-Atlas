import { createContext, useContext } from 'react'
import type { Tidbit } from '../../data/tidbits'

export interface EggContextValue {
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

export const EggContext = createContext<EggContextValue | null>(null)

export function useEgg(): EggContextValue {
  const ctx = useContext(EggContext)
  if (!ctx) throw new Error('useEgg must be used within an EggProvider')
  return ctx
}
