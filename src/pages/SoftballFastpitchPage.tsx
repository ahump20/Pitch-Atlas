import { Link } from 'react-router-dom'
import { useSeoMeta } from '@unhead/react'
import { SITE } from '../config/site'
import { canonicalUrl } from '../lib/seo'
import { WINDMILL_PHASES, FUNDAMENTAL_BLOCKS } from '../data/softball'
import { SectionHero } from '../components/layout/SectionHero'
import { Breadcrumb } from '../components/layout/Breadcrumb'
import { StageTierMarker } from '../components/layout/StageTierMarker'
import { ClaimProse } from '../components/provenance/ClaimProse'

/*
  Fastpitch fundamentals — the windmill from the ground up, sourced to peer-reviewed
  biomechanics. Section 01 walks the four phases of the delivery; the blocks that
  follow cover where the speed comes from, the honest arm-health reality, and the
  rules that shape the craft. The arm-health block carries the education-only note.
*/

export function SoftballFastpitchPage() {
  useSeoMeta({
    title: `Fastpitch fundamentals: the windmill, from the ground up | ${SITE.siteName}`,
    description:
      'The core of fastpitch softball pitching — the four phases of the windmill delivery, where the speed actually comes from (the lower half, not the arm circle), and the honest arm-health reality. Sourced to peer-reviewed biomechanics. Education only.',
    ogTitle: `Fastpitch fundamentals | ${SITE.siteName}`,
    ogDescription: 'The windmill, from the ground up. Sourced, not corrected.',
    ogUrl: canonicalUrl('/softball/fastpitch'),
  })

  return (
    <>
      <SectionHero
        breadcrumb={
          <Breadcrumb
            trail={[{ label: 'The Atlas', to: '/' }, { label: 'Softball', to: '/softball' }, { label: 'Fastpitch' }]}
          />
        }
        eyebrow="Fastpitch · fundamentals"
        title="The windmill, from the ground up."
        sub={
          <>
            The underhand windmill looks like an arm pitch and is not. Here is the delivery in four phases,
            where the speed is really made, and the arm-health truth the "underhand is natural and safe" myth
            gets wrong — sourced to peer-reviewed biomechanics, not coaching lore. Education and documentation
            only; this is not medical advice.
          </>
        }
      />

      <section className="mx-auto max-w-6xl px-5 py-16 md:px-8 md:py-20">
        <StageTierMarker index="01" label="The windmill, in four phases" />
        <p className="mb-10 max-w-[64ch] text-base leading-relaxed text-ink-2">
          Biomechanics splits the delivery into four phases — the wind-up, the stride, the acceleration, and
          the follow-through. Each hands energy to the next.
        </p>
        <div className="grid grid-cols-1 gap-x-10 gap-y-10 md:grid-cols-2">
          {WINDMILL_PHASES.map((phase) => (
            <div key={phase.num} className="border-t border-ink/15 pt-4">
              <div className="mb-3 flex items-baseline gap-3">
                <span className="font-mono text-sm font-medium tabular-nums text-ink">{phase.num}</span>
                <h3 className="font-athletic text-xl uppercase tracking-wide text-ink">{phase.name}</h3>
              </div>
              <ClaimProse claim={phase.what} />
            </div>
          ))}
        </div>
      </section>

      {FUNDAMENTAL_BLOCKS.map((block) => (
        <section key={block.id} className="mx-auto max-w-6xl px-5 py-16 md:px-8 md:py-20">
          <StageTierMarker index={block.index} label={block.label} />
          <p
            className={`mb-10 max-w-[68ch] text-lg leading-relaxed ${
              block.educational ? 'text-seam/90' : 'text-ink-2'
            }`}
          >
            {block.lede}
          </p>
          <div className="grid grid-cols-1 gap-x-10 gap-y-8 md:grid-cols-2">
            {block.claims.map((c, i) => (
              <ClaimProse key={i} claim={c} />
            ))}
          </div>
        </section>
      ))}

      <section className="mx-auto max-w-6xl px-5 pb-20 md:px-8">
        <div className="rfx-panel flex flex-col gap-4 rounded-sm border border-ink/15 p-8 md:flex-row md:items-center md:justify-between">
          <p className="max-w-[52ch] text-base leading-relaxed text-bone-2">
            Next: the arsenal that lives on this delivery — the rise, the drop, and the rest.
          </p>
          <Link
            to="/softball"
            className="inline-flex shrink-0 items-center gap-2 rounded-sm border border-seam/60 px-4 py-2.5 font-mono text-xs uppercase tracking-[0.12em] text-seam transition-colors hover:bg-seam/10"
          >
            The softball wing
            <span aria-hidden="true">→</span>
          </Link>
        </div>
      </section>
    </>
  )
}
