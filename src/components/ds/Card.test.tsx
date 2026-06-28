import { fireEvent, render, screen } from '@testing-library/react'
import { Card } from './Card'

describe('ds/Card', () => {
  it('renders the leather panel (.rfx-panel) as a div, holding its children', () => {
    render(<Card>Filed specimen</Card>)
    const el = screen.getByText('Filed specimen')
    expect(el.tagName).toBe('DIV')
    expect(el).toHaveClass('rfx-panel')
    expect(el).not.toHaveClass('rfx-panel-foil')
  })

  it('places children as direct children of the panel (no inner wrapper in the default register)', () => {
    render(
      <Card>
        <h3>Four-Seam Fastball</h3>
      </Card>,
    )
    const heading = screen.getByRole('heading', { name: 'Four-Seam Fastball' })
    expect(heading.parentElement).toHaveClass('rfx-panel')
  })

  it('composes a caller className onto the panel root', () => {
    render(<Card className="p-5">Grip notes</Card>)
    const el = screen.getByText('Grip notes')
    expect(el).toHaveClass('rfx-panel')
    expect(el).toHaveClass('p-5')
  })

  it('forwards arbitrary div attributes to the root', () => {
    render(
      <Card data-testid="panel" id="repertoire" aria-label="Repertoire">
        Pitch Index
      </Card>,
    )
    const el = screen.getByTestId('panel')
    expect(el).toHaveAttribute('id', 'repertoire')
    expect(el).toHaveAttribute('aria-label', 'Repertoire')
  })

  it('fires a forwarded click handler', () => {
    const onClick = vi.fn()
    render(<Card onClick={onClick}>Open the index</Card>)
    fireEvent.click(screen.getByText('Open the index'))
    expect(onClick).toHaveBeenCalledTimes(1)
  })

  it('foil renders the foil-edged sibling (.rfx-panel-foil) wrapping one bare inner div', () => {
    render(
      <Card foil className="mt-6">
        Foil edge
      </Card>,
    )
    const inner = screen.getByText('Foil edge')
    const root = inner.parentElement as HTMLElement
    // The outer carries the foil class and the caller className; it is the sibling
    // treatment, not a class added on top of .rfx-panel.
    expect(root).toHaveClass('rfx-panel-foil')
    expect(root).toHaveClass('mt-6')
    expect(root).not.toHaveClass('rfx-panel')
    // Exactly one inner wrapper, left bare so the `.rfx-panel-foil > *` fill
    // selector lands on it — the markup that class's CSS contract requires.
    expect(root.children).toHaveLength(1)
    expect(inner.tagName).toBe('DIV')
    expect(inner.className).toBe('')
  })

  it('exposes no interactive / state modifier (the stylesheet defines none for .rfx-panel)', () => {
    render(<Card className="rounded-sm">Static panel</Card>)
    const el = screen.getByText('Static panel')
    expect(el.className).not.toMatch(/interactive|is-active|is-on/)
  })
})
