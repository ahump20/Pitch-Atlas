import { fireEvent, render, screen } from '@testing-library/react'
import { useState } from 'react'
import { Tag } from './Tag'

describe('ds/Tag', () => {
  it('renders the rfx-chip filter-chip class', () => {
    render(<Tag>Fastball</Tag>)
    expect(screen.getByText('Fastball').className).toContain('rfx-chip')
  })

  it('renders a span by default', () => {
    render(<Tag>Breaking Ball</Tag>)
    expect(screen.getByText('Breaking Ball').tagName).toBe('SPAN')
  })

  it('maps active to the aria-pressed on-state hook', () => {
    const { rerender } = render(<Tag active>Slider</Tag>)
    expect(screen.getByText('Slider')).toHaveAttribute('aria-pressed', 'true')
    rerender(<Tag active={false}>Slider</Tag>)
    expect(screen.getByText('Slider')).toHaveAttribute('aria-pressed', 'false')
  })

  it('omits aria-pressed entirely when active is not supplied', () => {
    render(<Tag>Changeup</Tag>)
    expect(screen.getByText('Changeup')).not.toHaveAttribute('aria-pressed')
  })

  it('renders an optional glyph as a direct child before the label', () => {
    render(<Tag glyph={<span data-testid="dot" aria-hidden="true" />}>Cutter</Tag>)
    const chip = screen.getByText('Cutter')
    const dot = screen.getByTestId('dot')
    // Parity: the glyph stays a direct child of the chip and precedes the label,
    // matching the live "show the hand" chip whose dot is a direct flex child.
    expect(dot.parentElement).toBe(chip)
    expect(chip.firstChild).toBe(dot)
    expect(chip.textContent).toBe('Cutter')
  })

  it('works as an interactive filter button: forwards as, label, and toggles on click', () => {
    function Filter() {
      const [on, setOn] = useState(false)
      return (
        <Tag as="button" type="button" active={on} onClick={() => setOn((v) => !v)}>
          Curveball
        </Tag>
      )
    }
    render(<Filter />)
    // Label association: the accessible name comes from the children.
    const btn = screen.getByRole('button', { name: 'Curveball' })
    expect(btn.className).toContain('rfx-chip')
    expect(btn).toHaveAttribute('aria-pressed', 'false')
    fireEvent.click(btn)
    expect(btn).toHaveAttribute('aria-pressed', 'true')
  })

  it('merges a caller className alongside rfx-chip and forwards attributes', () => {
    render(
      <Tag className="inline-flex items-center gap-2" data-testid="chip" title="Filter by family">
        Sinker
      </Tag>,
    )
    const el = screen.getByTestId('chip')
    expect(el.className).toContain('rfx-chip')
    expect(el.className).toContain('inline-flex')
    expect(el).toHaveAttribute('title', 'Filter by family')
  })
})
