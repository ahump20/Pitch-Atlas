import { Link } from 'react-router-dom'
import { useSeoMeta } from '@unhead/react'
import { SITE } from '../config/site'
import { WINGS } from '../data/knowledge'
import type { KnowledgeWing } from '../data/knowledge/types'
import { SectionHero } from '../components/layout/SectionHero'
import { Breadcrumb } from '../components/layout/Breadcrumb'

/*
  The Learn hub: the front door to the teaching layer. The specimen pages answer
  "what is this pitch"; these wings answer the craft underneath — how velocity is
  made, how a pitch is built, how pitches work together, how to read the numbers,
  and how to keep an arm healthy. Two shelves: the craft, and health & development
  (the wings that carry the educational-use note). Cards match the index plates so
  the whole atlas reads as one system.
*/

function WingCard({ wing }: { wing: KnowledgeWing }) {
  return (
    <Link
      to={`/learn/${wing.slug}`}
      className={`group relative flex h-full flex-col gap-3 rounded-sm border-l-2 bg-paper p-5 transition-colors ${
        wing.educational
          ? 'border-l-seam border border-dashed border-seam/35 hover:bg-paper-2/50'
          : 'border-l-navy border-navy/15 hover:border-l-seam hover:bg-paper-2/40'
      }`}
    >
      <span aria-hidden="true" className="absolute left-2.5 top-2.5 h-3 w-3 border-l border-t border-navy/30" />
      <span aria-hidden="true" className="absolute right-2.5 top-2.5 h-3 w-3 border-r border-t border-navy/30" />
      <p className={`mono-label ${wing.educational ? 'text-seam' : 'text-ink-3'}`}>{wing.eyebrow}</p>
      <h3 className="display text-2xl leading-tight text-navy">{wing.navLabel || wing.title}</h3>
      <p className="line-clamp-3 text-[0.95rem] leading-relaxed text-ink/90">{wing.summary}</p>
      <div className="mt-auto flex items-center gap-x-3 border-t border-navy/12 pt-3">
        <span className={`mono-label ${wing.educational ? 'text-seam' : 'text-ink-3'}`}>
          {wing.educational ? 'Educational reference' : 'The craft'}
        </span>
        <span className="ml-auto mono-label text-seam transition-colors group-hover:text-navy">Open →</span>
      </div>
    </Link>
  )
}

function Shelf({ label, wings }: { label: string; wings: KnowledgeWing[] }) {
  if (wings.length === 0) return null
  return (
    <div className="mb-14 last:mb-0">
      <h2 className="mono-label mb-6 text-navy">{label}</h2>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {wings.map((w) => (
          <WingCard key={w.slug} wing={w} />
        ))}
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
      'The teaching layer of Pitch Atlas — the kinetic chain, pitch design, sequencing and tunneling, spin literacy, reading the metrics, arm health, and youth development. Every claim sourced and labeled by confidence.',
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
            The specimens say what each pitch is. These wings say how the craft works — how velocity is
            made, how a pitch gets built, how pitches work together, how to read the numbers, and how to
            keep an arm healthy. Every claim sourced and labeled by confidence.
            {WINGS.length > 0 ? (
              <span className="mt-4 block font-mono text-xs uppercase tracking-[0.12em] text-bone-2/70">
                {WINGS.length} wings
              </span>
            ) : null}
          </>
        }
      />

      <section className="bg-paper">
        <div className="mx-auto max-w-6xl px-5 py-16 md:px-8 md:py-20">
          {WINGS.length === 0 ? (
            <p className="max-w-[56ch] text-lg leading-relaxed text-ink-2">
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
