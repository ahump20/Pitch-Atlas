import { useEffect, useRef, useState, type RefObject } from 'react'
import type { PitchAtlasEntry } from '../../data/types'
import type { TiltEngine } from '../../hooks/useCardTilt'
import type { CardMaterial } from '../refractor/material/materialPresets'
import { exportEligibility } from './export/eligibility'
import { downloadBlob, exportFilename, exportSpecimenPng } from './export/exportPng'
import { exportSpecimenWebm, webmSupport } from './export/exportWebm'
import type { Eligibility, ExportBackdrop, ExportFace, ExportRequest, WebmSupport } from './export/types'

/*
  Export: a PNG of the card as it stands (pose, light, finish), or a seven-second WebM
  that loops without a jump. Both are composed offscreen from the record, so the
  visitor's presentation is untouched. Where a browser cannot record WebM the panel
  says so and the PNG still works. A face whose media is not first-party or
  attributed under a licence that allows it cannot be exported, and the panel says why.
*/

type Status =
  | { kind: 'idle' }
  | { kind: 'working'; what: 'png' | 'webm'; fraction: number; phase: string }
  | { kind: 'done'; message: string }
  | { kind: 'error'; message: string }

export function ExportPanel({
  entry,
  face,
  front,
  back,
  engine,
  stageRef,
  onBusy,
}: {
  entry: PitchAtlasEntry
  face: ExportFace
  front: CardMaterial
  back: CardMaterial
  engine: TiltEngine | null
  stageRef: RefObject<HTMLElement | null>
  /** encoding runs for a few seconds; the live card holds still meanwhile */
  onBusy: (busy: boolean) => void
}) {
  const [backdrop, setBackdrop] = useState<ExportBackdrop>('void')
  const [status, setStatus] = useState<Status>({ kind: 'idle' })
  // support is a property of the browser, read once; eligibility is a property of the face
  const [webm] = useState<WebmSupport>(() => webmSupport())
  const eligibility: Eligibility = exportEligibility(entry, face)
  const abort = useRef<AbortController | null>(null)

  useEffect(() => () => abort.current?.abort(), [])

  function request(): ExportRequest | null {
    if (!engine) return null
    const s = engine.store.get()
    const stage = stageRef.current?.querySelector<HTMLElement>('.v2-face:not(.v2-face-back) .rfx-stage') ?? null
    return {
      entry,
      face,
      material: front,
      backMaterial: back,
      pose: { rx: s.rx, ry: s.ry },
      light: { x: (s.mx + s.lightOffsetX) / 100, y: (s.my + s.lightOffsetY) / 100, height: s.lightHeight, strength: s.lightStrength },
      backdrop,
      stage,
    }
  }

  async function exportPng() {
    const req = request()
    if (!req) return
    setStatus({ kind: 'working', what: 'png', fraction: 0.2, phase: 'Composing' })
    try {
      const blob = await exportSpecimenPng(req)
      const name = exportFilename(entry, face, 'png')
      downloadBlob(blob, name)
      setStatus({ kind: 'done', message: `Saved ${name}.` })
    } catch (error) {
      setStatus({ kind: 'error', message: error instanceof Error ? error.message : 'The PNG could not be made.' })
    }
  }

  async function exportWebm() {
    const req = request()
    if (!req || !webm.ok) return
    const controller = new AbortController()
    abort.current = controller
    onBusy(true)
    setStatus({ kind: 'working', what: 'webm', fraction: 0, phase: 'Preparing' })
    try {
      const blob = await exportSpecimenWebm(
        req,
        (p) => setStatus({ kind: 'working', what: 'webm', fraction: p.fraction, phase: p.phase === 'encoding' ? 'Encoding' : p.phase === 'rendering' ? 'Rendering frames' : 'Preparing' }),
        controller.signal,
      )
      const name = exportFilename(entry, face, 'webm')
      downloadBlob(blob, name)
      setStatus({ kind: 'done', message: `Saved ${name}: a 7 second loop.` })
    } catch (error) {
      if (controller.signal.aborted) setStatus({ kind: 'idle' })
      else setStatus({ kind: 'error', message: error instanceof Error ? error.message : 'The WebM could not be recorded.' })
    } finally {
      onBusy(false)
      abort.current = null
    }
  }

  const working = status.kind === 'working'
  const blocked = !eligibility.exportable

  return (
    <section className="specimen-export" aria-label="Export">
      <h3>Export</h3>
      <div className="specimen-chips" role="group" aria-label="Backdrop">
        <button type="button" className="specimen-chip" aria-pressed={backdrop === 'void'} onClick={() => setBackdrop('void')}>Dark backdrop</button>
        <button type="button" className="specimen-chip" aria-pressed={backdrop === 'transparent'} onClick={() => setBackdrop('transparent')}>Transparent</button>
      </div>
      <div className="specimen-rail-actions">
        <button type="button" className="specimen-action" onClick={exportPng} disabled={working || blocked || !engine}>
          Export PNG
        </button>
        <button type="button" className="specimen-action" onClick={exportWebm} disabled={working || blocked || !engine || !webm.ok}>
          Export WebM, 7 s loop
        </button>
        {working ? (
          <button type="button" className="specimen-action" onClick={() => abort.current?.abort()} disabled={status.what !== 'webm'}>
            Cancel
          </button>
        ) : null}
      </div>
      {working ? (
        <>
          <progress max={1} value={status.fraction} aria-label={status.phase} />
          <p className="specimen-export-status" aria-live="polite">{status.phase}…</p>
        </>
      ) : null}
      {status.kind === 'done' ? <p className="specimen-export-status" aria-live="polite">{status.message}</p> : null}
      {status.kind === 'error' ? <p className="specimen-export-status" data-tone="error" role="alert">{status.message}</p> : null}
      {!eligibility.exportable ? (
        <p className="specimen-export-status" data-tone="error">{eligibility.reason ?? 'This face cannot be exported.'}</p>
      ) : null}
      {eligibility.exportable && eligibility.attribution ? (
        <p className="specimen-export-note">Caption: {eligibility.attribution}</p>
      ) : null}
      {!webm.ok ? <p className="specimen-export-note">{webm.reason}</p> : null}
    </section>
  )
}
