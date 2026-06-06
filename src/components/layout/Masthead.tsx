import { useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { SITE } from '../../config/site'

/*
  The masthead: brand lockup + one clear primary nav. The Pitch Index is the front
  door; Craftsmen and Sources are the side wings. (Lost Pitches lives inside the
  index and the home, and rides the mobile menu.) The old per-pitch specimen strip
  is gone — it was a second, redundant way to reach a pitch and worked against a
  single navigation path. The lockup is the clean seal mark plus a type-set
  wordmark; navy is the brand ink, leather-thread red marks the active page.
*/

const NAV: { label: string; to: string }[] = [
  { label: 'Pitch Index', to: '/repertoire' },
  { label: 'Learn', to: '/learn' },
  { label: 'Classify', to: '/classify' },
  { label: 'Build the Break', to: '/sandbox' },
  { label: 'Craftsmen', to: '/craftsmen' },
  { label: 'Sources', to: '/sources' },
]

const MOBILE_NAV: { label: string; to: string }[] = [
  { label: 'Pitch Index', to: '/repertoire' },
  { label: 'Learn', to: '/learn' },
  { label: 'What pitch is this?', to: '/classify' },
  { label: 'Build the Break', to: '/sandbox' },
  { label: 'Movement map', to: '/movement-map' },
  { label: 'Compare two pitches', to: '/compare' },
  { label: 'Compare two grips', to: '/grips' },
  { label: 'Craftsmen', to: '/craftsmen' },
  { label: 'Lost Pitches', to: '/lost-pitches' },
  { label: 'Sources', to: '/sources' },
]

/** The Atlas seal: a compass A stitched into a ringed baseball. Original geometry. */
function Seal() {
  return (
    <svg width="27" height="27" viewBox="0 0 64 64" aria-hidden="true" className="shrink-0">
      <circle cx="32" cy="32" r="26.5" fill="none" stroke="var(--color-navy)" strokeWidth="3.4" />
      <circle cx="32" cy="32" r="22" fill="none" stroke="var(--color-seam)" strokeWidth="1.5" />
      <path d="M32 18 L43 43 L36.5 43 L32 32 L27.5 43 L21 43 Z" fill="var(--color-navy)" />
    </svg>
  )
}

export function Masthead() {
  const [open, setOpen] = useState(false)

  return (
    <header className="sticky top-0 z-30 border-b border-navy/15 bg-paper/90 backdrop-blur-sm">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-4 px-5 md:px-8">
        <Link to="/" className="flex items-center gap-2.5" aria-label={`${SITE.siteName}, home`}>
          <Seal />
          <span className="flex flex-col leading-none">
            <span className="font-prose text-[15px] font-bold uppercase tracking-[0.05em] text-navy">
              {SITE.siteName}
            </span>
            <span className="pt-0.5 font-mono text-[10px] uppercase tracking-[0.2em] text-ink-2">
              {SITE.moduleName}
            </span>
          </span>
        </Link>

        <nav aria-label="Primary" className="hidden items-center gap-6 md:flex lg:gap-8">
          {NAV.map((n) => (
            <NavLink
              key={n.to}
              to={n.to}
              className={({ isActive }) =>
                `whitespace-nowrap font-mono text-xs uppercase tracking-[0.1em] transition-colors hover:text-seam ${
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
            onClick={() => setOpen((v) => !v)}
            className="flex h-9 w-9 items-center justify-center rounded-sm border border-navy/20 text-navy transition-colors hover:border-seam hover:text-seam md:hidden"
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
        <nav id="mobile-nav" aria-label="Mobile" className="border-t border-navy/12 bg-paper md:hidden">
          <ul className="mx-auto flex max-w-6xl flex-col px-5 py-2">
            {MOBILE_NAV.map((n) => (
              <li key={n.to}>
                <NavLink
                  to={n.to}
                  onClick={() => setOpen(false)}
                  className={({ isActive }) =>
                    `block border-b border-navy/8 py-3 font-mono text-sm uppercase tracking-[0.1em] transition-colors hover:text-seam ${
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
