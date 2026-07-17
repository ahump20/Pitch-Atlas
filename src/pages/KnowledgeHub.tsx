import type { CSSProperties } from 'react'
import { Link } from 'react-router-dom'
import { useSeoMeta } from '@unhead/react'
import { SITE } from '../config/site'
import { canonicalUrl, ogImageMeta, contentJsonLd } from '../lib/seo'
import { StructuredData } from '../components/seo/StructuredData'
import { KNOWLEDGE_HUB_COPY, WINGS } from '../data/knowledge'
import type { KnowledgeWing } from '../data/knowledge/types'
import { SectionHero } from '../components/layout/SectionHero'
import { Breadcrumb } from '../components/layout/Breadcrumb'
import { EggButton } from '../components/eggs/EggButton'

/*
  The Learn hub: the front door to the craft-record layer. The specimen pages answer
  "what is this pitch"; these wings answer the craft underneath — how the body
  creates timing, how a pitch is built, how pitches work together,
  and where the source boundary sits. Two shelves: the craft and scope boundaries.
  Cards match the index plates so
  the whole atlas reads as one system.
*/

/** The wing's place in the ten, read once off the canonical teaching order. The
    numbers ascend within each shelf; the gaps (a safety wing filed on the second
    shelf) are the truth, not a glitch: this is chapter N of the whole archive. */
const READING_NO = new Map(WINGS.map((w, i) => [w.slug, i + 1]))
const pad = (n: number | undefined) => (n ? String(n).padStart(2, '0') : '')

function WingCard({ wing }: { wing: KnowledgeWing }) {
  const no = READING_NO.get(wing.slug)
  return (
    <Link
      to={`/learn/${wing.slug}`}
      className={`rfx-plate group ${wing.boundaryOnly ? 'is-edge is-dashed' : ''}`}
      style={{ '--gc': wing.boundaryOnly ? 'var(--color-seam-bright)' : 'var(--color-cyan)' } as CSSProperties}
    >
      <span aria-hidden="true" className="absolute left-2.5 top-2.5 h-3 w-3 border-l border-t border-white/15" />
      <span aria-hidden="true" className="absolute right-2.5 top-2.5 h-3 w-3 border-r border-t border-white/15" />
      <div className="flex items-baseline justify-between gap-3">
        <p className={`mono-label ${wing.boundaryOnly ? 'text-seam' : 'text-ink-3'}`}>{wing.eyebrow}</p>
        <span
          aria-hidden="true"
          className="font-athletic text-2xl leading-none text-bone/25 tabular-nums"
        >
          {pad(no)}
        </span>
      </div>
      <h3 className="rfx-platetitle text-2xl">{wing.navLabel || wing.title}</h3>
      <p className="line-clamp-3 text-[0.95rem] leading-relaxed text-bone-2">{wing.summary}</p>
      <div className="mt-auto flex items-center gap-x-3 border-t border-white/10 pt-3">
        <span className={`mono-label ${wing.boundaryOnly ? 'text-seam' : 'text-ink-3'}`}>
          {wing.boundaryOnly ? 'Scope boundary' : 'The craft'}
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
          <p className="mono-label text-ink-3">
            <span className="text-cyan">Wing {pad(READING_NO.get(wing.slug))}</span> · {wing.eyebrow}
          </p>
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
  const craft = WINGS.filter((w) => !w.boundaryOnly)
  const boundaries = WINGS.filter((w) => w.boundaryOnly)

  useSeoMeta({
    title: `Learn: the craft underneath the pitch | ${SITE.siteName}`,
    description: KNOWLEDGE_HUB_COPY.description,
    ogTitle: `Learn | ${SITE.siteName}`,
    ogDescription: 'The craft underneath the pitch.',
    ogUrl: canonicalUrl('/learn'),
    ...ogImageMeta('learn', 'Learn: the craft underneath the pitch'),
  })

  return (
    <>
      <StructuredData
        graph={contentJsonLd({
          type: 'CreativeWork',
          url: canonicalUrl('/learn'),
          name: 'Learn: the craft underneath the pitch',
          description: KNOWLEDGE_HUB_COPY.description,
          breadcrumb: [{ name: 'The Atlas', to: '/' }, { name: 'Learn' }],
        })}
      />
      <SectionHero
        breadcrumb={<Breadcrumb trail={[{ label: 'The Atlas', to: '/' }, { label: 'Learn' }]} />}
        eyebrow="The craft record"
        title="The craft underneath the pitch."
        sub={KNOWLEDGE_HUB_COPY.heroSub}
      />

      <section>
        <div className="mx-auto max-w-6xl px-5 py-16 md:px-8 md:py-20">
          {WINGS.length === 0 ? (
            <p className="max-w-[56ch] text-lg leading-relaxed text-ink-2">
              The teaching wings are still being filed.
            </p>
          ) : (
            <>
              <Shelf label="The craft" wings={craft} />
              <Shelf label="Scope boundaries" wings={boundaries} />
            </>
          )}
          {/* a cryptic filing mark: the famous distance, hiding a note about why */}
          <p className="mt-12 text-right">
            <EggButton
              tidbitId="sixty-six"
              label="Reveal a hidden note about why the pitching rubber sits 60 feet 6 inches away"
              className="mono-label text-ink-3/55"
            >
              60&prime;&thinsp;6&Prime;
            </EggButton>
          </p>
        </div>
      </section>
    </>
  )
}
