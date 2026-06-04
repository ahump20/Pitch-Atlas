# Contributing

Pitch Atlas contributions are judged by provenance, not by whether someone
thinks a technique is universally correct. Many ways can work. The atlas records
what is known, attributes it, and labels the confidence of each claim.

## Contribution standard

Every claim you add must carry a `confidence` label from the exact set the data
model defines (`ClaimConfidence` in `src/data/types.ts`):

- `official-data` — measured and published by the source of record (Statcast / MLB)
- `pitcher-own-words` — stated by the athlete directly
- `coach-observed` — reported firsthand by a coach
- `reputable-analysis` — a credible analyst, or our paraphrase of a cited reference
- `secondhand-attributed` — a quote or figure relayed through a secondary source (requires a note)
- `community-firsthand` — a community member's own report (future tiers only, launches with safeguards)
- `unverified` — no source corroborated the value this run (requires a note; shown, not hidden)

`approximate` is a separate boolean flag for a real figure that is rounded,
era-dependent, or methodology-bound — not a confidence level. Master-variant
records additionally carry a `tier` of `verified-attributed`; that is a record
tier, not a confidence value.

Use the helpers in `src/data/sources.ts` (`claim`, `secondhand`, `unverified`)
so every figure resolves to a real `Source` in the registry. A typo in a source
id throws at build, so a broken citation cannot ship.

Do not submit real-player grip, quote, movement, spin, or usage claims without a
source.

## Rights and safety

Do not submit MLB, team, or player photos, logos, footage, or likenesses unless
the repository owner has a documented license or permitted embed path.

Do not copy instructional prose from another site. Paraphrase and cite.

Do not submit medical, injury-prevention, workload, or youth-prescription
claims.

## Development

```bash
npm install
npm run typecheck
npm run lint
npm run test
npm run build
```
