import { useSeoMeta } from '@unhead/react'
import type { ClaimConfidence } from '../data/types'
import { CONFIDENCE_META } from '../data/types'
import { SITE } from '../config/site'
import { PITCHES } from '../data/pitches'
import { allSources, latestRetrievedAt } from '../data/sources'
import { asOfDate } from '../lib/format'
import { ConfidenceLabel } from '../components/provenance/ConfidenceLabel'
import { SourceBadge } from '../components/provenance/SourceBadge'
import { TierMarker } from '../components/layout/TierMarker'

/*
  Sources, promoted from a page footer to its own page. The provenance legend and
  the full citation registry are the credential of the whole manual, so they get
  room to read. The "as of" line computes from the most recent retrievedAt across
  the registry, never a hardcoded freshness string. The seam-accuracy note reads
  from the shared seam reference any pitch carries.
*/

const LEGEND_ORDER: ClaimConfidence[] = [
  'official-data',
  'reputable-analysis',
  'secondhand-attributed',
  'pitcher-own-words',
  'coach-observed',
  'community-firsthand',
  'unverified',
]

export function SourcesPage() {
  const sources = allSources()
  const asOf = asOfDate(latestRetrievedAt(sources))
  const seam = PITCHES[0].seam

  useSeoMeta({
    title: `Sources and provenance | ${SITE.siteName}`,
    description:
      'How Pitch Atlas labels every claim by source and confidence, and the full citation registry behind the manual. Sourced, not corrected.',
    ogTitle: `Sources and provenance | ${SITE.siteName}`,
    ogDescription: 'Every claim labeled by its source. The full citation registry behind the manual.',
    ogUrl: `${SITE.canonicalDomain}/sources`,
  })

  return (
    <section className="bg-paper">
      <div className="mx-auto max-w-6xl px-5 py-16 md:px-8 md:py-20">
        <TierMarker index="04" label="Sources" />

        <h1 className="display max-w-[18ch] text-4xl leading-[1.04] text-ink md:text-5xl">
          Sourced, not corrected.
        </h1>
        <p className="mt-5 max-w-[58ch] text-lg leading-relaxed text-ink-2">
          Many ways can work. Nothing here is marked right or wrong; every claim is labeled by where it
          came from and how confident the source is. The reader judges. The atlas only sources.
        </p>
        <p className="mono-label mt-6">As of {asOf}. Sources last checked, not auto-refreshed.</p>

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
            <h2 className="mono-label mb-6">The citation registry</h2>
            <ul className="grid grid-cols-1 gap-x-8 gap-y-3 sm:grid-cols-2">
              {sources.map((s) => (
                <li key={s.id}>
                  <SourceBadge source={s} />
                </li>
              ))}
            </ul>
          </div>
        </div>

        <p className="mt-14 max-w-[72ch] border-t border-navy/15 pt-8 text-sm leading-relaxed text-ink-2">
          No MLB, team, or player photos, logos, footage, or likenesses. Original geometry, diagrams,
          and words. Instructional text is paraphrased and cited, never copied. No runtime API calls:
          every figure here is static and sourced in the repository.
        </p>
      </div>
    </section>
  )
}
