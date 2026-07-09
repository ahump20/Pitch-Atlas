import { Link } from 'react-router-dom'
import { SITE } from '../../config/site'
import { BrandMark } from '../brand/BrandMark'
import { SeamGuide } from '../motion/SeamGuide'
import { RotatingQuote } from '../quotes/RotatingQuote'
import { useEgg } from '../eggs/EggContext'
import { EggButton } from '../eggs/EggButton'

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
  const { count, total, openIndex } = useEgg()
  return (
    <footer
      className="relative border-t border-cyan/12 text-bone"
    >
      {/* closing the archive: the back cover's last beat before the binding.
          One line, one way back to the front door. */}
      <div className="mx-auto max-w-[1320px] px-5 pt-12 md:px-8">
        <SeamGuide variant="orbit" className="mb-4 opacity-80" />
        {/* the vow line is also a hidden egg: it reveals where the game's own
            origin story came from (and that it was invented). */}
        <EggButton
          tidbitId="doubleday"
          label="The archive stays open: reveal a hidden note about the game's origin"
          className="rfx-athletic block text-left text-[clamp(20px,2.8vw,30px)] text-bone"
        >
          The archive stays open.
        </EggButton>
        <p className="mono-label-stage mt-2.5 max-w-[64ch] leading-relaxed">
          Everything above wears its source. When you want the set again, start at the front door:{' '}
          <Link to="/repertoire" className="text-bone underline decoration-1 underline-offset-2 transition-colors hover:decoration-seam">
            the Pitch Index
          </Link>
          .
        </p>

        {/* A quiet rotating line: the craft and the philosophy of the game, sourced
            like everything else, changing with each page. */}
        <RotatingQuote className="mt-6 max-w-[60ch] border-t border-bone/8 pt-5" />
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
              className="touch-link mono-label-stage transition-colors hover:text-bone"
            >
              <span className="link-stitch">{l.label}</span>
            </Link>
          ))}
        </nav>

        <div className="flex flex-col gap-3 md:items-end">
          <a href={SITE.canonicalDomain} className="touch-link mono-label-stage transition-colors hover:text-bone">
            <span className="link-stitch">pitch-atlas.com</span>
          </a>
          <span className="mono-label-stage opacity-75">{SITE.sourcePrinciple}</span>
        </div>
      </div>
      {/* True by construction: every content route is prerendered to static HTML,
          so the text reads with scripts off; only the interactive layers hydrate. */}
      <div className="mx-auto flex max-w-[1320px] flex-col gap-3 border-t border-bone/8 px-5 py-4 md:flex-row md:items-center md:justify-between md:px-8">
        <p className="mono-label-stage opacity-75">
          The archive is readable without JavaScript. Interactive grip tools, physics controls, and
          comparison labs need JavaScript.
        </p>
        {/* the quiet on-ramp to the hidden tidbits: a map, not a spoiler */}
        <button
          type="button"
          onClick={openIndex}
          className="mono-label-stage w-fit whitespace-nowrap py-1.5 text-bone-2/75 underline decoration-bone-2/30 underline-offset-2 transition-colors hover:text-bone hover:decoration-cyan"
        >
          Hidden notes &middot; {count} of {total} found
        </button>
      </div>
    </footer>
  )
}
