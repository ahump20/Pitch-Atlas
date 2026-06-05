import { describe, it, expect } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import { createMemoryRouter, RouterProvider } from 'react-router-dom'
import { createHead, UnheadProvider } from '@unhead/react/client'
import { routes } from './routes'

/*
  Multi-page smoke tests. jsdom has no WebGL, so every page renders through its
  honest static fallback (the seam schematic), and each route is exercised through
  a memory router. The provenance figures must be the real, sourced ones.
*/

function renderRoute(path: string) {
  const head = createHead()
  const router = createMemoryRouter(routes, { initialEntries: [path] })
  return render(
    <UnheadProvider head={head}>
      <RouterProvider router={router} />
    </UnheadProvider>,
  )
}

const FAILURE_SIGNATURES = ['undefined', 'NaN', '[object Object]', 'Math.random', 'Loading...', 'TODO', 'Baseball Atlas']

describe('Atlas home', () => {
  it('renders the product hero and the table of contents', async () => {
    renderRoute('/')
    expect(await screen.findByRole('heading', { level: 1 })).toHaveTextContent(
      'The living field manual for pitching grips.',
    )
    expect(screen.getByText('How the Atlas works')).toBeInTheDocument()
    expect(screen.getByText('The catalog')).toBeInTheDocument()
    expect(screen.getByText('The arms that defined the pitches.')).toBeInTheDocument()
  })

  it('lists every specimen in the masthead index', async () => {
    renderRoute('/')
    const nav = await screen.findByRole('navigation', { name: 'Specimen index' })
    for (const name of ['Four-seam', 'Sinker', 'Circle change', '12-6 curve', 'Slider', 'Splitter', 'Splinker']) {
      expect(within(nav).getByText(name)).toBeInTheDocument()
    }
  })
})

describe('Pitch chapters', () => {
  it('leads the four-seam chapter with the pitch name and shows a sourced master figure', async () => {
    renderRoute('/pitch/four-seam')
    expect(await screen.findByRole('heading', { level: 1 })).toHaveTextContent('Four-seam fastball')
    expect(screen.getByText('2,530 rpm')).toBeInTheDocument()
    expect(screen.getByText('Master files')).toBeInTheDocument()
  })

  it('renders the new splitter specimen with its pioneer master', async () => {
    renderRoute('/pitch/splitter')
    expect(await screen.findByRole('heading', { level: 1 })).toHaveTextContent('Splitter')
    expect(screen.getByText('Bruce Sutter')).toBeInTheDocument()
  })

  it('renders the new splinker specimen with Skenes as a master', async () => {
    renderRoute('/pitch/splinker')
    expect(await screen.findByRole('heading', { level: 1 })).toHaveTextContent('Splinker')
    expect(screen.getAllByText('Paul Skenes').length).toBeGreaterThan(0)
  })

  it('files Wainwright as a master on the 12-6 curve page', async () => {
    renderRoute('/pitch/twelve-six')
    expect(await screen.findByRole('heading', { level: 1 })).toHaveTextContent('12-6 curveball')
    expect(screen.getAllByText('Adam Wainwright').length).toBeGreaterThan(0)
    expect(screen.getByText('26 wRC+')).toBeInTheDocument()
  })

  it('shows the 404 for an unknown specimen', async () => {
    renderRoute('/pitch/knuckleball')
    expect(await screen.findByText('That file is not in the atlas.')).toBeInTheDocument()
  })
})

describe('The Craftsmen', () => {
  it('lists the masters and the legend in the hall', async () => {
    renderRoute('/craftsmen')
    expect(await screen.findByRole('heading', { level: 1 })).toHaveTextContent('The arms that defined the pitches.')
    for (const name of ['Bob Gibson', 'Nolan Ryan', 'Roger Clemens', 'Greg Maddux', 'Johan Santana', 'Adam Wainwright', 'Paul Skenes', 'The gyroball']) {
      expect(screen.getAllByText(name).length).toBeGreaterThan(0)
    }
  })

  it('renders a craftsman chapter with a sourced quote and record', async () => {
    renderRoute('/craftsmen/bob-gibson')
    expect(await screen.findByRole('heading', { level: 1 })).toHaveTextContent('Bob Gibson')
    expect(screen.getByText(/about 90 percent mental/)).toBeInTheDocument()
    expect(screen.getByText('1.12')).toBeInTheDocument()
  })

  it('renders the Wainwright chapter linked to its 12-6 specimen', async () => {
    renderRoute('/craftsmen/adam-wainwright')
    expect(await screen.findByRole('heading', { level: 1 })).toHaveTextContent('Adam Wainwright')
    expect(screen.getByText('2,202')).toBeInTheDocument()
    expect(screen.getByText(/Study the 12-6 curveball/)).toBeInTheDocument()
  })

  it('files the gyroball as a legend with a myth-versus-physics block', async () => {
    renderRoute('/craftsmen/gyroball')
    expect(await screen.findByRole('heading', { level: 1 })).toHaveTextContent('The gyroball')
    expect(screen.getByText('The myth, and the physics')).toBeInTheDocument()
  })
})

describe('Sources', () => {
  it('states the provenance model and a computed as-of date', async () => {
    renderRoute('/sources')
    expect(await screen.findByRole('heading', { level: 1 })).toHaveTextContent('Sourced, not corrected.')
    expect(screen.getByText(/As of .*\d{4}\./)).toBeInTheDocument()
  })
})

describe('No failure signatures', () => {
  it.each(['/', '/pitch/four-seam', '/pitch/splinker', '/pitch/twelve-six', '/craftsmen', '/craftsmen/johan-santana', '/craftsmen/adam-wainwright', '/sources'])(
    'renders %s with no failure signatures',
    async (path) => {
      const { container } = renderRoute(path)
      await screen.findByRole('heading', { level: 1 })
      const text = container.textContent ?? ''
      for (const bad of FAILURE_SIGNATURES) {
        expect(text).not.toContain(bad)
      }
    },
  )
})
