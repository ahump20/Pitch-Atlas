import type { ExternalContentQuery } from '../../data/media/external'
import { useExternalContent } from '../../hooks/useExternalContent'
import { ExternalMediaCard } from './ExternalMediaCard'
import { MediaSuggestionForm } from './MediaSuggestionForm'

export function ExternalMediaRail({
  query,
  eyebrow = 'Fresh from the game',
  title = 'The craft keeps moving.',
  intro = 'Current lessons and old knowledge, filed where they are useful and kept with the people who shared them.',
  allowSuggestion = false,
  pitchSlug,
  className = '',
}: {
  query: ExternalContentQuery
  eyebrow?: string
  title?: string
  intro?: string
  allowSuggestion?: boolean
  pitchSlug?: string
  className?: string
}) {
  const { items, loading } = useExternalContent(query)
  if (items.length === 0) return null

  return (
    <section className={`relative border-y border-bone/8 bg-[#090807] ${className}`} aria-busy={loading || undefined}>
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_12%_20%,rgba(55,214,255,0.07),transparent_28%),radial-gradient(circle_at_88%_82%,rgba(213,49,45,0.08),transparent_30%)]" aria-hidden="true" />
      <div className="relative mx-auto max-w-[1240px] px-5 py-14 md:px-8 md:py-20">
        <div className="grid gap-5 md:grid-cols-[minmax(0,0.72fr)_minmax(0,1.28fr)] md:items-end">
          <div>
            <p className="rfx-skick text-cyan">{eyebrow}</p>
            <h2 className="rfx-stitle mt-3 text-[clamp(28px,4.8vw,50px)]">{title}</h2>
          </div>
          <p className="max-w-[62ch] text-[15px] leading-relaxed text-bone-2 md:justify-self-end">{intro}</p>
        </div>

        <div className={`mt-9 grid gap-5 ${items.length === 2 ? 'md:grid-cols-2' : 'md:grid-cols-2 xl:grid-cols-3'}`}>
          {items.map((item) => <ExternalMediaCard key={item.id} item={item} />)}
        </div>

        {allowSuggestion ? <MediaSuggestionForm pitchSlug={pitchSlug} /> : null}
      </div>
    </section>
  )
}
