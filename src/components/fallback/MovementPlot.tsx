import { useId, useMemo } from 'react'
import { projectSeam, splitRuns } from '../../lib/seam2d'
import type { PitchMotion } from '../../data/types'

/*
  The shape plot, told from the catcher's eye. A spinless reference ball sits at the
  center; the real pitch crosses offset toward how it moves — up if it rides, down if it
  drops, toward the arm side or the glove side. The seam ball is our own geometry,
  oriented to the pitch's spin axis. The poles are labeled words. This is a schematic of
  DIRECTION — which way the pitch breaks — never a measured magnitude. No numbers.
*/

const VB_W = 360
const VB_H = 240
const CX = 178
const CY = 116
const BALL_R = 17
const OFFSET = 60 // fixed schematic offset by direction, not a measured magnitude
const CLAMP = 92 // plot half-extent for the axis guides and pole labels

export interface MovementPlotProps {
  className?: string
  motion: PitchMotion
  pitchName?: string
}

export function MovementPlot({ className = '', motion, pitchName = 'pitch' }: MovementPlotProps) {
  const uid = useId()
  const gradId = `leather-move-${uid}`

  const dy = motion.verticalShape === 'ride' ? -OFFSET : motion.verticalShape === 'drop' ? OFFSET : 0
  const hSign = motion.horizontalDir === 'arm-side' ? 1 : motion.horizontalDir === 'glove-side' ? -1 : 0
  const dx = hSign * OFFSET
  const ballX = CX + dx
  const ballY = CY + dy

  const realSeam = useMemo(
    () => splitRuns(projectSeam(ballX, ballY, BALL_R, 200)),
    [ballX, ballY],
  )

  const ivbWord = motion.verticalShape === 'ride' ? 'rides' : motion.verticalShape === 'drop' ? 'drops' : 'holds flat'
  const horizWord =
    motion.horizontalDir === 'arm-side' ? 'runs arm-side' : motion.horizontalDir === 'glove-side' ? 'sweeps glove-side' : 'stays true'

  const title = `Catcher's-eye shape of a ${pitchName}. Against a spinless ball at center, it ${ivbWord} and ${horizWord}. A schematic of direction, not a measured magnitude.`

  return (
    <svg
      viewBox={`0 0 ${VB_W} ${VB_H}`}
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

      {/* axis guides */}
      <line x1={CX} y1={CY - CLAMP - 14} x2={CX} y2={CY + CLAMP + 14} stroke="var(--color-ink-3)" strokeWidth="1" />
      <line x1={CX - CLAMP - 14} y1={CY} x2={CX + CLAMP + 14} y2={CY} stroke="var(--color-ink-3)" strokeWidth="1" />

      {/* pole labels: words, not a handedness claim */}
      <text x={CX} y={CY - CLAMP - 20} fill="var(--color-ink-2)" fontFamily="var(--font-mono)" fontSize="8" letterSpacing="1.5" textAnchor="middle">RIDE</text>
      <text x={CX} y={CY + CLAMP + 28} fill="var(--color-ink-2)" fontFamily="var(--font-mono)" fontSize="8" letterSpacing="1.5" textAnchor="middle">DROP</text>
      <text x={CX - CLAMP - 18} y={CY - 6} fill="var(--color-ink-2)" fontFamily="var(--font-mono)" fontSize="8" letterSpacing="1.5" textAnchor="middle">GLOVE</text>
      <text x={CX + CLAMP + 18} y={CY - 6} fill="var(--color-ink-2)" fontFamily="var(--font-mono)" fontSize="8" letterSpacing="1.5" textAnchor="middle">ARM</text>

      {/* spinless reference */}
      <circle cx={CX} cy={CY} r={BALL_R} fill="#101116" stroke="var(--color-ink-2)" strokeWidth="1" strokeDasharray="3 3" opacity="0.65" />
      <text x={CX} y={CY + 3} fill="var(--color-ink-2)" fontFamily="var(--font-mono)" fontSize="7" letterSpacing="0.5" textAnchor="middle" opacity="0.8">NO SPIN</text>

      {/* displacement connector: which way the pitch breaks from the spinless reference */}
      <line x1={CX} y1={CY} x2={ballX} y2={ballY} stroke="var(--color-seam)" strokeWidth="1.25" strokeDasharray="2 3" opacity="0.6" />

      {/* the real pitch with its seam */}
      <circle cx={ballX} cy={ballY} r={BALL_R} fill={`url(#${gradId})`} />
      <circle cx={ballX} cy={ballY} r={BALL_R} fill="none" stroke="var(--color-ink-3)" strokeWidth="0.8" />
      {realSeam
        .filter((s) => !s.front)
        .map((s, i) => (
          <path key={`mb-${i}`} d={s.d} fill="none" stroke="var(--color-seam)" strokeOpacity="0.22" strokeWidth="1.4" strokeLinecap="round" />
        ))}
      {realSeam
        .filter((s) => s.front)
        .map((s, i) => (
          <path key={`mf-${i}`} d={s.d} fill="none" stroke="var(--color-seam)" strokeWidth="1.7" strokeLinecap="round" />
        ))}
      {/* gyro red dot, when the axis points at the catcher */}
      {motion.gyro ? <circle cx={ballX} cy={ballY} r="3" fill="var(--color-seam)" /> : null}
    </svg>
  )
}
