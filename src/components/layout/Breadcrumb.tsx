import { Link } from 'react-router-dom'

/*
  One breadcrumb, extracted from the four pages that each rolled their own. A
  trail of crumbs: every crumb but the last is a link; the last is the current
  page, plain. Scene-aware by token: the ink utilities re-tone to bone inside a
  .scene-coal section, so the same markup reads on the cream field and the coal
  scene alike. The `tone` prop survives for callers that pinned it; both tones
  now resolve through the scene tokens.
*/
export interface Crumb {
  label: string
  to?: string
}

export function Breadcrumb({
  trail,
}: {
  trail: Crumb[]
  /** Kept for caller compatibility; tone now follows the scene tokens. */
  tone?: 'stage' | 'ink'
}) {
  return (
    <nav
      aria-label="Breadcrumb"
      className="mb-6 flex flex-wrap items-center gap-2 font-mono text-[11px] uppercase tracking-[0.14em] text-ink-2"
    >
      {trail.map((crumb, i) => {
        const last = i === trail.length - 1
        return (
          <span key={`${crumb.label}-${i}`} className="flex items-center gap-2">
            {crumb.to && !last ? (
              <Link to={crumb.to} className="link-stitch transition-colors hover:text-[var(--ctl-accent)]">
                {crumb.label}
              </Link>
            ) : (
              <span className="text-ink">{crumb.label}</span>
            )}
            {!last ? <span aria-hidden="true">/</span> : null}
          </span>
        )
      })}
    </nav>
  )
}
