import { Link } from 'react-router-dom'
import { SITE } from '../../config/site'
import { BrandMark } from '../brand/BrandMark'
import { SeamGuide } from '../motion/SeamGuide'

/*
  The slim site footer: the leather binding the scorebook closes into. Not the
  colophon — the full provenance legend and source registry live at /sources. A
  compact index back into the three wings, the brand lockup, and the principle
  that governs all of it.
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
    <footer
      className="scene-coal border-t border-bone/10 text-bone"
      style={{ background: 'linear-gradient(180deg, #2A1B0E, #1C1208)' }}
    >
      {/* closing the manual: the back cover's last beat before the binding.
          One line, one way back to the front door. */}
      <div className="mx-auto max-w-[1320px] px-5 pt-12 md:px-8">
        <SeamGuide variant="orbit" className="mb-4 opacity-80" />
        <p className="rfx-athletic text-[clamp(20px,2.8vw,30px)] text-bone">The manual closes here.</p>
        <p className="mono-label-stage mt-2.5 max-w-[64ch] leading-relaxed">
          Everything above wears its source. When you want the set again, it reopens at the front
          door —{' '}
          <Link to="/repertoire" className="text-bone underline decoration-1 underline-offset-2 transition-colors hover:decoration-seam">
            the Pitch Index
          </Link>
          .
        </p>
      </div>

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
          <span className="mono-label-stage opacity-75">{SITE.sourcePrinciple}</span>
        </div>
      </div>
      {/* True by construction: every content route is prerendered to static HTML,
          so the text reads with scripts off; only the interactive layers hydrate. */}
      <div className="mx-auto max-w-[1320px] border-t border-bone/8 px-5 py-4 md:px-8">
        <p className="mono-label-stage opacity-75">
          The archive is readable without JavaScript. Interactive grip tools, physics controls, and
          comparison labs need JavaScript.
        </p>
      </div>
    </footer>
  )
}
