import { useMemo, useState } from 'react'
import type { RepertoireFamily } from '../../data/types'
import { REPERTOIRE_FAMILIES, repertoireByFamily } from '../../data/repertoire'
import { LOST_PITCH_TIERS, lostPitchesByTier } from '../../data/lost-pitches'
import { GridSection } from '../layout/GridSection'
import { IndexCard } from '../index/IndexCard'

/*
  The Pitch Index: the front door. Every accepted pitch by family, then the lost
  pitches of the Negro Leagues as a second tier — one searchable, filterable
  directory that routes a visitor to any pitch they want to learn or discuss. A
  filed pitch opens its full specimen; an unfiled one opens its basic file; a lost
  pitch opens its archive page. The default (no query, no filter) renders the whole
  list so the prerendered HTML carries every pitch; the filter hydrates on top.
*/

type FamilyFilter = RepertoireFamily | 'lost' | 'all'

const FILTERS: { key: FamilyFilter; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'fastball', label: 'Fastballs' },
  { key: 'offspeed', label: 'Offspeed' },
  { key: 'breaking', label: 'Breaking' },
  { key: 'specialty', label: 'Specialty' },
  { key: 'banned', label: 'Banned' },
  { key: 'lost', label: 'Lost pitches' },
]

export function PitchIndex({ id }: { id?: string }) {
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState<FamilyFilter>('all')

  const q = query.trim().toLowerCase()

  const repertoireGroups = useMemo(() => {
    return REPERTOIRE_FAMILIES.map((fam) => {
      const entries = repertoireByFamily(fam.family).filter((e) => {
        if (!q) return true
        const hay = [e.name, ...(e.aka ?? []), e.notableThrowers ?? '', e.movement.value]
          .join(' ')
          .toLowerCase()
        return hay.includes(q)
      })
      return { fam, entries }
    })
  }, [q])

  const lostGroups = useMemo(() => {
    return LOST_PITCH_TIERS.map((t) => {
      const pitches = lostPitchesByTier(t.tier).filter((p) => {
        if (!q) return true
        const hay = [p.name, p.tagline, p.intro].join(' ').toLowerCase()
        return hay.includes(q)
      })
      return { t, pitches }
    })
  }, [q])

  const showRepertoire = filter === 'all' || filter !== 'lost'
  const showLost = filter === 'all' || filter === 'lost'

  const visibleRepertoire = repertoireGroups.filter(
    (g) => (filter === 'all' || g.fam.family === filter) && g.entries.length > 0,
  )
  const visibleLost = lostGroups.filter((g) => g.pitches.length > 0)

  const repertoireCount = visibleRepertoire.reduce((n, g) => n + g.entries.length, 0)
  const lostCount = visibleLost.reduce((n, g) => n + g.pitches.length, 0)
  const total =
    (showRepertoire ? repertoireCount : 0) + (showLost ? lostCount : 0)

  return (
    <div id={id} className="mx-auto max-w-6xl px-5 py-14 md:px-8 md:py-16">
      {/* Filter bar */}
      <div className="mb-10 flex flex-col gap-5 border-b border-navy/12 pb-6">
        <label className="relative block">
          <span className="sr-only">Search pitches</span>
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search a pitch — slider, cutter, eephus, heater…"
            className="w-full rounded-sm border border-navy/20 bg-paper px-4 py-3 font-prose text-base text-ink placeholder:text-ink-3 focus:border-seam focus:outline-none"
          />
        </label>
        <div className="flex flex-wrap items-center gap-2">
          {FILTERS.map((f) => {
            const active = filter === f.key
            return (
              <button
                key={f.key}
                type="button"
                onClick={() => setFilter(f.key)}
                aria-pressed={active}
                className={`mono-label rounded-sm border px-3 py-1.5 transition-colors ${
                  active
                    ? 'border-seam bg-seam/8 text-seam'
                    : 'border-navy/20 text-ink-2 hover:border-navy/40 hover:text-ink'
                }`}
              >
                {f.label}
              </button>
            )
          })}
        </div>
        <p className="mono-label text-ink-3">
          {total} {total === 1 ? 'pitch' : 'pitches'}
          {q ? ` matching "${query.trim()}"` : ''}
        </p>
      </div>

      {/* Empty state */}
      {total === 0 ? (
        <p className="py-12 text-lg text-ink-2">
          No pitches match{q ? ` "${query.trim()}"` : ' that filter'}. Try a different name or clear the
          search.
        </p>
      ) : null}

      {/* Repertoire groups */}
      {showRepertoire
        ? visibleRepertoire.map(({ fam, entries }, idx) => (
            <GridSection
              key={fam.family}
              index={String(idx + 1).padStart(2, '0')}
              label={fam.label}
              blurb={filter === 'all' ? fam.blurb : undefined}
              className={idx > 0 ? 'mt-16' : ''}
            >
              {entries.map((e) => (
                <IndexCard key={e.id} variant="repertoire" entry={e} />
              ))}
            </GridSection>
          ))
        : null}

      {/* Lost pitches tier */}
      {showLost && visibleLost.length > 0 ? (
        <div className={showRepertoire && visibleRepertoire.length > 0 ? 'mt-20 border-t border-navy/15 pt-16' : ''}>
          <p className="mono-label mb-2 text-seam">The archive</p>
          <h2 className="display mb-3 text-3xl leading-tight text-navy">Lost pitches of the Negro Leagues</h2>
          <p className="mb-10 max-w-[64ch] text-base leading-relaxed text-ink-2">
            The statistics are being recovered; the technique mostly never will be. Filed by how solid the
            record is — documented anchors first, legend flagged.
          </p>
          {visibleLost.map(({ t, pitches }) => (
            <GridSection
              key={t.tier}
              index={t.index}
              label={t.label}
              cols="md:grid-cols-2 lg:grid-cols-3"
              className="mt-12 first:mt-0"
            >
              {pitches.map((p) => (
                <IndexCard key={p.slug} variant="lost" pitch={p} />
              ))}
            </GridSection>
          ))}
        </div>
      ) : null}
    </div>
  )
}
