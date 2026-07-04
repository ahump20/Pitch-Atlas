import { useState } from 'react'
import type { GripClip as GripClipData } from '../../data/grips'
import { useReducedMotion } from '../../hooks/useReducedMotion'
import { AutoplayVideo } from '../media/AutoplayVideo'

/*
  The moving card face: Austin's own grip, looping in the arched window. Only the
  four game-day pitches he actually threw carry a clip, so the motion is a signal,
  not decoration — the situational grips stay still (GripFace) and the reference
  pitches stay schematic (RefractorBall). Muted + autoplay + loop + playsinline so
  it reads like an animated still, never a player video with sound. Honors
  prefers-reduced-motion by swapping to the poster frame, and falls back to the
  poster when the platform refuses autoplay (iOS Low Power Mode) so the window
  never wears the system play-button glyph. The poster covers load and any decode
  failure, so the dark window never breaks. Fills the window via the shared
  .rfx-grip / .rfx-grip-img rules, identical to GripFace.
*/
export function GripClip({ clip, priority = false }: { clip: GripClipData; priority?: boolean }) {
  const reduced = useReducedMotion()
  // Two independent fades. The poster is the always-present first layer: the real
  // first frame, painted the instant its bytes arrive so the window is never blank
  // while the heavier clip decodes. It fades up on its own onLoad. The video, when
  // motion is allowed, crossfades ABOVE it once its first frame settles — both
  // layers stacked in the same grid cell (.rfx-grip is display:grid).
  const [posterLoaded, setPosterLoaded] = useState(false)
  const [settled, setSettled] = useState(false)

  const poster = (
    <img
      className={`rfx-grip-img rfx-grip-poster media-fade${posterLoaded ? ' is-loaded' : ''}`}
      src={clip.poster}
      alt={clip.alt}
      // Hero clips paint their poster eagerly at high priority (the LCP element);
      // off-hero clips stay lazy. The video preload follows the same flag.
      loading={priority ? 'eager' : 'lazy'}
      fetchPriority={priority ? 'high' : undefined}
      decoding="async"
      draggable={false}
      // a cached poster can finish before hydration attaches onLoad — read it off the element
      ref={(el) => {
        if (el?.complete && el.naturalWidth > 0) setPosterLoaded(true)
      }}
      onLoad={() => setPosterLoaded(true)}
    />
  )

  // Reduced motion holds the poster alone. Otherwise the loop is viewport-gated: it
  // plays when the card is on screen, pauses when it scrolls away, and — if the
  // platform refuses autoplay (iOS Low Power Mode) — renders nothing, leaving the
  // always-present poster beneath as the fallback instead of stacking a second copy.
  return (
    <figure className="rfx-grip">
      {poster}
      {reduced ? null : (
        <AutoplayVideo
          clip={clip}
          className={`rfx-grip-img media-fade${settled ? ' is-loaded' : ''}`}
          priority={priority}
          onSettled={() => setSettled(true)}
          render={() => null}
        />
      )}
    </figure>
  )
}
