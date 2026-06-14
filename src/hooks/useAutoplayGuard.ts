import { useCallback, useRef, useState } from 'react'

/*
  Drives a muted looping clip's playback imperatively and detects autoplay
  refusal so the clip can fall back to its poster image instead of sitting
  paused under the platform's play-button glyph (iOS Low Power Mode is the
  common case).

  This hook no longer plays on mount. Playback is viewport-gated by the caller
  (AutoplayVideo wires an IntersectionObserver): `play()` runs when the clip
  scrolls into view, `pause()` when it leaves, and `play()` can re-fire on every
  re-entry — so offscreen clips stop decoding and a clip that scrolls back in
  resumes correctly.

  Two guards stay in force:
    - Under vitest (`import.meta.env.MODE === 'test'`), play() is a no-op so
      jsdom's unimplemented HTMLMediaElement never fires.
    - A synchronous throw from el.play() is routed through the same
      rejected-promise path as a normal autoplay refusal, so `blocked` is only
      ever set asynchronously. A `playing` event clears it again, so a later
      successful re-entry recovers the video from a poster fallback.
*/
export function useAutoplayGuard<T extends HTMLVideoElement>() {
  const ref = useRef<T | null>(null)
  const [blocked, setBlocked] = useState(false)

  const play = useCallback(() => {
    if (import.meta.env.MODE === 'test') return
    const el = ref.current
    if (!el || typeof el.play !== 'function') return
    let attempt: Promise<void> | undefined
    try {
      attempt = el.play()
    } catch {
      attempt = Promise.reject(new Error('autoplay refused synchronously'))
    }
    if (attempt && typeof attempt.catch === 'function') {
      attempt
        .then(() => setBlocked(false))
        .catch(() => setBlocked(true))
    }
  }, [])

  const pause = useCallback(() => {
    if (import.meta.env.MODE === 'test') return
    const el = ref.current
    if (!el || typeof el.pause !== 'function') return
    try {
      el.pause()
    } catch {
      /* a pause that throws is harmless — the clip is already not advancing */
    }
  }, [])

  return { ref, blocked, play, pause }
}
