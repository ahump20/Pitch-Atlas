import { useId, useMemo, useState } from 'react'
import { useSeoMeta } from '@unhead/react'
import { SITE } from '../config/site'
import { SectionHero } from '../components/layout/SectionHero'
import { Breadcrumb } from '../components/layout/Breadcrumb'
import { SeamSchematic } from '../components/fallback/SeamSchematic'
import { MovementPlot } from '../components/fallback/MovementPlot'
import { buildBreak, tiltClock, describeShape, ANCHOR_NOTE, type BreakInputs } from '../lib/sandbox'
import type { PitchMotion } from '../data/types'

/*
  Build the break. The spin-axis sandbox: set the spin tilt, rate, efficiency, and
  velocity, and watch the same seam ball and catcher's-eye plot the filed pitches
  use redraw live. It exposes the atlas's own physics (lib/physics.ts) so spin axis
  stops being a phrase and becomes something you can feel. The inch magnitudes are
  a labeled teaching scale, never presented as a measured prediction.
*/

const PRESETS: { label: string; inputs: BreakInputs }[] = [
  { label: 'Four-seam', inputs: { tiltDeg: 0, rpm: 2300, effPct: 92, veloMph: 94 } },
  { label: '12-6 curve', inputs: { tiltDeg: 180, rpm: 2500, effPct: 80, veloMph: 80 } },
  { label: 'Sweeper', inputs: { tiltDeg: 95, rpm: 2600, effPct: 65, veloMph: 84 } },
  { label: 'Gyro slider', inputs: { tiltDeg: 60, rpm: 2500, effPct: 22, veloMph: 87 } },
  { label: 'Sinker', inputs: { tiltDeg: 40, rpm: 2150, effPct: 88, veloMph: 93 } },
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
        className="mt-2 w-full accent-[var(--color-seam)]"
        aria-label={label}
      />
      {hint ? <span className="mt-1 block text-xs leading-snug text-ink-2">{hint}</span> : null}
    </label>
  )
}

function Stat({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="bg-paper px-4 py-3">
      <p className="mono-label">{label}</p>
      <p className="display mt-1 text-2xl text-ink tabular-nums">{value}</p>
      {sub ? <p className="mt-0.5 text-xs text-ink-2">{sub}</p> : null}
    </div>
  )
}

export function SandboxPage() {
  const [tiltDeg, setTilt] = useState(PRESETS[0].inputs.tiltDeg)
  const [rpm, setRpm] = useState(PRESETS[0].inputs.rpm)
  const [effPct, setEff] = useState(PRESETS[0].inputs.effPct)
  const [veloMph, setVelo] = useState(PRESETS[0].inputs.veloMph)

  const result = useMemo(() => buildBreak({ tiltDeg, rpm, effPct, veloMph }), [tiltDeg, rpm, effPct, veloMph])

  const motion: PitchMotion = {
    spinAxis: result.spinAxis,
    forceLabel: 'Magnus',
    gyro: result.gyro,
    ivbInches: result.ivbInches,
    horizontalInches: result.horizontalInches,
    horizontalDir: result.horizontalDir,
    breakView: 'movement',
  }

  function applyPreset(inputs: BreakInputs) {
    setTilt(inputs.tiltDeg)
    setRpm(inputs.rpm)
    setEff(inputs.effPct)
    setVelo(inputs.veloMph)
  }

  useSeoMeta({
    title: `Build the Break: the spin-axis sandbox | ${SITE.siteName}`,
    description:
      'Set a pitch’s spin tilt, rate, efficiency, and velocity and watch the ball and its catcher’s-eye movement redraw live. The atlas’s own physics, made playable — a teaching model that turns spin axis into something you can feel.',
    ogTitle: `Build the Break | ${SITE.siteName}`,
    ogDescription: 'The spin-axis sandbox. Tilt, rate, efficiency, velocity — watch the break redraw.',
    ogUrl: `${SITE.canonicalDomain}/sandbox`,
  })

  const ivbWord = result.ivbInches > 0 ? 'of ride' : result.ivbInches < 0 ? 'of drop' : 'level'
  const horizWord =
    result.horizontalDir === 'arm-side'
      ? 'to the arm side'
      : result.horizontalDir === 'glove-side'
        ? 'to the glove side'
        : 'no run'

  return (
    <>
      <SectionHero
        breadcrumb={<Breadcrumb trail={[{ label: 'The Atlas', to: '/' }, { label: 'Build the Break' }]} />}
        eyebrow="The lab"
        accent="powder"
        title="Build the break."
        sub={
          <>
            Spin is what bends the ball. Set its tilt, its rate, how much of that spin actually does work, and
            how hard it is thrown — then watch the same seam ball and catcher&rsquo;s-eye plot the filed pitches
            use redraw in real time. This is the atlas&rsquo;s own physics, made playable.
          </>
        }
      />

      <section className="bg-paper">
        <div className="mx-auto grid max-w-6xl gap-10 px-5 py-16 md:grid-cols-2 md:px-8 md:py-20">
          {/* Controls */}
          <div>
            <p className="mono-label">Starting points</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {PRESETS.map((p) => (
                <button
                  key={p.label}
                  type="button"
                  onClick={() => applyPreset(p.inputs)}
                  className="rounded-sm border border-navy/20 px-3 py-1.5 font-mono text-xs uppercase tracking-[0.08em] text-ink-2 transition-colors hover:border-seam hover:text-seam"
                >
                  {p.label}
                </button>
              ))}
            </div>
            <p className="mt-2 text-xs text-ink-2">Illustrative starting points, not claims about a specific pitcher.</p>

            <div className="mt-8 space-y-7">
              <div className="flex items-end gap-4">
                <div className="grow">
                  <Slider
                    label="Spin tilt"
                    value={tiltDeg}
                    display={`${tiltClock(tiltDeg)} · ${tiltDeg}°`}
                    min={0}
                    max={345}
                    step={15}
                    onChange={setTilt}
                    hint="Where the spin points on a clock. 12:00 is pure backspin (ride); 6:00 is topspin (drop); 3:00 and 9:00 are pure sidespin."
                  />
                </div>
                <TiltDial tiltDeg={tiltDeg} />
              </div>

              <Slider
                label="Spin rate"
                value={rpm}
                display={`${rpm.toLocaleString()} rpm`}
                min={800}
                max={3200}
                step={50}
                onChange={setRpm}
                hint="Total revolutions per minute. League four-seams sit near 2,300."
              />

              <Slider
                label="Spin efficiency"
                value={effPct}
                display={`${effPct}% active`}
                min={0}
                max={100}
                step={1}
                onChange={setEff}
                hint="The share of spin that does Magnus work. The rest is gyro (bullet) spin that points the axis at the catcher and moves nothing."
              />

              <Slider
                label="Velocity"
                value={veloMph}
                display={`${veloMph} mph`}
                min={68}
                max={104}
                step={1}
                onChange={setVelo}
                hint="A slower pitch hangs longer, so the Magnus force has more time to bend it."
              />
            </div>
          </div>

          {/* Visuals + readouts */}
          <div>
            <div className="grid grid-cols-2 gap-4">
              <figure className="on-stage stage-spot flex flex-col items-center justify-center rounded-sm p-4">
                <SeamSchematic
                  className="h-40 w-40"
                  spinAxis={result.spinAxis}
                  gyro={result.gyro}
                  surface="stage"
                  title={`The ball, oriented to a ${tiltClock(tiltDeg)} spin tilt at ${effPct}% efficiency. ${result.gyro ? 'The axis points at the catcher: gyro spin.' : 'The dashed line is the spin axis.'}`}
                />
                <figcaption className="mono-label-stage mt-2">From the side</figcaption>
              </figure>
              <figure className="flex flex-col items-center justify-center rounded-sm border border-navy/15 bg-paper-2 p-3">
                <MovementPlot className="w-full" motion={motion} pitchName="custom pitch" />
                <figcaption className="mono-label mt-1">Catcher&rsquo;s eye</figcaption>
              </figure>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-px overflow-hidden rounded-sm border border-navy/15 bg-navy/10">
              <Stat label="Active spin" value={`${result.activeRpm.toLocaleString()}`} sub="rpm doing work" />
              <Stat label="Gyro spin" value={`${result.gyroRpm.toLocaleString()}`} sub="rpm, bullet" />
              <Stat
                label="Induced vertical"
                value={`${result.ivbInches >= 0 ? '+' : ''}${result.ivbInches} in`}
                sub={ivbWord}
              />
              <Stat label="Horizontal" value={`${result.horizontalInches} in`} sub={horizWord} />
            </div>

            <p className="mt-4 text-base leading-relaxed text-ink">{describeShape(result)}</p>
          </div>
        </div>

        {/* The honest line: what is physics, what is a teaching scale. */}
        <div className="mx-auto max-w-6xl px-5 pb-20 md:px-8">
          <div className="rounded-sm border-l-2 border-navy bg-paper-2 px-5 py-4">
            <p className="mono-label text-navy">Teaching model</p>
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
