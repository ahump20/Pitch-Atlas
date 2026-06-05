import { Masthead } from './components/layout/Masthead'
import { AtlasHero } from './components/sections/AtlasHero'
import { PitchFamilyRail } from './components/sections/PitchFamilyRail'
import { GripLab } from './components/sections/GripLab'
import { ReleaseRoom } from './components/sections/ReleaseRoom'
import { MovementTranslation } from './components/sections/WhatItDoes'
import { EvidenceLedger } from './components/sections/EvidenceLedger'
import { Colophon } from './components/sections/Colophon'
import { useSelectedPitch } from './hooks/useSelectedPitch'
import { scrollToId } from './lib/scroll'

/*
  The page. Grip first: Hero -> pitch family rail -> Grip Lab -> Release Room ->
  Movement Translation -> Evidence Ledger -> Colophon. The selected pitch flows from the URL hash into every
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
        <AtlasHero entry={entry} />
        <PitchFamilyRail entry={entry} />
        <GripLab entry={entry} />
        <ReleaseRoom entry={entry} />
        <MovementTranslation entry={entry} />
        <EvidenceLedger entry={entry} />
      </main>
      <Colophon entry={entry} />
      <div className="grain-overlay" aria-hidden="true" />
    </>
  )
}
