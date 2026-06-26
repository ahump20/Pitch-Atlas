import { describe, it, expect } from 'vitest'
import { render, screen, waitFor, within } from '@testing-library/react'
import { createMemoryRouter, RouterProvider } from 'react-router-dom'
import { createHead, UnheadProvider } from '@unhead/react/client'
import { routes } from './routes'
import { PITCHES } from './data/pitches'
import { specimenGradeFor } from './data/specimen-grade'

/*
  Multi-page smoke tests. jsdom has no WebGL, so every page renders through its
  honest static fallback (the seam schematic), and each route is exercised through
  a memory router. The provenance figures must be the real, sourced ones.
*/

function renderRoute(path: string) {
  document.head.innerHTML = ''
  const head = createHead()
  const router = createMemoryRouter(routes, { initialEntries: [path] })
  return render(
    <UnheadProvider head={head}>
      <RouterProvider router={router} />
    </UnheadProvider>,
  )
}

async function expectCanonical(path: string, href: string) {
  renderRoute(path)
  await screen.findByRole('navigation', { name: 'Primary' }, COLD_LOAD)
  await waitFor(() => {
    expect(document.head.querySelector('link[rel="canonical"]')?.getAttribute('href')).toBe(href)
  }, COLD_LOAD)
}

const FAILURE_SIGNATURES = ['undefined', 'NaN', '[object Object]', 'Math.random', 'Loading...', 'TODO', 'Baseball Atlas']

/* the first lazy route a file renders pays the whole transform bill cold —
   the same one-time cost vite.config.ts already sizes testTimeout for. The
   first await in a file gets the same allowance; everything after rides the
   warm module graph at the default. */
const COLD_LOAD = { timeout: 30000 }

describe('Atlas home', () => {
  it('publishes a route canonical and the promoted home schema graph', async () => {
    await expectCanonical('/', 'https://pitch-atlas.com/')

    const schema = [...document.head.querySelectorAll('script[type="application/ld+json"]')]
      .map((script) => script.textContent ?? '')
      .join('\n')
    expect(schema).toContain('SearchAction')
    // the home CreativeWork node rode along when the Refractor Case took '/'
    expect(schema).toContain('CreativeWork')
    expect(schema).not.toContain('five pitches')
    expect(schema).not.toContain('2026-06-04')
  })

  it('leads with the Refractor Case hero and files the whole set', async () => {
    renderRoute('/')
    expect(await screen.findByRole('heading', { level: 1 }, COLD_LOAD)).toHaveTextContent(
      /struck as a specimen/i,
    )
    expect(screen.getAllByText('Preserve and progress the art of the pitch.').length).toBeGreaterThan(0)
    expect(screen.getByText('The goal is not nostalgia. It is continuity.')).toBeInTheDocument()
    expect(screen.getByText(/Founding note/)).toBeInTheDocument()
    // the chrome wall carries the whole filed set: every specimen name is in the DOM
    for (const p of PITCHES) {
      expect(screen.getAllByText(p.display.shortName).length).toBeGreaterThan(0)
    }
    // the seam bridge renders the honest four-seam schematic, never a blank stage
    expect(screen.getAllByLabelText(/four-seam specimen/i).length).toBeGreaterThan(0)
    // the onward doors open the two side wings
    expect(screen.getAllByText('The Craftsmen').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Lost Pitches of the Negro Leagues').length).toBeGreaterThan(0)
  })

  it('opens onward into the tools, the craft record, and the rule sheet', async () => {
    renderRoute('/')
    await screen.findByRole('heading', { level: 1 }, COLD_LOAD)
    // all four tools, named to match their destination pages and the masthead
    for (const label of ['Shape Lab', 'The Shape Map', 'Compare pitches', 'Compare grips']) {
      expect(screen.getAllByText(label).length).toBeGreaterThan(0)
    }
    // the craft record leads into the ten sourced chapters
    expect(screen.getByRole('heading', { name: 'The craft record.' })).toBeInTheDocument()
    expect(screen.getAllByText(/Preserve the pitches baseball almost forgot/).length).toBeGreaterThan(0)
    // the rule sheet keeps its real honesty items through the redesign
    expect(screen.getByText('Hardcoded freshness')).toBeInTheDocument()
    expect(screen.getByText('A source on every claim')).toBeInTheDocument()
  })

  it('shows one clear primary nav, not the old per-pitch strip', async () => {
    renderRoute('/')
    const nav = await screen.findByRole('navigation', { name: 'Primary' }, COLD_LOAD)
    // the simplified bar leads with the four content pillars
    for (const label of ['Pitch Index', 'Grips', 'Softball', 'Learn']) {
      expect(within(nav).getByText(label)).toBeInTheDocument()
    }
    // the rest of the atlas is one click away under a single "More" disclosure
    expect(within(nav).getByRole('button', { name: /More/ })).toBeInTheDocument()
    // demoted destinations stay reachable without JS — rendered as plain footer links
    expect(screen.getAllByText('Sources').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Lost Pitches').length).toBeGreaterThan(0)
    // the redundant per-pitch specimen strip is gone
    expect(screen.queryByRole('navigation', { name: 'Specimen index' })).not.toBeInTheDocument()
  })
})

describe('Specimen grade', () => {
  /*
    The honest collectible grade renders on the home specimen wall (ChromeWall),
    where every filed pitch is struck as a card. The gold 1/1 is keyed on data —
    whichever pitch carries specimenNo '00' — never a hardcoded slug, so this
    survives the gold moving to another specimen. A non-gold pitch must wear its
    own computed documentation grade, proving the grade is a real switch on the
    record and not one decorative badge.
  */
  it('stamps the data-keyed 1/1 gold and a dynamic grade on the home wall', async () => {
    const goldEntry = PITCHES.find((p) => p.display.specimenNo === '00')
    expect(goldEntry, 'a filed pitch must be struck at specimen 00 (the gold 1/1)').toBeDefined()
    expect(specimenGradeFor(goldEntry!).label).toBe('Gold · 1 of 1')

    renderRoute('/')
    await screen.findByRole('heading', { level: 1 }, COLD_LOAD)

    // the gold stamp — the only digits the grade system is allowed to print
    expect(screen.getAllByText('Gold · 1 of 1').length).toBeGreaterThan(0)

    // a non-gold filed pitch wears its computed depth grade, not the gold label
    const other = PITCHES.find((p) => p.display.specimenNo !== '00')
    expect(other, 'the atlas files more than the single gold specimen').toBeDefined()
    const grade = specimenGradeFor(other!)
    expect(grade.label).not.toBe('Gold · 1 of 1')
    expect(screen.getAllByText(grade.label).length).toBeGreaterThan(0)
  })
})

describe('Pitch chapters', () => {
  it('leads the four-seam chapter with the pitch name and shows a sourced master figure', async () => {
    renderRoute('/pitch/four-seam')
    expect(await screen.findByRole('heading', { level: 1 }, COLD_LOAD)).toHaveTextContent('Four-seam fastball')
    expect(screen.getByText('Grip Evidence')).toBeInTheDocument()
    expect(screen.getByAltText(/four-seam style/i)).toBeInTheDocument()
    expect(screen.getByText(/Shape read/i)).toBeInTheDocument()
    expect(screen.getByText('Master Files')).toBeInTheDocument()
  })

  it('renders the new splitter specimen with its pioneer master', async () => {
    renderRoute('/pitch/splitter')
    expect(await screen.findByRole('heading', { level: 1 }, COLD_LOAD)).toHaveTextContent('Splitter')
    expect(screen.getByText('Bruce Sutter')).toBeInTheDocument()
  })

  it('renders the new splinker specimen with Skenes as a master', async () => {
    renderRoute('/pitch/splinker')
    expect(await screen.findByRole('heading', { level: 1 }, COLD_LOAD)).toHaveTextContent('Splinker')
    expect(screen.getAllByText('Paul Skenes').length).toBeGreaterThan(0)
  })

  it('files Wainwright as a master on the 12-6 curve page', async () => {
    renderRoute('/pitch/twelve-six')
    expect(await screen.findByRole('heading', { level: 1 }, COLD_LOAD)).toHaveTextContent('12-6 curveball')
    expect(screen.getAllByText('Adam Wainwright').length).toBeGreaterThan(0)
    expect(screen.getByText(/The curve as a career/)).toBeInTheDocument()
  })

  it('redirects the full 12-6 slug alias to the filed specimen', async () => {
    renderRoute('/pitch/twelve-six-curveball')
    expect(await screen.findByRole('heading', { level: 1 }, COLD_LOAD)).toHaveTextContent('12-6 curveball')
  })

  it('shows the 404 for an unknown specimen', async () => {
    renderRoute('/pitch/does-not-exist')
    expect(await screen.findByText('That file is not in the atlas.', {}, COLD_LOAD)).toBeInTheDocument()
  })
})

describe('The Craftsmen', () => {
  it('lists the masters and the legend in the hall', async () => {
    renderRoute('/craftsmen')
    expect(await screen.findByRole('heading', { level: 1 }, COLD_LOAD)).toHaveTextContent('The arms that defined the pitches.')
    for (const name of ['Bob Gibson', 'Nolan Ryan', 'Roger Clemens', 'Greg Maddux', 'Johan Santana', 'Adam Wainwright', 'Paul Skenes', 'The gyroball']) {
      expect(screen.getAllByText(name).length).toBeGreaterThan(0)
    }
  })

  it('renders a craftsman chapter with a sourced quote and a prose record', async () => {
    renderRoute('/craftsmen/bob-gibson')
    expect(await screen.findByRole('heading', { level: 1 }, COLD_LOAD)).toHaveTextContent('Bob Gibson')
    expect(screen.getByText(/about 90 percent mental/)).toBeInTheDocument()
    // the record is told in prose, never a stat grid; the digits live behind the ledger link
    expect(screen.getByText(/stingiest rate any starter has managed in the live-ball era/)).toBeInTheDocument()
    expect(screen.queryByText('1.12')).not.toBeInTheDocument()
    expect(screen.getByText(/The numbers live with the record-keepers/)).toBeInTheDocument()
  })

  it('renders the Wainwright chapter linked to its 12-6 specimen', async () => {
    renderRoute('/craftsmen/adam-wainwright')
    expect(await screen.findByRole('heading', { level: 1 }, COLD_LOAD)).toHaveTextContent('Adam Wainwright')
    expect(screen.getByText(/Eighteen seasons, one uniform/)).toBeInTheDocument()
    expect(screen.queryByText('2,202')).not.toBeInTheDocument()
    expect(screen.getByText(/Study the 12-6 curveball/)).toBeInTheDocument()
    // the signature pitch now rides the atlas's collectible specimen card, and the
    // whole card is the route into the filed pitch — a craftsman opens its specimen
    const card = screen.getByRole('link', { name: /12-6 curve specimen/i })
    expect(card).toHaveAttribute('href', '/pitch/twelve-six')
  })

  it('files the gyroball as a legend with a myth-versus-physics block', async () => {
    renderRoute('/craftsmen/gyroball')
    expect(await screen.findByRole('heading', { level: 1 }, COLD_LOAD)).toHaveTextContent('The gyroball')
    expect(screen.getByText('The myth, and the physics')).toBeInTheDocument()
  })
})

describe('Sources', () => {
  it('states the provenance model and a computed as-of date', async () => {
    renderRoute('/sources')
    expect(await screen.findByRole('heading', { level: 1 }, COLD_LOAD)).toHaveTextContent('Sourced, not corrected.')
    expect(screen.getByText(/As of .*\d{4}\./)).toBeInTheDocument()
  })
})

describe('Meta copy discipline', () => {
  /*
    "Sourced, not corrected" is the internal sourcing METHOD, never a public
    tagline. Its sanctioned homes are the data model, the /sources H1, the home
    "The Model" section, and the close — never a trailing sign-off on a
    social-card or search-result description, where it reads as the brand motto.
    This pins that boundary so the sign-off can't creep back into page meta.
  */
  const SLOGAN = /sourced,? not corrected/i
  const META_ROUTES = [
    '/',
    '/repertoire',
    '/compare',
    '/movement-map',
    '/learn',
    '/craftsmen',
    '/lost-pitches',
    '/about',
    '/grips',
    '/softball',
    '/softball/fastpitch',
    '/softball/slowpitch',
  ]

  it.each(META_ROUTES)('keeps the sourcing principle out of the %s social/search description', async (path) => {
    renderRoute(path)
    await screen.findByRole('navigation', { name: 'Primary' }, COLD_LOAD)
    await waitFor(() => {
      const desc = document.head.querySelector('meta[name="description"]')?.getAttribute('content') ?? ''
      const og = document.head.querySelector('meta[property="og:description"]')?.getAttribute('content') ?? ''
      expect(desc).not.toMatch(SLOGAN)
      expect(og).not.toMatch(SLOGAN)
    }, COLD_LOAD)
  })

  it('keeps the sourcing principle out of the home schema graph abstract', async () => {
    renderRoute('/')
    await screen.findByRole('navigation', { name: 'Primary' }, COLD_LOAD)
    await waitFor(() => {
      const schema = [...document.head.querySelectorAll('script[type="application/ld+json"]')]
        .map((script) => script.textContent ?? '')
        .join('\n')
      expect(schema).not.toMatch(SLOGAN)
    }, COLD_LOAD)
  })
})

describe('About', () => {
  it('explains the grip-first thesis and competitor field', async () => {
    renderRoute('/about')
    expect(await screen.findByRole('heading', { level: 1 }, COLD_LOAD)).toHaveTextContent(
      'Preserve and progress the art of the pitch.',
    )
    expect(screen.getByText('What it is')).toBeInTheDocument()
    expect(screen.getByText('Measurement dashboards')).toBeInTheDocument()
    expect(screen.getByText('Useful imperfection')).toBeInTheDocument()
    expect(screen.getByText('Where it came from')).toBeInTheDocument()
    expect(screen.getByText('The line between thrower and pitcher.')).toBeInTheDocument()
    expect(screen.getByText('Why it exists')).toBeInTheDocument()
    expect(screen.getByText('A grip dies with the arm.')).toBeInTheDocument()
    expect(screen.getByText('Known, unknown, open')).toBeInTheDocument()
  })
})

describe('Privacy and support', () => {
  it('renders the privacy policy with its core promises and the deletion route', async () => {
    renderRoute('/privacy')
    expect(await screen.findByRole('heading', { level: 1 }, COLD_LOAD)).toHaveTextContent('What the atlas holds')
    expect(screen.getByText('No tracking')).toBeInTheDocument()
    expect(screen.getByText('No sale of data')).toBeInTheDocument()
    expect(screen.getAllByText(/delete\s*account/).length).toBeGreaterThan(0)
    // the policy is dated, once, in the hero eyebrow
    expect(screen.getByText(/Privacy policy \/ \d{4}-\d{2}-\d{2}/)).toBeInTheDocument()
  })

  it('renders the support page with report, deletion, and contact routes', async () => {
    renderRoute('/support')
    expect(await screen.findByRole('heading', { level: 1 }, COLD_LOAD)).toHaveTextContent('Flag it.')
    expect(screen.getByText('Report a problem with a note or post')).toBeInTheDocument()
    expect(screen.getByText('Delete your account')).toBeInTheDocument()
    expect(screen.getAllByText(/in-product Report flow/).length).toBeGreaterThan(0)
    // no fabricated contact details
    expect(screen.queryByText(/@pitch-atlas\.com/)).not.toBeInTheDocument()
  })

  it.each(['/privacy', '/support'])('keeps %s copy plain and dash-free', async (path) => {
    const { container } = renderRoute(path)
    await screen.findByRole('heading', { level: 1 }, COLD_LOAD)

    const text = container.textContent ?? ''
    expect(text).not.toMatch(/[\u2014\u2013]/)
    expect(text).not.toMatch(/@pitch-atlas\.com/)
  })
})

describe('The Pitch Index', () => {
  it('publishes the Pitch Index canonical without search UI state', async () => {
    await expectCanonical('/repertoire?q=curve&family=breaking', 'https://pitch-atlas.com/repertoire/')
  })

  it('catalogs every accepted pitch by family, including the kick change', async () => {
    renderRoute('/repertoire')
    expect(await screen.findByRole('heading', { level: 1 }, COLD_LOAD)).toHaveTextContent('The Pitch Index')
    expect(screen.getAllByText('Kick Change').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Four-Seam Fastball').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Cutter').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Grip tell').length).toBeGreaterThan(0)
  })

  it('files the knuckle-slurve honestly as not a pitch', async () => {
    renderRoute('/repertoire')
    await screen.findByRole('heading', { level: 1 }, COLD_LOAD)
    expect(screen.getAllByText(/Knuckle-Slurve/).length).toBeGreaterThan(0)
    expect(screen.getAllByText('Not a pitch').length).toBeGreaterThan(0)
  })

  it('also surfaces the lost-pitches wing in the index', async () => {
    renderRoute('/repertoire')
    await screen.findByRole('heading', { level: 1 }, COLD_LOAD)
    expect(screen.getAllByText('Lost Pitches of the Negro Leagues').length).toBeGreaterThan(0)
  })
})

describe('Basic pitch files', () => {
  it('renders a basic file for an unfiled pitch with an honest marker and a discussion', async () => {
    renderRoute('/repertoire/slurve')
    expect(await screen.findByRole('heading', { level: 1 }, COLD_LOAD)).toHaveTextContent('Slurve')
    expect(screen.getByText('Basic file')).toBeInTheDocument()
    expect(screen.getAllByText('Discussion').length).toBeGreaterThan(0)
  })

  it("opens the football-change grip evidence on Austin's own football changeup file", async () => {
    renderRoute('/repertoire/football-changeup')
    expect(await screen.findByRole('heading', { level: 1 }, COLD_LOAD)).toHaveTextContent('Football Changeup')
    expect(screen.getByText('Grip Evidence')).toBeInTheDocument()
    expect(screen.getAllByAltText(/football changeup grip/i).length).toBeGreaterThan(0)
  })

  it('keeps the generic Palmball file clean — no Austin grip photo on it', async () => {
    renderRoute('/repertoire/palmball')
    expect(await screen.findByRole('heading', { level: 1 }, COLD_LOAD)).toHaveTextContent('Palmball')
    expect(screen.queryByText('Grip Evidence')).not.toBeInTheDocument()
  })

  it('redirects a filed pitch id straight to its full specimen', async () => {
    renderRoute('/repertoire/four-seam-fastball')
    expect(await screen.findByRole('heading', { level: 1 }, COLD_LOAD)).toHaveTextContent('Four-seam fastball')
  })

  it('shows the 404 for an unknown pitch id', async () => {
    renderRoute('/repertoire/not-a-real-pitch')
    expect(await screen.findByText('That file is not in the atlas.', {}, COLD_LOAD)).toBeInTheDocument()
  })
})

describe('Lost Pitches of the Negro Leagues', () => {
  it('leads the hall with the documented anchors', async () => {
    renderRoute('/lost-pitches')
    expect(await screen.findByRole('heading', { level: 1 }, COLD_LOAD)).toHaveTextContent('Lost Pitches of the Negro Leagues.')
    for (const name of ["Satchel Paige's Hesitation Pitch", "Hilton Smith's Curveball", "Chet Brewer's Emery Ball"]) {
      expect(screen.getAllByText(name).length).toBeGreaterThan(0)
    }
  })

  it('renders the hesitation-pitch chapter with the documented Harridge ruling', async () => {
    renderRoute('/lost-pitches/satchel-paige-hesitation-pitch')
    expect(await screen.findByRole('heading', { level: 1 }, COLD_LOAD)).toHaveTextContent("Satchel Paige's Hesitation Pitch")
    expect(screen.getAllByText(/Will Harridge/).length).toBeGreaterThan(0)
    expect(screen.getAllByText('Documented').length).toBeGreaterThan(0)
  })

  it('files the Paige showman arsenal as a flagged legend', async () => {
    renderRoute('/lost-pitches/paige-showman-arsenal')
    expect(await screen.findByRole('heading', { level: 1 }, COLD_LOAD)).toHaveTextContent('the showman layer')
    expect(screen.getAllByText('Legend').length).toBeGreaterThan(0)
  })

  it('shows the 404 for an unknown lost pitch', async () => {
    renderRoute('/lost-pitches/not-a-real-pitch')
    expect(await screen.findByText('That file is not in the atlas.', {}, COLD_LOAD)).toBeInTheDocument()
  })
})

describe('No failure signatures', () => {
  it.each(['/', '/about', '/privacy', '/support', '/pitch/four-seam', '/pitch/splinker', '/pitch/twelve-six', '/pitch/sweeper', '/pitch/cutter', '/pitch/knuckleball', '/pitch/forkball', '/pitch/eephus', '/craftsmen', '/craftsmen/johan-santana', '/craftsmen/adam-wainwright', '/sources', '/repertoire', '/repertoire/slurve', '/repertoire/knuckle-slurve', '/lost-pitches', '/lost-pitches/satchel-paige-hesitation-pitch', '/lost-pitches/doctored-ball-divergence-and-recovery', '/lost-pitches/paige-showman-arsenal'])(
    'renders %s with no failure signatures',
    async (path) => {
      const { container } = renderRoute(path)
      await screen.findByRole('heading', { level: 1 }, COLD_LOAD)
      const text = container.textContent ?? ''
      for (const bad of FAILURE_SIGNATURES) {
        expect(text).not.toContain(bad)
      }
    },
  )
})
