import { type CSSProperties, useEffect, useMemo, useRef, useState } from 'react'
import { flushSync } from 'react-dom'
import { Link } from 'react-router-dom'
import { useReducedMotion } from '../../hooks/useReducedMotion'
import { BookOpenIcon, ListIcon, SearchIcon } from 'lucide-react'
import type { RepertoireEntry, RepertoireFamily, RepertoireStatus } from '../../data/types'
import { REPERTOIRE, REPERTOIRE_FAMILIES, repertoireByFamily } from '../../data/repertoire'
import { gripEntryForRepertoire } from '../../data/grips'
import { LOST_PITCHES } from '../../data/lost-pitches'
import { BinderSheet, RepertoirePocket } from './BinderSheet'
import { Badge } from '../ui/badge'
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '../ui/empty'
import { InputGroup, InputGroupAddon, InputGroupInput } from '../ui/input-group'
import { ToggleGroup, ToggleGroupItem } from '../ui/toggle-group'

type IndexView = 'rows' | 'binder'

/*
  The Pitch Index directory, in the refractor language. Every accepted pitch by
  family as a scouting row: a seam glyph, the name, a Filed tag when the atlas has
  a full specimen, the sourced aka + velocity, a status tier, and the open
  affordance — "Open specimen" to /pitch/<slug> when filed, else "Basic file" to
  /repertoire/<id>. The second view is the binder spread: each family is a leather
  binder sheet of sleeves (the home set's own pocket vocabulary), a sleeved card
  pulls on hover, and an entry with no clean photograph wears the honest cream
  slip instead of a fake thumbnail. Sticky controls search name/aka/family and
  filter by family or by filed. The Lost Pitches wing sits one click away in its
  own hall. Default state (no query, all) renders every row, so the prerendered
  HTML carries the whole index; the filter hydrates on top. Foil is decoration;
  every line is sourced.
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
  // collegiate jewel lifts on the charcoal — pennant navy, varsity forest,
  // letterman burgundy, warm sand, seam. The neon triads stay on the card faces.
  fastball: '#5C84B8',
  offspeed: '#5FA27B',
  breaking: '#B0606C',
  specialty: '#CDBA8E',
  banned: '#E04A5A',
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
  const gripEntry = gripEntryForRepertoire(entry)
  return (
    <Link
      to={filed ? `/pitch/${entry.filedSlug}` : `/repertoire/${entry.id}`}
      className={`rfx-entry ${filed ? 'is-filed' : ''}`}
      style={{ '--gc': accent, viewTransitionName: `pi-${entry.id}` } as CSSProperties}
    >
      <Badge
        variant="outline"
        className="absolute right-3.5 top-3.5 border-current bg-transparent font-mono text-[8px] uppercase tracking-[0.08em]"
        style={{ color: status.color }}
      >
        {status.label}
      </Badge>
      <SeamGlyph color={accent} />
      <span className="min-w-0 flex-1">
        <span className="flex flex-wrap items-center gap-2 pr-20">
          <span className="font-prose text-[15px] font-bold text-bone">{entry.name}</span>
          {filed ? (
            <Badge
              className="h-auto rounded-[4px] px-1.5 py-0.5 font-mono text-[7.5px] uppercase tracking-[0.1em] text-[#14110A]"
              style={{ background: 'var(--foil)', backgroundSize: '300% 100%', backgroundPosition: '38% 0' }}
            >
              Filed
            </Badge>
          ) : null}
        </span>
        {aka ? <span className="mt-1 block text-[11.5px] leading-snug text-ink-3">{aka}</span> : null}
        {gripEntry ? (
          <Badge
            variant="outline"
            className="mt-2 h-auto max-w-full justify-start gap-2 rounded-full px-2.5 py-1 font-mono text-[9px] uppercase tracking-[0.08em] text-bone-2"
            style={{
              borderColor: `color-mix(in srgb, ${accent} 30%, transparent)`,
              background: `color-mix(in srgb, ${accent} 8%, transparent)`,
            }}
          >
            <span style={{ color: accent }}>Grip tell</span>
            <span className="min-w-0 truncate">{gripEntry.shortCue}</span>
          </Badge>
        ) : null}
        <span
          className="mt-2.5 inline-flex items-center gap-1.5 font-mono text-[9px] uppercase tracking-[0.1em]"
          style={{ color: filed ? '#D8CFB8' : 'var(--color-ink-3)' }}
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
  const [view, setView] = useState<IndexView>('rows')
  const reduced = useReducedMotion()
  const q = query.trim().toLowerCase()

  // the announcer: a hidden live region for events the screen can't show
  // (Escape clearing the search). The message clears itself so a repeat
  // of the same event re-announces.
  const [announce, setAnnounce] = useState('')
  const announceTimer = useRef<number | undefined>(undefined)
  useEffect(() => () => window.clearTimeout(announceTimer.current), [])
  function say(msg: string) {
    setAnnounce(msg)
    window.clearTimeout(announceTimer.current)
    announceTimer.current = window.setTimeout(() => setAnnounce(''), 1600)
  }

  /*
    Discrete filter/view switches morph rows to their new positions instead of
    shuffling (View Transitions API; per-row names below). Keystroke filtering
    stays instant — animating every keypress is the chaos this avoids. Browsers
    without the API, and anyone preferring reduced motion, get the instant swap.
  */
  function morph(update: () => void) {
    const doc = document as Document & { startViewTransition?: (cb: () => void) => unknown }
    if (!reduced && typeof doc.startViewTransition === 'function') {
      doc.startViewTransition(() => flushSync(update))
    } else {
      update()
    }
  }

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
      <div className="sticky top-16 z-20 -mx-5 mt-6 bg-background/92 px-5 py-4 backdrop-blur-md md:-mx-8 md:px-8">
        <label className="block">
          <span className="sr-only">Search the Pitch Index</span>
          <InputGroup className="h-11 rounded-xl border-cyan/40 bg-[#1D1710] text-bone">
            <InputGroupAddon>
              <SearchIcon aria-hidden="true" />
            </InputGroupAddon>
            <InputGroupInput
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => {
                // Escape wipes the search clean and says so
                if (e.key === 'Escape' && query) {
                  setQuery('')
                  say('Search cleared')
                }
              }}
              placeholder="Search a pitch, an alias, a family…"
              className="h-full text-[15px] placeholder:text-ink-3"
            />
          </InputGroup>
        </label>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <ToggleGroup
            type="single"
            value={filter}
            onValueChange={(next) => {
              if (next) morph(() => setFilter(next as FamilyFilter))
            }}
            className="flex flex-wrap"
            aria-label="Filter pitch family"
          >
            {FILTERS.map((f) => (
              <ToggleGroupItem
                key={f.key}
                value={f.key}
                aria-label={f.label}
                className="pi-toggle rounded-full border border-white/14 px-3 py-1.5 font-mono text-[9.5px] uppercase tracking-[0.1em] text-bone-2 data-[state=on]:border-primary data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"
              >
                {f.label}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
          <ToggleGroup
            type="single"
            value={view}
            onValueChange={(next) => {
              if (next) morph(() => setView(next as IndexView))
            }}
            className="ml-auto rounded-full border border-white/14 p-0.5"
            aria-label="Index view"
          >
            <ToggleGroupItem value="rows" aria-label="Rows view" className="pi-toggle rounded-full font-mono text-xs uppercase tracking-[0.06em] data-[state=on]:bg-primary data-[state=on]:text-primary-foreground">
              <ListIcon data-icon="inline-start" />
              Rows
            </ToggleGroupItem>
            <ToggleGroupItem value="binder" aria-label="Binder view" className="pi-toggle rounded-full font-mono text-xs uppercase tracking-[0.06em] data-[state=on]:bg-primary data-[state=on]:text-primary-foreground">
              <BookOpenIcon data-icon="inline-start" />
              Binder
            </ToggleGroupItem>
          </ToggleGroup>
        </div>
        <p aria-live="polite" className="mt-3 font-mono text-[10px] uppercase tracking-[0.1em] text-ink-3">
          {countLabel}
        </p>
        <span role="status" aria-live="polite" className="sr-only">
          {announce}
        </span>
      </div>

      {/* Empty state — says which lever to pull: the search term or the filter */}
      {total === 0 ? (
        <Empty className="my-12 border border-dashed border-white/12 bg-card/70 py-16">
          <EmptyHeader>
            <EmptyMedia variant="icon" className="bg-primary/12 text-primary">
              <SearchIcon aria-hidden="true" />
            </EmptyMedia>
            <EmptyTitle className="rfx-athletic rfx-skew text-3xl text-bone-2">
              {q ? 'No pitch by that name' : 'Nothing under this filter'}
            </EmptyTitle>
            <EmptyDescription className="text-[13px] text-ink-3">
              {q
                ? `“${query.trim()}” is not in the ${REPERTOIRE.length} indexed entries. Try a family or an alias${
                    filter === 'all' ? '' : `, or clear the ${FILTERS.find((f) => f.key === filter)?.label} filter`
                  }. The index only shows what the atlas has actually filed.`
                : `Every entry is excluded by the ${FILTERS.find((f) => f.key === filter)?.label} filter. Clear it to see the full index.`}
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
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
            {view === 'rows' ? (
              <div className="grid gap-[11px] [grid-template-columns:repeat(auto-fill,minmax(320px,1fr))]">
                {entries.map((e) => (
                  <EntryRow key={e.id} entry={e} accent={accent} />
                ))}
              </div>
            ) : (
              <BinderSheet label={`${fam.label} family, binder sheet`}>
                {entries.map((e) => (
                  <div key={e.id} className="pocket" style={{ viewTransitionName: `pi-${e.id}` }}>
                    <RepertoirePocket entry={e} />
                  </div>
                ))}
              </BinderSheet>
            )}
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
            'radial-gradient(90% 70% at 75% 10%, rgba(31,182,166,0.28), #16120D), var(--color-press)',
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
