import { Link } from 'react-router-dom'

/*
  One breadcrumb, extracted from the four pages that each rolled their own. A trail
  of crumbs: every crumb but the last is a link; the last is the current page, plain.
  Defaults to the dark-stage tone (bone ink) since breadcrumbs live inside the
  section hero; pass tone="ink" to sit it on a cream surface.
*/
export interface Crumb {
  label: string
  to?: string
}

export function Breadcrumb({
  trail,
  tone = 'stage',
}: {
  trail: Crumb[]
  tone?: 'stage' | 'ink'
}) {
  const base =
    tone === 'stage'
      ? 'text-bone-2/80'
      : 'text-ink-2'
  // One link hover state across the chrome: the cyan interactive accent.
  const linkHover = 'hover:text-cyan'
  const current = tone === 'stage' ? 'text-bone-2' : 'text-ink'

  return (
    <nav
      aria-label="Breadcrumb"
      className={`mb-6 flex flex-wrap items-center gap-2 font-mono text-[11px] uppercase tracking-[0.14em] ${base}`}
    >
      {trail.map((crumb, i) => {
        const last = i === trail.length - 1
        return (
          <span key={`${crumb.label}-${i}`} className="flex items-center gap-2">
            {crumb.to && !last ? (
              <Link to={crumb.to} className={`transition-colors ${linkHover}`}>
                {crumb.label}
              </Link>
            ) : (
              <span className={current}>{crumb.label}</span>
            )}
            {!last ? <span aria-hidden="true">/</span> : null}
          </span>
        )
      })}
    </nav>
  )
}
