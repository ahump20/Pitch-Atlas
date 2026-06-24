import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { ScoutMovementWheel } from './ScoutMovementWheel'

describe('ScoutMovementWheel', () => {
  it('renders an honest empty state when motion is missing', () => {
    render(<ScoutMovementWheel motion={null} />)

    expect(screen.getByLabelText('Sourced movement wheel')).toBeInTheDocument()
    expect(screen.getByText('Shape not filed')).toBeInTheDocument()
    expect(screen.getAllByText('Unfiled')).toHaveLength(2)
    expect(screen.getByText('No read')).toBeInTheDocument()
    expect(screen.getByText('Unverified')).toBeInTheDocument()
  })

  it('uses only enum language from PitchMotion', () => {
    render(
      <ScoutMovementWheel
        motion={{
          spinAxis: [0, 1, 0],
          forceLabel: 'Magnus',
          verticalShape: 'ride',
          horizontalDir: 'arm-side',
          breakView: 'movement',
        }}
        shapeLabel="Ride with arm-side life"
        familyLabel="Fastball"
        sourceTierLabel="Official data"
        editionLabel="Specimen"
      />,
    )

    expect(screen.getByText('Ride')).toBeInTheDocument()
    expect(screen.getByText('Arm-side')).toBeInTheDocument()
    expect(screen.getByText('Magnus read')).toBeInTheDocument()
    expect(screen.queryByText(/rpm|mph|inches/i)).not.toBeInTheDocument()
  })
})
