import { render, screen } from '@testing-library/react'
import { StageTierMarker } from './StageTierMarker'

describe('StageTierMarker', () => {
  it('lets long section headings wrap instead of clipping on narrow screens', () => {
    const { container } = render(
      <StageTierMarker
        index="01"
        label="Mental Mechanics: Dorfman and the Psychology of Performance Under Pressure"
      />,
    )

    const heading = screen.getByRole('heading', { level: 2 })
    expect(heading).toHaveClass('min-w-0', 'whitespace-normal')
    expect(heading).not.toHaveClass('whitespace-nowrap')
    expect(container.querySelector('[data-stage-tier-marker]')).toContainElement(heading)
  })
})
