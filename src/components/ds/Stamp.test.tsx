import { fireEvent, render, screen } from '@testing-library/react'
import { Stamp } from './Stamp'

describe('ds/Stamp', () => {
  it('renders the rfx-stamp hand-stamp class', () => {
    render(<Stamp>Rarity Index</Stamp>)
    expect(screen.getByText('Rarity Index').className).toContain('rfx-stamp')
  })

  it('renders a span by default', () => {
    render(<Stamp>Specimen 014</Stamp>)
    expect(screen.getByText('Specimen 014').tagName).toBe('SPAN')
  })

  it('merges a caller className alongside rfx-stamp', () => {
    render(<Stamp className="absolute top-3">Filed 1962</Stamp>)
    const el = screen.getByText('Filed 1962')
    expect(el.className).toContain('rfx-stamp')
    expect(el.className).toContain('absolute')
    expect(el.className).toContain('top-3')
  })

  it('forwards arbitrary span attributes', () => {
    render(
      <Stamp data-testid="stamp" aria-label="Rarity index" title="Filed specimen">
        Index
      </Stamp>,
    )
    const el = screen.getByTestId('stamp')
    expect(el).toHaveAttribute('aria-label', 'Rarity index')
    expect(el).toHaveAttribute('title', 'Filed specimen')
  })

  it('forwards event handlers through the rest spread', () => {
    let clicks = 0
    render(<Stamp onClick={() => { clicks += 1 }}>Specimen 014</Stamp>)
    fireEvent.click(screen.getByText('Specimen 014'))
    expect(clicks).toBe(1)
  })
})
