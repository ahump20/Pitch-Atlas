import { Link } from 'react-router-dom'
import { SITE } from '../../config/site'

/*
  v2 · The close. One centered call back into the atlas: the searchable index is
  the front door, the lost-pitches wing the second. The brand voice signs off and
  the constitutional principle gets the last word, then it hands off to the footer.
  The whole centered block converges in as one settling unit — the film resolving.
*/
export function CloseCta() {
  return (
    <section className="v2-stage v2-tooth relative border-t border-bone/10">
      <div className="v2-close-converge mx-auto max-w-[760px] px-5 py-24 text-center md:px-8 md:py-32">
        <h2 className="rfx-athletic v2-display text-[clamp(32px,6vw,64px)] leading-[0.92]">
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

        <p className="mx-auto mt-8 max-w-[52ch] font-mono text-[10px] uppercase leading-relaxed tracking-[0.12em] text-bone-2/65">
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
