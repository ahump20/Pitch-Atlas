import { useEffect, useRef, useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { SITE } from '../../config/site'
import { BrandMark } from '../brand/BrandMark'

/*
  The masthead on the void field: the diamond + wordmark lockup, ONE clear
  primary nav of four content pillars, and a single "More" disclosure holding the
  rest of the atlas (Craftsmen, Lost Pitches, Sources, About) plus the interactive
  Tools. The active page reads in refractor cyan; the rest sit in slate ink. The
  "Sourced, not corrected" principle is no longer parked in the action zone — it
  lives in the footer and on the specimen UI — so navigation owns the bar.
*/

// The primary bar: the four content pillars, ordered by visitor value. The front
// door (Pitch Index) leads; everything else lives one click away under "More".
const NAV: { label: string; to: string }[] = [
  { label: 'Pitch Index', to: '/repertoire' },
  { label: 'Grips', to: '/grips' },
  { label: 'Softball', to: '/softball' },
  { label: 'Learn', to: '/learn' },
]

// "More" — the rest of the atlas, grouped. Content destinations first, then the
// interactive tools. Demoted from the bar to cut sprawl; every one is still a
// plain <a> in the prerendered footer, so reachability never depends on JS.
const MORE_CONTENT: { label: string; to: string; note: string }[] = [
  { label: 'Craftsmen', to: '/craftsmen', note: 'The arms that named the pitches' },
  { label: 'Lost Pitches', to: '/lost-pitches', note: 'The banned and faded wing' },
  { label: 'Sources', to: '/sources', note: 'Every citation, in one ledger' },
  { label: 'About', to: '/about', note: 'What the atlas is, and is not' },
]

// The interactive tools — reachable from the body of pages, but easy to miss.
// Grouped under the "More" disclosure with the content destinations. "Compare two
// grips" deep-links to the comparator itself, not the top of the library.
const TOOLS: { label: string; to: string; note: string }[] = [
  { label: 'Shape Lab', to: '/sandbox', note: 'Dial a grip and watch the shape' },
  { label: 'Shape map', to: '/movement-map', note: 'Every pitch, plotted by direction' },
  { label: 'Compare two pitches', to: '/compare', note: 'Read two shapes side by side' },
  { label: 'Compare two grips', to: '/grips#grip-compare', note: 'Two grips in the hand at once' },
]

// everything reachable through the "More" trigger — drives active-state + mobile
const MORE_ALL = [...MORE_CONTENT, ...TOOLS]

export function Masthead() {
  const { pathname } = useLocation()
  const [menu, setMenu] = useState({ open: false, pathname })
  const open = menu.open && menu.pathname === pathname
  const toggleRef = useRef<HTMLButtonElement>(null)
  const navRef = useRef<HTMLElement>(null)
  const wasOpen = useRef(false)

  // Desktop "More" disclosure. Closes on route change, on Escape, and on a click
  // outside the group so it never strands focus or floats over the page.
  const [moreMenu, setMoreMenu] = useState({ open: false, pathname })
  const moreOpen = moreMenu.open && moreMenu.pathname === pathname
  const moreRef = useRef<HTMLDivElement>(null)
  const moreActive = MORE_ALL.some((t) => t.to === pathname)

  useEffect(() => {
    if (!moreOpen) return
    const onPointerDown = (event: MouseEvent) => {
      if (!moreRef.current?.contains(event.target as Node)) setMoreMenu({ open: false, pathname })
    }
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setMoreMenu({ open: false, pathname })
    }
    document.addEventListener('mousedown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('mousedown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [moreOpen, pathname])

  useEffect(() => {
    if (!open) return
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setMenu({ open: false, pathname })
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [open, pathname])

  // Keep focus from dropping to <body> when the disclosure toggles: move into
  // the menu on open, hand it back to the trigger on close. Guarded on the
  // transition so the initial closed mount never steals focus.
  useEffect(() => {
    if (open && !wasOpen.current) navRef.current?.focus()
    else if (!open && wasOpen.current) toggleRef.current?.focus()
    wasOpen.current = open
  }, [open])

  return (
    // scroll-shade: the bar earns its shadow only once the page moves under it.
    // masthead-glass carries the refractive translucency (coal glows faintly
    // through on scroll) with its own reduced-transparency + no-filter solid
    // fallbacks, so the bg-paper utility is no longer needed here.
    <header className="masthead-glass scroll-shade sticky top-0 z-30 border-b border-leather/30 text-ink">
      <div className="mx-auto flex h-16 max-w-[1320px] items-center justify-between gap-4 px-5 md:px-8">
        <Link to="/" aria-label={`${SITE.siteName}, home`}>
          <BrandMark size="sm" />
        </Link>

        <nav aria-label="Primary" className="hidden items-center gap-7 md:flex lg:gap-9">
          {NAV.map((n) => (
            <NavLink
              key={n.to}
              to={n.to}
              className={({ isActive }) =>
                `link-stitch whitespace-nowrap font-mono text-xs uppercase tracking-[0.1em] transition-colors hover:text-bone ${
                  isActive ? 'text-cyan' : 'text-ink-2'
                }`
              }
            >
              {n.label}
            </NavLink>
          ))}

          <div ref={moreRef} className="relative">
            <button
              type="button"
              aria-expanded={moreOpen}
              aria-controls="more-menu"
              onClick={() =>
                setMoreMenu((state) => ({
                  open: !(state.open && state.pathname === pathname),
                  pathname,
                }))
              }
              className={`link-stitch flex items-center gap-1 whitespace-nowrap font-mono text-xs uppercase tracking-[0.1em] transition-colors hover:text-bone ${
                moreActive ? 'text-cyan' : 'text-ink-2'
              }`}
            >
              More
              <svg
                width="10"
                height="10"
                viewBox="0 0 10 10"
                aria-hidden="true"
                className={`transition-transform ${moreOpen ? 'rotate-180' : ''}`}
              >
                <path d="M2 3.5 L5 6.5 L8 3.5" stroke="currentColor" strokeWidth="1.2" fill="none" strokeLinecap="round" />
              </svg>
            </button>
            {moreOpen ? (
              <div
                id="more-menu"
                className="overlay-frost-cream overlay-settle absolute right-0 top-[calc(100%+0.75rem)] z-40 w-72 rounded-sm border border-ink/15 p-1.5 shadow-lg"
              >
                <p className="mono-label px-3 pb-1.5 pt-2 text-ink-3">The rest of the atlas</p>
                <ul className="flex flex-col">
                  {MORE_CONTENT.map((t) => (
                    <li key={`${t.to}-${t.label}`}>
                      <NavLink
                        to={t.to}
                        onClick={() => setMoreMenu({ open: false, pathname })}
                        className={({ isActive }) =>
                          `block rounded-sm px-3 py-2.5 transition-colors hover:bg-bone/[0.06] ${
                            isActive ? 'text-cyan' : 'text-ink-2'
                          }`
                        }
                      >
                        <span className="block font-mono text-xs uppercase tracking-[0.1em]">{t.label}</span>
                        <span className="mt-0.5 block text-[0.78rem] leading-snug text-ink-3">{t.note}</span>
                      </NavLink>
                    </li>
                  ))}
                </ul>
                <p className="mono-label mt-1 border-t border-ink/10 px-3 pb-1.5 pt-3 text-ink-3">Tools</p>
                <ul className="flex flex-col">
                  {TOOLS.map((t) => (
                    <li key={`${t.to}-${t.label}`}>
                      <NavLink
                        to={t.to}
                        onClick={() => setMoreMenu({ open: false, pathname })}
                        className={({ isActive }) =>
                          `block rounded-sm px-3 py-2.5 transition-colors hover:bg-bone/[0.06] ${
                            isActive ? 'text-cyan' : 'text-ink-2'
                          }`
                        }
                      >
                        <span className="block font-mono text-xs uppercase tracking-[0.1em]">{t.label}</span>
                        <span className="mt-0.5 block text-[0.78rem] leading-snug text-ink-3">{t.note}</span>
                      </NavLink>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </div>
        </nav>

        <div className="flex items-center gap-4">
          <button
            ref={toggleRef}
            type="button"
            aria-label={open ? 'Close menu' : 'Open menu'}
            aria-expanded={open}
            aria-controls="mobile-nav"
            onClick={() => setMenu({ open: !open, pathname })}
            className="flex h-11 w-11 items-center justify-center rounded-sm border border-ink/30 text-ink transition-colors hover:border-ink md:hidden"
          >
            <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
              {open ? (
                <path d="M4 4 L14 14 M14 4 L4 14" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
              ) : (
                <path d="M3 5 H15 M3 9 H15 M3 13 H15" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {open ? (
        <nav
          ref={navRef}
          tabIndex={-1}
          id="mobile-nav"
          aria-label="Mobile"
          className="overlay-frost-cream overlay-settle border-t border-ink/12 outline-none md:hidden"
        >
          <ul className="mx-auto flex max-w-[1320px] flex-col px-5 py-2">
            {NAV.map((n) => (
              <li key={n.to}>
                <NavLink
                  to={n.to}
                  onClick={() => setMenu({ open: false, pathname })}
                  className={({ isActive }) =>
                    `link-stitch block border-b border-ink/10 py-3.5 font-mono text-sm uppercase tracking-[0.1em] transition-colors hover:text-bone ${
                      isActive ? 'text-cyan' : 'text-ink-2'
                    }`
                  }
                >
                  {n.label}
                </NavLink>
              </li>
            ))}

            <li className="pt-4">
              <h2 className="mono-label text-ink-3">The rest of the atlas</h2>
              <ul className="mt-1 flex flex-col">
                {MORE_CONTENT.map((t) => (
                  <li key={`${t.to}-${t.label}`}>
                    <NavLink
                      to={t.to}
                      onClick={() => setMenu({ open: false, pathname })}
                      className={({ isActive }) =>
                        `link-stitch block border-b border-ink/10 py-3.5 font-mono text-sm uppercase tracking-[0.1em] transition-colors hover:text-bone ${
                          isActive ? 'text-cyan' : 'text-ink-2'
                        }`
                      }
                    >
                      {t.label}
                    </NavLink>
                  </li>
                ))}
              </ul>
            </li>

            <li className="pt-4">
              <h2 className="mono-label text-ink-3">Tools</h2>
              <ul className="mt-1 flex flex-col">
                {TOOLS.map((t) => (
                  <li key={`${t.to}-${t.label}`}>
                    <NavLink
                      to={t.to}
                      onClick={() => setMenu({ open: false, pathname })}
                      className={({ isActive }) =>
                        `link-stitch block border-b border-ink/10 py-3.5 font-mono text-sm uppercase tracking-[0.1em] transition-colors hover:text-bone ${
                          isActive ? 'text-cyan' : 'text-ink-2'
                        }`
                      }
                    >
                      {t.label}
                    </NavLink>
                  </li>
                ))}
              </ul>
            </li>
          </ul>
        </nav>
      ) : null}
    </header>
  )
}
