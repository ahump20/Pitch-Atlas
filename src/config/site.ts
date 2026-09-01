/*
  Brand constants. The name is Pitch Atlas, never "Baseball Atlas". The tagline
  is "The pitch, in your hand." Two voice lines carry the identity:
    - brandLine, "Preserving & Progressing the Art of the Pitch", is the product's
      voice — what it IS, in Austin's own words (2026-06-25; supersedes the earlier
      "Pitchers Progressing Pitches"). It fronts the home hero stamp and the close.
    - mission, below, is the plain-language reason the atlas exists. Provenance,
      confidence labels, rights records, and moderation remain the trust system
      underneath that mission; they are not the product's personality or tagline.
*/
export const SITE = {
  siteName: 'Pitch Atlas',
  /** Short category line under the wordmark. */
  moduleName: 'Living museum',
  /** The product promise, used in the hero and meta. */
  positioning: 'The living museum of pitching craft.',
  canonicalDomain: 'https://pitch-atlas.com',
  previewDomain: 'https://pitch-atlas.pages.dev',
  tagline: 'The pitch, in your hand.',
  /** The brand voice line — fronts the home hero. */
  brandLine: 'Preserving & Progressing the Art of the Pitch',
  mission:
    'Pitch Atlas preserves the heritage, history, and art of pitching—one place to learn from trusted minds, discover creative voices, and talk about the craft.',
} as const
