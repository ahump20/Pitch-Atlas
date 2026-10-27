import { useEffect, useState, type CSSProperties, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeftRight, RotateCcw } from 'lucide-react'
import type { Claim, GripContactModel, GripView, Handedness, PitchAtlasEntry } from '../../data/types'
import { BallStage } from '../ball/BallStage'
import { createOrbitLink, type OrbitLink, type StageId } from '../ball/orbitLink'
import { SeamSchematic } from '../fallback/SeamSchematic'
import { GripSourceBadge } from '../grip/GripSourceBadge'
import { RefractorClaim } from '../provenance/RefractorClaim'
import { accentForSlug } from '../refractor/accents'
import { TunnelPlot } from '../sections/TunnelPlot'
import { useReducedMotion } from '../../hooks/useReducedMotion'
import { useWebGLSupport } from '../../hooks/useWebGLSupport'
import { FINGER_NAME, fingerRows, releaseSequence, shapeLabel } from '../../lib/specimenReads'
import type { Aspect } from './inspectorContext'
import '../../styles/bench.css'

/*
  The bench's working surface for one specimen or two: the stage (the ball in the
  hand, or the flight figure) with its controls, then the rows that say what the
  stage shows. The inspector dialog and the /compare page both render it, so a pair
  reads the same wherever it is opened.

  Two balls share one camera through an orbit link: drag either and both turn, Unlink
  and each turns alone, Reset brings both home, and a view preset turns both hands and
  brings both cameras home. On a phone there is room for one ball, so A and B take
  turns in the same canvas and the angle holds as they switch. Without WebGL, or under
  reduced motion, each side is the seam-informed schematic: nothing to drag, so the
  link and Reset step aside while the view and the hand still apply.

  Provenance: sourced lines wear their own badge (the hold, the mechanics, the physics
  words). What the reference hand model wrote (where each finger meets the seam, the
  release cues) wears that hand's one model badge at the head of its rows, so no model
  sentence reads as sourced. Flight is labelled Illustrative and carries no number.
*/
export type BenchAspect = Exclude<Aspect, 'card'>
export interface BenchChange {
  orientation?: GripView
  hand?: Handedness
}

const VIEWS: { id: GripView; label: string }[] = [
  { id: 'top', label: 'Top' },
  { id: 'side', label: 'Side' },
  { id: 'thumb', label: 'Thumb' },
]
const SECTION: Record<BenchAspect, string> = { grip: 'grip-lab', release: 'release', flight: 'movement' }
const NARROW = '(max-width: 639px)'

function useNarrow(): boolean {
  const [narrow, setNarrow] = useState(() => typeof window !== 'undefined' && !!window.matchMedia?.(NARROW).matches)
  useEffect(() => {
    const mq = window.matchMedia?.(NARROW)
    if (!mq) return
    const update = () => setNarrow(mq.matches)
    mq.addEventListener('change', update)
    return () => mq.removeEventListener('change', update)
  }, [])
  return narrow
}

const slotOf = (i: number) => (i === 0 ? 'A' : 'B')
const edge = (entry: PitchAtlasEntry) => ({ '--bench-edge': accentForSlug(entry.display.slug).c3 }) as CSSProperties

function SpecimenStage({
  entry,
  slot,
  view,
  hand,
  activeContact,
  still,
  link,
  linkId,
  linked,
}: {
  entry: PitchAtlasEntry
  slot?: string
  view: GripView
  hand: Handedness
  activeContact?: string
  /** the schematic: no WebGL, or reduced motion */
  still: boolean
  link: OrbitLink
  linkId: StageId
  linked: boolean
}) {
  const gm = entry.canonical.gripModel
  const unfiled = gm.status === 'unfiled'
  const chip = unfiled ? 'No canonical grip on file' : still ? 'Seam-informed schematic' : 'Reference model'
  const name = entry.canonical.name
  const label = unfiled
    ? `${name}: no canonical grip on file, the seam drawn alone.`
    : `${name}, ${hand}-handed, ${view} view, ${still ? 'a seam-informed schematic' : `the reference model${linked ? ', turning with the other ball' : ''}. Drag to turn it`}.`
  return (
    <figure className="bench-specimen" style={edge(entry)}>
      {slot ? (
        <figcaption className="bench-specimen-name">
          <span aria-hidden="true">{slot}</span> {entry.display.shortName}
        </figcaption>
      ) : null}
      <div className="bench-ball" role="img" aria-label={label} data-bench-ball={entry.display.slug} data-grip-unfiled={unfiled || undefined}>
        {unfiled || still ? (
          <SeamSchematic
            className="h-full w-full"
            spinAxis={entry.motion.spinAxis}
            gyro={entry.motion.gyro}
            grip={unfiled ? undefined : gm.contacts}
            handedness={hand}
            view={unfiled ? undefined : view}
            referenceContacts={unfiled ? undefined : gm.contacts}
            surface="stage"
            title={label}
          />
        ) : (
          <BallStage
            entry={entry}
            grip
            faceGrip
            autoSpin={false}
            view={view}
            handedness={hand}
            surface="stage"
            activeContact={activeContact}
            link={link}
            linkId={linkId}
            className="h-full w-full"
          />
        )}
        <span className="bench-chip" aria-hidden="true">{chip}</span>
      </div>
    </figure>
  )
}

/* one row of the table: a name, then a cell per specimen */
function Row({ name, children, dim }: { name: ReactNode; children: ReactNode; dim?: boolean }) {
  return (
    <div className="bench-row" data-dim={dim || undefined}>
      <span className="bench-row-name">{name}</span>
      {children}
    </div>
  )
}

function ContactCell({ contact, unfiled }: { contact?: GripContactModel; unfiled: boolean }) {
  if (unfiled) return <span className="bench-cell bench-cell-quiet">Not filed</span>
  if (!contact) return <span className="bench-cell bench-cell-quiet">No contact</span>
  return (
    <span className="bench-cell">
      <strong>{contact.label}</strong>
      <span>{contact.seamRelation}</span>
      <span className="bench-cell-quiet">{contact.pressureRole}</span>
    </span>
  )
}

const differs = (a?: GripContactModel, b?: GripContactModel) =>
  !!a && !!b && (a.engagement !== b.engagement || a.pressureTier !== b.pressureTier)

export function BenchBody({
  entries,
  aspect,
  orientation,
  hand,
  onChange,
  onSwap,
}: {
  entries: PitchAtlasEntry[]
  aspect: BenchAspect
  /** null: each pitch's own default view */
  orientation: GripView | null
  hand: Handedness
  onChange: (change: BenchChange) => void
  /** offered where the surface around the bench has no Swap of its own */
  onSwap?: () => void
}) {
  const pair = entries.length > 1
  const reduced = useReducedMotion()
  const webgl = useWebGLSupport()
  const still = reduced || !webgl
  const narrow = useNarrow()
  const [link] = useState(createOrbitLink)
  const [linked, setLinked] = useState(true)
  // what the reader picked belongs to the pair it was picked on; a new pair starts
  // from A with no finger picked out
  const keys = entries.map((e) => e.display.slug).join('|')
  const [picked, setPicked] = useState<{ keys: string; shown: number; finger: GripContactModel['finger'] | null }>({ keys, shown: 0, finger: null })
  const shown = picked.keys === keys ? picked.shown : 0
  const finger = picked.keys === keys ? picked.finger : null
  const setShown = (next: number) => setPicked({ keys, shown: next, finger })
  const setFinger = (next: GripContactModel['finger'] | null) => setPicked({ keys, shown, finger: next })

  const viewOf = (entry: PitchAtlasEntry) => orientation ?? entry.canonical.gripModel.defaultView
  const contactLabel = (entry: PitchAtlasEntry) => entry.canonical.gripModel.contacts.find((c) => c.finger === finger)?.label
  const toggleLink = () => {
    link.setLinked(!linked)
    setLinked(!linked)
  }
  const preset = (view: GripView) => {
    onChange({ orientation: view })
    link.reset()
  }

  // a phone gets one ball, and A and B take turns in it
  const onStage = pair && narrow ? [shown] : entries.map((_, i) => i)
  const sharedView = orientation ?? (pair ? null : viewOf(entries[0]))
  const fingers = fingerRows(entries)
  const anyFiled = entries.some((e) => e.canonical.gripModel.status === 'filed')

  const stage =
    aspect === 'flight' ? (
      <figure className="bench-flight">
        <figcaption className="bench-flight-head">
          <span className="bench-chip is-static">Illustrative</span>
          <span>Drawn from the mound. A grip does not guarantee this shape.</span>
        </figcaption>
        <TunnelPlot a={entries[0]} b={entries[1]} hand={hand} />
      </figure>
    ) : (
      <>
        {pair && narrow ? (
          <div className="specimen-seg bench-ab" role="group" aria-label="Pitch on the stage">
            {entries.map((e, i) => (
              <button key={e.display.slug} type="button" aria-pressed={shown === i} onClick={() => setShown(i)}>
                {slotOf(i)} · {e.display.shortName}
              </button>
            ))}
          </div>
        ) : null}
        <div className="bench-stages" data-count={onStage.length}>
          {onStage.map((index, position) => {
            const entry = entries[index]
            // the stage keeps its place (and its canvas) when A and B trade on a phone
            return (
              <SpecimenStage
                key={position}
                entry={entry}
                slot={pair ? slotOf(index) : undefined}
                view={viewOf(entry)}
                hand={hand}
                activeContact={finger ? contactLabel(entry) : undefined}
                still={still}
                link={link}
                linkId={position === 0 ? 'a' : 'b'}
                linked={pair && !narrow && linked}
              />
            )
          })}
        </div>
      </>
    )

  const toolbar = (
    <div className="bench-toolbar">
      {aspect !== 'flight' && anyFiled ? (
        <div className="specimen-seg bench-seg-3" role="group" aria-label={pair ? 'View both' : 'View'}>
          {VIEWS.map((v) => (
            <button key={v.id} type="button" aria-pressed={sharedView === v.id} onClick={() => preset(v.id)}>
              {v.label}
            </button>
          ))}
        </div>
      ) : null}
      {aspect === 'flight' || anyFiled ? (
        <div className="specimen-seg" role="group" aria-label="Pitching hand">
          {(['right', 'left'] as const).map((h) => (
            <button key={h} type="button" aria-pressed={hand === h} onClick={() => onChange({ hand: h })}>
              {h === 'right' ? 'Right' : 'Left'}
            </button>
          ))}
        </div>
      ) : null}
      {aspect !== 'flight' && anyFiled && !still ? (
        <>
          {pair && !narrow ? (
            <button type="button" className="specimen-action" onClick={toggleLink}>
              {linked ? 'Unlink' : 'Link'}
            </button>
          ) : null}
          <button type="button" className="specimen-action" onClick={() => link.reset()}>
            <RotateCcw size={14} aria-hidden="true" />
            Reset
          </button>
        </>
      ) : null}
      {pair && onSwap ? (
        <button type="button" className="specimen-action" onClick={onSwap}>
          <ArrowLeftRight size={14} aria-hidden="true" />
          Swap
        </button>
      ) : null}
    </div>
  )

  const heads = pair ? (
    <div className="bench-row bench-row-head" aria-hidden="true">
      <span />
      {entries.map((e, i) => (
        <span key={e.display.slug} className="bench-col-head" style={edge(e)} data-line={aspect === 'flight' ? (i === 0 ? 'solid' : 'dashed') : undefined}>
          {slotOf(i)} · {e.display.shortName}
        </span>
      ))}
    </div>
  ) : null

  // the reference hand's one badge, at the head of everything it wrote
  const handRow = (
    <Row name="Reference hand">
      {entries.map((e) => (
        <span key={e.display.slug} className="bench-cell">
          <GripSourceBadge provenance={e.canonical.gripModel.provenance} />
          {e.canonical.gripModel.status === 'unfiled' ? (
            <span className="bench-cell-quiet">{e.canonical.gripModel.provenance.value}</span>
          ) : (
            <span className="bench-cell-quiet">{e.canonical.gripModel.visualCaveat}</span>
          )}
        </span>
      ))}
    </Row>
  )

  const claimRow = (name: string, pick: (e: PitchAtlasEntry) => Claim<string> | undefined, dim?: boolean) =>
    entries.some((e) => pick(e)) ? (
      <Row name={name} dim={dim}>
        {entries.map((e) => {
          const claim = pick(e)
          return (
            <span key={e.display.slug} className="bench-cell">
              {claim ? <RefractorClaim claim={claim} proseClassName="text-[14px] leading-relaxed text-bone" /> : <span className="bench-cell-quiet">None on file</span>}
            </span>
          )
        })}
      </Row>
    ) : null

  const rows =
    aspect === 'grip' ? (
      <>
        {claimRow('The hold', (e) => e.canonical.grip, !!finger)}
        {handRow}
        {fingers.map(({ finger: f, contacts }) => {
          const on = finger === f
          return (
            <button
              key={f}
              type="button"
              className="bench-row bench-finger"
              aria-pressed={on}
              data-dim={(finger && !on) || undefined}
              onClick={() => setFinger(on ? null : f)}
            >
              <span className="bench-row-name">
                {FINGER_NAME[f]}
                {pair && differs(contacts[0], contacts[1]) ? (
                  <i className="bench-differs" title="The two hands differ here">
                    <span className="sr-only"> (the two hands differ here)</span>
                  </i>
                ) : null}
              </span>
              {entries.map((e, i) => (
                <ContactCell key={e.display.slug} contact={contacts[i]} unfiled={e.canonical.gripModel.status === 'unfiled'} />
              ))}
            </button>
          )
        })}
      </>
    ) : aspect === 'release' ? (
      <>
        {handRow}
        {(['Hold', 'Pressure', 'Leave'] as const).map((step, n) => (
          <Row key={step} name={step}>
            {entries.map((e) => (
              <span key={e.display.slug} className="bench-cell">
                {e.canonical.gripModel.status === 'unfiled' ? (
                  <span className="bench-cell-quiet">Not filed</span>
                ) : (
                  <span>{releaseSequence(e)[n].copy}</span>
                )}
              </span>
            ))}
          </Row>
        ))}
        {claimRow('Mechanics', (e) => e.canonical.mechanics)}
        {claimRow('In their words', (e) => e.canonical.voice)}
      </>
    ) : (
      <>
        <Row name="Shape">
          {entries.map((e) => (
            <span key={e.display.slug} className="bench-cell">
              <strong>{shapeLabel(e)}</strong>
              <RefractorClaim claim={e.canonical.physics.shape} proseClassName="text-[14px] leading-relaxed text-bone" />
            </span>
          ))}
        </Row>
        {claimRow('Spin', (e) => e.canonical.physics.spinAxis)}
        {claimRow('The one sentence', (e) => e.canonical.physics.teaching)}
      </>
    )

  return (
    <>
      <div className="bench-stage">
        {stage}
        {toolbar}
      </div>
      <div className="bench-rail" data-count={entries.length}>
        <div className="bench-table" aria-label={aspect === 'grip' ? 'Finger by finger' : aspect === 'release' ? 'The release' : 'The shape'} role="group">
          {heads}
          {rows}
        </div>
        <nav className="bench-study" aria-label="Study further">
          {entries.map((e) => (
            <Link key={e.display.slug} to={`/pitch/${e.display.slug}#${SECTION[aspect]}`} viewTransition>
              Study {pair ? e.display.shortName : aspect === 'grip' ? 'grip' : aspect === 'release' ? 'release' : 'movement'} <span aria-hidden="true">→</span>
            </Link>
          ))}
        </nav>
      </div>
    </>
  )
}
