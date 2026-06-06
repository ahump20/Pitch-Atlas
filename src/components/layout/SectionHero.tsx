import type { ReactNode } from 'react'

/*
  The dark-stage section hero, extracted from RepertoirePage / CraftsmenHall /
  LostPitchesHall / the chapters, which each rolled the same markup. A near-black
  chamber with a faint accent wash and instrument grid, a mono eyebrow, the display
  headline, and an optional sub. Accent picks the wash tint: powder for the living
  catalog and the craftsmen, seam for the lost-pitches archive.
*/
const ACCENT_WASH: Record<'powder' | 'seam', string> = {
  powder: 'rgba(108,172,228,0.16)',
  seam: 'rgba(200,16,46,0.16)',
}

export function SectionHero({
  eyebrow,
  title,
  sub,
  badge,
  breadcrumb,
  accent = 'powder',
  children,
}: {
  eyebrow: string
  title: ReactNode
  sub?: ReactNode
  badge?: ReactNode
  breadcrumb?: ReactNode
  accent?: 'powder' | 'seam'
  children?: ReactNode
}) {
  return (
    <section className="on-stage relative overflow-hidden">
      <div className="absolute inset-0 opacity-[0.1]" aria-hidden="true">
        <div
          className="h-full w-full bg-[size:auto,34px_34px]"
          style={{
            backgroundImage: `radial-gradient(circle at 70% 30%, ${ACCENT_WASH[accent]}, transparent 40%), linear-gradient(115deg, rgba(242,236,221,0.07) 0 1px, transparent 1px 100%)`,
          }}
        />
      </div>
      <div className="relative mx-auto max-w-6xl px-5 py-20 md:px-8 md:py-28">
        {breadcrumb}
        <p className="mono-label-stage">{eyebrow}</p>
        {badge ? <div className="mt-4">{badge}</div> : null}
        <h1 className="display mt-4 max-w-[20ch] text-[2.6rem] leading-[1.0] text-bone md:text-[4.4rem]">
          {title}
        </h1>
        {sub ? (
          <div className="mt-6 max-w-[60ch] text-lg leading-relaxed text-bone-2">{sub}</div>
        ) : null}
        {children}
      </div>
    </section>
  )
}
