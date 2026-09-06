import type { Source } from '../../data/types'

/*
  A source rendered as a credential: a link out, the season it covers, and an
  arrow marking that it leaves the page. Never bare text pretending to be a cite.
*/
export function SourceBadge({
  source,
  wrapLabel = false,
  className = '',
}: {
  source: Source
  wrapLabel?: boolean
  className?: string
}) {
  return (
    <a
      href={source.url}
      target="_blank"
      rel="noreferrer noopener"
      className={`mono-label min-w-0 max-w-full underline decoration-ink-3/40 decoration-1 underline-offset-2 transition-colors hover:text-ink hover:decoration-seam ${wrapLabel ? 'inline-block text-xs leading-relaxed [overflow-wrap:anywhere]' : 'inline-flex items-baseline gap-1'} ${className}`}
      title={`${source.label}${source.season ? ` / ${source.season}` : ''}. Opens in a new tab.`}
    >
      <span className={wrapLabel ? 'whitespace-normal' : 'min-w-0 max-w-[26ch] truncate'}>{source.label}</span>
      {source.season ? <>{wrapLabel ? ' ' : null}<span className="opacity-70">/ {source.season}</span></> : null}
      {wrapLabel ? ' ' : null}
      <span aria-hidden="true">{'↗'}</span>
    </a>
  )
}
