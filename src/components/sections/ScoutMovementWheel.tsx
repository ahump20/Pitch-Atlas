import type { PitchMotion } from '../../data/types'

export interface ScoutMovementWheelProps {
  motion?: PitchMotion | null
  shapeLabel?: string
  familyLabel?: string
  sourceTierLabel?: string
  editionLabel?: string
}

const verticalCopy: Record<PitchMotion['verticalShape'], string> = {
  ride: 'Ride',
  drop: 'Drop',
  flat: 'Flat',
}

const horizontalCopy: Record<PitchMotion['horizontalDir'], string> = {
  'arm-side': 'Arm-side',
  'glove-side': 'Glove-side',
  none: 'No horizontal tell',
}

export function ScoutMovementWheel({
  motion,
  shapeLabel = 'Shape not filed',
  familyLabel = 'Pitch family',
  sourceTierLabel = 'Unverified',
  editionLabel = 'Filed',
}: ScoutMovementWheelProps) {
  const vertical = motion ? verticalCopy[motion.verticalShape] : 'Unfiled'
  const horizontal = motion ? horizontalCopy[motion.horizontalDir] : 'Unfiled'
  const character = motion?.gyro ? 'Gyro-dominant' : motion ? 'Magnus read' : 'No read'

  return (
    <section className="rfx-movement-wheel" aria-label="Sourced movement wheel">
      <div className="rfx-movement-wheel__dial" aria-hidden="true">
        <span className="rfx-movement-wheel__axis" />
        <span className="rfx-movement-wheel__center" />
      </div>
      <div className="rfx-movement-wheel__copy">
        <p className="rfx-movement-wheel__eyebrow">Movement wheel · no invented numbers</p>
        <h3>{shapeLabel}</h3>
        <dl>
          <div><dt>Vertical</dt><dd>{vertical}</dd></div>
          <div><dt>Horizontal</dt><dd>{horizontal}</dd></div>
          <div><dt>Character</dt><dd>{character}</dd></div>
        </dl>
        <div className="rfx-movement-wheel__chips" aria-label="Movement provenance">
          <span>{familyLabel}</span>
          <span>{sourceTierLabel}</span>
          <span>{editionLabel}</span>
        </div>
      </div>
    </section>
  )
}
