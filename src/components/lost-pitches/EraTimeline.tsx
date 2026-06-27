import { Link } from 'react-router-dom'
import { LOST_PITCHES, LOST_PITCH_TIERS } from '../../data/lost-pitches'
import { parseEra } from '../../lib/era'
import type { DocumentationTier, LostPitch } from '../../data/types'

/*
  The Lost Pitches era timeline. A to-scale read of when the recovered record
  clusters and how solid it is, laid against the Negro Leagues decades. Built only
  from data already on file: each plate's era string (parsed to a start year) and
  its documentation tier. Nothing is invented - an era we cannot parse is simply
  left off. Deterministic layout (no Date, no random) so it prerenders cleanly;
  every marker is a focusable link to its chapter, and the dots carry full names in
  their labels, so it reads with a keyboard and a screen reader, not just a mouse.
*/

const AXIS = { start: 1898, end: 1955 }
const DECADES = [1900, 1910, 1920, 1930, 1940, 1950]
const ROW_H = 30 // px per stacked row within a tier lane
const GAP = 6 // min % between two markers sharing a row

// Tier dot colors, matching the provenance badge dots tuned for the dark field.
const TIER_COLOR: Record<DocumentationTier, string> = {
  documented: 'var(--color-ok-bright)',
  partial: 'var(--color-amber-bright)',
  legend: 'var(--color-sand-bright)',
}

function pos(year: number): number {
  return Math.min(100, Math.max(0, ((year - AXIS.start) / (AXIS.end - AXIS.start)) * 100))
}

interface Placed {
  pitch: LostPitch
  year: number
  left: number
  row: number
}

// Greedy row-packing: sorted by year, each marker drops into the first row whose
// last marker sits at least GAP% to its left. Deterministic by construction.
function pack(pitches: LostPitch[]): { placed: Placed[]; rows: number } {
  const sorted = pitches
    .map((p) => ({ pitch: p, year: parseEra(p.era)?.start }))
    .filter((x): x is { pitch: LostPitch; year: number } => typeof x.year === 'number')
    .sort((a, b) => a.year - b.year)

  const rowRight: number[] = []
  const placed: Placed[] = sorted.map(({ pitch, year }) => {
    const left = pos(year)
    let row = rowRight.findIndex((right) => left >= right + GAP)
    if (row === -1) {
      row = rowRight.length
      rowRight.push(left)
    } else {
      rowRight[row] = left
    }
    return { pitch, year, left, row }
  })
  return { placed, rows: Math.max(1, rowRight.length) }
}

function Lane({ tier, label }: { tier: DocumentationTier; label: string }) {
  const entries = LOST_PITCHES.filter((p) => p.tier === tier)
  if (entries.length === 0) return null
  const { placed, rows } = pack(entries)
  const color = TIER_COLOR[tier]

  return (
    <div className="mt-7 first:mt-0">
      <div className="flex items-center gap-2.5">
        <span
          className="inline-block h-2.5 w-2.5 rounded-full"
          style={{ background: color }}
          aria-hidden="true"
        />
        <span className="mono-label-stage text-bone-2">
          {label} <span className="text-bone-2/50">&middot; {entries.length}</span>
        </span>
      </div>

      <div className="relative mt-2" style={{ height: rows * ROW_H }}>
        {placed.map(({ pitch, year, left, row }) => {
          const rightHalf = left > 64
          return (
            <Link
              key={pitch.slug}
              to={`/lost-pitches/${pitch.slug}`}
              title={`${pitch.name} (${pitch.era})`}
              aria-label={`${pitch.name}, ${label.toLowerCase()}, ${pitch.era}`}
              className="group absolute flex items-center gap-1.5 focus:outline-none"
              style={{
                top: row * ROW_H,
                ...(rightHalf ? { right: `${100 - left}%`, flexDirection: 'row-reverse' } : { left: `${left}%` }),
              }}
            >
              <span
                className="h-2.5 w-2.5 shrink-0 rounded-full ring-2 ring-transparent transition-[box-shadow] group-hover:ring-white/20 group-focus-visible:ring-cyan/70"
                style={{ background: color }}
              />
              <span className="whitespace-nowrap font-mono text-[10px] uppercase tracking-[0.08em] text-bone-2/70 transition-colors group-hover:text-bone group-focus-visible:text-bone">
                {pitch.specimenNo}
                <span className="hidden text-bone-2/45 sm:inline"> {year}</span>
              </span>
            </Link>
          )
        })}
      </div>
    </div>
  )
}

export function EraTimeline() {
  return (
    <section className="relative mx-auto max-w-6xl px-5 py-16 md:px-8 md:py-20" aria-labelledby="era-timeline-title">
      <p className="mono-label text-seam">The record, in time</p>
      <h2 id="era-timeline-title" className="rfx-stitle mt-3 max-w-[20ch] text-[clamp(24px,3.6vw,40px)] leading-[1.04]">
        When the lost pitches cluster.
      </h2>
      <p className="mt-4 max-w-[64ch] text-base leading-relaxed text-bone-2">
        Every recovered plate, laid against the decades and colored by how solid the record is. The
        cluster in the 1920s is the doctored-ball and Paige-named cohort; the color is the honesty.
        Each marker opens its file.
      </p>

      <div className="relative mt-9 rounded-sm border border-bone/10 bg-[rgba(11,10,18,0.4)] p-5 md:p-7">
        {/* the decade axis */}
        <div className="relative h-5 border-b border-bone/12">
          {DECADES.map((d) => (
            <span
              key={d}
              className="absolute -translate-x-1/2 font-mono text-[10px] uppercase tracking-[0.1em] text-bone-2/50"
              style={{ left: `${pos(d)}%` }}
            >
              {d}s
            </span>
          ))}
        </div>

        <div className="mt-5">
          {LOST_PITCH_TIERS.map((t) => (
            <Lane key={t.tier} tier={t.tier} label={t.label} />
          ))}
        </div>
      </div>
    </section>
  )
}
