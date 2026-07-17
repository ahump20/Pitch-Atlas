import type { KnowledgeWing } from './types'

/*
  This route is intentionally claim-free. It remains in the route map so saved
  links resolve, but it only states the product boundary.
*/
export const youthWing: KnowledgeWing = {
  slug: 'youth',
  navLabel: 'Youth Training Boundary',
  eyebrow: 'Outside the atlas',
  title: 'Youth Training Decisions Stay Outside Pitch Atlas',
  summary:
    'A route-stable boundary: Pitch Atlas does not publish age-based pitch selection, workload, rest, readiness, or training prescriptions.',
  sub:
    'This page remains so the boundary is visible. It contains no age-based pitch, workload, rest, readiness, health, or training claims.',
  accent: 'seam',
  educational: true,
  boundaryOnly: true,
  sections: [
    {
      heading: 'What Pitch Atlas does not publish',
      paragraphs: [
        'Pitch Atlas does not tell a young athlete which pitch to learn, when to add it, how much to throw, when to rest, or whether a training choice fits that athlete.',
        'It does not reproduce age tables, pitch-count rules, readiness tests, specialization guidance, or youth health conclusions, even when an outside authority publishes them.',
      ],
    },
    {
      heading: 'What remains in scope',
      paragraphs: [
        'The atlas preserves grips, pitch families, qualitative shape, source provenance, historical craft, and firsthand accounts from named pitchers.',
        'Those records are not an age gate, development sequence, training plan, workload tool, or recommendation for a young athlete.',
      ],
    },
    {
      heading: 'Why the route remains',
      paragraphs: [
        'Existing links to this page should resolve instead of disappearing or silently becoming a different lesson.',
        'The route now records only the boundary. It carries no sourced youth-training conclusions, thresholds, schedules, comparisons, or personal recommendations.',
      ],
    },
  ],
  confidenceNote:
    'This is a scope boundary, not a sourced teaching page. It intentionally contains no age-based pitch, workload, rest, readiness, health, or youth-training claims.',
  related: [
    { label: 'Pitch Index', to: '/repertoire' },
    { label: 'Pitch Design', to: '/learn/pitch-design' },
    { label: 'Health & Workload Boundary', to: '/learn/arm-health' },
  ],
}
