import { useEffect } from 'react'
import { useHead } from '@unhead/react'
import { Outlet, useLocation } from 'react-router-dom'
import { Masthead } from './Masthead'
import { SiteFooter } from './SiteFooter'
import { scrollToId } from '../../lib/scroll'
import { canonicalUrl, siteJsonLd } from '../../lib/seo'
import { Toaster } from '../ui/sonner'
import { TooltipProvider } from '../ui/tooltip'
import { PipProvider } from '../embeds/pip'

/*
  The shell every route renders inside. The site sits on the warm field — aged
  cream scorebook paper with faint ink rules — and dark lives only inside the
  scoped .scene-coal sections (the foil-viewing theaters). The masthead and the
  leather footer persist, and the Outlet is the chapter. A route change resets
  scroll to the top; a hash (a deep link into a section) scrolls there once it
  is laid out.
*/

function ScrollManager() {
  const { pathname, hash } = useLocation()

  useEffect(() => {
    if (hash) {
      const id = decodeURIComponent(hash.slice(1))
      requestAnimationFrame(() => requestAnimationFrame(() => scrollToId(id)))
      return
    }
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' })
  }, [pathname, hash])

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
      <div className="field-rules" aria-hidden="true" />
      {/* the film pass: one fixed multiply layer of grain over the whole page,
          breathing slowly at rest (the CSS gates it behind reduced-motion) */}
      <div className="grain-overlay" aria-hidden="true" />
      <TooltipProvider delayDuration={150}>
        <PipProvider>
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
        </div>
        </PipProvider>
      </TooltipProvider>
    </div>
  )
}
