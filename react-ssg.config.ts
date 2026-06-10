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
export default defineReactSsgConfig({
  history: 'browser',
  origin: 'https://pitch-atlas.com',
  routes,
  paths: ['/404', ...sitemapPaths()],
})
