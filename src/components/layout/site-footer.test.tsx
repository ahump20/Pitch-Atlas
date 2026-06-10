import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { SiteFooter } from './SiteFooter'

/*
  Gate: the no-JavaScript line. The claim is true by construction (every content
  route prerenders to static HTML), and the exact wording must hold.
*/

describe('SiteFooter', () => {
  it('carries the exact JavaScript line', () => {
    render(
      <MemoryRouter>
        <SiteFooter />
      </MemoryRouter>,
    )
    expect(
      screen.getByText(
        'The archive is readable without JavaScript. Interactive grip tools, physics controls, and comparison labs need JavaScript.',
      ),
    ).toBeInTheDocument()
  })

  it('keeps the wing index intact', () => {
    render(
      <MemoryRouter>
        <SiteFooter />
      </MemoryRouter>,
    )
    for (const label of ['The Pitch Index', 'Softball', 'The Craftsmen', 'Lost Pitches', 'Sources']) {
      expect(screen.getByRole('link', { name: label })).toBeInTheDocument()
    }
  })
})
