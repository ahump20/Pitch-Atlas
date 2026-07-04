import { Link } from 'react-router-dom'
import { WINGS } from '../../data/knowledge'
import { ChapterMark } from './ChapterMark'
import { Descent } from '../motion/Descent'

/*
  v2 · The craft record. Not just what each pitch is — how the craft works
  underneath. The ten knowledge chapters as a set checklist on matte stock: each
  square is filled because the chapter is in the data (filed, not aspirational),
  and each links into its wing. The dark inset register echoes the provenance
  colophon, the v2 counterpoint to the home's cream card back.
*/
export function FieldManual() {
  return (
    <section data-scene-tint="#4B92DB" className="v2-stage v2-tooth relative border-t border-bone/10">
      <Descent />
      <div className="mx-auto max-w-[1320px] px-5 py-20 md:px-8 md:py-28">
        <ChapterMark n="07" name="The Craft Record" />
        <div className="mt-4 flex flex-wrap items-end justify-between gap-3">
          <h2 className="rfx-athletic v2-display max-w-[16ch] text-[clamp(28px,5vw,52px)] leading-[0.94]">
            The craft record.
          </h2>
          <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-bone-2/75">
            {WINGS.length} chapters, all sourced
          </span>
        </div>
        <p className="mt-4 max-w-[58ch] text-[15px] leading-relaxed text-bone-2">
          Ten sourced chapters on how the craft works underneath: spin into shape, grip into seam,
          the tunnel, the source boundary, and the rest. Every one published and checked off.
        </p>

        <ol className="mt-9 grid grid-cols-1 gap-x-10 sm:grid-cols-2">
          {WINGS.map((w, i) => (
            <li
              key={w.slug}
              className="v2-rung border-b border-bone/10"
              style={{ '--i': i } as React.CSSProperties}
            >
              <Link
                to={`/learn/${w.slug}`}
                className="group flex items-baseline gap-3 py-3.5 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-bone"
              >
                <span className="font-mono text-[11px] text-cyan" aria-hidden="true">■</span>
                <span className="font-mono text-[11px] tabular-nums text-bone-2/70">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <span className="min-w-0">
                  <span className="block font-mono text-[11px] font-bold uppercase tracking-[0.06em] text-bone underline-offset-2 group-hover:underline md:text-[12px]">
                    {w.navLabel || w.title}
                  </span>
                  <span className="mt-0.5 hidden text-[13px] leading-snug text-bone-2 md:line-clamp-1">
                    {w.summary}
                  </span>
                </span>
              </Link>
            </li>
          ))}
        </ol>

        <Link
          to="/learn"
          className="mt-8 inline-block font-mono text-[10px] uppercase tracking-[0.14em] text-bone transition-colors hover:text-cyan"
        >
          Open the craft record <span aria-hidden="true">→</span>
        </Link>
      </div>
    </section>
  )
}
