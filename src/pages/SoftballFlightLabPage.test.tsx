import { beforeEach, describe, expect, it } from 'vitest'
import { fireEvent, render, screen, within } from '@testing-library/react'
import { createMemoryRouter, RouterProvider } from 'react-router-dom'
import { createHead, UnheadProvider } from '@unhead/react/client'
import { SoftballFlightLabPage } from './SoftballFlightLabPage'
import { resetLabSettingsCache } from '../components/flightlab/labSettings'

/*
  The Flight Lab page in jsdom, which has no WebGL: the schematic is the stage,
  so this is the no-WebGL page a visitor would get. It must lead with the
  verdict, keep the rulebook in the URL, re-judge on a pitch pick, keep the
  visitor's batter in storage, and never name the default batter or print a
  spin, speed or break figure.
*/

function setup(url = '/softball/flight-lab') {
  const router = createMemoryRouter([{ path: '/softball/flight-lab', element: <SoftballFlightLabPage /> }], {
    initialEntries: [url],
  })
  render(
    <UnheadProvider head={createHead()}>
      <RouterProvider router={router} />
    </UnheadProvider>,
  )
  return router
}

beforeEach(() => {
  localStorage.clear()
  resetLabSettingsCache()
})

describe('Flight Lab page', () => {
  it('leads with the verdict and the look-for window for the measured batter', () => {
    setup()
    expect(screen.getByRole('heading', { level: 2, name: 'Your pitch' })).toBeInTheDocument()
    expect(document.querySelector('[data-flight-lookfor]')?.textContent).toBe('6–37in')
    expect(screen.getByText(/Look for it to land 6 to 37 in past the front of the plate\./)).toBeInTheDocument()
    expect(screen.getByText(/where a falling lob is still higher/)).toBeInTheDocument()
    expect(document.querySelector('[data-stage-mode="schematic"]')).not.toBeNull()
    // no camera switch without WebGL; Throw and Slow stay
    expect(screen.queryByRole('button', { name: 'Catcher' })).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Throw' })).toBeEnabled()
    expect(screen.getByRole('button', { name: 'Slow' })).toHaveAttribute('aria-pressed', 'false')
  })

  it('keeps the rulebook in ?rule= and shows its lines as sourced claims', () => {
    const router = setup('/softball/flight-lab?rule=usa')
    const rules = screen.getByRole('region', { name: 'USA Softball rules' })
    expect(within(rules).getByText('Peak between 6 and 10 ft above the ground.')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'USA Senior' }))
    expect(router.state.location.search).toBe('?rule=senior')
    expect(screen.getByRole('region', { name: 'USA Senior rules' })).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'USSSA' }))
    expect(router.state.location.search).toBe('')
  })

  it('re-judges when another lob is picked', () => {
    setup()
    const list = screen.getByRole('region', { name: 'Pitches' })
    fireEvent.click(within(list).getByRole('button', { name: /Rainbow/ }))
    expect(screen.getByRole('heading', { level: 2, name: /Illegal arc/ })).toBeInTheDocument()
    expect(screen.getByRole('region', { name: 'Tune the rainbow' })).toBeInTheDocument()
  })

  it('stores the visitor’s batter and resets to the measured one', () => {
    setup()
    fireEvent.change(screen.getByRole('slider', { name: 'Height' }), { target: { value: '70' } })
    expect(screen.getByRole('slider', { name: 'Height' })).toHaveAttribute('aria-valuetext', '5 ft 10 in')
    expect(JSON.parse(localStorage.getItem('pa-flight-lab:batter:v1') ?? '{}').heightIn).toBe(70)
    fireEvent.click(within(screen.getByRole('region', { name: 'You' })).getByRole('button', { name: 'Reset' }))
    expect(screen.getByRole('slider', { name: 'Height' })).toHaveAttribute('aria-valuetext', '5 ft 2 in')
  })

  it('shows the compare readouts and never a spin, speed or break figure', () => {
    setup()
    expect(screen.getByText('Barrel reach')).toBeInTheDocument()
    expect(screen.getByText('To match your 32')).toBeInTheDocument()
    const text = document.body.textContent ?? ''
    expect(text).not.toMatch(/\brpm\b|\bmph\b|spin rate|inches of break/i)
    expect(text).not.toMatch(/NaN|undefined|\[object Object\]/)
    expect(text).toContain('one batter’s measured swing')
  })
})
