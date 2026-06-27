import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { SiteFooter } from './SiteFooter'
import { EggProvider } from '../eggs/EggProvider'

/*
  Gate: the no-JavaScript line. The claim is true by construction (every content
  route prerenders to static HTML), and the exact wording must hold.
*/

describe('SiteFooter', () => {
  it('carries the exact JavaScript line', () => {
    render(
      <MemoryRouter>
        <EggProvider>
          <SiteFooter />
        </EggProvider>
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
        <EggProvider>
          <SiteFooter />
        </EggProvider>
      </MemoryRouter>,
    )
    for (const label of ['The Pitch Index', 'Softball', 'The Craftsmen', 'Lost Pitches', 'Sources']) {
      expect(screen.getByRole('link', { name: label })).toBeInTheDocument()
    }
  })

  it('keeps the footer copy dash-free', () => {
    const { container } = render(
      <MemoryRouter>
        <EggProvider>
          <SiteFooter />
        </EggProvider>
      </MemoryRouter>,
    )

    expect(container.textContent ?? '').not.toMatch(/[\u2014\u2013]/)
  })
})
