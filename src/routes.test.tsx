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
  it('leads with the hero and makes the Pitch Index the front door', async () => {
    renderRoute('/')
    expect(await screen.findByRole('heading', { level: 1 })).toHaveTextContent('Pitch Atlas')
    // the Pitch Index is the dominant home section: the specimen set plus the front-door teaser
    expect(screen.getByText(/Every accepted pitch by family/)).toBeInTheDocument()
    expect(screen.getAllByText('Eephus').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Cutter').length).toBeGreaterThan(0)
    // the two side wings still have a door
    expect(screen.getAllByText('The Craftsmen').length).toBeGreaterThan(0)
  })

  it('shows one clear primary nav, not the old per-pitch strip', async () => {
    renderRoute('/')
    const nav = await screen.findByRole('navigation', { name: 'Primary' })
    for (const label of ['Pitch Index', 'Craftsmen', 'Sources']) {
      expect(within(nav).getByText(label)).toBeInTheDocument()
    }
    // the redundant per-pitch specimen strip is gone
    expect(screen.queryByRole('navigation', { name: 'Specimen index' })).not.toBeInTheDocument()
  })
})

describe('Pitch chapters', () => {
  it('leads the four-seam chapter with the pitch name and shows a sourced master figure', async () => {
    renderRoute('/pitch/four-seam')
    expect(await screen.findByRole('heading', { level: 1 })).toHaveTextContent('Four-seam fastball')
    expect(screen.getByText('Grip Evidence')).toBeInTheDocument()
    expect(screen.getByAltText(/four-seam style/i)).toBeInTheDocument()
    expect(screen.getByText(/Shape read/i)).toBeInTheDocument()
    expect(screen.getByText('Master Files')).toBeInTheDocument()
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
    expect(screen.getByText(/The curve as a career/)).toBeInTheDocument()
  })

  it('redirects the full 12-6 slug alias to the filed specimen', async () => {
    renderRoute('/pitch/twelve-six-curveball')
    expect(await screen.findByRole('heading', { level: 1 })).toHaveTextContent('12-6 curveball')
  })

  it('shows the 404 for an unknown specimen', async () => {
    renderRoute('/pitch/does-not-exist')
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

describe('About', () => {
  it('explains the grip-first thesis and competitor field', async () => {
    renderRoute('/about')
    expect(await screen.findByRole('heading', { level: 1 })).toHaveTextContent('The pitch, in your hand.')
    expect(screen.getByText('What it is')).toBeInTheDocument()
    expect(screen.getByText('Measurement dashboards')).toBeInTheDocument()
    expect(screen.getByText('Useful imperfection')).toBeInTheDocument()
    expect(screen.getByText('Where it came from')).toBeInTheDocument()
    expect(screen.getByText('It started as one hand on one ball.')).toBeInTheDocument()
    expect(screen.getByText('Why it exists')).toBeInTheDocument()
    expect(screen.getByText('A grip dies with the arm.')).toBeInTheDocument()
    expect(screen.getByText('Known, unknown, open')).toBeInTheDocument()
  })
})

describe('Privacy and support', () => {
  it('renders the privacy policy with its core promises and the deletion route', async () => {
    renderRoute('/privacy')
    expect(await screen.findByRole('heading', { level: 1 })).toHaveTextContent('What the atlas holds')
    expect(screen.getByText('No tracking')).toBeInTheDocument()
    expect(screen.getByText('No sale of data')).toBeInTheDocument()
    expect(screen.getAllByText(/delete\s*account/).length).toBeGreaterThan(0)
    // the policy is dated, once, in the hero eyebrow
    expect(screen.getByText(/Privacy policy · \d{4}-\d{2}-\d{2}/)).toBeInTheDocument()
  })

  it('renders the support page with report, deletion, and contact routes', async () => {
    renderRoute('/support')
    expect(await screen.findByRole('heading', { level: 1 })).toHaveTextContent('Flag it.')
    expect(screen.getByText('Report a problem with a note or post')).toBeInTheDocument()
    expect(screen.getByText('Delete your account')).toBeInTheDocument()
    expect(screen.getAllByText(/in-product Report flow/).length).toBeGreaterThan(0)
    // no fabricated contact details
    expect(screen.queryByText(/@pitch-atlas\.com/)).not.toBeInTheDocument()
  })
})

describe('The Pitch Index', () => {
  it('catalogs every accepted pitch by family, including the kick change', async () => {
    renderRoute('/repertoire')
    expect(await screen.findByRole('heading', { level: 1 })).toHaveTextContent('The Pitch Index')
    expect(screen.getAllByText('Kick Change').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Four-Seam Fastball').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Cutter').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Grip tell').length).toBeGreaterThan(0)
  })

  it('files the knuckle-slurve honestly as not a pitch', async () => {
    renderRoute('/repertoire')
    await screen.findByRole('heading', { level: 1 })
    expect(screen.getAllByText(/Knuckle-Slurve/).length).toBeGreaterThan(0)
    expect(screen.getAllByText('Not a pitch').length).toBeGreaterThan(0)
  })

  it('also surfaces the lost-pitches wing in the index', async () => {
    renderRoute('/repertoire')
    await screen.findByRole('heading', { level: 1 })
    expect(screen.getAllByText('Lost Pitches of the Negro Leagues').length).toBeGreaterThan(0)
  })
})

describe('Basic pitch files', () => {
  it('renders a basic file for an unfiled pitch with an honest marker and a discussion', async () => {
    renderRoute('/repertoire/slurve')
    expect(await screen.findByRole('heading', { level: 1 })).toHaveTextContent('Slurve')
    expect(screen.getByText('Basic file')).toBeInTheDocument()
    expect(screen.getAllByText('Discussion').length).toBeGreaterThan(0)
  })

  it('opens the football-change grip evidence on the palmball file', async () => {
    renderRoute('/repertoire/palmball')
    expect(await screen.findByRole('heading', { level: 1 })).toHaveTextContent('Palmball')
    expect(screen.getByText('Grip Evidence')).toBeInTheDocument()
    expect(screen.getByAltText(/football change or palmball grip/i)).toBeInTheDocument()
  })

  it('redirects a filed pitch id straight to its full specimen', async () => {
    renderRoute('/repertoire/four-seam-fastball')
    expect(await screen.findByRole('heading', { level: 1 })).toHaveTextContent('Four-seam fastball')
  })

  it('shows the 404 for an unknown pitch id', async () => {
    renderRoute('/repertoire/not-a-real-pitch')
    expect(await screen.findByText('That file is not in the atlas.')).toBeInTheDocument()
  })
})

describe('Lost Pitches of the Negro Leagues', () => {
  it('leads the hall with the documented anchors', async () => {
    renderRoute('/lost-pitches')
    expect(await screen.findByRole('heading', { level: 1 })).toHaveTextContent('Lost Pitches of the Negro Leagues.')
    for (const name of ["Satchel Paige's Hesitation Pitch", "Hilton Smith's Curveball", "Chet Brewer's Emery Ball"]) {
      expect(screen.getAllByText(name).length).toBeGreaterThan(0)
    }
  })

  it('renders the hesitation-pitch chapter with the documented Harridge ruling', async () => {
    renderRoute('/lost-pitches/satchel-paige-hesitation-pitch')
    expect(await screen.findByRole('heading', { level: 1 })).toHaveTextContent("Satchel Paige's Hesitation Pitch")
    expect(screen.getAllByText(/Will Harridge/).length).toBeGreaterThan(0)
    expect(screen.getAllByText('Documented').length).toBeGreaterThan(0)
  })

  it('files the Paige showman arsenal as a flagged legend', async () => {
    renderRoute('/lost-pitches/paige-showman-arsenal')
    expect(await screen.findByRole('heading', { level: 1 })).toHaveTextContent('the showman layer')
    expect(screen.getAllByText('Legend').length).toBeGreaterThan(0)
  })

  it('shows the 404 for an unknown lost pitch', async () => {
    renderRoute('/lost-pitches/not-a-real-pitch')
    expect(await screen.findByText('That file is not in the atlas.')).toBeInTheDocument()
  })
})

describe('No failure signatures', () => {
  it.each(['/', '/about', '/privacy', '/support', '/pitch/four-seam', '/pitch/splinker', '/pitch/twelve-six', '/pitch/sweeper', '/pitch/cutter', '/pitch/knuckleball', '/pitch/forkball', '/pitch/eephus', '/craftsmen', '/craftsmen/johan-santana', '/craftsmen/adam-wainwright', '/sources', '/repertoire', '/repertoire/slurve', '/repertoire/knuckle-slurve', '/lost-pitches', '/lost-pitches/satchel-paige-hesitation-pitch', '/lost-pitches/doctored-ball-divergence-and-recovery', '/lost-pitches/paige-showman-arsenal'])(
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
