import { render, screen } from '@testing-library/react'
import { Button } from './Button'

describe('ds/Button', () => {
  it('renders the chrome CTA by default', () => {
    render(<Button>Open the Index</Button>)
    expect(screen.getByRole('button', { name: 'Open the Index' }).className).toContain('v2-cta')
  })

  it('ghost variant adds the is-ghost modifier', () => {
    render(<Button variant="ghost">Read the mission</Button>)
    const el = screen.getByRole('button', { name: 'Read the mission' })
    expect(el.className).toContain('v2-cta')
    expect(el.className).toContain('is-ghost')
  })

  it('foil and ink variants render the wax-seal class', () => {
    const { rerender } = render(<Button variant="foil">Open the atlas</Button>)
    expect(screen.getByRole('button').className).toContain('btn-foil')
    rerender(<Button variant="ink">Open the atlas</Button>)
    expect(screen.getByRole('button').className).toContain('is-ink')
  })

  it('link variant renders the quiet mono link class', () => {
    render(<Button variant="link">Watch it flatten</Button>)
    expect(screen.getByRole('button', { name: 'Watch it flatten' }).className).toContain('ds-btn-link')
  })

  it('appends an arrow glyph only when arrow is set', () => {
    const { rerender } = render(<Button>Go</Button>)
    expect(screen.queryByText('→')).not.toBeInTheDocument()
    rerender(<Button arrow>Go</Button>)
    expect(screen.getByText('→')).toBeInTheDocument()
  })

  it('renders as a custom element via as, forwarding props', () => {
    render(
      <Button as="a" href="/about" variant="ghost">
        Mission
      </Button>,
    )
    const el = screen.getByRole('link', { name: 'Mission' })
    expect(el).toHaveAttribute('href', '/about')
    expect(el.className).toContain('is-ghost')
  })
})
