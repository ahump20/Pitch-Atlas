import { createContext, useContext } from 'react'
import type { ExternalPlatform } from '../../data/media/external'

export interface WatchItem {
  platform: ExternalPlatform
  externalId: string
  title: string
  author: string
  authorUrl: string
  url: string
}

/** Compatibility name for existing call sites while the UI language moves to Watch Dock. */
export type PipClip = WatchItem

export interface PipContextValue {
  /** The one credited provider item currently mounted in the persistent dock. */
  active: WatchItem | null
  /** Open the floating player. onClose fires when the reader dismisses it, so the caller can restore its inline view. */
  open: (clip: WatchItem, onClose?: () => void) => void
  close: () => void
}

export const PipContext = createContext<PipContextValue | null>(null)

export function usePip(): PipContextValue {
  const ctx = useContext(PipContext)
  if (!ctx) throw new Error('usePip must be used within <PipProvider>')
  return ctx
}
