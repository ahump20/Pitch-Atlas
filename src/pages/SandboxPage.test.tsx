import { beforeEach, describe, expect, it } from 'vitest'
import { act, fireEvent, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createMemoryRouter, Outlet, RouterProvider } from 'react-router-dom'
import { createHead, UnheadProvider } from '@unhead/react/client'
import { CompareProvider } from '../components/compare/CompareProvider'
import { COMPARE_KEY } from '../components/compare/selection'
import { EggProvider } from '../components/eggs/EggProvider'
import { PITCHES } from '../data/pitches'
import { CONFIDENCE_META } from '../data/types'
import { SandboxPage } from './SandboxPage'

function setup(url = '/sandbox') {
  const router = createMemoryRouter([
    {
      element: <CompareProvider><EggProvider><Outlet /></EggProvider></CompareProvider>,
      children: [
        { path: '/sandbox', element: <SandboxPage /> },
        { path: '/pitch/:slug', element: <h1>Specimen destination</h1> },
        { path: '/repertoire', element: <h1>Pitch Index destination</h1> },
      ],
    },
  ], { initialEntries: ['/repertoire', url], initialIndex: 1 })
  render(<UnheadProvider head={createHead()}><RouterProvider router={router} /></UnheadProvider>)
  return router
}

beforeEach(() => sessionStorage.clear())

describe('Shape Lab reference and URL state', () => {
  it.each(['', '?pitch=missing', '?pitch=__proto__'])('keeps a missing or unknown reference unselected: %s', (search) => {
    setup(`/sandbox${search}`)
    expect(screen.getByRole('combobox', { name: 'Pitch reference' })).toHaveValue('')
    expect(screen.getByRole('option', { name: 'Choose a filed pitch' })).toHaveProperty('selected', true)
    expect(screen.queryByRole('link', { name: 'Inspect grip' })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /^Compare / })).not.toBeInTheDocument()
  })

  it.each(['', 'NaN', 'Infinity', '-15', '360', '16', '15.5', '90junk', '1e2', '0xF'])('falls back to the stock tilt for invalid input %s', (tilt) => {
    setup(`/sandbox?pitch=slider&tilt=${encodeURIComponent(tilt)}`)
    expect(screen.getByRole('slider', { name: 'Spin tilt' })).toHaveValue('0')
    expect(screen.getByRole('button', { name: '12:00 ride' })).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByRole('combobox', { name: 'Pitch reference' })).toHaveValue('slider')
  })

  it.each([0, 15, 90, 225, 345])('restores a valid %s degree tilt', (tilt) => {
    setup(`/sandbox?tilt=${tilt}`)
    expect(screen.getByRole('slider', { name: 'Spin tilt' })).toHaveValue(String(tilt))
  })

  it('reads the selected canonical grip with its source and confidence, and adds that pitch to Compare', async () => {
    const user = userEvent.setup()
    const router = setup('/sandbox?tilt=225&keep=lesson')
    const entry = PITCHES.find((pitch) => pitch.display.slug === 'slider')!
    await user.selectOptions(screen.getByRole('combobox', { name: 'Pitch reference' }), entry.display.slug)

    const reference = within(screen.getByRole('region', { name: 'A grip to study' }))
    expect(reference.getByText(entry.canonical.grip.value)).toBeInTheDocument()
    expect(reference.getByText(CONFIDENCE_META[entry.canonical.grip.confidence].label)).toBeInTheDocument()
    expect(reference.getByText(entry.canonical.grip.source!.label).closest('a')).toHaveAttribute('href', entry.canonical.grip.source!.url)
    expect(reference.getByRole('link', { name: 'Inspect grip' })).toHaveAttribute('href', '/pitch/slider#grip-lab')
    expect(screen.getByRole('slider', { name: 'Spin tilt' })).toHaveValue('225')
    expect(screen.getByRole('button', { name: 'Drop + sweep' })).toHaveAttribute('aria-pressed', 'true')
    expect(reference.getByText(/the plot remains an illustrative model, not measured movement/)).toBeInTheDocument()

    await user.click(reference.getByRole('button', { name: 'Compare slider' }))
    expect(reference.getByRole('button', { name: 'Selected slider' })).toHaveAttribute('aria-pressed', 'true')
    expect(JSON.parse(sessionStorage.getItem(COMPARE_KEY)!)).toMatchObject({ a: 'slider' })
    expect(new URLSearchParams(router.state.location.search).get('keep')).toBe('lesson')
    expect(router.state.location.pathname).toBe('/sandbox')
  })

  it('preserves both choices and unrelated parameters through presets, slider changes, specimen visits and Back', async () => {
    const user = userEvent.setup()
    const router = setup('/sandbox?keep=lesson&keep=second')
    await user.selectOptions(screen.getByRole('combobox', { name: 'Pitch reference' }), 'four-seam')
    await user.click(screen.getByRole('button', { name: 'Ride + run' }))
    expect(new URLSearchParams(router.state.location.search).get('tilt')).toBe('45')
    fireEvent.change(screen.getByRole('slider', { name: 'Spin tilt' }), { target: { value: '105' } })
    const savedSearch = router.state.location.search
    expect(new URLSearchParams(savedSearch).get('pitch')).toBe('four-seam')
    expect(new URLSearchParams(savedSearch).get('tilt')).toBe('105')
    expect(new URLSearchParams(savedSearch).getAll('keep')).toEqual(['lesson', 'second'])
    expect(router.state.preventScrollReset).toBe(true)

    await user.click(screen.getByRole('link', { name: 'Inspect grip' }))
    expect(router.state.location.pathname).toBe('/pitch/four-seam')
    await act(() => router.navigate(-1))
    expect(router.state.location.search).toBe(savedSearch)
    expect(screen.getByRole('slider', { name: 'Spin tilt' })).toHaveValue('105')
    expect(screen.getByRole('combobox', { name: 'Pitch reference' })).toHaveValue('four-seam')
    await act(() => router.navigate(-1))
    expect(router.state.location.pathname).toBe('/repertoire')
  })

  it('clears the reference without losing tilt or leaving a stale grip link', async () => {
    const user = userEvent.setup()
    const router = setup('/sandbox?pitch=slider&tilt=270&keep=lesson')
    await user.selectOptions(screen.getByRole('combobox', { name: 'Pitch reference' }), '')
    const params = new URLSearchParams(router.state.location.search)
    expect(params.has('pitch')).toBe(false)
    expect(params.get('tilt')).toBe('270')
    expect(params.get('keep')).toBe('lesson')
    expect(screen.queryByRole('link', { name: 'Inspect grip' })).not.toBeInTheDocument()
  })
})
