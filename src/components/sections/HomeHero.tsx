import { Link } from 'react-router-dom'
import type { PitchAtlasEntry } from '../../data/types'
import { SITE } from '../../config/site'
import { scrollToId } from '../../lib/scroll'
import { PitchSpecimenCard } from '../refractor/PitchSpecimenCard'

/*
  The Pull. The one coal scene on the home page: Specimen 00 — the gold 1/1
  four-seam — stands pack-fresh under a single warm light, and the wordmark
  splits around it: PITCH flanking left, ATLAS flanking right, the card
  physically interrupting the name the way a fresh pull interrupts the room.

  Depth, back to front: the scene's bone pinstripes, the lamplight pool, the
  torn wax wrapper the card just left, the contact shadow on the table, then
  the card itself — the EXISTING spring tilt + live WebGL foil, reused. As the
  scene scrolls out, the card settles toward the binder below (a native
  scroll-driven handoff; reduced motion and older browsers keep it standing).

  The h1 stays one element ("Pitch Atlas" in source case; CSS uppercases it), so
  the heading reads correctly to tests and assistive tech while the two words sit
  in separate grid cells. On phones the words stack and the card stands between
  them — same altar, vertical. The specimen plate stays in the drawer below md:
  on a narrow card it lands on the card's own arched wordmark, and the card
  already wears its number and the gold frame — the plate repeats, it never
  informs. "Open specimen" belongs to the card face alone; the page's own calls
  are "Open the set" and "Meet the Craftsmen".
*/
export function HomeHero({ featured }: { featured: PitchAtlasEntry }) {
  const isChase = featured.display.specimenNo === '00'
  return (
    <section id="top" className="scene-coal relative overflow-hidden">
      <div className="scene-rules" aria-hidden="true" />
      <div className="relative mx-auto flex max-w-[1320px] flex-col items-center px-5 pb-14 pt-8 md:min-h-[calc(100dvh-4rem)] md:justify-center md:px-8 md:pb-20 md:pt-6">
        <p className="rfx-stamp" style={{ color: '#CDBA8E', background: 'rgba(22,18,13,.6)' }}>
          {SITE.sourcePrinciple}
        </p>

        <div className="pull-grid relative mt-6 w-full md:mt-8">
          <h1 className="pull-h1">
            <span className="pull-word pull-word-l">Pitch</span>{' '}
            <span className="pull-word pull-word-r">Atlas</span>
          </h1>
          <div className="pull-card pull-handoff">
            <div className="pull-light" aria-hidden="true" />
            <div className="pull-wrapper" aria-hidden="true" />
            <div className="pull-shadow" aria-hidden="true" />
            <PitchSpecimenCard entry={featured} maxWidth={440} foil />
            <p
              className="rfx-stamp pointer-events-none absolute top-3 z-10 hidden md:-right-5 md:inline-block"
              style={{ color: '#F6F1E6', background: 'rgba(22,18,13,.72)', transform: 'rotate(3deg)' }}
            >
              Specimen {featured.display.specimenNo}
              {isChase ? ' · gold 1/1' : null}
            </p>
          </div>
        </div>

        <p className="display mt-7 max-w-[52ch] text-center text-[16px] italic leading-relaxed text-bone-2 md:mt-9 md:text-lg">
          Every grip in the set, filed before it disappears. The foil is decoration; the readings
          are not.
        </p>

        <div className="mt-6 flex flex-wrap items-center justify-center gap-3 md:mt-8">
          <a
            href="#index"
            onClick={(e) => {
              e.preventDefault()
              scrollToId('index')
            }}
            className="btn-foil"
          >
            Open the set <span aria-hidden="true">↓</span>
          </a>
          <Link to="/craftsmen" className="btn-foil is-ghost">
            Meet the Craftsmen <span aria-hidden="true">→</span>
          </Link>
        </div>

        <p className="mt-5 text-center font-mono text-[10px] uppercase tracking-[0.16em] text-bone-2/80">
          Fresh from the wrapper · the card opens its specimen file
        </p>
      </div>
    </section>
  )
}
