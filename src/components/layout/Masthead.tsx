import { PITCHES } from '../../data/pitches'
import { useSelectedPitch } from '../../hooks/useSelectedPitch'

/*
  The masthead carries the brand line and, beneath it, the specimen index: the
  atlas made navigable. It reads as an instrument selector, not a tab bar. Mono
  labels, the active specimen marked in oxblood with its two-digit index and the
  seam diamond, real anchor links so it is keyboard-navigable and deep-linkable.
  The row scrolls horizontally on a narrow screen.
*/
export function Masthead() {
  const current = useSelectedPitch()

  return (
    <header className="sticky top-0 z-30 border-b border-machined/60 bg-stage/90 backdrop-blur-sm">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-5 md:px-8">
        <a href="#/four-seam" className="flex items-center gap-2.5">
          <span aria-hidden="true" className="inline-block h-2 w-2 rotate-45 bg-seam" />
          <span className="font-mono text-sm font-semibold tracking-[0.22em] text-ink">
            PITCH ATLAS
          </span>
        </a>
        <span className="mono-label hidden sm:inline">Sourced, not corrected</span>
      </div>

      <nav aria-label="Specimen index" className="border-t border-machined/45">
        <ul className="mx-auto flex max-w-6xl items-stretch overflow-x-auto px-2 md:px-6 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {PITCHES.map((p) => {
            const active = p.display.slug === current.display.slug
            return (
              <li key={p.display.slug} className="shrink-0">
                <a
                  href={`#/${p.display.slug}`}
                  aria-current={active ? 'page' : undefined}
                  className={`group flex items-center gap-2 whitespace-nowrap border-b-2 px-3.5 py-2.5 font-mono text-xs tracking-[0.1em] transition-colors ${
                    active
                      ? 'border-b-seam text-ink'
                      : 'border-b-transparent text-dim hover:text-ink/80'
                  }`}
                >
                  <span className={`tabular-nums ${active ? 'text-seam' : 'text-machined group-hover:text-dim'}`}>
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
