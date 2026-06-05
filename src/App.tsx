import { Masthead } from './components/layout/Masthead'
import { Hero } from './components/sections/Hero'
import { Atlas } from './components/sections/Atlas'
import { GripLab } from './components/sections/GripLab'
import { WhatItDoes } from './components/sections/WhatItDoes'
import { MasterVariants } from './components/sections/MasterVariants'
import { Community } from './components/sections/Community'
import { Colophon } from './components/sections/Colophon'
import { useSelectedPitch } from './hooks/useSelectedPitch'
import { scrollToId } from './lib/scroll'

/*
  The page. Grip first: Hero -> Atlas -> Grip Lab -> What it does -> Masters ->
  Community -> Colophon. The selected pitch flows from the URL hash into every
  section; switching a pitch updates them in place, so a pick from the Atlas lands
  you in the Grip Lab without a jump to the top.
*/
export function App() {
  const entry = useSelectedPitch()

  return (
    <>
      <a
        href="#main"
        onClick={(e) => {
          e.preventDefault()
          scrollToId('main', true)
        }}
        className="sr-only rounded-sm border border-seam bg-paper px-4 py-2 font-mono text-sm text-ink focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50"
      >
        Skip to content
      </a>
      <Masthead />
      <main id="main" tabIndex={-1} className="outline-none">
        <Hero entry={entry} />
        <Atlas entry={entry} />
        <GripLab entry={entry} />
        <WhatItDoes entry={entry} />
        <MasterVariants entry={entry} />
        <Community entry={entry} />
      </main>
      <Colophon entry={entry} />
      <div className="grain-overlay" aria-hidden="true" />
    </>
  )
}
