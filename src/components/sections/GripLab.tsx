import { useState } from 'react'
import type { GripView, Handedness, PitchAtlasEntry } from '../../data/types'
import { StageTierMarker } from '../layout/StageTierMarker'
import { BallStage } from '../ball/BallStage'
import { ClaimProse } from '../provenance/ClaimProse'

const FINGER_DOT: Record<string, string> = {
  index: '#e7b48d',
  middle: '#e3ad84',
  ring: '#dba87f',
  thumb: '#e1a87c',
  pinky: '#e3ad84',
}

const VIEW_OPTIONS: { id: GripView; label: string; note: string }[] = [
  { id: 'top', label: 'Top', note: 'finger pads' },
  { id: 'side', label: 'Side', note: 'palm gap' },
  { id: 'thumb', label: 'Thumb', note: 'under support' },
]

const HAND_OPTIONS: { id: Handedness; label: string }[] = [
  { id: 'right', label: 'Right' },
  { id: 'left', label: 'Left' },
]

const BALL_DEPTH_LABEL: Record<string, string> = {
  'out-in-fingers': 'Out in the fingers',
  neutral: 'Neutral depth',
  'deep-in-hand': 'Deeper in the hand',
}

const FINGER_SPACING_LABEL: Record<string, string> = {
  touching: 'Fingers close',
  'slight-spread': 'Slight spread',
  wide: 'Wide spacing',
}

export function GripLab({ entry }: { entry: PitchAtlasEntry }) {
  return <GripLabInner key={entry.canonical.id} entry={entry} />
}

function GripLabInner({ entry }: { entry: PitchAtlasEntry }) {
  const { canonical, guide, display } = entry
  const [showFingers, setShowFingers] = useState(true)
  const [view, setView] = useState<GripView>(canonical.gripModel.defaultView)
  const [handedness, setHandedness] = useState<Handedness>('right')

  return (
    <section id="grip-lab" className="on-stage relative overflow-hidden">
      <div className="absolute inset-0 opacity-[0.08]" aria-hidden="true">
        <div className="h-full w-full bg-[linear-gradient(90deg,rgba(243,236,224,0.08)_1px,transparent_1px),linear-gradient(0deg,rgba(243,236,224,0.08)_1px,transparent_1px)] bg-[size:42px_42px]" />
      </div>

      <div className="relative mx-auto max-w-6xl px-5 py-20 md:px-8 md:py-28">
        <StageTierMarker index="01" label="Grip Lab" />

        <div className="grid grid-cols-1 gap-x-12 gap-y-12 md:grid-cols-12">
          <div className="md:col-span-6">
            <div className="relative mx-auto aspect-square w-full max-w-[520px]">
              <div
                aria-hidden="true"
                className="absolute inset-x-[10%] bottom-[3%] h-[16%] rounded-[50%]"
                style={{ background: 'radial-gradient(closest-side, rgba(0,0,0,0.42), transparent)' }}
              />
              <BallStage
                entry={entry}
                grip={showFingers}
                hand={showFingers}
                view={view}
                handedness={handedness}
                surface="stage"
                faceGrip
                autoSpin={false}
                className="h-full w-full"
              />
            </div>

            <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-[1fr_auto]">
              <div>
                <p className="mono-label mb-2 text-bone-2">View</p>
                <div className="flex flex-wrap gap-2" role="group" aria-label="Grip view">
                  {VIEW_OPTIONS.map((option) => {
                    const active = view === option.id
                    return (
                      <button
                        key={option.id}
                        type="button"
                        data-view={option.id}
                        aria-pressed={active}
                        onClick={() => setView(option.id)}
                        className={`rounded-sm border px-3 py-2 text-left font-mono text-xs uppercase tracking-[0.12em] transition-colors ${
                          active
                            ? 'border-seam bg-seam text-bone'
                            : 'border-bone/25 text-bone-2 hover:border-bone/70 hover:text-bone'
                        }`}
                      >
                        <span className="block">{option.label}</span>
                        <span className="block pt-1 text-[9px] tracking-[0.08em] opacity-70">{option.note}</span>
                      </button>
                    )
                  })}
                </div>
              </div>

              <div>
                <p className="mono-label mb-2 text-bone-2">Hand</p>
                <div className="flex gap-2" role="group" aria-label="Handedness">
                  {HAND_OPTIONS.map((option) => {
                    const active = handedness === option.id
                    return (
                      <button
                        key={option.id}
                        type="button"
                        data-hand={option.id}
                        aria-pressed={active}
                        onClick={() => setHandedness(option.id)}
                        className={`rounded-sm border px-3 py-2 font-mono text-xs uppercase tracking-[0.12em] transition-colors ${
                          active
                            ? 'border-seam bg-seam text-bone'
                            : 'border-bone/25 text-bone-2 hover:border-bone/70 hover:text-bone'
                        }`}
                      >
                        {option.label}
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>

            <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-bone/15 pt-4">
              <button
                type="button"
                data-grip-toggle="hand"
                aria-pressed={showFingers}
                onClick={() => setShowFingers((v) => !v)}
                className="inline-flex items-center gap-2 rounded-sm border border-bone/25 px-3.5 py-2 font-mono text-xs uppercase tracking-[0.12em] text-bone transition-colors hover:border-bone"
              >
                <span
                  aria-hidden="true"
                  className={`h-2 w-2 rounded-full ${showFingers ? 'bg-seam' : 'bg-bone/35'}`}
                />
                {showFingers ? 'Hide hand' : 'Show hand'}
              </button>
              <span className="mono-label text-bone-2">Drag to inspect, or use the View buttons</span>
            </div>
          </div>

          <div className="flex flex-col gap-8 md:col-span-6">
            <div>
              <p className="mono-label mb-2 text-bone-2">
                {guide ? guide.family : canonical.family} / {display.specimenNo}
              </p>
              <h2 className="display text-3xl leading-[1.08] text-bone md:text-5xl">
                {canonical.name}
              </h2>
              {guide ? (
                <p className="mt-4 max-w-[52ch] text-lg leading-relaxed text-bone-2">{guide.tagline}</p>
              ) : (
                <p className="mt-4 max-w-[52ch] text-lg leading-relaxed text-bone-2">{display.heroIntro}</p>
              )}
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="border-t border-bone/20 pt-4">
                <p className="mono-label mb-2 text-bone-2">Ball depth</p>
                <p className="text-bone">{BALL_DEPTH_LABEL[canonical.gripModel.ballDepth]}</p>
              </div>
              <div className="border-t border-bone/20 pt-4">
                <p className="mono-label mb-2 text-bone-2">Spacing</p>
                <p className="text-bone">{FINGER_SPACING_LABEL[canonical.gripModel.fingerSpacing]}</p>
              </div>
              <div className="border-t border-bone/20 pt-4">
                <p className="mono-label mb-2 text-bone-2">Thumb</p>
                <p className="text-bone-2">{canonical.gripModel.thumbRole}</p>
              </div>
              <div className="border-t border-bone/20 pt-4">
                <p className="mono-label mb-2 text-bone-2">Release feel</p>
                <p className="text-bone-2">{canonical.gripModel.releaseCue}</p>
              </div>
            </div>

            <div className="border-l-2 border-seam/70 pl-5">
              <p className="display text-xl italic leading-relaxed text-bone">{canonical.gripModel.palmGapCue}</p>
              <p className="mono-label mt-2 text-bone-2">Palm gap cue</p>
            </div>

            <ul className="grid grid-cols-1 gap-3">
              {canonical.gripModel.contacts.map((contact) => (
                <li key={contact.label} className="grid grid-cols-[auto_1fr] gap-3 border-t border-bone/15 pt-3">
                  <span
                    aria-hidden="true"
                    className="mt-1 h-3 w-3 rounded-full"
                    style={{ backgroundColor: FINGER_DOT[contact.finger] ?? '#e3ad84' }}
                  />
                  <span>
                    <span className="block font-mono text-xs uppercase tracking-[0.12em] text-bone">
                      {contact.label} / {contact.pressureRole}
                    </span>
                    <span className="mt-1 block text-sm leading-relaxed text-bone-2">
                      {contact.seamRelation}. {contact.cue}.
                    </span>
                  </span>
                </li>
              ))}
            </ul>

            {guide ? (
              <ol className="flex flex-col gap-4">
                {guide.steps.map((step, i) => (
                  <li key={i} className="flex gap-4">
                    <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-seam font-mono text-xs text-seam">
                      {i + 1}
                    </span>
                    <span className="max-w-[56ch] text-[1.0625rem] leading-relaxed text-bone/90">{step}</span>
                  </li>
                ))}
              </ol>
            ) : null}

            {guide ? (
              <figure className="border-l-2 border-seam/60 pl-5">
                <blockquote className="display max-w-[44ch] text-xl italic leading-relaxed text-bone">
                  {guide.feel}
                </blockquote>
                <figcaption className="mono-label mt-2 text-bone-2">The feel</figcaption>
              </figure>
            ) : null}

            <details className="group border-t border-bone/20 pt-6">
              <summary className="flex cursor-pointer list-none items-center gap-2 font-mono text-xs uppercase tracking-[0.14em] text-bone-2 transition-colors hover:text-bone">
                <span aria-hidden="true" className="text-seam transition-transform group-open:rotate-90">›</span>
                The sourced grip, in full
              </summary>
              <div className="mt-6 flex flex-col gap-7">
                <ClaimProse claim={canonical.grip} proseClassName="text-lg leading-relaxed text-bone" />
                <div className="grid grid-cols-1 gap-x-8 gap-y-6 sm:grid-cols-2">
                  {canonical.gripDetails.map((detail, i) => (
                    <ClaimProse key={i} claim={detail} proseClassName="text-base leading-relaxed text-bone/85" />
                  ))}
                </div>
                <p className="mono-label max-w-[70ch] text-bone-2">{canonical.gripModel.visualCaveat}</p>
              </div>
            </details>
          </div>
        </div>
      </div>
    </section>
  )
}
