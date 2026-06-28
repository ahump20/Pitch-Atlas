import { render, screen } from '@testing-library/react'
import { Hairline } from './Hairline'

describe('ds/Hairline', () => {
  it('renders the .hairline rule by default', () => {
    const { container } = render(<Hairline />)
    const el = container.firstChild as HTMLElement
    expect(el.tagName).toBe('DIV')
    expect(el.classList.contains('hairline')).toBe(true)
    expect(el.classList.contains('hairline-stage')).toBe(false)
  })

  it('stage variant swaps in the bone-on-dark .hairline-stage', () => {
    const { container } = render(<Hairline stage />)
    const el = container.firstChild as HTMLElement
    expect(el.classList.contains('hairline-stage')).toBe(true)
    expect(el.classList.contains('hairline')).toBe(false)
  })

  it('is a decorative separator with no children', () => {
    const { container } = render(<Hairline />)
    const el = container.firstChild as HTMLElement
    expect(el).toHaveAttribute('role', 'separator')
    expect(el).toHaveAttribute('aria-hidden', 'true')
    expect(el.childNodes).toHaveLength(0)
  })

  it('exposes the hidden separator role to an assistive query', () => {
    render(<Hairline />)
    expect(screen.getByRole('separator', { hidden: true })).toBeInTheDocument()
  })

  it('merges a custom className without dropping the base rule class', () => {
    const { container } = render(<Hairline className="mt-4" />)
    const el = container.firstChild as HTMLElement
    expect(el.classList.contains('hairline')).toBe(true)
    expect(el.classList.contains('mt-4')).toBe(true)
  })

  it('forwards arbitrary HTML attributes to the element', () => {
    const { container } = render(<Hairline id="tier-rule" data-testid="tier-rule" />)
    const el = container.firstChild as HTMLElement
    expect(el).toHaveAttribute('id', 'tier-rule')
    expect(el).toHaveAttribute('data-testid', 'tier-rule')
  })
})
