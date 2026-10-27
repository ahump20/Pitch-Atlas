import { createContext, useContext, type MouseEvent } from 'react'
import { pitchBySlug } from '../../data/pitches'
import type { GripView, Handedness } from '../../data/types'

/*
  The bench's handle, provided on every page by RootLayout. Surfaces that can open a
  specimen read it; where there is no provider (a test, a standalone render) the
  Inspect button simply does not render, so a card never shows an action that does
  nothing.

  The bench looks at one specimen four ways: the card, the grip, the release and the
  flight. With a partner it sets two specimens side by side (no card then: the pair is
  about the hands, and it keeps the room to two ball canvases).
*/
export type Aspect = 'card' | 'grip' | 'release' | 'flight'

export interface BenchPatch {
  slug?: string
  partner?: string | null
  aspect?: Aspect
  /** null: each pitch's own default view */
  orientation?: GripView | null
  hand?: Handedness
}

export interface OpenOptions {
  aspect?: Aspect
  partner?: string | null
  /** the control that opened the bench; focus goes back to it on close */
  opener?: HTMLElement | null
}

export interface InspectorApi {
  slug: string | null
  partner: string | null
  aspect: Aspect
  orientation: GripView | null
  hand: Handedness
  open(slug: string, options?: OpenOptions): void
  /** changes what the open bench shows, in place: never a new history entry */
  set(patch: BenchPatch): void
  close(): void
}

export const InspectorContext = createContext<InspectorApi | null>(null)

export function useInspectorApi(): InspectorApi | null {
  return useContext(InspectorContext)
}

/*
  A plain click on a link to a filed pitch opens the bench over the page instead, so
  the list it was clicked in stays where it was. A modified or middle click (a new
  tab, a new window) still follows the link, and so does a page without JavaScript.
*/
export function useOpenInPlace(slug: string | null | undefined, options: Omit<OpenOptions, 'opener'> = {}) {
  const api = useInspectorApi()
  if (!api || !slug || pitchBySlug(slug)?.display.slug !== slug) return undefined
  return (event: MouseEvent<HTMLElement>) => {
    if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return
    event.preventDefault()
    api.open(slug, { ...options, opener: event.currentTarget })
  }
}
