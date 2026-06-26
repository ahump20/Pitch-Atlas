import { createContext, useContext } from 'react'

export interface PipClip {
  videoId: string
  title: string
  author: string
  authorUrl: string
  url: string
}

export interface PipContextValue {
  /** Open the floating player. onClose fires when the reader dismisses it, so the caller can restore its inline view. */
  open: (clip: PipClip, onClose?: () => void) => void
  close: () => void
}

export const PipContext = createContext<PipContextValue | null>(null)

export function usePip(): PipContextValue {
  const ctx = useContext(PipContext)
  if (!ctx) throw new Error('usePip must be used within <PipProvider>')
  return ctx
}
