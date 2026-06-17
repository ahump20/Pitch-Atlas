import { useEffect, useRef, useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { SITE } from '../../config/site'
import { BrandMark } from '../brand/BrandMark'

/*
  The masthead on the warm field: scorebook paper with a leather rule under it,
  the diamond + wordmark lockup in ink, one clear primary nav, the source
  principle on the far right. The active page reads in seam red; the rest sit in
  slate ink. The mobile menu drops on the deeper cream with ink hairlines.
*/

// The primary bar holds content destinations only — every wing of the manual,
// including Lost Pitches (previously reachable on desktop only through body
// links). The interactive tools live one click away in the Tools disclosure.
const NAV: { label: string; to: string }[] = [
  { label: 'Pitch Index', to: '/repertoire' },
  { label: 'Softball', to: '/softball' },
  { label: 'Learn', to: '/learn' },
  { label: 'Grips', to: '/grips' },
  { label: 'Craftsmen', to: '/craftsmen' },
  { label: 'Lost Pitches', to: '/lost-pitches' },
  { label: 'Sources', to: '/sources' },
]

// The interactive tools — reachable from the body of pages, but easy to miss.
// Grouped behind one "Tools" disclosure on the desktop bar and a labelled
// section in the mobile sheet so the shape lab, the shape map, and the
// comparators are always one click from anywhere. Shape Lab is a sandbox tool,
// so it lives here with its kin rather than crowding the content bar. "Compare
// two grips" deep-links to the comparator itself, not the top of the library.
const TOOLS: { label: string; to: string; note: string }[] = [
  { label: 'Shape Lab', to: '/sandbox', note: 'Dial a grip and watch the shape' },
  { label: 'Shape map', to: '/movement-map', note: 'Every pitch, plotted by direction' },
  { label: 'Compare two pitches', to: '/compare', note: 'Read two shapes side by side' },
  { label: 'Compare two grips', to: '/grips#grip-compare', note: 'Two grips in the hand at once' },
]

const MOBILE_NAV: { label: string; to: string }[] = [
  { label: 'Pitch Index', to: '/repertoire' },
  { label: 'Softball', to: '/softball' },
  { label: 'Learn', to: '/learn' },
  { label: 'Grips', to: '/grips' },
  { label: 'Craftsmen', to: '/craftsmen' },
  { label: 'Lost Pitches', to: '/lost-pitches' },
  { label: 'Sources', to: '/sources' },
  { label: 'About', to: '/about' },
]

export function Masthead() {
  const { pathname } = useLocation()
  const [menu, setMenu] = useState({ open: false, pathname })
  const open = menu.open && menu.pathname === pathname
  const toggleRef = useRef<HTMLButtonElement>(null)
  const navRef = useRef<HTMLElement>(null)
  const wasOpen = useRef(false)

  // Desktop "Tools" disclosure. Closes on route change, on Escape, and on a
  // click outside the group so it never strands focus or floats over the page.
  const [toolsMenu, setToolsMenu] = useState({ open: false, pathname })
  const toolsOpen = toolsMenu.open && toolsMenu.pathname === pathname
  const toolsRef = useRef<HTMLDivElement>(null)
  const toolsActive = TOOLS.some((t) => t.to === pathname)

  useEffect(() => {
    if (!toolsOpen) return
    const onPointerDown = (event: MouseEvent) => {
      if (!toolsRef.current?.contains(event.target as Node)) setToolsMenu({ open: false, pathname })
    }
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setToolsMenu({ open: false, pathname })
    }
    document.addEventListener('mousedown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('mousedown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [toolsOpen, pathname])

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
    // scroll-shade: the bar earns its shadow only once the page moves under it
    <header className="scroll-shade sticky top-0 z-30 border-b border-leather/30 bg-paper/92 text-ink backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-[1320px] items-center justify-between gap-4 px-5 md:px-8">
        <Link to="/" aria-label={`${SITE.siteName}, home`}>
          <BrandMark size="sm" />
        </Link>

        <nav aria-label="Primary" className="hidden items-center gap-6 md:flex lg:gap-8">
          {NAV.map((n) => (
            <NavLink
              key={n.to}
              to={n.to}
              className={({ isActive }) =>
                `link-stitch whitespace-nowrap font-mono text-xs uppercase tracking-[0.1em] transition-colors hover:text-ink ${
                  isActive ? 'text-seam' : 'text-ink-2'
                }`
              }
            >
              {n.label}
            </NavLink>
          ))}

          <div ref={toolsRef} className="relative">
            <button
              type="button"
              aria-expanded={toolsOpen}
              aria-controls="tools-menu"
              onClick={() =>
                setToolsMenu((state) => ({
                  open: !(state.open && state.pathname === pathname),
                  pathname,
                }))
              }
              className={`link-stitch flex items-center gap-1 whitespace-nowrap font-mono text-xs uppercase tracking-[0.1em] transition-colors hover:text-ink ${
                toolsActive ? 'text-seam' : 'text-ink-2'
              }`}
            >
              Tools
              <svg
                width="10"
                height="10"
                viewBox="0 0 10 10"
                aria-hidden="true"
                className={`transition-transform ${toolsOpen ? 'rotate-180' : ''}`}
              >
                <path d="M2 3.5 L5 6.5 L8 3.5" stroke="currentColor" strokeWidth="1.2" fill="none" strokeLinecap="round" />
              </svg>
            </button>
            {toolsOpen ? (
              <div
                id="tools-menu"
                className="absolute right-0 top-[calc(100%+0.75rem)] z-40 w-64 rounded-sm border border-ink/15 bg-paper-2 p-1.5 shadow-lg"
              >
                <ul className="flex flex-col">
                  {TOOLS.map((t) => (
                    <li key={`${t.to}-${t.label}`}>
                      <NavLink
                        to={t.to}
                        onClick={() => setToolsMenu({ open: false, pathname })}
                        className={({ isActive }) =>
                          `block rounded-sm px-3 py-2.5 transition-colors hover:bg-ink/[0.04] ${
                            isActive ? 'text-seam' : 'text-ink-2'
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
          <span className="mono-label hidden xl:inline">{SITE.sourcePrinciple}</span>
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
          className="border-t border-ink/12 bg-paper-2 outline-none md:hidden"
        >
          <ul className="mx-auto flex max-w-[1320px] flex-col px-5 py-2">
            {MOBILE_NAV.map((n) => (
              <li key={n.to}>
                <NavLink
                  to={n.to}
                  onClick={() => setMenu({ open: false, pathname })}
                  className={({ isActive }) =>
                    `link-stitch block border-b border-ink/10 py-3.5 font-mono text-sm uppercase tracking-[0.1em] transition-colors hover:text-ink ${
                      isActive ? 'text-seam' : 'text-ink-2'
                    }`
                  }
                >
                  {n.label}
                </NavLink>
              </li>
            ))}

            <li className="pt-4">
              <h2 className="mono-label text-ink-3">Tools</h2>
              <ul className="mt-1 flex flex-col">
                {TOOLS.map((t) => (
                  <li key={`${t.to}-${t.label}`}>
                    <NavLink
                      to={t.to}
                      onClick={() => setMenu({ open: false, pathname })}
                      className={({ isActive }) =>
                        `link-stitch block border-b border-ink/10 py-3.5 font-mono text-sm uppercase tracking-[0.1em] transition-colors hover:text-ink ${
                          isActive ? 'text-seam' : 'text-ink-2'
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
