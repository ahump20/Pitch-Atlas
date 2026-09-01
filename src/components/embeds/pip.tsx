import { useCallback, useMemo, useRef, useState, type ReactNode } from 'react'
import { PipContext, type WatchItem } from './pipContext'
import { platformLabel } from '../../data/media/external'

const WATCH_DOCK_SESSION_KEY = 'pitch-atlas:watch-dock'
const WATCH_DOCK_PLATFORMS = new Set(['tiktok', 'x', 'instagram', 'youtube'])

function restoreWatchItem(): WatchItem | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = window.sessionStorage.getItem(WATCH_DOCK_SESSION_KEY)
    if (!raw) return null
    const item = JSON.parse(raw) as Partial<WatchItem>
    if (
      !item.platform || !WATCH_DOCK_PLATFORMS.has(item.platform) ||
      !item.externalId || !item.title || !item.author ||
      !item.url?.startsWith('https://') || !item.authorUrl?.startsWith('https://')
    ) return null
    return item as WatchItem
  } catch {
    return null
  }
}

function rememberWatchItem(item: WatchItem | null) {
  if (typeof window === 'undefined') return
  try {
    if (item) window.sessionStorage.setItem(WATCH_DOCK_SESSION_KEY, JSON.stringify(item))
    else window.sessionStorage.removeItem(WATCH_DOCK_SESSION_KEY)
  } catch {
    // A blocked storage surface should never block the credited official player.
  }
}

/*
  Watch Dock. An official provider player can leave a route card and persist in
  the root layout while the reader keeps moving through Pitch Atlas. The inline
  frame unmounts when the dock opens, so one item never plays twice. Provider
  official frames do not expose a safe common timestamp handoff in this build,
  so every provider reopens the same credited item from its beginning. The dock
  never implies a seamless resume it cannot prove. No third-party media is rehosted.
*/

export function PipProvider({ children }: { children: ReactNode }) {
  const [clip, setClip] = useState<WatchItem | null>(restoreWatchItem)
  const onCloseRef = useRef<(() => void) | undefined>(undefined)

  const open = useCallback((next: WatchItem, onClose?: () => void) => {
    onCloseRef.current = onClose
    rememberWatchItem(next)
    setClip(next)
  }, [])

  const close = useCallback(() => {
    rememberWatchItem(null)
    setClip(null)
    const cb = onCloseRef.current
    onCloseRef.current = undefined
    cb?.()
  }, [])

  const value = useMemo(() => ({ active: clip, open, close }), [clip, open, close])

  return (
    <PipContext.Provider value={value}>
      {children}
      <PipPlayer clip={clip} onClose={close} />
    </PipContext.Provider>
  )
}

function playerUrl(item: WatchItem): string {
  if (item.platform === 'tiktok') {
    return `https://www.tiktok.com/player/v1/${item.externalId}?rel=0&description=0&music_info=0&autoplay=1`
  }
  if (item.platform === 'x') {
    return `https://platform.twitter.com/embed/Tweet.html?id=${item.externalId}&dnt=true&theme=dark`
  }
  if (item.platform === 'youtube') {
    return `https://www.youtube-nocookie.com/embed/${item.externalId}?rel=0&autoplay=1`
  }
  const kind = item.url.includes('/reel/') ? 'reel' : 'p'
  return `https://www.instagram.com/${kind}/${item.externalId}/embed/`
}

function PipPlayer({ clip, onClose }: { clip: WatchItem | null; onClose: () => void }) {
  if (!clip) return null
  const provider = platformLabel(clip.platform)
  const portrait = clip.platform === 'tiktok' || clip.platform === 'instagram'
  return (
    <div
      role="dialog"
      aria-label={`Now playing: ${clip.title}`}
      data-resume-behavior="restart"
      className="fixed inset-x-3 bottom-3 z-[80] mx-auto w-auto max-w-[330px] overflow-hidden rounded-lg border border-bone/20 bg-press shadow-[0_24px_60px_-18px_rgba(0,0,0,0.85)] sm:inset-x-auto sm:right-4 sm:bottom-4 sm:mx-0"
    >
      <div className="flex items-center justify-between gap-2 border-b border-bone/12 px-3 py-2">
        <a
          href={clip.authorUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mono-label-stage truncate transition-colors hover:text-bone"
        >
          {clip.author} · {provider}
        </a>
        <div className="flex flex-none items-center gap-1.5">
          <a
            href={clip.url}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Open on ${provider}`}
            className="rounded-sm border border-bone/20 px-2 py-1 font-mono text-[10px] uppercase tracking-[0.1em] text-bone-2 transition-colors hover:border-cyan/60 hover:text-bone"
          >
            Open ↗
          </a>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close player and return it to the page"
            className="grid h-7 w-7 place-items-center rounded-sm border border-bone/20 text-bone-2 transition-colors hover:border-seam/60 hover:text-bone"
          >
            <span aria-hidden="true" className="text-base leading-none">×</span>
          </button>
        </div>
      </div>
      <div className="relative w-full bg-black" style={{ aspectRatio: portrait ? '9 / 16' : '16 / 10' }}>
        <iframe
          key={`${clip.platform}-${clip.externalId}`}
          src={playerUrl(clip)}
          title={clip.title}
          className="absolute inset-0 h-full w-full"
          allow="autoplay; encrypted-media; fullscreen; picture-in-picture"
          referrerPolicy="strict-origin-when-cross-origin"
        />
      </div>
      <p className="border-t border-bone/12 px-3 py-2 font-mono text-[10px] uppercase leading-snug tracking-[0.08em] text-bone-2/80">
        Original post, embedded from {provider} and credited — not rehosted.
      </p>
    </div>
  )
}
