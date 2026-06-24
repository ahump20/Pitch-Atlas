import { v, SEAM_VIEW_TILT } from '../../lib/seam'
import type { PitchMotion } from '../../data/types'

/*
  The movement wheel on the scout-file back. A catcher's-eye target that plots the
  pitch's break DIRECTION and its spin axis — both straight off the sourced
  PitchMotion record: the verticalShape / horizontalDir enums and the render-only
  spin-axis vector that already drives the 3D ball. It is a DIRECTION read, never a
  magnitude — the arrow points where the pitch breaks at a fixed length, because the
  data model stores no measured break-in-inches by design. A knuckleball
  (indeterminateBreak) shows scatter, not a confident arrow. No motion record →
  nothing renders, so unfiled pitches degrade cleanly. Sourced, not corrected.
*/

const VERT: Record<PitchMotion['verticalShape'], { dy: number; word: string }> = {
  ride: { dy: -1, word: 'Rides' },
  drop: { dy: 1, word: 'Drops' },
  flat: { dy: 0, word: 'Holds plane' },
}
const HORZ: Record<PitchMotion['horizontalDir'], { dx: number; word: string }> = {
  'arm-side': { dx: 1, word: 'arm-side run' },
  'glove-side': { dx: -1, word: 'glove-side' },
  none: { dx: 0, word: '' },
}

export function ScoutMovementWheel({
  motion,
  accent,
}: {
  motion?: PitchMotion
  accent: { c1: string; c2: string; c3: string }
}) {
  const W = 200
  const H = 200
  const cx = 100
  const cy = 100
  const R = 78

  if (!motion) {
    return (
      <figure className="rfx-wheel is-empty">
        <svg
          viewBox={`0 0 ${W} ${H}`}
          role="img"
          aria-label="Break direction not filed. No motion record is shown because Pitch Atlas has not sourced one."
        >
          <circle cx={cx} cy={cy} r={R} fill="none" stroke="rgba(246,241,230,.16)" strokeWidth="1" />
          <circle cx={cx} cy={cy} r={R * 0.62} fill="none" stroke="rgba(246,241,230,.10)" strokeWidth="1" />
          <circle cx={cx} cy={cy} r={R * 0.28} fill="none" stroke="rgba(246,241,230,.08)" strokeWidth="1" />
          <line x1={cx - 34} y1={cy} x2={cx + 34} y2={cy} stroke={accent.c3} strokeOpacity="0.28" strokeWidth="2.2" strokeLinecap="round" />
        </svg>
        <figcaption>
          <span className="rfx-wheel-dir">Motion not filed</span>
          <span className="rfx-wheel-note">source gap · no estimate</span>
        </figcaption>
      </figure>
    )
  }

  const vert = VERT[motion.verticalShape]
  const horz = HORZ[motion.horizontalDir]

  // spin axis projected the same way the seam ball projects it, so the wheel and
  // the ball can never disagree about which way the axis tilts.
  const sa = v.rotateAxis(v.normalize(motion.spinAxis), SEAM_VIEW_TILT.axis, SEAM_VIEW_TILT.angle)
  const axk = R * 0.94
  const axEx = cx + sa.x * axk
  const axEy = cy - sa.y * axk
  const axSx = cx - sa.x * axk
  const axSy = cy + sa.y * axk

  // break direction from the categorical enums; fixed length (a direction, not a
  // measured magnitude). arm-side points right, ride points up — a presentation
  // choice, the catcher's-eye orientation, never a claim about how far it moves.
  let dx = horz.dx
  let dy = vert.dy
  const mag = Math.hypot(dx, dy)
  const indeterminate = Boolean(motion.indeterminateBreak) || (mag === 0 && !motion.gyro)
  if (mag > 0) {
    dx /= mag
    dy /= mag
  }
  const arrowLen = R * 0.64
  const ax = cx + dx * arrowLen
  const ay = cy + dy * arrowLen
  const aang = Math.atan2(ay - cy, ax - cx)
  const headPath = (() => {
    const L = 11
    const w = 0.45
    return `M ${ax} ${ay} L ${(ax - L * Math.cos(aang - w)).toFixed(1)} ${(ay - L * Math.sin(aang - w)).toFixed(1)} M ${ax} ${ay} L ${(ax - L * Math.cos(aang + w)).toFixed(1)} ${(ay - L * Math.sin(aang + w)).toFixed(1)}`
  })()

  // a deterministic scatter for the knuckleball (no Date / no random — prerenders clean)
  const scatter = [0, 1, 2, 3, 4, 5].map((i) => {
    const a = (i / 6) * Math.PI * 2 + 0.7
    const rr = R * (0.3 + 0.13 * (i % 3))
    return { x: cx + Math.cos(a) * rr, y: cy + Math.sin(a) * rr }
  })

  const label = indeterminate
    ? 'No fixed shape'
    : [vert.word, horz.word].filter(Boolean).join(' · ') || motion.forceLabel

  return (
    <figure className="rfx-wheel">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        role="img"
        aria-label={`Break direction: ${label}. Spin axis shown. ${motion.forceLabel}. Direction only, never a measured magnitude.`}
      >
        {/* catcher's-eye target rings */}
        <circle cx={cx} cy={cy} r={R} fill="none" stroke="rgba(246,241,230,.16)" strokeWidth="1" />
        <circle cx={cx} cy={cy} r={R * 0.62} fill="none" stroke="rgba(246,241,230,.10)" strokeWidth="1" />
        <circle cx={cx} cy={cy} r={R * 0.28} fill="none" stroke="rgba(246,241,230,.08)" strokeWidth="1" />
        {/* clock ticks at 12 / 3 / 6 / 9 */}
        {[0, 90, 180, 270].map((deg) => {
          const a = (deg / 180) * Math.PI
          return (
            <line
              key={deg}
              x1={(cx + Math.sin(a) * (R - 6)).toFixed(1)}
              y1={(cy - Math.cos(a) * (R - 6)).toFixed(1)}
              x2={(cx + Math.sin(a) * R).toFixed(1)}
              y2={(cy - Math.cos(a) * R).toFixed(1)}
              stroke="rgba(246,241,230,.28)"
              strokeWidth="1.4"
            />
          )
        })}
        {/* the render-only spin axis the ball turns on */}
        <line
          x1={axSx.toFixed(1)}
          y1={axSy.toFixed(1)}
          x2={axEx.toFixed(1)}
          y2={axEy.toFixed(1)}
          stroke={accent.c3}
          strokeOpacity="0.42"
          strokeWidth="1.4"
          strokeDasharray="4 4"
        />
        {indeterminate ? (
          scatter.map((s, i) => (
            <circle key={i} cx={s.x.toFixed(1)} cy={s.y.toFixed(1)} r="3.4" fill={accent.c3} opacity="0.7" />
          ))
        ) : mag > 0 ? (
          <>
            <line x1={cx} y1={cy} x2={ax.toFixed(1)} y2={ay.toFixed(1)} stroke={accent.c3} strokeWidth="3.2" strokeLinecap="round" />
            <path d={headPath} stroke={accent.c3} strokeWidth="3.2" fill="none" strokeLinecap="round" />
            <circle cx={cx} cy={cy} r="4" fill={accent.c3} />
          </>
        ) : (
          <circle cx={cx} cy={cy} r="5" fill={accent.c3} />
        )}
        {motion.gyro ? (
          <>
            <circle cx={cx} cy={cy} r="6.5" fill="#FF2433" />
            <circle cx={cx} cy={cy} r="6.5" fill="none" stroke="#fff" strokeWidth="1.1" opacity="0.9" />
          </>
        ) : null}
      </svg>
      <figcaption>
        <span className="rfx-wheel-dir">{label}</span>
        <span className="rfx-wheel-note">{motion.forceLabel} · direction only</span>
      </figcaption>
    </figure>
  )
}
