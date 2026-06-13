import type { RouteObject } from 'react-router-dom'
import { defineReactSsgConfig } from 'vite-plugin-react-ssg'
import { routes } from './src/routes'
import { sitemapPaths } from './src/lib/sitemap'

/*
  Build-time prerender targets, derived — never hand-listed. sitemapPaths()
  builds the complete published surface from the route table's static mirror
  plus the data arrays (pitches, basic repertoire, craftsmen, lost pitches,
  knowledge wings, softball), so adding an entry to the data automatically adds
  its prerender path and its sitemap line in the same motion; sitemap.test.ts
  pins the static mirror against src/routes.tsx, and the post-build integrity
  test (src/test/prerender-integrity.test.ts, run by `npm run build`) diffs
  this list against the HTML that actually landed in dist/.

  '/404' is the one extra: the catch-all splat the plugin cannot discover. The
  post-build step in vite.config.ts copies its output to 404.html so Cloudflare
  Pages serves a real 404 (status and all) for unknown paths.
*/

/*
  The routes are code-split (route-level `lazy` in src/routes.tsx), but the
  plugin loads this config through a short-lived Vite module runner and closes
  it BEFORE prerendering — a lazy() that fires during render finds a dead
  runner and every page prerenders as an error shell. So the chunks resolve
  HERE, by top-level await while the runner is still open, and the plugin gets
  an eager route table. The client bundle never sees this file; it keeps the
  real per-page splits.
*/
async function resolveLazyRoutes(list: RouteObject[]): Promise<RouteObject[]> {
  return Promise.all(
    list.map(async (route) => {
      const { lazy, children, ...rest } = route
      return {
        ...rest,
        ...(typeof lazy === 'function' ? await lazy() : null),
        ...(children ? { children: await resolveLazyRoutes(children) } : null),
      } as RouteObject
    }),
  )
}

export default defineReactSsgConfig({
  history: 'browser',
  origin: 'https://pitch-atlas.com',
  routes: await resolveLazyRoutes(routes),
  paths: ['/404', ...sitemapPaths()],
})
