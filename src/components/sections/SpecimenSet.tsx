import { PITCHES } from '../../data/pitches'
import { PitchSpecimenCard } from '../refractor/PitchSpecimenCard'

/*
  The Pitch Index as a refractor specimen set — the signature surface on the home. Every
  card is a front-of-card summary driven by the real pitch record (see PitchSpecimenCard,
  the single source for how a pitch becomes a card). The four-seam (specimen 00) pulls the
  gold 1/1. Foil is decoration; the readings are sourced.
*/
export function SpecimenSet() {
  return (
    <div className="mx-auto max-w-[1320px] px-4 pt-10 md:px-8">
      <div className="grid justify-items-center gap-[clamp(20px,2.4vw,30px)] [grid-template-columns:repeat(auto-fill,minmax(min(340px,100%),1fr))]">
        {PITCHES.map((entry, i) => (
          <PitchSpecimenCard key={entry.display.slug} entry={entry} index={i} />
        ))}
      </div>
    </div>
  )
}
