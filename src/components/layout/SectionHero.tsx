import type { ReactNode } from 'react'

/*
  The hall header on the warm field, extracted from RepertoirePage /
  CraftsmenHall / LostPitchesHall / the chapters, which each rolled the same
  markup. A deeper cream band with a faint accent wash and the scorebook's
  vertical rules, a mono eyebrow, the display headline in ink, and an optional
  sub. Accent picks the wash tint: powder for the living catalog and the
  craftsmen, seam for the lost-pitches archive. Inside a .scene-coal wrapper the
  ink tokens re-tone to bone on their own.
*/
const ACCENT_WASH: Record<'powder' | 'seam', string> = {
  powder: 'rgba(75,146,219,0.12)',
  seam: 'rgba(200,16,46,0.10)',
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
    <section className="relative overflow-hidden border-b border-leather/25 bg-paper-2">
      <div className="absolute inset-0 opacity-[0.5]" aria-hidden="true">
        <div
          className="h-full w-full"
          style={{
            backgroundImage: `radial-gradient(circle at 70% 30%, ${ACCENT_WASH[accent]}, transparent 40%), repeating-linear-gradient(90deg, color-mix(in srgb, var(--color-ink) 7%, transparent) 0 1px, transparent 1px 64px)`,
          }}
        />
      </div>
      <div className="relative mx-auto max-w-6xl px-5 py-20 md:px-8 md:py-28">
        {breadcrumb}
        <p className="rfx-skick">{eyebrow}</p>
        {badge ? <div className="mt-4">{badge}</div> : null}
        <h1 className="rfx-stitle mt-5 max-w-[18ch] text-[2.8rem] leading-[0.92] md:text-[4.8rem]">
          {title}
        </h1>
        {sub ? (
          <div className="display mt-6 max-w-[60ch] text-lg italic leading-relaxed text-ink-2">{sub}</div>
        ) : null}
        {children}
      </div>
    </section>
  )
}
