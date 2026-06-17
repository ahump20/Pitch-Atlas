import { useParams, Link } from 'react-router-dom'
import { useSeoMeta } from '@unhead/react'
import { SITE } from '../config/site'
import { canonicalUrl, contentJsonLd } from '../lib/seo'
import { StructuredData } from '../components/seo/StructuredData'
import { SOFTBALL_PITCHES, softballPitchBySlug } from '../data/softball'
import type { SoftballPitch } from '../data/softball'
import { accentForSlug } from '../components/refractor/accents'
import { StageTierMarker } from '../components/layout/StageTierMarker'
import { ClaimProse } from '../components/provenance/ClaimProse'
import { SoftballProvenanceRow } from '../components/provenance/SoftballProvenanceRow'
import { NotFound } from './NotFound'

/*
  One softball pitch, one chapter: the grip, the spin, the movement, and — where it
  matters most, on the riseball — the honest physics. Filed light for the launch
  (sourced one-liners, not full grip geometry), but every line carries its source.
*/

const FAMILY_LABEL: Record<SoftballPitch['family'], string> = {
  rise: 'Rise',
  drop: 'Drop',
  fastball: 'Fastball',
  breaking: 'Breaking',
  offspeed: 'Off-speed',
}

function ChapterNav({ prev, next }: { prev?: SoftballPitch; next?: SoftballPitch }) {
  return (
    <nav aria-label="Softball arsenal chapters" className="rfx-panel border-t border-ink/15">
      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-4 px-5 py-12 md:grid-cols-3 md:px-8">
        <div className="md:justify-self-start">
          {prev ? (
            <Link to={`/softball/pitch/${prev.slug}`} className="group flex flex-col gap-1 rounded-sm border-l-2 border-l-cyan/40 px-4 py-3 transition-colors hover:border-l-cyan">
              <span className="mono-label text-ink-3">← Previous</span>
              <span className="font-athletic text-lg uppercase text-bone">{prev.name}</span>
            </Link>
          ) : null}
        </div>
        <Link to="/softball" className="flex flex-col items-center justify-center gap-1 rounded-sm border border-ink/15 px-4 py-3 text-center transition-colors hover:border-cyan md:justify-self-center">
          <span className="mono-label text-cyan">The softball wing</span>
          <span className="text-sm leading-snug text-ink-2">Back to the circle →</span>
        </Link>
        <div className="md:justify-self-end">
          {next ? (
            <Link to={`/softball/pitch/${next.slug}`} className="group flex flex-col gap-1 rounded-sm border-r-2 border-r-cyan/40 px-4 py-3 text-right transition-colors hover:border-r-cyan">
              <span className="mono-label text-ink-3">Next →</span>
              <span className="font-athletic text-lg uppercase text-bone">{next.name}</span>
            </Link>
          ) : null}
        </div>
      </div>
    </nav>
  )
}

export function SoftballPitchChapter() {
  const { slug } = useParams<{ slug: string }>()
  const pitch = slug ? softballPitchBySlug(slug) : undefined

  const idx = pitch ? SOFTBALL_PITCHES.findIndex((p) => p.slug === pitch.slug) : -1
  const prev = idx > 0 ? SOFTBALL_PITCHES[idx - 1] : undefined
  const next = idx >= 0 && idx < SOFTBALL_PITCHES.length - 1 ? SOFTBALL_PITCHES[idx + 1] : undefined

  useSeoMeta(
    pitch
      ? {
          title: `${pitch.name}: the fastpitch ${FAMILY_LABEL[pitch.family].toLowerCase()} | ${SITE.siteName}`,
          description: `${pitch.tagline} ${pitch.intro}`.slice(0, 200),
          ogTitle: `${pitch.name} | ${SITE.siteName}`,
          ogDescription: pitch.tagline,
          ogUrl: canonicalUrl('/softball/pitch/' + pitch.slug),
        }
      : { title: `Pitch not found | ${SITE.siteName}` },
  )

  if (!pitch) return <NotFound />

  const gc = accentForSlug(pitch.slug).c3

  return (
    <>
      <StructuredData
        graph={contentJsonLd({
          type: 'CreativeWork',
          url: canonicalUrl('/softball/pitch/' + pitch.slug),
          name: pitch.name,
          description: pitch.tagline,
          breadcrumb: [{ name: 'Pitch Atlas', to: '/' }, { name: 'Softball', to: '/softball' }, { name: pitch.name }],
        })}
      />
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
            <span className="text-bone-2">{pitch.specimenNo}</span>
          </nav>
          <p className="rfx-skick" style={{ color: gc }}>
            {FAMILY_LABEL[pitch.family]}{pitch.flagship ? ' · Flagship' : ''}
          </p>
          <h1 className="rfx-stitle mt-4 max-w-[14ch] text-[2.7rem] leading-[0.98] text-bone md:text-[4.6rem]">
            {pitch.name}
          </h1>
          <p className="mt-5 max-w-[56ch] text-lg leading-relaxed text-bone-2">{pitch.tagline}</p>
          <SoftballProvenanceRow
            claimType="Movement"
            claim={pitch.movement}
            openQuestion={pitch.openQuestion}
            className="mt-5 max-w-[72ch]"
          />
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-16 md:px-8 md:py-20">
        <p className="display max-w-[58ch] text-2xl leading-snug text-ink md:text-[1.75rem]">{pitch.intro}</p>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-16 md:px-8 md:py-20">
        <StageTierMarker index="01" label="Grip, spin, movement" />
        <div className="grid grid-cols-1 gap-x-10 gap-y-8 md:grid-cols-3">
          <div className="border-t border-ink/15 pt-4">
            <div className="mono-label mb-3 text-ink-2">The grip</div>
            <ClaimProse claim={pitch.grip} />
          </div>
          <div className="border-t border-ink/15 pt-4">
            <div className="mono-label mb-3 text-ink-2">The spin</div>
            <ClaimProse claim={pitch.spin} />
          </div>
          <div className="border-t border-ink/15 pt-4">
            <div className="mono-label mb-3 text-ink-2">The movement</div>
            <ClaimProse claim={pitch.movement} />
          </div>
        </div>
      </section>

      {pitch.physicsNote ? (
        <section className="mx-auto max-w-6xl px-5 py-16 md:px-8 md:py-20">
          <StageTierMarker index="02" label={pitch.flagship ? 'The honest physics' : 'The physics'} />
          <ClaimProse claim={pitch.physicsNote} proseClassName="max-w-[68ch] text-xl leading-relaxed text-ink" />
        </section>
      ) : null}

      <section className="mx-auto max-w-6xl px-5 py-16 md:px-8 md:py-20">
        <StageTierMarker index={pitch.physicsNote ? '03' : '02'} label="The job" />
        <div className="grid grid-cols-1 gap-x-10 gap-y-8 md:grid-cols-2">
          <div className="border-t border-ink/15 pt-4">
            <div className="mono-label mb-3 text-ink-2">Role in an arsenal</div>
            <p className="max-w-[56ch] text-lg leading-relaxed text-ink">{pitch.role}</p>
          </div>
          {pitch.notableThrowers ? (
            <div className="border-t border-ink/15 pt-4">
              <div className="mono-label mb-3 text-ink-2">Notable arms</div>
              <p className="max-w-[56ch] text-lg leading-relaxed text-ink">{pitch.notableThrowers}</p>
            </div>
          ) : null}
        </div>
        <p className="mt-10 max-w-[78ch] border-t border-ink/15 pt-6 text-sm leading-relaxed text-ink-2">
          Every line above is one click from its source. Still to come for the circle: the full grip geometry
          and a 12&Prime; seam, the way the baseball wing files a pitch.
        </p>
      </section>

      <ChapterNav prev={prev} next={next} />
    </>
  )
}
