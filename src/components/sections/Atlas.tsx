import { PITCHES } from '../../data/pitches'
import type { PitchAtlasEntry } from '../../data/types'
import { scrollToId } from '../../lib/scroll'
import { TierMarker } from '../layout/TierMarker'
import { SeamSchematic } from '../fallback/SeamSchematic'

/*
  Tier 00. The atlas itself: a browsable grid of every pitch. Picking a card sets
  the canonical pitch hash (the same route the masthead switcher uses) and scrolls
  to the Grip Lab. Pitches that are not yet sourced are honest "in the works"
  teasers — no metrics, no dates, no badges — and they live here, never in PITCHES.
*/

interface RoadmapPitch {
  name: string
  family: string
  note: string
}

const ROADMAP_PITCHES: RoadmapPitch[] = [
  {
    name: 'Cutter',
    family: 'The bridge',
    note: 'A fastball that cuts late and short, between the four-seam and the slider. The sourced grip opens as the atlas grows.',
  },
  {
    name: 'Splitter',
    family: 'The drop-off',
    note: 'A fastball look, then the bottom falls out. Its sourced record is in progress.',
  },
]

function selectPitch(slug: string) {
  if (typeof window !== 'undefined') window.location.hash = `#/${slug}`
  scrollToId('grip-lab')
}

export function Atlas({ entry }: { entry: PitchAtlasEntry }) {
  return (
    <section id="atlas" className="mx-auto max-w-6xl px-5 py-20 md:px-8 md:py-24">
      <TierMarker index="00" label="The atlas" />
      <p className="mb-10 max-w-[58ch] text-lg leading-relaxed text-ink-2">
        Five pitches, each gripped and thrown a different way. Pick one to study the grip, then see
        what it does. Every number is sourced; nothing is marked right or wrong.
      </p>

      <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {PITCHES.map((p) => {
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
                    ? 'border-seam bg-paper-2/70'
                    : 'border-ink-3/25 hover:border-seam/60 hover:bg-paper-2/40'
                }`}
              >
                <div className="flex items-baseline justify-between">
                  <span className="font-mono text-xs tabular-nums text-seam">{p.display.specimenNo}</span>
                  <span className="mono-label">{p.guide?.family ?? p.canonical.family}</span>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-14 shrink-0" aria-hidden="true">
                    <SeamSchematic
                      className="h-full w-full"
                      showAxis={false}
                      showStitches={false}
                      spinAxis={p.motion.spinAxis}
                      gyro={p.motion.gyro}
                      title=""
                    />
                  </div>
                  <h3 className="display text-xl leading-tight text-ink">{p.canonical.name}</h3>
                </div>
                {p.guide ? (
                  <p className="text-sm leading-relaxed text-ink-2">{p.guide.tagline}</p>
                ) : null}
              </a>
            </li>
          )
        })}

        {ROADMAP_PITCHES.map((r) => (
          <li key={r.name}>
            <div className="flex h-full flex-col gap-3 rounded-sm border border-dashed border-ink-3/30 p-5 opacity-70">
              <div className="flex items-baseline justify-between">
                <span className="mono-label">In the works</span>
              </div>
              <h3 className="display text-xl leading-tight text-ink-2">{r.name}</h3>
              <p className="text-sm leading-relaxed text-ink-3">{r.note}</p>
            </div>
          </li>
        ))}
      </ul>
    </section>
  )
}
