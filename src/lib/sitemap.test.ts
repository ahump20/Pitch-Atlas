import { describe, it, expect } from 'vitest'
import type { RouteObject } from 'react-router-dom'
import { routes } from '../routes'
import { SITEMAP_ORIGIN, STATIC_PATHS, SITEMAP_EXCLUDED, sitemapPaths, sitemapUrls, renderSitemapXml } from './sitemap'

/*
  The sitemap module cannot import routes.tsx (it would drag every page component
  into the Vite config's load path), so STATIC_PATHS is a hand-kept mirror of the
  static routes. This suite is the drift alarm: it flattens the real route table
  and demands exact parity, both directions. Add a static route without updating
  the sitemap — or the reverse — and the build's own test gate names the miss.
*/

function flattenStaticPaths(routeList: RouteObject[], parent = ''): string[] {
  const found: string[] = []
  for (const route of routeList) {
    const segment = route.index ? '' : (route.path ?? '')
    if (segment.includes(':') || segment === '*') continue
    const full = `${parent}/${segment}`.replace(/\/+/g, '/').replace(/\/$/, '') || '/'
    if (route.children) {
      found.push(...flattenStaticPaths(route.children, full === '/' ? '' : full))
    }
    if (route.index || (route.path && !route.children)) {
      found.push(full)
    }
  }
  return found
}

describe('sitemap', () => {
  it('STATIC_PATHS exactly mirrors the static routes in routes.tsx (minus deliberate exclusions)', () => {
    const excluded = new Set<string>(SITEMAP_EXCLUDED)
    const fromRoutes = [...new Set(flattenStaticPaths(routes))].filter((p) => !excluded.has(p)).sort()
    const fromSitemap = [...STATIC_PATHS].sort()
    expect(fromSitemap).toEqual(fromRoutes)
  })

  it('covers the published surface: 100+ URLs including the new pages and specimens', () => {
    const urls = sitemapUrls()
    expect(urls.length).toBeGreaterThanOrEqual(100)
    expect(urls).toContain(`${SITEMAP_ORIGIN}/`)
    expect(urls).toContain(`${SITEMAP_ORIGIN}/privacy/`)
    expect(urls).toContain(`${SITEMAP_ORIGIN}/support/`)
    expect(urls).toContain(`${SITEMAP_ORIGIN}/pitch/four-seam/`)
    expect(urls).toContain(`${SITEMAP_ORIGIN}/craftsmen/bob-gibson/`)
    expect(urls).toContain(`${SITEMAP_ORIGIN}/softball/pitch/riseball/`)
  })

  it('emits trailing-slash URLs only, with no duplicates and no 404 entry', () => {
    const urls = sitemapUrls()
    expect(new Set(urls).size).toBe(urls.length)
    for (const url of urls) {
      expect(url.startsWith(`${SITEMAP_ORIGIN}/`)).toBe(true)
      expect(url.endsWith('/')).toBe(true)
    }
    expect(sitemapPaths()).not.toContain('/404')
  })

  it('renders valid urlset XML with no lastmod (no fabricated freshness)', () => {
    const xml = renderSitemapXml()
    expect(xml).toContain('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">')
    expect(xml).toContain(`<loc>${SITEMAP_ORIGIN}/repertoire/</loc>`)
    expect(xml).not.toContain('<lastmod>')
    expect(xml.match(/<url>/g)?.length).toBe(sitemapUrls().length)
  })
})
