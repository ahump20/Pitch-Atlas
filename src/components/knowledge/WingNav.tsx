import { Link } from 'react-router-dom'
import type { KnowledgeWing } from '../../data/knowledge/types'

/*
  The reading path's spine. A wing used to end at the discussion floor — a dead
  end in an archive that is meant to be read in order. This is the page-turn:
  where you are in the ten, the wing before, the wing after, and the way back to
  the contents. Mirrors the Craftsmen chapter walk so the whole atlas turns pages
  the same way. On the warm Learn field — ink hairlines, a cyan turn.
*/
export function WingNav({
  prev,
  next,
  position,
  total,
}: {
  prev?: KnowledgeWing
  next?: KnowledgeWing
  position: number
  total: number
}) {
  const pad = (n: number) => String(n).padStart(2, '0')
  return (
    <nav aria-label="Learn wings" className="border-t border-ink/15">
      <div className="mx-auto grid max-w-6xl grid-cols-1 items-stretch gap-4 px-5 py-12 md:grid-cols-3 md:px-8">
        <div className="md:justify-self-start">
          {prev ? (
            <Link
              to={`/learn/${prev.slug}`}
              className="group flex flex-col gap-1 rounded-sm border-l-2 border-l-cyan/40 px-4 py-3 transition-colors hover:border-l-cyan"
            >
              <span className="mono-label text-ink-3">← Wing {pad(position - 1)}</span>
              <span className="font-athletic text-lg uppercase text-ink">
                {prev.navLabel || prev.title}
              </span>
            </Link>
          ) : null}
        </div>
        <Link
          to="/learn"
          className="flex flex-col items-center justify-center gap-1 rounded-sm border border-ink/15 px-4 py-3 text-center transition-colors hover:border-cyan md:justify-self-center"
        >
          <span className="mono-label text-cyan">
            Wing {pad(position)} of {pad(total)}
          </span>
          <span className="text-sm leading-snug text-ink-2">Back to the craft record →</span>
        </Link>
        <div className="md:justify-self-end">
          {next ? (
            <Link
              to={`/learn/${next.slug}`}
              className="group flex flex-col gap-1 rounded-sm border-r-2 border-r-cyan/40 px-4 py-3 text-right transition-colors hover:border-r-cyan"
            >
              <span className="mono-label text-ink-3">Wing {pad(position + 1)} →</span>
              <span className="font-athletic text-lg uppercase text-ink">
                {next.navLabel || next.title}
              </span>
            </Link>
          ) : null}
        </div>
      </div>
    </nav>
  )
}
