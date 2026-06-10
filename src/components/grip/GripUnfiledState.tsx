import { SeamSchematic } from '../fallback/SeamSchematic'
import { GripSourceBadge } from './GripSourceBadge'
import type { PitchAtlasEntry } from '../../data/types'

/*
  The honest empty state of the Grip Lab. Some pitches have no canonical grip —
  the eephus works from almost any hold, and no source supports drawing one set
  of fingers as "the" grip. Inventing geometry to fill the panel is exactly the
  failure this product removed, so the panel says what is true instead: the ball,
  the spin axis, the unfiled marker, and what to read in place of a hold. The
  'unverified' source badge stays inside the panel, same as a filed grip.
*/

export function GripUnfiledState({
  entry,
  accentColor,
}: {
  entry: PitchAtlasEntry
  accentColor: string
}) {
  const { canonical, motion } = entry
  const gm = canonical.gripModel

  return (
    <div data-grip-unfiled className="flex flex-col gap-4">
      <div
        className="relative mx-auto aspect-square w-full max-w-[480px] overflow-hidden rounded-[20px]"
        style={{
          background: `radial-gradient(120% 100% at 50% 18%, color-mix(in srgb, ${accentColor} 10%, transparent), transparent 60%), var(--color-press)`,
          border: `1px dashed color-mix(in srgb, ${accentColor} 34%, transparent)`,
        }}
      >
        <div className="h-full w-full p-[10%] opacity-60">
          <SeamSchematic
            className="h-full w-full"
            spinAxis={motion.spinAxis}
            gyro={motion.gyro}
            surface="stage"
            title={`A ${canonical.name} specimen with no canonical grip drawn. The seam and spin axis are shown; no finger placement is on file.`}
          />
        </div>
        <span
          className="absolute left-3.5 top-3.5 rounded-full border px-2.5 py-1 font-mono text-[9px] uppercase tracking-[0.14em]"
          style={{
            color: accentColor,
            borderColor: `color-mix(in srgb, ${accentColor} 45%, transparent)`,
            background: 'var(--color-stage, #08060e)',
          }}
        >
          No canonical grip on file
        </span>
        <div className="absolute bottom-3.5 left-3.5 right-3.5">
          <GripSourceBadge provenance={gm.provenance} />
        </div>
      </div>

      <div className="mx-auto w-full max-w-[480px]">
        <p className="text-[14px] leading-relaxed text-bone">{gm.provenance.value}</p>
        {gm.provenance.note ? (
          <p className="mt-2 text-[12.5px] leading-relaxed text-bone-2">{gm.provenance.note}</p>
        ) : null}
        <p
          className="mt-4 border-l-2 pl-3.5 text-[13px] leading-relaxed text-bone-2"
          style={{ borderColor: `color-mix(in srgb, ${accentColor} 40%, transparent)` }}
        >
          <span className="mr-2 font-mono text-[9px] uppercase tracking-[0.12em]" style={{ color: accentColor }}>
            Read this instead
          </span>
          {gm.releaseCue}
        </p>
      </div>
    </div>
  )
}
