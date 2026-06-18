import { useId, useMemo, useState } from 'react'
import { useSeoMeta } from '@unhead/react'
import { SITE } from '../config/site'
import { canonicalUrl, contentJsonLd } from '../lib/seo'
import { StructuredData } from '../components/seo/StructuredData'
import { SectionHero } from '../components/layout/SectionHero'
import { Breadcrumb } from '../components/layout/Breadcrumb'
import { SeamSchematic } from '../components/fallback/SeamSchematic'
import { MovementPlot } from '../components/fallback/MovementPlot'
import { buildBreak, tiltClock, describeShape, ANCHOR_NOTE, type BreakInputs } from '../lib/sandbox'
import type { PitchMotion } from '../data/types'

/*
  Shape Lab. Set the spin tilt and watch the same seam ball and catcher's-eye plot
  translate it into shape language. No rpm, no speed, no inch output.
*/

const PRESETS: { label: string; inputs: BreakInputs }[] = [
  { label: '12:00 ride', inputs: { tiltDeg: 0 } },
  { label: '3:00 run', inputs: { tiltDeg: 90 } },
  { label: '6:00 drop', inputs: { tiltDeg: 180 } },
  { label: '9:00 sweep', inputs: { tiltDeg: 270 } },
  { label: 'Ride + run', inputs: { tiltDeg: 45 } },
  { label: 'Drop + sweep', inputs: { tiltDeg: 225 } },
]

/** A small compass that turns the spin tilt into a direction you can see. Decorative. */
function TiltDial({ tiltDeg }: { tiltDeg: number }) {
  const rad = (tiltDeg * Math.PI) / 180
  const R = 30
  const cx = 40
  const cy = 40
  const ex = cx + Math.sin(rad) * R
  const ey = cy - Math.cos(rad) * R
  const ticks = [
    { a: 0, t: '12' },
    { a: 90, t: '3' },
    { a: 180, t: '6' },
    { a: 270, t: '9' },
  ]
  return (
    <svg width="80" height="80" viewBox="0 0 80 80" aria-hidden="true" className="shrink-0">
      <circle cx={cx} cy={cy} r={R} fill="none" stroke="var(--color-navy-line)" strokeWidth="1" />
      {ticks.map((tk) => {
        const r = (tk.a * Math.PI) / 180
        return (
          <text
            key={tk.t}
            x={cx + Math.sin(r) * (R + 8)}
            y={cy - Math.cos(r) * (R + 8) + 3}
            textAnchor="middle"
            fill="var(--color-ink-3)"
            fontFamily="var(--font-mono)"
            fontSize="7"
          >
            {tk.t}
          </text>
        )
      })}
      <circle cx={cx} cy={cy} r="2.5" fill="var(--color-navy)" />
      <line x1={cx} y1={cy} x2={ex} y2={ey} stroke="var(--color-seam)" strokeWidth="2" strokeLinecap="round" />
      <circle cx={ex} cy={ey} r="3" fill="var(--color-seam)" />
    </svg>
  )
}

function Slider({
  label,
  value,
  display,
  min,
  max,
  step,
  onChange,
  hint,
}: {
  label: string
  value: number
  display: string
  min: number
  max: number
  step: number
  onChange: (n: number) => void
  hint?: string
}) {
  const id = useId()
  const name = label.toLowerCase().replace(/[^a-z0-9]+/g, '-')
  return (
    <label className="block" htmlFor={id}>
      <span className="flex items-baseline justify-between gap-3">
        <span className="mono-label">{label}</span>
        <span className="font-mono text-sm tabular-nums text-ink">{display}</span>
      </span>
      <input
        id={id}
        name={name}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(e.target.valueAsNumber)}
        className="mt-2 w-full accent-[var(--color-cyan)]"
        aria-label={label}
      />
      {hint ? <span className="mt-1 block text-xs leading-snug text-ink-2">{hint}</span> : null}
    </label>
  )
}

function Stat({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="rfx-panel px-4 py-3">
      <p className="mono-label">{label}</p>
      <p className="font-athletic uppercase mt-1 text-2xl text-bone tabular-nums">{value}</p>
      {sub ? <p className="mt-0.5 text-xs text-ink-2">{sub}</p> : null}
    </div>
  )
}

export function SandboxPage() {
  const [tiltDeg, setTilt] = useState(PRESETS[0].inputs.tiltDeg)

  const result = useMemo(() => buildBreak({ tiltDeg }), [tiltDeg])

  const motion: PitchMotion = {
    spinAxis: result.spinAxis,
    forceLabel: 'Magnus',
    gyro: result.gyro,
    verticalShape: result.verticalShape,
    horizontalDir: result.horizontalDir,
    breakView: 'movement',
  }

  function applyPreset(inputs: BreakInputs) {
    setTilt(inputs.tiltDeg)
  }

  useSeoMeta({
    title: `Shape Lab: the spin-axis sandbox | ${SITE.siteName}`,
    description:
      'Set a pitch’s spin tilt and watch the ball and catcher’s-eye shape redraw live. A teaching model for ride, drop, run, and sweep, with no fabricated movement numbers.',
    ogTitle: `Shape Lab | ${SITE.siteName}`,
    ogDescription: 'The spin-axis sandbox. Turn the clock and read the shape.',
    ogUrl: canonicalUrl('/sandbox'),
  })

  return (
    <>
      <StructuredData
        graph={contentJsonLd({
          type: 'CreativeWork',
          url: canonicalUrl('/sandbox'),
          name: 'Shape Lab: the spin-axis sandbox',
          description:
            'Set a pitch’s spin tilt and watch the ball and catcher’s-eye shape redraw live. A teaching model for ride, drop, run, and sweep, with no fabricated movement numbers.',
          breadcrumb: [{ name: 'The Atlas', to: '/' }, { name: 'Shape Lab' }],
        })}
      />
      <SectionHero
        breadcrumb={<Breadcrumb trail={[{ label: 'The Atlas', to: '/' }, { label: 'Shape Lab' }]} />}
        eyebrow="The lab"
        accent="powder"
        title="Turn spin into shape."
        sub={
          <>
            Spin is what gives the pitch its direction. Turn the clock and watch the seam ball and
            catcher&rsquo;s-eye plot redraw as ride, drop, arm-side run, or glove-side sweep.
          </>
        }
      />

      <section>
        <div className="mx-auto grid max-w-6xl gap-10 px-5 py-16 md:grid-cols-2 md:px-8 md:py-20">
          {/* Controls */}
          <div>
            <p className="rfx-skick">Starting points</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {PRESETS.map((p) => {
                const active =
                  p.inputs.tiltDeg === tiltDeg
                return (
                  <button
                    key={p.label}
                    type="button"
                    onClick={() => applyPreset(p.inputs)}
                    aria-pressed={active}
                    className="rfx-chip"
                  >
                    {p.label}
                  </button>
                )
              })}
            </div>
            <p className="mt-2 text-xs text-ink-2">Illustrative clock positions, not claims about a specific pitcher.</p>

            <div className="mt-8 space-y-7">
              <div className="flex items-end gap-4">
                <div className="grow">
                  <Slider
                    label="Spin tilt"
                    value={tiltDeg}
                    display={tiltClock(tiltDeg)}
                    min={0}
                    max={345}
                    step={15}
                    onChange={setTilt}
                    hint="Where the spin points on a clock. 12:00 is pure backspin (ride); 6:00 is topspin (drop); 3:00 and 9:00 are pure sidespin."
                  />
                </div>
                <TiltDial tiltDeg={tiltDeg} />
              </div>
            </div>
          </div>

          {/* Visuals + readouts */}
          <div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <figure className="on-stage stage-spot flex flex-col items-center justify-center rounded-sm p-4">
                <SeamSchematic
                  className="h-40 w-40"
                  spinAxis={result.spinAxis}
                  gyro={result.gyro}
                  surface="stage"
                  title={`The ball, oriented to a ${tiltClock(tiltDeg)} spin tilt. The dashed line is the spin axis.`}
                />
                <figcaption className="mono-label-stage mt-2">From the side</figcaption>
              </figure>
              <figure className="rfx-panel flex flex-col items-center justify-center p-3">
                <MovementPlot className="w-full" motion={motion} pitchName="custom pitch" />
                <figcaption className="mono-label mt-1">Catcher&rsquo;s eye</figcaption>
              </figure>
            </div>

            <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
              <Stat label="Vertical shape" value={result.verticalShape} sub="ride, drop, or flat" />
              <Stat label="Side shape" value={result.horizontalDir} sub="arm-side, glove-side, or true" />
            </div>

            <p className="mt-4 text-base leading-relaxed text-ink">{describeShape(result)}</p>
          </div>
        </div>

        {/* The honest line: what is physics, what is a teaching scale. */}
        <div className="mx-auto max-w-6xl px-5 pb-20 md:px-8">
          <div className="rfx-panel border-l-2 border-l-ink/15 px-5 py-4">
            <p className="mono-label text-bone-2">Teaching model</p>
            <p className="mt-2 max-w-[70ch] text-sm leading-relaxed text-ink-2">{ANCHOR_NOTE}</p>
            <p className="mt-2 max-w-[70ch] text-sm leading-relaxed text-ink-2">
              The plot&rsquo;s arm and glove sides are named from the ball&rsquo;s point of view; which physical
              side that is flips with the pitcher&rsquo;s hand.
            </p>
          </div>
        </div>
      </section>
    </>
  )
}
