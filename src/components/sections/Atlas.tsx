import { PITCHES } from '../../data/pitches'
import type { PitchAtlasEntry, PitchFamily } from '../../data/types'
import { scrollToId } from '../../lib/scroll'
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
    note: 'A fastball grip that cuts late and short. The sourced grip opens as the atlas grows.',
  },
  {
    name: 'Splitter',
    family: 'offspeed',
    note: 'A fastball look with a deeper split between the fingers. Its sourced record is in progress.',
  },
]

function selectPitch(slug: string) {
  if (typeof window !== 'undefined') window.location.hash = `#/${slug}`
  scrollToId('grip-lab')
}

export function PitchFamilyRail({ entry }: { entry: PitchAtlasEntry }) {
  return (
    <section id="atlas" className="mx-auto max-w-6xl px-5 py-20 md:px-8 md:py-24">
      <TierMarker index="00" label="Pitch family rail" />
      <div className="grid grid-cols-1 gap-7 md:grid-cols-12">
        <div className="md:col-span-4">
          <h2 className="display text-3xl leading-tight text-ink md:text-4xl">Pick the family, then the hold.</h2>
        </div>
        <p className="max-w-[62ch] text-lg leading-relaxed text-ink-2 md:col-span-8">
          The atlas starts with the hand. Choose a pitch family, study where the fingers and thumb
          sit, then move into release feel and movement. Every measurement stays sourced and below
          the grip path.
        </p>
      </div>

      <div className="mt-12 flex flex-col gap-12">
        {FAMILY_ORDER.map((family) => {
          const pitches = PITCHES.filter((p) => p.canonical.family === family)
          const roadmap = ROADMAP_PITCHES.filter((p) => p.family === family)
          const meta = FAMILY_LABEL[family]
          return (
            <section key={family} aria-labelledby={`${family}-rail`}>
              <div className="mb-4 flex flex-wrap items-end justify-between gap-3 border-t border-ink-3/30 pt-5">
                <div>
                  <h3 id={`${family}-rail`} className="display text-2xl text-ink">
                    {meta.label}
                  </h3>
                  <p className="mt-1 max-w-[54ch] text-sm leading-relaxed text-ink-2">{meta.copy}</p>
                </div>
                <span className="mono-label">{pitches.length} sourced</span>
              </div>

              <ul className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                {pitches.map((p) => {
                  const active = p.display.slug === entry.display.slug
                  return (
                    <li key={p.display.slug}>
                      <a
                        href={`#/${p.display.slug}`}
                        aria-current={active ? 'true' : undefined}
                        onClick={(e) => {
                          e.preventDefault()
                          selectPitch(p.display.slug)
                        }}
                        className={`group flex h-full flex-col gap-4 rounded-sm border p-5 transition-colors ${
                          active
                            ? 'border-seam bg-paper-2/80'
                            : 'border-ink-3/25 hover:border-seam/60 hover:bg-paper-2/40'
                        }`}
                      >
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
                      </a>
                    </li>
                  )
                })}

                {roadmap.map((r) => (
                  <li key={r.name}>
                    <div className="flex h-full flex-col gap-3 rounded-sm border border-dashed border-ink-3/30 p-5 opacity-70">
                      <span className="mono-label">In the works</span>
                      <h4 className="display text-xl leading-tight text-ink-2">{r.name}</h4>
                      <p className="text-sm leading-relaxed text-ink-3">{r.note}</p>
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
