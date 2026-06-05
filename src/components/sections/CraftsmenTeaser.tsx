import { Link } from 'react-router-dom'
import { CRAFTSMEN } from '../../data/craftsmen'
import { TierMarker } from '../layout/TierMarker'

/*
  The home page's doorway into the Craftsmen wing: the premise in a line, then
  every craftsman as a named link, so the home reads as a table of contents into
  all three wings, not just the pitch catalog.
*/
export function CraftsmenTeaser() {
  return (
    <section className="border-t border-navy/12 bg-paper-2/40">
      <div className="mx-auto max-w-6xl px-5 py-20 md:px-8 md:py-24">
        <TierMarker index="C" label="The Craftsmen" />
        <div className="grid grid-cols-1 gap-x-10 gap-y-6 md:grid-cols-12">
          <div className="md:col-span-5">
            <h2 className="display text-3xl leading-tight text-ink md:text-4xl">The arms that defined the pitches.</h2>
          </div>
          <p className="max-w-[60ch] self-end text-lg leading-relaxed text-ink-2 md:col-span-7">
            A pitch is a tool; a craftsman is who made it sing. The mental and physical edge of pitching,
            the intimidation, the conviction, the deception, told through the arms who owned a single
            pitch. Plus one pitch that is a legend rather than a person.
          </p>
        </div>

        <ul className="mt-12 grid grid-cols-1 gap-px overflow-hidden rounded-sm border border-navy/12 sm:grid-cols-2 lg:grid-cols-3">
          {CRAFTSMEN.map((c) => (
            <li key={c.slug}>
              <Link
                to={`/craftsmen/${c.slug}`}
                className="group flex h-full items-center justify-between gap-3 bg-paper px-5 py-4 transition-colors hover:bg-paper-2"
              >
                <span className="flex flex-col gap-0.5">
                  <span className="display text-lg leading-tight text-navy">{c.name}</span>
                  <span className="mono-label text-ink-3">{c.signaturePitch}</span>
                </span>
                <span aria-hidden="true" className={`mono-label ${c.kind === 'legend' ? 'text-teal' : 'text-seam'}`}>
                  {c.specimenNo}
                </span>
              </Link>
            </li>
          ))}
        </ul>

        <Link
          to="/craftsmen"
          className="mt-8 inline-flex items-center gap-2 rounded-sm border border-navy bg-navy px-5 py-3 font-mono text-sm tracking-wide text-bone transition-colors hover:bg-navy-2 active:translate-y-px"
        >
          Enter the Craftsmen
          <span aria-hidden="true">→</span>
        </Link>
      </div>
    </section>
  )
}
