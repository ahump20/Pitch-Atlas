import { render, screen } from '@testing-library/react'
import { Kicker } from './Kicker'

describe('ds/Kicker', () => {
  it('renders the rfx-skick eyebrow class with its children', () => {
    render(<Kicker>The front door</Kicker>)
    expect(screen.getByText('The front door').className).toContain('rfx-skick')
  })

  it('renders as a <p>, matching the SectionHero eyebrow markup', () => {
    render(<Kicker>How to read a claim</Kicker>)
    expect(screen.getByText('How to read a claim').tagName).toBe('P')
  })

  it('merges a custom className alongside rfx-skick rather than replacing it', () => {
    render(<Kicker className="text-cyan">Field notes</Kicker>)
    const el = screen.getByText('Field notes')
    expect(el.className).toContain('rfx-skick')
    expect(el.className).toContain('text-cyan')
  })

  it('forwards arbitrary HTML attributes to the element', () => {
    render(
      <Kicker id="eyebrow" data-testid="kick" aria-label="Section eyebrow">
        Where it came from
      </Kicker>,
    )
    const el = screen.getByText('Where it came from')
    expect(el).toHaveAttribute('id', 'eyebrow')
    expect(el).toHaveAttribute('data-testid', 'kick')
    expect(el).toHaveAttribute('aria-label', 'Section eyebrow')
  })

  it('keeps the rule by default and never leaks the rule prop onto the DOM', () => {
    render(<Kicker>Stock tilts</Kicker>)
    const el = screen.getByText('Stock tilts')
    expect(el.className).toContain('rfx-skick')
    expect(el).not.toHaveAttribute('rule')
  })

  it('treats rule={false} as a documented no-op: class unchanged, no leaked attribute', () => {
    render(<Kicker rule={false}>Known, unknown, open</Kicker>)
    const el = screen.getByText('Known, unknown, open')
    // No no-rule modifier ships in the CSS, so the rule is still drawn and the
    // class list still carries rfx-skick.
    expect(el.className).toContain('rfx-skick')
    expect(el).not.toHaveAttribute('rule')
  })
})
