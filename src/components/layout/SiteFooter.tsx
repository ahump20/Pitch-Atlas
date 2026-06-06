import { Link } from 'react-router-dom'
import { SITE } from '../../config/site'

/*
  The slim site footer, present on every page. Not the colophon: the full
  provenance legend and source registry live at /sources. This is a compact
  index back into the three wings of the manual, plus the wordmark and the
  principle that governs all of it.
*/

const LINKS: { label: string; to: string }[] = [
  { label: 'The Pitch Index', to: '/repertoire' },
  { label: 'The Craftsmen', to: '/craftsmen' },
  { label: 'Lost Pitches', to: '/lost-pitches' },
  { label: 'Sources', to: '/sources' },
]

export function SiteFooter() {
  return (
    <footer className="border-t border-navy/15 bg-paper-2">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-5 py-12 md:flex-row md:items-center md:justify-between md:px-8">
        <div className="flex flex-col gap-3">
          <img
            src="/brand/wordmark-pitcher-96.webp"
            alt={SITE.siteName}
            width={171}
            height={96}
            loading="lazy"
            decoding="async"
            className="h-9 w-auto rounded-sm"
          />
          <p className="mono-label text-ink-2">{SITE.tagline}</p>
        </div>

        <nav aria-label="Footer" className="flex flex-wrap items-center gap-x-6 gap-y-2">
          {LINKS.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className="mono-label text-ink-2 transition-colors hover:text-seam"
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="flex flex-col gap-1 md:items-end">
          <a href={SITE.canonicalDomain} className="mono-label transition-colors hover:text-seam">
            pitch-atlas.com
          </a>
          <span className="mono-label text-ink-3">{SITE.sourcePrinciple}</span>
        </div>
      </div>
    </footer>
  )
}
