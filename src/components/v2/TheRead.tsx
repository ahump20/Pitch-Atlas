import {
  CONFIDENCE_META,
  type ClaimConfidence,
  type PitchAtlasEntry,
} from '../../data/types'
import { accentForSlug } from '../refractor/accents'
import { BallStage } from '../ball/BallStage'
import { RefractorBall } from '../refractor/RefractorBall'

/*
  v2 · The Read. The two halves of a pitch, side by side: how it's held and how
  it moves. Left is the live R3F grip lab (the studio-lit cowhide ball and the
  solved hand, draggable; no-WebGL falls back to the 2D grip silhouettes). Right
  is the shape, in plain words, over the SVG ball's own spin axis. The line that
  matters most sits under the shape: the read is qualitative and sourced, never a
  fabricated figure. That is the charter, made literal in the layout.
*/

const TIER_DOT: Record<ClaimConfidence, string> = {
  'official-data': '#4FB286',
  'pitcher-own-words': '#6CACE4',
  'coach-observed': '#6CACE4',
  'reputable-analysis': '#D8A24A',
  'secondhand-attributed': '#C7B98F',
  'community-firsthand': '#C7B98F',
  unverified: '#FF4D5E',
}

export function TheRead({ featured }: { featured: PitchAtlasEntry }) {
  const { canonical, motion, display } = featured
  const accent = accentForSlug(display.slug)
  const grip = canonical.grip
  const shape = canonical.physics.shape

  return (
    <section
      className="v2-stage v2-tooth relative border-t border-bone/10"
      style={{ '--c3': accent.c3 } as React.CSSProperties}
    >
      <div className="mx-auto max-w-[1320px] px-5 py-20 md:px-8 md:py-28">
        <h2 className="rfx-athletic v2-display max-w-[18ch] text-[clamp(28px,5vw,52px)] leading-[0.94]">
          How it's held. How it moves.
        </h2>
        <p className="mt-4 max-w-[58ch] text-[15px] leading-relaxed text-bone-2">
          Lead with the grip a hand can actually take, then the shape it makes in the air. Drag the
          ball to read the hold from any angle.
        </p>

        <div className="mt-12 grid grid-cols-1 gap-12 md:grid-cols-2 md:gap-14">
          {/* the grip — live R3F grip lab */}
          <div>
            <div className="relative mx-auto aspect-square w-full max-w-[420px]">
              <BallStage entry={featured} grip faceGrip surface="stage" autoSpin={false} className="h-full w-full" />
            </div>
            <p className="mt-6 font-mono text-[10px] uppercase tracking-[0.16em] text-bone-2">The grip</p>
            <p className="mt-2 max-w-[46ch] text-[14px] leading-relaxed text-bone">{grip.value}</p>
            {grip.source ? (
              <a
                href={grip.source.url}
                target="_blank"
                rel="noreferrer noopener"
                className="mt-3 inline-block font-mono text-[10px] uppercase tracking-[0.1em] text-bone-2 underline decoration-bone-2/40 underline-offset-2 transition-colors hover:text-bone"
              >
                {grip.source.label} <span aria-hidden="true">↗</span>
              </a>
            ) : null}
          </div>

          {/* the shape — spin axis + words */}
          <div>
            <div className="relative mx-auto aspect-square w-full max-w-[420px]">
              <RefractorBall
                spinAxis={motion.spinAxis}
                gyro={motion.gyro}
                accent={accent}
                id="read-shape"
                showHalo
              />
            </div>
            <p className="mt-6 font-mono text-[10px] uppercase tracking-[0.16em] text-bone-2">The shape</p>
            <p className="mt-2 max-w-[46ch] text-[14px] leading-relaxed text-bone">{shape.value}</p>
            <p className="mt-3 inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.1em] text-bone">
              <i className="inline-block h-1.5 w-1.5 rounded-full" style={{ background: TIER_DOT[shape.confidence] }} />
              {CONFIDENCE_META[shape.confidence].label}
              {shape.approximate ? <span className="text-bone-2/60"> · approx</span> : null}
            </p>
            <p className="mt-4 max-w-[46ch] border-l border-bone/20 pl-3 text-[12.5px] leading-relaxed text-bone-2/85">
              The shape is read in words and a spin axis, never a spin rate, velocity, or break in
              inches the pitch was not measured for. The dashed line is its real axis; the numbers it
              does not claim stay blank on purpose.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
