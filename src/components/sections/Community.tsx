import type { PitchAtlasEntry } from '../../data/types'
import { TierMarker } from '../layout/TierMarker'

/*
  Tier 03. An honest empty state. The adoption-ranked scaffold is shown so the
  shape is legible, but it carries no rows, no counts, no fabricated posts. The
  safety and provenance promises sit beside it.
*/
export function Community({ entry }: { entry: PitchAtlasEntry }) {
  const { community } = entry
  return (
    <section id="community" className="mx-auto max-w-6xl px-5 py-20 md:px-8 md:py-28">
      <TierMarker index="03" label="Community" />

      <div className="grid grid-cols-1 gap-x-10 gap-y-10 md:grid-cols-12">
        <div className="flex flex-col gap-5 md:col-span-4">
          <h3 className="text-2xl font-semibold leading-snug text-ink">Not open yet, on purpose.</h3>
          <p className="max-w-[42ch] leading-relaxed text-dim">{community.safetyNote}</p>
          <p className="max-w-[42ch] leading-relaxed text-dim">{community.provenanceNote}</p>
        </div>

        <div className="md:col-span-8">
          <div className="overflow-hidden rounded-sm border border-machined/70">
            <div className="grid grid-cols-[2.5rem_1fr_7rem_7rem] gap-3 border-b border-machined/70 bg-panel/50 px-4 py-3">
              {community.columns.map((c) => (
                <span key={c} className="mono-label">
                  {c}
                </span>
              ))}
            </div>
            <div className="flex flex-col items-center justify-center gap-3 px-4 py-20 text-center">
              <span className="mono-label">Empty</span>
              <p className="max-w-[44ch] leading-relaxed text-dim">
                No community variants yet. When they open, each one appears here ranked by adoption,
                with the same source and confidence label as every record above.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
