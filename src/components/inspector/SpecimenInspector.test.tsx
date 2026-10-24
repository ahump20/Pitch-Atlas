import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { act, fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, useLocation } from 'react-router-dom'
import { CompareProvider } from '../compare/CompareProvider'
import { PITCHES } from '../../data/pitches'
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

/* the dialog's chunk is loaded lazily, so a busy machine can take seconds to open it;
   the same allowance routes.test.tsx gives its first lazy route (COLD_LOAD), well inside
   the configured testTimeout */
const OPEN = { timeout: 30000 }

afterEach(() => {
  vi.unstubAllGlobals()
  window.localStorage.clear()
})

describe('SpecimenInspector', () => {
  it('opens from the URL, turns the card over, and routes into the grip lab', async () => {
    const user = userEvent.setup()
    render(<Harness start="/?inspect=four-seam" />)
    const dialog = await screen.findByRole('dialog', {}, OPEN)
    expect(dialog).toHaveAccessibleName(/Inspect card: Four-seam/)
    expect(within(dialog).getByRole('link', { name: /Study grip/ })).toHaveAttribute('href', '/pitch/four-seam#grip-lab')
    // Study grip already opens the file at its grip lab; the rail's other link says what else it holds
    expect(within(dialog).getByRole('link', { name: /Master files and sources/ })).toHaveAttribute('href', '/pitch/four-seam#variants')

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
    const dialog = await screen.findByRole('dialog', {}, OPEN)
    await waitFor(() => expect(within(dialog).getByText(/cannot record a WebM/)).toBeInTheDocument())
    expect(within(dialog).getByRole('button', { name: /Export WebM/ })).toBeDisabled()
    await waitFor(() => expect(within(dialog).getByText(/^Grip: Austin video/)).toBeInTheDocument())
  })

  it('asks before the click: an encoder that writes no WebM leaves the button off and says why', async () => {
    vi.stubGlobal(
      'VideoEncoder',
      Object.assign(function VideoEncoder() {}, {
        isConfigSupported: async (config: VideoEncoderConfig) => ({ supported: false, config }),
      }),
    )
    render(<Harness start="/?inspect=four-seam" />)
    const dialog = await screen.findByRole('dialog', {}, OPEN)
    await waitFor(() => expect(within(dialog).getByText(/cannot record a WebM/)).toBeInTheDocument())
    expect(within(dialog).getByRole('button', { name: /Export WebM/ })).toBeDisabled()
  })

  it('opens from the Inspect button, adds to the comparison, and Escape closes it and clears the URL', async () => {
    const user = userEvent.setup()
    render(<Harness start="/" />)
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: /Inspect card/ }))
    expect(screen.getByTestId('search')).toHaveTextContent('?inspect=twelve-six')
    const dialog = await screen.findByRole('dialog', {}, OPEN)
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
    const dialog = await screen.findByRole('dialog', {}, OPEN)
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
    const dialog = await screen.findByRole('dialog', {}, OPEN)
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
    const dialog = await screen.findByRole('dialog', {}, OPEN)
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

  it('heads the viewer with what the card does not say, outside the scrolling rail, beside its one close button', async () => {
    render(<Harness start="/?inspect=four-seam" />)
    const dialog = await screen.findByRole('dialog', {}, OPEN)
    const heading = within(dialog).getByRole('heading', { level: 2, name: 'Four-seam fastball' })
    const head = heading.closest<HTMLElement>('.specimen-rail-head')
    if (!head) throw new Error('the name sits in the header')
    // the header stays put while the rail scrolls, and on a phone it takes the top strip
    expect(within(dialog).getByRole('complementary', { name: 'Inspector controls' })).not.toContainElement(heading)
    expect(within(head).getByRole('button', { name: 'Close' })).toBeInTheDocument()
    expect(within(dialog).getAllByRole('button', { name: 'Close' })).toHaveLength(1)
    // "Fastball" over "Four-seam fastball" said fastball twice
    expect(within(head).queryByText('Fastball')).not.toBeInTheDocument()
    expect(within(head).queryByText(/Filed specimen/)).not.toBeInTheDocument()
  })

  it('names the family over a name that does not say it', async () => {
    render(<Harness start="/?inspect=slider" />)
    const dialog = await screen.findByRole('dialog', {}, OPEN)
    const heading = within(dialog).getByRole('heading', { level: 2, name: 'Slider' })
    expect(within(heading.closest('.specimen-rail-head') as HTMLElement).getByText('Breaking')).toBeInTheDocument()
  })

  it('reads and tabs in the order it is seen on every screen: the name and Close, then the card, then the rail', async () => {
    const user = userEvent.setup()
    render(<Harness start="/?inspect=four-seam" />)
    const dialog = await screen.findByRole('dialog', {}, OPEN)
    const heading = within(dialog).getByRole('heading', { level: 2, name: 'Four-seam fastball' })
    const stage = within(dialog).getByRole('group', { name: /front showing/ })
    // on a phone the header is drawn above the card, so it must come first in the page too
    expect(heading.compareDocumentPosition(stage) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
    await user.tab()
    expect(within(dialog).getByRole('button', { name: 'Close' })).toHaveFocus()
    await user.tab()
    expect(stage).toHaveFocus()
    // a header element outside sectioning content is the page's banner landmark (the
    // reviewer saw Chromium list it); the viewer's title sits in a plain block instead
    expect(heading.closest('header')).toBeNull()
  })

  it('gives the rail one primary action, and Finish says whether its panel is open', async () => {
    const user = userEvent.setup()
    render(<Harness start="/?inspect=four-seam" />)
    const dialog = await screen.findByRole('dialog', {}, OPEN)
    expect(within(dialog).getByRole('link', { name: /Study grip/ })).toHaveClass('specimen-primary')
    expect(dialog.querySelectorAll('.specimen-rail .specimen-primary')).toHaveLength(1)
    const finish = within(dialog).getByRole('button', { name: 'Finish' })
    expect(finish.querySelector('.specimen-chevron')).not.toBeNull()
    expect(finish).toHaveAttribute('aria-expanded', 'false')
    await user.click(finish)
    expect(finish).toHaveAttribute('aria-expanded', 'true')
  })

  it('promises master files only where every filed pitch has them', () => {
    for (const entry of PITCHES) expect(entry.masterVariants.length, entry.display.slug).toBeGreaterThan(0)
  })

  it('sets the view controls beside the face switch: Pause and Reset as quiet icon buttons that say what they do', async () => {
    const user = userEvent.setup()
    render(<Harness start="/?inspect=four-seam" />)
    const dialog = await screen.findByRole('dialog', {}, OPEN)
    const view = within(dialog).getByRole('group', { name: 'View' })
    expect(within(view).getByRole('group', { name: 'Face' })).toBeInTheDocument()
    expect(within(view).getByRole('button', { name: 'Reset view' })).toBeInTheDocument()
    // they steer the view, not the card, so the card's own actions no longer carry them
    const actions = dialog.querySelector('.specimen-rail > .specimen-rail-actions') as HTMLElement
    expect(within(actions).queryByRole('button', { name: /Pause|Resume|Reset/ })).not.toBeInTheDocument()
    await user.click(within(view).getByRole('button', { name: 'Pause motion' }))
    await user.click(within(view).getByRole('button', { name: 'Resume motion' }))
    expect(within(view).getByRole('button', { name: 'Pause motion' })).toBeInTheDocument()
    // two square buttons side by side carry their icons at one size
    expect(new Set([...view.querySelectorAll('button svg')].map((icon) => icon.getAttribute('width'))).size).toBe(1)
  })

  it('leaves Pause out where reduced motion leaves nothing to pause', async () => {
    window.matchMedia = ((query: string) => ({
      matches: query.includes('reduce'),
      media: query,
      onchange: null,
      addEventListener: () => undefined,
      removeEventListener: () => undefined,
      addListener: () => undefined,
      removeListener: () => undefined,
      dispatchEvent: () => false,
    })) as unknown as typeof window.matchMedia
    render(<Harness start="/?inspect=four-seam" />)
    const dialog = await screen.findByRole('dialog', {}, OPEN)
    const view = within(dialog).getByRole('group', { name: 'View' })
    expect(within(view).queryByRole('button', { name: /motion/ })).not.toBeInTheDocument()
    expect(within(view).getByRole('button', { name: 'Reset view' })).toBeInTheDocument()
    // under reduced motion a drag and the arrow keys hold the card still, so the help
    // names only the keys that still act
    const help = dialog.querySelector('.specimen-rail-keys') as HTMLElement
    expect(within(help).queryByText(/Drag/)).not.toBeInTheDocument()
    expect([...help.querySelectorAll('kbd')].map((k) => k.textContent)).toEqual(['F', 'R'])
  })

  it('under reduced motion, tells a screen reader only the keys that act, and leaves the arrows alone', async () => {
    window.matchMedia = ((query: string) => ({
      matches: query.includes('reduce'),
      media: query,
      onchange: null,
      addEventListener: () => undefined,
      removeEventListener: () => undefined,
      addListener: () => undefined,
      removeListener: () => undefined,
      dispatchEvent: () => false,
    })) as unknown as typeof window.matchMedia
    render(<Harness start="/?inspect=four-seam" />)
    const dialog = await screen.findByRole('dialog', {}, OPEN)
    const description = dialog.getAttribute('aria-describedby')
    const said = description ? document.getElementById(description)?.textContent ?? '' : ''
    expect(said).not.toMatch(/arrow|tilt|Space|pause/i)
    expect(said).toMatch(/F flips/)
    const stage = dialog.querySelector('.specimen-stage') as HTMLElement
    expect(stage.getAttribute('aria-label')).not.toMatch(/Arrow|Space/)
    // an arrow press is the page's to scroll, not swallowed by a card that cannot tilt
    const press = new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true, cancelable: true })
    stage.dispatchEvent(press)
    expect(press.defaultPrevented).toBe(false)
  })

  it('sets the keys as key chips under the rail, the arrows as one, and labels the caption', async () => {
    render(<Harness start="/?inspect=four-seam" />)
    const dialog = await screen.findByRole('dialog', {}, OPEN)
    const keys = [...dialog.querySelectorAll('.specimen-rail-keys kbd')].map((k) => k.textContent)
    expect(keys).toEqual(['←→↑↓', 'F', 'Space', 'R'])
    await waitFor(() => expect(within(dialog).getByText('Caption')).toBeInTheDocument())
    expect(within(dialog).getByText(/^Grip: Austin video/)).toBeInTheDocument()
  })

  it('dims the page behind it with its own overlay, not the shared light one', async () => {
    render(<Harness start="/?inspect=four-seam" />)
    await screen.findByRole('dialog', {}, OPEN)
    expect(document.querySelector('[data-slot="dialog-overlay"]')).toHaveClass('specimen-inspector-overlay')
  })

  it('names every finish switch', async () => {
    const user = userEvent.setup()
    render(<Harness start="/?inspect=four-seam" />)
    const dialog = await screen.findByRole('dialog', {}, OPEN)
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
    const dialog = await screen.findByRole('dialog', {}, OPEN)
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
