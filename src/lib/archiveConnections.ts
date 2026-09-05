import { craftsmenForPitch } from '../data/craftsmen'

/** Both the person and the signature pitch must match. A familiar name alone
 * does not establish that a practitioner's file documents this variant. */
export function craftsmanForVariant(pitchSlug: string, name: string) {
  const identity = name.trim().toLocaleLowerCase('en-US')
  return craftsmenForPitch(pitchSlug).find(person => person.name.toLocaleLowerCase('en-US') === identity)
}
