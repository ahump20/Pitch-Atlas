import { Link } from 'react-router-dom'
import { PITCHES } from '../../data/pitches'
import type { PitchFamily } from '../../data/types'
import { countSources } from '../../lib/entry-stats'
import { TierMarker } from '../layout/TierMarker'
import { SeamSchematic } from '../fallback/SeamSchematic'

interface RoadmapPitch {
  name: string
  family: PitchFamily
  note: string
}

const FAMILY_ORDER: PitchFamily[] = ['fastball', 'offspeed', 'breaking']

const FAMILY_LABEL: Record<PitchFamily, { label: string; copy: string }> = {
  fastball: {
    label: 'Fastballs',
    copy: 'Fingertip pressure, cleaner backspin, and the shortest path to the plate.',
  },
  offspeed: {
    label: 'Offspeed',
    copy: 'Fastball arm speed with deeper hand feel, softened spin, or changed pressure.',
  },
  breaking: {
    label: 'Breaking balls',
    copy: 'Seam leverage, side pressure, and release shapes that pull the ball off line.',
  },
}

const ROADMAP_PITCHES: RoadmapPitch[] = [
  {
    name: 'Cutter',
    family: 'fastball',
    note: 'A fastball grip that cuts late and short. The sourced specimen opens as the atlas grows.',
  },
  {
    name: 'Sweeper',
    family: 'breaking',
    note: 'The slider taken sideways: a wide, late horizontal break. Its sourced record is in progress.',
  },
]

/*
  The catalog: the home page's table of contents. Every pitch is its own page,
  reached by a real route, grouped by family. The "in the works" cards keep the
  growth honest, a dashed plate rather than a fake entry. The pitch count is
  computed from the data, never hardcoded.
*/
export function PitchFamilyRail() {
  return (
    <section id="atlas" className="mx-auto max-w-6xl px-5 py-20 md:px-8 md:py-24">
      <TierMarker index="00" label="The catalog" />
      <div className="grid grid-cols-1 gap-7 md:grid-cols-12">
        <div className="md:col-span-4">
          <h2 className="display text-3xl leading-tight text-ink md:text-4xl">Pick a specimen, open its file.</h2>
        </div>
        <p className="max-w-[62ch] text-lg leading-relaxed text-ink-2 md:col-span-8">
          {PITCHES.length} pitches are filed today, each its own page. Choose a family, then open a
          specimen to study where the fingers and thumb sit, the release, the movement, the master
          files, and the field notes opening beneath them.
        </p>
      </div>

      <div className="mt-12 flex flex-col gap-12">
        {FAMILY_ORDER.map((family) => {
          const pitches = PITCHES.filter((p) => p.canonical.family === family)
          const roadmap = ROADMAP_PITCHES.filter((p) => p.family === family)
          const meta = FAMILY_LABEL[family]
          return (
            <section key={family} aria-labelledby={`${family}-rail`}>
              <div className="mb-4 flex flex-wrap items-end justify-between gap-3 border-t border-navy/15 pt-5">
                <div>
                  <h3 id={`${family}-rail`} className="display text-2xl text-ink">
                    {meta.label}
                  </h3>
                  <p className="mt-1 max-w-[54ch] text-sm leading-relaxed text-ink-2">{meta.copy}</p>
                </div>
                <span className="mono-label">{pitches.length} filed</span>
              </div>

              <ul className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                {pitches.map((p) => {
                  const sources = countSources(p)
                  return (
                    <li key={p.display.slug}>
                      <Link
                        to={`/pitch/${p.display.slug}`}
                        className="group relative flex h-full flex-col gap-4 rounded-sm border-l-2 border-l-navy/40 bg-paper-2/30 p-5 transition-colors hover:border-l-seam hover:bg-paper-2/60"
                      >
                        <span aria-hidden="true" className="absolute right-2.5 top-2.5 h-2.5 w-2.5 border-r border-t border-navy/30" />
                        <div className="flex items-baseline justify-between">
                          <span className="font-mono text-xs tabular-nums text-seam">{p.display.specimenNo}</span>
                          <span className="mono-label">{p.canonical.gripModel.defaultView} view</span>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="w-14 shrink-0" aria-hidden="true">
                            <SeamSchematic
                              className="h-full w-full"
                              showAxis={false}
                              showStitches={false}
                              spinAxis={p.motion.spinAxis}
                              gyro={p.motion.gyro}
                              grip={p.canonical.gripModel.contacts}
                              title=""
                            />
                          </div>
                          <h4 className="display text-xl leading-tight text-ink">{p.canonical.name}</h4>
                        </div>
                        {p.guide ? (
                          <p className="text-sm leading-relaxed text-ink-2">{p.guide.tagline}</p>
                        ) : null}
                        <div className="mt-auto flex flex-wrap items-center gap-x-3 gap-y-1 border-t border-navy/12 pt-3">
                          <span className="mono-label">{sources} sources</span>
                          <span aria-hidden="true" className="text-ink-3">·</span>
                          <span className="mono-label">{p.masterVariants.length} master files</span>
                          <span aria-hidden="true" className="text-ink-3">·</span>
                          <span className="mono-label text-seam">Open file →</span>
                        </div>
                      </Link>
                    </li>
                  )
                })}

                {roadmap.map((r) => (
                  <li key={r.name}>
                    <div className="flex h-full flex-col gap-3 rounded-sm border border-dashed border-navy/25 p-5 opacity-70">
                      <span className="mono-label">In the works</span>
                      <h4 className="display text-xl leading-tight text-ink-2">{r.name}</h4>
                      <p className="text-sm leading-relaxed text-ink-2">{r.note}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          )
        })}
      </div>
    </section>
  )
}

export const Atlas = PitchFamilyRail
