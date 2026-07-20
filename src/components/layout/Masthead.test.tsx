import { fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { Masthead } from './Masthead'

function renderAt(pathname: string) {
  return render(
    <MemoryRouter initialEntries={[pathname]}>
      <Masthead />
    </MemoryRouter>,
  )
}

describe('Masthead', () => {
  it('keeps the Pitch Index active inside a filed specimen', () => {
    renderAt('/pitch/four-seam')

    const pitchIndex = screen.getByRole('link', { name: 'Pitch Index' })
    expect(pitchIndex).toHaveClass('is-current', 'text-cyan')
    expect(pitchIndex).toHaveAttribute('aria-current', 'location')
  })

  it('keeps More active inside a craftsman file', () => {
    renderAt('/craftsman/mariano-rivera')

    expect(screen.getByRole('button', { name: 'More' })).toHaveClass('is-current', 'text-cyan')
  })

  it('returns focus to More when Escape closes its disclosure', () => {
    renderAt('/')
    const more = screen.getByRole('button', { name: 'More' })
    fireEvent.click(more)
    const firstLink = screen.getByRole('link', { name: /Craftsmen/i })
    firstLink.focus()

    fireEvent.keyDown(document, { key: 'Escape' })

    expect(more).toHaveFocus()
    expect(screen.queryByText('The rest of the atlas')).not.toBeInTheDocument()
  })
})
