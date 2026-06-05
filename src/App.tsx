import { useEffect } from 'react'
import { Masthead } from './components/layout/Masthead'
import { Hero } from './components/sections/Hero'
import { Foundation } from './components/sections/Foundation'
import { MasterVariants } from './components/sections/MasterVariants'
import { Community } from './components/sections/Community'
import { Colophon } from './components/sections/Colophon'
import { useSelectedPitch } from './hooks/useSelectedPitch'
import { scrollToId } from './lib/scroll'

export function App() {
  const entry = useSelectedPitch()

  // Reset to the top when the specimen changes, so a switch starts at the hero.
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' as ScrollBehavior })
  }, [entry.display.slug])

  return (
    <>
      <a
        href="#main"
        onClick={(e) => {
          e.preventDefault()
          scrollToId('main', true)
        }}
        className="sr-only rounded-sm border border-seam bg-stage px-4 py-2 font-mono text-sm text-ink focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50"
      >
        Skip to content
      </a>
      <Masthead />
      <main key={entry.display.slug} id="main" tabIndex={-1} className="outline-none">
        <Hero entry={entry} />
        <Foundation entry={entry} />
        <MasterVariants entry={entry} />
        <Community entry={entry} />
      </main>
      <Colophon entry={entry} />
    </>
  )
}
