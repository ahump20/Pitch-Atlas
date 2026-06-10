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
      <p className="rfx-skick">404 / off the page</p>
      <h1 className="rfx-stitle text-4xl leading-tight md:text-5xl">
        That file is not in the atlas.
      </h1>
      <p className="max-w-[56ch] text-lg leading-relaxed text-ink-2">
        The page you asked for is not filed here. Nothing is invented to cover the gap. Head back to
        the catalog, or read the craftsmen who defined the craft.
      </p>
      <div className="flex flex-wrap gap-3">
        <Link
          to="/"
          className="inline-flex items-center gap-2 rounded-sm border border-cyan bg-cyan px-5 py-3 font-mono text-sm tracking-wide text-[#06121b] transition-colors hover:bg-cyan-deep"
        >
          The Atlas
          <span aria-hidden="true">→</span>
        </Link>
        <Link
          to="/craftsmen"
          className="inline-flex items-center gap-2 rounded-sm border border-cyan/60 px-5 py-3 font-mono text-sm tracking-wide text-cyan transition-colors hover:bg-cyan/10 hover:border-cyan"
        >
          The Craftsmen
        </Link>
      </div>
    </section>
  )
}
