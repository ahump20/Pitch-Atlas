import { useEffect, useId, useRef } from 'react'
import { useSearchParams } from 'react-router-dom'
import type { SoftballPitch } from '../../data/softball'
import { useReducedMotion } from '../../hooks/useReducedMotion'
import { ClaimProse } from '../provenance/ClaimProse'
import '../../styles/study.css'
import '../../styles/softball-study.css'

const STEPS = ['hold', 'spin', 'movement'] as const
const LABELS = ['The hold', 'The spin', 'The movement']

/** The written record stays in view; no baseball model stands in for a softball. */
export function SoftballStudy({ pitch }: { pitch: SoftballPitch }) {
  const [search, setSearch] = useSearchParams()
  const rawStep = STEPS.findIndex(step => step === search.get('study'))
  const step = rawStep < 0 ? 0 : rawStep
  const contentId = useId()
  const content = useRef<HTMLElement>(null)
  const reduced = useReducedMotion()
  function selectStep(index: number) {
    setSearch(current => {
      const next = new URLSearchParams(current)
      next.set('study', STEPS[index])
      return next
    }, { replace: true, preventScrollReset: true })
  }
  useEffect(() => {
    if (reduced || !content.current?.animate) return
    const motion = content.current.animate([{ opacity: .55, transform: 'translateY(6px)' }, { opacity: 1, transform: 'translateY(0)' }], { duration: 220, easing: 'ease-out' })
    return () => motion.cancel()
  }, [step, pitch.slug, reduced])

  return <section id="softball-grip" className="softball-study study-anchor" aria-label={`${pitch.name} study`}>
    <header className="study-heading">
      <p className="study-eyebrow">01 / From the circle</p>
      <h2>Start with the hold.</h2>
      <p>Keep the written grip in view. Follow its sourced spin and movement, one account at a time.</p>
    </header>
    <div className="softball-study-layout">
      <aside className="softball-study-file" aria-label="The written grip">
        <div className="softball-file-index"><span>{pitch.specimenNo}</span><span>Written reference</span></div>
        <h3>{pitch.name}</h3>
        <p className="study-eyebrow">The hold on file</p>
        <ClaimProse claim={pitch.grip} />
        <p className="softball-file-note">Grip photograph and finger-contact geometry: not documented in this file.</p>
      </aside>
      <div className="softball-study-reading">
        <div className="study-steps" role="group" aria-label="Softball study steps">
          {STEPS.map((key, index) => <button key={key} type="button" aria-label={`0${index + 1} ${LABELS[index]}`} aria-pressed={step === index} aria-controls={contentId} onClick={() => selectStep(index)}><span>0{index + 1}</span>{LABELS[index]}</button>)}
        </div>
        <article id={contentId} ref={content} className="study-step-content" aria-live="polite" aria-atomic="true">
          <p className="study-eyebrow">0{step + 1} / {LABELS[step]}</p>
          <h3>{['Begin with the written account.', 'Follow the recorded spin.', 'Read the movement account.'][step]}</h3>
          {step === 0 ? <>
            <p>The grip beside these steps is the sourced reference. A separate fingertip map, seam model and master-variant record are not documented here.</p>
            <a className="archive-text-link" href="#softball-sources">Read the sources in this file <span aria-hidden="true">→</span></a>
          </> : <ClaimProse claim={step === 1 ? pitch.spin : pitch.movement} />}
        </article>
        <div className="study-step-pager">
          <button className="study-button" type="button" disabled={step === 0} onClick={() => selectStep(step - 1)}>Previous detail</button>
          <button className="study-button" type="button" disabled={step === STEPS.length - 1} onClick={() => selectStep(step + 1)}>Next detail</button>
        </div>
        <details className="study-full-record">
          <summary>The complete written record</summary>
          <h4>The spin</h4><ClaimProse claim={pitch.spin} />
          <h4>The movement</h4><ClaimProse claim={pitch.movement} />
        </details>
      </div>
    </div>
  </section>
}
