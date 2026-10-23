import { useCallback, useEffect, useMemo, useRef, useState, type KeyboardEvent } from 'react'
import type { PitchAtlasEntry } from '../../data/types'
import type { TiltEngine } from '../../hooks/useCardTilt'
import { useReducedMotion } from '../../hooks/useReducedMotion'
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '../ui/dialog'
import { accentForSlug } from '../refractor/accents'
import { backMaterial, presetForEntry, type CardMaterial } from '../refractor/material/materialPresets'
import { setMotionPref, useMotionPref } from '../refractor/material/motionPref'
import { RefractorCard } from '../refractor/RefractorCard'
import { SpecimenBack } from '../refractor/SpecimenBack'
import { specimenFace } from '../refractor/specimenFace'
import { ExportPanel } from './ExportPanel'
import { INSPECTOR_SEED } from './export/composeCard'
import { FinishPanel, type AmbientSettings, type LightSettings } from './FinishPanel'
import { materialFor, writeFinishPref, type FinishFace } from './finishPrefs'
import { InspectorRail } from './InspectorRail'
import '../../styles/inspector.css'

/*
  The expanded specimen: the card, large, in a dark room, with a compact rail. The
  front is the same RefractorCard the page shows (same face resolver, same material
  program) in inspector mode, so it can be grabbed on both axes and glides home with
  inertia; the back is the same SpecimenBack the filed set flips to. The flip turns
  the inner wrapper and the tilt turns the card, so the two transforms never share
  an element. Keyboard: arrows tilt, F flips, Space pauses the turn, R resets.

  Each face keeps its own tilt engine. The keys, Reset and the export read the face
  that is showing; the light belongs to the room, so it is set on both. The slow turn
  belongs to the front alone and rests while the sources are showing, so a face no one
  can see never draws.

  Finish choices are remembered per card face on this device and never touch the
  pitch record or any other surface.
*/
const NUDGE = 4

export default function SpecimenInspector({ entry, onClose, onCloseAutoFocus }: { entry: PitchAtlasEntry; onClose: () => void; onCloseAutoFocus?: (event: Event) => void }) {
  const { display } = entry
  const slug = display.slug
  const accent = accentForSlug(slug)
  const gold = display.specimenNo === '00'
  const reduced = useReducedMotion()
  const paused = useMotionPref() === 'paused'

  const frontDefault = useMemo(() => presetForEntry({ gold, finish: accent.finish }), [gold, accent.finish])
  const backDefault = useMemo(() => backMaterial(), [])
  const [front, setFront] = useState<CardMaterial>(() => materialFor(slug, 'front', frontDefault))
  const [back, setBack] = useState<CardMaterial>(() => materialFor(slug, 'back', backDefault))
  const [face, setFace] = useState<FinishFace>('front')
  const [tuneFace, setTuneFace] = useState<FinishFace>('front')
  const [finishOpen, setFinishOpen] = useState(false)
  const [frontEngine, setFrontEngine] = useState<TiltEngine | null>(null)
  const [backEngine, setBackEngine] = useState<TiltEngine | null>(null)
  const [light, setLight] = useState<LightSettings>({ height: 1.1, strength: 1, offsetX: 0, offsetY: 0 })
  const [ambient, setAmbient] = useState<AmbientSettings>({ amplitude: 1, speed: 1 })
  const [exporting, setExporting] = useState(false)
  const stageRef = useRef<HTMLDivElement | null>(null)

  const resolvedFace = useMemo(() => specimenFace(entry, { priority: true, idPrefix: 'inspect-' }), [entry])

  const updateMaterial = useCallback(
    (which: FinishFace, next: CardMaterial) => {
      if (which === 'front') setFront(next)
      else setBack(next)
      writeFinishPref(slug, which, next)
    },
    [slug],
  )
  const resetFinish = useCallback(
    (which: FinishFace) => {
      if (which === 'front') setFront(frontDefault)
      else setBack(backDefault)
      writeFinishPref(slug, which, null)
    },
    [slug, frontDefault, backDefault],
  )

  // the face that is showing is the one the keys turn and the export reads
  const engine = face === 'front' ? frontEngine : backEngine

  const applyLight = useCallback(
    (patch: Partial<LightSettings>) => {
      setLight((prev) => {
        const next = { ...prev, ...patch }
        frontEngine?.setLight(next)
        backEngine?.setLight(next)
        return next
      })
    },
    [frontEngine, backEngine],
  )

  useEffect(() => {
    frontEngine?.setLight(light)
    backEngine?.setLight(light)
    // the light settings outlive an engine swap; the engines are the dependency on purpose
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [frontEngine, backEngine])

  const flip = useCallback(() => setFace((f) => (f === 'front' ? 'back' : 'front')), [])
  const togglePaused = useCallback(() => setMotionPref(paused ? 'live' : 'paused'), [paused])
  const reset = useCallback(() => {
    const home = { height: 1.1, strength: 1, offsetX: 0, offsetY: 0 }
    for (const e of [frontEngine, backEngine]) {
      e?.reset()
      e?.setLight(home)
    }
    setLight(home)
    setAmbient({ amplitude: 1, speed: 1 })
  }, [frontEngine, backEngine])

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.target !== event.currentTarget) return
    // a held modifier means the browser's shortcut (Cmd+R reloads, Ctrl+F finds), never the card's
    if (event.ctrlKey || event.metaKey || event.altKey) return
    switch (event.key) {
      case 'ArrowLeft': engine?.nudge(-NUDGE, 0); break
      case 'ArrowRight': engine?.nudge(NUDGE, 0); break
      case 'ArrowUp': engine?.nudge(0, NUDGE); break
      case 'ArrowDown': engine?.nudge(0, -NUDGE); break
      case 'f': case 'F': flip(); break
      case ' ': if (!reduced) togglePaused(); break
      case 'r': case 'R': reset(); break
      default: return
    }
    event.preventDefault()
  }

  // carry the specimen's view-transition identity into the grip lab
  const onStudy = () => {
    if (reduced) return
    const card = stageRef.current?.querySelector<HTMLElement>('.rfx-card')
    if (!card) return
    card.style.viewTransitionName = 'active-specimen'
    window.setTimeout(() => { card.style.viewTransitionName = '' }, 1000)
  }

  const tuned = tuneFace === 'front' ? front : back

  return (
    <Dialog open onOpenChange={(open) => { if (!open) onClose() }}>
      <DialogContent
        className="specimen-inspector"
        overlayClassName="specimen-inspector-overlay"
        showCloseButton
        onCloseAutoFocus={onCloseAutoFocus}
        // focus lands on the dialog itself, not on the stage, so opening never paints a
        // focus ring around the card; Tab reaches the stage and the rail in order
        onOpenAutoFocus={(event) => {
          event.preventDefault()
          ;(event.currentTarget as HTMLElement | null)?.focus?.()
        }}
      >
        <DialogTitle className="sr-only">Inspect card: {display.shortName}</DialogTitle>
        <DialogDescription className="sr-only">
          An enlarged specimen you can turn in the light. Drag or use the arrow keys to tilt it, F flips it to its sources, Space pauses the turn, R resets it.
        </DialogDescription>
        <div className="specimen-inspector-grid">
          <div
            ref={stageRef}
            className={`specimen-stage${gold ? ' is-ember' : ''}`}
            tabIndex={0}
            role="group"
            aria-label={`${display.shortName} specimen, ${face === 'front' ? 'front' : 'sources'} showing. Arrow keys tilt, F flips, Space pauses, R resets.`}
            onKeyDown={onKeyDown}
          >
            <div className={`v2-flip specimen-rig${face === 'back' ? ' is-flipped' : ''}`}>
              <div className="v2-flip-inner">
                <div className="v2-face" inert={face === 'back' ? true : undefined} aria-hidden={face === 'back'}>
                  <RefractorCard
                    index={INSPECTOR_SEED}
                    gold={gold}
                    accent={accent}
                    vnum={display.specimenNo}
                    name={display.shortName}
                    face={resolvedFace.face}
                    faceSource={resolvedFace.faceSource}
                    cue={resolvedFace.cue}
                    confidence={resolvedFace.confidence}
                    maxWidth={560}
                    foil
                    mode="inspector"
                    material={front}
                    // the drift runs only while the front is the face showing
                    ambient={!paused && !exporting && face === 'front'}
                    ambientAmplitude={ambient.amplitude}
                    ambientSpeed={ambient.speed}
                    onEngine={setFrontEngine}
                    className="is-inspected"
                  />
                </div>
                <div className="v2-face v2-face-back" inert={face === 'front' ? true : undefined} aria-hidden={face === 'front'}>
                  <SpecimenBack entry={entry} flipped={face === 'back'} foil seed={INSPECTOR_SEED} material={back} onEngine={setBackEngine} />
                </div>
              </div>
            </div>
          </div>

          <InspectorRail
            entry={entry}
            face={face}
            onFace={setFace}
            finishOpen={finishOpen}
            onToggleFinish={() => setFinishOpen((open) => !open)}
            paused={paused}
            onTogglePaused={togglePaused}
            motionAvailable={!reduced}
            onReset={reset}
            onStudy={onStudy}
          >
            {finishOpen ? (
              <FinishPanel
                id="specimen-finish"
                face={tuneFace}
                onFace={setTuneFace}
                material={tuned}
                onMaterial={(next) => updateMaterial(tuneFace, next)}
                onResetFinish={() => resetFinish(tuneFace)}
                light={light}
                onLight={applyLight}
                ambient={ambient}
                onAmbient={(patch) => setAmbient((prev) => ({ ...prev, ...patch }))}
              />
            ) : null}
            <ExportPanel
              entry={entry}
              face={face}
              front={front}
              back={back}
              engine={engine}
              stageRef={stageRef}
              onBusy={setExporting}
            />
          </InspectorRail>
        </div>
      </DialogContent>
    </Dialog>
  )
}
