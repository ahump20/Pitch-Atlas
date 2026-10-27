import { useId, useMemo } from 'react'
import { BaseballCover } from './BaseballCover'
import { SPIN_AXIS, SEAM_VIEW_TILT, v, type Vec3 } from '../../lib/seam'
import { projectSeam, splitRuns, buildLacing } from '../../lib/seam2d'
import { solveHand, projectHand, type ProjectedSpine, type ProjectedPoint } from '../../lib/gripPose'
import { gripViewQuaternion, rotateByQuaternion } from '../../lib/gripView'
import { declutterLabels } from '../../lib/labelLayout'
import type { GripContactModel, GripView, Handedness } from '../../data/types'

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
// the picked-out finger, in the 3D hand's highlight (Hand.tsx)
const FINGER_ACTIVE = '#4B92DB'

// Finger labels wear the 3D pin's plate: stage ink, bone type, the highlight dot.
// Martian Mono advances 0.7em per glyph, so a plate is sized without measuring.
const LABEL_FONT = 7.5
const LABEL_TRACK = 0.8
const LABEL_PAD = 3.5
const LABEL_DOT = 1.6
const LABEL_H = 11.5

export interface SeamSchematicProps {
  className?: string
  showAxis?: boolean
  showStitches?: boolean
  showLabels?: boolean
  /** The pitch's render-space spin axis. Defaults to the four-seam's near-horizontal backspin. */
  spinAxis?: Vec3
  /** Gyro pitch (slider): the axis points toward the viewer and reads as a red dot. */
  gyro?: boolean
  /** Grip contacts to draw as solved finger silhouettes (the no-WebGL grip lab). */
  grip?: GripContactModel[]
  /** Which hand holds the ball; mirrors the silhouettes like the 3D hand. */
  view?: GripView
  referenceContacts?: GripContactModel[]
  handedness?: Handedness
  surface?: 'paper' | 'stage'
  title?: string
  /** The contact (by label) the reader picked out: its finger takes the 3D hand's highlight. */
  activeContact?: string
}

function spinePath(points: ProjectedSpine['points']): string {
  return points
    .map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x.toFixed(2)} ${p.y.toFixed(2)}`)
    .join(' ')
}

function outlinePath(points: ProjectedPoint[]): string {
  return `${points.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x.toFixed(2)} ${p.y.toFixed(2)}`).join(' ')} Z`
}

export function SeamSchematic({
  className = '',
  showAxis = true,
  showStitches = true,
  showLabels = true,
  spinAxis = SPIN_AXIS,
  gyro = false,
  grip,
  handedness = 'right',
  view,
  referenceContacts,
  surface = 'paper',
  title = 'A four-seam specimen. The seam is drawn as the closed figure-eight curve laid on the ball and oriented to the near-horizontal backspin axis.',
  activeContact,
}: SeamSchematicProps) {
  const uid = useId()
  const gradId = `leather-${uid}`
  const arrowId = `arrow-${uid}`
  const clipId = `cover-${uid}`

  const rotate = useMemo(() => {
    if (!view) return undefined
    const q = gripViewQuaternion(referenceContacts ?? grip ?? [], view)
    return (point: Vec3) => rotateByQuaternion(point, q)
  }, [view, referenceContacts, grip])
  const projected = useMemo(() => projectSeam(CX, CY, R, SEG, rotate), [rotate])
  const runs = useMemo(() => splitRuns(projected), [projected])
  const stitches = useMemo(
    () => (showStitches ? buildLacing(projected) : []),
    [projected, showStitches],
  )

  const axis = useMemo(() => {
    const a = rotate ? rotate(v.normalize(spinAxis)) : v.rotateAxis(v.normalize(spinAxis), SEAM_VIEW_TILT.axis, SEAM_VIEW_TILT.angle)
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
  }, [spinAxis, rotate])

  const axisAsDot = gyro || axis.inPlane < 0.34
  const stageSurface = surface === 'stage'
  // An empty title marks a purely decorative use (a thumbnail inside an
  // aria-hidden card). Hide it from assistive tech instead of emitting an
  // unnamed role="img", so the decorative case is self-describing.
  const decorative = !title

  // The same solver the 3D hand reads — the whole hand, not one finger at a
  // time: the contacts converging on knuckles and the palm behind them.
  // Projected through the same presentation tilt as the seam, so the flat draw
  // and the model can never disagree about the hold.
  const hand = useMemo(() => {
    if (!grip || grip.length === 0) return null
    return projectHand(
      solveHand(grip, { handedness, samples: 22 }),
      grip.map((g) => g.label),
      CX,
      CY,
      R,
      rotate,
    )
  }, [grip, handedness, rotate])

  const fingers = hand?.fingers ?? []

  // each name sits just above its fingertip, then the crowd is pulled apart and
  // kept inside the drawing
  const labels = useMemo(() => {
    if (!showLabels || !hand) return []
    const front = hand.fingers.filter((f) => f.contact.front)
    const boxes = front.map((f) => {
      const text = f.label.toUpperCase()
      return {
        x: f.points[0]?.x ?? f.contact.x,
        y: (f.points[0]?.y ?? f.contact.y) - 12,
        w: LABEL_PAD * 2 + LABEL_DOT * 2 + 2.5 + text.length * (LABEL_FONT * 0.7 + LABEL_TRACK),
        h: LABEL_H,
      }
    })
    const placed = declutterLabels(boxes, { width: CX * 2, height: CY * 2 }, { gap: 1.5, margin: 1 })
    return front.map((f, i) => ({ label: f.label, text: f.label.toUpperCase(), w: boxes[i].w, ...placed[i] }))
  }, [hand, showLabels])

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
        <marker id={arrowId} markerWidth="7" markerHeight="7" refX="3.5" refY="3.5" orient="auto">
          <path d="M0.5 0.5 L6 3.5 L0.5 6.5 Z" fill="var(--color-ink-3)" />
        </marker>
        {/* The hand is a whole hand now — it converges on knuckles and carries a
            palm, both of which sit off the ball. This is a 240px diagram of a
            baseball, so it shows the part of the hold that is on the cover and
            stops at the rim; a hand spilling past the frame taught nothing and
            read as a smear. */}
        <clipPath id={clipId}>
          <circle cx={CX} cy={CY} r={R} />
        </clipPath>
      </defs>

      <BaseballCover id={gradId} cx={CX} cy={CY} r={R} />

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

      {/* the hand behind the ball — dimmed, drawn under the seam */}
      <g clipPath={`url(#${clipId})`}>
        {hand && !hand.palm.front ? (
          <path d={outlinePath(hand.palm.outline)} fill={fingerTone} fillOpacity="0.14" />
        ) : null}
        {fingers
          .filter((f) => !f.contact.front)
          .map((f) => (
            <path
              key={`hb-${f.label}`}
              data-grip-finger={f.label}
              data-active={f.label === activeContact || undefined}
              d={spinePath(f.points)}
              fill="none"
              stroke={f.label === activeContact ? FINGER_ACTIVE : fingerTone}
              strokeOpacity={f.label === activeContact ? 0.55 : 0.22}
              strokeWidth={f.strokeWidth}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          ))}
      </g>

      <g clipPath={`url(#${clipId})`}>
        {runs.filter((run) => run.front).map((run, i) => (
          <path key={`f-${i}`} d={run.d} fill="none" stroke="#766F63"
            strokeWidth=".8" strokeLinecap="round" opacity=".75" />
        ))}
        {stitches.filter((stitch) => stitch.front).map((stitch, i) => (
          <g key={`s-${i}`}>
            <line x1={stitch.x1} y1={stitch.y1} x2={stitch.x2} y2={stitch.y2}
              stroke="#51473E" strokeWidth="1.8" strokeOpacity=".2" strokeLinecap="round" />
            <line x1={stitch.x1} y1={stitch.y1} x2={stitch.x2} y2={stitch.y2}
              stroke="#9E2B35" strokeWidth="1.1" strokeLinecap="round" />
          </g>
        ))}
      </g>

      {/* the hand in front of the ball — the hold itself */}
      <g clipPath={`url(#${clipId})`}>
        {hand && hand.palm.front ? (
          <path d={outlinePath(hand.palm.outline)} fill={fingerTone} fillOpacity="0.62" />
        ) : null}
        {fingers
          .filter((f) => f.contact.front)
          .map((f) => (
            <g key={`hf-${f.label}`}>
              <path
                data-grip-finger={f.label}
                data-active={f.label === activeContact || undefined}
                d={spinePath(f.points)}
                fill="none"
                stroke={f.label === activeContact ? FINGER_ACTIVE : fingerTone}
                strokeOpacity="0.92"
                strokeWidth={f.strokeWidth}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              {/* contact mark: where the finger meets the leather */}
              <circle
                cx={f.contact.x}
                cy={f.contact.y}
                r={f.label === activeContact ? 3.4 : 2.6}
                fill={f.label === activeContact ? FINGER_ACTIVE : 'var(--color-ink)'}
                opacity={f.label === activeContact ? 0.95 : 0.35}
              />
            </g>
          ))}
      </g>

      {/* the labels ride outside the clip — a name cut in half by the rim is
          worse than a name that overhangs it */}
      {labels.map((l) => {
        const active = l.label === activeContact
        return (
          <g key={`hl-${l.label}`} data-grip-label={l.label}>
            <rect
              x={(l.x - l.w / 2).toFixed(2)}
              y={(l.y - LABEL_H / 2).toFixed(2)}
              width={l.w.toFixed(2)}
              height={LABEL_H}
              rx="2"
              fill="var(--color-stage)"
              fillOpacity=".86"
              stroke={active ? 'var(--color-powder)' : '#F6F1E6'}
              strokeOpacity={active ? 0.7 : 0.2}
              strokeWidth=".6"
            />
            <circle cx={l.x - l.w / 2 + LABEL_PAD + LABEL_DOT} cy={l.y} r={active ? LABEL_DOT * 1.3 : LABEL_DOT} fill={FINGER_ACTIVE} />
            <text
              x={l.x - l.w / 2 + LABEL_PAD + LABEL_DOT * 2 + 2.5}
              y={l.y}
              dominantBaseline="central"
              fill="#F6F1E6"
              fontWeight="600"
              fontFamily="var(--font-mono)"
              fontSize={LABEL_FONT}
              letterSpacing={LABEL_TRACK}
            >
              {l.text}
            </text>
          </g>
        )
      })}
    </svg>
  )
}
