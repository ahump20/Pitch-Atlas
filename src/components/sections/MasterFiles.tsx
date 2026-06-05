import type { MasterVariantRecord, PitchAtlasEntry, PitchMotion } from '../../data/types'
import { TierMarker } from '../layout/TierMarker'
import { SeamSchematic } from '../fallback/SeamSchematic'
import { SourcedValue } from '../provenance/SourcedValue'
import { ConfidenceLabel } from '../provenance/ConfidenceLabel'
import { SourceBadge } from '../provenance/SourceBadge'

/*
  Tier 02. Masters are the trust hook: how named arms actually throw the pitch,
  filed as archive cards rather than a stat table. Every figure stays sourced and
  confidence-labeled through the existing provenance primitives. The card only
  adds the archive frame, the file stamp, the verified-attributed stamp, and one
  accent figure. No player likeness ever appears; the visual is our own seam
  specimen oriented to the pitch's axis.
*/

/** The figure a card paints red: the pitch's defining break, else the first number. */
function accentIndex(variant: MasterVariantRecord): number {
  const i = variant.numbers.findIndex((n) => /vertical break|rise|drop|run|sweep/i.test(n.label))
  return i >= 0 ? i : 0
}

function VerifiedStamp() {
  return (
    <span
      className="inline-flex select-none items-center rounded-[2px] border border-navy/60 px-2 py-1 font-mono text-[9px] uppercase tracking-[0.16em] text-navy shadow-[inset_0_0_0_1px_rgba(169,42,34,0.25)]"
      style={{ transform: 'rotate(-2deg)' }}
      title="Verified, attributed: figures tied to a named pitcher and traced to a cited source."
    >
      Verified · Attributed
    </span>
  )
}

function MasterFileCard({
  variant,
  motion,
  fileNo,
}: {
  variant: MasterVariantRecord
  motion: PitchMotion
  fileNo: string
}) {
  const accent = accentIndex(variant)
  return (
    <article className="relative rounded-sm border border-navy/15 border-l-2 border-l-navy bg-paper p-6 md:p-7">
      <span aria-hidden="true" className="absolute left-2.5 top-2.5 h-3 w-3 border-l border-t border-navy/35" />
      <span aria-hidden="true" className="absolute right-2.5 top-2.5 h-3 w-3 border-r border-t border-navy/35" />

      <div className="mb-5 flex items-center justify-between gap-4">
        <span className="mono-label text-navy">Master file · {fileNo}</span>
        {variant.verifiedPro ? <VerifiedStamp /> : null}
      </div>
      <span className="hairline mb-6 block" aria-hidden="true" />

      <div className="grid grid-cols-1 gap-6 md:grid-cols-12 md:gap-8">
        <div className="flex items-start gap-4 md:col-span-4">
          <div className="w-16 shrink-0 rounded-full border border-navy/20 p-1.5 sm:w-20" aria-hidden="true">
            <SeamSchematic
              className="h-full w-full"
              showAxis={false}
              showStitches={false}
              spinAxis={motion.spinAxis}
              gyro={motion.gyro}
              title=""
            />
          </div>
          <div>
            <h3 className="display text-xl text-navy md:text-2xl">{variant.pitcher}</h3>
            <p className="mt-2 max-w-[40ch] leading-relaxed text-ink-2">{variant.context}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-x-6 gap-y-7 sm:grid-cols-3 md:col-span-8">
          {variant.numbers.map((n, i) => (
            <div key={n.label} className="border-t border-navy/12 pt-3">
              <div className="mono-label mb-2.5 text-navy">{n.label}</div>
              <SourcedValue claim={n.claim} valueClassName="text-lg md:text-xl" accent={i === accent} />
            </div>
          ))}
        </div>
      </div>

      {variant.quote ? (
        <figure className="mt-7 border-t border-navy/12 pt-6">
          <blockquote className="display border-l-2 border-seam pl-5 text-lg italic leading-relaxed text-navy">
            {variant.quote.value}
          </blockquote>
          <figcaption className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1 pl-5">
            <ConfidenceLabel confidence={variant.quote.confidence} />
            {variant.quote.source ? (
              <>
                <span aria-hidden="true" className="text-ink-3">/</span>
                <SourceBadge source={variant.quote.source} />
              </>
            ) : null}
          </figcaption>
        </figure>
      ) : null}
    </article>
  )
}

export function MasterFiles({ entry }: { entry: PitchAtlasEntry }) {
  const { masterVariants, motion, display } = entry

  return (
    <section id="masters" className="mx-auto max-w-6xl px-5 py-20 md:px-8 md:py-28">
      <TierMarker index="02" label="Master files" />
      <div className="mb-12 grid grid-cols-1 gap-x-10 gap-y-4 md:grid-cols-12">
        <h2 className="display text-3xl leading-tight text-ink md:col-span-5 md:text-4xl">
          The verified baseline.
        </h2>
        <p className="max-w-[60ch] self-end text-lg leading-relaxed text-ink-2 md:col-span-7">{display.mastersIntro}</p>
      </div>

      {masterVariants.length > 0 ? (
        <div className="flex flex-col gap-5">
          {masterVariants.map((variant, i) => (
            <MasterFileCard
              key={variant.pitcher}
              variant={variant}
              motion={motion}
              fileNo={String(i + 1).padStart(2, '0')}
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center gap-4 rounded-sm border border-dashed border-navy/25 px-6 py-16 text-center">
          <img src="/brand/seal.webp" alt="" width={64} height={64} className="opacity-80" aria-hidden="true" />
          <p className="max-w-[46ch] leading-relaxed text-ink-2">
            No master files for this pitch yet. A master is filed only when a named arm and a cited source
            both exist. Nothing is added to fill the page.
          </p>
        </div>
      )}

      <p className="mt-8 max-w-[78ch] border-t border-navy/12 pt-6 text-sm leading-relaxed text-ink-2">
        Filed only when the bar is met. A real figure from the wrong tracking system, or a great arm whose
        signature pitch sits in a different category, gets left off rather than dressed up. The gap is the
        honesty.
      </p>
    </section>
  )
}
