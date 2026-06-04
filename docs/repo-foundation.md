# Repository foundation

This repo foundation is intentionally separate from product implementation. It sets guardrails for Claude Code and later contributors without touching any in-progress build branch.

## Foundation decisions

- Existing repo: `ahump20/Pitch-Atlas`
- Product: standalone, not Blaze Sports Intel
- v1 scope: four-seam visual proof
- Principle: sourced, not corrected
- Node: 24 LTS
- Hosting target: Cloudflare Pages
- CI: GitHub Actions
- Deploy action: Cloudflare Wrangler action, not deprecated Pages action

## Branch protection timing

Do not require CI checks until the CI workflow has run at least once and the `verify` check exists.

Suggested later `main` protection:

- require status checks before merge
- require `verify`
- require branches up to date
- block force pushes
- block branch deletion
- require linear history when the repo has more than one regular contributor

For a one-person early repo, admin bypass can stay enabled until a second real reviewer exists.

## Secrets needed for deployment

```txt
CLOUDFLARE_API_TOKEN
CLOUDFLARE_ACCOUNT_ID
```

Optional repository variable:

```txt
CLOUDFLARE_PAGES_PROJECT=pitch-atlas
```
