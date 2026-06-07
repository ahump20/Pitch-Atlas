import { useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { SITE } from '../../config/site'
import { BrandMark } from '../brand/BrandMark'

/*
  The masthead on the dark void: the foil diamond + Anton wordmark lockup, one
  clear primary nav, the source principle on the far right. Active page reads as
  bright bone; the rest sit in cool bone-2. The mobile menu drops on the same
  near-black with a foil hairline.
*/

const NAV: { label: string; to: string }[] = [
  { label: 'Pitch Index', to: '/repertoire' },
  { label: 'Softball', to: '/softball' },
  { label: 'Learn', to: '/learn' },
  { label: 'Classify', to: '/classify' },
  { label: 'Build the Break', to: '/sandbox' },
  { label: 'Craftsmen', to: '/craftsmen' },
  { label: 'Sources', to: '/sources' },
]

const MOBILE_NAV: { label: string; to: string }[] = [
  { label: 'Pitch Index', to: '/repertoire' },
  { label: 'Softball', to: '/softball' },
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

export function Masthead() {
  const [open, setOpen] = useState(false)

  return (
    <header className="sticky top-0 z-30 border-b border-bone/10 bg-[#070509]/85 backdrop-blur-md">
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
                `whitespace-nowrap font-mono text-xs uppercase tracking-[0.1em] transition-colors hover:text-bone ${
                  isActive ? 'text-bone' : 'text-bone-2'
                }`
              }
            >
              {n.label}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-4">
          <span className="mono-label-stage hidden xl:inline">{SITE.sourcePrinciple}</span>
          <button
            type="button"
            aria-label={open ? 'Close menu' : 'Open menu'}
            aria-expanded={open}
            aria-controls="mobile-nav"
            onClick={() => setOpen((v) => !v)}
            className="flex h-9 w-9 items-center justify-center rounded-sm border border-bone/25 text-bone transition-colors hover:border-bone md:hidden"
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
        <nav id="mobile-nav" aria-label="Mobile" className="border-t border-bone/10 bg-[#0a0810] md:hidden">
          <ul className="mx-auto flex max-w-[1320px] flex-col px-5 py-2">
            {MOBILE_NAV.map((n) => (
              <li key={n.to}>
                <NavLink
                  to={n.to}
                  onClick={() => setOpen(false)}
                  className={({ isActive }) =>
                    `block border-b border-bone/8 py-3 font-mono text-sm uppercase tracking-[0.1em] transition-colors hover:text-bone ${
                      isActive ? 'text-bone' : 'text-bone-2'
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
