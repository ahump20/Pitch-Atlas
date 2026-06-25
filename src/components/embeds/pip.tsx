import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react'

/*
  Picture-in-picture player. A teaching-clip card opens the original post in this
  floating, dismissible window so the reader keeps scrolling the chapter while it
  plays — embed-or-link, never rehost (docs/MEDIA-LEDGER.md). Nothing third-party
  loads until the reader opens a clip: at prerender and on first paint this renders
  null, so the static HTML and the privacy posture stay clean. The frame is
  TikTok's own player iframe (the platform serves the media, fully credited),
  never a downloaded file.
*/

export interface PipClip {
  videoId: string
  title: string
  author: string
  authorUrl: string
  url: string
}

interface PipContextValue {
  open: (clip: PipClip) => void
  close: () => void
}

const PipContext = createContext<PipContextValue | null>(null)

export function usePip(): PipContextValue {
  const ctx = useContext(PipContext)
  if (!ctx) throw new Error('usePip must be used within <PipProvider>')
  return ctx
}

export function PipProvider({ children }: { children: ReactNode }) {
  const [clip, setClip] = useState<PipClip | null>(null)
  const open = useCallback((next: PipClip) => setClip(next), [])
  const close = useCallback(() => setClip(null), [])
  const value = useMemo(() => ({ open, close }), [open, close])

  return (
    <PipContext.Provider value={value}>
      {children}
      <PipPlayer clip={clip} onClose={close} />
    </PipContext.Provider>
  )
}

function PipPlayer({ clip, onClose }: { clip: PipClip | null; onClose: () => void }) {
  if (!clip) return null
  return (
    <div
      role="dialog"
      aria-label={`Now playing: ${clip.title}`}
      className="fixed inset-x-3 bottom-3 z-[80] mx-auto w-auto max-w-[330px] overflow-hidden rounded-lg border border-bone/20 bg-press shadow-[0_24px_60px_-18px_rgba(0,0,0,0.85)] sm:inset-x-auto sm:right-4 sm:bottom-4 sm:mx-0"
    >
      <div className="flex items-center justify-between gap-2 border-b border-bone/12 px-3 py-2">
        <a
          href={clip.authorUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mono-label-stage truncate transition-colors hover:text-bone"
        >
          {clip.author} · TikTok
        </a>
        <div className="flex flex-none items-center gap-1.5">
          <a
            href={clip.url}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Open on TikTok"
            className="rounded-sm border border-bone/20 px-2 py-1 font-mono text-[10px] uppercase tracking-[0.1em] text-bone-2 transition-colors hover:border-cyan/60 hover:text-bone"
          >
            Open ↗
          </a>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close player"
            className="grid h-7 w-7 place-items-center rounded-sm border border-bone/20 text-bone-2 transition-colors hover:border-seam/60 hover:text-bone"
          >
            <span aria-hidden="true" className="text-base leading-none">×</span>
          </button>
        </div>
      </div>
      <div className="relative w-full bg-black" style={{ aspectRatio: '9 / 16' }}>
        <iframe
          key={clip.videoId}
          src={`https://www.tiktok.com/player/v1/${clip.videoId}?rel=0&description=0&music_info=0`}
          title={clip.title}
          className="absolute inset-0 h-full w-full"
          allow="autoplay; encrypted-media; fullscreen; picture-in-picture"
          referrerPolicy="strict-origin-when-cross-origin"
          loading="lazy"
        />
      </div>
    </div>
  )
}
