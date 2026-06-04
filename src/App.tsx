import { Masthead } from './components/layout/Masthead'
import { Hero } from './components/sections/Hero'
import { Foundation } from './components/sections/Foundation'
import { MasterVariants } from './components/sections/MasterVariants'
import { Community } from './components/sections/Community'
import { Colophon } from './components/sections/Colophon'

export function App() {
  return (
    <>
      <a
        href="#main"
        className="sr-only rounded-sm border border-seam bg-stage px-4 py-2 font-mono text-sm text-ink focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50"
      >
        Skip to content
      </a>
      <Masthead />
      <main id="main" tabIndex={-1} className="outline-none">
        <Hero />
        <Foundation />
        <MasterVariants />
        <Community />
      </main>
      <Colophon />
    </>
  )
}
