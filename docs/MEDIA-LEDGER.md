# Pitching Ninja Media Rights Ledger

Date checked: **2026-06-09** (all rows). Maintainer: this file is the gate — no third-party
clip ships on pitch-atlas.com or in the iOS app unless its row here says so.

## The rights reality (read this before adding any row)

Rob Friedman (@PitchingNinja) is an attorney and baseball analyst — as of 2026 the lead
pitching analyst for Peacock's MLB coverage, a Fox Sports and ESPN contributor, and the
person whose "sword" term MLB added to Statcast. His clips are beloved and he has
historically shared his full GIF library by Dropbox link, free, for pitchers and coaches.

None of that is a license. The underlying footage in nearly every Pitching Ninja clip is
**MLB broadcast footage, copyright MLB** (plus player/team publicity rights). Friedman
himself was suspended from Twitter in 2018 when MLB enforced exactly this; the resolution
was that **MLB hired him** — it did not open the footage to anyone else. He cannot grant
commercial reuse of footage he does not own, and no license text exists anywhere we could
find (his X bio, Wikipedia, press coverage) that purports to.

So the policy is fixed:

| Tier | What it means | When |
|---|---|---|
| **Official embed** | Full embedded tweet via X's syndication pipeline (`react-tweet` / `PitchingNinjaTweet.tsx`), whole tweet, credited, never the raw media file | Tweet is live AND syndication-eligible (verified) |
| **Outbound link** | Plain link to x.com, opens externally | Any live tweet; the only iOS-safe tier |
| **Citation only** | Text reference, no link rendered | Provenance notes, dead tweets worth recording |
| **Do not use** | Nothing ships | Tweet unavailable/deleted, or any temptation to download/rehost |

Hard floor, both platforms: **never download, bundle, re-encode, crop, trim, filter, or
"generatively polish" Pitching Ninja or any MLB footage.** Generative tooling may create
Pitch Atlas-owned backgrounds and original still diagrams; it must not imitate or launder
broadcast footage. No raw GIF/MP4/WebM from third parties in `public/` or in the iOS
bundle — the only motion files shipped are Austin's own grip videos (`public/grips/*`,
first-party, fully owned).

**iOS posture:** outbound links or citations only. Embedded X webviews add X-TOS and App
Review surface for zero v1 benefit. The iOS content JSONs contain no Pitching Ninja or
X/Twitter URLs today (verified 2026-06-09) — keep it that way unless a row here is
promoted deliberately.

## Repo state at HEAD (verified 2026-06-09)

- `src/components/embeds/PitchingNinjaTweet.tsx` — the sanctioned embed pattern (full
  tweet, credited fallback, baked JSON, no raw media). **Currently orphaned**: the
  sections that used it (GripLab, ReleaseRoom) were retired in the refractor redesign.
  The live site ships **zero** Pitching Ninja content today. Keep the component; it is
  the only approved way back in.
- No third-party media files anywhere in `public/` or the iOS bundle.

## Ledger

Verification method: X official syndication API (the same pipeline `react-tweet` embeds
ride), checked 2026-06-09. "Unavailable" means the official embed system will not serve
the tweet — deleted, withheld, or ineligible — so embedding is impossible and linking is
a dead end; those rows are **do not use** until someone re-verifies a live URL.

| # | URL | Pitch / player | Platform | Creator | Status (2026-06-09) | License/permission text found | Commercial App Store reuse | Attribution required | Broadcast-rights risk | Treatment |
|---|---|---|---|---|---|---|---|---|---|---|
| 1 | x.com/PitchingNinja/status/794874011671007232 | Bob Gibson — pitching inside, mental game ("why he hit Bill White") | X | @PitchingNinja | **Live, has video, syndication-eligible** | None | **No** | Yes — whole tweet, @PitchingNinja credited | High — archival MLB footage + Gibson estate publicity rights | **Official embed only** (existing `PitchingNinjaTweet.tsx`; currently unused) or outbound link |
| 2 | x.com/PitchingNinja/status/678424034883817472 | — (text tweet, Dec 2015: "New Link to Pitching Gifs" + Dropbox link) | X | @PitchingNinja | Live, text only | None — sharing posture, not a license | No | Yes if quoted | Low (no media) — but the linked archive is MLB footage | **Citation/outbound link only** — provenance for the archive |
| 3 | x.com/PitchingNinja/status/1097326335414976512 | — (text reply, Feb 2019, re-sharing the Dropbox link to coaches) | X | @PitchingNinja | Live, text only | None | No | Yes if quoted | Low (no media) | **Citation/outbound link only** |
| 4 | x.com/PitchingNinja/status/1339571508028395521 | unknown | X | @PitchingNinja | **Unavailable** via official pipeline | — | No | — | — | **Do not use** |
| 5 | x.com/PitchingNinja/status/1878201294670434470 | unknown | X | @PitchingNinja | **Unavailable** | — | No | — | — | **Do not use** |
| 6 | x.com/PitchingNinja/status/1711888303374385167 | unknown | X | @PitchingNinja | **Unavailable** | — | No | — | — | **Do not use** |
| 7 | x.com/PitchingNinja/status/1183218948859301888 | unknown | X | @PitchingNinja | **Unavailable** | — | No | — | — | **Do not use** |
| 8 | x.com/PitchingNinja/status/996922333039325184 | unknown | X | @PitchingNinja | **Unavailable** | — | No | — | — | **Do not use** |
| 9 | x.com/PitchingNinja/status/1622469830444843010 | unknown | X | @PitchingNinja | **Unavailable** | — | No | — | — | **Do not use** |
| 10 | x.com/PitchingNinja/status/1707201881293123690 | unknown | X | @PitchingNinja | **Unavailable** | — | No | — | — | **Do not use** |
| 11 | x.com/PitchingNinja/status/1640912866589908992 | unknown | X | @PitchingNinja | **Unavailable** | — | No | — | — | **Do not use** |
| 12 | x.com/PitchingNinja/status/1272302935408635911 | unknown | X | @PitchingNinja | **Unavailable** | — | No | — | — | **Do not use** |
| 13 | x.com/PitchingNinja/status/1151850495228104707 | unknown | X | @PitchingNinja | **Unavailable** | — | No | — | — | **Do not use** |
| 14 | dropbox.com/sh/qw77db1loclcm0v/AADbEm4Po_fSzJ_XCK8mnNxQa | Full GIF archive incl. grip-explainer folder | Dropbox | @PitchingNinja (curating MLB footage) | **Liveness unverified** — JS-rendered, not confirmable headlessly; link re-shared by Friedman as late as Feb 2019 (row 3) | "Free for pitchers and coaches" hospitality in press coverage; **no license text** | **No** | n/a | High — the archive is MLB broadcast footage end to end | **Citation only.** Never deep-link items, never mirror, never bundle. Liveness doesn't change the treatment |

## Addendum — Austin's teaching-lead candidates (verified 2026-06-09)

Austin supplied 14 grip-teaching clips as better leads than generic highlight GIFs. All 14
are **live and syndication-eligible** (official embed pipeline serves them), verified
2026-06-09. Same rules as everything above: **official embed or outbound link only, never
rehost**; no license text exists for any of them; commercial App Store reuse: **no**;
attribution (whole credited tweet) required; broadcast-rights risk is high on every row
with game footage, lower on interview/demo segments Friedman shot himself — but his
self-shot interviews still carry player publicity rights, so the treatment doesn't change.
iOS: outbound link only.

| Pitch lane | Player / clip | URL | Date | Video | Treatment |
|---|---|---|---|---|---|
| Four-seam | Verlander — grip/release/spin axis | x.com/PitchingNinja/status/1016866886863278080 | 2018-07-11 | yes | Embed or link |
| Sinker | Treinen — one-seam sinker grip ("there's not one right grip") | x.com/PitchingNinja/status/776840327009275904 | 2016-09-16 | yes | Embed or link |
| Sinker | Stroman — grip/release/spin, slow | x.com/PitchingNinja/status/951837874781122561 | 2018-01-12 | yes | Embed or link |
| Cutter | Pedro Martínez — cutter grip | x.com/PitchingNinja/status/972128267888222209 | 2018-03-09 | yes | Embed or link |
| Cutter | Mariano Rivera — teaching Halladay & Kazmir the cutter | x.com/PitchingNinja/status/1061649568847269889 | 2018-11-11 | yes | Embed or link |
| Slider | Kershaw — slider grip | x.com/PitchingNinja/status/1815186437819556161 | 2024-07-22 | yes | Embed or link |
| Sweeper | Michael King — sweeper grip (from Friedman's own interview) | x.com/PitchingNinja/status/1868325721808285982 | 2024-12-15 | yes | Embed or link |
| Slider | Chase Burns — slider grip (shown to Friedman directly) | x.com/PitchingNinja/status/1951673761532407921 | 2025-08-02 | yes | Embed or link |
| Curveball | Yamamoto — curveball grip | x.com/PitchingNinja/status/1635036027550310400 | 2023-03-12 | no (stills) | Embed or link |
| Knuckleball | Wakefield — knuckleball grip | x.com/PitchingNinja/status/1878791605005779087 | 2025-01-13 | yes | Embed or link |
| Screwball | Valenzuela — legendary screwball + grip | x.com/PitchingNinja/status/2003437937870954952 | 2025-12-23 | yes | Embed or link |
| Splitter | Ohtani — splitter grip/spin | x.com/PitchingNinja/status/983083790724685824 | 2018-04-08 | yes | Embed or link |
| Forkball | Senga — Ghost Fork + grip | x.com/PitchingNinja/status/1422181203470389249 | 2021-08-02 | yes | Embed or link |
| Changeup (Airbender) | Devin Williams — grip detail + variations | x.com/PitchingNinja/status/1378074273781256193 | 2021-04-02 | yes | Embed or link |

These map cleanly onto existing specimen pages (four-seam, two-seam/sinker, cutter,
slider, sweeper, curve, knuckleball, screwball, splitter, forkball, changeup) — each could
sit as one credited embedded tweet in the matching pitch chapter via the existing
`PitchingNinjaTweet` pattern (parameterize its hardcoded URL first). That's a product
decision, not done in this run; the rights gate is cleared for **embed-tier use only**.

## If Austin wants more than embeds

The clean path exists and is cheap to ask for: Friedman is an attorney and reachable
(@PitchingNinja; FlatGround app; via Peacock/Fox media relations). A written permission
covering commercial App Store distribution would still **not** cover the underlying MLB
footage — that needs MLB.tv/MLB licensing — so the realistic asks are (a) his blessing
for prominent embedded-tweet usage with attribution, which costs nothing and builds the
relationship, or (b) a real MLB footage license, which is a business decision, not a
repo task.

## Sources

- [Rob Friedman (baseball analyst) — Wikipedia](https://en.wikipedia.org/wiki/Rob_Friedman_(baseball_analyst)) — bio, 2018 suspension and reinstatement, MLB analyst roles, "sword" Statcast adoption. No archive-permission language anywhere in the article.
- [@PitchingNinja vs. MLB: Lessons From A Twitter Showdown — WBUR Only A Game, 2018-06-22](https://www.wbur.org/onlyagame/2018/06/22/pitching-ninja-baseball-mlb-gifs) — MLB suspended the account over copyright; resolution made Friedman an MLB contractor. The clearest public evidence the footage rights are MLB's.
- [Inside Interview: The Pitching Ninja — ABCA Inside Pitch, Mar/Apr 2019](https://www.abca.org/magazine/magazine/2019-2-March_April/Inside_Interview_The_Pitching_Ninja_Rob_Friedman.aspx) — fetch blocked (403); cited as a lead for the "free Dropbox for coaches" posture.
- [Rapsodo Baseball Podcast — Rob Friedman on Pitching Ninja, FlatGround](https://rapsodo.com/blogs/baseball/rapsodo-baseball-podcast-rob-friedman-on-pitching-ninja-flatground-growing-the-game/) — Dropbox library offered free; pros report learning pitches from it.
- Rows 1–13 status: X syndication API via `react-tweet/api` `getTweet()`, 2026-06-09.
