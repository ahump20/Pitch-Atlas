import { existsSync, readFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, it, expect } from 'vitest'
import { sitemapPaths } from '../lib/sitemap'

/*
  The post-build integrity gate: the configured prerender surface diffed against
  the HTML that actually landed in dist/. `npm run build` runs this file after
  vite build, so a route that silently failed to prerender — or prerendered as
  an empty app shell — fails the build by name instead of shipping a blank page.

  Expected surface = '/404' + sitemapPaths(), which is exactly what
  react-ssg.config.ts feeds the plugin (and sitemap.test.ts pins that list
  against the real route table, both directions). When dist/ is absent (a plain
  `npm test` before any build) the suite skips honestly rather than asserting
  against files that were never written.
*/

const DIST = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../dist')
const shouldCheckDist = process.env.PITCH_ATLAS_CHECK_DIST === '1'

function htmlFileFor(route: string): string {
  return route === '/' ? path.join(DIST, 'index.html') : path.join(DIST, ...route.split('/').filter(Boolean), 'index.html')
}

const EXPECTED = ['/404', ...sitemapPaths()]

describe.runIf(shouldCheckDist)('prerender integrity (post-build)', () => {
  it('has a fresh build output to inspect', () => {
    expect(existsSync(path.join(DIST, 'index.html'))).toBe(true)
  })

  it('prerendered every configured route to a real HTML file — none skipped', () => {
    const missing = EXPECTED.filter((route) => !existsSync(htmlFileFor(route)))
    expect(missing).toEqual([])
  })

  it('ships a real 404.html copied from the prerendered /404 route', () => {
    expect(existsSync(path.join(DIST, '404.html'))).toBe(true)
    const html = readFileSync(path.join(DIST, '404.html'), 'utf8')
    expect(html).toContain('That file is not in the atlas.')
  })

  it('every published page carries rendered content, never an empty shell', () => {
    const hollow: string[] = []
    for (const route of EXPECTED) {
      const file = htmlFileFor(route)
      if (!existsSync(file)) continue // named by the first assertion
      const html = readFileSync(file, 'utf8')
      // a real prerender carries a heading and the masthead's primary nav;
      // an unrendered shell is just the empty root div waiting for JS.
      if (!html.includes('<h1') || !html.includes('aria-label="Primary"')) {
        hollow.push(route)
      }
    }
    expect(hollow).toEqual([])
  })

  it('carries no failure signatures into the shipped HTML', () => {
    const bad = ['[object Object]', 'NaN<', '>undefined<', 'Loading...']
    const offenders: string[] = []
    for (const route of EXPECTED) {
      const file = htmlFileFor(route)
      if (!existsSync(file)) continue
      const html = readFileSync(file, 'utf8')
      if (bad.some((sig) => html.includes(sig))) offenders.push(route)
    }
    expect(offenders).toEqual([])
  })
})

describe.runIf(!shouldCheckDist)('prerender integrity (post-build gate not requested)', () => {
  it.skip('set PITCH_ATLAS_CHECK_DIST=1 after `vite build` to exercise the gate', () => {})
})
