# pitch-atlas.com Custom Domain

Pitch Atlas is built as the launch module inside the Baseball Atlas shell. The production domain should be:

- `https://pitch-atlas.com/`
- `https://www.pitch-atlas.com/`

The Pages preview domain remains staging language only:

- `https://pitch-atlas.pages.dev/`

## Current DNS Check

Observed after the production Pages deploy on June 5, 2026:

- Nameservers resolved to Cloudflare: `sri.ns.cloudflare.com` and `elsa.ns.cloudflare.com`.
- `pitch-atlas.com` resolved through Cloudflare and returned HTTP 200.
- `www.pitch-atlas.com` resolved through Cloudflare and returned HTTP 301 to `https://pitch-atlas.com/`.
- Branch preview: `https://feat-baseball-atlas-shell.pitch-atlas.pages.dev/`.
- Production deploy preview: `https://c1b32107.pitch-atlas.pages.dev/`.

Recheck with:

```bash
dig +short NS pitch-atlas.com
dig +short A pitch-atlas.com
dig +short CNAME pitch-atlas.com
dig +short A www.pitch-atlas.com
dig +short CNAME www.pitch-atlas.com
```

## Cloudflare Pages Binding

If the binding ever needs to be recreated in Cloudflare:

1. Open the Pages project currently serving `pitch-atlas.pages.dev`.
2. Go to `Custom domains`.
3. Add `pitch-atlas.com`.
4. Add `www.pitch-atlas.com`.
5. Let Cloudflare create or update the DNS records it recommends.
6. Keep SSL/TLS mode at the Cloudflare default for Pages unless another zone-level rule already exists.

After binding, verify:

```bash
dig +short A pitch-atlas.com
dig +short CNAME www.pitch-atlas.com
curl -I https://pitch-atlas.com/
curl -I https://www.pitch-atlas.com/
```

Browser proof after this deploy: `https://pitch-atlas.com/` opens the Baseball Atlas shell, shows the Pitch Atlas grip theater in the first viewport, and keeps the Evidence Ledger below the grip and release path.
