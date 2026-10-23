import { useId } from 'react'
import type { FinishFace } from './finishPrefs'
import {
  COVERAGE_LABELS,
  FINISH_LABELS,
  FINISHES,
  mergeMaterial,
  PRESET_LABELS,
  PRESETS,
  type CardMaterial,
  type Coverage,
  type PresetId,
} from '../refractor/material/materialPresets'

/*
  The Finish panel: presets first, then the coverage masks, then every finish with its
  own strength, then the deeper knobs behind a disclosure. Front and back are tuned
  separately. Nothing here changes what the card says; it changes how the surface
  answers the light, and the choice stays on this device.
*/

export interface LightSettings {
  height: number
  strength: number
  offsetX: number
  offsetY: number
}

export interface AmbientSettings {
  amplitude: number
  speed: number
}

interface RangeProps {
  label: string
  value: number
  min: number
  max: number
  step?: number
  format?: (v: number) => string
  onChange: (v: number) => void
}

function Range({ label, value, min, max, step = 1, format, onChange }: RangeProps) {
  const id = useId()
  return (
    <label className="specimen-range" htmlFor={id}>
      <span>{label}</span>
      <output htmlFor={id}>{format ? format(value) : String(value)}</output>
      <input id={id} type="range" min={min} max={max} step={step} value={value} onChange={(e) => onChange(Number(e.target.value))} />
    </label>
  )
}

const pct = (v: number) => `${Math.round(v)}%`

export function FinishPanel({
  id,
  face,
  onFace,
  material,
  onMaterial,
  onResetFinish,
  light,
  onLight,
  ambient,
  onAmbient,
}: {
  id: string
  face: FinishFace
  onFace: (face: FinishFace) => void
  material: CardMaterial
  onMaterial: (next: CardMaterial) => void
  onResetFinish: () => void
  light: LightSettings
  onLight: (patch: Partial<LightSettings>) => void
  ambient: AmbientSettings
  onAmbient: (patch: Partial<AmbientSettings>) => void
}) {
  const set = (patch: Parameters<typeof mergeMaterial>[1]) => onMaterial(mergeMaterial(material, patch))

  return (
    <section id={id} className="specimen-finish" aria-label="Finish">
      <div className="specimen-seg" role="group" aria-label="Which face to tune">
        <button type="button" aria-pressed={face === 'front'} onClick={() => onFace('front')}>Front</button>
        <button type="button" aria-pressed={face === 'back'} onClick={() => onFace('back')}>Back</button>
      </div>

      <h3>Preset</h3>
      <div className="specimen-chips" role="group" aria-label="Finish preset">
        {(Object.keys(PRESETS) as PresetId[]).map((preset) => (
          <button
            key={preset}
            type="button"
            className="specimen-chip"
            aria-pressed={material.preset === preset}
            onClick={() => onMaterial(PRESETS[preset])}
          >
            {PRESET_LABELS[preset]}
          </button>
        ))}
      </div>

      <h3>Coverage</h3>
      <div className="specimen-chips" role="group" aria-label="Coverage">
        {(Object.keys(COVERAGE_LABELS) as Coverage[]).map((coverage) => (
          <button
            key={coverage}
            type="button"
            className="specimen-chip"
            aria-pressed={material.coverage === coverage}
            onClick={() => set({ coverage })}
          >
            {COVERAGE_LABELS[coverage]}
          </button>
        ))}
      </div>

      <h3>Finishes</h3>
      <div className="specimen-finish-list">
        {FINISHES.map((name) => {
          const strength = material.finishes[name]
          return (
            <div key={name} className="specimen-finish-row">
              <input
                type="checkbox"
                id={`${id}-${name}`}
                aria-label={`${FINISH_LABELS[name]} finish`}
                checked={strength > 0}
                onChange={(e) => set({ finishes: { [name]: e.target.checked ? Math.max(strength, 0.6) : 0 } })}
              />
              <Range
                label={FINISH_LABELS[name]}
                value={Math.round(strength * 100)}
                min={0}
                max={100}
                format={pct}
                onChange={(v) => set({ finishes: { [name]: v / 100 } })}
              />
            </div>
          )
        })}
      </div>

      <details className="specimen-advanced">
        <summary>Advanced</summary>
        <div className="specimen-advanced-body">
          <Range label="Exposure" value={Math.round(material.exposure * 100)} min={0} max={200} format={pct} onChange={(v) => set({ exposure: v / 100 })} />
          <Range label="Spectral" value={Math.round(material.spectral * 100)} min={0} max={100} format={pct} onChange={(v) => set({ spectral: v / 100 })} />
          <Range label="Pattern scale" value={Math.round(material.patternScale * 100)} min={50} max={200} format={pct} onChange={(v) => set({ patternScale: v / 100 })} />
          <Range label="Pattern angle" value={Math.round(material.patternAngle)} min={0} max={179} format={(v) => `${v}°`} onChange={(v) => set({ patternAngle: v })} />
          <Range label="Roughness" value={Math.round(material.roughness * 100)} min={0} max={100} format={pct} onChange={(v) => set({ roughness: v / 100 })} />
          <Range label="Stock sheen" value={Math.round(material.sheen * 100)} min={0} max={100} format={pct} onChange={(v) => set({ sheen: v / 100 })} />
          <Range label="Glint intensity" value={Math.round(material.glint.intensity * 100)} min={0} max={100} format={pct} onChange={(v) => set({ glint: { intensity: v / 100 } })} />
          <Range label="Glint size" value={Math.round(material.glint.size * 100)} min={0} max={100} format={pct} onChange={(v) => set({ glint: { size: v / 100 } })} />
          <Range label="Glint density" value={Math.round(material.glint.density * 100)} min={0} max={100} format={pct} onChange={(v) => set({ glint: { density: v / 100 } })} />
          <Range label="Window glaze" value={Math.round(material.glaze * 100)} min={0} max={100} format={pct} onChange={(v) => set({ glaze: v / 100 })} />
          <Range label="Edge depth" value={Math.round(material.depth * 100)} min={0} max={100} format={pct} onChange={(v) => set({ depth: v / 100 })} />
          <Range label="Light height" value={Math.round(light.height * 100)} min={40} max={200} format={pct} onChange={(v) => onLight({ height: v / 100 })} />
          <Range label="Light strength" value={Math.round(light.strength * 100)} min={0} max={200} format={pct} onChange={(v) => onLight({ strength: v / 100 })} />
          <Range label="Light across" value={Math.round(light.offsetX)} min={-40} max={40} format={(v) => `${v > 0 ? '+' : ''}${v}`} onChange={(v) => onLight({ offsetX: v })} />
          <Range label="Light down" value={Math.round(light.offsetY)} min={-40} max={40} format={(v) => `${v > 0 ? '+' : ''}${v}`} onChange={(v) => onLight({ offsetY: v })} />
          <Range label="Auto-tilt amplitude" value={Math.round(ambient.amplitude * 100)} min={0} max={200} format={pct} onChange={(v) => onAmbient({ amplitude: v / 100 })} />
          <Range label="Auto-tilt speed" value={Math.round(ambient.speed * 100)} min={25} max={300} format={pct} onChange={(v) => onAmbient({ speed: v / 100 })} />
        </div>
      </details>

      <button type="button" className="specimen-action" onClick={onResetFinish}>
        Reset this face to its filed finish
      </button>
    </section>
  )
}
