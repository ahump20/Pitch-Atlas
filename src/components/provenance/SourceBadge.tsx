import type { Source } from '../../data/types'

/*
  A source rendered as a credential: a link out, the season it covers, and an
  arrow marking that it leaves the page. Never bare text pretending to be a cite.
*/
export function SourceBadge({
  source,
  className = '',
}: {
  source: Source
  className?: string
}) {
  return (
    <a
      href={source.url}
      target="_blank"
      rel="noreferrer noopener"
      className={`mono-label inline-flex items-baseline gap-1 underline decoration-ink-3/40 decoration-1 underline-offset-2 transition-colors hover:text-ink hover:decoration-seam ${className}`}
      title={`${source.label}${source.season ? ` / ${source.season}` : ''}. Opens in a new tab.`}
    >
      <span className="max-w-[26ch] truncate">{source.label}</span>
      {source.season ? <span className="opacity-70">/ {source.season}</span> : null}
      <span aria-hidden="true">{'↗'}</span>
    </a>
  )
}
