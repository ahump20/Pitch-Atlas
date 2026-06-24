import type { PitchMotion } from '../../data/types'

type WheelPoint = { x: number; y: number }

export interface ScoutMovementWheelProps {
  motion?: PitchMotion | null
  sourceTier?: string
  className?: string
}

const VERTICAL_COPY: Record<PitchMotion['verticalShape'], string> = {
  ride: 'Ride',
  drop: 'Drop',
  flat: 'Flat plane',
}

const HORIZONTAL_COPY: Record<PitchMotion['horizontalDir'], string> = {
  'arm-side': 'Arm-side run',
  'glove-side': 'Glove-side sweep',
  none: 'No fixed horizontal bend',
}

function pointFor(motion: PitchMotion): WheelPoint {
  const x = motion.horizontalDir === 'arm-side' ? 32 : motion.horizontalDir === 'glove-side' ? 68 : 50
  const y = motion.verticalShape === 'ride' ? 30 : motion.verticalShape === 'drop' ? 72 : 50
  return { x, y }
}

function movementPhrase(motion?: PitchMotion | null): string {
  if (!motion) return 'Movement record unfiled'
  if (motion.indeterminateBreak) return 'Indeterminate break: shape varies by release'

  const vertical = VERTICAL_COPY[motion.verticalShape]
  const horizontal = HORIZONTAL_COPY[motion.horizontalDir]
  return motion.horizontalDir === 'none' ? `${vertical} with no fixed horizontal bend` : `${vertical} · ${horizontal}`
}

function axisPhrase(motion?: PitchMotion | null): string {
  if (!motion) return 'No verified spin-axis read on file'
  if (motion.gyro) return 'Gyro-forward spin axis'

  const ax = Math.abs(motion.spinAxis.x)
  const ay = Math.abs(motion.spinAxis.y)
  const az = Math.abs(motion.spinAxis.z)
  if (az > ax && az > ay) return "Axis points through the catcher-view plane"
  if (ay > ax) return 'North-south spin-axis lean'
  return motion.spinAxis.x >= 0 ? 'Glove-side spin-axis lean' : 'Arm-side spin-axis lean'
}

function pointLabel(motion: PitchMotion): string {
  if (motion.horizontalDir !== 'none') return HORIZONTAL_COPY[motion.horizontalDir]
  return VERTICAL_COPY[motion.verticalShape]
}

export function ScoutMovementWheel({ motion, sourceTier = 'Unverified', className }: ScoutMovementWheelProps) {
  const empty = !motion
  const indeterminate = Boolean(motion?.indeterminateBreak)
  const plottedMotion = motion && !indeterminate ? motion : null
  const point = plottedMotion ? pointFor(plottedMotion) : null
  const pointCopy = plottedMotion ? pointLabel(plottedMotion) : ''
  const classes = ['scout-wheel', empty ? 'is-empty' : '', indeterminate ? 'is-indeterminate' : '', className ?? '']
    .filter(Boolean)
    .join(' ')

  return (
    <figure className={classes} aria-label="Sourced movement wheel">
      <svg className="scout-wheel__svg" viewBox="0 0 100 100" aria-hidden="true">
        <circle className="scout-wheel__ring" cx="50" cy="50" r="36" />
        <circle className="scout-wheel__axis" cx="50" cy="50" r="3" />
        <path className="scout-wheel__cross" d="M50 14v72M14 50h72" />
        <text className="scout-wheel__label" x="50" y="11" textAnchor="middle">
          RIDE
        </text>
        <text className="scout-wheel__label" x="50" y="94" textAnchor="middle">
          DROP
        </text>
        <text className="scout-wheel__label" x="8" y="53" textAnchor="start">
          ARM
        </text>
        <text className="scout-wheel__label" x="92" y="53" textAnchor="end">
          GLOVE
        </text>
        {point ? (
          <>
            <path className="scout-wheel__ray" d={`M50 50 L${point.x} ${point.y}`} />
            <circle className="scout-wheel__dot" cx={point.x} cy={point.y} r="5.5" />
            <text className="scout-wheel__label" x={point.x} y={point.y > 58 ? point.y - 9 : point.y + 13} textAnchor="middle">
              {pointCopy}
            </text>
          </>
        ) : (
          <circle className="scout-wheel__pending" cx="50" cy="50" r="24" />
        )}
      </svg>

      <figcaption className="scout-wheel__caption">
        <span className="scout-wheel__eyebrow">Movement wheel</span>
        <strong className="scout-wheel__read">{movementPhrase(motion)}</strong>
        <em className="scout-wheel__axis-copy">{axisPhrase(motion)}</em>
        <p className="scout-wheel__tier">
          <span className="scout-wheel__tier-label">Source tier</span>
          <span>{sourceTier}</span>
        </p>
      </figcaption>
    </figure>
  )
}
