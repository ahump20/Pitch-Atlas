import { PITCHES } from '../../data/pitches'
import { useSelectedPitch } from '../../hooks/useSelectedPitch'
import { scrollToId } from '../../lib/scroll'

/*
  The masthead carries the brand mark, the section nav, and beneath it the
  specimen index: the atlas made navigable. Warm parchment, mono labels, the
  active specimen marked in leather-red. Section links scroll in place without
  touching the pitch route; the switcher links carry the pitch hash. The row
  scrolls horizontally on a narrow screen.
*/

const NAV: { label: string; id: string }[] = [
  { label: 'Atlas', id: 'atlas' },
  { label: 'Grips', id: 'grip-lab' },
  { label: 'What it does', id: 'what-it-does' },
  { label: 'Masters', id: 'masters' },
  { label: 'Sources', id: 'sources' },
]

function SeamMark() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true" className="shrink-0">
      <circle cx="12" cy="12" r="10" fill="none" stroke="var(--color-ink-3)" strokeOpacity="0.45" strokeWidth="1" />
      <path d="M6 6.5 Q12.5 12 6 17.5" fill="none" stroke="var(--color-seam)" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M18 6.5 Q11.5 12 18 17.5" fill="none" stroke="var(--color-seam)" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  )
}

export function Masthead() {
  const current = useSelectedPitch()

  return (
    <header className="sticky top-0 z-30 border-b border-ink-3/25 bg-paper/90 backdrop-blur-sm">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-4 px-5 md:px-8">
        <a
          href="#top"
          onClick={(e) => {
            e.preventDefault()
            scrollToId('top')
          }}
          className="flex items-center gap-2.5"
        >
          <SeamMark />
          <span className="font-mono text-sm font-semibold tracking-[0.22em] text-ink">PITCH ATLAS</span>
        </a>

        <nav aria-label="Sections" className="hidden items-center gap-6 md:flex">
          {NAV.map((n) => (
            <a
              key={n.id}
              href={`#${n.id}`}
              onClick={(e) => {
                e.preventDefault()
                scrollToId(n.id)
              }}
              className="font-mono text-xs uppercase tracking-[0.12em] text-ink-2 transition-colors hover:text-seam"
            >
              {n.label}
            </a>
          ))}
        </nav>

        <span className="mono-label hidden lg:inline">Sourced, not corrected</span>
      </div>

      <nav aria-label="Specimen index" className="border-t border-ink-3/20">
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
