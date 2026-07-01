import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { PITCHES } from '../../data/pitches'
import { BallStage } from '../ball/BallStage'
import { accentForSlug } from '../refractor/accents'
import type { GripView, Handedness } from '../../data/types'

/*
  Grip Theater, two-up. The deception a hitter faces is that two very different
  pitches leave the same hand from the same arm slot — the only thing that changed
  is the grip, and the grip is the one thing they cannot see. This view puts two
  filed grips side by side under one shared arm slot (the view + handedness apply to
  both), so the "same release, different grip" point is visible at a glance. It
  reuses the 3D specimen stage, which degrades to the 2D seam schematic with no WebGL.
*/

const VIEWS: { id: GripView; label: string }[] = [
  { id: 'top', label: 'Top' },
  { id: 'side', label: 'Side' },
  { id: 'thumb', label: 'Thumb' },
]

export function GripCompare() {
  const [aSlug, setA] = useState('four-seam')
  const [bSlug, setB] = useState('circle-change')
  const [view, setView] = useState<GripView>('top')
  const [hand, setHand] = useState<Handedness>('right')

  const a = useMemo(() => PITCHES.find((p) => p.display.slug === aSlug) ?? PITCHES[0], [aSlug])
  const b = useMemo(() => PITCHES.find((p) => p.display.slug === bSlug) ?? PITCHES[1], [bSlug])

  return (
    <div className="flex flex-col gap-6">
      {/* shared arm slot controls */}
      <div className="flex flex-wrap items-center gap-x-8 gap-y-4">
        <div>
          <span className="mono-label text-ink-3">Arm slot (both grips)</span>
          <div className="mt-1.5 inline-flex overflow-hidden rounded-lg border border-cyan/30" role="group" aria-label="Grip view, both balls">
            {VIEWS.map((v) => (
              <button
                key={v.id}
                type="button"
                onClick={() => setView(v.id)}
                aria-pressed={view === v.id}
                className="rfx-seg"
              >
                {v.label}
              </button>
            ))}
          </div>
        </div>
        <div>
          <span className="mono-label text-ink-3">Handedness</span>
          <div className="mt-1.5 inline-flex overflow-hidden rounded-lg border border-cyan/30">
            {(['right', 'left'] as const).map((h) => (
              <button
                key={h}
                type="button"
                onClick={() => setHand(h)}
                aria-pressed={hand === h}
                className="rfx-seg"
              >
                {h === 'right' ? 'RHP' : 'LHP'}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {[a, b].map((entry, i) => (
          <div key={entry.display.slug} className="flex flex-col">
            <label className="block">
              <span className="mono-label text-ink-3">{i === 0 ? 'Grip A' : 'Grip B'}</span>
              <select
                value={i === 0 ? aSlug : bSlug}
                onChange={(e) => (i === 0 ? setA(e.target.value) : setB(e.target.value))}
                className="rfx-select mt-1.5"
                aria-label={i === 0 ? 'First grip' : 'Second grip'}
              >
                {PITCHES.map((p) => (
                  <option key={p.display.slug} value={p.display.slug}>
                    {p.display.shortName}
                  </option>
                ))}
              </select>
            </label>

            <figure className="rfx-panel mt-3 aspect-square overflow-hidden rounded-sm">
              <BallStage entry={entry} grip faceGrip view={view} handedness={hand} className="h-full w-full" />
            </figure>

            <p className="mt-3 text-sm leading-relaxed text-bone">
              <span className="mono-label mr-2" style={{ color: accentForSlug(entry.display.slug).c3 }}>{entry.canonical.family}</span>
              {entry.canonical.gripModel.releaseCue}
            </p>
            <Link to={`/pitch/${entry.display.slug}`} className="mono-label mt-2 inline-block text-cyan transition-colors hover:text-bone">
              {entry.display.shortName} specimen →
            </Link>
          </div>
        ))}
      </div>

      <p className="rfx-panel rounded-sm border-l-2 border-l-ink/15 px-5 py-4 text-sm leading-relaxed text-ink-2">
        Same arm slot, same release: switch the view and both balls turn together, because the delivery is
        the part the hitter <em>can</em> read. The grip is the part they can&rsquo;t. Once these two leave the
        hand looking identical, the only question left is what each one does on the way to the plate. See the{' '}
        <Link to="/compare" className="text-cyan underline-offset-2 hover:underline">
          movement tunnel
        </Link>
        .
      </p>
    </div>
  )
}
