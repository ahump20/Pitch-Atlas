import type { KnowledgeWing } from './types'

/*
  This route is intentionally claim-free. It remains in the route map so saved
  links resolve, but it only states the product boundary.
*/
export const armHealthWing: KnowledgeWing = {
  slug: 'arm-health',
  navLabel: 'Health & Workload Boundary',
  eyebrow: 'Outside the atlas',
  title: 'Health and Workload Stay Outside Pitch Atlas',
  summary:
    'A route-stable boundary: Pitch Atlas covers pitching craft, not medical, injury, workload, durability, or health-outcome claims.',
  sub:
    'This page remains so the boundary is visible. It contains no medical, injury, workload, rehabilitation, recovery, durability, or health-outcome claims.',
  accent: 'seam',
  educational: true,
  boundaryOnly: true,
  sections: [
    {
      heading: 'What Pitch Atlas does not publish',
      paragraphs: [
        'Pitch Atlas does not diagnose, assess pain, compare injury risk, prescribe rehabilitation or recovery, set throwing volume, or make claims about health outcomes and durability.',
        'A source label or disclaimer does not create an exception. Those subjects stay outside the product even when published research exists.',
      ],
    },
    {
      heading: 'What remains in scope',
      paragraphs: [
        'The atlas documents grips, pitch families, qualitative shape, source provenance, historical craft, and what named pitchers have said about their own pitches.',
        'It does not rate a grip, pitch, delivery, cue, or training choice as safe, safer, risky, protective, restorative, or suitable for an individual body.',
      ],
    },
    {
      heading: 'Why the route remains',
      paragraphs: [
        'Existing links to this page should resolve instead of disappearing or silently becoming a different lesson.',
        'The route now records only the boundary. It carries no sourced safety conclusions, thresholds, comparisons, plans, or personal recommendations.',
      ],
    },
  ],
  confidenceNote:
    'This is a scope boundary, not a sourced teaching page. It intentionally contains no medical, injury, workload, rehabilitation, recovery, durability, or health-outcome claims.',
  related: [
    { label: 'Pitch Design', to: '/learn/pitch-design' },
    { label: 'Mechanics', to: '/learn/mechanics' },
    { label: 'Youth Training Boundary', to: '/learn/youth' },
  ],
}
