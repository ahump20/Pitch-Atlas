import { useMemo, useState } from 'react'
import type { CSSProperties } from 'react'
import { Link } from 'react-router-dom'
import { useSeoMeta } from '@unhead/react'
import { BASIC_REPERTOIRE, REPERTOIRE_FAMILIES } from '../data/repertoire'
import { LOST_PITCHES } from '../data/lost-pitches'
import { PITCHES } from '../data/pitches'
import type { Claim, LostPitch, PitchAtlasEntry, RepertoireEntry, RepertoireFamily } from '../data/types'
import { CONFIDENCE_META, DOCUMENTATION_META } from '../data/types'
import { SITE } from '../config/site'

type FilterKey = 'all' | 'filed' | RepertoireFamily | 'basic' | 'lost'

type CardRecord =
  | {
      kind: 'filed'
      key: string
      to: string
      family: RepertoireFamily
      specimenNo: string
      name: string
      eyebrow: string
      summary: string
      metric: string
      metricLabel: string
      source: string
      confidence: string
      search: string
      gold: boolean
    }
  | {
      kind: 'basic'
      key: string
      to: string
      family: RepertoireFamily
      specimenNo: string
      name: string
      eyebrow: string
      summary: string
      metric: string
      metricLabel: string
      source: string
      confidence: string
      search: string
      gold: false
    }
  | {
      kind: 'lost'
      key: string
      to: string
      family: 'lost'
      specimenNo: string
      name: string
      eyebrow: string
      summary: string
      metric: string
      metricLabel: string
      source: string
      confidence: string
      search: string
      gold: false
    }

const FILTERS: { key: FilterKey; label: string }[] = [
  { key: 'all', label: 'All files' },
  { key: 'filed', label: 'Filed specimens' },
  { key: 'fastball', label: 'Fastballs' },
  { key: 'offspeed', label: 'Offspeed' },
  { key: 'breaking', label: 'Breaking' },
  { key: 'specialty', label: 'Specialty' },
  { key: 'banned', label: 'Banned' },
  { key: 'basic', label: 'Basic files' },
  { key: 'lost', label: 'Lost archive' },
]

const FAMILY_LABELS: Record<RepertoireFamily | 'lost', string> = {
  fastball: 'Fastball family',
  breaking: 'Breaking family',
  offspeed: 'Offspeed family',
  specialty: 'Specialty shelf',
  banned: 'Banned shelf',
  lost: 'Lost archive',
}

const foilStyle: CSSProperties = {
  background:
    'linear-gradient(115deg, #ff2d6e, #ff8a3c, #ffe14d, #46ff9c, #33e0ff, #6b7bff, #c44bff, #ff2d6e)',
}

const goldStyle: CSSProperties = {
  background:
    'linear-gradient(150deg, #5a3d12, #caa14a 22%, #fff0c2 38%, #b8893a 54%, #f4d98a 70%, #7a571f 90%)',
}

function sourceLabel(claim: Claim<string>): string {
  if (claim.source) return claim.source.label
  return claim.note ?? 'Source note unavailable'
}

function filedRecord(entry: PitchAtlasEntry, index: number): CardRecord {
  const primary = entry.canonical.physics.primaryBreak
  const source = sourceLabel(primary.claim)
  const confidence = CONFIDENCE_META[primary.claim.confidence].label
  const search = [
    entry.canonical.name,
    entry.display.shortName,
    entry.display.heroSub,
    entry.display.heroIntro,
    entry.canonical.family,
    primary.label,
    primary.claim.value,
    entry.canonical.grip.value,
  ]
    .join(' ')
    .toLowerCase()

  return {
    kind: 'filed',
    key: entry.display.slug,
    to: `/pitch/${entry.display.slug}`,
    family: entry.canonical.family,
    specimenNo: entry.display.specimenNo,
    name: entry.canonical.name,
    eyebrow: FAMILY_LABELS[entry.canonical.family],
    summary: entry.display.heroIntro,
    metric: primary.claim.value,
    metricLabel: primary.label,
    source,
    confidence,
    search,
    gold: index === 0,
  }
}

function basicRecord(entry: RepertoireEntry): CardRecord {
  const source = sourceLabel(entry.movement)
  const confidence = CONFIDENCE_META[entry.movement.confidence].label
  const search = [
    entry.name,
    entry.family,
    entry.status,
    entry.aka?.join(' '),
    entry.velocity,
    entry.notableThrowers,
    entry.grip.value,
    entry.movement.value,
    entry.plain,
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase()

  return {
    kind: 'basic',
    key: entry.id,
    to: `/repertoire/${entry.id}`,
    family: entry.family,
    specimenNo: 'B',
    name: entry.name,
    eyebrow: `${FAMILY_LABELS[entry.family]} · ${entry.status.replace('-', ' ')}`,
    summary: entry.plain ?? entry.movement.value,
    metric: entry.velocity ?? entry.status.replace('-', ' '),
    metricLabel: entry.velocity ? 'Velocity band' : 'Status',
    source,
    confidence,
    search,
    gold: false,
  }
}

function lostRecord(pitch: LostPitch): CardRecord {
  const doc = DOCUMENTATION_META[pitch.tier]
  const search = [pitch.name, pitch.kind, pitch.era, pitch.tier, pitch.tagline, pitch.intro]
    .join(' ')
    .toLowerCase()

  return {
    kind: 'lost',
    key: pitch.slug,
    to: `/lost-pitches/${pitch.slug}`,
    family: 'lost',
    specimenNo: pitch.specimenNo,
    name: pitch.name,
    eyebrow: `${doc.label} · ${pitch.era}`,
    summary: pitch.tagline,
    metric: pitch.kind === 'pitcher' ? 'The arm' : pitch.kind === 'doctored' ? 'Doctored family' : 'Lost pitch',
    metricLabel: 'Archive type',
    source: doc.meaning,
    confidence: doc.label,
    search,
    gold: false,
  }
}

function useCards() {
  return useMemo(() => {
    const filed = PITCHES.map(filedRecord)
    const basic = BASIC_REPERTOIRE.map(basicRecord)
    const lost = LOST_PITCHES.map(lostRecord)
    return [...filed, ...basic, ...lost]
  }, [])
}

function StatPlate({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-sm border border-bone/10 bg-bone/[0.04] px-4 py-3">
      <p className="mono-label-stage text-powder">{label}</p>
      <p className="display mt-1 text-3xl leading-none text-bone">{value}</p>
    </div>
  )
}

function SpecimenCard({ card, featured = false }: { card: CardRecord; featured?: boolean }) {
  const frameStyle = card.gold ? goldStyle : foilStyle
  const familyTone = card.family === 'lost' ? 'text-seam' : card.family === 'offspeed' ? 'text-teal-bright' : 'text-powder'

  return (
    <Link
      to={card.to}
      className={`group relative block overflow-hidden rounded-[1.1rem] p-[2px] transition duration-300 hover:-translate-y-1 ${
        featured ? 'lg:col-span-2' : ''
      }`}
      style={frameStyle}
    >
      <article className="relative flex h-full min-h-[23rem] flex-col overflow-hidden rounded-[0.95rem] bg-stage p-5 shadow-2xl">
        <div
          aria-hidden="true"
          className="absolute inset-0 opacity-45 mix-blend-screen"
          style={{
            background:
              'repeating-linear-gradient(45deg, rgba(108,172,228,.32) 0 1px, transparent 1px 13px), repeating-linear-gradient(-45deg, rgba(200,16,46,.24) 0 1px, transparent 1px 15px)',
          }}
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 opacity-20 transition-opacity duration-300 group-hover:opacity-35"
          style={{
            background:
              'radial-gradient(circle at 24% 12%, rgba(255,255,255,.32), transparent 26%), radial-gradient(circle at 76% 4%, rgba(108,172,228,.24), transparent 32%)',
          }}
        />

        <div className="relative z-10 flex items-start justify-between gap-4">
          <div>
            <p className={`mono-label-stage ${familyTone}`}>{card.eyebrow}</p>
            <h2 className="display mt-3 max-w-[13ch] text-4xl leading-[0.9] text-bone md:text-5xl">
              {card.name}
            </h2>
          </div>
          <div className="grid h-14 w-14 shrink-0 place-items-center rounded-full border border-bone/20 bg-bone/10 font-mono text-sm font-semibold text-bone">
            {card.specimenNo}
          </div>
        </div>

        <div className="relative z-10 my-6 flex min-h-[7.5rem] items-center justify-center rounded-[4rem_4rem_1rem_1rem] border border-bone/10 bg-bone/[0.035]">
          <svg width="148" height="148" viewBox="0 0 148 148" aria-hidden="true" className="drop-shadow-[0_0_28px_rgba(242,236,221,.16)]">
            <circle cx="74" cy="74" r="48" fill="#F4EEE0" />
            <path d="M48 34 C78 47 91 74 47 113" fill="none" stroke="#C8102E" strokeWidth="3.8" strokeLinecap="round" />
            <path d="M100 34 C70 47 57 74 101 113" fill="none" stroke="#C8102E" strokeWidth="3.8" strokeLinecap="round" />
            <path d="M50 48 L42 42 M55 60 L46 56 M58 75 L48 75 M55 91 L46 96 M50 104 L42 110" stroke="#8A0D21" strokeWidth="2" strokeLinecap="round" />
            <path d="M98 48 L106 42 M93 60 L102 56 M90 75 L100 75 M93 91 L102 96 M98 104 L106 110" stroke="#8A0D21" strokeWidth="2" strokeLinecap="round" />
          </svg>
          <p className="absolute bottom-3 left-4 font-mono text-[0.65rem] uppercase tracking-[0.16em] text-bone-2">
            {card.metricLabel}
          </p>
        </div>

        <div className="relative z-10 mt-auto">
          <div className="rounded-full border border-bone/15 bg-bone/10 px-4 py-2 text-center">
            <p className="display text-3xl leading-none text-bone">{card.metric}</p>
          </div>
          <p className="mt-4 line-clamp-3 text-sm leading-relaxed text-bone-2">{card.summary}</p>
          <div className="mt-5 flex flex-wrap items-center gap-2 border-t border-bone/10 pt-4">
            <span className="rounded-full border border-bone/15 px-2.5 py-1 font-mono text-[0.62rem] uppercase tracking-[0.1em] text-bone-2">
              {card.confidence}
            </span>
            <span className="rounded-full border border-powder/25 px-2.5 py-1 font-mono text-[0.62rem] uppercase tracking-[0.1em] text-powder">
              {card.kind === 'filed' ? 'Full specimen' : card.kind === 'basic' ? 'Basic file' : 'Archive file'}
            </span>
            <span className="ml-auto font-mono text-[0.68rem] uppercase tracking-[0.12em] text-seam transition-colors group-hover:text-powder">
              Open →
            </span>
          </div>
        </div>
      </article>
    </Link>
  )
}

export function PitchIndexPage() {
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState<FilterKey>('all')
  const cards = useCards()
  const q = query.trim().toLowerCase()

  const visible = useMemo(() => {
    return cards.filter((card) => {
      const matchesFilter =
        filter === 'all' ||
        (filter === 'filed' && card.kind === 'filed') ||
        (filter === 'basic' && card.kind === 'basic') ||
        (filter === 'lost' && card.kind === 'lost') ||
        card.family === filter
      const matchesQuery = !q || card.search.includes(q)
      return matchesFilter && matchesQuery
    })
  }, [cards, filter, q])

  const heroCard = visible.find((card) => card.kind === 'filed') ?? visible[0]
  const rest = heroCard ? visible.filter((card) => card.key !== heroCard.key || card.kind !== heroCard.kind) : visible

  useSeoMeta({
    title: `Pitch Index | ${SITE.siteName}`,
    description:
      'The searchable Pitch Atlas directory: filed specimens, basic repertoire files, and the lost-pitch archive. Sourced, not corrected.',
    ogTitle: `Pitch Index | ${SITE.siteName}`,
    ogDescription: 'Every pitch file in one searchable atlas.',
    ogUrl: `${SITE.canonicalDomain}/pitch-index`,
    twitterCard: 'summary_large_image',
  })

  return (
    <div className="bg-stage text-bone">
      <section className="relative overflow-hidden border-b border-bone/10">
        <div
          aria-hidden="true"
          className="absolute inset-0 opacity-70"
          style={{
            background:
              'radial-gradient(50% 40% at 50% -8%, rgba(108,172,228,.18), transparent 62%), radial-gradient(36% 34% at 6% 22%, rgba(200,16,46,.20), transparent 64%), radial-gradient(36% 34% at 92% 12%, rgba(0,162,160,.14), transparent 64%)',
          }}
        />
        <div className="relative mx-auto max-w-6xl px-5 py-16 md:px-8 md:py-24">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <p className="mono-label-stage text-powder">The Pitch Index</p>
            <Link to="/sources" className="mono-label-stage text-bone-2 transition-colors hover:text-powder">
              Sourced, not corrected →
            </Link>
          </div>
          <div className="mt-8 grid grid-cols-1 gap-10 lg:grid-cols-[0.95fr_1.05fr] lg:items-end">
            <div>
              <h1 className="display max-w-[9ch] text-6xl leading-[0.82] text-bone md:text-8xl">
                Every pitch filed in one atlas.
              </h1>
              <p className="mt-6 max-w-[46ch] text-lg leading-relaxed text-bone-2">
                The card pack opened into a working directory: full specimens first, basic repertoire next,
                and the lost archive clearly marked when the technique is thinner than the legend.
              </p>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <StatPlate label="Filed" value={PITCHES.length} />
              <StatPlate label="Basic" value={BASIC_REPERTOIRE.length} />
              <StatPlate label="Archive" value={LOST_PITCHES.length} />
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-bone/10 bg-press/40">
        <div className="mx-auto max-w-6xl px-5 py-6 md:px-8">
          <label className="block">
            <span className="sr-only">Search Pitch Atlas</span>
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search slider, cutter, hesitation, heater..."
              className="w-full rounded-sm border border-bone/15 bg-stage px-4 py-3 text-base text-bone placeholder:text-bone-2/60 focus:border-powder focus:outline-none"
            />
          </label>
          <div className="mt-4 flex flex-wrap gap-2">
            {FILTERS.map((item) => {
              const active = item.key === filter
              return (
                <button
                  key={item.key}
                  type="button"
                  aria-pressed={active}
                  onClick={() => setFilter(item.key)}
                  className={`rounded-full border px-3 py-1.5 font-mono text-[0.68rem] uppercase tracking-[0.12em] transition-colors ${
                    active
                      ? 'border-powder bg-powder/10 text-powder'
                      : 'border-bone/15 text-bone-2 hover:border-seam hover:text-bone'
                  }`}
                >
                  {item.label}
                </button>
              )
            })}
          </div>
          <p className="mono-label-stage mt-4 text-bone-2">
            {visible.length} {visible.length === 1 ? 'file' : 'files'} showing
            {q ? ` for "${query.trim()}"` : ''}
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-12 md:px-8 md:py-16">
        {visible.length === 0 ? (
          <div className="rounded-sm border border-bone/15 bg-press p-8">
            <p className="display text-3xl text-bone">No file matched that search.</p>
            <p className="mt-3 max-w-[48ch] text-bone-2">
              Clear the search, switch filters, or start broader: fastball, break, offspeed, Paige, doctored.
            </p>
          </div>
        ) : (
          <>
            {heroCard ? <SpecimenCard card={heroCard} featured /> : null}
            {rest.length > 0 ? (
              <div className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
                {rest.map((card) => (
                  <SpecimenCard key={`${card.kind}-${card.key}`} card={card} />
                ))}
              </div>
            ) : null}
          </>
        )}
      </section>

      <section className="border-t border-bone/10 bg-press/50">
        <div className="mx-auto grid max-w-6xl grid-cols-1 gap-6 px-5 py-12 md:grid-cols-[0.9fr_1.1fr] md:px-8 md:py-16">
          <div>
            <p className="mono-label-stage text-powder">Family shelves</p>
            <h2 className="display mt-3 text-4xl leading-tight text-bone">The map underneath the cards.</h2>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {REPERTOIRE_FAMILIES.map((family) => (
              <button
                key={family.family}
                type="button"
                onClick={() => setFilter(family.family)}
                className="rounded-sm border border-bone/10 bg-stage p-4 text-left transition-colors hover:border-powder"
              >
                <span className="mono-label-stage text-powder">{family.label}</span>
                <p className="mt-2 text-sm leading-relaxed text-bone-2">{family.blurb}</p>
              </button>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
