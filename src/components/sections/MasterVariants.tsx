import type { PitchAtlasEntry } from '../../data/types'
import { TierMarker } from '../layout/TierMarker'
import { SeamSchematic } from '../fallback/SeamSchematic'
import { SourcedValue } from '../provenance/SourcedValue'

/*
  Tier 02. A sourced ledger, full-width rows, not three cards. Each entry is
  stamped with our own seam schematic (never a player image) and carries
  season-stamped, confidence-labeled figures that link to their source.
*/
export function MasterVariants({ entry }: { entry: PitchAtlasEntry }) {
  const { masterVariants, display } = entry
  return (
    <section id="masters" className="mx-auto max-w-6xl px-5 py-20 md:px-8 md:py-28">
      <TierMarker index="02" label="Master variants" />
      <p className="mb-12 max-w-[60ch] text-lg leading-relaxed text-dim">{display.mastersIntro}</p>

      <div className="flex flex-col">
        {masterVariants.map((variant) => (
          <article
            key={variant.pitcher}
            className="grid grid-cols-1 gap-6 border-t border-machined/70 py-10 md:grid-cols-12 md:gap-8"
          >
            <div className="flex items-start gap-4 md:col-span-4">
              <div className="w-16 shrink-0 sm:w-20" aria-hidden="true">
                <SeamSchematic
                  className="h-full w-full"
                  showAxis={false}
                  showStitches={false}
                  title=""
                />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-xl font-semibold text-ink">{variant.pitcher}</h3>
                  {variant.verifiedPro ? <span className="mono-label">pro</span> : null}
                </div>
                <p className="mt-2 max-w-[40ch] leading-relaxed text-dim">{variant.context}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-3 md:col-span-8">
              {variant.numbers.map((n) => (
                <div key={n.label}>
                  <div className="mono-label mb-2.5">{n.label}</div>
                  <SourcedValue claim={n.claim} valueClassName="text-lg md:text-xl" />
                </div>
              ))}
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}
