import { PITCHES } from '../../data/pitches'
import { SITE } from '../../config/site'
import { useSelectedPitch } from '../../hooks/useSelectedPitch'
import { scrollToId } from '../../lib/scroll'

/*
  The masthead carries the brand lockup, the platform nav, and beneath it the
  specimen index. The lockup is a clean seal mark plus type-set wordmark, never
  the distressed raster logo (that breaks down at small sizes and cannot recolor
  for states). Navy is the brand ink; leather-thread red marks the active
  specimen. Section links scroll in place without touching the pitch route.
*/

const NAV: { label: string; id: string }[] = [
  { label: 'Atlas', id: 'atlas' },
  { label: 'Grips', id: 'grip-lab' },
  { label: 'Masters', id: 'masters' },
  { label: 'Field Notes', id: 'field-notes' },
  { label: 'Sources', id: 'sources' },
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
  const current = useSelectedPitch()

  return (
    <header className="sticky top-0 z-30 border-b border-navy/15 bg-paper/90 backdrop-blur-sm">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-4 px-5 md:px-8">
        <a
          href="#top"
          onClick={(e) => {
            e.preventDefault()
            scrollToId('top')
          }}
          className="flex items-center gap-2.5"
          aria-label={`${SITE.siteName}, home`}
        >
          <Seal />
          <span className="flex flex-col leading-none">
            <span className="font-prose text-[15px] font-bold uppercase tracking-[0.05em] text-navy">
              {SITE.siteName}
            </span>
            <span className="pt-0.5 font-mono text-[10px] uppercase tracking-[0.2em] text-ink-2">
              {SITE.moduleName}
            </span>
          </span>
        </a>

        <nav aria-label="Sections" className="hidden items-center gap-5 md:flex lg:gap-6">
          {NAV.map((n) => (
            <a
              key={n.id}
              href={`#${n.id}`}
              onClick={(e) => {
                e.preventDefault()
                scrollToId(n.id)
              }}
              className="whitespace-nowrap font-mono text-xs uppercase tracking-[0.1em] text-ink-2 transition-colors hover:text-seam"
            >
              {n.label}
            </a>
          ))}
        </nav>

        <span className="mono-label hidden xl:inline">{SITE.sourcePrinciple}</span>
      </div>

      <nav aria-label="Specimen index" className="border-t border-navy/12">
        <ul className="mx-auto flex max-w-6xl items-stretch overflow-x-auto px-2 md:px-6 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {PITCHES.map((p) => {
            const active = p.display.slug === current.display.slug
            return (
              <li key={p.display.slug} className="shrink-0">
                <a
                  href={`#/${p.display.slug}`}
                  aria-current={active ? 'page' : undefined}
                  className={`group flex items-center gap-2 whitespace-nowrap border-b-2 px-3.5 py-2.5 font-mono text-xs tracking-[0.1em] transition-colors ${
                    active ? 'border-b-seam text-ink' : 'border-b-transparent text-ink-2 hover:text-ink'
                  }`}
                >
                  <span className={`tabular-nums ${active ? 'text-seam' : 'text-ink-3 group-hover:text-ink-2'}`}>
                    {p.display.specimenNo}
                  </span>
                  <span className="uppercase">{p.display.shortName}</span>
                  {active ? (
                    <span aria-hidden="true" className="inline-block h-1.5 w-1.5 rotate-45 bg-seam" />
                  ) : null}
                </a>
              </li>
            )
          })}
        </ul>
      </nav>
    </header>
  )
}
