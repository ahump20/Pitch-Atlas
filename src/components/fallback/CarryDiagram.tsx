import { useId, useMemo } from 'react'
import { projectSeam, splitRuns } from '../../lib/seam2d'

/*
  The gravity ghost, told in 2D. A spinless phantom falls on gravity alone while
  the real four-seam holds flatter; the gap between them at the plate is the carry.
  Shown as shape, not a measured number — the ride is real; how far it rides depends
  on the arm. The 2D twin of the 3D ghost, and the reduced-motion / no-WebGL climax.
*/

const REAL = { x: 300, y: 96, r: 19 }
const GHOST = { x: 300, y: 150, r: 19 }

export interface CarryDiagramProps {
  className?: string
}

export function CarryDiagram({ className = '' }: CarryDiagramProps) {
  const uid = useId()
  const gradId = `leather-carry-${uid}`

  const realSeam = useMemo(() => splitRuns(projectSeam(REAL.x, REAL.y, REAL.r, 200)), [])
  const title = `Carry. A spinless ball falls on gravity alone while the four-seam holds flatter. The gap at the plate is the carry — it rides; it never literally rises.`

  return (
    <svg
      viewBox="0 0 360 210"
      className={className}
      role="img"
      aria-label={title}
      xmlns="http://www.w3.org/2000/svg"
    >
      <title>{title}</title>
      <defs>
        <radialGradient id={gradId} cx="38%" cy="32%" r="72%">
          <stop offset="0%" stopColor="#16171C" />
          <stop offset="62%" stopColor="#101116" />
          <stop offset="100%" stopColor="#070709" />
        </radialGradient>
      </defs>

      {/* release point */}
      <circle cx="30" cy="64" r="2.5" fill="var(--color-ink-2)" />
      <text x="30" y="52" fill="var(--color-ink-2)" fontFamily="var(--font-mono)" fontSize="8" letterSpacing="1.5" textAnchor="middle">
        RELEASE
      </text>

      {/* spinless trajectory: gravity only */}
      <path
        d={`M 30 64 C 150 96, 240 134, ${GHOST.x} ${GHOST.y}`}
        fill="none"
        stroke="var(--color-ink-2)"
        strokeWidth="1.25"
        strokeDasharray="3 4"
        opacity="0.8"
      />
      {/* four-seam trajectory: rides flatter */}
      <path
        d={`M 30 64 C 150 76, 235 90, ${REAL.x} ${REAL.y}`}
        fill="none"
        stroke="var(--color-seam)"
        strokeWidth="2"
      />

      {/* spinless phantom ball */}
      <circle cx={GHOST.x} cy={GHOST.y} r={GHOST.r} fill="#101116" stroke="var(--color-ink-2)" strokeWidth="1" strokeDasharray="3 3" opacity="0.7" />
      <text x={GHOST.x} y={GHOST.y + GHOST.r + 13} fill="var(--color-ink-2)" fontFamily="var(--font-mono)" fontSize="8.5" letterSpacing="1" textAnchor="middle">
        SPINLESS
      </text>

      {/* real ball with its seam */}
      <circle cx={REAL.x} cy={REAL.y} r={REAL.r} fill={`url(#${gradId})`} />
      <circle cx={REAL.x} cy={REAL.y} r={REAL.r} fill="none" stroke="var(--color-ink-3)" strokeWidth="0.8" />
      {realSeam
        .filter((s) => !s.front)
        .map((s, i) => (
          <path key={`cb-${i}`} d={s.d} fill="none" stroke="var(--color-seam)" strokeOpacity="0.22" strokeWidth="1.4" strokeLinecap="round" />
        ))}
      {realSeam
        .filter((s) => s.front)
        .map((s, i) => (
          <path key={`cf-${i}`} d={s.d} fill="none" stroke="var(--color-seam)" strokeWidth="1.7" strokeLinecap="round" />
        ))}
      <text x={REAL.x} y={REAL.y - REAL.r - 7} fill="var(--color-ink)" fontFamily="var(--font-mono)" fontSize="8.5" letterSpacing="1" textAnchor="middle">
        FOUR-SEAM
      </text>

      {/* the carry: the gap between the two, marked as shape, not a number */}
      <g stroke="var(--color-seam)" strokeWidth="1">
        <line x1="338" y1={REAL.y} x2="338" y2={GHOST.y} />
        <line x1="333" y1={REAL.y} x2="343" y2={REAL.y} />
        <line x1="333" y1={GHOST.y} x2="343" y2={GHOST.y} />
      </g>
      <text
        x="346"
        y={(REAL.y + GHOST.y) / 2}
        fill="var(--color-seam)"
        fontFamily="var(--font-mono)"
        fontSize="9"
        letterSpacing="1.5"
        dominantBaseline="middle"
        transform={`rotate(90 346 ${(REAL.y + GHOST.y) / 2})`}
        textAnchor="middle"
      >
        CARRY
      </text>
    </svg>
  )
}
