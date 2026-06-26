import { useCallback, useEffect, useRef } from 'react'
import type { GripClip } from '../../data/grips'
import { useAutoplayGuard } from '../../hooks/useAutoplayGuard'
import { autoplayDecision } from './autoplayDecision'

/*
  The viewport-gated <video> shared by GripClip (card window) and MediaStage
  (page-scale hero). Extracted so one IntersectionObserver decides when the clip
  decodes: play on enter, pause on leave, resume on re-entry. Offscreen clips
  stop decoding — wasteful work on the signature media path, worst on mobile,
  is gone.

  The <video> is the DIRECT child of its parent container exactly as before — no
  wrapping element — so every .rfx-grip-img / .pa-stage-media CSS rule and the
  foil/tilt behavior are untouched. The observer watches the video element
  itself, which is why playback can't gate on a `display:contents` box.

  No `autoPlay` attribute: playback is driven only by the observer so the browser
  never decodes a clip that isn't on screen. The hero still autoplays the instant
  it's visible because an IntersectionObserver fires its initial callback as soon
  as it observes an in-view element.

  Guards carried from the old useAutoplayGuard-on-mount model:
    - Reduced motion is the caller's job (it renders the poster <img> instead and
      never mounts this component), so this component always intends to play.
    - Under vitest the hook's play()/pause() are no-ops (jsdom has no media), and
      IntersectionObserver may be undefined — both are handled so the test render
      stays a plain, inert <video>.
    - `blocked` (autoplay refused, e.g. iOS Low Power Mode) bubbles up via the
      render callback so the parent can swap to its poster fallback.
*/
export function AutoplayVideo({
  clip,
  className,
  decorative = false,
  priority = false,
  onSettled,
  render,
}: {
  clip: GripClip
  className: string
  /** Backdrop use: hide the clip from assistive tech. */
  decorative?: boolean
  /** Hero-of-the-page media: preload the file eagerly. */
  priority?: boolean
  /** First real frame painted (or a decode failure surfaced the poster). */
  onSettled: () => void
  /** When autoplay is refused, the parent renders its poster fallback instead. */
  render: (blocked: boolean) => React.ReactNode
}) {
  const { ref, blocked, play, pause } = useAutoplayGuard<HTMLVideoElement>()
  const observerRef = useRef<IntersectionObserver | null>(null)

  // Attach the observer to the <video> element itself the moment it mounts, and
  // keep the hook's ref pointed at it too. Driven by a callback ref so there's no
  // wrapper box — the video stays a direct child and the layout never changes.
  const attach = useCallback(
    (el: HTMLVideoElement | null) => {
      ref.current = el
      observerRef.current?.disconnect()
      observerRef.current = null
      if (!el) return
      if (typeof IntersectionObserver === 'undefined') {
        // No observer (jsdom/SSR): a single play attempt so the clip still
        // autoplays rather than sitting paused.
        play()
        return
      }
      const observer = new IntersectionObserver(
        (entries) => {
          const decision = autoplayDecision(entries)
          if (decision === 'play') play()
          else if (decision === 'pause') pause()
        },
        // a sliver on screen counts as visible; start a touch early off the bottom
        { threshold: 0.01, rootMargin: '0px 0px 10% 0px' },
      )
      observer.observe(el)
      observerRef.current = observer
    },
    [ref, play, pause],
  )

  // Tear the observer down on unmount.
  useEffect(() => () => observerRef.current?.disconnect(), [])

  if (blocked) return <>{render(true)}</>

  return (
    <video
      ref={attach}
      className={className}
      poster={clip.poster}
      muted
      loop
      playsInline
      preload={priority ? 'auto' : 'metadata'}
      aria-label={decorative ? undefined : clip.alt}
      aria-hidden={decorative || undefined}
      onLoadedData={onSettled}
      // a decode failure reveals the poster instead of holding the stage dark
      onError={onSettled}
    >
      {/* mp4 first: for these encodes the H.264 files are smaller than the WebM,
          and browsers take the first source they support */}
      <source src={clip.mp4} type="video/mp4" />
      <source src={clip.webm} type="video/webm" />
    </video>
  )
}
