import { useState } from 'react'
import type { GripClip as GripClipData } from '../../data/grips'
import { useReducedMotion } from '../../hooks/useReducedMotion'
import { useAutoplayGuard } from '../../hooks/useAutoplayGuard'

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
export function GripClip({ clip }: { clip: GripClipData }) {
  const reduced = useReducedMotion()
  const { ref, blocked } = useAutoplayGuard<HTMLVideoElement>()
  // media settle: the window fades up on the first real frame, never snapping in
  const [settled, setSettled] = useState(false)
  const mediaClass = `rfx-grip-img media-fade${settled ? ' is-loaded' : ''}`

  if (reduced || blocked) {
    return (
      <figure className="rfx-grip">
        <img
          className={mediaClass}
          src={clip.poster}
          alt={clip.alt}
          loading="lazy"
          decoding="async"
          draggable={false}
          // a cached poster can finish before hydration attaches onLoad — read it off the element
          ref={(el) => {
            if (el?.complete && el.naturalWidth > 0) setSettled(true)
          }}
          onLoad={() => setSettled(true)}
        />
      </figure>
    )
  }

  return (
    <figure className="rfx-grip">
      <video
        ref={ref}
        className={mediaClass}
        poster={clip.poster}
        autoPlay
        muted
        loop
        playsInline
        preload="metadata"
        aria-label={clip.alt}
        onLoadedData={() => setSettled(true)}
        // a decode failure reveals the poster instead of holding the window dark
        onError={() => setSettled(true)}
      >
        {/* mp4 first: for these encodes the H.264 files are smaller than the WebM,
            and browsers take the first source they support */}
        <source src={clip.mp4} type="video/mp4" />
        <source src={clip.webm} type="video/webm" />
      </video>
    </figure>
  )
}
