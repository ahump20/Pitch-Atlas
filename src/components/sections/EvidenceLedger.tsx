import type { PitchAtlasEntry } from '../../data/types'
import { TierMarker } from '../layout/TierMarker'
import { MasterVariants } from './MasterVariants'
import { Community } from './Community'

export function EvidenceLedger({ entry }: { entry: PitchAtlasEntry }) {
  return (
    <>
      <section id="evidence-ledger" className="mx-auto max-w-6xl px-5 pt-20 md:px-8 md:pt-28">
        <TierMarker index="04" label="Evidence Ledger" />
        <div className="grid grid-cols-1 gap-8 border-b border-ink-3/30 pb-12 md:grid-cols-12">
          <h2 className="display text-3xl leading-tight text-ink md:col-span-5 md:text-4xl">
            Numbers belong after the hand understands the pitch.
          </h2>
          <p className="max-w-[62ch] text-lg leading-relaxed text-ink-2 md:col-span-7">
            This ledger keeps the current provenance model: official data, analysis, secondhand claims,
            empty community state, source labels, and caveats. The page order changes because the first
            visitor job is grip comprehension, not stat decoding.
          </p>
        </div>
      </section>
      <MasterVariants entry={entry} />
      <Community entry={entry} />
    </>
  )
}
