import { Link } from 'react-router-dom'
import { CONFIDENCE_META, type ClaimConfidence } from '../../data/types'
import { PITCHES } from '../../data/pitches'
import { ClaimCard } from '../provenance/ClaimCard'
import { ChapterMark } from './ChapterMark'
import { STAGE_TIER_DOT } from '../provenance/refractorClaimMeta'

/*
  v2 · Sourced, not corrected. The principle as the feature, not a footnote.
  The full seven-tier confidence ladder (read straight from CONFIDENCE_META, so
  the page can never drift from the model) on the matte stage, beside one real
  filed claim wearing its real badge on cream stock: the model showing itself
  instead of asserting. The registry colophon lives once on this page, in the
  close, beside the rule sheet it evidences.
*/

const LADDER: ClaimConfidence[] = [
  'official-data',
  'pitcher-own-words',
  'coach-observed',
  'reputable-analysis',
  'secondhand-attributed',
  'community-firsthand',
  'unverified',
]

const EXAMPLE = PITCHES[0]

export function ProvenanceStrip() {
  return (
    <section className="v2-stage v2-tooth relative border-t border-bone/10">
      <div className="mx-auto grid max-w-[1320px] grid-cols-1 gap-12 px-5 py-20 md:grid-cols-12 md:gap-14 md:px-8 md:py-28">
        {/* the principle + the ladder. the constitutional line is pinned while its
            evidence — the seven rungs — scrolls past it: the standard stays put,
            the specimens move through it. */}
        <div className="md:col-span-7 md:self-start">
          <div className="md:sticky md:top-24">
            <ChapterMark n="08" name="The Model" />
            <h2 className="rfx-athletic v2-display mt-4 max-w-[16ch] text-[clamp(28px,5vw,52px)] leading-[0.94]">
              Sourced, not corrected.
            </h2>
            <p className="mt-4 max-w-[54ch] text-[15px] leading-relaxed text-bone-2">
              A pitch can be thrown a dozen credible ways. The atlas does not crown one. It records
              what is known, attributes it, and grades how well each source holds. Two rungs at the
              bottom name the gaps instead of hiding them.
            </p>
          </div>

          <ul className="mt-8 divide-y divide-bone/10 border-y border-bone/10">
            {LADDER.map((tier, i) => (
              <li
                key={tier}
                className="v2-rung grid grid-cols-[16px_1fr] items-start gap-3 py-3.5"
                style={{ '--i': i } as React.CSSProperties}
              >
                <i
                  className="mt-1 inline-block h-2.5 w-2.5 rounded-full"
                  style={{ background: STAGE_TIER_DOT[tier] }}
                  aria-hidden="true"
                />
                <span>
                  <span className="block font-mono text-[11px] font-bold uppercase tracking-[0.08em] text-bone">
                    {CONFIDENCE_META[tier].label}
                  </span>
                  <span className="mt-0.5 block text-[13px] leading-snug text-bone-2">
                    {CONFIDENCE_META[tier].meaning}
                  </span>
                </span>
              </li>
            ))}
          </ul>

          <Link
            to="/sources"
            className="mt-7 inline-block font-mono text-[10px] uppercase tracking-[0.14em] text-bone transition-colors hover:text-cyan"
          >
            Open the source registry <span aria-hidden="true">→</span>
          </Link>
        </div>

        {/* the model in action: a real claim on cream stock, then the colophon */}
        <div className="md:col-span-5">
          <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-bone-2">The model, filed</p>
          <ClaimCard
            className="mt-4"
            subject={`${EXAMPLE.display.shortName} · grip first`}
            to={`/pitch/${EXAMPLE.display.slug}`}
            claim={EXAMPLE.canonical.grip}
          />
        </div>
      </div>
    </section>
  )
}
