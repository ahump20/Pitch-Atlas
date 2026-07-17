import { Link } from 'react-router-dom'
import { Descent } from '../motion/Descent'

const RAIL = [
  { to: '/softball', label: 'Softball', note: 'The fastpitch & slowpitch wing' },
  { to: '/grips', label: 'The Grip Library', note: 'Every grip, in the hand' },
  { to: '/about', label: 'Why it exists', note: 'The case for a living archive' },
]

const SCENE_TINT = '#6CACE4'

export function WingsNav() {
  return (
    <section
      data-scene-tint={SCENE_TINT}
      className="v2-stage v2-tooth relative border-t border-bone/10"
    >
      <Descent />
      <div className="mx-auto max-w-[1320px] px-5 py-20 md:px-8 md:py-28">
        <h2 className="rfx-athletic v2-display max-w-[18ch] text-[clamp(30px,5vw,52px)] leading-[0.94]">
          The other doors.
        </h2>
        <p className="mt-4 max-w-[54ch] text-[15px] leading-relaxed text-bone-2">
          More doors open off the same atlas, each a different angle on the one craft.
        </p>

        <div className="mt-10 grid grid-cols-1 gap-4 md:grid-cols-2">
          <Link
            to="/craftsmen"
            className="v2-mount group block rounded-[3px] border border-bone/12 bg-[#0d0c0b] p-7 transition-colors hover:border-bone/30 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-bone"
            style={{ '--i': 0 } as React.CSSProperties}
          >
            <p className="rfx-athletic text-[clamp(24px,3.4vw,34px)] text-bone">The Craftsmen</p>
            <p className="mt-2 max-w-[46ch] text-[14.5px] leading-relaxed text-bone-2">
              The arms that owned a pitch. Every quote in here is real and carries its source.
            </p>
            <span className="mt-5 inline-block font-mono text-[10px] uppercase tracking-[0.14em] text-bone-2 transition-colors group-hover:text-bone">
              Step into the hall <span aria-hidden="true">→</span>
            </span>
          </Link>

          <Link
            to="/lost-pitches"
            className="v2-mount group block rounded-[3px] border border-bone/12 bg-[#0d0c0b] p-7 transition-colors hover:border-bone/30 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-bone"
            style={{ '--i': 1 } as React.CSSProperties}
          >
            <p className="rfx-athletic text-[clamp(24px,3.4vw,34px)] text-bone">
              Lost Pitches of the Negro Leagues
            </p>
            <p className="mt-2 max-w-[46ch] text-[14.5px] leading-relaxed text-bone-2">
              The statistics are being recovered; the technique mostly never will be. Every entry
              wears the tier its record can actually support.
            </p>
            <span className="mt-5 inline-block font-mono text-[10px] uppercase tracking-[0.14em] text-bone-2 transition-colors group-hover:text-bone">
              Enter the archive <span aria-hidden="true">→</span>
            </span>
          </Link>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
          {RAIL.map((item, index) => (
            <Link
              key={item.to}
              to={item.to}
              className="v2-mount group flex flex-col rounded-[3px] border border-bone/10 bg-[#0b0a09] p-5 transition-colors hover:border-bone/25 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-bone"
              style={{ '--i': index + 2 } as React.CSSProperties}
            >
              <span className="rfx-athletic text-[clamp(18px,2.4vw,22px)] text-bone">{item.label}</span>
              <span className="mt-1 text-[13px] leading-snug text-bone-2">{item.note}</span>
              <span className="mt-3 font-mono text-[9.5px] uppercase tracking-[0.14em] text-bone-2 transition-colors group-hover:text-bone">
                Open <span aria-hidden="true">→</span>
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
