import type { ClaimConfidence, PitchAtlasEntry } from '../../data/types'
import { SITE } from '../../config/site'
import { CONFIDENCE_META } from '../../data/types'
import { allSources, latestRetrievedAt } from '../../data/sources'
import { asOfDate } from '../../lib/format'
import { ConfidenceLabel } from '../provenance/ConfidenceLabel'
import { SourceBadge } from '../provenance/SourceBadge'

const LEGEND_ORDER: ClaimConfidence[] = [
  'official-data',
  'reputable-analysis',
  'secondhand-attributed',
  'pitcher-own-words',
  'coach-observed',
  'community-firsthand',
  'unverified',
]

/*
  The colophon treats sources as a credential. The "as of" line computes from the
  most recent retrievedAt across the registry, never a hardcoded freshness string.
*/
export function Colophon({ entry }: { entry: PitchAtlasEntry }) {
  const sources = allSources()
  const asOf = asOfDate(latestRetrievedAt(sources))
  const { seam } = entry

  return (
    <footer id="sources" className="scroll-mt-24 border-t border-ink-3/30 bg-paper-2">
      <div className="mx-auto max-w-6xl px-5 py-16 md:px-8 md:py-20">
        <p className="display max-w-[58ch] text-2xl italic leading-snug text-ink md:text-[1.75rem]">
          Sourced, not corrected. Many ways can work. Claims are labeled by provenance.
        </p>
        <p className="mono-label mt-5">As of {asOf}. Sources last checked, not auto-refreshed.</p>

        <div className="mt-14 grid grid-cols-1 gap-x-10 gap-y-12 md:grid-cols-12">
          <div className="md:col-span-5">
            <h2 className="mono-label mb-6">How to read a claim</h2>
            <ul className="flex flex-col gap-4">
              {LEGEND_ORDER.map((c) => (
                <li key={c} className="flex flex-col gap-1">
                  <ConfidenceLabel confidence={c} />
                  <span className="max-w-[44ch] text-sm leading-snug text-ink-2/85">
                    {CONFIDENCE_META[c].meaning}
                  </span>
                </li>
              ))}
            </ul>
            <p className="mt-6 max-w-[46ch] text-sm leading-snug text-ink-2/85">
              A value marked with a leading approximate sign is rounded, era-dependent, or
              methodology-bound. The seam render is a {seam.accuracyLevel}, documented in{' '}
              <span className="font-mono text-ink-2">{seam.calibrationDoc}</span>.
            </p>
          </div>

          <div className="md:col-span-7">
            <h2 className="mono-label mb-6">Sources</h2>
            <ul className="grid grid-cols-1 gap-x-8 gap-y-3 sm:grid-cols-2">
              {sources.map((s) => (
                <li key={s.id}>
                  <SourceBadge source={s} />
                </li>
              ))}
            </ul>
          </div>
        </div>

        <p className="mt-14 max-w-[72ch] border-t border-ink-3/30 pt-8 text-sm leading-relaxed text-ink-2">
          No MLB, team, or player photos, logos, footage, or likenesses. Original geometry, diagrams,
          and words. Instructional text is paraphrased and cited, never copied. No runtime API calls:
          every figure here is static and sourced in the repository.
        </p>

        <div className="mt-12 flex flex-wrap items-center justify-between gap-4 border-t border-ink-3/30 pt-8">
          <img
            src="/brand/wordmark-pitcher.webp"
            alt={SITE.siteName}
            className="h-10 w-auto rounded-sm md:h-12"
          />
          <div className="flex flex-col items-end gap-1">
            <a href={SITE.canonicalDomain} className="mono-label transition-colors hover:text-seam">
              pitch-atlas.com
            </a>
            <span className="mono-label text-ink-3">{SITE.tagline}</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
