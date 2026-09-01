---
target: home page
total_score: 23
max_score: 36
na_heuristics: 7
p0_count: 0
p1_count: 4
timestamp: 2026-09-01T04-26-31Z
slug: src-pages-atlashomev2-tsx
---
Method: dual-agent (A: design review · B: detector + browser evidence)
Mode: Experience/Read. Target: home page.

## Design Health Score
| # | Heuristic | Score | Key Issue |
|---|---|---|---|
| 1 | Visibility of System Status | 2 | Media rail has no visible loading/empty/error; returns null at zero items |
| 2 | Match System / Real World | 3 | Domain-fluent; "Refraction"/chase-card jargon never explained |
| 3 | User Control and Freedom | 3 | Paired flip-backs, inert hidden face; no keyboard hint for flip |
| 4 | Consistency and Standards | 2 | Orphan ChapterMark "02"; retired serif in close headline; cyan vs gold eyebrows; 3 card grammars |
| 5 | Error Prevention | 3 | Good constraints stated before input; no domain allowlist |
| 6 | Recognition Rather Than Recall | 3 | Labeled nav, tiers in words; MORE hides unknown count |
| 7 | Flexibility and Efficiency | n/a | Experience surface, no repeated task |
| 8 | Aesthetic and Minimalist | 2 | 6,363px desktop for five beats; large dead voids; destinations offered 3x |
| 9 | Error Recovery | 2 | Raw caught.message surfaced; useExternalContent has no .catch |
| 10 | Help and Documentation | 3 | Contextual and genuinely good; not searchable |
| **Total** | | **23/36** | Acceptable |

## Design Specificity Verdict
Specific with two generic patches. ~70% could not be lifted onto another product: the specimen card, the Refraction Bridge, the product's own beat vocabulary. Against: the wings grid is a stock bordered link grid; the media rail wears TikTok's design system for ~3 mobile viewports.

Detector: 13 findings, all rule `side-tab`. 11 verified false positives (directional prev/next borders; one blockquote citation rule). 2 true positives: GripCompare.tsx:104, TunnelPlot.tsx:209.

## Priority Issues
- P1-A Flip pill collides with card footer, clipping "GRIP" (ChromeWall.tsx:64-72). Verified desktop + mobile.
- P1-B Filed-set row: chase card 525x726 vs siblings 281x389; 337px ragged bottom (ChromeWall.tsx:61).
- P1-C Media rail is beat two, off-brand, ~8,600px mobile layout shift (ExternalMediaRail.tsx:38; AtlasHomeV2.tsx:44-52).
- P1-D Close headline uses the retired Newsreader serif; only one ChapterMark exists on the page (CloseCta.tsx:39; RefractionBridge.tsx:112).
- P2-E Four-states gap: rail returns null on empty, useExternalContent has no .catch; wing cards contain zero headings.

## Audit Health Score
| Dimension | Score |
|---|---|
| Accessibility | 3 |
| Performance | 2 |
| Theming | 2 |
| Responsive | 3 |
| Implementation Integrity | 3 |
| **Total** | **13/20** |

Zero-WebGL path verified live and excellent. Safety floor holds. No fabricated data. Two Supabase 404s on every load. Documented brand accent #C8102E is not the shipped #FF2D44.
