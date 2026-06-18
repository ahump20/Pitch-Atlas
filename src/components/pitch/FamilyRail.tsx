import { Link } from 'react-router-dom'

/*
  A compact "others in this family" rail — the family siblings of a pitch as
  tappable chips that route to each sibling's page. The baseball specimen pages
  carry the richer PitchConnections (the arms who owned it + the siblings) on the
  coal scene; this is the lighter, cream-field counterpart for the basic Pitch
  Index files and the softball chapters, which otherwise dead-end on linear
  prev/next. Renders nothing when a pitch has no family sibling, so a one-pitch
  family shows no empty rail.
*/
export interface FamilyLink {
  to: string
  name: string
  accentColor: string
}

export function FamilyRail({ heading, items }: { heading: string; items: FamilyLink[] }) {
  if (items.length === 0) return null
  return (
    <section
      aria-label="Others in this family"
      className="mx-auto max-w-6xl border-t border-ink/15 px-5 py-12 md:px-8 md:py-14"
    >
      <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-ink-2">{heading}</p>
      <div className="mt-5 flex flex-wrap gap-3">
        {items.map((item) => (
          <Link
            key={item.to}
            to={item.to}
            className="group inline-flex items-center gap-2.5 rounded-full border border-ink/15 py-2 pl-3 pr-4 transition-colors hover:border-ink/40"
          >
            <span
              aria-hidden="true"
              className="h-2.5 w-2.5 flex-none rounded-full"
              style={{ background: item.accentColor }}
            />
            <span className="text-sm font-bold text-ink">{item.name}</span>
            <span
              aria-hidden="true"
              className="font-mono text-[11px] text-ink-3 transition-colors group-hover:text-seam"
            >
              →
            </span>
          </Link>
        ))}
      </div>
    </section>
  )
}
