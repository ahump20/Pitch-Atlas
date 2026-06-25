/*
  Teaching clips — embed-or-link, never rehost.

  Per docs/MEDIA-LEDGER.md the underlying footage in these posts is not ours and
  not licensable by the poster (MLB broadcast / interview footage + player
  publicity rights), so the ONLY sanctioned treatment is the platform's own
  embed or an outbound link to the original post, fully credited, with no raw
  media file ever downloaded into the repo. This file holds the post references
  BOTH surfaces use: the web pages embed the player inline, and (as of 2026-06-25,
  at the owner's direction) the iOS content generator reads this module too and
  emits teaching-clips.json, so the app embeds the same official TikTok player —
  credited, outbound link always present. Still embed-or-link on both: no clip URL
  resolves to a file we host, and no MP4 ships in either bundle.

  The clip is a Source, not a measurement: nothing here asserts a spin/velo/break
  figure. The `lede` is a sourced, plain-language pointer to what the post shows.
*/

export interface TeachingClip {
  id: string
  platform: 'tiktok'
  /** TikTok numeric video id — the official player/embed key. */
  videoId: string
  /** Creator handle, credited on every surface (@included). */
  author: string
  authorUrl: string
  /** Canonical post URL — the outbound "watch at source" link and iOS-safe tier. */
  url: string
  /** The creator's own caption, shown verbatim as the post's context. */
  caption: string
  /** Our short title for the card. */
  title: string
  /** Plain-language pointer to what the post teaches. Sourced to the post; never a measured claim. */
  lede: string
  /** Which filed-specimen slugs surface this clip. */
  slugs: string[]
  /** Real retrieval date — drives the card's "added" line, never hardcoded copy. */
  retrievedAt: string
}

export const TEACHING_CLIPS: TeachingClip[] = [
  {
    id: 'ryan-four-two-seam',
    platform: 'tiktok',
    videoId: '7544907808555240735',
    author: '@bsf_pitchingperformance',
    authorUrl: 'https://www.tiktok.com/@bsf_pitchingperformance',
    url: 'https://www.tiktok.com/@bsf_pitchingperformance/video/7544907808555240735',
    caption:
      "Nolan Ryan didn't just throw gas — he understood movement. His breakdown of why the 4-seam plays up, and why the 2-seam is deadly running in on a right-handed hitter / away from a lefty.",
    title: 'Nolan Ryan on his four-seam and two-seam',
    lede:
      "Ryan in his own words on the two fastballs. The four-seam stays true and rides up on the hitter; the two-seam runs in on a righty and away from a lefty. It's the exact four/two split these specimen pages are built on, taught by the man who threw it.",
    slugs: ['four-seam', 'two-seam'],
    retrievedAt: '2026-06-25',
  },
  {
    id: 'rogers-rising-breaker',
    platform: 'tiktok',
    videoId: '6958820538441600262',
    author: '@pitchingninja',
    authorUrl: 'https://www.tiktok.com/@pitchingninja',
    url: 'https://www.tiktok.com/@pitchingninja/video/6958820538441600262',
    caption: 'Tyler Rogers, Rising Curveball 🛸',
    title: "Tyler Rogers' rising breaking ball",
    lede:
      'From a submarine slot barely a foot off the ground, Rogers’ breaker drops far less than the sinker it tunnels with, so it reads as rising — though gravity pulls it down the whole way. He calls it "a slider, but almost a curveball."',
    slugs: ['slider'],
    retrievedAt: '2026-06-25',
  },
  {
    id: 'ncaa-ace-grips',
    platform: 'tiktok',
    videoId: '7245789529104239915',
    author: '@ncaabsb',
    authorUrl: 'https://www.tiktok.com/@ncaabsb',
    url: 'https://www.tiktok.com/@ncaabsb/video/7245789529104239915',
    caption: "Take a look at these aces' pitch grips: Chase Dollander, Paul Skenes, Jac Caglianone, and Rhett Lowder.",
    title: 'College aces show their grips',
    lede:
      'NCAA Baseball’s grip tour — Chase Dollander, Paul Skenes, Jac Caglianone and Rhett Lowder showing how they actually hold the ball.',
    slugs: ['circle-change'],
    retrievedAt: '2026-06-25',
  },
]

/** The clip filed against a specimen slug, if any. One clip may serve several slugs. */
export function teachingClipForSlug(slug: string): TeachingClip | undefined {
  return TEACHING_CLIPS.find((c) => c.slugs.includes(slug))
}
