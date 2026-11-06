import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen, within } from '@testing-library/react'
import { createMemoryRouter, RouterProvider } from 'react-router-dom'
import { createHead, UnheadProvider } from '@unhead/react/client'
import { SoftballFlightLabPage } from './SoftballFlightLabPage'
import { resetLabSettingsCache } from '../components/flightlab/labSettings'
import { resetBestCache } from '../components/flightlab/callThePitch'

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
  resetBestCache()
})

afterEach(() => {
  vi.restoreAllMocks()
})

describe('Flight Lab page', () => {
  it('leads with the verdict and the look-for window for the measured batter', () => {
    setup()
    expect(screen.getByRole('heading', { level: 2, name: 'Your pitch' })).toBeInTheDocument()
    expect(document.querySelector('[data-flight-lookfor]')?.textContent).toBe('6–37in')
    expect(screen.getByText(/Look for it to land 6 to 37 in past the front of the plate\./)).toBeInTheDocument()
    expect(screen.getByText(/Your barrel meets it out front, where it hasn’t finished falling\./)).toBeInTheDocument()
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

  it('says whose swing it is and how far the rule lines go', () => {
    setup()
    // the swing is one batter's, scaled; the lab claims nothing about the visitor's own
    expect(screen.getByText(/scaled to your height\. It doesn’t know yours\./)).toBeInTheDocument()
    // the rule lines are paraphrased and cited, so the page must not call them quotes
    const text = document.body.textContent ?? ''
    expect(text).not.toMatch(/quoted from the rule books/i)
    expect(text).toContain('each cited to its rule or definition')
  })
})

describe('Flight Lab arsenal', () => {
  it('throws every lob as the picked pitch and keeps it in ?pitch=', () => {
    const router = setup()
    const arsenal = screen.getByRole('region', { name: 'Arsenal' })
    fireEvent.click(within(arsenal).getByRole('button', { name: 'Knuckler' }))
    expect(router.state.location.search).toBe('?pitch=knuckler')
    expect(within(arsenal).getByRole('button', { name: 'Knuckler' })).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByText('Knuckler · Belt-high lob')).toBeInTheDocument()
    expect(within(arsenal).getByText(/Thrown with little or no spin/)).toBeInTheDocument()
    // the knuckler says where it was aimed and how far its seams took it
    const readout = screen.getByRole('region', { name: 'This pitch' })
    expect(within(readout).getByText('Aimed at')).toBeInTheDocument()
    expect(within(readout).getByText('Wandered')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Throw all six as knucklers' })).toBeInTheDocument()
    // back to the plain lob clears the URL
    fireEvent.click(within(arsenal).getByRole('button', { name: 'Lob' }))
    expect(router.state.location.search).toBe('')
    expect(within(readout).queryByText('Wandered')).not.toBeInTheDocument()
  })

  it('opens on the pitch in the URL and draws its no-spin ghost and spin dial', () => {
    setup('/softball/flight-lab?pitch=topspin')
    expect(screen.getByText('Topspin · Belt-high lob')).toBeInTheDocument()
    expect(document.querySelector('[data-flight-ghost]')).not.toBeNull()
    expect(document.querySelector('[data-flight-spin-dial="topspin"]')).not.toBeNull()
  })

  it('draws no ghost for the plain lob, and ignores a pitch it does not know', () => {
    setup('/softball/flight-lab?pitch=screwball')
    expect(screen.getByRole('heading', { level: 2, name: 'Your pitch' })).toBeInTheDocument()
    expect(document.querySelector('[data-flight-ghost]')).toBeNull()
  })

  it('throws a new knuckler dance each time', () => {
    setup('/softball/flight-lab?pitch=knuckler')
    const readout = screen.getByRole('region', { name: 'This pitch' })
    const wandered = () => within(readout).getByText('Wandered').nextElementSibling?.textContent
    const aimed = () => within(readout).getByText('Aimed at').nextElementSibling?.textContent
    const first = wandered()
    fireEvent.click(screen.getByRole('button', { name: 'Throw' }))
    // the seams start somewhere new, so it wanders a new way from the same aim
    expect(aimed()).toBe('36in past the front')
    expect(wandered()).not.toBe(first)
  })

  it('sources every pitch and tags its spin as the model’s', () => {
    setup()
    expect(screen.getByText('Knuckler: its spin')).toBeInTheDocument()
    expect(screen.getByText('Knuckler: the seams push it')).toBeInTheDocument()
    const text = document.body.textContent ?? ''
    expect(text).not.toMatch(/\brpm\b|\bmph\b|spin rate|inches of break/i)
  })
})

describe('Call the pitch', () => {
  it('hides the pitch, takes both calls, then shows the truth and the score', () => {
    setup()
    // knuckler, onto the belt-high lob
    vi.spyOn(Math, 'random').mockReturnValueOnce(0.1).mockReturnValueOnce(0.05).mockReturnValueOnce(0.5)
    fireEvent.click(screen.getByRole('button', { name: 'Call the pitch' }))
    expect(screen.queryByRole('button', { name: 'Throw' })).not.toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Deal' }))

    // the stage hides which pitch it is, and the rail is out of reach
    expect(screen.getByRole('heading', { level: 2, name: 'What was it?' })).toBeInTheDocument()
    expect(screen.queryByText(/Knuckler · /)).not.toBeInTheDocument()
    expect(document.querySelector('aside[aria-label="Lab controls"]')).toHaveAttribute('inert')
    expect(document.querySelector('[data-flight-spin-dial="lob"]')).not.toBeNull()

    fireEvent.click(within(screen.getByRole('group', { name: 'What spin is it' })).getByRole('button', { name: 'Knuckler' }))
    const verdictWord = () => document.querySelector('[data-flight-verdict]')?.textContent
    fireEvent.click(within(screen.getByRole('group', { name: 'Swing or take' })).getByRole('button', { name: 'Swing' }))

    const result = document.querySelector('[data-flight-call-result]') as HTMLElement
    expect(result).not.toBeNull()
    expect(within(result).getByText(/^Knuckler · /)).toBeInTheDocument()
    expect(within(result).getByText(/✓ Knuckler/)).toBeInTheDocument()
    expect(verdictWord()).not.toBe('What was it?')
    expect(document.querySelector('aside[aria-label="Lab controls"]')).not.toHaveAttribute('inert')
    expect(screen.getByRole('button', { name: 'Next pitch' })).toBeInTheDocument()
  })

  it('keeps the best streak in this browser', () => {
    setup()
    // backspin onto the belt-high lob: your pitch, so swing is right
    vi.spyOn(Math, 'random').mockReturnValue(0.3).mockReturnValueOnce(0.3).mockReturnValueOnce(0.05).mockReturnValueOnce(0.2)
    fireEvent.click(screen.getByRole('button', { name: 'Call the pitch' }))
    fireEvent.click(screen.getByRole('button', { name: 'Deal' }))
    fireEvent.click(within(screen.getByRole('group', { name: 'What spin is it' })).getByRole('button', { name: 'Backspin' }))
    fireEvent.click(within(screen.getByRole('group', { name: 'Swing or take' })).getByRole('button', { name: 'Swing' }))
    expect(localStorage.getItem('pa-flight-lab:call:v1')).toBe('1')
  })

  it('puts the lab back when the game is put away', () => {
    setup()
    fireEvent.click(screen.getByRole('button', { name: 'Call the pitch' }))
    fireEvent.click(screen.getByRole('button', { name: 'Deal' }))
    fireEvent.click(screen.getByRole('button', { name: 'Call the pitch' }))
    expect(screen.getByRole('heading', { level: 2, name: 'Your pitch' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Throw' })).toBeInTheDocument()
  })
})
