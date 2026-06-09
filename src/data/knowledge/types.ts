import type { Claim } from '../types'

/*
  The knowledge wings: the field manual's teaching layer. Each wing is a sourced
  essay rendered by one template (components/sections/KnowledgePage). A section is
  prose plus the confidence-tagged claims that back its teaching points — the same
  Claim model the specimen pages use, so a teaching page can never make an
  unsourced claim that the rest of the atlas would refuse.
*/

export interface KnowledgeSection {
  heading: string
  /** Original prose. Each paragraph is plain teaching text. */
  paragraphs: string[]
  /** The sourced claims that back the teaching points in this section. */
  claims?: Claim<string>[]
  /** Legacy source note folded into the normal claim list by the renderer. */
  pullStat?: { label: string; claim: Claim<string> }
}

export interface KnowledgeWing {
  slug: string
  /** Short label for the hub card and nav; empty if the wing lives on another page. */
  navLabel: string
  eyebrow: string
  title: string
  /** Hub-card one-liner + meta description. */
  summary: string
  /** Hero sub paragraph. */
  sub: string
  accent?: 'powder' | 'seam'
  sections: KnowledgeSection[]
  /** Footer line explaining how this wing was sourced. */
  confidenceNote: string
  /** Health/youth wings show the educational-use disclaimer. */
  educational?: boolean
  /** Cross-links to related wings, pitches, or tools. */
  related?: { label: string; to: string }[]
}
