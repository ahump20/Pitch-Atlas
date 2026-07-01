import { useSeoMeta } from '@unhead/react'
import type { ClaimConfidence } from '../data/types'
import { CONFIDENCE_META } from '../data/types'
import { SITE } from '../config/site'
import { canonicalUrl, contentJsonLd } from '../lib/seo'
import { StructuredData } from '../components/seo/StructuredData'
import { Breadcrumb } from '../components/layout/Breadcrumb'
import { PITCHES } from '../data/pitches'
import { allSources, latestRetrievedAt } from '../data/sources'
import { knowledgeSources } from '../data/knowledge'
import { asOfDate } from '../lib/format'
import { ConfidenceLabel } from '../components/provenance/ConfidenceLabel'
import { SourceBadge } from '../components/provenance/SourceBadge'
import { StageTierMarker } from '../components/layout/StageTierMarker'
import { EggButton } from '../components/eggs/EggButton'

/*
  Sources, promoted from a page footer to its own page. The provenance legend and
  the full citation registry are the credential of the whole archive, so they get
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
  // The full credential list is the specimen registry plus the wider literature the
  // teaching wings cite, deduped by URL so /sources stays a complete colophon.
  const registry = allSources()
  const seen = new Set(registry.map((s) => s.url))
  const sources = [...registry, ...knowledgeSources().filter((s) => !seen.has(s.url))]
  const asOf = asOfDate(latestRetrievedAt(sources))
  const seam = PITCHES[0].seam

  useSeoMeta({
    title: `Sources and provenance | ${SITE.siteName}`,
    description:
      'How Pitch Atlas labels every claim by source and confidence, and the full citation registry behind the archive.',
    ogTitle: `Sources and provenance | ${SITE.siteName}`,
    ogDescription: 'Every claim labeled by its source. The full citation registry behind the archive.',
    ogUrl: canonicalUrl('/sources'),
  })

  return (
    <section>
      <StructuredData
        graph={contentJsonLd({
          type: 'CreativeWork',
          url: canonicalUrl('/sources'),
          name: 'Sources and provenance',
          description:
            'How Pitch Atlas labels every claim by source and confidence, and the full citation registry behind the archive.',
          breadcrumb: [{ name: 'The Atlas', to: '/' }, { name: 'Sources' }],
        })}
      />
      <div className="mx-auto max-w-6xl px-5 py-16 md:px-8 md:py-20">
        <Breadcrumb trail={[{ label: 'The Atlas', to: '/' }, { label: 'Sources' }]} />
        <StageTierMarker index="04" label="Sources" as="span" />

        <h1 className="rfx-stitle max-w-[18ch] text-4xl leading-[1.04] md:text-5xl">
          Sourced, not corrected.
        </h1>
        <p className="mt-5 max-w-[58ch] text-lg leading-relaxed text-ink-2">
          Many ways can work. Nothing here is marked right or wrong; every claim is labeled by where it
          came from and how confident the source is. The reader judges. The atlas only sources.
        </p>
        <p className="mono-label mt-6">
          As of{' '}
          <EggButton
            tidbitId="the-k"
            label="Reveal a hidden note about how baseball record-keeping began"
            className="text-bone"
          >
            {asOf}
          </EggButton>
          . Sources last checked, not auto-refreshed.
        </p>

        <div className="mt-14 grid grid-cols-1 gap-x-10 gap-y-12 md:grid-cols-12">
          <div className="md:col-span-5">
            <h2 className="rfx-skick mb-6">How to read a claim</h2>
            <p className="mb-6 max-w-[46ch] text-sm leading-relaxed text-ink-2/85">
              Every claim on the site wears one of seven badges, strongest to weakest. The badge is the
              point: official tracking context and a coaching cue from a blog can both belong here, but they
              do not look the same. Each claim was checked against the source it cites before it shipped; what
              a source could not support is shown as unverified, not hidden.
            </p>
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
            <h2 className="rfx-skick mb-6">The citation registry</h2>
            <ul className="grid grid-cols-1 gap-x-8 gap-y-3 sm:grid-cols-2">
              {sources.map((s) => (
                <li key={s.id}>
                  <SourceBadge source={s} />
                </li>
              ))}
            </ul>
          </div>
        </div>

        <p className="mt-14 max-w-[72ch] border-t border-ink/15 pt-8 text-sm leading-relaxed text-ink-2">
          Original geometry, diagrams, and words. Real grip photos ship only from clean sources: our own
          photography, community own-grip uploads, and verified Creative Commons or public-domain images
          with attribution; never an unlicensed agency photo, a team or league mark, or broadcast footage.
          Instructional text is paraphrased and cited, never copied. No runtime API calls: every figure
          here is static and sourced in the repository.
        </p>
      </div>
    </section>
  )
}
