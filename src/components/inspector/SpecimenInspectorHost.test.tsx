import { afterEach, describe, expect, it, vi } from 'vitest'
import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { CompareProvider } from '../compare/CompareProvider'
import { SpecimenInspectorHost } from './SpecimenInspectorHost'
import { InspectButton } from './InspectButton'

/*
  The inspector is a lazy chunk. When it cannot be fetched (offline on a first use,
  or a deploy replaced the file an open page points at) the page must stay up and
  say so; a rejected import must never take the home page down with it.
*/
vi.mock('./SpecimenInspector', () => {
  throw new Error('Failed to fetch dynamically imported module')
})

afterEach(() => {
  vi.restoreAllMocks()
})

describe('SpecimenInspectorHost', () => {
  it('keeps the page up and says so when the inspector cannot be fetched', async () => {
    // React reports the caught error; the boundary is the thing under test
    vi.spyOn(console, 'error').mockImplementation(() => undefined)
    render(
      <MemoryRouter initialEntries={['/?inspect=four-seam']}>
        <CompareProvider>
          <SpecimenInspectorHost>
            <p>The filed set</p>
          </SpecimenInspectorHost>
        </CompareProvider>
      </MemoryRouter>,
    )
    const dialog = await screen.findByRole('dialog', {}, { timeout: 4000 })
    expect(dialog).toHaveAccessibleName('The inspector did not load')
    expect(screen.getByRole('button', { name: 'Reload the page' })).toBeInTheDocument()
    expect(screen.getByText('The filed set')).toBeInTheDocument()
  })

  it('returns to the opener when the failed-download dialog is closed', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => undefined)
    const user = userEvent.setup()
    render(
      <MemoryRouter>
        <CompareProvider>
          <SpecimenInspectorHost><InspectButton slug="four-seam" /></SpecimenInspectorHost>
        </CompareProvider>
      </MemoryRouter>,
    )
    const opener = screen.getByRole('button', { name: /Inspect card/ })
    await user.click(opener)
    const dialog = await screen.findByRole('dialog', {}, { timeout: 4000 })
    await user.click(within(dialog).getAllByRole('button', { name: 'Close' })[0])
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())
    await waitFor(() => expect(opener).toHaveFocus())
  })
})
