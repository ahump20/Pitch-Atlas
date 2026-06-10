import { useId } from 'react'

/*
  The Pitch Atlas brand lockup. The mark is the idea: a leather-edged diamond
  holding a cream baseball whose seam reads as atlas meridians — the seam is the
  map. Saddle-leather edge, warm-black inner bezel, the ball with two longitude
  ellipses and the real red horseshoe seam + stitches. Static (no animation) so
  it stays crisp and reduced-motion-safe; the holographic life lives in the
  cards, not the logo. The wordmark prints in currentColor, so it reads ink on
  the cream masthead and bone on the leather footer.

  The diamond + ball carry no text, so the SVG is aria-hidden and the wordmark
  text carries the accessible name. `useId` gives each instance unique gradient
  ids (SSR-safe, deterministic across hydration) so multiple marks on one page
  never collide. Sizes: sm masthead, md default/footer, lg hero. `wordmark` off
  renders the mark alone.
*/
type Size = 'sm' | 'md' | 'lg'

const MARK_PX: Record<Size, number> = { sm: 32, md: 44, lg: 56 }
const WORDMARK_SIZE: Record<Size, string> = {
  sm: '20px',
  md: '30px',
  lg: 'clamp(30px, 5.2vw, 58px)',
}

export function BrandMark({
  size = 'md',
  wordmark = true,
  className,
}: {
  size?: Size
  wordmark?: boolean
  className?: string
}) {
  const px = MARK_PX[size]
  const uid = useId().replace(/:/g, '')
  const foil = `pa-foil-${uid}`
  const ball = `pa-ball-${uid}`

  // Six stitch pairs down each side of the seam, tucked toward the ball's center.
  const stitches = Array.from({ length: 6 }, (_, i) => {
    const y = 39 + i * 4.4
    const drift = Math.abs(i - 2.5) * 0.5
    return (
      <g key={i}>
        <line x1={35.5 + drift} y1={y} x2={39.5 + drift} y2={y - 1.5} />
        <line x1={60.5 - drift} y1={y} x2={64.5 - drift} y2={y - 1.5} />
      </g>
    )
  })

  return (
    <span className={`inline-flex items-center gap-3 ${className ?? ''}`}>
      <svg
        width={px}
        height={px}
        viewBox="0 0 100 100"
        aria-hidden="true"
        className="shrink-0"
        style={{ filter: 'drop-shadow(0 2px 6px rgba(0,0,0,.5))' }}
      >
        <defs>
          <linearGradient id={foil} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#5E3A22" />
            <stop offset="36%" stopColor="#9C7350" />
            <stop offset="60%" stopColor="#6B4528" />
            <stop offset="100%" stopColor="#3A2414" />
          </linearGradient>
          <radialGradient id={ball} cx="40%" cy="32%" r="75%">
            <stop offset="0%" stopColor="#FFFCF4" />
            <stop offset="70%" stopColor="#EFE7D4" />
            <stop offset="100%" stopColor="#C9B997" />
          </radialGradient>
        </defs>
        <rect x="14" y="14" width="72" height="72" rx="16" transform="rotate(45 50 50)" fill={`url(#${foil})`} />
        <rect x="19" y="19" width="62" height="62" rx="13" transform="rotate(45 50 50)" fill="#16120D" />
        <circle cx="50" cy="50" r="22" fill={`url(#${ball})`} />
        {/* meridians: the seam reads as a map */}
        <ellipse cx="50" cy="50" rx="9" ry="22" fill="none" stroke="#37D6FF" strokeWidth="1" opacity="0.45" />
        <ellipse cx="50" cy="50" rx="18" ry="22" fill="none" stroke="#37D6FF" strokeWidth="1" opacity="0.3" />
        {/* the real red horseshoe seam */}
        <path d="M34 36 Q44 50 34 64" fill="none" stroke="#FF2433" strokeWidth="2.4" strokeLinecap="round" />
        <path d="M66 36 Q56 50 66 64" fill="none" stroke="#FF2433" strokeWidth="2.4" strokeLinecap="round" />
        <g stroke="#FF2433" strokeWidth="1.1" opacity="0.9">
          {stitches}
        </g>
      </svg>
      {wordmark ? (
        <span className="rfx-athletic rfx-skew leading-none" style={{ fontSize: WORDMARK_SIZE[size] }}>
          Pitch <span className="text-seam">Atlas</span>
        </span>
      ) : null}
    </span>
  )
}
