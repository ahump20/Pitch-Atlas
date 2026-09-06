import '../../styles/archive.css'
import { CompareProvider } from '../compare/CompareProvider'
import { CompareTray } from '../compare/CompareTray'
import { useEffect, useRef } from 'react'
import { useHead } from '@unhead/react'
import { Outlet, useLocation, useNavigationType } from 'react-router-dom'
import { Masthead } from './Masthead'
import { SiteFooter } from './SiteFooter'
import { scrollToId } from '../../lib/scroll'
import { canonicalUrl, siteJsonLd } from '../../lib/seo'
import { Toaster } from '../ui/sonner'
import { TooltipProvider } from '../ui/tooltip'
import { PipProvider } from '../embeds/pip'
import { EggProvider } from '../eggs/EggProvider'
import { TidbitReveal } from '../eggs/TidbitReveal'
import { FoundIndex } from '../eggs/FoundIndex'

/*
  The shell every route renders inside. The dark void is the global field, with
  the rainbow-foil masthead and the leather footer persisting around each
  chapter. Cream is reserved for explicit .field-cream insets and physical card
  objects. A route change resets scroll to the top; a hash (a deep link into a
  section) scrolls there once it is laid out.
*/

function ScrollManager() {
  const location = useLocation()
  const navigation = useNavigationType()
  const positions = useRef(new Map<string, number>())
  const previousPath = useRef(location.pathname)
  useEffect(() => {
    const samePage = previousPath.current === location.pathname
    previousPath.current = location.pathname
    let frame = 0
    let second = 0
    if (location.hash) {
      let id = location.hash.slice(1)
      try { id = decodeURIComponent(id) } catch { /* malformed fragment stays literal */ }
      frame = requestAnimationFrame(() => { second = requestAnimationFrame(() => scrollToId(id)) })
    } else if (navigation === 'POP' && positions.current.has(location.key)) {
      const top = positions.current.get(location.key) ?? 0
      frame = requestAnimationFrame(() => { second = requestAnimationFrame(() => window.scrollTo({ top, behavior: 'instant' })) })
    } else if (!samePage) window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
    const savedPositions = positions.current
    return () => {
      savedPositions.set(location.key, window.scrollY)
      cancelAnimationFrame(frame)
      cancelAnimationFrame(second)
    }
  }, [location.key, location.pathname, location.hash, navigation])
  return null
}

function RouteHead() {
  const { pathname } = useLocation()

  useHead({
    link: [{ rel: 'canonical', href: canonicalUrl(pathname) }],
    script: [
      {
        type: 'application/ld+json',
        // The home CreativeWork node ships only on '/', the published homepage; every
        // other route carries the WebSite + Organization + SearchAction graph alone.
        innerHTML: JSON.stringify(siteJsonLd(pathname === '/')),
        // Stable key so unhead REPLACES this node on client navigation instead of
        // appending a second site-level JSON-LD script on every route change.
        key: 'site-jsonld',
      },
    ],
  })

  return null
}

export function RootLayout() {
  return (
    <div className="min-h-screen bg-void text-bone">
      {/* the depth strata: the far pools (scene-tinted) under the near dot
          grid, both fixed, both still under reduced motion */}
      <div className="field-depth" aria-hidden="true" />
      <div className="field-rules" aria-hidden="true" />
      {/* the film pass: one fixed multiply layer of grain over the whole page,
          breathing slowly at rest (the CSS gates it behind reduced-motion) */}
      <div className="grain-overlay" aria-hidden="true" />
      <CompareProvider>
      <TooltipProvider delayDuration={150}>
        <PipProvider>
        <EggProvider>
        <div className="relative z-10">
          <a
            href="#main"
            className="sr-only rounded-sm border border-ink/40 bg-paper-2 px-4 py-2 font-mono text-sm text-ink focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50"
          >
            Skip to content
          </a>
          <RouteHead />
          <ScrollManager />
          <Masthead />
          <main id="main" tabIndex={-1} className="outline-none">
            <Outlet />
          </main>
          <SiteFooter />
          <Toaster position="bottom-center" />
          {/* the hidden-tidbit layer: the reveal and the found-index, rendered once */}
          <TidbitReveal />
          <FoundIndex />
        </div>
        </EggProvider>
        </PipProvider>
      </TooltipProvider>
      <CompareTray />
      </CompareProvider>
    </div>
  )
}
