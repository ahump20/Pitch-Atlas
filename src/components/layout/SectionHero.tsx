import type { ReactNode } from 'react'
import { SeamGuide } from '../motion/SeamGuide'

/*
  The shared chapter header on the void field, extracted from RepertoirePage /
  CraftsmenHall / LostPitchesHall / the chapters, which each rolled the same
  markup. A faint accent wash and scorebook rules sit behind the mono eyebrow,
  display headline, and optional sub. Accent picks the wash tint: powder for the
  living catalog and the craftsmen, seam for the lost-pitches archive. An
  explicit .field-cream ancestor flips the semantic ink tokens for a light inset.
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
  atmoClassName,
  dense = false,
  children,
}: {
  eyebrow: string
  title: ReactNode
  sub?: ReactNode
  badge?: ReactNode
  breadcrumb?: ReactNode
  accent?: 'powder' | 'seam'
  atmoClassName?: string
  /* Compact header for a tool page whose interactive body should reach the fold
     (the Compare tunnel). Off by default so every hall header stays pixel-identical. */
  dense?: boolean
  children?: ReactNode
}) {
  return (
    <section className="relative overflow-hidden border-b border-bone/12">
      <div className="absolute inset-0 opacity-[0.5]" aria-hidden="true">
        <div
          className="h-full w-full"
          style={{
            backgroundImage: `radial-gradient(circle at 70% 30%, ${ACCENT_WASH[accent]}, transparent 40%), repeating-linear-gradient(90deg, color-mix(in srgb, var(--color-ink) 7%, transparent) 0 1px, transparent 1px 64px)`,
          }}
        />
      </div>
      {atmoClassName ? <div className={`pa-atmo ${atmoClassName}`} aria-hidden="true" /> : null}
      <div className={`relative z-[1] mx-auto max-w-6xl px-5 md:px-8 ${dense ? 'py-10 md:py-14' : 'py-20 md:py-28'}`}>
        {breadcrumb}
        <p className="rfx-skick">{eyebrow}</p>
        {badge ? <div className="mt-4">{badge}</div> : null}
        <h1
          className={`rfx-stitle mt-5 leading-[0.98] [text-wrap:balance] md:leading-[0.92] ${
            dense ? 'max-w-[24ch] text-[clamp(2rem,4.5vw,3.2rem)]' : 'max-w-[18ch] text-[clamp(2.2rem,8.5vw,4.8rem)]'
          }`}
        >
          {title}
        </h1>
        <SeamGuide variant="underline" className="mt-6" />
        {sub ? (
          <div className={`display mt-6 max-w-[60ch] italic leading-relaxed text-ink-2 ${dense ? 'text-base' : 'text-lg'}`}>
            {sub}
          </div>
        ) : null}
        {children}
      </div>
    </section>
  )
}
