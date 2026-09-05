import { useReducedMotion } from '../../hooks/useReducedMotion'
import { useEffect, useRef, useState } from 'react'
import type { PitchAtlasEntry, VisualReference } from '../../data/types'
import { gripEntryFor } from '../../data/grips'
import { GripViewer } from '../grip/GripViewer'
import { RefractorClaim } from '../provenance/RefractorClaim'
import { GripInspection } from './GripInspection'
import '../../styles/study.css'

function StudyPhoto({ photo, className }: { photo: VisualReference; className?: string }) {
  const [failed, setFailed] = useState(false)
  const [attempt, setAttempt] = useState(0)
  return failed ? <div className="study-photo-error" role="status"><p>The grip photograph could not load. Its caption and source remain available.</p><button type="button" className="study-button" onClick={() => { setAttempt(n => n + 1); setFailed(false) }}>Retry photograph</button></div> : <img key={attempt} className={className} src={photo.src} alt={photo.alt} loading="lazy" onError={() => setFailed(true)} />
}

const STEPS = ['Hold', 'Fingers', 'Seam', 'Sourced cue'] as const

export function GripStudy({ entry, accentColor }: { entry: PitchAtlasEntry; accentColor: string }) {
  const [step, setStep] = useState(0)
  const content = useRef<HTMLElement>(null)
  const reduced = useReducedMotion()
  useEffect(() => {
    if (reduced || !content.current?.animate) return
    const transition = content.current.animate([{ opacity: .55, transform: 'translateY(6px)' }, { opacity: 1, transform: 'translateY(0)' }], { duration: 220, easing: 'ease-out' })
    return () => transition.cancel()
  }, [step, reduced])
  const [contact, setContact] = useState<string>()
  const [variant, setVariant] = useState('')
  const [photoIndex, setPhotoIndex] = useState(0)
  const { canonical, guide } = entry
  const model = canonical.gripModel
  const photos = gripEntryFor(entry.display.slug)?.photos ?? []
  const photo = photos[photoIndex]
  const master = entry.masterVariants.find(v => v.pitcher === variant)
  const context = master ? <><p className="study-eyebrow">Selected master · {master.pitcher}</p><RefractorClaim claim={master.distinction} /></> : <p>Reference grip · {entry.canonical.name}</p>

  return <section id="grip-lab" className="grip-study">
    <header className="study-heading"><p className="study-eyebrow">01 / At the grip bench</p><h2>Get to know the hold.</h2><p>Four ways into the same specimen. Take them in order, or go straight to the detail you came for.</p></header>
    <div className="study-layout">
      <div className="study-specimen">
        <p className="study-eyebrow">{entry.canonical.name} / Reference model</p>
        <GripViewer entry={entry} accentColor={accentColor} activeContact={contact} />
        <p className="study-material-note">{model.visualCaveat}</p>
        {model.status !== 'unfiled' && <GripInspection label="reference model" context={context}><GripViewer entry={entry} accentColor={accentColor} /></GripInspection>}
        {master && <aside className="study-selected">{context}<p className="study-material-note">The model remains the reference hold. This master file supplies a written distinction.</p></aside>}
      </div>
      <div className="study-reading">
        <div className="study-steps" role="group" aria-label="Grip study steps">{STEPS.map((label, i) => <button key={label} type="button" aria-label={`0${i + 1} ${label}`} aria-pressed={step === i} aria-controls="study-step-content" onClick={() => { setStep(i); setContact(undefined) }}><span>0{i + 1}</span>{label}</button>)}</div>
        <article ref={content} id="study-step-content" className="study-step-content" aria-live="polite">
          <p className="study-eyebrow">0{step + 1} / {STEPS[step]}</p>
          <h3>{['Start with the whole hand.', 'Read the finger placement.', 'Find the seam relationship.', 'Carry one cue with you.'][step]}</h3>
          {step === 0 && <RefractorClaim claim={canonical.grip} />}
          {step === 1 && <>
            {canonical.gripDetails.length ? canonical.gripDetails.map((claim, i) => <RefractorClaim key={i} claim={claim} />) : <p>Separate finger-placement details have not been filed. Read the sourced hold for the available account.</p>}
            {model.status !== 'unfiled' && <div className="study-contact-controls" role="group" aria-label="Filed finger contacts">{model.contacts.map(c => <button type="button" className="study-button" key={c.label} aria-pressed={contact === c.label} onClick={() => setContact(contact === c.label ? undefined : c.label)}>{c.label} · {c.pressureRole}</button>)}</div>}
          </>}
          {step === 2 && <><p>{model.status === 'unfiled' ? 'A canonical seam relationship has not been filed for this pitch.' : 'Use “Lift the hand” on the reference model to see the seam beneath the hold.'}</p><RefractorClaim claim={entry.seam.accuracyNote} /><p className="study-material-note">{entry.seam.accuracyLevel}. No additional contact positions are inferred.</p></>}
          {step === 3 && <RefractorClaim claim={canonical.voice ?? canonical.mechanics} />}
        </article>
        <div className="study-step-pager"><button type="button" className="study-button" disabled={step === 0} onClick={() => { setStep(s => s - 1); setContact(undefined) }}>Previous detail</button><button type="button" className="study-button" disabled={step === 3} onClick={() => { setStep(s => s + 1); setContact(undefined) }}>Next detail</button></div>
        {entry.masterVariants.length > 0 && <div className="study-variant-picker"><label htmlFor="study-master">Keep a master file beside the hold</label><select id="study-master" value={variant} onChange={e => setVariant(e.target.value)}><option value="">Reference hold</option>{entry.masterVariants.map(v => <option key={v.pitcher} value={v.pitcher}>{v.pitcher}</option>)}</select></div>}
        {photo && <figure className="study-photo"><StudyPhoto key={photo.src} photo={photo} /><figcaption><p>{photo.caption}</p><p className="study-material-note">{photo.attribution} · Original photograph · {photo.capturedAt}</p></figcaption><div className="study-photo-controls">{photos.map((p, i) => <button type="button" className="study-button" key={p.src} aria-pressed={i === photoIndex} onClick={() => setPhotoIndex(i)}>{p.view} {i + 1}</button>)}</div><GripInspection label="grip photograph" context={<>{context}<p>{photo.caption} · {photo.attribution} · Original photograph</p></>}><StudyPhoto key={photo.src} className="study-inspected-photo" photo={photo} /></GripInspection></figure>}
        <details className="study-full-record"><summary>The complete grip notes</summary>{guide && <><ol>{guide.steps.map((s, i) => <li key={i}>{s}</li>)}</ol><p>{guide.feel}</p></>}<RefractorClaim claim={canonical.grip} />{canonical.gripDetails.map((c, i) => <RefractorClaim key={i} claim={c} />)}</details>
      </div>
    </div>
  </section>
}
