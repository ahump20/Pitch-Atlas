import { REPERTOIRE, REPERTOIRE_FAMILIES, repertoireByFamily } from '../../data/repertoire'
import { FAMILY_ACCENT } from './family-accent'

/*
  The shelf, counted. A small felt plate for the header's right hand — the
  space the title never used. Every numeral is read off REPERTOIRE at build:
  one row per family in its own ink, then the filed/basic split laid in as a
  single inlaid bar. Nothing typed in; re-shelve the data and the plate
  re-counts itself. Static by design — a plate does not move.
*/

const FAMILY_ROWS = REPERTOIRE_FAMILIES.map((fam) => ({
  family: fam.family,
  label: fam.label,
  count: repertoireByFamily(fam.family).length,
}))

const FILED = REPERTOIRE.filter((e) => e.filedSlug).length
const BASIC = REPERTOIRE.length - FILED
const FILED_PCT = ((FILED / REPERTOIRE.length) * 100).toFixed(1)

export function IndexLedger({ className = '' }: { className?: string }) {
  return (
    <aside
      aria-label="The index, counted by family"
      className={`rfx-panel texture-felt rounded-[14px] p-4 md:-rotate-[0.35deg] ${className}`}
    >
      <p className="flex items-baseline justify-between gap-3 border-b border-white/10 pb-2.5 font-mono text-[9.5px] uppercase tracking-[0.16em] text-ink-3">
        <span>The shelf, counted</span>
        <span className="text-bone-2">{REPERTOIRE.length} rows</span>
      </p>
      <ul className="mt-2.5 flex flex-col gap-1.5">
        {FAMILY_ROWS.map((row) => (
          <li
            key={row.family}
            className="flex items-center gap-2.5 font-mono text-[10px] uppercase tracking-[0.1em]"
          >
            <i
              aria-hidden="true"
              className="h-2.5 w-[3px] flex-none rounded-sm"
              style={{ background: FAMILY_ACCENT[row.family] }}
            />
            <span className="min-w-0 flex-1 truncate text-bone-2">{row.label}</span>
            <span className="tabular-nums text-bone">{row.count}</span>
          </li>
        ))}
      </ul>
      {/* the split bar: gold is a filed specimen, the rest are basic files */}
      <div
        aria-hidden="true"
        className="mt-3.5 h-1.5 overflow-hidden rounded-full bg-white/10"
      >
        <i className="block h-full rounded-full bg-[#D8CFB8]" style={{ width: `${FILED_PCT}%` }} />
      </div>
      <p className="mt-2 font-mono text-[9px] uppercase tracking-[0.1em] text-ink-3">
        <span className="text-[#D8CFB8]">{FILED} full specimens</span> · {BASIC} basic files
      </p>
    </aside>
  )
}
