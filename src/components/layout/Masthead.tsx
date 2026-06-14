import { useEffect, useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { SITE } from '../../config/site'
import { BrandMark } from '../brand/BrandMark'

/*
  The masthead on the warm field: scorebook paper with a leather rule under it,
  the diamond + wordmark lockup in ink, one clear primary nav, the source
  principle on the far right. The active page reads in seam red; the rest sit in
  slate ink. The mobile menu drops on the deeper cream with ink hairlines.
*/

const NAV: { label: string; to: string }[] = [
  { label: 'Pitch Index', to: '/repertoire' },
  { label: 'Softball', to: '/softball' },
  { label: 'Learn', to: '/learn' },
  { label: 'Shape Lab', to: '/sandbox' },
  { label: 'Grips', to: '/grips' },
  { label: 'Craftsmen', to: '/craftsmen' },
  { label: 'Sources', to: '/sources' },
]

const MOBILE_NAV: { label: string; to: string }[] = [
  { label: 'Pitch Index', to: '/repertoire' },
  { label: 'Softball', to: '/softball' },
  { label: 'Learn', to: '/learn' },
  { label: 'Shape Lab', to: '/sandbox' },
  { label: 'Shape map', to: '/movement-map' },
  { label: 'Compare two pitches', to: '/compare' },
  { label: 'Compare two grips', to: '/grips' },
  { label: 'Craftsmen', to: '/craftsmen' },
  { label: 'Lost Pitches', to: '/lost-pitches' },
  { label: 'Sources', to: '/sources' },
  { label: 'About', to: '/about' },
]

export function Masthead() {
  const { pathname } = useLocation()
  const [menu, setMenu] = useState({ open: false, pathname })
  const open = menu.open && menu.pathname === pathname

  useEffect(() => {
    if (!open) return
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setMenu({ open: false, pathname })
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [open, pathname])

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
        </nav>

        <div className="flex items-center gap-4">
          <span className="mono-label hidden xl:inline">{SITE.sourcePrinciple}</span>
          <button
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
        <nav id="mobile-nav" aria-label="Mobile" className="border-t border-ink/12 bg-paper-2 md:hidden">
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
          </ul>
        </nav>
      ) : null}
    </header>
  )
}
