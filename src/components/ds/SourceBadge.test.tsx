import { render, screen } from '@testing-library/react'
import { SourceBadge } from './SourceBadge'

describe('ds/SourceBadge', () => {
  it('renders the canonical tier label by default', () => {
    render(<SourceBadge tier="official" />)
    expect(screen.getByText('Official data')).toBeInTheDocument()
  })

  it('overrides the label when label is provided', () => {
    render(<SourceBadge tier="secondhand" label="Relayed · Kagan" />)
    expect(screen.getByText('Relayed · Kagan')).toBeInTheDocument()
    expect(screen.queryByText('Secondhand, attributed')).not.toBeInTheDocument()
  })

  it('shows the approx pill only when approximate is set', () => {
    const { rerender } = render(<SourceBadge tier="reputable" />)
    expect(screen.queryByText('≈ approx')).not.toBeInTheDocument()
    rerender(<SourceBadge tier="reputable" approximate />)
    expect(screen.getByText('≈ approx')).toBeInTheDocument()
  })
})
