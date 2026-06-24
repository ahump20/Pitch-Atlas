import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { ScoutMovementWheel } from './ScoutMovementWheel'
import type { PitchMotion } from '../../data/types'

const filedMotion: PitchMotion = {
  spinAxis: { x: 0.24, y: 0.87, z: 0.43 },
  forceLabel: 'Magnus',
  verticalShape: 'ride',
  horizontalDir: 'arm-side',
  breakView: 'movement',
}

describe('ScoutMovementWheel', () => {
  it('renders only sourced direction and character words from PitchMotion', () => {
    render(<ScoutMovementWheel motion={filedMotion} sourceTier="Official data" />)

    expect(screen.getByText('Movement wheel')).toBeInTheDocument()
    expect(screen.getByText('Ride · Arm-side run')).toBeInTheDocument()
    expect(screen.getByText('Official data')).toBeInTheDocument()
    expect(screen.queryByText(/rpm|mph|velocity|break inches|spin rate/i)).not.toBeInTheDocument()
  })

  it('renders a grayed honest empty state when motion is not filed', () => {
    const { container } = render(<ScoutMovementWheel motion={null} />)

    expect(container.querySelector('.scout-wheel.is-empty')).toBeInTheDocument()
    expect(screen.getByText('Movement record unfiled')).toBeInTheDocument()
    expect(screen.getByText('No verified spin-axis read on file')).toBeInTheDocument()
  })

  it('does not plot an arrow for indeterminate break records', () => {
    const { container } = render(
      <ScoutMovementWheel motion={{ ...filedMotion, indeterminateBreak: true }} sourceTier="Reputable analysis" />,
    )

    expect(container.querySelector('.scout-wheel.is-indeterminate')).toBeInTheDocument()
    expect(container.querySelector('.scout-wheel__ray')).not.toBeInTheDocument()
    expect(screen.getByText('Indeterminate break: shape varies by release')).toBeInTheDocument()
  })
})
