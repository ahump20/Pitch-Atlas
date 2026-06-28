import { fireEvent, render, screen } from '@testing-library/react'
import { DiamondMark } from './DiamondMark'

describe('ds/DiamondMark', () => {
  it('renders the .rfx-diamond brand mark with the default PA glyph', () => {
    render(<DiamondMark data-testid="mark" />)
    const el = screen.getByTestId('mark')
    expect(el.tagName).toBe('SPAN')
    expect(el.className).toContain('rfx-diamond')
    expect(el).toHaveTextContent('PA')
  })

  it('sets the glyph from the label prop', () => {
    render(<DiamondMark label="CH" data-testid="mark" />)
    expect(screen.getByTestId('mark')).toHaveTextContent('CH')
  })

  it('wraps the glyph in a counter-rotated <b> child so it sits upright', () => {
    // .rfx-diamond rotates 45° and .rfx-diamond > * rotates -45°; the glyph must be
    // a real child element, not a bare text node, to ride that counter-rotation.
    render(<DiamondMark label="FS" data-testid="mark" />)
    const glyph = screen.getByText('FS')
    expect(glyph.tagName).toBe('B')
    expect(glyph.parentElement).toHaveClass('rfx-diamond')
  })

  it('adds the is-gold modifier only when gold is set', () => {
    const { rerender } = render(<DiamondMark data-testid="mark" />)
    expect(screen.getByTestId('mark').className).not.toContain('is-gold')
    rerender(<DiamondMark gold data-testid="mark" />)
    const el = screen.getByTestId('mark')
    expect(el.className).toContain('rfx-diamond')
    expect(el.className).toContain('is-gold')
  })

  it('drives width and height from size (default 48)', () => {
    const { rerender } = render(<DiamondMark data-testid="mark" />)
    let el = screen.getByTestId('mark')
    expect(el.style.width).toBe('48px')
    expect(el.style.height).toBe('48px')
    rerender(<DiamondMark size={24} data-testid="mark" />)
    el = screen.getByTestId('mark')
    expect(el.style.width).toBe('24px')
    expect(el.style.height).toBe('24px')
  })

  it('merges className and forwards span attributes and handlers', () => {
    const onClick = vi.fn()
    render(
      <DiamondMark
        className="ml-2"
        aria-hidden="true"
        title="Pitch Atlas"
        onClick={onClick}
        data-testid="mark"
      />,
    )
    const el = screen.getByTestId('mark')
    expect(el.className).toContain('rfx-diamond')
    expect(el.className).toContain('ml-2')
    expect(el).toHaveAttribute('aria-hidden', 'true')
    expect(el).toHaveAttribute('title', 'Pitch Atlas')
    fireEvent.click(el)
    expect(onClick).toHaveBeenCalledTimes(1)
  })

  it('lets an explicit style override the size-derived dimensions', () => {
    render(<DiamondMark size={48} style={{ width: 12 }} data-testid="mark" />)
    const el = screen.getByTestId('mark')
    expect(el.style.width).toBe('12px')
    expect(el.style.height).toBe('48px')
  })
})
