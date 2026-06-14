import { lazy, Suspense, useEffect, useState } from 'react'
import type { Tweet } from 'react-tweet/api'
import tweetData from '../../data/tweets/1061649568847269889.json'
import { EmbedFallback } from './EmbedFallback'

/*
  Mariano Rivera teaching the cutter to Roy Halladay and Scott Kazmir, shot and
  shared by @PitchingNinja — the one craftsman-matched lead in the media ledger
  (docs/MEDIA-LEDGER.md: embed or link, never rehost). The tweet is baked to
  local JSON (no runtime fetch, no third-party script), react-tweet loads lazily
  after mount so the prerender stays clean, and the credited fallback covers
  every other state.
*/

const TWEET_URL = 'https://x.com/PitchingNinja/status/1061649568847269889'

const tweet = tweetData as unknown as Tweet

const EmbeddedTweet = lazy(() =>
  import('react-tweet').then((m) => ({ default: m.EmbeddedTweet })),
)

function Fallback() {
  return (
    <EmbedFallback
      title="Rivera teaching the cutter to Halladay and Kazmir"
      credit="via @PitchingNinja"
      href={TWEET_URL}
      ctaLabel="Watch on X"
      aspect="3 / 4"
    />
  )
}

export function RiveraTeachingLead() {
  const [mounted, setMounted] = useState(false)
  // eslint-disable-next-line react-hooks/set-state-in-effect -- client-only mount flag for hydration-safe embed render
  useEffect(() => setMounted(true), [])

  if (!mounted || !tweet || !tweet.id_str) return <Fallback />

  return (
    <Suspense fallback={<Fallback />}>
      <div className="react-tweet-theme light" data-theme="light">
        <EmbeddedTweet tweet={tweet} />
      </div>
    </Suspense>
  )
}
