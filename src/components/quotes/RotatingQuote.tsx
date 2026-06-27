import { useRotatingQuote } from '../../hooks/useRotatingQuote'

/*
  A quiet, rotating line from the quote pool: pitching craft, the mental game, and
  the philosophy of the game and of life. It changes per page, never animates, and
  never competes with the content around it. The attribution links to the source,
  so even the easter-egg layer wears its provenance. SSG-safe and reduced-motion-safe
  by construction (no animation, the pick rotates client-side per route).
*/
export function RotatingQuote({
  variant = 'footer',
  className = '',
}: {
  variant?: 'footer' | 'panel'
  className?: string
}) {
  const q = useRotatingQuote()
  const panel = variant === 'panel'

  return (
    <figure className={className}>
      <blockquote
        className={
          panel
            ? 'font-display text-lg italic leading-relaxed text-bone-2 md:text-xl'
            : 'font-display text-[15px] italic leading-relaxed text-bone-2/85 md:text-base'
        }
      >
        &ldquo;{q.claim.value}&rdquo;
      </blockquote>
      <figcaption className="mono-label-stage mt-2 text-bone-2/65">
        {q.claim.source ? (
          <a
            href={q.claim.source.url}
            target="_blank"
            rel="noopener noreferrer"
            className="link-stitch transition-colors hover:text-bone"
          >
            {q.attribution}
          </a>
        ) : (
          q.attribution
        )}
        {q.context ? <span className="text-bone-2/45"> &middot; {q.context}</span> : null}
      </figcaption>
    </figure>
  )
}
