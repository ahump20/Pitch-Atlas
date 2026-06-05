import { Link } from 'react-router-dom'
import { useSeoMeta } from '@unhead/react'
import { SITE } from '../config/site'

/*
  An honest 404. No fabricated content, no redirect trickery: name the miss and
  point back into the three wings of the manual.
*/
export function NotFound() {
  useSeoMeta({ title: `Page not found | ${SITE.siteName}` })

  return (
    <section className="mx-auto flex min-h-[60vh] max-w-3xl flex-col items-start justify-center gap-6 px-5 py-24 md:px-8">
      <p className="mono-label text-seam">404 / off the page</p>
      <h1 className="display text-4xl leading-tight text-ink md:text-5xl">
        That file is not in the atlas.
      </h1>
      <p className="max-w-[56ch] text-lg leading-relaxed text-ink-2">
        The page you asked for is not filed here. Nothing is invented to cover the gap. Head back to
        the catalog, or read the craftsmen who defined the craft.
      </p>
      <div className="flex flex-wrap gap-3">
        <Link
          to="/"
          className="inline-flex items-center gap-2 rounded-sm border border-seam bg-seam px-5 py-3 font-mono text-sm tracking-wide text-cta-text transition-colors hover:bg-seam-deep"
        >
          The Atlas
          <span aria-hidden="true">→</span>
        </Link>
        <Link
          to="/craftsmen"
          className="inline-flex items-center gap-2 rounded-sm border border-navy/30 px-5 py-3 font-mono text-sm tracking-wide text-ink transition-colors hover:border-seam"
        >
          The Craftsmen
        </Link>
      </div>
    </section>
  )
}
