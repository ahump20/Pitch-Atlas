# Pitch Atlas Platform Contract — web and iOS

One product, two surfaces. Pitch-Atlas.com and the iOS app share the same source
doctrine, content model, route map, privacy/support URLs, and community backend.
Anything one surface carries that the other cannot support is labeled, not fudged.
Last reconciled: 2026-07-16.

## Shared doctrine (identical on both surfaces)

- Sourced, not corrected. Every factual claim routes through the Claim/Source
  engine with a confidence tier; the two weakest tiers must carry a note.
- Words-only physics. No rpm, IVB, mph, or inch figures in product prose or
  bundled content. Movement is shape and timing. (Web: `src/data/types.ts`
  PhysicsReference. iOS: bundled content JSON, synced by the qualitative
  content pass.)
- No fake community activity, counts, or freshness. Counts come from Supabase
  or don't render. Freshness comes from real `retrievedAt` data or doesn't render.
- No medical, injury, pain, rehabilitation, recovery, workload, durability,
  health-outcome, or youth-training claims on either surface. Citations and
  disclaimers do not create exceptions. Route-stable safety pages are claim-free
  scope boundaries.
- Third-party media is rights-led: official platform embeds or links unless a
  license covers bundling. See `docs/MEDIA-LEDGER.md`.
- No Blaze Sports Intel branding. Blaze the dog is the mascot; BSI is a
  different company.

## Content model

Canonical content lives in the web repo (`src/data/`). iOS consumes a generated
bundle (`PitchAtlas/Resources/Content/*.json` via `tools/generate-content`).
Schema contract: iOS decodes numeric physics fields as tolerant optionals and
renders shape language; a content regeneration must never reintroduce required
numeric fields.

## Route / deep-link map

| Surface | Web route | iOS | Notes |
|---|---|---|---|
| Pitch Index (front door) | `/repertoire` | Index tab | `/pitch-index`, `/classify` 301 to it on web |
| Filed specimens (12) | `/pitch/{slug}` | `pitchatlas://pitch/{slug}` | slugs in parity |
| Deeper repertoire files | `/repertoire/{slug}` | in-app list | |
| Craftsmen | `/craftsmen/{slug}` | `pitchatlas://craftsman/{slug}` | noun differs (plural web, singular iOS); align only if web ever emits app links |
| Lost Pitches | `/lost-pitches/*` | **web-only** (v1) | |
| Learn wings | `/learn/*` | Learn tab (bundled) | `/kinetic-chain` 301s to `/learn/mechanics/` on web |
| Grip Library | `/grips` | **web-only** (v1) | Austin's first-party photos |
| Shape Lab / sandbox / movement-map / compare | `/sandbox`, `/movement-map`, `/compare` | **web-only** | no WebGL dependence for core understanding |
| Softball wing | `/softball/**` | **web-only** (locked v1 scope) | |
| Community (field notes + discussion) | embedded on specimen/repertoire pages | Account + per-pitch sections | same Supabase backend |
| Privacy | `/privacy` | linked from Account screen | App Store requirement |
| Support | `/support` | linked from Account screen | |

## Community backend (shared)

Supabase project `cloeoulvrrfcbitrjpso`, publishable key only in clients, PKCE.
Auth: email OTP, Sign in with Apple, anonymous sessions (claim-later). Abuse
floor lives server-side: banned-terms trigger, per-hour rate limits, report-to-
hide, block-edge RLS filtering, JWT-verified caller-only delete-account.
Web auth redirect `https://pitch-atlas.com/*`; iOS `pitchatlas://auth-callback`.

## Sync rules

1. A claim shipped on one surface ships from the same source entry on the other,
   or doesn't ship there.
2. New web routes that iOS should reach get a deep-link entry in the same PR, or
   a **web-only** label here.
3. Contract drift is a defect: when `tools/generate-content` runs, the iOS
   bundle tests (`testDecodedCountsMatchManifest`, `testProvenanceContractHolds`)
   are the gate.
4. Privacy/support copy changes on web must stay true for iOS behavior, and the
   App Store privacy labels must match the privacy manifest, not aspiration.
