import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

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
import { App } from './App'

const rootEl = document.getElementById('root')
if (!rootEl) throw new Error('Pitch Atlas: root element #root not found')

createRoot(rootEl).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
