import { Link } from 'react-router-dom'
import { useSeoMeta } from '@unhead/react'
import { PITCHES } from '../data/pitches'
import { WINGS } from '../data/knowledge'
import { CONFIDENCE_META, type ClaimConfidence, type RepertoireFamily } from '../data/types'
import { REPERTOIRE_FAMILIES, repertoireByFamily } from '../data/repertoire'
import { SITE } from '../config/site'
import { HomeHero } from '../components/sections/HomeHero'
import { SpecimenSet } from '../components/sections/SpecimenSet'
import { CONFIDENCE_COLOR } from '../components/provenance/RefractorClaim'

/* The provenance ladder, rendered from the real confidence model. The five tiers
   a visitor will actually meet, top to bottom, each labeled by where it came from. */
const LADDER: { tier: ClaimConfidence; rank: string }[] = [
  { tier: 'official-data', rank: 'highest' },
  { tier: 'pitcher-own-words', rank: 'firsthand' },
  { tier: 'coach-observed', rank: 'firsthand' },
  { tier: 'reputable-analysis', rank: 'cited' },
  { tier: 'secondhand-attributed', rank: 'flagged' },
]

/* The family chips on the index teaser, accent per family (matches the directory). */
const FAMILY_ACCENT: Record<RepertoireFamily, string> = {
  fastball: '#37D6FF',
  offspeed: '#7CFF52',
  breaking: '#8A6BFF',
  specialty: '#FFC23C',
  banned: '#FF2D44',
}

/* The honesty contract: the lines the product, the data model, and the community
   floor all hold. Editorial copy, not data — the creed made visible. */
const NEVER = [
  'Fake community posts',
  'Fake adoption counts',
  'Fake verified-pro badges',
  'Hardcoded freshness',
  'Unlicensed agency photos',
  'Team or league marks',
  'Copied instructional prose',
  'Unsourced grip claims',
  'Runtime API for pitch data',
  'Geometry for an unmeasured pitch',
]
const ALWAYS = ['Real grip photos, clean sources', 'A source on every number']

/* The interactive tools, surfaced together so every one is one click from home. */
const TOOLS: { label: string; to: string; blurb: string }[] = [
  { label: 'What pitch is this?', to: '/classify', blurb: 'Enter a tracking line; get the likely pitch family, with honest confidence.' },
  { label: 'Build the Break', to: '/sandbox', blurb: 'Set the spin axis, rate, and efficiency and watch the break redraw live.' },
  { label: 'The Movement Map', to: '/movement-map', blurb: 'Every filed pitch on one catcher’s-eye quadrant, with an RHP/LHP mirror.' },
  { label: 'Compare two pitches', to: '/compare', blurb: 'Overlay any two pitches to see the shared tunnel and the late separation.' },
  { label: 'Compare two grips', to: '/grips', blurb: 'Two grips under one arm slot — the deception of same release, different grip.' },
  { label: 'The Kinetic Chain', to: '/kinetic-chain', blurb: 'Step the delivery phase by phase with the sourced joint angles and velocities.' },
]

/*
  The Atlas home, struck in the refractor language. The hero states the product
  and shows the live ball; the Pitch Index directly below is the dominant surface
  — every filed pitch as a holographic specimen card, one click to its page. A
  legend names the sourcing, the tools open the physics engine, and a compact
  colophon opens the two side wings. The philosophy lives once, on /sources.
*/
export function AtlasHome() {
  useSeoMeta({
    title: `${SITE.siteName}: The Living Field Manual for Pitching Grips`,
    description:
      'A searchable atlas of every pitch — grip, movement, and the craftsmen who defined it. Every claim labeled by its source. Sourced, not corrected.',
    ogTitle: `${SITE.siteName}: the living field manual for pitching grips`,
    ogDescription: 'Every pitch, gripped and sourced. Sourced, not corrected.',
    ogUrl: SITE.canonicalDomain,
    twitterCard: 'summary_large_image',
  })

  return (
    <>
      <HomeHero featured={PITCHES[0]} />

      {/* The model: the provenance ladder, from the real confidence tiers. */}
      <section className="border-t border-bone/10">
        <div className="mx-auto max-w-[1320px] px-5 py-16 md:grid md:grid-cols-12 md:gap-10 md:px-8 md:py-20">
          <div className="md:col-span-5">
            <p className="rfx-skick">The model</p>
            <h2 className="rfx-stitle mt-3 max-w-[14ch] text-[clamp(28px,5vw,54px)]">
              Sourced, <span className="rfx-holo">not corrected</span>.
            </h2>
            <p className="mt-4 max-w-[44ch] text-[15px] leading-relaxed text-bone-2">
              A pitch can be thrown a dozen credible ways. The atlas does not pick a winner. It records
              what is known, attributes it, and labels how confident the source is. A Statcast number and a
              beat-writer quote are both welcome, and they never wear the same badge.
            </p>
          </div>
          <ul className="mt-8 flex flex-col gap-2.5 md:col-span-7 md:mt-0">
            {LADDER.map(({ tier, rank }) => (
              <li
                key={tier}
                className="grid grid-cols-[auto_1fr_auto] items-center gap-4 rounded-xl border px-4 py-3"
                style={{
                  borderColor: `color-mix(in srgb, ${CONFIDENCE_COLOR[tier]} 30%, transparent)`,
                  background: `linear-gradient(100deg, color-mix(in srgb, ${CONFIDENCE_COLOR[tier]} 14%, var(--color-press)), var(--color-press))`,
                }}
              >
                <i
                  className="rfx-dot"
                  style={{ background: CONFIDENCE_COLOR[tier], color: CONFIDENCE_COLOR[tier] }}
                  aria-hidden="true"
                />
                <span>
                  <span className="block font-prose text-sm font-bold uppercase tracking-[0.02em] text-bone">
                    {CONFIDENCE_META[tier].label}
                  </span>
                  <span className="mt-0.5 block text-[12.5px] leading-snug text-bone-2">
                    {CONFIDENCE_META[tier].meaning}
                  </span>
                </span>
                <span
                  className="font-mono text-[9px] uppercase tracking-[0.1em]"
                  style={{ color: CONFIDENCE_COLOR[tier] }}
                >
                  {rank}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section id="index" className="scroll-mt-20 border-t border-bone/10 pt-16 md:pt-20">
        <div className="mx-auto max-w-[1320px] px-5 md:px-8">
          <p className="mono-label-stage">The Pitch Index</p>
          <h2 className="rfx-athletic rfx-skew rfx-stroke mt-3 text-bone" style={{ fontSize: 'clamp(30px,5vw,58px)' }}>
            Every pitch, struck as a <span className="rfx-holo">specimen</span>.
          </h2>
          <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 font-mono text-[11px] uppercase tracking-[0.1em] text-bone-2">
            <span className="inline-flex items-center gap-2">
              <i className="rfx-dot" style={{ background: 'var(--color-ok-bright)', color: 'var(--color-ok-bright)' }} /> Official data
            </span>
            <span className="inline-flex items-center gap-2">
              <i className="rfx-dot" style={{ background: 'var(--color-amber-bright)', color: 'var(--color-amber-bright)' }} /> Reputable analysis
            </span>
            <span className="text-bone-2/80">◆ Foil is decoration · the readings are sourced</span>
          </div>
        </div>
        <SpecimenSet />

        <div className="mx-auto mt-12 max-w-[1320px] px-5 md:px-8">
          <div className="rfx-panel rounded-2xl p-[clamp(22px,3vw,36px)]">
            <p className="rfx-skick">The front door</p>
            <h3 className="rfx-stitle mt-3 max-w-[18ch] text-[clamp(22px,3.4vw,38px)]">
              A searchable directory of every accepted pitch.
            </h3>
            <p className="mt-3 max-w-[60ch] text-[14px] leading-relaxed text-bone-2">
              The twelve above are filed specimens. The full index carries every accepted pitch by family,
              plus the honest edges — an alias, an illusion, a colloquialism that is not a pitch, and the
              banned doctored balls.
            </p>
            <div className="mt-5 flex flex-wrap gap-2.5">
              {REPERTOIRE_FAMILIES.map((f) => (
                <Link
                  key={f.family}
                  to="/repertoire"
                  className="rounded-full border px-3.5 py-2 font-mono text-[10px] uppercase tracking-[0.1em] text-bone transition-colors"
                  style={{
                    borderColor: `color-mix(in srgb, ${FAMILY_ACCENT[f.family]} 50%, transparent)`,
                    background: `color-mix(in srgb, ${FAMILY_ACCENT[f.family]} 12%, transparent)`,
                  }}
                >
                  {f.label}{' '}
                  <b style={{ color: FAMILY_ACCENT[f.family] }}>{repertoireByFamily(f.family).length}</b>
                </Link>
              ))}
            </div>
            <Link
              to="/repertoire"
              className="mt-6 inline-flex items-center gap-2 rounded-md px-5 py-3 font-mono text-sm font-bold uppercase tracking-wide text-[#06121b] transition-transform active:translate-y-px"
              style={{ background: 'var(--color-cyan)', boxShadow: '0 6px 20px -8px var(--color-cyan)' }}
            >
              Open the full Pitch Index <span aria-hidden="true">→</span>
            </Link>
          </div>
        </div>
      </section>

      {/* The field manual: the Learn wings. */}
      <section className="border-t border-bone/10">
        <div className="mx-auto max-w-[1320px] px-5 py-16 md:px-8 md:py-20">
          <p className="mono-label-stage">The field manual</p>
          <h2 className="rfx-athletic rfx-skew mt-3 text-bone" style={{ fontSize: 'clamp(26px,4vw,44px)' }}>
            Not just what each pitch is — how the craft works underneath.
          </h2>
          <p className="mt-4 max-w-[64ch] text-base leading-relaxed text-bone-2">
            Ten sourced chapters: how velocity is made, how a pitch gets built, how pitches work together,
            how to read the numbers, and the arm-health and youth reality beneath all of it.
          </p>
          <div className="mt-8 flex flex-wrap gap-2.5">
            {WINGS.map((w) => (
              <Link
                key={w.slug}
                to={`/learn/${w.slug}`}
                className="rounded-sm border border-bone/20 px-3.5 py-2 font-mono text-xs uppercase tracking-[0.06em] text-bone-2 transition-colors hover:border-bone hover:text-bone"
              >
                {w.navLabel || w.title}
              </Link>
            ))}
          </div>
          <Link to="/learn" className="mono-label-stage mt-6 inline-block transition-colors hover:text-bone">
            Open the field manual →
          </Link>
        </div>
      </section>

      {/* The tools. */}
      <section className="border-t border-bone/10">
        <div className="mx-auto max-w-[1320px] px-5 py-16 md:px-8 md:py-20">
          <p className="mono-label-stage">The tools</p>
          <h2 className="rfx-athletic rfx-skew mt-3 text-bone" style={{ fontSize: 'clamp(26px,4vw,44px)' }}>
            The physics engine, made playable.
          </h2>
          <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {TOOLS.map((t) => (
              <Link
                key={t.to}
                to={t.to}
                className="group rounded-md border border-bone/12 bg-[#0e0c14] p-5 transition-colors hover:border-bone/35"
              >
                <p className="rfx-athletic rfx-skew text-bone" style={{ fontSize: '20px' }}>{t.label}</p>
                <p className="mt-2 text-sm leading-relaxed text-bone-2">{t.blurb}</p>
                <span className="mono-label-stage mt-3 inline-block transition-colors group-hover:text-bone">Open →</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* The honesty contract: what the product never fakes, and what it always carries. */}
      <section className="border-t border-bone/10">
        <div className="mx-auto max-w-[1320px] px-5 py-16 md:px-8 md:py-20">
          <p className="rfx-skick">The honesty contract</p>
          <h2 className="rfx-stitle mt-3 max-w-[16ch] text-[clamp(26px,4vw,44px)]">
            What we will <span className="rfx-holo">never fake</span>.
          </h2>
          <p className="mt-4 max-w-[58ch] text-[15px] leading-relaxed text-bone-2">
            The foil is decoration. The provenance is the point. These lines are load-bearing — in the
            product copy, the data model, and the community floor in equal measure.
          </p>
          <div className="mt-8 grid grid-cols-1 gap-x-10 gap-y-2.5 sm:grid-cols-2 lg:grid-cols-3">
            {NEVER.map((item) => (
              <div key={item} className="flex items-baseline gap-2.5">
                <span className="shrink-0 rounded border border-seam-bright/70 px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-[0.06em] text-seam-bright">
                  No
                </span>
                <span className="rfx-athletic rfx-skew text-[clamp(15px,1.7vw,19px)] text-bone-2">{item}</span>
              </div>
            ))}
            {ALWAYS.map((item) => (
              <div key={item} className="flex items-baseline gap-2.5">
                <span className="shrink-0 rounded border border-ok-bright/70 px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-[0.06em] text-ok-bright">
                  Yes
                </span>
                <span className="rfx-athletic rfx-skew text-[clamp(15px,1.7vw,19px)] text-bone">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* One colophon line + the two side wings. */}
      <section className="border-t border-bone/10">
        <div className="mx-auto max-w-[1320px] px-5 py-16 md:px-8 md:py-20">
          <p className="rfx-athletic rfx-skew max-w-[24ch] text-bone" style={{ fontSize: 'clamp(22px,3vw,34px)' }}>
            Every claim is labeled by its source, not declared right or wrong.
          </p>
          <Link to="/sources" className="mono-label-stage mt-4 inline-block transition-colors hover:text-bone">
            How a claim is filed →
          </Link>

          <div className="mt-10 grid grid-cols-1 gap-5 md:grid-cols-2">
            <Link
              to="/craftsmen"
              className="group rounded-md border border-bone/12 bg-[#0e0c14] p-6 transition-colors hover:border-bone/35"
            >
              <p className="mono-label-stage text-bone">The Craftsmen</p>
              <p className="mt-2 max-w-[44ch] text-base leading-relaxed text-bone-2">
                The arms that owned a pitch — and the one pitch that is a legend, not a person.
              </p>
              <span className="mono-label-stage mt-3 inline-block transition-colors group-hover:text-bone">Open the hall →</span>
            </Link>
            <Link
              to="/lost-pitches"
              className="group rounded-md border border-dashed border-bone/25 bg-[#0e0c14] p-6 transition-colors hover:border-bone/45"
            >
              <p className="mono-label-stage text-bone">Lost Pitches</p>
              <p className="mt-2 max-w-[44ch] text-base leading-relaxed text-bone-2">
                The pitches of the Negro Leagues whose statistics survive but whose grips mostly do not.
              </p>
              <span className="mono-label-stage mt-3 inline-block transition-colors group-hover:text-bone">Open the archive →</span>
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}
