import { Link } from 'react-router-dom'
import { REPERTOIRE, REPERTOIRE_FAMILIES, repertoireByFamily } from '../../data/repertoire'
import { TierMarker } from '../layout/TierMarker'

/*
  The home doorway into The Repertoire: the premise in a line, then the five
  families as a compact index with a count each, so the home reads as a table of
  contents into the whole catalog, not just the filed specimens.
*/
export function RepertoireTeaser() {
  const total = REPERTOIRE.length

  return (
    <section className="border-t border-navy/12">
      <div className="mx-auto max-w-6xl px-5 py-20 md:px-8 md:py-24">
        <TierMarker index="R" label="The Repertoire" />
        <div className="grid grid-cols-1 gap-x-10 gap-y-6 md:grid-cols-12">
          <div className="md:col-span-5">
            <h2 className="display text-3xl leading-tight text-ink md:text-4xl">Every accepted pitch, by family.</h2>
          </div>
          <p className="max-w-[60ch] self-end text-lg leading-relaxed text-ink-2 md:col-span-7">
            About fifteen the tracking systems tag, seven or eight that win most games, thirty-plus a
            pitching lab will name by grip and intent. The full map — fastballs to the banned doctored
            family — each a sourced one-liner, the edges labeled honestly. An alias is an alias; a name
            that is not a real pitch says so.
          </p>
        </div>

        <ul className="mt-12 grid grid-cols-1 gap-px overflow-hidden rounded-sm border border-navy/12 sm:grid-cols-2 lg:grid-cols-3">
          {REPERTOIRE_FAMILIES.map((fam) => {
            const n = repertoireByFamily(fam.family).length
            return (
              <li key={fam.family}>
                <Link
                  to={`/repertoire#${fam.family}`}
                  className="group flex h-full items-center justify-between gap-3 bg-paper px-5 py-4 transition-colors hover:bg-paper-2"
                >
                  <span className="flex flex-col gap-0.5">
                    <span className="display text-lg leading-tight text-navy">{fam.label}</span>
                    <span className="mono-label text-ink-3">
                      {n > 0 ? `${n} filed` : 'filing'}
                    </span>
                  </span>
                  <span aria-hidden="true" className="mono-label text-seam">→</span>
                </Link>
              </li>
            )
          })}
        </ul>

        <Link
          to="/repertoire"
          className="mt-8 inline-flex items-center gap-2 rounded-sm border border-navy bg-navy px-5 py-3 font-mono text-sm tracking-wide text-bone transition-colors hover:bg-navy-2 active:translate-y-px"
        >
          {total > 0 ? `Open the catalog (${total} pitches)` : 'Open the catalog'}
          <span aria-hidden="true">→</span>
        </Link>
      </div>
    </section>
  )
}
