# Pitch Atlas

Pitch Atlas is a **standalone product** (separate from Blaze Sports Intel) for exploring how pitches are described across sources.

## v1 scope (this repository)

Pitch Atlas v1 is a **four-seam visual proof**, not a full MVP.

Core principle:

> **Sourced, not corrected. Many ways can work. Claims are labeled by provenance.**

v1 includes:
- one four-seam canonical record
- three sourced master variants
- an honest empty community panel

v1 does **not** include:
- authentication
- fake community posts, fake counts, or fake badges
- runtime API calls (no live Statcast/Baseball Savant/Rapsodo fetches)

## Safety, rights, and content boundaries

- No MLB/team/player photos, logos, footage, or likenesses.
- No medical, injury-prevention, or youth-prescription claims.
- Claims are presented with source context and provenance labels.

## Local development

```bash
npm ci
npm run dev
```

## Local verification commands

```bash
npm run typecheck
npm run lint
npm run test -- --run
npm run build
npm run preview
```
