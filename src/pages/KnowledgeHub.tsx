import type { CSSProperties } from 'react'
import { Link } from 'react-router-dom'
import { useSeoMeta } from '@unhead/react'
import { SITE } from '../config/site'
import { WINGS } from '../data/knowledge'
import type { KnowledgeWing } from '../data/knowledge/types'
import { SectionHero } from '../components/layout/SectionHero'
import { Breadcrumb } from '../components/layout/Breadcrumb'

/*
  The Learn hub: the front door to the teaching layer. The specimen pages answer
  "what is this pitch"; these wings answer the craft underneath — how the body
  creates timing, how a pitch is built, how pitches work together,
  and how to keep an arm healthy. Two shelves: the craft, and health & development
  (the wings that carry the educational-use note). Cards match the index plates so
  the whole atlas reads as one system.
*/

function WingCard({ wing }: { wing: KnowledgeWing }) {
  return (
    <Link
      to={`/learn/${wing.slug}`}
      className={`rfx-plate group ${wing.educational ? 'is-edge is-dashed' : ''}`}
      style={{ '--gc': wing.educational ? 'var(--color-seam-bright)' : 'var(--color-cyan)' } as CSSProperties}
    >
      <span aria-hidden="true" className="absolute left-2.5 top-2.5 h-3 w-3 border-l border-t border-white/15" />
      <span aria-hidden="true" className="absolute right-2.5 top-2.5 h-3 w-3 border-r border-t border-white/15" />
      <p className={`mono-label ${wing.educational ? 'text-seam' : 'text-ink-3'}`}>{wing.eyebrow}</p>
      <h3 className="rfx-platetitle text-2xl">{wing.navLabel || wing.title}</h3>
      <p className="line-clamp-3 text-[0.95rem] leading-relaxed text-bone-2">{wing.summary}</p>
      <div className="mt-auto flex items-center gap-x-3 border-t border-white/10 pt-3">
        <span className={`mono-label ${wing.educational ? 'text-seam' : 'text-ink-3'}`}>
          {wing.educational ? 'Educational reference' : 'The craft'}
        </span>
        <span className="ml-auto mono-label text-cyan transition-colors group-hover:text-bone">Open →</span>
      </div>
    </Link>
  )
}

/** The lead or closing wing, staged full-width on a material plate — the contents
    page gets a reading order, not ten identical cards. */
function WingFeature({ wing, atmo }: { wing: KnowledgeWing; atmo: 'seam' | 'leather' }) {
  return (
    <Link
      to={`/learn/${wing.slug}`}
      className="rfx-plate group relative overflow-hidden sm:col-span-2 lg:col-span-3"
      style={{ '--gc': 'var(--color-cyan)' } as CSSProperties}
    >
      <div className={`pa-atmo ${atmo === 'seam' ? 'pa-atmo-seam' : 'pa-atmo-leather'} opacity-[0.14]`} aria-hidden="true" />
      <div className="relative flex flex-col gap-3 py-3 md:flex-row md:items-end md:justify-between md:gap-10">
        <div className="max-w-[62ch]">
          <p className="mono-label text-ink-3">{wing.eyebrow}</p>
          <h3 className="rfx-platetitle mt-1 text-3xl md:text-4xl">{wing.navLabel || wing.title}</h3>
          <p className="mt-3 text-[1.02rem] leading-relaxed text-bone-2">{wing.summary}</p>
        </div>
        <span className="mono-label shrink-0 pb-1 text-cyan transition-colors group-hover:text-bone">
          Open the wing →
        </span>
      </div>
    </Link>
  )
}

function Shelf({ label, wings }: { label: string; wings: KnowledgeWing[] }) {
  if (wings.length === 0) return null
  // The craft shelf reads as a contents page: the delivery leads at full width,
  // the middle wings hold the grid, and the canon closes as the reading path.
  const lead = wings.length > 4 ? wings[0] : undefined
  const closer = wings.length > 4 ? wings[wings.length - 1] : undefined
  const middle = lead && closer ? wings.slice(1, -1) : wings
  return (
    <div className="mb-14 last:mb-0">
      <h2 className="rfx-skick mb-6">{label}</h2>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {lead ? <WingFeature wing={lead} atmo="seam" /> : null}
        {middle.map((w) => (
          <WingCard key={w.slug} wing={w} />
        ))}
        {closer ? <WingFeature wing={closer} atmo="leather" /> : null}
      </div>
    </div>
  )
}

export function KnowledgeHub() {
  const craft = WINGS.filter((w) => !w.educational)
  const health = WINGS.filter((w) => w.educational)

  useSeoMeta({
    title: `Learn: the craft underneath the pitch | ${SITE.siteName}`,
    description:
      'The teaching layer of Pitch Atlas — mechanics, pitch design, sequencing and tunneling, spin literacy, arm health, and youth development. Every claim sourced and labeled by confidence.',
    ogTitle: `Learn | ${SITE.siteName}`,
    ogDescription: 'The craft underneath the pitch. Sourced, not corrected.',
    ogUrl: `${SITE.canonicalDomain}/learn`,
  })

  return (
    <>
      <SectionHero
        breadcrumb={<Breadcrumb trail={[{ label: 'The Atlas', to: '/' }, { label: 'Learn' }]} />}
        eyebrow="The field manual"
        title="The craft underneath the pitch."
        sub={
          <>
            The specimens say what each pitch is. These wings say how the craft works — how the body
            creates timing, how a pitch gets built, how pitches work together, and how to keep an arm
            healthy. Every claim sourced and labeled by confidence.
          </>
        }
      />

      <section>
        <div className="mx-auto max-w-6xl px-5 py-16 md:px-8 md:py-20">
          {WINGS.length === 0 ? (
            <p className="max-w-[56ch] text-lg leading-relaxed text-bone-2">
              The teaching wings are being filed. Check back shortly.
            </p>
          ) : (
            <>
              <Shelf label="The craft" wings={craft} />
              <Shelf label="Health &amp; development" wings={health} />
            </>
          )}
        </div>
      </section>
    </>
  )
}
