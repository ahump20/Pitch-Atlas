import { useParams, Link } from 'react-router-dom'
import { useSeoMeta } from '@unhead/react'
import type { Claim, Craftsman } from '../data/types'
import { CRAFTSMEN, craftsmanBySlug } from '../data/craftsmen'
import { pitchBySlug } from '../data/pitches'
import { SITE } from '../config/site'
import { StageTierMarker } from '../components/layout/StageTierMarker'
import { ClaimProse } from '../components/provenance/ClaimProse'
import { ConfidenceLabel } from '../components/provenance/ConfidenceLabel'
import { SourceBadge } from '../components/provenance/SourceBadge'
import { ClaimNote } from '../components/provenance/SourcedValue'
import { RecordLinks } from '../components/provenance/RecordLinks'
import { SeamSchematic } from '../components/fallback/SeamSchematic'
import { NotFound } from './NotFound'

/*
  One craftsman, one chapter: the signature pitch, the mental edge, a real sourced
  quote when one exists, and the record. The legend (the gyroball) swaps the
  mental-edge section for a myth-versus-physics block. The signature pitch
  cross-links to its specimen page when the atlas has it on file.
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

function ChapterNav({ prev, next }: { prev?: Craftsman; next?: Craftsman }) {
  return (
    <nav aria-label="Craftsmen chapters" className="rfx-panel border-t border-[rgba(255,255,255,0.12)]">
      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-4 px-5 py-12 md:grid-cols-3 md:px-8">
        <div className="md:justify-self-start">
          {prev ? (
            <Link to={`/craftsmen/${prev.slug}`} className="group flex flex-col gap-1 rounded-sm border-l-2 border-l-cyan/40 px-4 py-3 transition-colors hover:border-l-cyan">
              <span className="mono-label text-ink-3">← Previous</span>
              <span className="font-athletic text-lg uppercase text-bone">{prev.name}</span>
            </Link>
          ) : null}
        </div>
        <Link to="/craftsmen" className="flex flex-col items-center justify-center gap-1 rounded-sm border border-[rgba(255,255,255,0.12)] px-4 py-3 text-center transition-colors hover:border-cyan md:justify-self-center">
          <span className="mono-label text-cyan">The Craftsmen</span>
          <span className="text-sm leading-snug text-ink-2">Back to the hall →</span>
        </Link>
        <div className="md:justify-self-end">
          {next ? (
            <Link to={`/craftsmen/${next.slug}`} className="group flex flex-col gap-1 rounded-sm border-r-2 border-r-cyan/40 px-4 py-3 text-right transition-colors hover:border-r-cyan">
              <span className="mono-label text-ink-3">Next →</span>
              <span className="font-athletic text-lg uppercase text-bone">{next.name}</span>
            </Link>
          ) : null}
        </div>
      </div>
    </nav>
  )
}

export function CraftsmanChapter() {
  const { slug } = useParams<{ slug: string }>()
  const craftsman = slug ? craftsmanBySlug(slug) : undefined
  const isLegend = craftsman?.kind === 'legend'
  const pitch = craftsman?.signaturePitchSlug ? pitchBySlug(craftsman.signaturePitchSlug) : undefined

  const idx = craftsman ? CRAFTSMEN.findIndex((c) => c.slug === craftsman.slug) : -1
  const prev = idx > 0 ? CRAFTSMEN[idx - 1] : undefined
  const next = idx >= 0 && idx < CRAFTSMEN.length - 1 ? CRAFTSMEN[idx + 1] : undefined

  useSeoMeta(
    craftsman
      ? {
          title: `${craftsman.name}: ${craftsman.signaturePitch} | ${SITE.siteName}`,
          description: `${craftsman.tagline} ${craftsman.intro}`.slice(0, 200),
          ogTitle: `${craftsman.name} | ${SITE.siteName}`,
          ogDescription: craftsman.tagline,
          ogUrl: `${SITE.canonicalDomain}/craftsmen/${craftsman.slug}`,
        }
      : { title: `Craftsman not found | ${SITE.siteName}` },
  )

  if (!craftsman) return <NotFound />

  return (
    <>
      <section className="on-stage relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.1]" aria-hidden="true">
          <div className="h-full w-full bg-[radial-gradient(circle_at_72%_34%,rgba(108,172,228,0.15),transparent_42%),linear-gradient(115deg,rgba(242,236,221,0.06)_0_1px,transparent_1px_100%)] bg-[size:auto,34px_34px]" />
        </div>
        <div className="relative mx-auto max-w-6xl px-5 py-16 md:px-8 md:py-24">
          <nav aria-label="Breadcrumb" className="mb-6 flex flex-wrap items-center gap-2 font-mono text-[11px] uppercase tracking-[0.14em] text-bone-2/80">
            <Link to="/" className="transition-colors hover:text-bone">The Atlas</Link>
            <span aria-hidden="true">/</span>
            <Link to="/craftsmen" className="transition-colors hover:text-bone">The Craftsmen</Link>
            <span aria-hidden="true">/</span>
            <span className="text-bone-2">{craftsman.specimenNo}</span>
          </nav>
          <p className="rfx-skick">
            {isLegend ? 'Legend' : 'Master'} · {craftsman.era}
            {craftsman.hand ? ` · ${craftsman.hand}-handed` : ''}
          </p>
          <h1 className="rfx-stitle mt-4 max-w-[14ch] text-[2.7rem] leading-[0.98] text-bone md:text-[4.6rem]">
            {craftsman.name}
          </h1>
          <p className="mt-5 max-w-[54ch] text-lg leading-relaxed text-bone-2">{craftsman.tagline}</p>
          <p className="mt-7 inline-flex items-center gap-2 rounded-sm border border-bone/25 px-4 py-2 font-mono text-xs uppercase tracking-[0.12em] text-bone">
            Signature pitch
            <span className="text-powder">{craftsman.signaturePitch}</span>
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-16 md:px-8 md:py-20">
        <p className="display max-w-[58ch] text-2xl leading-snug text-ink md:text-[1.75rem]">{craftsman.intro}</p>
      </section>

      <section>
        <div className="mx-auto max-w-6xl px-5 py-16 md:px-8 md:py-20">
          <StageTierMarker index="01" label="The signature pitch" />
          <div className="grid grid-cols-1 gap-10 md:grid-cols-12">
            <div className="md:col-span-7">
              <ClaimProse claim={craftsman.signature} proseClassName="text-xl leading-relaxed text-ink" />
              {pitch ? (
                <Link
                  to={`/pitch/${pitch.display.slug}`}
                  className="mt-6 inline-flex items-center gap-2 rounded-sm border border-cyan/60 px-4 py-2.5 font-mono text-xs uppercase tracking-[0.12em] text-cyan transition-colors hover:bg-cyan/10"
                >
                  Study the {pitch.canonical.name.toLowerCase()}
                  <span aria-hidden="true">→</span>
                </Link>
              ) : null}
            </div>
            {pitch ? (
              <div className="md:col-span-5">
                <div className="rfx-panel relative mx-auto aspect-square w-full max-w-[300px] rounded-sm border border-[rgba(255,255,255,0.12)] p-6">
                  <SeamSchematic
                    className="h-full w-full"
                    spinAxis={pitch.motion.spinAxis}
                    gyro={pitch.motion.gyro}
                    title={`The ${pitch.canonical.name} seam, oriented to its spin axis.`}
                  />
                </div>
                <p className="mono-label mt-3 text-center">The {pitch.canonical.name.toLowerCase()} seam, our own schematic</p>
              </div>
            ) : null}
          </div>
        </div>
      </section>

      {craftsman.mentalEdge ? (
        <section className="mx-auto max-w-6xl px-5 py-16 md:px-8 md:py-20">
          <StageTierMarker index="02" label="The mental edge" />
          <div className="grid grid-cols-1 gap-10 md:grid-cols-12">
            <div className="md:col-span-7">
              <ClaimProse claim={craftsman.mentalEdge} proseClassName="text-xl leading-relaxed text-ink" />
            </div>
            {craftsman.quote ? (
              <div className="md:col-span-5">
                <Quote quote={craftsman.quote} />
              </div>
            ) : null}
          </div>
        </section>
      ) : craftsman.quote ? (
        <section className="mx-auto max-w-6xl px-5 py-16 md:px-8 md:py-20">
          <StageTierMarker index="02" label="In their words" />
          <Quote quote={craftsman.quote} />
        </section>
      ) : null}

      {isLegend && craftsman.legendNote ? (
        <section>
          <div className="mx-auto max-w-6xl px-5 py-16 md:px-8 md:py-20">
            <StageTierMarker index="03" label="The myth, and the physics" />
            <ClaimProse claim={craftsman.legendNote} proseClassName="max-w-[64ch] text-xl leading-relaxed text-ink" />
          </div>
        </section>
      ) : null}

      {craftsman.record?.length ? (
        <section className="relative mx-auto max-w-6xl px-5 py-16 md:px-8 md:py-20">
          <div className="pa-atmo pa-atmo-leather" aria-hidden="true" />
          <div className="relative">
            <StageTierMarker index={isLegend ? '04' : '03'} label="The record" />
            <div className="flex flex-col gap-10">
              {craftsman.record.map((c, i) => (
                <ClaimProse
                  key={i}
                  claim={c}
                  proseClassName={
                    i === 0
                      ? 'max-w-[58ch] text-xl leading-relaxed text-ink md:text-2xl'
                      : 'max-w-[64ch] text-lg leading-relaxed text-ink'
                  }
                />
              ))}
            </div>
            {craftsman.recordLinks?.length ? (
              <RecordLinks sources={craftsman.recordLinks} className="mt-12" />
            ) : null}
            <p className="mt-10 max-w-[78ch] border-t border-[rgba(255,255,255,0.12)] pt-6 text-sm leading-relaxed text-ink-2">
              The record is told here the way the rest of the atlas is told: in prose, each claim
              confidence-labeled and one click from its source. Where reputation and record disagree,
              the gap is shown, not smoothed over.
            </p>
          </div>
        </section>
      ) : null}

      <ChapterNav prev={prev} next={next} />
    </>
  )
}
