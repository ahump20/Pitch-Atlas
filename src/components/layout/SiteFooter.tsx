import { Link } from 'react-router-dom'
import { SITE } from '../../config/site'
import { BrandMark } from '../brand/BrandMark'

/*
  The slim site footer on the void. Not the colophon — the full provenance legend
  and source registry live at /sources. A compact index back into the three wings,
  the brand lockup, and the principle that governs all of it.
*/

const LINKS: { label: string; to: string }[] = [
  { label: 'The Pitch Index', to: '/repertoire' },
  { label: 'Softball', to: '/softball' },
  { label: 'The Craftsmen', to: '/craftsmen' },
  { label: 'Lost Pitches', to: '/lost-pitches' },
  { label: 'Sources', to: '/sources' },
  { label: 'About', to: '/about' },
  { label: 'Privacy', to: '/privacy' },
  { label: 'Support', to: '/support' },
]

export function SiteFooter() {
  return (
    <footer className="border-t border-bone/10 bg-[#08060d]">
      <div className="mx-auto flex max-w-[1320px] flex-col gap-8 px-5 py-12 md:flex-row md:items-center md:justify-between md:px-8">
        <div className="flex flex-col gap-3">
          <BrandMark size="md" />
          <p className="mono-label-stage">{SITE.tagline}</p>
        </div>

        <nav aria-label="Footer" className="flex flex-wrap items-center gap-x-6 gap-y-2">
          {LINKS.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className="mono-label-stage transition-colors hover:text-bone"
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="flex flex-col gap-3 md:items-end">
          <a href={SITE.canonicalDomain} className="mono-label-stage transition-colors hover:text-bone">
            pitch-atlas.com
          </a>
          <span className="mono-label-stage text-ink-3">{SITE.sourcePrinciple}</span>
        </div>
      </div>
    </footer>
  )
}
