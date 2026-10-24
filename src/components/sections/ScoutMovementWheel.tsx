import type { PitchMotion } from '../../data/types'
import { movementWheel, WHEEL_CENTER, WHEEL_VIEW } from './movementWheel'

/*
  The movement wheel on the scout-file back. A target seen from the mound, arm side
  right, that plots the pitch's break DIRECTION and its spin axis — both straight off the sourced
  PitchMotion record: the verticalShape / horizontalDir enums and the render-only
  spin-axis vector that already drives the 3D ball. It is a DIRECTION read, never a
  magnitude — the arrow points where the pitch breaks at a fixed length, because the
  data model stores no measured break-in-inches by design. A knuckleball
  (indeterminateBreak) shows scatter, not a confident arrow. No motion record →
  nothing renders, so unfiled pitches degrade cleanly. Source boundaries remain visible.
  The geometry lives in movementWheel, which the export's canvas back draws too.
*/

const f = (n: number) => n.toFixed(1)
const RING_STROKES = ['rgba(246,241,230,.16)', 'rgba(246,241,230,.10)', 'rgba(246,241,230,.08)']

export function ScoutMovementWheel({
  motion,
  accent,
}: {
  motion?: PitchMotion
  accent: { c1: string; c2: string; c3: string }
}) {
  const w = movementWheel(motion)
  const cx = WHEEL_CENTER
  const cy = WHEEL_CENTER
  const rings = w.rings.map((r, i) => <circle key={i} cx={cx} cy={cy} r={r} fill="none" stroke={RING_STROKES[i]} strokeWidth="1" />)

  if (!w.filed) {
    const flat = w.flatLine!
    return (
      <figure className="rfx-wheel is-empty">
        <svg viewBox={`0 0 ${WHEEL_VIEW} ${WHEEL_VIEW}`} role="img" aria-label={w.ariaLabel}>
          {rings}
          <line x1={flat.x1} y1={flat.y1} x2={flat.x2} y2={flat.y2} stroke={accent.c3} strokeOpacity="0.28" strokeWidth="2.2" strokeLinecap="round" />
        </svg>
        <figcaption>
          <span className="rfx-wheel-dir">{w.label}</span>
          <span className="rfx-wheel-note">{w.note}</span>
        </figcaption>
      </figure>
    )
  }

  const axis = w.axis!
  return (
    <figure className="rfx-wheel">
      <svg viewBox={`0 0 ${WHEEL_VIEW} ${WHEEL_VIEW}`} role="img" aria-label={w.ariaLabel}>
        {/* target rings */}
        {rings}
        {/* clock ticks at 12 / 3 / 6 / 9 */}
        {w.ticks.map((t, i) => (
          <line key={i} x1={f(t.x1)} y1={f(t.y1)} x2={f(t.x2)} y2={f(t.y2)} stroke="rgba(246,241,230,.28)" strokeWidth="1.4" />
        ))}
        {/* the render-only spin axis the ball turns on */}
        <line
          x1={f(axis.x1)}
          y1={f(axis.y1)}
          x2={f(axis.x2)}
          y2={f(axis.y2)}
          stroke={accent.c3}
          strokeOpacity="0.42"
          strokeWidth="1.4"
          strokeDasharray="4 4"
        />
        {w.scatter.map((s, i) => (
          <circle key={i} cx={f(s.x)} cy={f(s.y)} r="3.4" fill={accent.c3} opacity="0.7" />
        ))}
        {w.arrow ? (
          <>
            <line x1={cx} y1={cy} x2={f(w.arrow.shaft.x2)} y2={f(w.arrow.shaft.y2)} stroke={accent.c3} strokeWidth="3.2" strokeLinecap="round" />
            <path
              d={w.arrow.head.map((h) => `M ${h.x1} ${h.y1} L ${f(h.x2)} ${f(h.y2)}`).join(' ')}
              stroke={accent.c3}
              strokeWidth="3.2"
              fill="none"
              strokeLinecap="round"
            />
          </>
        ) : null}
        {w.centerDot ? <circle cx={cx} cy={cy} r={w.centerDot} fill={accent.c3} /> : null}
        {w.gyro ? (
          <>
            <circle cx={cx} cy={cy} r="6.5" fill="#FF2433" />
            <circle cx={cx} cy={cy} r="6.5" fill="none" stroke="#fff" strokeWidth="1.1" opacity="0.9" />
          </>
        ) : null}
      </svg>
      <figcaption>
        <span className="rfx-wheel-dir">{w.label}</span>
        <span className="rfx-wheel-note">{w.note}</span>
      </figcaption>
    </figure>
  )
}
