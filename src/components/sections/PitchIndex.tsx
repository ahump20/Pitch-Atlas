import { type CSSProperties, useEffect, useRef, useState } from 'react'
import { flushSync } from 'react-dom'
import { Link, useSearchParams } from 'react-router-dom'
import { useReducedMotion } from '../../hooks/useReducedMotion'
import { BookOpenIcon, ListIcon, SearchIcon, XIcon } from 'lucide-react'
import type { RepertoireEntry, RepertoireFamily, RepertoireStatus } from '../../data/types'
import { REPERTOIRE, REPERTOIRE_FAMILIES, repertoireByFamily } from '../../data/repertoire'
import { gripEntryForRepertoire } from '../../data/grips'
import { LOST_PITCHES } from '../../data/lost-pitches'
import { projectSeam, splitRuns } from '../../lib/seam2d'
import { accentForSlug } from '../refractor/accents'
import { FAMILY_ACCENT } from './family-accent'
import { BinderSheet, RepertoirePocket } from './BinderSheet'
import { Badge } from '../ui/badge'
import { Button } from '../ui/button'
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '../ui/empty'
import { InputGroup, InputGroupAddon, InputGroupInput } from '../ui/input-group'
import { ToggleGroup, ToggleGroupItem } from '../ui/toggle-group'

type IndexView = 'rows' | 'binder'

/*
  The Pitch Index directory, in the refractor language. Every accepted pitch by
  family as a scouting row: the mark, the name, a Filed tag when the atlas has
  a full specimen, the sourced aka + grip tell, a status tier, and the open
  affordance — "Open specimen" to /pitch/<slug> when filed, else "Basic file" to
  /repertoire/<id>. The mark is honest by tier: a real grip photograph where the
  library holds one; otherwise the true projected seam (the same curve every 2D
  ball on the site is drawn from), inked in the entry's accent and resting at
  its own turn — a bucket of handled balls, no two set down the same way. The
  second view is the binder spread: each family is a leather binder sheet of
  sleeves (the home set's own pocket vocabulary), a sleeved card pulls on hover,
  and an entry with no clean photograph wears the honest cream slip instead of a
  fake thumbnail. Sticky controls search name/aka/family and filter by family or
  by filed. The Lost Pitches wing sits one click away in its own hall. Default
  state (no query, all) renders every row, so the prerendered HTML carries the
  whole index; the filter hydrates on top. Foil is decoration; every line is
  sourced.
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

const FILTERS: { key: FamilyFilter; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'fastball', label: 'Fastball' },
  { key: 'offspeed', label: 'Offspeed' },
  { key: 'breaking', label: 'Breaking' },
  { key: 'specialty', label: 'Specialty' },
  { key: 'banned', label: 'Banned' },
  { key: 'filed', label: 'Filed specimens' },
]
const FILTER_KEYS = new Set<FamilyFilter>(FILTERS.map((f) => f.key))
const VIEW_KEYS = new Set<IndexView>(['rows', 'binder'])

function searchFilter(value: string | null): FamilyFilter {
  return FILTER_KEYS.has(value as FamilyFilter) ? (value as FamilyFilter) : 'all'
}

function searchView(value: string | null): IndexView {
  return VIEW_KEYS.has(value as IndexView) ? (value as IndexView) : 'rows'
}

/* the one true seam, projected once at module scope and shared by every mark.
   rotation happens per entry on a <g>, so forty marks cost one projection. */
const MARK_SEAM = splitRuns(projectSeam(20, 20, 13.2, 160))

/* how an entry rests: seeded off its id, never the clock, never a die. The
   same ball lands the same way on the server and in the hand. */
function restFor(id: string): number {
  let h = 0
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) % 1000
  return Math.sin(h) // -1..1
}

/* The unphotographed mark: a dark leather disc carrying the real projected
   seam — the same curve every 2D ball on the site is drawn from — inked in
   the entry's accent and set down at its own turn. Static; rotation is how
   the ball rests, not an animation. */
function IndexSeamMark({ tint, turn }: { tint: string; turn: number }) {
  return (
    <svg viewBox="0 0 40 40" aria-hidden="true" className="h-10 w-10 flex-none">
      <circle cx="20" cy="20" r="13.8" fill="#17120C" />
      <circle cx="20" cy="20" r="13.8" fill="none" stroke={tint} strokeWidth="1" opacity="0.38" />
      <g transform={`rotate(${turn.toFixed(2)} 20 20)`}>
        {MARK_SEAM.map((run, i) => (
          <path
            key={i}
            d={run.d}
            fill="none"
            stroke={tint}
            strokeWidth={run.front ? 1.5 : 1}
            strokeOpacity={run.front ? 0.9 : 0.26}
            strokeLinecap="round"
          />
        ))}
      </g>
    </svg>
  )
}

/* A real grip photograph at thumbnail scale, leaning its own degree. Loading
   fades up (.media-fade, reduced-motion-gated in CSS); a failed fetch falls
   back to the seam mark — never a broken-image hole in the column. */
function GripThumb({ src, tint, rest }: { src: string; tint: string; rest: number }) {
  const [state, setState] = useState<'loading' | 'loaded' | 'error'>('loading')
  if (state === 'error') return <IndexSeamMark tint={tint} turn={rest * 48} />
  return (
    <span
      aria-hidden="true"
      className="relative h-10 w-10 flex-none overflow-hidden rounded-[10px] bg-[#14100B]"
      style={{
        transform: `rotate(${(rest * 2).toFixed(2)}deg)`,
        boxShadow: `0 0 0 1px color-mix(in srgb, ${tint} 38%, transparent)`,
      }}
    >
      <img
        src={src}
        alt=""
        loading="lazy"
        decoding="async"
        draggable={false}
        // a cached image can finish before hydration attaches onLoad — read it off the element
        ref={(el) => {
          if (el?.complete && el.naturalWidth > 0) setState('loaded')
        }}
        onLoad={() => setState('loaded')}
        onError={() => setState('error')}
        className={`media-fade h-full w-full object-cover ${state === 'loaded' ? 'is-loaded' : ''}`}
      />
    </span>
  )
}

function EntryRow({ entry, accent }: { entry: RepertoireEntry; accent: string }) {
  const filed = !!entry.filedSlug
  const status = STATUS[entry.status]
  const aka = entry.aka?.join(', ')
  const gripEntry = gripEntryForRepertoire(entry)
  // the same photo the binder pocket resolves: first still, else the clip's poster
  const still = gripEntry?.photos[0]?.src ?? gripEntry?.clip?.poster
  const rest = restFor(entry.id)
  // a filed pitch wears its own specimen world; a basic file wears the family ink
  const markTint = entry.filedSlug ? accentForSlug(entry.filedSlug).c3 : accent
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
      {still ? (
        <GripThumb src={still} tint={markTint} rest={rest} />
      ) : (
        <IndexSeamMark tint={markTint} turn={rest * 48} />
      )}
      <span className="min-w-0 flex-1">
        <span className="flex flex-wrap items-center gap-2 pr-20">
          <span className="font-prose text-[15px] font-bold text-bone">{entry.name}</span>
          {filed ? (
            <Badge
              className="h-auto rounded-[4px] px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-[0.1em] text-[#14110A]"
              style={{ background: 'var(--foil)', backgroundSize: '300% 100%', backgroundPosition: '38% 0' }}
            >
              Filed
            </Badge>
          ) : null}
        </span>
        {aka ? <span className="mt-1 block text-[11.5px] leading-snug text-ink-3">{aka}</span> : null}
        {gripEntry ? (
          /* the tell is a ten-word phrase, not a ticker — it wraps whole on
             desktop and clamps at two lines on a phone, never mid-word */
          <Badge
            variant="outline"
            className="mt-2 h-auto max-w-full items-start justify-start gap-2 whitespace-normal rounded-[10px] px-2.5 py-1 text-left font-mono text-[9px] uppercase tracking-[0.08em] text-bone-2"
            style={{
              borderColor: `color-mix(in srgb, ${accent} 30%, transparent)`,
              background: `color-mix(in srgb, ${accent} 8%, transparent)`,
            }}
          >
            <span className="flex-none" style={{ color: accent }}>
              Grip tell
            </span>
            <span className="line-clamp-2 min-w-0 leading-snug sm:line-clamp-none">
              {gripEntry.shortCue}
            </span>
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
  const [searchParams, setSearchParams] = useSearchParams()
  const query = searchParams.get('q') ?? ''
  const filter = searchFilter(searchParams.get('family'))
  const view = searchView(searchParams.get('view'))
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

  function updateIndexParams(
    patch: { q?: string | null; family?: FamilyFilter | null; view?: IndexView | null },
    options: { replace?: boolean; announce?: string } = {},
  ) {
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev)
        if ('q' in patch) {
          const nextQuery = patch.q?.trim() ?? ''
          if (nextQuery) next.set('q', nextQuery)
          else next.delete('q')
        }
        if ('family' in patch) {
          if (patch.family && patch.family !== 'all') next.set('family', patch.family)
          else next.delete('family')
        }
        if ('view' in patch) {
          if (patch.view && patch.view !== 'rows') next.set('view', patch.view)
          else next.delete('view')
        }
        return next
      },
      { replace: options.replace ?? false, preventScrollReset: true, flushSync: true },
    )
    if (options.announce) say(options.announce)
  }

  function resetIndex() {
    updateIndexParams(
      { q: null, family: null, view: null },
      { replace: true, announce: 'Index reset' },
    )
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

  const groups = REPERTOIRE_FAMILIES.map((fam) => {
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

  const total = groups.reduce((n, g) => n + g.entries.length, 0)
  const activeFilterLabel = FILTERS.find((f) => f.key === filter)?.label ?? 'All'
  const hasActiveState = q.length > 0 || filter !== 'all' || view !== 'rows'
  const countLabel = `${total} ${total === 1 ? 'pitch' : 'pitches'}${
    filter === 'all' ? '' : filter === 'filed' ? ' · filed specimens' : ` · ${filter}`
  }${q ? ` · matching "${query.trim()}"` : ''}`

  return (
    <div id={id}>
      {/* Sticky controls */}
      <div className="sticky top-16 z-20 -mx-5 mt-6 bg-background/92 px-5 py-3 backdrop-blur-md md:-mx-8 md:px-8 md:py-4">
        <label className="block">
          <span className="sr-only">Search the Pitch Index</span>
          <InputGroup className="h-11 rounded-xl border-cyan/40 bg-[#1D1710] text-bone">
            <InputGroupAddon>
              <SearchIcon aria-hidden="true" />
            </InputGroupAddon>
            <InputGroupInput
              type="search"
              value={query}
              onChange={(e) => updateIndexParams({ q: e.target.value }, { replace: true })}
              onKeyDown={(e) => {
                // Escape wipes the search clean and says so
                if (e.key === 'Escape' && query) {
                  updateIndexParams({ q: null }, { replace: true, announce: 'Search cleared' })
                }
              }}
              placeholder="Search a pitch, an alias, a family…"
              className="h-full text-[15px] placeholder:text-ink-3"
            />
          </InputGroup>
        </label>
        {/* One control row: family filters scroll horizontally on phones (so the
            sticky bar stays short and doesn't bury the list) with the view toggle
            and reset pinned right. `min-w-0 flex-1` bounds the filter group so its
            overflow scrolls INSIDE the row instead of pushing the page wide. From
            640px up the filters wrap normally. */}
        <div className="mt-3 flex items-center gap-2">
          <ToggleGroup
            type="single"
            value={filter}
            onValueChange={(next) => {
              if (next) morph(() => updateIndexParams({ family: next as FamilyFilter }, { announce: `${FILTERS.find((f) => f.key === next)?.label ?? 'All'} filter applied` }))
            }}
            className="flex min-w-0 flex-1 flex-nowrap gap-1.5 overflow-x-auto pb-1 [scrollbar-width:none] sm:flex-wrap sm:gap-2 sm:overflow-visible sm:pb-0 [&::-webkit-scrollbar]:hidden"
            aria-label="Filter pitch family"
          >
            {FILTERS.map((f) => (
              <ToggleGroupItem
                key={f.key}
                value={f.key}
                aria-label={f.label}
                className="pi-toggle shrink-0 rounded-full border border-white/14 px-3 py-1.5 font-mono text-[9.5px] uppercase tracking-[0.1em] text-bone-2 data-[state=on]:border-primary data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"
              >
                {f.label}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
          <ToggleGroup
            type="single"
            value={view}
            onValueChange={(next) => {
              if (next) morph(() => updateIndexParams({ view: next as IndexView }, { announce: `${next === 'binder' ? 'Binder' : 'Rows'} view selected` }))
            }}
            className="shrink-0 rounded-full border border-white/14 p-0.5"
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
          {hasActiveState ? (
            <Button
              type="button"
              onClick={resetIndex}
              variant="ghost"
              size="sm"
              className="h-9 shrink-0 rounded-full px-3 font-mono text-[10px] uppercase tracking-[0.1em] text-bone-2 hover:text-bone"
            >
              <XIcon data-icon="inline-start" />
              Reset
            </Button>
          ) : null}
        </div>
        <p aria-live="polite" className="mt-2 font-mono text-[10px] uppercase tracking-[0.1em] text-ink-3 md:mt-3">
          {countLabel}
        </p>
        <span role="status" aria-live="polite" data-testid="pitch-index-announcer" className="sr-only">
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
                ? `"${query.trim()}" is not in the ${REPERTOIRE.length} indexed entries. Try a family or an alias${
                    filter === 'all' ? '' : `, or clear the ${activeFilterLabel} filter`
                  }. The index only shows what the atlas has actually filed.`
                : `Every entry is excluded by the ${activeFilterLabel} filter. Clear it to see the full index.`}
            </EmptyDescription>
            <Button
              type="button"
              onClick={resetIndex}
              variant="outline"
              className="mt-4 w-fit font-mono text-[10px] uppercase tracking-[0.12em]"
            >
              <XIcon data-icon="inline-start" />
              Reset index
            </Button>
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
              <div className="grid gap-[11px] [grid-template-columns:repeat(auto-fill,minmax(min(280px,100%),1fr))]">
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
