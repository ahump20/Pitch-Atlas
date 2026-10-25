import { useId, type ReactNode } from 'react'
import { legalArcWindow, type RuleKey } from '../../lib/slowpitch'
import { fixed, type LabModel } from './model'

/*
  The Flight Lab rail's small parts: a slider row (the Shape Lab's slider, on
  the dark stage), a readout pair, the arc gauge, and the "Model" / "Example"
  marker that keeps a modelled figure from passing as a measured one.
*/

export function SliderRow({
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
        <span className="mono-label-stage text-xs">{label}</span>
        <span className="font-mono text-sm tabular-nums text-bone">{display}</span>
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
        aria-valuetext={display}
      />
      {hint ? <span className="mt-1 block text-xs leading-snug text-bone-2">{hint}</span> : null}
    </label>
  )
}

/** A labelled control row: the mono label left, the control right. */
export function FieldRow({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
      <span className="mono-label-stage text-xs">{label}</span>
      {children}
    </div>
  )
}

export function Readout({ label, value, unit }: { label: string; value: string; unit?: string }) {
  return (
    <div className="min-w-0 border-t border-bone/12 pt-2">
      <p className="mono-label-stage text-xs leading-snug">{label}</p>
      <p className="mt-1.5 font-mono text-2xl tabular-nums text-bone">
        {value}
        {unit ? <span className="ml-1.5 text-xs text-bone-2">{unit}</span> : null}
      </p>
    </div>
  )
}

/** Marks a figure the lab models or sets by hand, so it never reads as measured. */
export function ModelMark({ kind }: { kind: 'Model' | 'Example' }) {
  return (
    <span
      className="inline-flex items-center rounded-[3px] border border-bone-3/60 px-1.5 py-0.5 font-mono text-xs uppercase leading-none tracking-[0.08em] text-bone-2"
      title={kind === 'Model' ? 'Modelled by the lab, not measured for you.' : 'An example arc, set by hand.'}
    >
      {kind}
    </span>
  )
}

/** The legal arc window as a band on a 0 to 14 ft rule, with every lob's peak as a dot. */
export function ArcGauge({ rule, model }: { rule: RuleKey; model: LabModel }) {
  const [lo, hi] = legalArcWindow(rule)
  const x = (ft: number) => 12 + (Math.min(14, Math.max(0, ft)) / 14) * 296
  return (
    <svg
      viewBox="0 0 320 58"
      className="block w-full max-w-[360px]"
      role="img"
      aria-label={`Legal arc: ${fixed(lo)} to ${fixed(hi, 0)} ft above the ground. Peaks: ${model.lobs
        .map((l) => `${l.name} ${fixed(l.flight.apex[1] / 0.3048)} ft`)
        .join(', ')}.`}
    >
      <rect x={x(lo)} y={8} width={x(hi) - x(lo)} height={20} fill="rgba(246,241,230,0.12)" stroke="rgba(246,241,230,0.45)" />
      <line x1={12} y1={28} x2={308} y2={28} stroke="rgba(246,241,230,0.5)" />
      {[0, 2, 4, 6, 8, 10, 12, 14].map((ft) => (
        <g key={ft}>
          <line x1={x(ft)} y1={28} x2={x(ft)} y2={32} stroke="rgba(246,241,230,0.5)" />
          <text x={x(ft)} y={48} textAnchor="middle" fill="var(--color-bone-2)" fontFamily="var(--font-mono)" fontSize={12}>
            {ft}
          </text>
        </g>
      ))}
      {model.lobs.map((l, i) => (
        <circle
          key={l.key}
          cx={x(l.flight.apex[1] / 0.3048)}
          cy={18}
          r={i === model.selectedIndex ? 6 : 3.6}
          fill={l.color}
          stroke={i === model.selectedIndex ? '#F6F1E6' : 'none'}
          strokeWidth={1.5}
        />
      ))}
    </svg>
  )
}
