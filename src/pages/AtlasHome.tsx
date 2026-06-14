import { Link } from 'react-router-dom'
import { useSeoMeta } from '@unhead/react'
import { PITCHES } from '../data/pitches'
import { WINGS } from '../data/knowledge'
import { CONFIDENCE_META, type Claim, type ClaimConfidence, type PitchFamily } from '../data/types'
import { REPERTOIRE, REPERTOIRE_FAMILIES, repertoireByFamily } from '../data/repertoire'
import { LOST_PITCHES, lostPitchBySlug } from '../data/lost-pitches'
import { CRAFTSMEN } from '../data/craftsmen'
import { DOCUMENTATION_META, type DocumentationTier } from '../data/types'
import { allSources, latestRetrievedAt } from '../data/sources'
import { gripEntryFor } from '../data/grips'
import { asOfDate } from '../lib/format'
import { INDEX_SCOPE } from '../lib/index-scope'
import { SITE } from '../config/site'
import { canonicalUrl, ogImageMeta } from '../lib/seo'
import { HomeHero } from '../components/sections/HomeHero'
import { BinderSheet, PocketCard, FillerCard } from '../components/sections/BinderSheet'
import { WaxPack, WaxPackIdleStyles, type WaxPackTool } from '../components/sections/WaxPack'
import { CardBackPanel } from '../components/refractor/CardBackPanel'
import { ClaimCard } from '../components/provenance/ClaimCard'
import { Reveal } from '../components/motion/Reveal'
import { SeamGuide } from '../components/motion/SeamGuide'

/*
  The Atlas home as a collection handled on the warm field. The pull (hero) is
  the one coal scene — foil viewed under a lamp — and the page hands the card
  down into daylight: the leather binder the set rests in, the cream card backs
  where the data lives — grading scale, set checklist, rule sheet — with the wax
  packs and the chase-card inserts between them. Scorebook paper is the table;
  nothing here is a generic panel.
*/

/* The provenance ladder: all seven canonical tiers, rendered from the real
   confidence model — including the two rungs the honest gaps wear. */
const LADDER: { tier: ClaimConfidence; rank: string }[] = [
  { tier: 'official-data', rank: 'highest' },
  { tier: 'pitcher-own-words', rank: 'firsthand' },
  { tier: 'coach-observed', rank: 'firsthand' },
  { tier: 'reputable-analysis', rank: 'cited' },
  { tier: 'secondhand-attributed', rank: 'flagged' },
  { tier: 'community-firsthand', rank: 'safeguarded' },
  { tier: 'unverified', rank: 'the gap' },
]

/* tier inks for the cream card back — the bright void dots fail contrast on
   paper, so the grading card prints in ink densities instead. */
const TIER_INK: Record<ClaimConfidence, string> = {
  'official-data': '#1E7A4A',
  'pitcher-own-words': '#2C5A8C',
  'coach-observed': '#2C5A8C',
  'reputable-analysis': '#8A6118',
  'secondhand-attributed': '#6E5E3A',
  'community-firsthand': '#6E5E3A',
  unverified: '#6E675A',
}

/* binder tab inks — collegiate jewels printed at ink density for the cream field */
const FAMILY_ACCENT: Record<string, string> = {
  fastball: '#2C5A8C',
  offspeed: '#2F5D46',
  breaking: '#6E2B35',
  specialty: '#8A6B24',
  banned: '#A8232F',
}

/* the filed set in binder order: family blocks read left-to-right, top-to-bottom */
const FAMILY_ORDER: PitchFamily[] = ['fastball', 'breaking', 'offspeed']

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

/* The three beats, each anchored to a REAL file in the data — a surviving
   pitch, a lost pitch, a filed specimen — never an invented example. If a
   referenced entry ever leaves the data, its beat drops the card rather than
   pointing at nothing. */
const SURVIVOR = REPERTOIRE.find((e) => e.id === 'sweeper')
const VANISHED = lostPitchBySlug('hilton-smith-curveball')
const FILED_REF = PITCHES[0]

/* the filed beat's small photo: the real grip poster from the library, resolved
   by slug — shown only when the asset truly exists, never a stand-in render. */
const FILED_GRIP = gripEntryFor(FILED_REF.display.slug)
const FILED_THUMB = FILED_GRIP?.clip
  ? { src: FILED_GRIP.clip.poster, alt: FILED_GRIP.clip.alt }
  : undefined

interface ThesisRow {
  stamp: string
  ink: string
  label: string
  text: string
  example?: { subject: string; to: string; claim: Claim<string>; thumb?: { src: string; alt: string } }
}

const THESIS_ROWS: ThesisRow[] = [
  {
    stamp: 'Survives',
    ink: '#1F3A5F',
    label: 'What modern baseball keeps well',
    text: 'Velocity, spin, movement, outcomes, and the public clips that catch a pitch after it has already left the hand.',
    example: SURVIVOR?.filedSlug
      ? {
          subject: `${SURVIVOR.name} · alive in today's game`,
          to: `/pitch/${SURVIVOR.filedSlug}`,
          claim: SURVIVOR.movement,
        }
      : undefined,
  },
  {
    stamp: 'Vanishes',
    ink: '#6E2B35',
    label: 'What disappears first',
    text: 'Thumb pressure, hand size, seam feel, and the little variants that work for one arm and never fit another.',
    example: VANISHED
      ? {
          subject: `${VANISHED.name} · the grip went unrecorded`,
          to: `/lost-pitches/${VANISHED.slug}`,
          claim: VANISHED.what,
        }
      : undefined,
  },
  {
    stamp: 'Filed',
    ink: '#2F5D46',
    label: 'What Pitch Atlas preserves',
    text: 'The holdable grip first, then the shape language, then the source badge that says how solid the claim is.',
    example: {
      subject: `${FILED_REF.display.shortName} · filed, grip first`,
      to: `/pitch/${FILED_REF.display.slug}`,
      claim: FILED_REF.canonical.grip,
      thumb: FILED_THUMB,
    },
  },
]

/* the colophon figures: the registry counted, the newest check dated — both
   derived from sources.ts at build, never typed by hand. */
const REGISTRY_COUNT = allSources().length
const REGISTRY_AS_OF = asOfDate(latestRetrievedAt(allSources()))

/* the two doors read from the real wings: the hall's actual names, and the
   archive's actual documentation-tier counts. Derived, never hand-listed. */
const HALL_NAMES = CRAFTSMEN.filter((c) => c.kind === 'craftsman').map((c) => c.name)
const TIER_ORDER: DocumentationTier[] = ['documented', 'partial', 'legend']
const ARCHIVE_TIERS = TIER_ORDER.map((tier) => ({
  tier,
  label: DOCUMENTATION_META[tier].label,
  count: LOST_PITCHES.filter((p) => p.tier === tier).length,
})).filter((t) => t.count > 0)

/* the four tools as sealed packs, each printed in one collegiate jewel ink */
const TOOLS: WaxPackTool[] = [
  { label: 'Shape Sandbox', to: '/sandbox', kind: 'dial', ink: '#1F3A5F', blurb: 'Turn the spin-axis clock and watch the shape language change: ride, drop, run, sweep.' },
  { label: 'The Shape Map', to: '/movement-map', kind: 'quadrant', ink: '#2F5D46', blurb: 'Every filed pitch on one catcher’s-eye field, grouped by direction and character.' },
  { label: 'Compare two pitches', to: '/compare', kind: 'tunnel', ink: '#6E2B35', blurb: 'Overlay any two pitches to read the shared window and late shape split.' },
  { label: 'Compare two grips', to: '/grips', kind: 'grips', ink: '#8A6B24', blurb: 'Two grips under one arm slot — the deception of same release, different grip.' },
]

export function AtlasHome() {
  useSeoMeta({
    title: `${SITE.siteName}: The Living Field Manual for Pitching Grips`,
    description:
      'A searchable atlas of every pitch — grip, movement, and the craftsmen who defined it. Every claim labeled by its source. Sourced, not corrected.',
    ogTitle: `${SITE.siteName}: the living field manual for pitching grips`,
    ogDescription: 'Every pitch, gripped and sourced. Sourced, not corrected.',
    ogUrl: canonicalUrl('/'),
    ...ogImageMeta('home', `${SITE.siteName} — every pitch, gripped and sourced`),
  })

  /* the filed set, in binder order: family blocks laid into the pockets */
  const filed = FAMILY_ORDER.flatMap((fam) => PITCHES.filter((p) => p.canonical.family === fam))
  const sheetOne = filed.slice(0, 9)
  const sheetTwo = filed.slice(9)

  /* the mini-ledger example for the grading card: a real filed reading wearing
     its real badge, so the model shows itself instead of asserting. */
  const ref = PITCHES[0]
  const refShape = ref.canonical.physics.shape
  const refConf = refShape.confidence

  return (
    <>
      <HomeHero featured={PITCHES[0]} />

      {/* ── THE BINDER: the filed set in nine-pocket sheets ── */}
      <section id="index" className="scroll-mt-20 border-t border-leather/25">
        <div className="mx-auto max-w-[1320px] px-5 py-16 md:px-8 md:py-20">
          <div className="slab-head">
            <h2 style={{ fontSize: 'clamp(26px,4.6vw,46px)' }}>The Filed Set</h2>
            <span className="slab-count">
              {filed.length} specimens · {Math.ceil((filed.length + 6) / 9)} sheets
            </span>
          </div>

          <p className="mt-5 max-w-[62ch] text-[15px] leading-relaxed text-ink-2">
            Every accepted pitch by family — the filed specimens you can open below, plus the honest
            edges in the full index: an alias, an illusion, a colloquialism that is not a pitch, and
            the banned doctored balls. The full index holds {INDEX_SCOPE.shelfLabel}, plus{' '}
            {INDEX_SCOPE.lostNote} in the lost-pitches wing, one click away.
          </p>

          {/* binder tab dividers: the family gateways, in jewel ink */}
          <div className="mt-6 flex flex-wrap items-center gap-2.5">
            {REPERTOIRE_FAMILIES.map((f) => {
              const accent = FAMILY_ACCENT[f.family] ?? '#8A6B24'
              return (
                <Link
                  key={f.family}
                  to="/repertoire"
                  className="inline-flex items-center gap-2.5 rounded-t-lg border border-b-0 px-4 py-2.5 transition-colors"
                  style={{
                    borderColor: `color-mix(in srgb, ${accent} 45%, transparent)`,
                    background: `color-mix(in srgb, ${accent} 12%, transparent)`,
                  }}
                >
                  <span className="font-mono text-[10.5px] uppercase tracking-[0.1em] text-ink">{f.label}</span>
                  <b className="rfx-athletic text-[16px] leading-none" style={{ color: accent }}>
                    {repertoireByFamily(f.family).length}
                  </b>
                </Link>
              )
            })}
          </div>

          <div className="flex flex-col gap-8">
            <div>
              <p className="mb-2 mt-6 font-mono text-[9.5px] uppercase tracking-[0.18em] text-ink-3">Sheet 1 of 2</p>
              <BinderSheet label="Filed specimens, sheet one">
                {sheetOne.map((p) => (
                  <div className="pocket" key={p.display.slug}>
                    <PocketCard entry={p} />
                  </div>
                ))}
              </BinderSheet>
            </div>
            <div>
              <p className="mb-2 font-mono text-[9.5px] uppercase tracking-[0.18em] text-ink-3">Sheet 2 of 2</p>
              <BinderSheet label="Filed specimens, sheet two">
                {sheetTwo.map((p) => (
                  <div className="pocket" key={p.display.slug}>
                    <PocketCard entry={p} />
                  </div>
                ))}
                <div className="pocket">
                  <FillerCard to="/repertoire" label="Full Index" note="Every accepted pitch" />
                </div>
                <div className="pocket">
                  <FillerCard to="/softball" label="Softball Set" note="The fastpitch wing" />
                </div>
                <div className="pocket">
                  <FillerCard to="/lost-pitches" label="Lost Pitches" note="Grips history dropped" ghost />
                </div>
                <div className="pocket">
                  <FillerCard to="/learn" label="Field Manual" note="How the craft works" />
                </div>
                <div className="pocket">
                  <FillerCard to="/sandbox" label="Shape Sandbox" note="Turn the spin axis" />
                </div>
                {/* one empty sleeve: an incomplete page is a true thing about a living set */}
                <div className="pocket" aria-hidden="true">
                  <div style={{ aspectRatio: '5 / 7' }} />
                </div>
              </BinderSheet>
            </div>
          </div>

          <Link to="/repertoire" className="btn-foil mt-9">
            Open the full Pitch Index <span aria-hidden="true">→</span>
          </Link>
        </div>
      </section>

      {/* ── THE GRADING SCALE: thesis + provenance on the first cream card back ── */}
      <section className="border-t border-leather/25">
        <SeamGuide variant="tear" className="opacity-60" />
        <div className="mx-auto max-w-[1320px] px-5 py-16 md:px-8 md:py-20">
          <CardBackPanel>
            <div className="grid grid-cols-1 gap-10 md:grid-cols-12 md:gap-12">
              <div className="md:col-span-6">
                <p className="font-mono text-[10px] font-bold uppercase tracking-[0.2em]" style={{ color: 'var(--cb-gold-ink)' }}>
                  Why it exists
                </p>
                <h2
                  className="rfx-athletic mt-3 max-w-[16ch] text-[clamp(26px,4.6vw,46px)]"
                  style={{ color: 'var(--cb-navy)', lineHeight: 0.95 }}
                >
                  A grip disappears faster than a box score.
                </h2>
                <p className="mt-4 max-w-[52ch] text-[14.5px] leading-relaxed" style={{ color: 'var(--cb-ink-2)' }}>
                  A dashboard can tell you what the ball did. A coach can show a drill. A clip can
                  catch one grip for ten seconds. Pitch Atlas is for the part that usually vanishes:
                  where the fingers sat, what the pitcher felt, and what the source actually proves.
                </p>

                <div className="mt-6">
                  {THESIS_ROWS.map((row, i) => (
                    <Reveal key={row.label} delay={i * 110}>
                      <div className="cb-row grid gap-3 py-4 sm:grid-cols-[6.5rem_1fr]">
                        <span className="rfx-stamp h-fit w-fit" style={{ color: row.ink }}>
                          {row.stamp}
                        </span>
                        <div>
                          <h3 className="rfx-athletic text-[clamp(17px,2.4vw,22px)]" style={{ color: 'var(--cb-ink)' }}>
                            {row.label}
                          </h3>
                          <p className="mt-1.5 max-w-[56ch] text-[13.5px] leading-relaxed" style={{ color: 'var(--cb-ink-2)' }}>
                            {row.text}
                          </p>
                          {row.example ? (
                            <ClaimCard
                              className="mt-3"
                              subject={row.example.subject}
                              to={row.example.to}
                              claim={row.example.claim}
                              thumb={row.example.thumb}
                            />
                          ) : null}
                        </div>
                      </div>
                    </Reveal>
                  ))}
                </div>

                <div className="mt-7 flex flex-wrap gap-3">
                  <Link to="/about" className="btn-foil is-ink">
                    Read why it exists <span aria-hidden="true">→</span>
                  </Link>
                  <Link to="/sources" className="btn-foil is-ink">
                    The source model <span aria-hidden="true">→</span>
                  </Link>
                </div>
              </div>

              <div className="md:col-span-6">
                <div className="cb-rules">
                  <h3 style={{ fontSize: 'clamp(17px,2.2vw,22px)' }}>
                    The grading scale <span aria-hidden="true">★</span> sourced, not corrected
                  </h3>
                </div>
                <p className="mt-3 max-w-[52ch] text-[13.5px] leading-relaxed" style={{ color: 'var(--cb-ink-2)' }}>
                  A pitch can be thrown a dozen credible ways. The atlas does not pick a winner — it
                  records what is known, attributes it, and grades how confident the source is. All
                  seven rungs a visitor meets, top to bottom — including the two the honest gaps wear.
                </p>
                <ol className="ladder-rail mt-5">
                  {LADDER.map(({ tier, rank }) => {
                    const ink = TIER_INK[tier]
                    return (
                      <li key={tier} className="cb-row grid grid-cols-[14px_1fr_auto] items-start gap-3 py-3">
                        <i className="mt-1 inline-block h-2.5 w-2.5 rounded-full" style={{ background: ink }} />
                        <span>
                          <span className="block font-mono text-[11px] font-bold uppercase tracking-[0.08em]" style={{ color: 'var(--cb-ink)' }}>
                            {CONFIDENCE_META[tier].label}
                          </span>
                          <span className="mt-0.5 block text-[12.5px] leading-snug" style={{ color: 'var(--cb-ink-2)' }}>
                            {CONFIDENCE_META[tier].meaning}
                          </span>
                        </span>
                        <span className="mt-0.5 font-mono text-[9px] font-bold uppercase tracking-[0.12em]" style={{ color: ink }}>
                          {rank}
                        </span>
                      </li>
                    )
                  })}
                </ol>

                {/* mini ledger: one real filed reading, wearing its real grade */}
                <div
                  className="mt-5 flex items-center gap-4 rounded-md border px-4 py-3"
                  style={{ borderColor: 'var(--cb-line)', background: 'var(--cb-paper-2)' }}
                >
                  <span className="rfx-athletic flex-none" style={{ fontSize: 26, color: 'var(--cb-navy)' }}>
                    Shape
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block font-mono text-[10px] uppercase tracking-[0.08em]" style={{ color: 'var(--cb-ink-2)' }}>
                      {ref.display.shortName} · {refShape.value}
                    </span>
                    <span className="mt-1 inline-flex items-center gap-1.5 font-mono text-[9px] uppercase tracking-[0.1em]" style={{ color: TIER_INK[refConf] }}>
                      <i className="inline-block h-1.5 w-1.5 rounded-full" style={{ background: TIER_INK[refConf] }} />
                      {CONFIDENCE_META[refConf].label}
                    </span>
                  </span>
                  <span className="flex-none text-right font-mono text-[9px] uppercase leading-tight tracking-[0.1em]" style={{ color: 'var(--cb-ink-3)' }}>
                    Every claim
                    <br />
                    wears its badge
                  </span>
                </div>
              </div>
            </div>
          </CardBackPanel>
        </div>
      </section>

      {/* ── THE WAX PACKS: the tools, sealed ── */}
      <section className="border-t border-leather/25 bg-paper-2">
        <SeamGuide variant="tear" className="opacity-60" />
        <div className="mx-auto max-w-[1320px] px-5 py-16 md:px-8 md:py-20">
          <div className="slab-head">
            <h2 style={{ fontSize: 'clamp(26px,4.6vw,46px)' }}>The Tools</h2>
            <span className="slab-count">{TOOLS.length} sealed packs</span>
          </div>
          <p className="mt-4 max-w-[52ch] text-[15px] leading-relaxed text-ink-2">
            The craft map, made playable. Tear one open — every pack is one click from home.
          </p>
          <WaxPackIdleStyles />
          <div className="mt-9 grid grid-cols-2 gap-x-4 gap-y-6 md:gap-x-6 lg:grid-cols-4">
            {TOOLS.map((t) => (
              <WaxPack key={t.to} tool={t} />
            ))}
          </div>
        </div>
      </section>

      {/* ── THE SET CHECKLIST: the field manual on a card back ── */}
      <section className="border-t border-leather/25">
        <div className="mx-auto max-w-[1320px] px-5 py-16 md:px-8 md:py-20">
          <CardBackPanel>
            <div className="cb-rules justify-between">
              <h2 style={{ fontSize: 'clamp(16px,2.6vw,26px)' }}>
                Field manual <span aria-hidden="true">★</span> complete set checklist
              </h2>
              <span className="hidden font-mono text-[9px] uppercase tracking-[0.16em] sm:block" style={{ color: 'var(--cb-ink-3)' }}>
                {WINGS.length} of {WINGS.length} filed
              </span>
            </div>
            <p className="mt-3 max-w-[58ch] text-[13.5px] leading-relaxed" style={{ color: 'var(--cb-ink-2)' }}>
              Not just what each pitch is — how the craft works underneath. Ten sourced chapters,
              every one published and checked off.
            </p>
            <ol className="mt-5 grid grid-cols-2 gap-x-5 md:gap-x-10">
              {WINGS.map((w, i) => (
                <li key={w.slug} className="cb-row">
                  <Link
                    to={`/learn/${w.slug}`}
                    className="group flex items-baseline gap-2 py-2.5 transition-colors md:gap-3"
                  >
                    {/* the filled square is derived: this wing is in the data, so it is filed */}
                    <span className="font-mono text-[10px]" style={{ color: 'var(--cb-forest)' }} aria-hidden="true">
                      ■
                    </span>
                    <span className="font-mono text-[10px] tabular-nums" style={{ color: 'var(--cb-ink-3)' }}>
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <span className="min-w-0">
                      <span
                        className="block font-mono text-[10px] font-bold uppercase tracking-[0.06em] underline-offset-2 group-hover:underline md:text-[11.5px]"
                        style={{ color: 'var(--cb-navy)' }}
                      >
                        {w.navLabel || w.title}
                      </span>
                      <span className="mt-0.5 hidden text-[12px] leading-snug md:line-clamp-1" style={{ color: 'var(--cb-ink-2)' }}>
                        {w.summary}
                      </span>
                    </span>
                  </Link>
                </li>
              ))}
            </ol>
            <div className="mt-6">
              <Link to="/learn" className="btn-foil is-ink">
                Open the field manual <span aria-hidden="true">→</span>
              </Link>
            </div>
          </CardBackPanel>
        </div>
      </section>

      {/* ── THE DOORS: two entries, two temperatures. Warm lamplight into the
          hall; a still coal face into the archive. The light is the copy. ── */}
      <section className="border-t border-leather/25">
        <div className="mx-auto max-w-[1320px] px-5 py-16 md:px-8 md:py-20">
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <Link to="/craftsmen" className="door-craftsmen group">
              <p className="font-mono text-[10px] uppercase tracking-[0.18em]" style={{ color: '#D9B98A' }}>
                The hall · door one
              </p>
              <p className="rfx-athletic mt-3 text-[clamp(24px,3.4vw,34px)] text-bone">The Craftsmen</p>
              <p className="mt-2 max-w-[46ch] text-[14.5px] leading-relaxed text-bone-2">
                The arms that owned a pitch — and the one pitch that is a legend, not a person. Pull
                up a chair; every quote in here is real and carries its source.
              </p>
              <p className="mt-4 font-mono text-[9.5px] uppercase leading-relaxed tracking-[0.1em]" style={{ color: '#B89A6E' }}>
                {HALL_NAMES.join(' · ')}
              </p>
              <span className="mono-label mt-5 inline-block text-bone-2 transition-colors group-hover:text-bone">
                Step into the hall →
              </span>
            </Link>

            <Link to="/lost-pitches" className="door-lost group">
              <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-bone-2 opacity-80">
                The archive · door two
              </p>
              <p className="rfx-athletic mt-3 text-[clamp(24px,3.4vw,34px)] text-bone">
                Lost Pitches of the Negro Leagues
              </p>
              <p className="mt-2 max-w-[46ch] text-[14.5px] leading-relaxed text-bone-2">
                The statistics are being recovered; the technique mostly never will be. Every entry
                wears the tier its record can actually support — nothing in this wing is smoothed
                into legend or out of it.
              </p>
              <p className="mt-4 flex flex-wrap gap-x-4 gap-y-1 font-mono text-[9.5px] uppercase tracking-[0.1em] text-bone-2">
                {ARCHIVE_TIERS.map((t) => (
                  <span key={t.tier}>
                    {t.count} {t.label.toLowerCase()}
                  </span>
                ))}
              </p>
              <span className="mono-label mt-5 inline-block text-bone-2 transition-colors group-hover:text-bone">
                Enter the archive →
              </span>
            </Link>
          </div>
        </div>
      </section>

      {/* ── THE RULE SHEET: the honesty contract as card-back fine print ── */}
      <section className="border-t border-leather/25">
        <SeamGuide variant="tear" className="opacity-60" />
        <div className="mx-auto max-w-[1320px] px-5 py-16 md:px-8 md:py-20">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(280px,340px)] lg:items-end">
            <div>
              <p className="rfx-skick">The honesty contract</p>
              <h2 className="rfx-stitle mt-3 max-w-[16ch] text-[clamp(26px,4vw,44px)]">
                What we will <span className="text-seam">never fake</span>.
              </h2>
              <p className="mt-4 max-w-[58ch] text-[15px] leading-relaxed text-ink-2">
                The foil is decoration. The provenance is the point. These lines are load-bearing —
                in the product copy, the data model, and the community floor in equal measure.
              </p>
            </div>

            {/* the colophon slip: the registry counted and dated — figures derived
                from sources.ts, the same way every claim on the site is filed */}
            <aside
              className="claim-card texture-linen shadow-rest h-fit lg:-rotate-1"
              aria-label="Citation registry colophon"
            >
              <span className="rfx-stamp w-fit" style={{ color: '#8A6118' }}>
                Colophon
              </span>
              <p className="flex items-baseline gap-2.5">
                <b className="rfx-athletic text-[clamp(30px,3.4vw,40px)] leading-none text-ink">
                  {REGISTRY_COUNT}
                </b>
                <span className="text-[13px] leading-snug text-ink-2">
                  sources in the citation registry
                </span>
              </p>
              <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-ink-3">
                Last checked {REGISTRY_AS_OF} · not auto-refreshed
              </p>
              <Link
                to="/sources"
                className="link-stitch w-fit font-mono text-[10px] uppercase tracking-[0.14em] text-ink-2"
              >
                Open the registry <span aria-hidden="true">→</span>
              </Link>
            </aside>
          </div>

          <div className="mt-8">
            <CardBackPanel>
              <div className="cb-rules justify-between">
                <h3 style={{ fontSize: 'clamp(15px,2.4vw,24px)' }}>
                  Pitch Atlas <span aria-hidden="true">★</span> rule sheet
                </h3>
                <span className="rfx-stamp" style={{ color: 'var(--cb-burgundy)', transform: 'rotate(-3deg)' }}>
                  On the record
                </span>
              </div>

              <div className="mt-4 grid grid-cols-1 gap-x-10 sm:grid-cols-2">
                {NEVER.map((item, i) => (
                  <div key={item} className="cb-row flex items-center gap-3 py-2.5">
                    <span
                      className="rfx-stamp flex-none"
                      style={{ color: 'var(--cb-burgundy)', transform: `rotate(${i % 3 === 0 ? -2 : i % 3 === 1 ? 1.5 : -1}deg)` }}
                    >
                      Never
                    </span>
                    <span className="font-mono text-[11px] uppercase tracking-[0.04em]" style={{ color: 'var(--cb-ink)' }}>
                      {item}
                    </span>
                  </div>
                ))}
                {ALWAYS.map((item, i) => (
                  <div key={item} className="cb-row flex items-center gap-3 py-2.5">
                    <span
                      className="rfx-stamp flex-none"
                      style={{ color: 'var(--cb-forest)', transform: `rotate(${i % 2 ? 2 : -1.5}deg)` }}
                    >
                      Always
                    </span>
                    <span className="font-mono text-[11px] font-bold uppercase tracking-[0.04em]" style={{ color: 'var(--cb-ink)' }}>
                      {item}
                    </span>
                  </div>
                ))}
              </div>

              {/* the card-back legal block */}
              <div className="mt-6 border-t-2 pt-3" style={{ borderColor: 'var(--cb-ink)' }}>
                <p className="font-mono text-[9px] uppercase leading-relaxed tracking-[0.06em]" style={{ color: 'var(--cb-ink-3)' }}>
                  Every claim is labeled by its source, not declared right or wrong.{' '}
                  <Link to="/sources" className="underline underline-offset-2 hover:opacity-80" style={{ color: 'var(--cb-navy)' }}>
                    How a claim is filed →
                  </Link>
                </p>
                <p className="mt-2 flex items-center gap-2 font-mono text-[8.5px] uppercase tracking-[0.14em]" style={{ color: 'var(--cb-ink-3)' }}>
                  pitch-atlas.com
                  <span className="inline-block h-[9px] w-[9px] rotate-45 rounded-[2px]" style={{ background: 'var(--cb-ink)' }} aria-hidden="true" />
                  {SITE.sourcePrinciple}
                </p>
              </div>
            </CardBackPanel>
          </div>
        </div>
      </section>
    </>
  )
}
