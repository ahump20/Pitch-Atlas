import { Link } from 'react-router-dom'
import { craftsmanBySlug } from '../../data/craftsmen'
import { lostPitchBySlug } from '../../data/lost-pitches'
import { pitchBySlug } from '../../data/pitches'
import { PitchSpecimenCard } from '../refractor/PitchSpecimenCard'
import { ConfidenceLabel } from '../provenance/ConfidenceLabel'
import { SourceBadge } from '../provenance/SourceBadge'
import { ClaimNote } from '../provenance/SourcedValue'

/** An actual specimen and its documented practitioner make the archive's
 * connection visible. Navigation framing adds no new historical claims. */
export function ArchiveDiscovery() {
  const craftsman = craftsmanBySlug('adam-wainwright')
  const pitch = craftsman?.signaturePitchSlug ? pitchBySlug(craftsman.signaturePitchSlug) : undefined
  const history = lostPitchBySlug('rube-foster-fadeaway')
  if (!craftsman || !pitch || !history) return null

  return <section className="archive-discovery" aria-labelledby="discovery-title">
    <div className="archive-discovery-heading">
      <p className="archive-eyebrow">Follow the craft</p>
      <h2 id="discovery-title">Every grip<br />{' '}<em>opens a story.</em></h2>
      <p>Start with the hand. Follow the pitch into the life behind it, then bring what you notice back to the ball.</p>
    </div>
    <div className="archive-discovery-folio">
      <div className="archive-discovery-specimen">
        <p className="archive-eyebrow">The grip · {pitch.display.specimenNo}</p>
        <PitchSpecimenCard entry={pitch} maxWidth={290} />
        <p className="archive-reference-credit">Grip demonstration by Austin H.</p>
        <Link to={`/pitch/${pitch.display.slug}#grip-lab`} className="archive-text-link">Inspect the {pitch.display.shortName.toLowerCase()} grip <span aria-hidden="true">↗</span></Link>
      </div>
      <div className="archive-discovery-story">
        <p className="archive-eyebrow">The person · {craftsman.era}</p>
        <h3>{craftsman.name}</h3>
        {craftsman.quote && <figure className="archive-discovery-quote"><blockquote className="archive-quote-text">“{craftsman.quote.value}”</blockquote><figcaption><ConfidenceLabel confidence={craftsman.quote.confidence} />{craftsman.quote.source && <SourceBadge source={craftsman.quote.source} />}</figcaption>{craftsman.quote.note && <ClaimNote>{craftsman.quote.note}</ClaimNote>}</figure>}
        <p className="archive-discovery-invitation">Look at the hold. Read his account. Return to the grip with a different question.</p>
        <Link to={`/craftsmen/${craftsman.slug}`} className="archive-text-link">Read the craftsman’s file <span aria-hidden="true">→</span></Link>
        <div className="archive-discovery-history">
          <p className="archive-eyebrow">Further back in the archive</p>
          <Link to={`/lost-pitches/${history.slug}`}><h4>{history.name}</h4><span aria-hidden="true">↗</span></Link>
          <p>{history.tagline}. Follow the surviving account into the screwball’s file.</p>
        </div>
      </div>
    </div>
    <nav className="archive-discovery-routes" aria-label="Ways into the archive">
      <Link to="/repertoire"><span>Find your pitch</span><small>Search the complete index</small><b aria-hidden="true">→</b></Link>
      <Link to="/learn/sequencing"><span>Put two pitches together</span><small>Read the sequencing lesson</small><b aria-hidden="true">→</b></Link>
      <Link to="/softball"><span>Enter the softball wing</span><small>Another way to hold the game</small><b aria-hidden="true">→</b></Link>
    </nav>
  </section>
}
