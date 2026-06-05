import { useId, useMemo } from 'react'
import { projectSeam, splitRuns } from '../../lib/seam2d'
import type { PitchMotion } from '../../data/types'

/*
  The movement plot, told from the catcher's eye. A spinless reference ball sits
  at the center; the real pitch crosses offset by its induced vertical break (up
  if it rides, down if it drops) and its horizontal break (toward the arm side or
  the glove side). The seam ball is our own geometry, oriented to the pitch's
  spin axis. The poles are labeled words, not a left/right handedness claim, so
  the diagram teaches the break without asserting a sign it cannot prove. A
  schematic, scaled from sourced break magnitudes, never a measured trajectory.
*/

const VB_W = 360
const VB_H = 240
const CX = 178
const CY = 116
const BALL_R = 17
const PX_PER_IN = 4.6
const CLAMP = 92

export interface MovementPlotProps {
  className?: string
  motion: PitchMotion
  pitchName?: string
}

function clamp(n: number): number {
  return Math.max(-CLAMP, Math.min(CLAMP, n))
}

export function MovementPlot({ className = '', motion, pitchName = 'pitch' }: MovementPlotProps) {
  const uid = useId()
  const gradId = `leather-move-${uid}`

  const dy = clamp(-motion.ivbInches * PX_PER_IN) // screen y grows downward; + ivb rides up
  const hSign = motion.horizontalDir === 'arm-side' ? 1 : motion.horizontalDir === 'glove-side' ? -1 : 0
  const dx = clamp(motion.horizontalInches * PX_PER_IN * hSign)
  const ballX = CX + dx
  const ballY = CY + dy

  const realSeam = useMemo(
    () => splitRuns(projectSeam(ballX, ballY, BALL_R, 200)),
    [ballX, ballY],
  )

  const ivbLabel = `${motion.ivbInches >= 0 ? '+' : ''}${motion.ivbInches} in`
  const ivbWord = motion.ivbInches >= 0 ? 'ride' : 'drop'
  const horizWord =
    motion.horizontalDir === 'arm-side' ? 'arm-side run' : motion.horizontalDir === 'glove-side' ? 'glove-side sweep' : 'no horizontal break'

  const title = `Catcher's-eye movement of a ${pitchName}. Against a spinless ball at center, it crosses about ${Math.abs(motion.ivbInches)} inches of ${ivbWord} and ${motion.horizontalInches} inches of ${horizWord}. A schematic scaled from sourced break figures, approximate.`

  const showH = motion.horizontalDir !== 'none' && Math.abs(dx) > 4

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
          <stop offset="0%" stopColor="#262a33" />
          <stop offset="62%" stopColor="#15171d" />
          <stop offset="100%" stopColor="#0b0c0f" />
        </radialGradient>
      </defs>

      {/* axis guides */}
      <line x1={CX} y1={CY - CLAMP - 14} x2={CX} y2={CY + CLAMP + 14} stroke="var(--color-machined)" strokeWidth="1" />
      <line x1={CX - CLAMP - 14} y1={CY} x2={CX + CLAMP + 14} y2={CY} stroke="var(--color-machined)" strokeWidth="1" />

      {/* pole labels: words, not a handedness claim */}
      <text x={CX} y={CY - CLAMP - 20} fill="var(--color-dim)" fontFamily="var(--font-mono)" fontSize="8" letterSpacing="1.5" textAnchor="middle">RIDE</text>
      <text x={CX} y={CY + CLAMP + 28} fill="var(--color-dim)" fontFamily="var(--font-mono)" fontSize="8" letterSpacing="1.5" textAnchor="middle">DROP</text>
      <text x={CX - CLAMP - 18} y={CY - 6} fill="var(--color-dim)" fontFamily="var(--font-mono)" fontSize="8" letterSpacing="1.5" textAnchor="middle">GLOVE</text>
      <text x={CX + CLAMP + 18} y={CY - 6} fill="var(--color-dim)" fontFamily="var(--font-mono)" fontSize="8" letterSpacing="1.5" textAnchor="middle">ARM</text>

      {/* spinless reference */}
      <circle cx={CX} cy={CY} r={BALL_R} fill="#101218" stroke="var(--color-dim)" strokeWidth="1" strokeDasharray="3 3" opacity="0.65" />
      <text x={CX} y={CY + 3} fill="var(--color-dim)" fontFamily="var(--font-mono)" fontSize="7" letterSpacing="0.5" textAnchor="middle" opacity="0.8">NO SPIN</text>

      {/* displacement connector */}
      <line x1={CX} y1={CY} x2={ballX} y2={ballY} stroke="var(--color-seam)" strokeWidth="1" strokeDasharray="2 3" opacity="0.55" />

      {/* dimension: induced vertical break */}
      <g stroke="var(--color-seam)" strokeWidth="1" opacity="0.9">
        <line x1={CX - CLAMP - 4} y1={CY} x2={CX - CLAMP - 4} y2={ballY} />
        <line x1={CX - CLAMP - 9} y1={CY} x2={CX - CLAMP + 1} y2={CY} />
        <line x1={CX - CLAMP - 9} y1={ballY} x2={CX - CLAMP + 1} y2={ballY} />
      </g>
      <text
        x={CX - CLAMP - 12}
        y={(CY + ballY) / 2}
        fill="var(--color-seam)"
        fontFamily="var(--font-mono)"
        fontSize="9.5"
        dominantBaseline="middle"
        textAnchor="middle"
        transform={`rotate(-90 ${CX - CLAMP - 12} ${(CY + ballY) / 2})`}
      >
        {ivbLabel} IVB
      </text>

      {/* dimension: horizontal break */}
      {showH ? (
        <>
          <g stroke="var(--color-seam)" strokeWidth="1" opacity="0.9">
            <line x1={CX} y1={CY + CLAMP + 4} x2={ballX} y2={CY + CLAMP + 4} />
            <line x1={CX} y1={CY + CLAMP - 1} x2={CX} y2={CY + CLAMP + 9} />
            <line x1={ballX} y1={CY + CLAMP - 1} x2={ballX} y2={CY + CLAMP + 9} />
          </g>
          <text x={(CX + ballX) / 2} y={CY + CLAMP + 18} fill="var(--color-seam)" fontFamily="var(--font-mono)" fontSize="9.5" textAnchor="middle">
            {motion.horizontalInches} in
          </text>
        </>
      ) : null}

      {/* the real pitch with its seam */}
      <circle cx={ballX} cy={ballY} r={BALL_R} fill={`url(#${gradId})`} />
      <circle cx={ballX} cy={ballY} r={BALL_R} fill="none" stroke="var(--color-machined)" strokeWidth="0.8" />
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
