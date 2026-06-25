import { useParams, Navigate, Link } from 'react-router-dom'
import { useSeoMeta } from '@unhead/react'
import type { RepertoireEntry, RepertoireFamily } from '../data/types'
import { repertoireById, repertoireByFamily, BASIC_REPERTOIRE } from '../data/repertoire'
import { gripEntryFor } from '../data/grips'
import { SITE } from '../config/site'
import { canonicalUrl, ogImageMeta, contentJsonLd, truncateForMeta } from '../lib/seo'
import { StructuredData } from '../components/seo/StructuredData'
import { SectionHero } from '../components/layout/SectionHero'
import { Breadcrumb } from '../components/layout/Breadcrumb'
import { SpecimenGrips } from '../components/sections/GripLibrary'
import { isEdgeStatus, STATUS_LABEL } from '../components/index/StatusBadge'
import { StageTierMarker } from '../components/layout/StageTierMarker'
import { ClaimProse } from '../components/provenance/ClaimProse'
import { ConfidenceLabel } from '../components/provenance/ConfidenceLabel'
import { SeamSchematic } from '../components/fallback/SeamSchematic'
import { DiscussionPanel } from '../components/sections/DiscussionPanel'
import { FamilyRail } from '../components/pitch/FamilyRail'
import { NotFound } from './NotFound'

/*
  The basic detail page: every accepted pitch the atlas has not filed as a full
  specimen still gets a real page to land on. It leads with the plain-language read
  and the sourced grip/movement/relationship claims it already carries — no
  fabricated 3D, no invented movement plot, because the atlas has not measured this
  pitch. The honest "basic file" marker says so out loud. A filed pitch never lands
  here: it redirects to its full specimen.
*/

const FAMILY_EYEBROW: Record<RepertoireFamily, string> = {
  fastball: 'Fastball',
  breaking: 'Breaking ball',
  offspeed: 'Offspeed',
  specialty: 'Specialty',
  banned: 'Banned & doctored',
}

const FAMILY_ACCENT: Record<RepertoireFamily, string> = {
  // collegiate jewels printed at ink density for the cream field — pennant
  // navy, varsity forest, letterman burgundy, sand, seam. The neon triads
  // stay on the card faces.
  fastball: '#2C5A8C',
  offspeed: '#2F5D46',
  breaking: '#6E2B35',
  specialty: '#8A6B24',
  banned: '#A8232F',
}

function HeroBadge({ entry }: { entry: RepertoireEntry }) {
  const flagged = isEdgeStatus(entry.status)
  return (
    <span
      className={`inline-flex items-center gap-2 rounded-sm border px-4 py-2 font-mono text-xs uppercase tracking-[0.12em] ${
        flagged ? 'border-seam/50 text-seam' : 'border-ink/30 text-ink'
      }`}
    >
      {STATUS_LABEL[entry.status]}
    </span>
  )
}

function ChapterNav({ prev, next }: { prev?: RepertoireEntry; next?: RepertoireEntry }) {
  return (
    <nav aria-label="Pitch index chapters" className="border-t border-ink/15 bg-paper-2">
      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-4 px-5 py-12 md:grid-cols-3 md:px-8">
        <div className="md:justify-self-start">
          {prev ? (
            <Link
              to={`/repertoire/${prev.id}`}
              className="group flex flex-col gap-1 rounded-sm border-l-2 border-l-seam/40 px-4 py-3 transition-colors hover:border-l-seam"
            >
              <span className="mono-label text-ink-3">← Previous</span>
              <span className="font-athletic text-lg uppercase text-ink">{prev.name}</span>
            </Link>
          ) : null}
        </div>
        <Link
          to="/repertoire"
          className="flex flex-col items-center justify-center gap-1 rounded-sm border border-ink/15 px-4 py-3 text-center transition-colors hover:border-seam md:justify-self-center"
        >
          <span className="mono-label text-seam">The Pitch Index</span>
          <span className="text-sm leading-snug text-ink-2">Back to every pitch →</span>
        </Link>
        <div className="md:justify-self-end">
          {next ? (
            <Link
              to={`/repertoire/${next.id}`}
              className="group flex flex-col gap-1 rounded-sm border-r-2 border-r-seam/40 px-4 py-3 text-right transition-colors hover:border-r-seam"
            >
              <span className="mono-label text-ink-3">Next →</span>
              <span className="font-athletic text-lg uppercase text-ink">{next.name}</span>
            </Link>
          ) : null}
        </div>
      </div>
    </nav>
  )
}

export function RepertoireChapter() {
  const { id } = useParams<{ id: string }>()
  const entry = id ? repertoireById(id) : undefined
  // A filed pitch has a full specimen — a basic URL redirects straight to it.
  const redirectSlug = entry?.filedSlug

  const idx = entry && !redirectSlug ? BASIC_REPERTOIRE.findIndex((e) => e.id === entry.id) : -1
  const prev = idx > 0 ? BASIC_REPERTOIRE[idx - 1] : undefined
  const next = idx >= 0 && idx < BASIC_REPERTOIRE.length - 1 ? BASIC_REPERTOIRE[idx + 1] : undefined

  useSeoMeta(
    entry && !redirectSlug
      ? {
          title: `${entry.name} | The Pitch Index | ${SITE.siteName}`,
          description: truncateForMeta(`${entry.name}: ${entry.movement.value}`),
          ogTitle: `${entry.name} | ${SITE.siteName}`,
          ogDescription: entry.movement.value.slice(0, 160),
          ogUrl: canonicalUrl('/repertoire/' + entry.id),
          ...ogImageMeta('repertoire', `${entry.name} — the Pitch Index`),
        }
      : { title: `Pitch not found | ${SITE.siteName}` },
  )

  if (redirectSlug) return <Navigate to={`/pitch/${redirectSlug}`} replace />
  if (!entry) return <NotFound />

  const accentColor = isEdgeStatus(entry.status) ? '#C8102E' : FAMILY_ACCENT[entry.family]
  const gripEntry = gripEntryFor(entry.id)
  // Others in this family — the cross-link the filed specimens get via
  // PitchConnections, brought to the basic files so they don't dead-end on
  // linear prev/next. A filed sibling routes to its specimen, a basic one to its file.
  const familySiblings = repertoireByFamily(entry.family)
    .filter((e) => e.id !== entry.id)
    .map((e) => ({
      to: e.filedSlug ? `/pitch/${e.filedSlug}` : `/repertoire/${e.id}`,
      name: e.name,
      accentColor: isEdgeStatus(e.status) ? '#C8102E' : FAMILY_ACCENT[e.family],
    }))
  const subParts = [
    entry.aka && entry.aka.length > 0 ? `aka ${entry.aka.join(' · ')}` : null,
  ].filter(Boolean)

  return (
    <>
      <StructuredData
        graph={contentJsonLd({
          type: 'CreativeWork',
          url: canonicalUrl('/repertoire/' + entry.id),
          name: entry.name,
          description: (entry.plain ?? entry.movement.value).slice(0, 200),
          breadcrumb: [
            { name: 'The Atlas', to: '/' },
            { name: 'The Pitch Index', to: '/repertoire' },
            { name: entry.name },
          ],
        })}
      />
      <SectionHero
        accent={isEdgeStatus(entry.status) ? 'seam' : 'powder'}
        breadcrumb={
          <Breadcrumb
            trail={[
              { label: 'The Atlas', to: '/' },
              { label: 'The Pitch Index', to: '/repertoire' },
              { label: entry.name },
            ]}
          />
        }
        eyebrow={FAMILY_EYEBROW[entry.family]}
        badge={<HeroBadge entry={entry} />}
        title={entry.name}
        sub={subParts.length > 0 ? <>{subParts.join('  ·  ')}</> : undefined}
      />

      {/* Plain-language lede + a decorative schematic. The schematic is the ball,
          not a movement claim — this pitch has no filed seam geometry. */}
      <section className="mx-auto max-w-6xl px-5 py-14 md:px-8 md:py-16">
        <div className="grid grid-cols-1 items-start gap-10 md:grid-cols-12">
          <div className="md:col-span-8">
            {entry.plain ? (
              <p className="display max-w-[58ch] text-2xl leading-snug text-ink md:text-[1.7rem]">
                {entry.plain}
              </p>
            ) : (
              <>
                <p className="display max-w-[58ch] text-2xl leading-snug text-ink md:text-[1.7rem]">
                  {entry.movement.value}
                </p>
                <ConfidenceLabel confidence={entry.movement.confidence} className="mt-3" />
              </>
            )}
          </div>
          <figure className="md:col-span-4">
            <div className="mx-auto w-52 md:w-full md:max-w-[240px]">
              <SeamSchematic
                className="h-full w-full"
                showAxis={false}
                showStitches
                title=""
              />
            </div>
            <figcaption className="mt-3 max-w-[34ch] text-center text-xs leading-snug text-ink-3 md:text-left">
              Schematic baseball cover. This pitch has no filed seam geometry yet — the grip and shape
              below are sourced in words, not measured here.
            </figcaption>
          </figure>
        </div>
      </section>

      {gripEntry ? (
        /* grip footage is viewed in the dark — the one coal band on the basic file */
        <div className="scene-coal">
          <div className="mx-auto max-w-6xl px-5 md:px-8">
            <SpecimenGrips entry={gripEntry} accentColor={accentColor} className="border-t-0 pt-0" />
          </div>
        </div>
      ) : null}

      <section>
        <div className="mx-auto max-w-6xl px-5 py-14 md:px-8 md:py-16">
          <StageTierMarker index="01" label="The grip" />
          <ClaimProse claim={entry.grip} proseClassName="max-w-[64ch] text-xl leading-relaxed text-ink" />
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-14 md:px-8 md:py-16">
        <StageTierMarker index="02" label="What it does" />
        <ClaimProse claim={entry.movement} proseClassName="max-w-[64ch] text-xl leading-relaxed text-ink" />
      </section>

      {entry.relationship ? (
        <section>
          <div className="mx-auto max-w-6xl px-5 py-14 md:px-8 md:py-16">
            <StageTierMarker index="03" label="What it really is" />
            <ClaimProse
              claim={entry.relationship}
              proseClassName="max-w-[64ch] text-xl leading-relaxed text-ink"
            />
          </div>
        </section>
      ) : null}

      {entry.notableThrowers ? (
        <section className="mx-auto max-w-6xl px-5 pb-4 md:px-8">
          <p className="max-w-[64ch] border-t border-ink/15 pt-5 text-base leading-relaxed text-ink-2">
            <span className="mono-label mr-2 text-ink-3">Who throws it</span>
            {entry.notableThrowers}
          </p>
        </section>
      ) : null}

      {/* The honest marker: this is a basic file, not a measured specimen. */}
      <section className="mx-auto max-w-6xl px-5 py-10 md:px-8">
        <div className="rounded-sm border border-dashed border-seam/45 bg-paper-2 px-6 py-5">
          <p className="mono-label mb-2 text-seam">Basic file</p>
          <p className="max-w-[72ch] text-sm leading-relaxed text-ink-2">
            This pitch has a sourced one-line grip and movement and an honest explanation — not yet a filed
            specimen with authored grip geometry and a full craft chapter. A fuller breakdown is coming. Sourced, not
            corrected.
          </p>
        </div>
      </section>

      <FamilyRail
        heading={`Others in the ${FAMILY_EYEBROW[entry.family].toLowerCase()}`}
        items={familySiblings}
      />

      {/* Per-pitch discussion. */}
      <DiscussionPanel topicKey={`repertoire:${entry.id}`} topicName={entry.name} />

      <ChapterNav prev={prev} next={next} />
    </>
  )
}
