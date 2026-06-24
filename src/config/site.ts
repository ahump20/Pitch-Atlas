/*
  Brand constants. The name is Pitch Atlas, never "Baseball Atlas". The tagline
  is "The pitch, in your hand." Two voice lines carry the identity:
    - brandLine, "Pitchers Progressing Pitches", is the product's voice — what it
      IS. It fronts the home hero.
    - sourcePrinciple, "Sourced, not corrected", is the constitutional Core
      principle — how the atlas BEHAVES. It is wired byte-for-byte into the data
      model, README, and NORTHSTAR, so it stays verbatim; on the home it lives on
      the trust surfaces (the rule sheet and the close), not the hero.
*/
export const SITE = {
  siteName: 'Pitch Atlas',
  /** Short category line under the wordmark. */
  moduleName: 'Field manual',
  /** The product promise, used in the hero and meta. */
  positioning: 'The living field manual for pitch craft.',
  canonicalDomain: 'https://pitch-atlas.com',
  previewDomain: 'https://pitch-atlas.pages.dev',
  tagline: 'The pitch, in your hand.',
  /** The brand voice line — fronts the home hero. */
  brandLine: 'Pitchers Progressing Pitches',
  sourcePrinciple: 'Sourced, not corrected',
} as const
