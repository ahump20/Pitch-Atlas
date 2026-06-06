import { type CSSProperties, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import type { RepertoireEntry, RepertoireFamily, RepertoireStatus } from '../../data/types'
import { REPERTOIRE_FAMILIES, repertoireByFamily } from '../../data/repertoire'
import { LOST_PITCHES } from '../../data/lost-pitches'

/*
  The Pitch Index directory, in the refractor language. Every accepted pitch by
  family as a scouting row: a seam glyph, the name, a Filed tag when the atlas has
  a full specimen, the sourced aka + velocity, a status tier, and the open
  affordance — "Open specimen" to /pitch/<slug> when filed, else "Basic file" to
  /repertoire/<id>. Sticky controls search name/aka/family and filter by family or
  by filed. The Lost Pitches wing sits one click away in its own hall. Default
  state (no query, all) renders every row, so the prerendered HTML carries the
  whole index; the filter hydrates on top. Foil is decoration; every line is sourced.
*/

type FamilyFilter = RepertoireFamily | 'filed' | 'all'

/* status tier -> void-tuned accent + label. Glyph-not-only-hue: the label always shows. */
const STATUS: Record<RepertoireStatus, { color: string; label: string }> = {
  standard: { color: 'var(--color-ok-bright)', label: 'Standard' },
  niche: { color: 'var(--color-teal-glow)', label: 'Niche' },
  rare: { color: 'var(--color-amber-bright)', label: 'Rare' },
  'near-extinct': { color: 'var(--color-sand-bright)', label: 'Near-extinct' },
  banned: { color: 'var(--color-seam-bright)', label: 'Banned' },
  alias: { color: 'var(--color-violet)', label: 'Alias' },
  illusion: { color: 'var(--color-orange)', label: 'Illusion' },
  'not-a-pitch': { color: 'var(--color-ink-3)', label: 'Not a pitch' },
}

/* family accent, matching the prototype's per-family worlds. */
const FAMILY_ACCENT: Record<RepertoireFamily, string> = {
  fastball: '#37D6FF',
  offspeed: '#7CFF52',
  breaking: '#8A6BFF',
  specialty: '#FFC23C',
  banned: '#FF2D44',
}

const FILTERS: { key: FamilyFilter; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'fastball', label: 'Fastball' },
  { key: 'offspeed', label: 'Offspeed' },
  { key: 'breaking', label: 'Breaking' },
  { key: 'specialty', label: 'Specialty' },
  { key: 'banned', label: 'Banned' },
  { key: 'filed', label: 'Filed specimens' },
]

/* A small static seam glyph: cream ball, family-tinted meridian, red horseshoe. */
function SeamGlyph({ color }: { color: string }) {
  return (
    <svg viewBox="0 0 40 40" aria-hidden="true" className="h-10 w-10 flex-none">
      <circle cx="20" cy="20" r="14" fill="#EFE7D4" />
      <circle cx="20" cy="20" r="14" fill="none" stroke={color} strokeWidth="1" opacity="0.4" />
      <path d="M11 13 Q17 20 11 27" fill="none" stroke="#FF2433" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M29 13 Q23 20 29 27" fill="none" stroke="#FF2433" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  )
}

function EntryRow({ entry, accent }: { entry: RepertoireEntry; accent: string }) {
  const filed = !!entry.filedSlug
  const status = STATUS[entry.status]
  const aka = entry.aka?.join(', ')
  return (
    <Link
      to={filed ? `/pitch/${entry.filedSlug}` : `/repertoire/${entry.id}`}
      className={`rfx-entry ${filed ? 'is-filed' : ''}`}
      style={{ '--gc': accent } as CSSProperties}
    >
      <span className="rfx-statpill absolute right-3.5 top-3.5" style={{ color: status.color }}>
        {status.label}
      </span>
      <SeamGlyph color={accent} />
      <span className="min-w-0 flex-1">
        <span className="flex flex-wrap items-center gap-2 pr-20">
          <span className="font-prose text-[15px] font-bold text-bone">{entry.name}</span>
          {filed ? <span className="rfx-filedtag">Filed</span> : null}
        </span>
        {aka ? <span className="mt-1 block text-[11.5px] leading-snug text-ink-3">{aka}</span> : null}
        {entry.velocity ? (
          <span className="mt-1.5 block font-mono text-[9.5px] leading-snug text-bone-2">{entry.velocity}</span>
        ) : null}
        <span
          className="mt-2.5 inline-flex items-center gap-1.5 font-mono text-[9px] uppercase tracking-[0.1em]"
          style={{ color: filed ? '#caa14a' : 'var(--color-ink-3)' }}
        >
          {filed ? 'Open specimen' : 'Basic file'} <span aria-hidden="true">→</span>
        </span>
      </span>
    </Link>
  )
}

export function PitchIndex({ id }: { id?: string }) {
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState<FamilyFilter>('all')
  const q = query.trim().toLowerCase()

  const groups = useMemo(() => {
    return REPERTOIRE_FAMILIES.map((fam) => {
      let entries = repertoireByFamily(fam.family)
      if (filter === 'filed') entries = entries.filter((e) => e.filedSlug)
      else if (filter !== 'all') entries = entries.filter(() => fam.family === filter)
      if (q) {
        entries = entries.filter((e) =>
          [e.name, ...(e.aka ?? []), e.family].join(' ').toLowerCase().includes(q),
        )
      }
      return { fam, entries }
    }).filter((g) => g.entries.length > 0)
  }, [q, filter])

  const total = groups.reduce((n, g) => n + g.entries.length, 0)
  const countLabel = `${total} ${total === 1 ? 'pitch' : 'pitches'}${
    filter === 'all' ? '' : filter === 'filed' ? ' · filed specimens' : ` · ${filter}`
  }${q ? ` · matching "${query.trim()}"` : ''}`

  return (
    <div id={id}>
      {/* Sticky controls */}
      <div className="sticky top-16 z-20 -mx-5 mt-6 bg-[#070509]/92 px-5 py-4 backdrop-blur-md md:-mx-8 md:px-8">
        <label className="block">
          <span className="sr-only">Search the Pitch Index</span>
          <span className="relative flex items-center">
            <span aria-hidden="true" className="pointer-events-none absolute left-4 text-lg text-cyan">⌕</span>
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search a pitch, an alias, a family…"
              className="rfx-input pl-10"
            />
          </span>
        </label>
        <div className="mt-3 flex flex-wrap gap-2">
          {FILTERS.map((f) => (
            <button
              key={f.key}
              type="button"
              aria-pressed={filter === f.key}
              onClick={() => setFilter(f.key)}
              className="rfx-chip"
            >
              {f.label}
            </button>
          ))}
        </div>
        <p className="mt-3 font-mono text-[10px] uppercase tracking-[0.1em] text-ink-3">{countLabel}</p>
      </div>

      {/* Empty state */}
      {total === 0 ? (
        <div className="py-16 text-center">
          <p className="rfx-athletic rfx-skew text-3xl text-bone-2">No pitch by that name</p>
          <p className="mt-2.5 text-[13px] text-ink-3">
            Try a family, an alias, or clear the search. The index only shows what the atlas has actually filed.
          </p>
        </div>
      ) : null}

      {/* Family groups */}
      {groups.map(({ fam, entries }) => {
        const accent = FAMILY_ACCENT[fam.family]
        return (
          <section key={fam.family} className="mt-9">
            <div
              className="mb-4 flex items-baseline gap-3.5 border-b pb-2.5"
              style={{ borderColor: `color-mix(in srgb, ${accent} 36%, transparent)` }}
            >
              <h2 className="rfx-athletic rfx-skew text-[clamp(22px,3.4vw,34px)]" style={{ color: accent }}>
                {fam.label}
              </h2>
              <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-ink-3">
                {entries.length} in family
              </span>
            </div>
            <div className="grid gap-[11px] [grid-template-columns:repeat(auto-fill,minmax(320px,1fr))]">
              {entries.map((e) => (
                <EntryRow key={e.id} entry={e} accent={accent} />
              ))}
            </div>
          </section>
        )
      })}

      {/* Lost Pitches wing callout */}
      <Link
        to="/lost-pitches"
        className="group relative mt-12 block overflow-hidden rounded-[20px] border p-[clamp(24px,3vw,40px)] transition-colors"
        style={{
          borderColor: 'color-mix(in srgb, var(--color-teal-glow) 34%, transparent)',
          background:
            'radial-gradient(90% 70% at 75% 10%, rgba(31,182,166,0.28), #0a0810), var(--color-press)',
        }}
      >
        <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-teal-glow">A wing of its own</p>
        <h3 className="rfx-athletic rfx-skew mt-2 text-[clamp(24px,4vw,40px)] text-bone">
          Lost Pitches of the Negro Leagues
        </h3>
        <p className="mt-3 max-w-[62ch] text-[14px] leading-relaxed text-bone-2">
          The statistics are being recovered; the technique mostly never will be. A box score survives; a
          grip does not. So every entry wears a documentation tier — Documented, Partial, or Legend — instead
          of faking a precision the record cannot support. The tier is the feature.
        </p>
        <span className="mt-4 inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.12em] text-bone">
          Enter the wing
          <span className="text-teal-glow transition-transform group-hover:translate-x-1">→</span>
          <span className="text-ink-3">· {LOST_PITCHES.length} filed</span>
        </span>
      </Link>
    </div>
  )
}
