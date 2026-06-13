import { useEffect } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { Masthead } from './Masthead'
import { SiteFooter } from './SiteFooter'
import { scrollToId } from '../../lib/scroll'
import { Toaster } from '../ui/sonner'
import { TooltipProvider } from '../ui/tooltip'

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

export function RootLayout() {
  return (
    <div className="min-h-screen bg-paper text-ink">
      <div className="field-rules" aria-hidden="true" />
      {/* the film pass: one fixed multiply layer of grain over the whole page,
          breathing slowly at rest (the CSS gates it behind reduced-motion) */}
      <div className="grain-overlay" aria-hidden="true" />
      <TooltipProvider delayDuration={150}>
        <div className="relative z-10">
          <a
            href="#main"
            className="sr-only rounded-sm border border-ink/40 bg-paper-2 px-4 py-2 font-mono text-sm text-ink focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50"
          >
            Skip to content
          </a>
          <ScrollManager />
          <Masthead />
          <main id="main" tabIndex={-1} className="outline-none">
            <Outlet />
          </main>
          <SiteFooter />
          <Toaster position="bottom-center" />
        </div>
      </TooltipProvider>
    </div>
  )
}
