import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { act, fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, useLocation } from 'react-router-dom'
import { CompareProvider } from '../compare/CompareProvider'
import { SpecimenInspectorHost } from './SpecimenInspectorHost'
import { InspectButton } from './InspectButton'

/*
  The inspector's contract: ?inspect=<slug> opens it, the rail turns the card over
  and routes into the grip lab, Escape closes it and clears the URL, and where the
  browser cannot record WebM the export panel says so instead of failing quietly.
  jsdom has no WebGL and no MediaRecorder, which is the fallback path under test.
*/

function Probe() {
  const location = useLocation()
  return <output data-testid="search">{location.search}</output>
}

function Harness({ start }: { start: string }) {
  return (
    <MemoryRouter initialEntries={[start]}>
      <CompareProvider>
        <SpecimenInspectorHost>
          <InspectButton slug="twelve-six" />
          <Probe />
        </SpecimenInspectorHost>
      </CompareProvider>
    </MemoryRouter>
  )
}

beforeEach(() => {
  Object.defineProperty(window, 'matchMedia', {
    configurable: true,
    writable: true,
    value: (query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addEventListener: () => undefined,
      removeEventListener: () => undefined,
      addListener: () => undefined,
      removeListener: () => undefined,
      dispatchEvent: () => false,
    }),
  })
  vi.stubGlobal(
    'ResizeObserver',
    class {
      observe() {}
      unobserve() {}
      disconnect() {}
    },
  )
})

afterEach(() => {
  vi.unstubAllGlobals()
  window.localStorage.clear()
})

describe('SpecimenInspector', () => {
  it('opens from the URL, turns the card over, and routes into the grip lab', async () => {
    const user = userEvent.setup()
    render(<Harness start="/?inspect=four-seam" />)
    const dialog = await screen.findByRole('dialog', {}, { timeout: 4000 })
    expect(dialog).toHaveAccessibleName(/Inspect card: Four-seam/)
    expect(within(dialog).getByRole('link', { name: /Study grip/ })).toHaveAttribute('href', '/pitch/four-seam#grip-lab')
    expect(within(dialog).getByRole('link', { name: /Open the full file/ })).toHaveAttribute('href', '/pitch/four-seam')

    const front = dialog.querySelector('.v2-face:not(.v2-face-back)')
    const back = dialog.querySelector('.v2-face-back')
    expect(back).toHaveAttribute('inert')
    expect(front).not.toHaveAttribute('inert')
    await user.click(within(dialog).getByRole('button', { name: 'Sources' }))
    expect(front).toHaveAttribute('inert')
    expect(back).not.toHaveAttribute('inert')
    expect(within(dialog).getAllByRole('link', { name: /Open the full file/ }).length).toBeGreaterThan(0)
  })

  it('says when WebM cannot be recorded and keeps the PNG', async () => {
    render(<Harness start="/?inspect=four-seam" />)
    const dialog = await screen.findByRole('dialog', {}, { timeout: 4000 })
    await waitFor(() => expect(within(dialog).getByText(/cannot record a WebM/)).toBeInTheDocument())
    expect(within(dialog).getByRole('button', { name: /Export WebM/ })).toBeDisabled()
    await waitFor(() => expect(within(dialog).getByText(/Caption: Grip: Austin video/)).toBeInTheDocument())
  })

  it('opens from the Inspect button, adds to the comparison, and Escape closes it and clears the URL', async () => {
    const user = userEvent.setup()
    render(<Harness start="/" />)
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: /Inspect card/ }))
    expect(screen.getByTestId('search')).toHaveTextContent('?inspect=twelve-six')
    const dialog = await screen.findByRole('dialog', {}, { timeout: 4000 })
    const compare = within(dialog).getByRole('button', { name: /Compare twelve six/ })
    await user.click(compare)
    expect(within(dialog).getByRole('button', { name: /Selected twelve six/ })).toHaveAttribute('aria-pressed', 'true')
    await user.keyboard('{Escape}')
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())
    expect(screen.getByTestId('search')).toHaveTextContent('')
  })

  it('turns the face that is showing: on the sources, the arrow keys tilt the back', async () => {
    const user = userEvent.setup()
    render(<Harness start="/?inspect=four-seam" />)
    const dialog = await screen.findByRole('dialog', {}, { timeout: 4000 })
    await user.click(within(dialog).getByRole('button', { name: 'Sources' }))
    const stage = within(dialog).getByRole('group', { name: /sources showing/ })
    stage.focus()
    await user.keyboard('{ArrowRight}{ArrowRight}')
    const back = dialog.querySelector('.v2-back') as HTMLElement
    await waitFor(() => expect(parseFloat(back.style.getPropertyValue('--rx') || '0')).toBeGreaterThan(1))
  })

  it('rests the slow turn while the front is turned away, and picks it up again', async () => {
    const user = userEvent.setup()
    render(<Harness start="/?inspect=four-seam" />)
    const dialog = await screen.findByRole('dialog', {}, { timeout: 4000 })
    const front = dialog.querySelector('.v2-face:not(.v2-face-back) .rfx-card') as HTMLElement
    const pose = () => `${front.style.getPropertyValue('--rx')} ${front.style.getPropertyValue('--ry')}`
    const degrees = () => [front.style.getPropertyValue('--rx'), front.style.getPropertyValue('--ry')].map((v) => parseFloat(v || '0'))
    /** How far the front turns over `ms`, in degrees summed over both axes. */
    const turnOver = async (ms: number) => {
      const [rx0, ry0] = degrees()
      await new Promise((resolve) => window.setTimeout(resolve, ms))
      const [rx1, ry1] = degrees()
      return Math.abs(rx1 - rx0) + Math.abs(ry1 - ry0)
    }

    const atOpen = pose()
    await waitFor(() => expect(pose()).not.toBe(atOpen), { timeout: 3000 })

    await user.click(within(dialog).getByRole('button', { name: 'Sources' }))
    // the spring lets go of its last target, then the hidden front stays put. A live
    // drift covers at least a quarter of a degree in 800ms wherever it is in its cycle.
    await waitFor(async () => expect(await turnOver(300)).toBeLessThan(0.01), { timeout: 5000 })
    expect(await turnOver(800)).toBeLessThan(0.05)

    await user.click(within(dialog).getByRole('button', { name: 'Front' }))
    const atReturn = pose()
    await waitFor(() => expect(pose()).not.toBe(atReturn), { timeout: 3000 })
  })

  it('leaves modified keys to the browser: Cmd+R reloads and Ctrl+F finds, the card stays put', async () => {
    render(<Harness start="/?inspect=four-seam" />)
    const dialog = await screen.findByRole('dialog', {}, { timeout: 4000 })
    const stage = within(dialog).getByRole('group', { name: /front showing/ })
    stage.focus()
    // fireEvent returns false when a handler called preventDefault
    expect(fireEvent.keyDown(stage, { key: 'r', metaKey: true })).toBe(true)
    expect(fireEvent.keyDown(stage, { key: 'f', ctrlKey: true })).toBe(true)
    expect(fireEvent.keyDown(stage, { key: 'F', altKey: true })).toBe(true)
    expect(within(dialog).getByRole('group', { name: /front showing/ })).toBe(stage)
    // the plain key still turns the card over
    expect(fireEvent.keyDown(stage, { key: 'f' })).toBe(false)
    await waitFor(() => expect(within(dialog).getByRole('group', { name: /sources showing/ })).toBeInTheDocument())
  })

  it('names every finish switch', async () => {
    const user = userEvent.setup()
    render(<Harness start="/?inspect=four-seam" />)
    const dialog = await screen.findByRole('dialog', {}, { timeout: 4000 })
    await user.click(within(dialog).getByRole('button', { name: 'Finish' }))
    const switches = within(dialog).getAllByRole('checkbox')
    expect(switches).toHaveLength(8)
    for (const box of switches) expect(box).toHaveAccessibleName(/ finish$/)
    // the four-seam's ember chrome carries the houndstooth
    expect(within(dialog).getByRole('checkbox', { name: 'Houndstooth finish' })).toBeChecked()
  })

  it('remembers a finish for the inspected face on this device', async () => {
    const user = userEvent.setup()
    render(<Harness start="/?inspect=four-seam" />)
    const dialog = await screen.findByRole('dialog', {}, { timeout: 4000 })
    await user.click(within(dialog).getByRole('button', { name: 'Finish' }))
    await user.click(within(dialog).getByRole('button', { name: 'Powder Refractor' }))
    expect(window.localStorage.getItem('pa:finish:four-seam:front')).toContain('"preset":"powder-refractor"')
    await user.click(within(dialog).getByRole('button', { name: /Reset this face/ }))
    expect(window.localStorage.getItem('pa:finish:four-seam:front')).toBeNull()
  })
})

describe('InspectButton', () => {
  it('does not render where there is no inspector to open', () => {
    render(
      <MemoryRouter>
        <InspectButton slug="four-seam" />
      </MemoryRouter>,
    )
    expect(screen.queryByRole('button')).not.toBeInTheDocument()
  })
  it('is a real button even before the dialog opens', () => {
    render(<Harness start="/" />)
    act(() => undefined)
    expect(screen.getByRole('button', { name: /Inspect card/ })).toHaveAttribute('aria-haspopup', 'dialog')
  })
})

describe('the inspect parameter', () => {
  it('ignores a crafted key that is not a filed pitch', async () => {
    render(<Harness start="/?inspect=constructor" />)
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 50))
    })
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })
})
