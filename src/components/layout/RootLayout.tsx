import { useEffect } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { Masthead } from './Masthead'
import { SiteFooter } from './SiteFooter'
import { scrollToId } from '../../lib/scroll'

/*
  The shell every route renders inside. The masthead and the slim footer persist;
  the Outlet is the chapter. A route change resets the scroll to the top of the
  new page, and a hash on the URL (a deep link into a section, e.g.
  /pitch/four-seam#masters) scrolls to that section once it is laid out. The grain
  wash and the skip link stay site-wide. Sources live on their own page now, so
  the footer is a compact index, not the full colophon.
*/

function ScrollManager() {
  const { pathname, hash } = useLocation()

  useEffect(() => {
    if (hash) {
      const id = decodeURIComponent(hash.slice(1))
      // Two frames: let the new route's sections lay out before we measure.
      requestAnimationFrame(() => requestAnimationFrame(() => scrollToId(id)))
      return
    }
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' })
  }, [pathname, hash])

  return null
}

export function RootLayout() {
  return (
    <>
      <a
        href="#main"
        className="sr-only rounded-sm border border-seam bg-paper px-4 py-2 font-mono text-sm text-ink focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50"
      >
        Skip to content
      </a>
      <ScrollManager />
      <Masthead />
      <main id="main" tabIndex={-1} className="outline-none">
        <Outlet />
      </main>
      <SiteFooter />
      <div className="grain-overlay" aria-hidden="true" />
    </>
  )
}
