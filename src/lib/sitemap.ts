import { PITCHES } from '../data/pitches'
import { CRAFTSMEN } from '../data/craftsmen'
import { LOST_PITCHES } from '../data/lost-pitches'
import { BASIC_REPERTOIRE } from '../data/repertoire'
import { WINGS } from '../data/knowledge'
import { SOFTBALL_PITCHES, SOFTBALL_CRAFTSMEN } from '../data/softball'

/*
  The sitemap, generated at build time from the SAME data arrays that drive the
  react-ssg prerender paths, so it cannot drift from what is actually published.
  The hand-written public/sitemap.xml this replaces went stale within days.

  Deliberately minimal entries: <loc> only. No <lastmod> — a build date is not a
  content date, and a fabricated freshness claim is worse than none ("Sourced,
  not corrected" applies to metadata too).

  STATIC_PATHS must mirror the static routes in src/routes.tsx. This module
  cannot import routes.tsx (that would pull every page component, and their
  asset imports, into the Vite config's load path), so the mirror is enforced
  by sitemap.test.ts instead, which flattens the real route table and compares.
*/

export const SITEMAP_ORIGIN = 'https://pitch-atlas.com'

/** Static routes, mirroring src/routes.tsx (enforced by sitemap.test.ts). */
export const STATIC_PATHS = [
  '/',
  '/repertoire',
  '/craftsmen',
  '/lost-pitches',
  '/learn',
  '/sources',
  '/sandbox',
  '/movement-map',
  '/compare',
  '/grips',
  '/softball',
  '/softball/fastpitch',
  '/softball/slowpitch',
  '/about',
  '/privacy',
  '/support',
] as const

/* Routes that prerender real HTML but are deliberately kept OUT of the public
   sitemap (and carry a noindex) until promoted: the /v2 "Refractor Case"
   prototype duplicates the home content and is not a published page yet. The
   sitemap test subtracts these before its parity check, so the drift alarm still
   fires for every real static route. Remove an entry here the day it ships. */
export const SITEMAP_EXCLUDED = ['/v2'] as const

/** Every published path, static + data-derived, without origin or trailing slash. */
export function sitemapPaths(): string[] {
  return [
    ...STATIC_PATHS,
    ...PITCHES.map((p) => `/pitch/${p.display.slug}`),
    ...BASIC_REPERTOIRE.map((e) => `/repertoire/${e.id}`),
    ...CRAFTSMEN.map((c) => `/craftsmen/${c.slug}`),
    ...LOST_PITCHES.map((p) => `/lost-pitches/${p.slug}`),
    ...WINGS.map((w) => `/learn/${w.slug}`),
    ...SOFTBALL_PITCHES.map((p) => `/softball/pitch/${p.slug}`),
    ...SOFTBALL_CRAFTSMEN.map((c) => `/softball/craftsmen/${c.slug}`),
  ]
}

/** Absolute, trailing-slash URLs — the canonical form Cloudflare Pages serves. */
export function sitemapUrls(): string[] {
  return sitemapPaths().map((p) => (p === '/' ? `${SITEMAP_ORIGIN}/` : `${SITEMAP_ORIGIN}${p}/`))
}

export function renderSitemapXml(): string {
  const entries = sitemapUrls()
    .map((url) => `  <url><loc>${url}</loc></url>`)
    .join('\n')
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${entries}\n</urlset>\n`
}
