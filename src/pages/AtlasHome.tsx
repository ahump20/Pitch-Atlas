import { type CSSProperties } from 'react'
import { Link } from 'react-router-dom'
import { useSeoMeta } from '@unhead/react'
import { PITCHES } from '../data/pitches'
import { WINGS } from '../data/knowledge'
import {
  CONFIDENCE_META,
  type ClaimConfidence,
  type PitchAtlasEntry,
  type PitchFamily,
  type RepertoireFamily,
} from '../data/types'
import { REPERTOIRE_FAMILIES, repertoireByFamily } from '../data/repertoire'
import { SITE } from '../config/site'
import { HomeHero } from '../components/sections/HomeHero'
import { PitchSpecimenCard } from '../components/refractor/PitchSpecimenCard'
import { CONFIDENCE_COLOR } from '../components/provenance/RefractorClaim'

/* The provenance ladder, rendered from the real confidence model. The five tiers
   a visitor will actually meet, top to bottom, each labeled by where it came from.
   Rendered as a descending source scale, not five equal boxes. */
const LADDER: { tier: ClaimConfidence; rank: string }[] = [
  { tier: 'official-data', rank: 'highest' },
  { tier: 'pitcher-own-words', rank: 'firsthand' },
  { tier: 'coach-observed', rank: 'firsthand' },
  { tier: 'reputable-analysis', rank: 'cited' },
  { tier: 'secondhand-attributed', rank: 'flagged' },
]

/* The family chips on the index gateway, accent per family (matches the directory). */
const FAMILY_ACCENT: Record<RepertoireFamily, string> = {
  fastball: '#37D6FF',
  offspeed: '#7CFF52',
  breaking: '#8A6BFF',
  specialty: '#FFC23C',
  banned: '#FF2D44',
}

/* The filed-specimen family labels, for the on-page browsing groups. The filed set
   only carries the three canonical families; the full index (the gateway above)
   carries specialty and banned too. */
const PITCH_FAMILY_LABEL: Record<PitchFamily, string> = {
  fastball: 'Fastballs',
  breaking: 'Breaking balls',
  offspeed: 'Offspeed & changeups',
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
const ALWAYS = ['Real grip photos, clean sources', 'A source on every claim']

const THESIS_ROWS = [
  {
    stamp: 'Survives',
    label: 'What modern baseball keeps well',
    text: 'Velocity, spin, movement, outcomes, and the public clips that catch a pitch after it has already left the hand.',
  },
  {
    stamp: 'Vanishes',
    label: 'What disappears first',
    text: 'Thumb pressure, hand size, seam feel, and the little variants that work for one arm and never fit another.',
  },
  {
    stamp: 'Filed',
    label: 'What Pitch Atlas preserves',
    text: 'The holdable grip first, then the shape language, then the source badge that says how solid the claim is.',
  },
]

/* The interactive tools, surfaced together so every one is one click from home.
   Each carries a `kind` that selects its visual preview plane. */
const TOOLS: { label: string; to: string; blurb: string; kind: ToolKind }[] = [
  { label: 'Shape Sandbox', to: '/sandbox', kind: 'dial', blurb: 'Turn the spin-axis clock and watch the shape language change: ride, drop, run, sweep.' },
  { label: 'The Shape Map', to: '/movement-map', kind: 'quadrant', blurb: 'Every filed pitch on one catcher’s-eye field, grouped by direction and character.' },
  { label: 'Compare two pitches', to: '/compare', kind: 'tunnel', blurb: 'Overlay any two pitches to read the shared window and late shape split.' },
  { label: 'Compare two grips', to: '/grips', kind: 'grips', blurb: 'Two grips under one arm slot — the deception of same release, different grip.' },
]

type ToolKind = 'dial' | 'quadrant' | 'tunnel' | 'grips'

/* The tool preview planes: small, on-brand line schematics that say what each tool
   does before the visitor clicks. Cyan strokes on the void; decoration, not data. */
function ToolGlyph({ kind }: { kind: ToolKind }) {
  const stroke = 'var(--color-cyan)'
  const common = { fill: 'none', stroke, strokeWidth: 1.6, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const }
  return (
    <div
      className="relative h-16 w-full overflow-hidden rounded-md border border-cyan/20"
      style={{ background: 'radial-gradient(120% 140% at 80% -20%, color-mix(in srgb, var(--color-cyan) 12%, transparent), #08060e)' }}
      aria-hidden="true"
    >
      <svg viewBox="0 0 160 64" className="absolute inset-0 h-full w-full" preserveAspectRatio="xMidYMid meet">
        {kind === 'dial' && (
          <>
            <circle cx="48" cy="32" r="22" {...common} opacity={0.55} />
            {[0, 45, 90, 135, 180, 225, 270, 315].map((a) => {
              const r = (a * Math.PI) / 180
              return <path key={a} d={`M${48 + Math.cos(r) * 19} ${32 + Math.sin(r) * 19} L${48 + Math.cos(r) * 22} ${32 + Math.sin(r) * 22}`} {...common} opacity={0.5} />
            })}
            <path d="M48 32 L62 18" {...common} strokeWidth={2.1} />
            <circle cx="48" cy="32" r="2.6" fill={stroke} stroke="none" />
            <path d="M92 40 q22 -28 52 -10" {...common} />
            <circle cx="144" cy="30" r="3" fill={stroke} stroke="none" />
            <text x="92" y="54" fill="var(--color-bone-2)" style={{ font: '700 7px var(--font-mono)', letterSpacing: '0.12em' }}>SPIN AXIS</text>
          </>
        )}
        {kind === 'quadrant' && (
          <>
            <path d="M80 8 V56 M40 32 H120" {...common} strokeWidth={1} opacity={0.4} />
            <circle cx="80" cy="32" r="24" {...common} strokeWidth={1} opacity={0.3} />
            <path d="M80 32 q-20 -6 -30 -22" {...common} />
            <circle cx="50" cy="10" r="3.4" fill={stroke} stroke="none" />
            <path d="M80 32 q20 8 34 -2" {...common} opacity={0.65} stroke="var(--color-amber-bright)" />
            <circle cx="114" cy="30" r="3.4" fill="var(--color-amber-bright)" stroke="none" />
          </>
        )}
        {kind === 'tunnel' && (
          <>
            <path d="M14 32 q60 0 84 0" {...common} />
            <path d="M14 32 q60 0 84 18" {...common} stroke="var(--color-amber-bright)" />
            <path d="M98 32 q22 0 48 -14" {...common} />
            <path d="M98 50 q22 0 48 8" {...common} stroke="var(--color-amber-bright)" />
            <line x1="98" y1="16" x2="98" y2="58" {...common} strokeWidth={1} strokeDasharray="2 4" opacity={0.5} />
            <circle cx="146" cy="18" r="3" fill={stroke} stroke="none" />
            <circle cx="146" cy="58" r="3" fill="var(--color-amber-bright)" stroke="none" />
            <text x="84" y="12" fill="var(--color-bone-2)" style={{ font: '700 7px var(--font-mono)', letterSpacing: '0.1em' }}>SPLIT</text>
          </>
        )}
        {kind === 'grips' && (
          <>
            <path d="M80 10 L58 40 M80 10 L102 40" {...common} opacity={0.6} />
            <circle cx="80" cy="10" r="3" fill={stroke} stroke="none" />
            <circle cx="50" cy="46" r="13" {...common} />
            <path d="M44 41 q6 5 0 10 M56 41 q-6 5 0 10" {...common} strokeWidth={1.2} stroke="var(--color-seam-bright)" opacity={0.8} />
            <circle cx="110" cy="46" r="13" {...common} />
            <path d="M104 41 q6 5 0 10 M116 41 q-6 5 0 10" {...common} strokeWidth={1.2} stroke="var(--color-seam-bright)" opacity={0.8} />
          </>
        )}
      </svg>
    </div>
  )
}

/* One filed specimen, struck as a browsing row (not a second hero card). The specimen
   number ties the row to its card; the row carries the shape read and the source dot,
   and opens the full specimen. The `.rfx-entry` look matches the /repertoire directory. */
function SpecimenRow({ entry, accent }: { entry: PitchAtlasEntry; accent: string }) {
  const shape = entry.canonical.physics.shape
  const conf = shape.confidence
  const color = CONFIDENCE_COLOR[conf] ?? 'var(--color-ink-3)'
  return (
    <Link
      to={`/pitch/${entry.display.slug}`}
      className="rfx-entry is-filed"
      style={{ '--gc': accent } as CSSProperties}
      aria-label={`Open the ${entry.display.shortName} specimen`}
    >
      <span
        className="rfx-athletic rfx-skew flex-none text-[34px] leading-none"
        style={{ color: accent, WebkitTextStroke: '1px rgba(0,0,0,0.4)' }}
      >
        {entry.display.specimenNo}
      </span>
      <span className="min-w-0 flex-1">
        <span className="flex flex-wrap items-center gap-2">
          <span className="font-prose text-[15px] font-bold text-bone">{entry.display.shortName}</span>
          <span className="rounded-[4px] bg-[var(--gold)] px-1.5 py-0.5 font-mono text-[7.5px] uppercase tracking-[0.1em] text-[#2a1d05]">
            Filed
          </span>
        </span>
        <span className="mt-1 block font-mono text-[10px] uppercase tracking-[0.08em] text-bone-2">{shape.value}</span>
        <span className="mt-1.5 inline-flex items-center gap-1.5 font-mono text-[9px] uppercase tracking-[0.1em] text-bone-2">
          <i className="rfx-dot" style={{ background: color, color, width: 7, height: 7 }} />
          {CONFIDENCE_META[conf].label}
        </span>
      </span>
      <span className="flex-none self-center font-mono text-[9px] uppercase tracking-[0.1em]" style={{ color: '#caa14a' }}>
        Open <span aria-hidden="true">→</span>
      </span>
    </Link>
  )
}

/* Decorative inset corner mark for the rule sheet — a stamped-document frame. */
function Corner({ at }: { at: 'tl' | 'tr' | 'bl' | 'br' }) {
  const pos: Record<typeof at, string> = {
    tl: 'left-2 top-2 border-l border-t',
    tr: 'right-2 top-2 border-r border-t',
    bl: 'left-2 bottom-2 border-l border-b',
    br: 'right-2 bottom-2 border-r border-b',
  }
  return <span aria-hidden="true" className={`pointer-events-none absolute h-3.5 w-3.5 border-seam-bright/40 ${pos[at]}`} />
}

/*
  The Atlas home, struck in the refractor language — now a variety ladder, not one
  card form repeated down the page. Each section introduces a new job in its own
  visual form: the hero's one full specimen card → a source-confidence scale → the
  index gateway and a family-grouped browsing system → tool preview planes → a
  stamped rule sheet → the two side wings. The full specimen card appears only at the
  hero and at one selected spotlight. The philosophy lives once, on /sources.
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

  const filedGroups = (['fastball', 'breaking', 'offspeed'] as PitchFamily[])
    .map((fam) => ({ fam, label: PITCH_FAMILY_LABEL[fam], entries: PITCHES.filter((p) => p.canonical.family === fam) }))
    .filter((g) => g.entries.length > 0)
  /* One selected specimen, crop-spotlit in among the browsing rows — a breaking ball,
     visually distinct from the hero's gold four-seam, so the card form returns once. */
  const spotlight = PITCHES.find((p) => p.canonical.family === 'breaking')
  /* The mini-ledger example for the source scale: a real filed reading wearing its
     real badge, so the model shows itself in practice rather than asserting. */
  const ref = PITCHES[0]
  const refShape = ref.canonical.physics.shape
  const refConf = refShape.confidence

  return (
    <>
      <HomeHero featured={PITCHES[0]} />

      <section className="border-t border-bone/10">
        <div className="mx-auto grid max-w-[1320px] grid-cols-1 gap-8 px-5 py-16 md:grid-cols-12 md:gap-12 md:px-8 md:py-20">
          <div className="md:col-span-5">
            <p className="rfx-skick">Why it exists</p>
            <h2 className="rfx-stitle mt-3 max-w-[15ch] text-[clamp(28px,5vw,56px)]">
              A grip disappears faster than a <span className="rfx-chrome-text">box score</span>.
            </h2>
            <p className="mt-4 max-w-[48ch] text-[15px] leading-relaxed text-bone-2">
              A dashboard can tell you what the ball did. A coach can show a drill. A clip can catch
              one grip for ten seconds. Pitch Atlas is for the part that usually vanishes: where the
              fingers sat, what the pitcher felt, and what the source actually proves.
            </p>
            <p className="mt-4 max-w-[46ch] text-[15px] leading-relaxed text-bone-2">
              It is not a correction engine. It is a place where credible variants can stand next to
              each other without pretending one hand owns the truth.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link
                to="/about"
                className="inline-flex items-center gap-2 rounded-md px-5 py-3 font-mono text-sm font-bold uppercase tracking-wide text-[#06121b] transition-transform active:translate-y-px"
                style={{ background: 'var(--color-cyan)', boxShadow: '0 6px 24px -8px var(--color-cyan)' }}
              >
                Read why it exists <span aria-hidden="true">→</span>
              </Link>
              <Link
                to="/sources"
                className="inline-flex items-center gap-2 rounded-md border border-bone/30 px-5 py-3 font-mono text-sm uppercase tracking-wide text-bone transition-colors hover:border-bone"
              >
                Read the source model <span aria-hidden="true">→</span>
              </Link>
            </div>
          </div>

          <div className="md:col-span-7">
            <div className="border-t border-bone/10">
              {THESIS_ROWS.map((row, i) => (
                <div
                  key={row.label}
                  className="grid gap-4 border-b border-bone/10 py-5 sm:grid-cols-[7.25rem_1fr]"
                >
                  <span
                    className="h-fit w-fit rounded border px-2 py-1 font-mono text-[9px] font-bold uppercase tracking-[0.12em]"
                    style={{
                      borderColor: i === 1 ? 'color-mix(in srgb, var(--color-seam-bright) 55%, transparent)' : 'color-mix(in srgb, var(--color-cyan) 50%, transparent)',
                      color: i === 1 ? 'var(--color-seam-bright)' : 'var(--color-cyan)',
                      transform: `rotate(${i === 1 ? -2 : 2}deg)`,
                    }}
                  >
                    {row.stamp}
                  </span>
                  <div>
                    <h3 className="rfx-athletic rfx-skew text-bone" style={{ fontSize: 'clamp(20px,3vw,30px)' }}>
                      {row.label}
                    </h3>
                    <p className="mt-2 max-w-[58ch] text-[14px] leading-relaxed text-bone-2">{row.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ACT 02 — the model, as a descending source-confidence scale (not five equal boxes). */}
      <section className="border-t border-bone/10">
        <div className="mx-auto max-w-[1320px] px-5 py-16 md:grid md:grid-cols-12 md:gap-12 md:px-8 md:py-20">
          <div className="md:col-span-5">
            <p className="rfx-skick">The model</p>
            <h2 className="rfx-stitle mt-3 max-w-[14ch] text-[clamp(28px,5vw,54px)]">
              Sourced, <span className="rfx-chrome-text">not corrected</span>.
            </h2>
            <p className="mt-4 max-w-[44ch] text-[15px] leading-relaxed text-bone-2">
              A pitch can be thrown a dozen credible ways. The atlas does not pick a winner. It records
              what is known, attributes it, and labels how confident the source is. Official tracking
              context can support a prose claim; biography facts stay when real; pitch shape is never
              padded with borrowed gauges.
            </p>
          </div>

          <div className="relative mt-9 md:col-span-7 md:mt-0">
            {/* the source rail: a gauge from official green down to flagged sand */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute bottom-9 left-[10px] top-1.5 w-[3px] rounded-full"
              style={{
                background:
                  'linear-gradient(180deg, var(--color-ok-bright), var(--color-amber-bright) 58%, var(--color-sand-bright))',
                opacity: 0.7,
              }}
            />
            <ol className="flex flex-col gap-4">
              {LADDER.map(({ tier, rank }, i) => {
                const color = CONFIDENCE_COLOR[tier] ?? 'var(--color-ink-3)'
                const size = 15 - i * 1.6
                return (
                  <li key={tier} className="grid grid-cols-[22px_1fr_auto] items-start gap-3.5">
                    <span className="relative z-10 mt-1 flex justify-center">
                      <i
                        className="rfx-dot"
                        style={{ background: color, color, width: size, height: size, opacity: 1 - i * 0.08 }}
                      />
                    </span>
                    <span style={{ opacity: 1 - i * 0.06 }}>
                      <span className="block font-prose text-sm font-bold uppercase tracking-[0.02em] text-bone">
                        {CONFIDENCE_META[tier].label}
                      </span>
                      <span className="mt-0.5 block text-[12.5px] leading-snug text-bone-2">
                        {CONFIDENCE_META[tier].meaning}
                      </span>
                    </span>
                    <span className="mt-1 font-mono text-[9px] uppercase tracking-[0.1em]" style={{ color }}>
                      {rank}
                    </span>
                  </li>
                )
              })}
            </ol>

            {/* mini ledger: one real filed reading, wearing its real badge */}
            <div className="mt-6 flex items-center gap-4 rounded-xl border border-bone/12 bg-[#0e0c14] px-4 py-3">
              <span className="rfx-athletic rfx-skew flex-none text-bone" style={{ fontSize: 30, WebkitTextStroke: '1px rgba(0,0,0,0.4)' }}>
                Shape
              </span>
              <span className="min-w-0 flex-1">
                <span className="block font-mono text-[10px] uppercase tracking-[0.08em] text-bone-2">
                  {ref.display.shortName} · {refShape.value}
                </span>
                <span className="mt-1 inline-flex items-center gap-1.5 font-mono text-[9px] uppercase tracking-[0.1em] text-bone-2">
                  <i className="rfx-dot" style={{ background: CONFIDENCE_COLOR[refConf], color: CONFIDENCE_COLOR[refConf], width: 7, height: 7 }} />
                  {CONFIDENCE_META[refConf].label}
                </span>
              </span>
              <span className="flex-none text-right font-mono text-[9px] uppercase leading-tight tracking-[0.1em] text-ink-3">
                Every claim
                <br />
                wears its badge
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ACT 05 + 03 + 04 — the index: front-door gateway first, then a family-grouped browsing system. */}
      <section id="index" className="scroll-mt-20 border-t border-bone/10 pt-16 md:pt-20">
        <div className="mx-auto max-w-[1320px] px-5 md:px-8">
          <p className="rfx-skick">The Pitch Index</p>
          <h2 className="rfx-athletic rfx-skew rfx-stroke mt-3 text-bone" style={{ fontSize: 'clamp(30px,5vw,58px)' }}>
            Start at the <span className="rfx-chrome-text">front door</span>.
          </h2>
          <p className="mt-3 max-w-[62ch] text-[15px] leading-relaxed text-bone-2">
            Every accepted pitch by family — the filed specimens you can open below, plus the honest edges in
            the full index: an alias, an illusion, a colloquialism that is not a pitch, and the banned
            doctored balls.
          </p>

          {/* ACT 05: the gateway — family chips do the routing, before any stack of cards */}
          <div className="mt-6 flex flex-wrap items-center gap-2.5">
            {REPERTOIRE_FAMILIES.map((f) => {
              const accent = FAMILY_ACCENT[f.family]
              return (
                <Link
                  key={f.family}
                  to="/repertoire"
                  className="group inline-flex items-center gap-2.5 rounded-full border px-4 py-2.5 transition-colors"
                  style={{
                    borderColor: `color-mix(in srgb, ${accent} 45%, transparent)`,
                    background: `color-mix(in srgb, ${accent} 10%, transparent)`,
                  }}
                >
                  <span className="font-mono text-[11px] uppercase tracking-[0.1em] text-bone">{f.label}</span>
                  <b className="rfx-athletic rfx-skew text-[17px] leading-none" style={{ color: accent }}>
                    {repertoireByFamily(f.family).length}
                  </b>
                </Link>
              )
            })}
            <Link
              to="/repertoire"
              className="inline-flex items-center gap-2 rounded-full px-4 py-2.5 font-mono text-[11px] font-bold uppercase tracking-[0.1em] text-[#06121b] transition-transform active:translate-y-px"
              style={{ background: 'var(--color-cyan)', boxShadow: '0 6px 20px -10px var(--color-cyan)' }}
            >
              Open the full index <span aria-hidden="true">→</span>
            </Link>
          </div>
        </div>

        {/* ACT 03 + 04: the filed set as a browsing system, grouped by family, one card crop interleaved */}
        <div className="mx-auto mt-11 max-w-[1320px] px-5 md:px-8">
          <p className="mono-label-stage">The filed set · {PITCHES.length} specimens you can open</p>
          {filedGroups.map((g, gi) => {
            const accent = FAMILY_ACCENT[g.fam]
            return (
              <div key={g.fam} className="mt-7">
                <div
                  className="mb-4 flex items-baseline gap-3.5 border-b pb-2.5"
                  style={{ borderColor: `color-mix(in srgb, ${accent} 36%, transparent)` }}
                >
                  <h3 className="rfx-athletic rfx-skew text-[clamp(20px,3.4vw,30px)]" style={{ color: accent }}>
                    {g.label}
                  </h3>
                  <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-ink-3">
                    {g.entries.length} filed
                  </span>
                </div>
                <div className="grid gap-[11px] [grid-template-columns:repeat(auto-fill,minmax(min(300px,100%),1fr))]">
                  {g.entries.map((e) => (
                    <SpecimenRow key={e.display.slug} entry={e} accent={accent} />
                  ))}
                </div>

                {/* one selected specimen, crop-spotlit after the first family — the card form returns once */}
                {gi === 0 && spotlight ? (
                  <div className="mt-6 grid items-center gap-5 rounded-2xl border border-bone/12 bg-[#0b0910] p-5 sm:grid-cols-[auto_1fr] sm:gap-7 md:p-7">
                    <div className="mx-auto w-full max-w-[clamp(180px,52vw,224px)] sm:mx-0">
                      <PitchSpecimenCard entry={spotlight} maxWidth={224} />
                    </div>
                    <div>
                      <p className="rfx-skick">A selected specimen</p>
                      <h4 className="rfx-athletic rfx-skew mt-2 text-bone" style={{ fontSize: 'clamp(22px,3.2vw,32px)' }}>
                        Open one and the full card unfolds.
                      </h4>
                      <p className="mt-2.5 max-w-[48ch] text-[14px] leading-relaxed text-bone-2">
                        Every filed row above opens a specimen like this: the real grip in the window,
                        the shape read, and the source badge on the prose claim.
                        The card is the chase; the rows are how you find it.
                      </p>
                      <Link
                        to={`/pitch/${spotlight.display.slug}`}
                        className="mono-label-stage mt-4 inline-flex items-center gap-1.5 transition-colors hover:text-bone"
                      >
                        Open the {spotlight.display.shortName} <span aria-hidden="true">→</span>
                      </Link>
                    </div>
                  </div>
                ) : null}
              </div>
            )
          })}

          <Link
            to="/repertoire"
            className="mt-10 inline-flex items-center gap-2 rounded-md px-5 py-3 font-mono text-sm font-bold uppercase tracking-wide text-[#06121b] transition-transform active:translate-y-px"
            style={{ background: 'var(--color-cyan)', boxShadow: '0 6px 20px -8px var(--color-cyan)' }}
          >
            Open the full Pitch Index <span aria-hidden="true">→</span>
          </Link>
        </div>
      </section>

      {/* The field manual: the Learn wings as a numbered chapter index — a contents page, its own form. */}
      <section className="border-t border-bone/10">
        <div className="mx-auto grid max-w-[1320px] grid-cols-1 gap-10 px-5 py-16 md:grid-cols-12 md:gap-12 md:px-8 md:py-20">
          <div className="md:col-span-5 lg:col-span-4">
            <p className="mono-label-stage">The field manual</p>
            <h2 className="rfx-athletic rfx-skew mt-3 text-bone" style={{ fontSize: 'clamp(26px,4vw,44px)' }}>
              Not just what each pitch is — how the craft works underneath.
            </h2>
            <p className="mt-4 max-w-[46ch] text-base leading-relaxed text-bone-2">
              Ten sourced chapters: how the body creates timing, how a pitch gets built, how pitches work
              together, and the arm-health and youth reality beneath all of it.
            </p>
            <Link
              to="/learn"
              className="mt-7 inline-flex items-center gap-2 rounded-md border border-bone/25 px-5 py-3 font-mono text-sm uppercase tracking-wide text-bone transition-colors hover:border-bone"
            >
              Open the field manual <span aria-hidden="true">→</span>
            </Link>
          </div>

          <ol className="border-t border-bone/10 md:col-span-7 lg:col-span-8">
            {WINGS.map((w, i) => (
              <li key={w.slug}>
                <Link
                  to={`/learn/${w.slug}`}
                  className="group grid grid-cols-[2.25rem_1fr] items-baseline gap-x-4 border-b border-bone/10 py-4 transition-colors hover:bg-bone/[0.03] md:gap-x-6"
                >
                  <span className="font-mono text-sm tabular-nums text-ink-3 transition-colors group-hover:text-cyan">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <span className="min-w-0">
                    <span
                      className="rfx-athletic rfx-skew block text-bone transition-colors group-hover:text-cyan"
                      style={{ fontSize: '20px' }}
                    >
                      {w.navLabel || w.title}
                    </span>
                    <span className="mt-1 block max-w-[64ch] text-[13.5px] leading-relaxed text-bone-2 md:line-clamp-2">
                      {w.summary}
                    </span>
                  </span>
                </Link>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ACT 06 — the tools, each with its own visual preview plane. */}
      <section className="border-t border-bone/10">
        <div className="mx-auto max-w-[1320px] px-5 py-16 md:px-8 md:py-20">
          <p className="mono-label-stage">The tools</p>
          <h2 className="rfx-athletic rfx-skew mt-3 text-bone" style={{ fontSize: 'clamp(26px,4vw,44px)' }}>
            The craft map, made playable.
          </h2>
          <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {TOOLS.map((t) => (
              <Link
                key={t.to}
                to={t.to}
                className="group rounded-xl border border-bone/12 bg-[#0e0c14] p-4 transition-colors hover:border-cyan/45"
              >
                <ToolGlyph kind={t.kind} />
                <p className="rfx-athletic rfx-skew mt-3.5 text-bone" style={{ fontSize: '19px' }}>{t.label}</p>
                <p className="mt-1.5 text-[13px] leading-relaxed text-bone-2">{t.blurb}</p>
                <span className="mono-label-stage mt-3 inline-block transition-colors group-hover:text-bone">Open →</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ACT 07 — the honesty contract, as a stamped rule sheet / label wall. */}
      <section className="border-t border-bone/10">
        <div className="mx-auto max-w-[1320px] px-5 py-16 md:px-8 md:py-20">
          <p className="rfx-skick">The honesty contract</p>
          <h2 className="rfx-stitle mt-3 max-w-[16ch] text-[clamp(26px,4vw,44px)]">
            What we will <span className="rfx-chrome-text">never fake</span>.
          </h2>
          <p className="mt-4 max-w-[58ch] text-[15px] leading-relaxed text-bone-2">
            The foil is decoration. The provenance is the point. These lines are load-bearing — in the
            product copy, the data model, and the community floor in equal measure.
          </p>

          <div className="relative mt-8 overflow-hidden rounded-2xl border border-bone/15 bg-[#0b0910] p-5 md:p-8">
            <Corner at="tl" />
            <Corner at="tr" />
            <Corner at="bl" />
            <Corner at="br" />

            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-dashed border-bone/15 pb-3">
              <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-bone-2">
                Rule sheet · filed &amp; stamped
              </span>
              <span className="inline-block rotate-[-3deg] rounded border border-seam-bright/60 px-2 py-0.5 font-mono text-[9px] uppercase tracking-[0.12em] text-seam-bright">
                On the record
              </span>
            </div>

            <div className="mt-5 grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
              {NEVER.map((item, i) => (
                <div
                  key={item}
                  className="flex items-center gap-3 rounded-md border px-3 py-2.5"
                  style={{
                    borderColor: 'color-mix(in srgb, var(--color-seam-bright) 26%, transparent)',
                    background: 'color-mix(in srgb, var(--color-seam-bright) 6%, transparent)',
                  }}
                >
                  <span
                    className="flex-none rounded-[3px] border border-seam-bright/70 px-1.5 py-0.5 font-mono text-[8.5px] font-bold uppercase tracking-[0.08em] text-seam-bright"
                    style={{ transform: `rotate(${i % 2 ? 2 : -2}deg)` }}
                  >
                    No
                  </span>
                  <span className="font-prose text-[13.5px] font-semibold leading-snug text-bone-2">{item}</span>
                </div>
              ))}
            </div>

            <div className="mt-3 grid grid-cols-1 gap-2.5 sm:grid-cols-2">
              {ALWAYS.map((item, i) => (
                <div
                  key={item}
                  className="flex items-center gap-3 rounded-md border px-3 py-2.5"
                  style={{
                    borderColor: 'color-mix(in srgb, var(--color-ok-bright) 32%, transparent)',
                    background: 'color-mix(in srgb, var(--color-ok-bright) 7%, transparent)',
                  }}
                >
                  <span
                    className="flex-none rounded-[3px] border border-ok-bright/70 px-1.5 py-0.5 font-mono text-[8.5px] font-bold uppercase tracking-[0.08em] text-ok-bright"
                    style={{ transform: `rotate(${i % 2 ? -2 : 2}deg)` }}
                  >
                    Always
                  </span>
                  <span className="font-prose text-[13.5px] font-semibold leading-snug text-bone">{item}</span>
                </div>
              ))}
            </div>
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
