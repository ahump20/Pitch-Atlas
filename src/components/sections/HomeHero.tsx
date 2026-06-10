import { Link } from 'react-router-dom'
import type { PitchAtlasEntry } from '../../data/types'
import { SITE } from '../../config/site'
import { scrollToId } from '../../lib/scroll'
import { PitchSpecimenCard } from '../refractor/PitchSpecimenCard'

/*
  The Pull. The specimen card stands dead center under one warm overhead light,
  and the wordmark splits around it: PITCH flanking left, ATLAS flanking right,
  the card overlapping the inner letter edges — the artifact physically interrupts
  the name, the way a fresh pull interrupts everything else in the room.

  The h1 stays one element ("Pitch Atlas" in source case; CSS uppercases it), so
  the heading reads correctly to tests and assistive tech while the two words sit
  in separate grid cells. On phones the words stack and the card stands between
  them — same altar, vertical. The old full-bleed backdrop video is gone: it
  competed with the card, and the 12-6 clip still plays where it belongs, on the
  card face itself.
*/
export function HomeHero({ featured }: { featured: PitchAtlasEntry }) {
  return (
    <section id="top" className="relative overflow-hidden">
      <div className="relative mx-auto flex max-w-[1320px] flex-col items-center px-5 pb-12 pt-8 md:min-h-[calc(100dvh-4rem)] md:justify-center md:px-8 md:pb-16 md:pt-6">
        <p
          className="rfx-stamp"
          style={{ color: '#E9C97A', background: 'rgba(22,19,15,.6)' }}
        >
          {SITE.sourcePrinciple}
        </p>

        <div className="pull-grid relative mt-6 w-full md:mt-8">
          <h1 className="pull-h1">
            <span className="pull-word pull-word-l">Pitch</span>{' '}
            <span className="pull-word pull-word-r rfx-chrome-text" style={{ textShadow: 'none' }}>
              Atlas
            </span>
          </h1>
          <div className="pull-card">
            <div className="pull-light" aria-hidden="true" />
            <PitchSpecimenCard entry={featured} maxWidth={440} foil />
          </div>
        </div>

        <p className="mt-7 max-w-[52ch] text-center text-[15px] leading-relaxed text-bone-2 md:mt-9 md:text-lg">
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

        <p className="mt-5 text-center font-mono text-[10px] uppercase tracking-[0.16em] text-ink-3">
          Specimen {featured.display.specimenNo} · the gold 1/1 · tap to open
        </p>
      </div>
    </section>
  )
}
