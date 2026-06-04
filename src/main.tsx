import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

// Self-hosted fonts. No runtime request to Google Fonts or any external host.
// Prose: Hanken Grotesk. Data, gauges, badges, on-ball annotations: Commit Mono.
import '@fontsource/hanken-grotesk/400.css'
import '@fontsource/hanken-grotesk/400-italic.css'
import '@fontsource/hanken-grotesk/500.css'
import '@fontsource/hanken-grotesk/600.css'
import '@fontsource/hanken-grotesk/700.css'
import '@fontsource/commit-mono/400.css'
import '@fontsource/commit-mono/500.css'
import '@fontsource/commit-mono/600.css'
import '@fontsource/commit-mono/700.css'

import './index.css'
import { App } from './App'

const rootEl = document.getElementById('root')
if (!rootEl) throw new Error('Pitch Atlas: root element #root not found')

createRoot(rootEl).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
