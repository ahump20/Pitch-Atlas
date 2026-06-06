import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { createHead, UnheadProvider } from '@unhead/react/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'

// Self-hosted fonts. No runtime request to Google Fonts or any external host.
// Display: Newsreader (serif, italics carry the warmth). Prose: Hanken Grotesk.
// Data, gauges, badges, on-ball annotations: Martian Mono.
import '@fontsource/newsreader/400.css'
import '@fontsource/newsreader/400-italic.css'
import '@fontsource/newsreader/500.css'
import '@fontsource/newsreader/600.css'
import '@fontsource/newsreader/600-italic.css'
import '@fontsource/hanken-grotesk/400.css'
import '@fontsource/hanken-grotesk/400-italic.css'
import '@fontsource/hanken-grotesk/500.css'
import '@fontsource/hanken-grotesk/600.css'
import '@fontsource/hanken-grotesk/700.css'
import '@fontsource/martian-mono/400.css'
import '@fontsource/martian-mono/500.css'
import '@fontsource/martian-mono/600.css'

// Embedded-tweet base styles; brand overrides live in index.css (.react-tweet-theme).
import 'react-tweet/theme.css'

import './index.css'
import { routes } from './routes'
import { ReloadPrompt } from './components/pwa/ReloadPrompt'

/*
  The client entry. The manual is a multi-page site now: a data router holds the
  routes, an Unhead provider manages per-page titles and meta, and the build-time
  prerender writes a real HTML file per route. We render (rather than hydrate)
  over the prerendered markup so the client-only 3D upgrades cleanly without a
  hydration mismatch; the prerendered HTML still serves SEO and first paint.
*/
// The prerender plugin injects each route's HTML into <div id="app">, so the
// client mounts on the same node.
const rootEl = document.getElementById('app')
if (!rootEl) throw new Error('Pitch Atlas: mount element #app not found')

const head = createHead()
const router = createBrowserRouter(routes)

createRoot(rootEl).render(
  <StrictMode>
    <UnheadProvider head={head}>
      <RouterProvider router={router} />
      <ReloadPrompt />
    </UnheadProvider>
  </StrictMode>,
)
