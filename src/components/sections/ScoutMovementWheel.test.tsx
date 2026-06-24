import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ScoutMovementWheel } from './ScoutMovementWheel'
import { PITCHES } from '../../data/pitches'
import type { PitchMotion } from '../../data/types'

const accent = { c1: '#C8102E', c2: '#114A8C', c3: '#37D6FF' }
const forbiddenMotionKeys = [
  'spinRate',
  'spinRateRpm',
  'rpm',
  'velocity',
  'velocityMph',
  'mph',
  'ivb',
  'ivbInches',
  'breakInches',
  'horizontalBreak',
]

describe('ScoutMovementWheel', () => {
  it('renders a direction-only read from PitchMotion, never measured figures', () => {
    render(<ScoutMovementWheel motion={PITCHES[0].motion} accent={accent} />)

    const graphic = screen.getByRole('img')
    expect(graphic.getAttribute('aria-label')).toMatch(/Direction only, never a measured magnitude/)
    expect(screen.getByText(/direction only/i)).toBeInTheDocument()
    expect(screen.queryByText(/mph|rpm|inches|ivb/i)).not.toBeInTheDocument()
  })

  it('shows an explicit source-gap state when no motion record is filed', () => {
    render(<ScoutMovementWheel accent={accent} />)

    expect(screen.getByRole('img').getAttribute('aria-label')).toMatch(/Break direction not filed/)
    expect(screen.getByText('Motion not filed')).toBeInTheDocument()
    expect(screen.getByText('source gap · no estimate')).toBeInTheDocument()
  })

  it('keeps all filed motion records categorical and unitless', () => {
    for (const pitch of PITCHES) {
      const motion = pitch.motion as PitchMotion & Record<string, unknown>
      const keys = Object.keys(motion)
      expect(keys.filter((key) => forbiddenMotionKeys.includes(key))).toEqual([])
      expect(['ride', 'drop', 'flat']).toContain(motion.verticalShape)
      expect(['arm-side', 'glove-side', 'none']).toContain(motion.horizontalDir)

      const axisLength = Math.hypot(motion.spinAxis.x, motion.spinAxis.y, motion.spinAxis.z)
      expect(Number.isFinite(axisLength)).toBe(true)
      expect(axisLength).toBeGreaterThan(0)
    }
  })
})
