import { Masthead } from './components/layout/Masthead'
import { AtlasHero } from './components/sections/AtlasHero'
import { HowItWorks } from './components/sections/HowItWorks'
import { PitchFamilyRail } from './components/sections/PitchFamilyRail'
import { GripLab } from './components/sections/GripLab'
import { ReleaseRoom } from './components/sections/ReleaseRoom'
import { MovementTranslation } from './components/sections/WhatItDoes'
import { MasterFiles } from './components/sections/MasterFiles'
import { FieldNotes } from './components/sections/FieldNotes'
import { Colophon } from './components/sections/Colophon'
import { useSelectedPitch } from './hooks/useSelectedPitch'
import { scrollToId } from './lib/scroll'

/*
  The page is the field manual, read top to bottom: Hero states the product, How
  it works names the three layers, then the selected specimen flows through its
  Foundation (catalog, Grip Lab, Release Room, Movement), its Masters (the
  verified baseline), and its Field Notes (the living layer). The selected pitch
  flows from the URL hash into every section; switching a pitch updates them in
  place. Sources close the manual.
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
      <div className="sr-only" role="status" aria-live="polite" aria-atomic="true">
        Now viewing: {entry.canonical.name}
      </div>
      <main id="main" tabIndex={-1} className="outline-none">
        <AtlasHero entry={entry} />
        <HowItWorks />
        <PitchFamilyRail entry={entry} />
        <GripLab entry={entry} />
        <ReleaseRoom entry={entry} />
        <MovementTranslation entry={entry} />
        <MasterFiles entry={entry} />
        <FieldNotes entry={entry} />
      </main>
      <Colophon entry={entry} />
      <div className="grain-overlay" aria-hidden="true" />
    </>
  )
}
