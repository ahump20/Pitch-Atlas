import { useState } from 'react'
import type { PitchAtlasEntry } from '../../data/types'
import { TierMarker } from '../layout/TierMarker'
import { BallStage } from '../ball/BallStage'
import { ClaimProse } from '../provenance/ClaimProse'

/*
  Tier 01. The interactive core, grip-first: the ball faced toward the camera with
  pressed fingertip pads, a plain-language numbered step list, and the feel. The
  full sourced grip (claim + paraphrased detail) sits in a disclosure beneath, so
  provenance stays one tap away without leading with jargon.
*/

const FINGER_DOT: Record<string, string> = {
  index: '#e7b48d',
  middle: '#e3ad84',
  ring: '#dba87f',
  thumb: '#e1a87c',
  pinky: '#e3ad84',
}

export function GripLab({ entry }: { entry: PitchAtlasEntry }) {
  const { canonical, guide, display } = entry
  const [showFingers, setShowFingers] = useState(true)

  return (
    <section id="grip-lab" className="mx-auto max-w-6xl px-5 py-20 md:px-8 md:py-28">
      <TierMarker index="01" label="The grip" />

      <div className="grid grid-cols-1 gap-x-12 gap-y-12 md:grid-cols-12">
        {/* the ball */}
        <div className="md:col-span-5">
          <div className="relative mx-auto aspect-square w-full max-w-[440px]">
            {/* contact shadow grounding the ball on the page */}
            <div
              aria-hidden="true"
              className="absolute inset-x-[16%] bottom-[6%] h-[12%] rounded-[50%]"
              style={{ background: 'radial-gradient(closest-side, rgba(34,26,16,0.28), transparent)' }}
            />
            <BallStage
              entry={entry}
              grip={showFingers}
              faceGrip
              autoSpin={false}
              className="h-full w-full"
            />
          </div>

          <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
            <button
              type="button"
              aria-pressed={showFingers}
              onClick={() => setShowFingers((v) => !v)}
              className="inline-flex items-center gap-2 rounded-sm border border-ink-3/40 px-3.5 py-2 font-mono text-xs uppercase tracking-[0.12em] text-ink transition-colors hover:border-seam hover:text-seam"
            >
              <span
                aria-hidden="true"
                className={`h-2 w-2 rounded-full ${showFingers ? 'bg-seam' : 'bg-ink-3'}`}
              />
              {showFingers ? 'Hide fingers' : 'Show fingers'}
            </button>
            <span className="mono-label">Drag to inspect</span>
          </div>

          {/* finger-color legend */}
          <ul className="mt-4 flex flex-wrap gap-x-5 gap-y-2">
            {canonical.fingerPlacement.map((c) => (
              <li key={c.label} className="flex items-center gap-2">
                <span
                  aria-hidden="true"
                  className="h-2.5 w-2.5 rounded-full"
                  style={{ backgroundColor: FINGER_DOT[c.finger] ?? '#e3ad84' }}
                />
                <span className="mono-label">{c.label}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* the steps */}
        <div className="flex flex-col gap-8 md:col-span-7">
          <div>
            {guide ? <p className="mono-label mb-2">{guide.family}</p> : null}
            <h2 className="display text-3xl leading-[1.08] text-ink md:text-4xl">
              {canonical.name}
            </h2>
            {guide ? (
              <p className="mt-3 max-w-[52ch] text-lg leading-relaxed text-ink-2">{guide.tagline}</p>
            ) : (
              <p className="mt-3 max-w-[52ch] text-lg leading-relaxed text-ink-2">{display.heroIntro}</p>
            )}
          </div>

          {guide ? (
            <ol className="flex flex-col gap-4">
              {guide.steps.map((step, i) => (
                <li key={i} className="flex gap-4">
                  <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-seam font-mono text-xs text-seam">
                    {i + 1}
                  </span>
                  <span className="max-w-[56ch] text-[1.0625rem] leading-relaxed text-ink/90">{step}</span>
                </li>
              ))}
            </ol>
          ) : null}

          {guide ? (
            <figure className="border-l-2 border-seam/60 pl-5">
              <blockquote className="display max-w-[44ch] text-xl italic leading-relaxed text-ink">
                {guide.feel}
              </blockquote>
              <figcaption className="mono-label mt-2">The feel</figcaption>
            </figure>
          ) : null}

          <details className="group border-t border-ink-3/40 pt-6">
            <summary className="flex cursor-pointer list-none items-center gap-2 font-mono text-xs uppercase tracking-[0.14em] text-ink-2 transition-colors hover:text-ink">
              <span aria-hidden="true" className="text-seam transition-transform group-open:rotate-90">›</span>
              The sourced grip, in full
            </summary>
            <div className="mt-6 flex flex-col gap-7">
              <ClaimProse claim={canonical.grip} proseClassName="text-lg leading-relaxed text-ink" />
              <div className="grid grid-cols-1 gap-x-8 gap-y-6 sm:grid-cols-2">
                {canonical.gripDetails.map((detail, i) => (
                  <ClaimProse key={i} claim={detail} proseClassName="text-base leading-relaxed text-ink/85" />
                ))}
              </div>
            </div>
          </details>
        </div>
      </div>
    </section>
  )
}
