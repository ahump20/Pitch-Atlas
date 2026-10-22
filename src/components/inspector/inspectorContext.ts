import { createContext, useContext } from 'react'

/*
  The inspector's handle, provided where the inspector is mounted (the home page).
  Surfaces that can offer "Inspect card" read it; where there is no provider the
  button simply does not render, so a card on a page without the inspector never
  shows an action that does nothing.
*/
export interface InspectorApi {
  slug: string | null
  open(slug: string): void
  close(): void
}

export const InspectorContext = createContext<InspectorApi | null>(null)

export function useInspectorApi(): InspectorApi | null {
  return useContext(InspectorContext)
}
