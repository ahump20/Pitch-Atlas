import { Link } from 'react-router-dom'
import { LOST_PITCHES } from '../../data/lost-pitches'
import { TierMarker } from '../layout/TierMarker'

/*
  The home doorway into Lost Pitches of the Negro Leagues: the premise, then the
  filed entries as named links when they exist. Kept on the stage-cream surface like
  the other teasers, with the seam accent that the wing carries throughout, because
  this is the wing where provenance is the whole subject.
*/
export function LostPitchesTeaser() {
  const entries = LOST_PITCHES

  return (
    <section className="border-t border-navy/12 bg-paper-2/40">
      <div className="mx-auto max-w-6xl px-5 py-20 md:px-8 md:py-24">
        <TierMarker index="N" label="Lost Pitches of the Negro Leagues" />
        <div className="grid grid-cols-1 gap-x-10 gap-y-6 md:grid-cols-12">
          <div className="md:col-span-5">
            <h2 className="display text-3xl leading-tight text-ink md:text-4xl">The pitches the box scores cannot hold.</h2>
          </div>
          <p className="max-w-[60ch] self-end text-lg leading-relaxed text-ink-2 md:col-span-7">
            The statistics are being recovered. The technique mostly never will be. Satchel Paige’s
            banned hesitation pitch, Hilton Smith’s documented curve, the doctored-ball craft that was
            permitted in Black baseball and outlawed in the white one. Filed by how solid the record is,
            because here that is the whole story.
          </p>
        </div>

        {entries.length > 0 ? (
          <ul className="mt-12 grid grid-cols-1 gap-px overflow-hidden rounded-sm border border-navy/12 sm:grid-cols-2 lg:grid-cols-3">
            {entries.map((p) => (
              <li key={p.slug}>
                <Link
                  to={`/lost-pitches/${p.slug}`}
                  className="group flex h-full items-center justify-between gap-3 bg-paper px-5 py-4 transition-colors hover:bg-paper-2"
                >
                  <span className="flex flex-col gap-0.5">
                    <span className="display text-lg leading-tight text-navy">{p.name}</span>
                    <span className="mono-label text-ink-3">{p.era}</span>
                  </span>
                  <span aria-hidden="true" className={`mono-label ${p.tier === 'legend' ? 'text-seam' : 'text-navy'}`}>
                    {p.specimenNo}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        ) : null}

        <Link
          to="/lost-pitches"
          className="mt-8 inline-flex items-center gap-2 rounded-sm border border-navy bg-navy px-5 py-3 font-mono text-sm tracking-wide text-bone transition-colors hover:bg-navy-2 active:translate-y-px"
        >
          Enter the archive
          <span aria-hidden="true">→</span>
        </Link>
      </div>
    </section>
  )
}
