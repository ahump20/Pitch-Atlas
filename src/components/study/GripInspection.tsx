import { useEffect, useId, useRef, useState, type ReactNode } from 'react'

/** Native dialog supplies focus containment, Escape, and an inert background. */
export function GripInspection({ children, label, context }: { children: ReactNode; label: string; context?: ReactNode }) {
  const dialog = useRef<HTMLDialogElement>(null)
  const trigger = useRef<HTMLButtonElement>(null)
  const titleId = useId()
  const [open, setOpen] = useState(false)
  const [zoom, setZoom] = useState(1)
  useEffect(() => {
    if (!open) return
    const node = dialog.current
    const opener = trigger.current
    node?.showModal()
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = previous
      node?.close()
      opener?.focus()
    }
  }, [open])
  return <>
    <button type="button" className="study-button" ref={trigger} onClick={() => { setZoom(1); setOpen(true) }}>Inspect {label}</button>
    {open && <dialog ref={dialog} className="study-dialog" aria-labelledby={titleId} onCancel={() => setOpen(false)} onClick={event => { if (event.target === event.currentTarget) setOpen(false) }}>
      <header className="study-dialog-head">
        <h2 id={titleId}>{label}</h2>
        <button type="button" className="study-button" autoFocus onClick={() => setOpen(false)}>Close inspection</button>
      </header>
      {context && <div className="study-inspection-context">{context}</div>}
      <div className="study-zoom-controls" role="group" aria-label="Inspection zoom">
        <button type="button" className="study-button" disabled={zoom <= 1} onClick={() => setZoom(z => Math.max(1, z - .25))}>Zoom out</button>
        <output aria-live="polite">{Math.round(zoom * 100)}%</output>
        <button type="button" className="study-button" disabled={zoom >= 2} onClick={() => setZoom(z => Math.min(2, z + .25))}>Zoom in</button>
        <button type="button" className="study-button" onClick={() => setZoom(1)}>Reset zoom</button>
      </div>
      <div className="study-inspection-viewport" tabIndex={0} aria-label="Grip detail. Scroll to inspect the enlarged image.">
        <div style={{ width: `${zoom * 100}%`, maxWidth: 'none' }}>{children}</div>
      </div>
    </dialog>}
  </>
}
