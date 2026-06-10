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

  if (reduced || blocked) {
    return (
      <figure className="rfx-grip">
        <img
          className="rfx-grip-img"
          src={clip.poster}
          alt={clip.alt}
          loading="lazy"
          decoding="async"
          draggable={false}
        />
      </figure>
    )
  }

  return (
    <figure className="rfx-grip">
      <video
        ref={ref}
        className="rfx-grip-img"
        poster={clip.poster}
        autoPlay
        muted
        loop
        playsInline
        preload="metadata"
        aria-label={clip.alt}
      >
        {/* mp4 first: for these encodes the H.264 files are smaller than the WebM,
            and browsers take the first source they support */}
        <source src={clip.mp4} type="video/mp4" />
        <source src={clip.webm} type="video/webm" />
      </video>
    </figure>
  )
}
