import { useEffect } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { Masthead } from './Masthead'
import { SiteFooter } from './SiteFooter'
import { scrollToId } from '../../lib/scroll'
import { BlazeCompanion } from '../companions/BlazeCompanion'
import { Toaster } from '../ui/sonner'
import { TooltipProvider } from '../ui/tooltip'

/*
  The shell every route renders inside. The whole site sits on the dark void with
  a faint dot-grid underlay (the refractor field); the masthead and the slim
  footer persist, and the Outlet is the chapter. A route change resets scroll to
  the top; a hash (a deep link into a section) scrolls there once it is laid out.
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
    <div className="rfx-void min-h-screen">
      <div className="rfx-dotgrid" aria-hidden="true" />
      <TooltipProvider delayDuration={150}>
        <div className="relative z-10">
          <a
            href="#main"
            className="sr-only rounded-sm border border-bone/40 bg-[#0a0810] px-4 py-2 font-mono text-sm text-bone focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50"
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
          <BlazeCompanion />
        </div>
      </TooltipProvider>
    </div>
  )
}
