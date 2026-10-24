import { afterEach, describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { CompareProvider } from '../compare/CompareProvider'
import { SpecimenInspectorHost } from './SpecimenInspectorHost'

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
})
