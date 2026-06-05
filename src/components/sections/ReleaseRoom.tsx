import type { PitchAtlasEntry } from '../../data/types'
import { BallStage } from '../ball/BallStage'
import { TierMarker } from '../layout/TierMarker'
import { ClaimProse } from '../provenance/ClaimProse'

function ReleaseArc() {
  return (
    <svg viewBox="0 0 460 120" className="h-auto w-full" role="img" aria-label="Schematic release path from hand load to finish">
      <path
        d="M38 86 C130 18 255 18 414 78"
        fill="none"
        stroke="var(--color-ink-3)"
        strokeWidth="1.2"
        strokeDasharray="4 6"
      />
      {[
        { x: 42, y: 84, r: 16, label: 'hold' },
        { x: 210, y: 36, r: 12, label: 'pressure' },
        { x: 412, y: 78, r: 8, label: 'leave' },
      ].map((p) => (
        <g key={p.label}>
          <circle cx={p.x} cy={p.y} r={p.r} fill="#f3ece0" stroke="var(--color-seam)" strokeWidth="2" />
          <path d={`M${p.x - p.r * 0.55} ${p.y - 2} Q${p.x} ${p.y + 4} ${p.x + p.r * 0.55} ${p.y - 2}`} fill="none" stroke="var(--color-seam)" strokeWidth="1.5" strokeLinecap="round" />
          <text x={p.x} y={p.y + 34} textAnchor="middle" fontFamily="var(--font-mono)" fontSize="9" letterSpacing="1.4" fill="var(--color-ink-2)">
            {p.label.toUpperCase()}
          </text>
        </g>
      ))}
    </svg>
  )
}

export function ReleaseRoom({ entry }: { entry: PitchAtlasEntry }) {
  const { canonical, guide } = entry
  const sequence = [
    {
      label: 'Hold',
      title: canonical.gripModel.ballDepth === 'deep-in-hand' ? 'Let the ball sit deeper.' : 'Keep the ball out in the fingers.',
      copy: canonical.gripModel.palmGapCue,
    },
    {
      label: 'Pressure',
      title: `${canonical.gripModel.primaryPressureFinger} finger owns the shape.`,
      copy: canonical.gripModel.contacts.find((c) => c.finger === canonical.gripModel.primaryPressureFinger)?.pressureRole ?? canonical.gripModel.thumbRole,
    },
    {
      label: 'Leave',
      title: 'Release is a feel, not a formula.',
      copy: canonical.gripModel.releaseCue,
    },
  ]

  return (
    <section id="release-room" className="mx-auto max-w-6xl px-5 py-20 md:px-8 md:py-28">
      <TierMarker index="02" label="Release Room" />
      <div className="grid grid-cols-1 gap-12 md:grid-cols-12">
        <div className="md:col-span-5">
          <h2 className="display text-3xl leading-tight text-ink md:text-4xl">Translate the hold into a release.</h2>
          <p className="mt-5 max-w-[48ch] text-lg leading-relaxed text-ink-2">
            Grip shape only matters if the release makes sense. This room keeps the player reading
            pressure, thumb support, and ball depth before movement numbers show up.
          </p>
          {guide ? (
            <figure className="mt-8 border-l-2 border-seam/60 pl-5">
              <blockquote className="display max-w-[44ch] text-xl italic leading-relaxed text-ink">
                {guide.feel}
              </blockquote>
              <figcaption className="mono-label mt-2">Feel cue</figcaption>
            </figure>
          ) : null}
        </div>

        <div className="md:col-span-7">
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
            {sequence.map((item, index) => (
              <article key={item.label} className="border-t border-ink-3/35 pt-4">
                <span className="font-mono text-xs tabular-nums text-seam">0{index + 1}</span>
                <h3 className="display mt-2 text-xl leading-tight text-ink">{item.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-ink-2">{item.copy}</p>
              </article>
            ))}
          </div>
          <div className="mt-10 rounded-sm border border-ink-3/25 bg-paper-2/70 p-4">
            <ReleaseArc />
          </div>
        </div>
      </div>

      <div className="mt-14 grid grid-cols-1 gap-10 border-t border-ink-3/30 pt-10 md:grid-cols-12">
        <div className="md:col-span-5">
          <div className="relative mx-auto aspect-square w-full max-w-[360px]">
            <BallStage
              entry={entry}
              grip
              hand
              faceGrip
              autoSpin={false}
              view="side"
              className="h-full w-full"
            />
          </div>
        </div>
        <div className="flex items-center md:col-span-7">
          <ClaimProse claim={canonical.mechanics} proseClassName="text-lg leading-relaxed text-ink" />
        </div>
      </div>
    </section>
  )
}
