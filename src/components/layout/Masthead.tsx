import { Link, NavLink } from 'react-router-dom'
import { PITCHES } from '../../data/pitches'
import { SITE } from '../../config/site'

/*
  The masthead carries the brand lockup, the wing nav, and beneath it the
  specimen index. Now that the manual is a multi-page site, every link is a real
  route, not an in-page scroll. The lockup is a clean seal mark plus a type-set
  wordmark, never the distressed raster logo (it breaks down small and cannot
  recolor for states). Navy is the brand ink; leather-thread red marks the active
  page.
*/

const NAV: { label: string; to: string }[] = [
  { label: 'Atlas', to: '/' },
  { label: 'Craftsmen', to: '/craftsmen' },
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

        <nav aria-label="Wings" className="hidden items-center gap-5 md:flex lg:gap-6">
          {NAV.map((n) => (
            <NavLink
              key={n.to}
              to={n.to}
              end={n.to === '/'}
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

        <span className="mono-label hidden xl:inline">{SITE.sourcePrinciple}</span>
      </div>

      <nav aria-label="Specimen index" className="border-t border-navy/12">
        <ul className="mx-auto flex max-w-6xl items-stretch overflow-x-auto px-2 md:px-6 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {PITCHES.map((p) => (
            <li key={p.display.slug} className="shrink-0">
              <NavLink
                to={`/pitch/${p.display.slug}`}
                className={({ isActive }) =>
                  `group flex items-center gap-2 whitespace-nowrap border-b-2 px-3.5 py-2.5 font-mono text-xs tracking-[0.1em] transition-colors ${
                    isActive ? 'border-b-seam text-ink' : 'border-b-transparent text-ink-2 hover:text-ink'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <span className={`tabular-nums ${isActive ? 'text-seam' : 'text-ink-3 group-hover:text-ink-2'}`}>
                      {p.display.specimenNo}
                    </span>
                    <span className="uppercase">{p.display.shortName}</span>
                    {isActive ? (
                      <span aria-hidden="true" className="inline-block h-1.5 w-1.5 rotate-45 bg-seam" />
                    ) : null}
                  </>
                )}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  )
}
