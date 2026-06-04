import { useId, useMemo } from 'react'
import { SPIN_AXIS, SEAM_VIEW_TILT, v } from '../../lib/seam'
import { projectSeam, splitRuns, buildStitches } from '../../lib/seam2d'

/*
  The 2D twin of the 3D ball, drawn from the same seam-point function. Roles:
  the no-WebGL visual, the reduced-motion specimen, and the target the 3D ball
  dissolves into. Static by design. The 3D layer owns motion; this owns truth.
*/

const SEG = 280
const R = 86
const CX = 120
const CY = 120

export interface SeamSchematicProps {
  className?: string
  showAxis?: boolean
  showStitches?: boolean
  title?: string
}

export function SeamSchematic({
  className = '',
  showAxis = true,
  showStitches = true,
  title = 'A four-seam specimen. The seam is drawn as the closed figure-eight curve laid on the ball and oriented to the near-horizontal backspin axis.',
}: SeamSchematicProps) {
  const uid = useId()
  const gradId = `leather-${uid}`
  const arrowId = `arrow-${uid}`

  const projected = useMemo(() => projectSeam(CX, CY, R, SEG), [])
  const runs = useMemo(() => splitRuns(projected), [projected])
  const stitches = useMemo(
    () => (showStitches ? buildStitches(projected) : []),
    [projected, showStitches],
  )

  const axis = useMemo(() => {
    const a = v.rotateAxis(SPIN_AXIS, SEAM_VIEW_TILT.axis, SEAM_VIEW_TILT.angle)
    const reach = R * 1.34
    return {
      x1: CX - a.x * reach,
      y1: CY + a.y * reach,
      x2: CX + a.x * reach,
      y2: CY - a.y * reach,
    }
  }, [])

  return (
    <svg
      viewBox="0 0 240 240"
      className={className}
      role="img"
      aria-label={title}
      xmlns="http://www.w3.org/2000/svg"
    >
      <title>{title}</title>
      <defs>
        <radialGradient id={gradId} cx="38%" cy="32%" r="72%">
          <stop offset="0%" stopColor="#262a33" />
          <stop offset="62%" stopColor="#15171d" />
          <stop offset="100%" stopColor="#0b0c0f" />
        </radialGradient>
        <marker id={arrowId} markerWidth="7" markerHeight="7" refX="3.5" refY="3.5" orient="auto">
          <path d="M0.5 0.5 L6 3.5 L0.5 6.5 Z" fill="var(--color-dim)" />
        </marker>
      </defs>

      <circle cx={CX} cy={CY} r={R} fill={`url(#${gradId})`} />
      <circle cx={CX} cy={CY} r={R} fill="none" stroke="var(--color-machined)" strokeWidth="1" />

      {showAxis ? (
        <line
          x1={axis.x1}
          y1={axis.y1}
          x2={axis.x2}
          y2={axis.y2}
          stroke="var(--color-dim)"
          strokeWidth="1"
          strokeDasharray="2 3"
          markerEnd={`url(#${arrowId})`}
          markerStart={`url(#${arrowId})`}
          opacity="0.9"
        />
      ) : null}

      {runs
        .filter((r) => !r.front)
        .map((r, i) => (
          <path
            key={`b-${i}`}
            d={r.d}
            fill="none"
            stroke="var(--color-seam)"
            strokeOpacity="0.22"
            strokeWidth="2"
            strokeLinecap="round"
          />
        ))}

      {stitches
        .filter((s) => s.front)
        .map((s, i) => (
          <line
            key={`s-${i}`}
            x1={s.x1}
            y1={s.y1}
            x2={s.x2}
            y2={s.y2}
            stroke="var(--color-seam)"
            strokeOpacity="0.75"
            strokeWidth="1"
            strokeLinecap="round"
          />
        ))}

      {runs
        .filter((r) => r.front)
        .map((r, i) => (
          <path
            key={`f-${i}`}
            d={r.d}
            fill="none"
            stroke="var(--color-seam)"
            strokeWidth="2.4"
            strokeLinecap="round"
          />
        ))}
    </svg>
  )
}
