import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { PitchIndex } from './PitchIndex'

function renderIndex() {
  return render(
    <MemoryRouter>
      <PitchIndex />
    </MemoryRouter>,
  )
}

describe('PitchIndex controls', () => {
  it('filters the index and renders the designed empty state', async () => {
    const user = userEvent.setup()
    renderIndex()

    const search = screen.getByRole('searchbox', { name: /search the pitch index/i })
    await user.type(search, 'zzzz no pitch')

    expect(screen.getByText('No pitch by that name')).toBeInTheDocument()
    expect(screen.getByText(/Try a family, an alias, or clear the search/)).toBeInTheDocument()
  })

  it('switches between row and card views without losing filed routing labels', async () => {
    const user = userEvent.setup()
    renderIndex()

    expect(screen.getAllByText('Open specimen').length).toBeGreaterThan(0)

    const cards = screen.getByRole('radio', { name: /cards view/i })
    await user.click(cards)

    expect(cards).toHaveAttribute('data-state', 'on')
    expect(screen.getAllByText('Four-Seam Fastball').length).toBeGreaterThan(0)
  })
})
