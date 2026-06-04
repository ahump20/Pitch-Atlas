# Contributing

Thanks for contributing to Pitch Atlas.

## Product framing for contributions

- Pitch Atlas is a standalone product, separate from Blaze Sports Intel.
- v1 is a four-seam visual proof, not a full MVP.
- Core principle: **Sourced, not corrected. Many ways can work. Claims are labeled by provenance.**
- Do not add auth, fake community content, runtime API calls, or claims outside project boundaries.

## Local setup

```bash
npm ci
npm run dev
```

## Validation before opening a PR

```bash
npm run typecheck
npm run lint
npm run test -- --run
npm run build
```

## Content and safety boundaries

- No MLB/team/player photos, logos, footage, or likenesses.
- No medical, injury-prevention, or youth-prescription claims.
- Keep provenance labels and source context explicit.
