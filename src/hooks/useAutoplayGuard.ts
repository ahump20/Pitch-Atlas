import { useEffect, useRef, useState } from 'react'

/*
  Detects autoplay refusal so a muted looping clip can fall back to its poster
  image instead of sitting paused under the platform's play-button glyph (iOS
  Low Power Mode is the common case). The single sanctioned imperative media
  call in the codebase: one guarded play() attempt after mount, skipped under
  vitest so jsdom's unimplemented HTMLMediaElement never fires.
*/
export function useAutoplayGuard<T extends HTMLVideoElement>() {
  const ref = useRef<T | null>(null)
  const [blocked, setBlocked] = useState(false)

  useEffect(() => {
    if (import.meta.env.MODE === 'test') return
    const el = ref.current
    if (!el || typeof el.play !== 'function') return
    let cancelled = false
    const onPlaying = () => {
      if (!cancelled) setBlocked(false)
    }
    el.addEventListener('playing', onPlaying)
    // a synchronous throw from play() routes through the same rejected-promise
    // path as a normal autoplay refusal, so the blocked flag is only ever set
    // asynchronously (never synchronously inside this effect)
    let attempt: Promise<void> | undefined
    try {
      attempt = el.play()
    } catch {
      attempt = Promise.reject(new Error('autoplay refused synchronously'))
    }
    if (attempt && typeof attempt.catch === 'function') {
      attempt.catch(() => {
        if (!cancelled) setBlocked(true)
      })
    }
    return () => {
      cancelled = true
      el.removeEventListener('playing', onPlaying)
    }
  }, [])

  return { ref, blocked }
}
