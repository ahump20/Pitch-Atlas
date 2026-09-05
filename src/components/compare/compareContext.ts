import { createContext, useContext } from 'react'
import type { CompareSelection } from './selection'
export interface CompareContextValue {
  selection: CompareSelection
  update: (patch: Partial<CompareSelection>) => void
  add: (slug: string) => void
  clear: () => void
}
export const CompareContext = createContext<CompareContextValue | null>(null)
export function useCompare() { return useContext(CompareContext) }
