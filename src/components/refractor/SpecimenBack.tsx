import { lazy, Suspense, useEffect, useMemo, type CSSProperties } from 'react'
import { Link } from 'react-router-dom'
import { familyLabel } from '../../data/family'
import { CONFIDENCE_META, type PitchAtlasEntry } from '../../data/types'
import { useCardTilt, type TiltEngine } from '../../hooks/useCardTilt'
import { useWebGLSupport } from '../../hooks/useWebGLSupport'
import { SpecimenBoundary } from '../ball/SpecimenBoundary'
import { SeamSchematic } from '../fallback/SeamSchematic'
import { ScoutMovementWheel } from '../sections/ScoutMovementWheel'
import { STAGE_TIER_DOT } from '../provenance/refractorClaimMeta'
import { accentForSlug } from './accents'
import { BACK_RING_HEX, BACK_SEED_OFFSET, hexToTriple, type MaterialIdentity } from './material/cardMaterialProgram'
import { backMaterial, type CardMaterial } from './material/materialPresets'

/*
  The sourced back of a specimen: the dark scout record. Name and number, the
  movement wheel, the grip cue and the shape with their claim tiers, then the two
  source links and the route into the full file. Shared by the filed set on the home
  page and the inspector, so a card's evidence reads the same wherever it is turned
  over. Used to live inline in ChromeWall's WallCard.

  Its material is Quiet Ink & Bone: the chromium ladder, one bone specular, no colour,
  so the back reads as matte stock against the front's foil. The layer mounts only
  while the back is showing, so a face nobody can see never holds a GPU context. The
  back answers the hand like the front does; its tilt engine is its own, and a parent
  that steers the visible face (the inspector's keys, light and export) asks for it
  through onEngine. It stays in the gentle hover mode even there, because a grab that
  captured the pointer would swallow clicks on the source links it carries.
*/

const MaterialLayer = lazy(() => import('./material/MaterialLayer'))

const BACK_RING = hexToTriple(BACK_RING_HEX)

export function SpecimenBack({
  entry,
  flipped,
  foil = false,
  seed = 0,
  material: tuned,
  onEngine,
}: {
  entry: PitchAtlasEntry
  /** Whether this face is the one showing; links are tabbable only then. */
  flipped: boolean
  /** Mount the live material while the back is showing. */
  foil?: boolean
  seed?: number
  /** A finish other than Quiet Ink & Bone (the inspector). */
  material?: CardMaterial
  /** Hands the back's tilt engine to a parent that steers it (the inspector). */
  onEngine?: (engine: TiltEngine) => void
}) {
  const { canonical, motion, display } = entry
  const accent = accentForSlug(display.slug)
  const shape = canonical.physics.shape
  const gripCue = canonical.gripDetails[0] ?? canonical.grip
  const { ref, handlers, store, engine } = useCardTilt<HTMLDivElement>('rest')
  useEffect(() => {
    onEngine?.(engine)
  }, [engine, onEngine])
  const webgl = useWebGLSupport()
  const material = useMemo(() => tuned ?? backMaterial(), [tuned])
  const identity = useMemo<MaterialIdentity>(
    () => ({ c2: hexToTriple(accent.c2), c3: hexToTriple(accent.c3), ring: BACK_RING, seed: seed + BACK_SEED_OFFSET }),
    [accent, seed],
  )

  return (
    <div
      ref={ref}
      {...handlers}
      className="v2-back"
      style={{ '--c3': accent.c3 } as CSSProperties}
    >
      {foil && flipped && webgl ? (
        <SpecimenBoundary fallback={null}>
          <Suspense fallback={null}>
            <MaterialLayer store={store} material={material} identity={identity} />
          </Suspense>
        </SpecimenBoundary>
      ) : null}
      <div className="rfx-scout">
        <div className="rfx-scout-head">
          <span className="rfx-scout-name">{display.shortName}</span>
          <span className="rfx-scout-no">No. {display.specimenNo} · {familyLabel(canonical.family)}</span>
        </div>

        <ScoutMovementWheel motion={motion} accent={accent} />

        <div className="rfx-scout-rows">
          <div className="rfx-scout-row">
            <span className="rfx-scout-k">Grip cue</span>
            <span className="rfx-scout-v">
              {canonical.gripModel.status === 'filed' ? (
                <span className="rfx-grip-twin" aria-hidden="true">
                  <SeamSchematic
                    grip={canonical.gripModel.contacts}
                    handedness="right"
                    surface="stage"
                    showAxis={false}
                    showStitches={false}
                    // a 44px twin: names would be specks
                    showLabels={false}
                    title=""
                  />
                </span>
              ) : null}
              <span className="rfx-scout-value" title={gripCue.value}>{gripCue.value}</span>
              <span className="mt-1 flex clear-both items-center gap-1.5 font-mono text-[8px] uppercase tracking-[0.1em] text-bone-2">
                <i
                  className="inline-block h-1.5 w-1.5 rounded-full"
                  style={{ background: STAGE_TIER_DOT[gripCue.confidence] }}
                />
                {CONFIDENCE_META[gripCue.confidence].label}
                {gripCue.approximate ? <span className="text-bone-2/60">· approx</span> : null}
              </span>
            </span>
          </div>
          <div className="rfx-scout-row">
            <span className="rfx-scout-k">Shape</span>
            <span className="rfx-scout-v">
              <span className="rfx-scout-value" title={shape.value}>{shape.value}</span>
              <span className="mt-1 flex items-center gap-1.5 font-mono text-[8px] uppercase tracking-[0.1em] text-bone-2">
                <i
                  className="inline-block h-1.5 w-1.5 rounded-full"
                  style={{ background: STAGE_TIER_DOT[shape.confidence] }}
                />
                {CONFIDENCE_META[shape.confidence].label}
                {shape.approximate ? <span className="text-bone-2/60">· approx</span> : null}
              </span>
            </span>
          </div>
        </div>

        <div className="rfx-scout-foot">
          {gripCue.source ? (
            <a
              href={gripCue.source.url}
              target="_blank"
              rel="noreferrer noopener"
              tabIndex={flipped ? 0 : -1}
              className="block max-w-full truncate any-pointer-coarse:-my-[5px] any-pointer-coarse:py-[5px] font-mono text-[10px] uppercase tracking-[0.1em] text-bone-2 underline decoration-bone-2/40 underline-offset-2 transition-colors hover:text-bone"
            >
              Grip: {gripCue.source.label} <span aria-hidden="true">↗</span>
            </a>
          ) : null}
          {shape.source ? (
            <a
              href={shape.source.url}
              target="_blank"
              rel="noreferrer noopener"
              tabIndex={flipped ? 0 : -1}
              className="block max-w-full truncate any-pointer-coarse:-my-[5px] any-pointer-coarse:py-[5px] font-mono text-[10px] uppercase tracking-[0.1em] text-bone-2 underline decoration-bone-2/40 underline-offset-2 transition-colors hover:text-bone"
            >
              Shape: {shape.source.label} <span aria-hidden="true">↗</span>
            </a>
          ) : null}
          <div className="flex items-center justify-between gap-2">
            <Link
              to={`/pitch/${display.slug}`}
              tabIndex={flipped ? 0 : -1}
              className="inline-block min-w-0 truncate any-pointer-coarse:-my-[5px] any-pointer-coarse:py-[5px] font-mono text-[10px] uppercase tracking-[0.14em] text-bone transition-colors hover:text-bone-2"
            >
              Open the full file <span aria-hidden="true">→</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
