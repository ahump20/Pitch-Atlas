import type { ReactNode } from 'react'
import type { PitchAtlasEntry } from '../../data/types'
import { TierMarker } from '../layout/TierMarker'
import { GaugeRail } from '../layout/GaugeRail'
import type { Gauge } from '../layout/GaugeRail'
import { ClaimProse } from '../provenance/ClaimProse'
import { ConfidenceLabel } from '../provenance/ConfidenceLabel'
import { SourceBadge } from '../provenance/SourceBadge'
import { ClaimNote } from '../provenance/SourcedValue'
import { CarryDiagram } from '../fallback/CarryDiagram'
import { MovementPlot } from '../fallback/MovementPlot'

function SubHeading({ children }: { children: ReactNode }) {
  return <h3 className="text-sm font-semibold tracking-wide text-dim">{children}</h3>
}

function buildGauges(entry: PitchAtlasEntry): Gauge[] {
  const p = entry.canonical.physics
  const gauges: Gauge[] = [{ key: 'spin', label: 'Spin rate', claim: p.spinRateRpm }]
  if (p.activeSpinPct) gauges.push({ key: 'active', label: 'Active spin', claim: p.activeSpinPct })
  gauges.push({
    key: 'primary',
    label: p.primaryBreak.label,
    claim: p.primaryBreak.claim,
    accent: p.primaryBreak.accent,
  })
  if (p.secondaryBreak)
    gauges.push({ key: 'secondary', label: p.secondaryBreak.label, claim: p.secondaryBreak.claim })
  gauges.push({ key: 'axis', label: 'Spin axis', claim: p.spinAxis })
  return gauges
}

export function Foundation({ entry }: { entry: PitchAtlasEntry }) {
  const { canonical, motion, display } = entry
  const { voice } = canonical
  const isCarry = motion.breakView === 'carry'

  return (
    <section id="foundation" className="mx-auto max-w-6xl px-5 py-20 md:px-8 md:py-28">
      <TierMarker index="01" label="Foundation" />

      <div className="grid grid-cols-1 gap-x-10 gap-y-14 md:grid-cols-12">
        {/* gauge rail */}
        <div className="md:col-span-4">
          <GaugeRail gauges={buildGauges(entry)} caption={display.foundationCaption} />
        </div>

        {/* prose track */}
        <div className="flex flex-col gap-12 md:col-span-8">
          <div className="flex flex-col gap-6">
            <SubHeading>The grip</SubHeading>
            <ClaimProse claim={canonical.grip} proseClassName="text-xl leading-relaxed text-ink" />
            <div className="grid grid-cols-1 gap-x-8 gap-y-6 sm:grid-cols-2">
              {canonical.gripDetails.map((detail, i) => (
                <ClaimProse key={i} claim={detail} proseClassName="text-base leading-relaxed text-ink/85" />
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-6">
            <SubHeading>How it is thrown</SubHeading>
            <ClaimProse claim={canonical.mechanics} />
          </div>

          <div className="flex flex-col gap-6 border-t border-machined/70 pt-12">
            <SubHeading>{isCarry ? 'Carry: the gravity ghost' : 'The break'}</SubHeading>
            <ClaimProse claim={canonical.physics.teaching} proseClassName="text-xl leading-relaxed text-ink" />

            <figure className="mt-2 flex flex-col gap-4">
              <div className="rounded-sm border border-machined/60 bg-panel/40 p-4">
                {isCarry ? (
                  <CarryDiagram className="mx-auto w-full max-w-[480px]" />
                ) : (
                  <MovementPlot
                    className="mx-auto w-full max-w-[480px]"
                    motion={motion}
                    pitchName={canonical.name}
                  />
                )}
              </div>
              <figcaption className="mono-label">
                {isCarry
                  ? 'Spinless phantom vs four-seam. The gap is the induced vertical break.'
                  : "Catcher's-eye break vs a spinless ball. Schematic, scaled from sourced figures."}
              </figcaption>
            </figure>

            {voice && voice.source ? (
              <figure className="mt-4 border-l border-machined pl-5">
                <blockquote className="max-w-[52ch] pb-1 font-prose text-lg italic leading-relaxed text-ink/90">
                  &ldquo;{voice.value}&rdquo;
                </blockquote>
                <figcaption className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1">
                  <ConfidenceLabel confidence={voice.confidence} />
                  <span aria-hidden="true" className="text-machined">
                    /
                  </span>
                  <SourceBadge source={voice.source} />
                </figcaption>
                {voice.note ? <ClaimNote>{voice.note}</ClaimNote> : null}
              </figure>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  )
}
