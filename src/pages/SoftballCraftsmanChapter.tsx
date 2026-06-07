import { useParams, Link } from 'react-router-dom'
import { useSeoMeta } from '@unhead/react'
import type { Claim } from '../data/types'
import { SOFTBALL_CRAFTSMEN, softballCraftsmanBySlug, softballPitchBySlug } from '../data/softball'
import { SITE } from '../config/site'
import { StageTierMarker } from '../components/layout/StageTierMarker'
import { ClaimProse } from '../components/provenance/ClaimProse'
import { SourcedValue, ClaimNote } from '../components/provenance/SourcedValue'
import { ConfidenceLabel } from '../components/provenance/ConfidenceLabel'
import { SourceBadge } from '../components/provenance/SourceBadge'
import { NotFound } from './NotFound'

/*
  One softball craftsman, one chapter. Same shape as the baseball CraftsmanChapter —
  the signature pitch, the mental edge, a sourced quote, the record — reusing the
  same provenance atoms, but scoped to the softball wing: it reads from the softball
  craftsmen + arsenal and links back into /softball. Kept as its own page so the
  baseball chapter (coupled to baseball pitch motion + the seam schematic) stays
  untouched.
*/

function Quote({ quote }: { quote: Claim<string> }) {
  return (
    <figure className="border-l-2 border-cyan/50 pl-6">
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

export function SoftballCraftsmanChapter() {
  const { slug } = useParams<{ slug: string }>()
  const craftsman = slug ? softballCraftsmanBySlug(slug) : undefined
  const pitch = craftsman?.signaturePitchSlug ? softballPitchBySlug(craftsman.signaturePitchSlug) : undefined

  const idx = craftsman ? SOFTBALL_CRAFTSMEN.findIndex((c) => c.slug === craftsman.slug) : -1
  const prev = idx > 0 ? SOFTBALL_CRAFTSMEN[idx - 1] : undefined
  const next = idx >= 0 && idx < SOFTBALL_CRAFTSMEN.length - 1 ? SOFTBALL_CRAFTSMEN[idx + 1] : undefined

  useSeoMeta(
    craftsman
      ? {
          title: `${craftsman.name}: ${craftsman.signaturePitch} | ${SITE.siteName}`,
          description: `${craftsman.tagline} ${craftsman.intro}`.slice(0, 200),
          ogTitle: `${craftsman.name} | ${SITE.siteName}`,
          ogDescription: craftsman.tagline,
          ogUrl: `${SITE.canonicalDomain}/softball/craftsmen/${craftsman.slug}`,
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
            <Link to="/softball" className="transition-colors hover:text-bone">Softball</Link>
            <span aria-hidden="true">/</span>
            <span className="text-bone-2">{craftsman.specimenNo}</span>
          </nav>
          <p className="rfx-skick">
            Master · {craftsman.era}
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

      <section className="mx-auto max-w-6xl px-5 py-16 md:px-8 md:py-20">
        <StageTierMarker index="01" label="The signature pitch" />
        <ClaimProse claim={craftsman.signature} proseClassName="text-xl leading-relaxed text-ink" />
        {pitch ? (
          <Link
            to={`/softball/pitch/${pitch.slug}`}
            className="mt-6 inline-flex items-center gap-2 rounded-sm border border-cyan/60 px-4 py-2.5 font-mono text-xs uppercase tracking-[0.12em] text-cyan transition-colors hover:bg-cyan/10"
          >
            Study the {pitch.name.toLowerCase()}
            <span aria-hidden="true">→</span>
          </Link>
        ) : null}
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
          <StageTierMarker index="02" label="In the circle" />
          <Quote quote={craftsman.quote} />
        </section>
      ) : null}

      <section className="mx-auto max-w-6xl px-5 py-16 md:px-8 md:py-20">
        <StageTierMarker index="03" label="The record" />
        <div className="grid grid-cols-1 gap-x-8 gap-y-8 sm:grid-cols-2 lg:grid-cols-3">
          {craftsman.numbers.map((n, i) => (
            <div key={n.label} className="border-t border-[rgba(255,255,255,0.12)] pt-3">
              <div className="mono-label mb-2.5 text-bone-2">{n.label}</div>
              <SourcedValue claim={n.claim} valueClassName="text-lg md:text-xl" accent={i === 0} />
            </div>
          ))}
        </div>
        <p className="mt-10 max-w-[78ch] border-t border-[rgba(255,255,255,0.12)] pt-6 text-sm leading-relaxed text-ink-2">
          Filed the way every record here is: each figure confidence-labeled and one click from its source.
          Where a line is a teammate’s words rather than Osterman’s own, it is labeled as such, not put in her
          mouth.
        </p>
      </section>

      <nav aria-label="Softball craftsmen chapters" className="rfx-panel border-t border-[rgba(255,255,255,0.12)]">
        <div className="mx-auto grid max-w-6xl grid-cols-1 gap-4 px-5 py-12 md:grid-cols-3 md:px-8">
          <div className="md:justify-self-start">
            {prev ? (
              <Link to={`/softball/craftsmen/${prev.slug}`} className="group flex flex-col gap-1 rounded-sm border-l-2 border-l-cyan/40 px-4 py-3 transition-colors hover:border-l-cyan">
                <span className="mono-label text-ink-3">← Previous</span>
                <span className="font-athletic text-lg uppercase text-bone">{prev.name}</span>
              </Link>
            ) : null}
          </div>
          <Link to="/softball" className="flex flex-col items-center justify-center gap-1 rounded-sm border border-[rgba(255,255,255,0.12)] px-4 py-3 text-center transition-colors hover:border-cyan md:justify-self-center">
            <span className="mono-label text-cyan">The softball wing</span>
            <span className="text-sm leading-snug text-ink-2">Back to the circle →</span>
          </Link>
          <div className="md:justify-self-end">
            {next ? (
              <Link to={`/softball/craftsmen/${next.slug}`} className="group flex flex-col gap-1 rounded-sm border-r-2 border-r-cyan/40 px-4 py-3 text-right transition-colors hover:border-r-cyan">
                <span className="mono-label text-ink-3">Next →</span>
                <span className="font-athletic text-lg uppercase text-bone">{next.name}</span>
              </Link>
            ) : null}
          </div>
        </div>
      </nav>
    </>
  )
}
