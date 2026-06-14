import { describe, expect, it } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, useLocation } from 'react-router-dom'
import { REPERTOIRE, REPERTOIRE_FAMILIES, repertoireByFamily } from '../../data/repertoire'
import { gripEntryForRepertoire } from '../../data/grips'
import { IndexLedger } from './IndexLedger'
import { PitchIndex } from './PitchIndex'

function LocationProbe() {
  const location = useLocation()
  return <output data-testid="location-search">{location.search}</output>
}

function renderIndex(initialEntry = '/repertoire') {
  return render(
    <MemoryRouter initialEntries={[initialEntry]}>
      <PitchIndex />
      <LocationProbe />
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
    // the copy names the real indexed-entry count and the next move — never a vague shrug
    expect(
      screen.getByText(new RegExp(`is not in the ${REPERTOIRE.length} indexed entries`)),
    ).toBeInTheDocument()
    expect(screen.getByText(/Try a family or an alias/)).toBeInTheDocument()
  })

  it('clears the search on Escape and announces it', async () => {
    const user = userEvent.setup()
    renderIndex()

    const search = screen.getByRole('searchbox', { name: /search the pitch index/i })
    await user.type(search, 'cutter')
    expect(search).toHaveValue('cutter')

    await user.keyboard('{Escape}')

    expect(search).toHaveValue('')
    expect(screen.getByTestId('pitch-index-announcer')).toHaveTextContent('Search cleared')
    expect(screen.getByTestId('location-search')).toHaveTextContent('')
  })

  it('switches between row and binder views without losing filed routing labels', async () => {
    const user = userEvent.setup()
    renderIndex()

    expect(screen.getAllByText('Open specimen').length).toBeGreaterThan(0)

    const binder = screen.getByRole('radio', { name: /binder view/i })
    await user.click(binder)

    expect(binder).toHaveAttribute('data-state', 'on')
    expect(screen.getAllByText('Four-Seam Fastball').length).toBeGreaterThan(0)
    // an entry with no clean photograph says so honestly, never a fake thumbnail
    expect(screen.getAllByText('No image filed').length).toBeGreaterThan(0)
    expect(screen.getByTestId('location-search')).toHaveTextContent('view=binder')
  })

  it('restores search, filter, and view from the URL', () => {
    renderIndex('/repertoire?q=curve&family=breaking&view=binder')

    expect(screen.getByRole('searchbox', { name: /search the pitch index/i })).toHaveValue('curve')
    expect(screen.getByRole('radio', { name: /breaking/i })).toHaveAttribute('data-state', 'on')
    expect(screen.getByRole('radio', { name: /binder view/i })).toHaveAttribute('data-state', 'on')
    expect(screen.getByText(/matching "curve"/)).toBeInTheDocument()
  })

  it('resets active URL state from an empty result', async () => {
    const user = userEvent.setup()
    renderIndex('/repertoire?q=zzzz&family=breaking&view=binder')

    expect(screen.getByText('No pitch by that name')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: /reset index/i }))

    expect(screen.getByRole('searchbox', { name: /search the pitch index/i })).toHaveValue('')
    expect(screen.getByRole('radio', { name: /^all$/i })).toHaveAttribute('data-state', 'on')
    expect(screen.getByRole('radio', { name: /rows view/i })).toHaveAttribute('data-state', 'on')
    expect(screen.getByTestId('location-search')).toHaveTextContent('')
  })
})

describe('PitchIndex row marks', () => {
  it('shows a grip thumbnail where a real photo exists and a turned seam mark elsewhere', () => {
    const { container } = renderIndex()

    // expected thumbnails derive from the same resolver the rows use — the
    // count is read off the data, never typed in
    const expected = REPERTOIRE.filter((e) => {
      const g = gripEntryForRepertoire(e)
      return !!(g?.photos[0]?.src ?? g?.clip?.poster)
    }).length
    expect(expected).toBeGreaterThan(0)

    const rows = container.querySelectorAll('a.rfx-entry')
    expect(rows.length).toBe(REPERTOIRE.length)
    const thumbs = container.querySelectorAll('a.rfx-entry img')
    expect(thumbs.length).toBe(expected)

    // the unphotographed marks rest at their own turn — a handled set, not one
    // icon repeated; rotation is seeded per entry, deterministic for SSG
    const turns = [...container.querySelectorAll('a.rfx-entry svg g')].map((g) =>
      g.getAttribute('transform'),
    )
    expect(turns.length).toBe(REPERTOIRE.length - expected)
    expect(new Set(turns).size).toBeGreaterThan(1)
  })

  it('lets the grip tell wrap whole instead of cutting mid-word', () => {
    renderIndex()
    const cue = screen.getByText('Fingertips cross the seam path')
    expect(cue.className).not.toMatch(/truncate/)
    expect(cue.className).toMatch(/line-clamp-2/)
  })
})

describe('IndexLedger', () => {
  it('derives every count on the plate from the data', () => {
    render(<IndexLedger />)

    const filed = REPERTOIRE.filter((e) => e.filedSlug).length
    const basic = REPERTOIRE.length - filed
    expect(screen.getByText(`${filed} open a full specimen`)).toBeInTheDocument()
    expect(screen.getByText(new RegExp(`${basic} basic files`))).toBeInTheDocument()
    expect(screen.getByText(`${REPERTOIRE.length} rows`)).toBeInTheDocument()

    for (const fam of REPERTOIRE_FAMILIES) {
      const row = screen.getByText(fam.label).closest('li')
      expect(row).not.toBeNull()
      expect(
        within(row as HTMLElement).getByText(String(repertoireByFamily(fam.family).length)),
      ).toBeInTheDocument()
    }
  })
})
