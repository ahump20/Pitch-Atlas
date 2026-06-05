import { useState } from 'react'
import type { Gauge } from '../layout/GaugeRail'
import type { PitchAtlasEntry } from '../../data/types'
import { TierMarker } from '../layout/TierMarker'
import { GaugeRail } from '../layout/GaugeRail'
import { BallStage } from '../ball/BallStage'
import { ClaimProse } from '../provenance/ClaimProse'
import { ConfidenceLabel } from '../provenance/ConfidenceLabel'
import { SourceBadge } from '../provenance/SourceBadge'
import { ClaimNote } from '../provenance/SourcedValue'
import { CarryDiagram } from '../fallback/CarryDiagram'
import { MovementPlot } from '../fallback/MovementPlot'

/*
  Tier 02. Lead with plain English: what the pitch does, in a sentence anyone can
  read. The Magnus / induced-break physics — correct, sourced, but homework —
  lives inside a disclosure that is closed by default. The spin-axis + Magnus
  vectors are heavy, so they mount only while the disclosure is open.
*/

function buildGauges(entry: PitchAtlasEntry): Gauge[] {
  const p = entry.canonical.physics
  const gauges: Gauge[] = [{ key: 'spin', label: 'Spin rate', claim: p.spinRateRpm }]
  if (p.activeSpinPct) gauges.push({ key: 'active', label: 'Active spin', claim: p.activeSpinPct })
  gauges.push({ key: 'primary', label: p.primaryBreak.label, claim: p.primaryBreak.claim, accent: p.primaryBreak.accent })
  if (p.secondaryBreak)
    gauges.push({ key: 'secondary', label: p.secondaryBreak.label, claim: p.secondaryBreak.claim })
  gauges.push({ key: 'axis', label: 'Spin axis', claim: p.spinAxis })
  return gauges
}

export function MovementTranslation({ entry }: { entry: PitchAtlasEntry }) {
  const { canonical, motion, guide, display } = entry
  const { voice } = canonical
  const isCarry = motion.breakView === 'carry'
  const [open, setOpen] = useState(false)

  return (
    <section id="movement-translation" className="bg-paper-2/60">
      <div className="mx-auto max-w-6xl px-5 py-20 md:px-8 md:py-28">
        <TierMarker index="03" label="Movement translation" />

        <div className="max-w-[40ch]">
          <h2 className="display text-3xl leading-[1.1] text-ink md:text-[2.6rem]">
            {guide ? guide.does.headline : display.foundationCaption}
          </h2>
        </div>
        <p className="mt-6 max-w-[60ch] text-xl leading-relaxed text-ink/90">
          {guide ? guide.does.plain : canonical.physics.teaching.value}
        </p>

        <details
          open={open}
          onToggle={(e) => setOpen((e.currentTarget as HTMLDetailsElement).open)}
          className="group mt-12 border-t border-ink-3/40 pt-6"
        >
          <summary className="flex cursor-pointer list-none items-center gap-2 font-mono text-xs uppercase tracking-[0.14em] text-ink-2 transition-colors hover:text-ink">
            <span aria-hidden="true" className="text-seam transition-transform group-open:rotate-90">›</span>
            The measured movement, if you want it
          </summary>

          <div className="mt-8 flex flex-col gap-10">
            <ClaimProse claim={canonical.physics.teaching} proseClassName="max-w-[64ch] text-lg leading-relaxed text-ink" />

            <div className="grid grid-cols-1 gap-x-10 gap-y-10 md:grid-cols-12">
              <div className="md:col-span-5">
                <div className="relative mx-auto aspect-square w-full max-w-[360px]">
                  {open ? (
                    <BallStage entry={entry} vectors className="h-full w-full" />
                  ) : null}
                </div>
                <p className="mono-label mt-3 text-center">
                  Spin axis and force direction, drawn in render space
                </p>
              </div>

              <div className="flex flex-col gap-8 md:col-span-7">
                <GaugeRail gauges={buildGauges(entry)} caption={display.foundationCaption} />

                <figure className="flex flex-col gap-3">
                  <div className="rounded-sm border border-ink-3/30 bg-paper p-4">
                    {isCarry ? (
                      <CarryDiagram className="mx-auto w-full max-w-[460px]" ivbInches={motion.ivbInches} />
                    ) : (
                      <MovementPlot className="mx-auto w-full max-w-[460px]" motion={motion} pitchName={canonical.name} />
                    )}
                  </div>
                  <figcaption className="mono-label">
                    {isCarry
                      ? 'Spinless phantom vs the real pitch. The gap is the induced vertical break.'
                      : "Catcher's-eye break vs a spinless ball. Schematic, scaled from sourced figures."}
                  </figcaption>
                </figure>
              </div>
            </div>

            {voice && voice.source ? (
              <figure className="border-l-2 border-seam/50 pl-5">
                <blockquote className="display max-w-[52ch] text-lg italic leading-relaxed text-ink">
                  &ldquo;{voice.value}&rdquo;
                </blockquote>
                <figcaption className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1">
                  <ConfidenceLabel confidence={voice.confidence} />
                  <span aria-hidden="true" className="text-ink-3">/</span>
                  <SourceBadge source={voice.source} />
                </figcaption>
                {voice.note ? <ClaimNote>{voice.note}</ClaimNote> : null}
              </figure>
            ) : null}
          </div>
        </details>
      </div>
    </section>
  )
}

export const WhatItDoes = MovementTranslation
