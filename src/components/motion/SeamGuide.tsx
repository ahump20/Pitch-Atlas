import { useReveal } from './Reveal'

/*
  The red thread. Section-scoped seam stitching — the same alternating slashes
  the leather wears — drawn in as the section scrolls into view. The draw is
  pure CSS: a clip-path wipe driven by `animation-timeline: view()` where the
  browser supports it, and a one-shot IntersectionObserver class toggle where it
  does not (the observer fires once and detaches; nothing here runs on scroll
  frames). Under prefers-reduced-motion the stitch is simply there, complete.
  Decorative by construction: aria-hidden, color from the scene's seam token.

  Three accents, one vocabulary:
  - tear:      a full-width stitch row — the tear-line between sections.
  - underline: a short run under a heading.
  - orbit:     an arc of stitches — the seam coming around to close.
*/

export type SeamGuideVariant = 'tear' | 'underline' | 'orbit'

function StitchRow({ width, count }: { width: number; count: number }) {
  const step = width / count
  return (
    <svg
      className="seam-guide-svg"
      viewBox={`0 0 ${width} 16`}
      width="100%"
      height="16"
      preserveAspectRatio="xMidYMid slice"
      focusable="false"
    >
      {Array.from({ length: count }, (_, i) => {
        const x = step * i + step / 2
        const d = i % 2 === 0 ? `M${x - 3.5} 3 L${x + 3.5} 13` : `M${x + 3.5} 3 L${x - 3.5} 13`
        return (
          <path key={i} d={d} stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none" />
        )
      })}
    </svg>
  )
}

function StitchArc() {
  /* a horseshoe arc of stitches: ticks crossing the seam curve, like the
     two-seam horseshoe coming around. Deterministic geometry, no randomness. */
  const cx = 50
  const cy = 54
  const r = 38
  const ticks = 13
  const start = Math.PI * 1.12 // just past the left horizon
  const end = -Math.PI * 0.12 // just past the right horizon
  return (
    <svg
      className="seam-guide-svg"
      viewBox="0 0 100 64"
      width="100"
      height="64"
      preserveAspectRatio="xMidYMid meet"
      focusable="false"
    >
      {Array.from({ length: ticks }, (_, i) => {
        const a = start + ((end - start) * i) / (ticks - 1)
        const tilt = i % 2 === 0 ? 0.16 : -0.16
        const x1 = cx + (r - 4.5) * Math.cos(a - tilt * 0.1)
        const y1 = cy - (r - 4.5) * Math.sin(a - tilt * 0.1)
        const x2 = cx + (r + 4.5) * Math.cos(a + tilt)
        const y2 = cy - (r + 4.5) * Math.sin(a + tilt)
        return (
          <path
            key={i}
            d={`M${x1.toFixed(1)} ${y1.toFixed(1)} L${x2.toFixed(1)} ${y2.toFixed(1)}`}
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            fill="none"
          />
        )
      })}
    </svg>
  )
}

export function SeamGuide({
  variant = 'tear',
  className = '',
}: {
  variant?: SeamGuideVariant
  className?: string
}) {
  const { ref, shown } = useReveal<HTMLDivElement>('0px 0px -6% 0px')
  return (
    <div
      ref={ref}
      aria-hidden="true"
      className={`seam-guide seam-guide--${variant} ${shown ? 'is-stitched' : ''} ${className}`}
    >
      {variant === 'tear' ? (
        <StitchRow width={1200} count={68} />
      ) : variant === 'underline' ? (
        <StitchRow width={150} count={9} />
      ) : (
        <StitchArc />
      )}
    </div>
  )
}
