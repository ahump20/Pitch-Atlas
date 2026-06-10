import { useId, useMemo } from 'react'
import { SPIN_AXIS, SEAM_VIEW_TILT, v, type Vec3 } from '../../lib/seam'
import { projectSeam, splitRuns, buildStitches } from '../../lib/seam2d'
import { solveGripPose, projectSpine, type ProjectedSpine } from '../../lib/gripPose'
import type { GripContactModel, Handedness } from '../../data/types'

/*
  The 2D twin of the 3D ball, drawn from the same seam-point function. Roles:
  the no-WebGL visual, the reduced-motion specimen, and the target the 3D ball
  dissolves into. Static by design. The 3D layer owns motion; this owns truth.
  The seam is one baseball cover for every pitch; the axis line is the pitch's
  own spin axis. A gyro pitch's axis points at the viewer, so it reads as a dot.
  When grip contacts are supplied it draws the same solved finger spines the 3D
  hand sweeps — silhouettes from gripPose.ts — so the no-WebGL and reduced-motion
  paths still teach the actual hold, never a naked ball with abstract dots.
*/

const SEG = 280
const R = 86
const CX = 120
const CY = 120

// The plaster silhouette tones — the 2D twin of the 3D specimen hand.
const FINGER_STAGE = '#C8BEAC'
const FINGER_PAPER = '#8A8174'

export interface SeamSchematicProps {
  className?: string
  showAxis?: boolean
  showStitches?: boolean
  /** The pitch's render-space spin axis. Defaults to the four-seam's near-horizontal backspin. */
  spinAxis?: Vec3
  /** Gyro pitch (slider): the axis points toward the viewer and reads as a red dot. */
  gyro?: boolean
  /** Grip contacts to draw as solved finger silhouettes (the no-WebGL grip lab). */
  grip?: GripContactModel[]
  /** Which hand holds the ball; mirrors the silhouettes like the 3D hand. */
  handedness?: Handedness
  surface?: 'paper' | 'stage'
  title?: string
}

function spinePath(points: ProjectedSpine['points']): string {
  return points
    .map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x.toFixed(2)} ${p.y.toFixed(2)}`)
    .join(' ')
}

export function SeamSchematic({
  className = '',
  showAxis = true,
  showStitches = true,
  spinAxis = SPIN_AXIS,
  gyro = false,
  grip,
  handedness = 'right',
  surface = 'paper',
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
    const a = v.rotateAxis(v.normalize(spinAxis), SEAM_VIEW_TILT.axis, SEAM_VIEW_TILT.angle)
    const reach = R * 1.34
    return {
      x1: CX - a.x * reach,
      y1: CY + a.y * reach,
      x2: CX + a.x * reach,
      y2: CY - a.y * reach,
      // in-plane length tells us whether the axis lies along the screen (line) or
      // points at the viewer (dot, for a gyro pitch).
      inPlane: Math.hypot(a.x, a.y),
    }
  }, [spinAxis])

  const axisAsDot = gyro || axis.inPlane < 0.34
  const stageSurface = surface === 'stage'
  // An empty title marks a purely decorative use (a thumbnail inside an
  // aria-hidden card). Hide it from assistive tech instead of emitting an
  // unnamed role="img", so the decorative case is self-describing.
  const decorative = !title

  // The same solver the 3D hand reads: each contact becomes a finger spine,
  // projected through the same presentation tilt as the seam itself.
  const fingers = useMemo(() => {
    if (!grip || grip.length === 0) return []
    return grip.map((g) => ({
      label: g.label,
      spine: projectSpine(solveGripPose(g, { handedness, samples: 20 }), CX, CY, R),
    }))
  }, [grip, handedness])

  const fingerTone = stageSurface ? FINGER_STAGE : FINGER_PAPER

  return (
    <svg
      viewBox="0 0 240 240"
      className={className}
      {...(decorative ? { 'aria-hidden': true } : { role: 'img', 'aria-label': title })}
      xmlns="http://www.w3.org/2000/svg"
    >
      {decorative ? null : <title>{title}</title>}
      <defs>
        <radialGradient id={gradId} cx="38%" cy="32%" r="72%">
          <stop offset="0%" stopColor={stageSurface ? '#FBF7EC' : '#16171C'} />
          <stop offset="62%" stopColor={stageSurface ? '#EDE3CF' : '#101116'} />
          <stop offset="100%" stopColor={stageSurface ? '#D6CDB8' : '#070709'} />
        </radialGradient>
        <marker id={arrowId} markerWidth="7" markerHeight="7" refX="3.5" refY="3.5" orient="auto">
          <path d="M0.5 0.5 L6 3.5 L0.5 6.5 Z" fill="var(--color-ink-3)" />
        </marker>
      </defs>

      <circle cx={CX} cy={CY} r={R} fill={`url(#${gradId})`} />
      <circle
        cx={CX}
        cy={CY}
        r={R}
        fill="none"
        stroke={stageSurface ? 'var(--color-bone)' : 'var(--color-ink-3)'}
        strokeOpacity={stageSurface ? '0.24' : '0.5'}
        strokeWidth="1"
      />

      {showAxis && !axisAsDot ? (
        <line
          x1={axis.x1}
          y1={axis.y1}
          x2={axis.x2}
          y2={axis.y2}
          stroke="var(--color-ink-3)"
          strokeWidth="1"
          strokeDasharray="2 3"
          markerEnd={`url(#${arrowId})`}
          markerStart={`url(#${arrowId})`}
          opacity="0.9"
        />
      ) : null}

      {showAxis && axisAsDot ? (
        <>
          <circle cx={CX} cy={CY} r="6.5" fill="none" stroke="var(--color-ink-3)" strokeWidth="1" strokeDasharray="2 3" opacity="0.7" />
          <circle cx={CX} cy={CY} r="3" fill="var(--color-seam)" />
        </>
      ) : null}

      {/* finger silhouettes behind the ball — dimmed, drawn under the seam */}
      {fingers
        .filter((f) => !f.spine.contact.front)
        .map((f) => (
          <path
            key={`hb-${f.label}`}
            data-grip-finger={f.label}
            d={spinePath(f.spine.points)}
            fill="none"
            stroke={fingerTone}
            strokeOpacity="0.22"
            strokeWidth={f.spine.strokeWidth}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        ))}

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

      {/* finger silhouettes in front of the ball — the hold itself, labeled */}
      {fingers
        .filter((f) => f.spine.contact.front)
        .map((f) => (
          <g key={`hf-${f.label}`}>
            <path
              data-grip-finger={f.label}
              d={spinePath(f.spine.points)}
              fill="none"
              stroke={fingerTone}
              strokeOpacity="0.92"
              strokeWidth={f.spine.strokeWidth}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {/* contact mark: where the finger meets the leather */}
            <circle
              cx={f.spine.contact.x}
              cy={f.spine.contact.y}
              r="2.6"
              fill="var(--color-ink)"
              opacity="0.35"
            />
            <text
              x={f.spine.points[0]?.x ?? f.spine.contact.x}
              y={(f.spine.points[0]?.y ?? f.spine.contact.y) - 9}
              fill={stageSurface ? 'var(--color-bone)' : 'var(--color-ink)'}
              fontFamily="var(--font-mono)"
              fontSize="7.5"
              letterSpacing="0.8"
              textAnchor="middle"
            >
              {f.label.toUpperCase()}
            </text>
          </g>
        ))}
    </svg>
  )
}
