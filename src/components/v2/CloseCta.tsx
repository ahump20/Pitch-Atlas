import { Link } from 'react-router-dom'
import { SITE } from '../../config/site'
import { allSources, latestRetrievedAt } from '../../data/sources'
import { asOfDate } from '../../lib/format'
import { ChapterMark } from './ChapterMark'

/*
  v2 · The close. One centered call back into the atlas, then the honesty
  contract as the last word — the full rule sheet (NEVER / ALWAYS) and the
  colophon counted and dated from the registry, so the principle the rest of the
  page relocated here lands with its evidence attached. Then the brand voice
  signs off and it hands to the footer.
*/

/* The honesty contract: the lines the product, the data model, and the
   community floor all hold. Editorial copy — this is the home's canonical rule
   sheet now; the old editorial home that mirrored it was retired on promotion. */
const NEVER = [
  'Fake community posts',
  'Fake adoption counts',
  'Fake verified-pro badges',
  'Hardcoded freshness',
  'Unlicensed agency photos',
  'Team or league marks',
  'Copied instructional prose',
  'Unsourced grip claims',
  'Runtime API for pitch data',
  'Geometry for an unmeasured pitch',
]
const ALWAYS = ['Real grip photos, clean sources', 'A source on every claim']

/* the colophon figures, derived from the registry at build — never typed by hand */
const REGISTRY_COUNT = allSources().length
const REGISTRY_AS_OF = asOfDate(latestRetrievedAt(allSources()))

export function CloseCta() {
  return (
    <section className="v2-stage v2-tooth relative border-t border-bone/10">
      <div className="mx-auto max-w-[760px] px-5 pt-24 text-center md:px-8 md:pt-32">
        <div className="v2-close-converge">
          <ChapterMark n="09" name="The Atlas" className="justify-center" />
          <h2 className="rfx-athletic v2-display mt-5 text-[clamp(32px,6vw,64px)] leading-[0.98] [text-wrap:balance] md:leading-[0.92]">
            Open the whole atlas.
          </h2>
          <p className="mx-auto mt-5 max-w-[48ch] text-[15.5px] leading-relaxed text-bone-2">
            Every accepted pitch by family, the lost grips history dropped, and a source on every line.
            Start at the index and pull whatever you want to hold.
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link to="/repertoire" className="v2-cta">
              Open the Pitch Index <span aria-hidden="true">→</span>
            </Link>
            <Link to="/lost-pitches" className="v2-cta is-ghost">
              The lost pitches <span aria-hidden="true">→</span>
            </Link>
          </div>
        </div>
      </div>

      {/* the honesty contract — the relocated principle, now carrying its evidence */}
      <div className="mx-auto mt-16 max-w-[1100px] px-5 pb-8 md:px-8">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(260px,300px)] lg:items-end">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-bone-2/80">
              The honesty contract
            </p>
            <h3 className="rfx-athletic mt-2 max-w-[18ch] text-[clamp(22px,3.4vw,34px)] leading-[0.98] text-bone">
              What we will <span className="text-seam">never fake</span>.
            </h3>
            <p className="mt-3 max-w-[58ch] text-[14px] leading-relaxed text-bone-2">
              The chrome is decoration. The provenance is the point. These lines are load-bearing — in
              the product, the data model, and the community floor in equal measure.
            </p>
          </div>

          {/* colophon — registry counted and dated, derived, never auto-refreshed */}
          <aside
            className="rounded-[3px] border border-bone/12 bg-[#0d0c0b] p-5"
            aria-label="Citation registry colophon"
          >
            <p className="flex items-baseline gap-2.5">
              <b className="rfx-athletic text-[clamp(28px,3.4vw,38px)] leading-none text-bone">
                {REGISTRY_COUNT}
              </b>
              <span className="text-[13px] leading-snug text-bone-2">sources in the citation registry</span>
            </p>
            <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.12em] text-bone-2/75">
              Last checked {REGISTRY_AS_OF} · not auto-refreshed
            </p>
            <Link
              to="/sources"
              className="mt-3 inline-block font-mono text-[10px] uppercase tracking-[0.14em] text-bone-2 transition-colors hover:text-cyan"
            >
              Open the registry <span aria-hidden="true">→</span>
            </Link>
          </aside>
        </div>

        {/* the rule sheet itself */}
        <div className="mt-6 rounded-[3px] border border-bone/12 bg-[#0b0a09] p-6 md:p-8">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h4 className="font-mono text-[12px] font-bold uppercase tracking-[0.1em] text-bone">
              Pitch Atlas <span aria-hidden="true">★</span> rule sheet
            </h4>
            <span className="font-mono text-[9px] uppercase tracking-[0.14em] text-bone-2/70">On the record</span>
          </div>

          <div className="mt-5 grid grid-cols-1 gap-x-10 sm:grid-cols-2">
            {NEVER.map((item) => (
              <div key={item} className="flex items-center gap-3 border-b border-bone/8 py-2.5">
                <span className="flex-none font-mono text-[9px] font-bold uppercase tracking-[0.1em] text-[#E0727E]">
                  Never
                </span>
                <span className="font-mono text-[11px] uppercase tracking-[0.04em] text-bone-2">{item}</span>
              </div>
            ))}
            {ALWAYS.map((item) => (
              <div key={item} className="flex items-center gap-3 border-b border-bone/8 py-2.5">
                <span className="flex-none font-mono text-[9px] font-bold uppercase tracking-[0.1em] text-[#6FCB9F]">
                  Always
                </span>
                <span className="font-mono text-[11px] font-bold uppercase tracking-[0.04em] text-bone">{item}</span>
              </div>
            ))}
          </div>

          <div className="mt-6 border-t border-bone/15 pt-3">
            <p className="font-mono text-[9px] uppercase leading-relaxed tracking-[0.06em] text-bone-2/70">
              Every claim is labeled by its source, not declared right or wrong.{' '}
              <Link to="/sources" className="text-bone underline underline-offset-2 hover:text-cyan">
                How a claim is filed →
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* the principle gets the last word, then the brand voice signs off */}
      <div className="mx-auto max-w-[760px] px-5 pb-24 text-center md:px-8 md:pb-32">
        <p className="mx-auto max-w-[52ch] font-mono text-[10px] uppercase leading-relaxed tracking-[0.12em] text-bone-2/65">
          No fabricated spin, velocity, or break. No scraped imagery. No copied prose.{' '}
          {SITE.sourcePrinciple}.
        </p>
        <p className="mx-auto mt-5 font-mono text-[10px] uppercase tracking-[0.18em] text-bone-2">
          {SITE.brandLine}
        </p>
      </div>
    </section>
  )
}
