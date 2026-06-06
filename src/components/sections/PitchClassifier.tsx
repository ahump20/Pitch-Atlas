import { useId, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { classifyPitch, filedSlugFor, type Confidence } from '../../lib/classify'
import { pitchBySlug } from '../../data/pitches'
import { MovementPlot } from '../fallback/MovementPlot'
import type { PitchMotion } from '../../data/types'

/*
  "What pitch is this?" — the classifier made interactive. Enter a tracking line
  (velocity + movement, optionally spin and efficiency) and it scores the shape
  against each pitch family's centroid, returns the closest match with honest
  confidence and a runner-up, and plots the shape on the catcher's-eye view. A
  filed family links to its full specimen. It is a reasoned read from movement,
  not a verified pitch ID — the panel says so, every time.
*/

const PRESETS: { label: string; velo: number; ivb: number; hb: number; eff: number | null; spin: number | null }[] = [
  { label: 'Riding heater', velo: 96, ivb: 17, hb: 7, eff: null, spin: null },
  { label: 'Heavy sinker', velo: 93, ivb: 5, hb: 15, eff: null, spin: null },
  { label: 'Big sweeper', velo: 82, ivb: -2, hb: -16, eff: null, spin: null },
  { label: 'Gyro slider', velo: 88, ivb: 0, hb: -5, eff: 18, spin: null },
  { label: '12-6 curve', velo: 79, ivb: -14, hb: -5, eff: null, spin: null },
  { label: 'Knuckleball', velo: 68, ivb: 1, hb: 2, eff: null, spin: 1100 },
]

const CONF_META: Record<Confidence, { label: string; cls: string }> = {
  high: { label: 'High confidence', cls: 'border-navy/40 text-navy' },
  medium: { label: 'Medium confidence', cls: 'border-columbia/50 text-columbia' },
  low: { label: 'Low confidence', cls: 'border-seam/50 text-seam' },
}

function NumberSlider({
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
  return (
    <label className="block" htmlFor={id}>
      <span className="flex items-baseline justify-between gap-3">
        <span className="mono-label">{label}</span>
        <span className="font-mono text-sm tabular-nums text-ink">{display}</span>
      </span>
      <input
        id={id}
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

export function PitchClassifier() {
  const [velo, setVelo] = useState(96)
  const [ivb, setIvb] = useState(17)
  const [hb, setHb] = useState(7)
  const [useEff, setUseEff] = useState(false)
  const [eff, setEff] = useState(50)
  const [useSpin, setUseSpin] = useState(false)
  const [spin, setSpin] = useState(2300)
  const [hand, setHand] = useState<'off' | 'R' | 'L'>('off')

  const result = useMemo(
    () =>
      classifyPitch({
        velo,
        ivb,
        hb,
        eff: useEff ? eff : null,
        spin: useSpin ? spin : null,
        hand: hand === 'off' ? null : hand,
      }),
    [velo, ivb, hb, useEff, eff, useSpin, spin, hand],
  )

  const slug = filedSlugFor(result.best)
  const filed = slug ? pitchBySlug(slug) : undefined

  const motion: PitchMotion = {
    spinAxis: { x: 0, y: 0, z: 1 },
    forceLabel: 'Entered shape',
    gyro: useEff && eff < 25,
    ivbInches: ivb,
    horizontalInches: Math.abs(hb),
    horizontalDir: hb > 1 ? 'arm-side' : hb < -1 ? 'glove-side' : 'none',
    breakView: 'movement',
  }

  const conf = CONF_META[result.confidence]

  function applyPreset(p: (typeof PRESETS)[number]) {
    setVelo(p.velo)
    setIvb(p.ivb)
    setHb(p.hb)
    if (p.eff !== null) {
      setUseEff(true)
      setEff(p.eff)
    } else {
      setUseEff(false)
    }
    if (p.spin !== null) {
      setUseSpin(true)
      setSpin(p.spin)
    } else {
      setUseSpin(false)
    }
  }

  return (
    <div className="grid gap-10 md:grid-cols-2">
      {/* Inputs */}
      <div>
        <p className="mono-label">Try a tracking line</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {PRESETS.map((p) => (
            <button
              key={p.label}
              type="button"
              onClick={() => applyPreset(p)}
              className="rounded-sm border border-navy/20 px-3 py-1.5 font-mono text-xs uppercase tracking-[0.08em] text-ink-2 transition-colors hover:border-seam hover:text-seam"
            >
              {p.label}
            </button>
          ))}
        </div>
        <p className="mt-2 text-xs text-ink-2">Example shapes, not claims about a specific pitcher.</p>

        <div className="mt-8 space-y-7">
          <NumberSlider
            label="Velocity"
            value={velo}
            display={`${velo} mph`}
            min={50}
            max={105}
            step={1}
            onChange={setVelo}
            hint="Release/plate velocity. Under 65 is read as an eephus."
          />
          <NumberSlider
            label="Induced vertical break"
            value={ivb}
            display={`${ivb >= 0 ? '+' : ''}${ivb} in`}
            min={-22}
            max={25}
            step={1}
            onChange={setIvb}
            hint="Positive rides/carries, negative drops, against a spinless ball."
          />
          <NumberSlider
            label="Horizontal break"
            value={hb}
            display={`${hb >= 0 ? '+' : ''}${hb} in`}
            min={-20}
            max={20}
            step={1}
            onChange={setHb}
            hint="Arm-side run is positive, glove-side is negative — for either hand."
          />

          <div>
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={useEff} onChange={(e) => setUseEff(e.target.checked)} className="accent-[var(--color-seam)]" />
              <span className="mono-label">Add spin efficiency (finds gyro sliders)</span>
            </label>
            {useEff ? (
              <div className="mt-3">
                <NumberSlider
                  label="Spin efficiency"
                  value={eff}
                  display={`${eff}% active`}
                  min={0}
                  max={100}
                  step={1}
                  onChange={setEff}
                  hint="Under 25% on a slider/cutter shape reads as a gyro slider."
                />
              </div>
            ) : null}
          </div>

          <div>
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={useSpin} onChange={(e) => setUseSpin(e.target.checked)} className="accent-[var(--color-seam)]" />
              <span className="mono-label">Add total spin (finds knuckleballs)</span>
            </label>
            {useSpin ? (
              <div className="mt-3">
                <NumberSlider
                  label="Total spin"
                  value={spin}
                  display={`${spin.toLocaleString()} rpm`}
                  min={0}
                  max={3200}
                  step={50}
                  onChange={setSpin}
                  hint="Under 1,500 rpm at low velocity reads as a knuckleball."
                />
              </div>
            ) : null}
          </div>

          <div>
            <span className="mono-label text-ink-3">Handedness (optional)</span>
            <div className="mt-1.5 inline-flex overflow-hidden rounded-lg border border-cyan/30">
              {(['off', 'R', 'L'] as const).map((h) => (
                <button
                  key={h}
                  type="button"
                  onClick={() => setHand(h)}
                  aria-pressed={hand === h}
                  className="rfx-seg"
                >
                  {h === 'off' ? 'None' : `${h}HP`}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Result */}
      <div>
        <div className="rounded-sm border border-navy/15 bg-paper-2 p-5">
          <p className="mono-label text-ink-3">Most likely</p>
          <p className="display mt-1 text-4xl capitalize leading-tight text-navy">{result.best}</p>
          <span className={`mt-3 inline-block rounded-sm border px-2.5 py-1 font-mono text-xs uppercase tracking-[0.1em] ${conf.cls}`}>
            {conf.label}
          </span>

          {filed && slug ? (
            <Link
              to={`/pitch/${slug}`}
              className="mt-4 flex items-center justify-between gap-3 rounded-sm border border-navy/15 bg-paper px-4 py-3 transition-colors hover:border-seam"
            >
              <span className="text-sm text-ink">See the {filed.display.shortName} specimen</span>
              <span className="mono-label text-seam">→</span>
            </Link>
          ) : (
            <p className="mt-4 text-sm text-ink-2">This family isn&rsquo;t filed as a full specimen yet — find it in the Pitch Index.</p>
          )}

          {result.alternates.length > 0 ? (
            <div className="mt-5">
              <p className="mono-label text-ink-3">Next closest</p>
              <ul className="mt-2 space-y-1">
                {result.alternates.map((a) => (
                  <li key={a.type} className="flex items-baseline justify-between gap-3">
                    <span className="text-sm capitalize text-ink-2">{a.type}</span>
                    <span className="font-mono text-xs tabular-nums text-ink-3">{a.distance}</span>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>

        <figure className="mt-5 flex flex-col items-center rounded-sm border border-navy/15 bg-paper-2 p-3">
          <MovementPlot className="w-full" motion={motion} pitchName={result.best} />
          <figcaption className="mono-label mt-1">Your entered shape, catcher&rsquo;s eye</figcaption>
        </figure>

        <ul className="mt-5 space-y-2">
          {result.notes.map((n, i) => (
            <li key={i} className="border-l-2 border-navy/30 pl-3 text-sm leading-relaxed text-ink-2">
              {n}
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
