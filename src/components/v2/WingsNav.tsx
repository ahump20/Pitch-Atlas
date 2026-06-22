import { Link } from 'react-router-dom'
import { CRAFTSMEN } from '../../data/craftsmen'
import { LOST_PITCHES } from '../../data/lost-pitches'
import { DOCUMENTATION_META, type DocumentationTier } from '../../data/types'

/*
  v2 · The other doors. The hero pulls one specimen and the wall files the set;
  this is where the landing opens its other wings so it never dead-ends. Two
  feature doors — the hall of craftsmen and the Negro Leagues lost-pitch archive
  — on matte stock, then a compact rail to the softball set, the grip library,
  and the why. Every count and name is read from the real data, never hand-typed.
*/

const HALL_NAMES = CRAFTSMEN.filter((c) => c.kind === 'craftsman').map((c) => c.name)

const TIER_ORDER: DocumentationTier[] = ['documented', 'partial', 'legend']
const ARCHIVE_TIERS = TIER_ORDER.map((tier) => ({
  tier,
  label: DOCUMENTATION_META[tier].label,
  count: LOST_PITCHES.filter((p) => p.tier === tier).length,
})).filter((t) => t.count > 0)

const RAIL = [
  { to: '/softball', label: 'Softball', note: 'The fastpitch & slowpitch wing' },
  { to: '/grips', label: 'The Grip Library', note: 'Every grip, in the hand' },
  { to: '/about', label: 'Why it exists', note: 'The case for a sourced field manual' },
]

export function WingsNav() {
  return (
    <section className="v2-stage v2-tooth relative border-t border-bone/10">
      <div className="mx-auto max-w-[1320px] px-5 py-20 md:px-8 md:py-28">
        <h2 className="rfx-athletic v2-display max-w-[18ch] text-[clamp(28px,5vw,52px)] leading-[0.94]">
          The other doors.
        </h2>
        <p className="mt-4 max-w-[54ch] text-[15px] leading-relaxed text-bone-2">
          Four wings open off the same atlas — the arms that owned a pitch, the grips history dropped,
          the softball set, and the grip library. Each is a different angle on the one craft.
        </p>

        <div className="mt-10 grid grid-cols-1 gap-4 md:grid-cols-2">
          {/* door one — the hall */}
          <Link
            to="/craftsmen"
            className="v2-mount group block rounded-[3px] border border-bone/12 bg-[#0d0c0b] p-7 transition-colors hover:border-bone/30 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-bone"
            style={{ '--i': 0 } as React.CSSProperties}
          >
            <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-seam">The hall · door one</p>
            <p className="rfx-athletic mt-3 text-[clamp(24px,3.4vw,34px)] text-bone">The Craftsmen</p>
            <p className="mt-2 max-w-[46ch] text-[14.5px] leading-relaxed text-bone-2">
              The arms that owned a pitch — and the one pitch that is a legend, not a person. Every
              quote in here is real and carries its source.
            </p>
            <p className="mt-4 font-mono text-[9.5px] uppercase leading-relaxed tracking-[0.1em] text-bone-2/70">
              {HALL_NAMES.join(' · ')}
            </p>
            <span className="mt-5 inline-block font-mono text-[10px] uppercase tracking-[0.14em] text-bone-2 transition-colors group-hover:text-bone">
              Step into the hall <span aria-hidden="true">→</span>
            </span>
          </Link>

          {/* door two — the archive */}
          <Link
            to="/lost-pitches"
            className="v2-mount group block rounded-[3px] border border-bone/12 bg-[#0d0c0b] p-7 transition-colors hover:border-bone/30 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-bone"
            style={{ '--i': 1 } as React.CSSProperties}
          >
            <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-bone-2/80">The archive · door two</p>
            <p className="rfx-athletic mt-3 text-[clamp(24px,3.4vw,34px)] text-bone">
              Lost Pitches of the Negro Leagues
            </p>
            <p className="mt-2 max-w-[46ch] text-[14.5px] leading-relaxed text-bone-2">
              The statistics are being recovered; the technique mostly never will be. Every entry wears
              the tier its record can actually support — nothing smoothed into legend or out of it.
            </p>
            <p className="mt-4 flex flex-wrap gap-x-4 gap-y-1 font-mono text-[9.5px] uppercase tracking-[0.1em] text-bone-2/80">
              {ARCHIVE_TIERS.map((t) => (
                <span key={t.tier}>
                  {t.count} {t.label.toLowerCase()}
                </span>
              ))}
            </p>
            <span className="mt-5 inline-block font-mono text-[10px] uppercase tracking-[0.14em] text-bone-2 transition-colors group-hover:text-bone">
              Enter the archive <span aria-hidden="true">→</span>
            </span>
          </Link>
        </div>

        {/* the compact rail — the remaining wings, one line each */}
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
          {RAIL.map((r, i) => (
            <Link
              key={r.to}
              to={r.to}
              className="v2-mount group flex flex-col rounded-[3px] border border-bone/10 bg-[#0b0a09] p-5 transition-colors hover:border-bone/25 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-bone"
              style={{ '--i': i + 2 } as React.CSSProperties}
            >
              <span className="rfx-athletic text-[clamp(18px,2.4vw,22px)] text-bone">{r.label}</span>
              <span className="mt-1 text-[13px] leading-snug text-bone-2">{r.note}</span>
              <span className="mt-3 font-mono text-[9.5px] uppercase tracking-[0.14em] text-bone-2 transition-colors group-hover:text-seam">
                Open <span aria-hidden="true">→</span>
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
