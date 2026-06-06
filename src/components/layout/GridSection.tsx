import type { ReactNode } from 'react'
import { TierMarker } from './TierMarker'

/*
  A tier marker, an optional blurb, and a responsive card grid — the triple that
  RepertoirePage / CraftsmenHall / LostPitchesHall each repeated by hand. `cols`
  is the responsive grid suffix (default two-up; the halls pass a three-up).
*/
export function GridSection({
  index,
  label,
  blurb,
  cols = 'md:grid-cols-2',
  className,
  id,
  children,
}: {
  index: string
  label: string
  blurb?: string
  cols?: string
  className?: string
  id?: string
  children: ReactNode
}) {
  return (
    <section id={id} className={className}>
      <TierMarker index={index} label={label} />
      {blurb ? (
        <p className="mb-8 max-w-[64ch] text-base leading-relaxed text-ink-2">{blurb}</p>
      ) : null}
      <div className={`grid grid-cols-1 gap-5 ${cols}`}>{children}</div>
    </section>
  )
}
