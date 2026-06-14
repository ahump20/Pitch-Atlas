import { useState, type ReactNode } from 'react'
import type { GripClip } from '../../data/grips'
import { useReducedMotion } from '../../hooks/useReducedMotion'
import { AutoplayVideo } from './AutoplayVideo'

/*
  The cinematic media panel — real footage staged large enough to carry a page.

  This is the page-scale sibling of GripClip: same media discipline (poster-first,
  muted, looping, mp4-first, reduced-motion holds the poster, no imperative play
  calls so jsdom and the SSG prerender stay safe), different job. GripClip fills
  a card window; MediaStage fills a hero or a chapter opener, with a scrim so type
  can sit on the footage without fighting it.

  The clips are 900x1600 portrait of one hand on one ball. `variant` picks the
  honest framing for that geometry:
    - 'bleed'    fills its container and crops to cover (mobile heroes, tall columns)
    - 'portrait' keeps the clip's own aspect inside a framed column (desktop split)

  Atmosphere is finish, never substance: the scrim and the sitewide grain sit OVER
  this real footage. Nothing here ever stands in for an instructional image.
*/
export function MediaStage({
  clip,
  variant = 'bleed',
  scrim = true,
  priority = false,
  decorative = false,
  className = '',
  children,
}: {
  clip: GripClip
  variant?: 'bleed' | 'portrait'
  scrim?: boolean
  /** Hero-of-the-page media: poster loads eagerly and paints first (LCP). */
  priority?: boolean
  /** Backdrop use: real footage as atmosphere. Hidden from assistive tech. */
  decorative?: boolean
  className?: string
  children?: ReactNode
}) {
  const reduced = useReducedMotion()
  // media settle: the stage fades up on the first real frame, never snapping in
  const [settled, setSettled] = useState(false)
  const mediaClass = `pa-stage-media media-fade${settled ? ' is-loaded' : ''}`

  const poster = (
    <img
      className={mediaClass}
      src={clip.poster}
      alt={decorative ? '' : clip.alt}
      aria-hidden={decorative || undefined}
      loading={priority ? 'eager' : 'lazy'}
      // @ts-expect-error React 19 passes fetchpriority through; types lag the DOM attr
      fetchpriority={priority ? 'high' : undefined}
      decoding="async"
      draggable={false}
      // a cached poster can finish before hydration attaches onLoad — read it off the element
      ref={(el) => {
        if (el?.complete && el.naturalWidth > 0) setSettled(true)
      }}
      onLoad={() => setSettled(true)}
    />
  )

  // Reduced motion never mounts the clip. Otherwise the clip is viewport-gated:
  // it autoplays when on screen, pauses when it scrolls away, and falls back to
  // the poster if the platform refuses autoplay.
  const media = reduced ? (
    poster
  ) : (
    <AutoplayVideo
      clip={clip}
      className={mediaClass}
      decorative={decorative}
      priority={priority}
      onSettled={() => setSettled(true)}
      render={() => poster}
    />
  )

  return (
    <div className={`pa-stage ${variant === 'portrait' ? 'pa-stage-portrait' : 'pa-stage-bleed'} ${className}`}>
      {media}
      {scrim ? <div className="pa-stage-scrim" aria-hidden="true" /> : null}
      {children ? <div className="pa-stage-content">{children}</div> : null}
    </div>
  )
}
