import { useParams, Link } from 'react-router-dom'
import { useSeoMeta } from '@unhead/react'
import type { Claim, LostPitch } from '../data/types'
import { DOCUMENTATION_META } from '../data/types'
import { LOST_PITCHES, lostPitchBySlug } from '../data/lost-pitches'
import { SITE } from '../config/site'
import { canonicalUrl, ogImageMeta, contentJsonLd, truncateForMeta } from '../lib/seo'
import { StructuredData } from '../components/seo/StructuredData'
import { StageTierMarker } from '../components/layout/StageTierMarker'
import { ClaimProse } from '../components/provenance/ClaimProse'
import { DiscussionPanel } from '../components/sections/DiscussionPanel'
import { ConfidenceLabel } from '../components/provenance/ConfidenceLabel'
import { SourceBadge } from '../components/provenance/SourceBadge'
import { ClaimNote } from '../components/provenance/SourcedValue'
import { LostPitchArchivePlate } from '../components/lost-pitches/ArchiveImageRail'
import { archiveImageForLostPitch } from '../data/media/archive-images'
import { EggButton } from '../components/eggs/EggButton'
import { NotFound } from './NotFound'

/*
  One lost pitch, one chapter: what it was, why it is lost, a real sourced quote when
  one exists, and the surviving record. The documentation tier rides in the hero so
  the reader knows, before the first sentence, how solid the ground is. The legend
  tier wears the seam accent. No specimen cross-link and no seam schematic here —
  these pitches were never filed, and that absence is the whole point.
*/

function Quote({ quote }: { quote: Claim<string> }) {
  return (
    <figure className="border-l-2 border-seam/60 pl-6">
      <blockquote className="display max-w-[40ch] text-2xl italic leading-snug text-ink md:text-3xl">
        &ldquo;{quote.value}&rdquo;
      </blockquote>
      <figcaption className="mt-4 flex flex-wrap items-center gap-x-2 gap-y-1">
        <ConfidenceLabel confidence={quote.confidence} />
        {quote.source ? (
          <>
            <span aria-hidden="true" className="text-ink-3">/</span>
            <SourceBadge source={quote.source} />
          </>
        ) : null}
      </figcaption>
      {quote.note ? <ClaimNote>{quote.note}</ClaimNote> : null}
    </figure>
  )
}

function ChapterNav({ prev, next }: { prev?: LostPitch; next?: LostPitch }) {
  return (
    <nav aria-label="Lost pitch chapters" className="rfx-panel border-t border-ink/15">
      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-4 px-5 py-12 md:grid-cols-3 md:px-8">
        <div className="md:justify-self-start">
          {prev ? (
            <Link to={`/lost-pitches/${prev.slug}`} className="group flex flex-col gap-1 rounded-sm border-l-2 border-l-cyan/40 px-4 py-3 transition-colors hover:border-l-cyan">
              <span className="mono-label text-ink-3">← Previous</span>
              <span className="font-athletic text-lg uppercase text-bone">{prev.name}</span>
            </Link>
          ) : null}
        </div>
        <Link to="/lost-pitches" className="flex flex-col items-center justify-center gap-1 rounded-sm border border-ink/15 px-4 py-3 text-center transition-colors hover:border-cyan md:justify-self-center">
          <span className="mono-label text-cyan">Lost Pitches</span>
          <span className="text-sm leading-snug text-ink-2">Back to the archive →</span>
        </Link>
        <div className="md:justify-self-end">
          {next ? (
            <Link to={`/lost-pitches/${next.slug}`} className="group flex flex-col gap-1 rounded-sm border-r-2 border-r-cyan/40 px-4 py-3 text-right transition-colors hover:border-r-cyan">
              <span className="mono-label text-ink-3">Next →</span>
              <span className="font-athletic text-lg uppercase text-bone">{next.name}</span>
            </Link>
          ) : null}
        </div>
      </div>
    </nav>
  )
}

export function LostPitchChapter() {
  const { slug } = useParams<{ slug: string }>()
  const pitch = slug ? lostPitchBySlug(slug) : undefined

  const idx = pitch ? LOST_PITCHES.findIndex((p) => p.slug === pitch.slug) : -1
  const prev = idx > 0 ? LOST_PITCHES[idx - 1] : undefined
  const next = idx >= 0 && idx < LOST_PITCHES.length - 1 ? LOST_PITCHES[idx + 1] : undefined

  useSeoMeta(
    pitch
      ? {
          title: `${pitch.name} | Lost Pitches | ${SITE.siteName}`,
          description: truncateForMeta(`${pitch.tagline} ${pitch.intro}`),
          ogTitle: `${pitch.name} | ${SITE.siteName}`,
          ogDescription: pitch.tagline,
          ogUrl: canonicalUrl('/lost-pitches/' + pitch.slug),
          ...ogImageMeta('lost-pitches', `${pitch.name} — Lost Pitches of the Negro Leagues`),
        }
      : { title: `Lost pitch not found | ${SITE.siteName}` },
  )

  if (!pitch) return <NotFound />

  const tierMeta = DOCUMENTATION_META[pitch.tier]
  const isLegend = pitch.tier === 'legend'
  const archiveImage = archiveImageForLostPitch(pitch.slug)

  return (
    <>
      <StructuredData
        graph={contentJsonLd({
          type: 'Article',
          url: canonicalUrl('/lost-pitches/' + pitch.slug),
          name: pitch.name,
          description: `${pitch.tagline} ${pitch.intro}`.slice(0, 200),
          breadcrumb: [
            { name: 'The Atlas', to: '/' },
            { name: 'Lost Pitches', to: '/lost-pitches' },
            { name: pitch.name },
          ],
        })}
      />
      <section className="on-stage relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.1]" aria-hidden="true">
          <div className="h-full w-full bg-[radial-gradient(circle_at_72%_34%,rgba(200,16,46,0.15),transparent_42%),linear-gradient(115deg,rgba(255,255,255,0.06)_0_1px,transparent_1px_100%)] bg-[size:auto,34px_34px]" />
        </div>
        <div className="relative mx-auto max-w-6xl px-5 py-16 md:px-8 md:py-24">
          <nav aria-label="Breadcrumb" className="mb-6 flex flex-wrap items-center gap-2 font-mono text-[11px] uppercase tracking-[0.14em] text-bone-2/80">
            <Link to="/" className="transition-colors hover:text-bone">The Atlas</Link>
            <span aria-hidden="true">/</span>
            <Link to="/lost-pitches" className="transition-colors hover:text-bone">Lost Pitches</Link>
            <span aria-hidden="true">/</span>
            <EggButton
              tidbitId="spitball-ban"
              label="Reveal a hidden note about the banned spitball and its grandfathered pitchers"
              className="text-bone-2"
            >
              {pitch.specimenNo}
            </EggButton>
          </nav>
          <p className="rfx-skick">{pitch.era}</p>
          <h1 className="rfx-stitle mt-4 max-w-[16ch] text-[2.7rem] leading-[0.98] text-bone md:text-[4.6rem]">
            {pitch.name}
          </h1>
          <p className="mt-5 max-w-[56ch] text-lg leading-relaxed text-bone-2">{pitch.tagline}</p>
          <p
            className={`mt-7 inline-flex items-center gap-2 rounded-sm border px-4 py-2 font-mono text-xs uppercase tracking-[0.12em] ${
              isLegend ? 'border-seam/50 text-seam' : 'border-bone/25 text-bone'
            }`}
            title={tierMeta.meaning}
          >
            {tierMeta.label}
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-16 md:px-8 md:py-20">
        <p className="display max-w-[58ch] text-2xl leading-snug text-ink md:text-[1.75rem]">{pitch.intro}</p>
      </section>

      {archiveImage ? <LostPitchArchivePlate image={archiveImage} /> : null}

      <section>
        <div className="mx-auto max-w-6xl px-5 py-16 md:px-8 md:py-20">
          <StageTierMarker index="01" label="What it was" />
          <ClaimProse claim={pitch.what} proseClassName="max-w-[64ch] text-xl leading-relaxed text-ink" />
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-16 md:px-8 md:py-20">
        <StageTierMarker index="02" label="Why it is lost" />
        <div className="grid grid-cols-1 gap-10 md:grid-cols-12">
          <div className={pitch.quote ? 'md:col-span-7' : 'md:col-span-12'}>
            <ClaimProse claim={pitch.whyLost} proseClassName="text-xl leading-relaxed text-ink" />
          </div>
          {pitch.quote ? (
            <div className="md:col-span-5">
              <Quote quote={pitch.quote} />
            </div>
          ) : null}
        </div>
      </section>

      {pitch.record.length > 0 ? (
        <section className="relative">
          <div className="pa-atmo pa-atmo-seam" aria-hidden="true" />
          <div className="relative mx-auto max-w-6xl px-5 py-16 md:px-8 md:py-20">
            <StageTierMarker index="03" label="The surviving record" />
            <div className="flex flex-col gap-10">
              {pitch.record.map((n) => (
                <div key={n.label}>
                  <div className="mono-label mb-2.5 text-ink-2">{n.label}</div>
                  <ClaimProse claim={n.claim} proseClassName="max-w-[64ch] text-lg leading-relaxed text-ink" />
                </div>
              ))}
            </div>
            <p className="mt-10 max-w-[78ch] border-t border-ink/15 pt-6 text-sm leading-relaxed text-ink-2">
              Every line here is what the recovered record can actually support, labeled by its source
              and its confidence. Where the legend says more than the record can prove, the gap is shown,
              not filled.
            </p>
          </div>
        </section>
      ) : null}

      <DiscussionPanel topicKey={`lost:${pitch.slug}`} topicName={pitch.name} variant="compact" />

      <ChapterNav prev={prev} next={next} />
    </>
  )
}
