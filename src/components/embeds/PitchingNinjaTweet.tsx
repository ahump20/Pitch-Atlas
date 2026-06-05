import { lazy, Suspense, useEffect, useState } from 'react'
import type { Tweet } from 'react-tweet/api'
import tweetData from '../../data/tweets/794874011671007232.json'
import { EmbedFallback } from './EmbedFallback'

/*
  The legal, sanctioned way to show the PitchingNinja clip: the whole embedded
  tweet, crediting @PitchingNinja, NOT the raw video file. Rendered from local
  baked JSON, so there is no runtime fetch, no SWR, no third-party script, and no
  CSP script-src change.

  react-tweet statically imports CSS-module files, which the build-time prerender
  runs through a plain Node loader that cannot parse .css. So we load react-tweet
  lazily and only after the client mounts: the embed has no SEO value to
  prerender, and keeping it out of the eager route graph lets every page
  prerender cleanly. The credited fallback covers the server render and any load
  failure, so the panel is never blank.
*/

const TWEET_URL = 'https://x.com/PitchingNinja/status/794874011671007232'

const tweet = tweetData as unknown as Tweet

const EmbeddedTweet = lazy(() =>
  import('react-tweet').then((m) => ({ default: m.EmbeddedTweet })),
)

function Fallback() {
  return (
    <EmbedFallback
      title="A pitch in flight, shot by PitchingNinja"
      credit="via @PitchingNinja"
      href={TWEET_URL}
      ctaLabel="Watch on X"
      aspect="3 / 4"
    />
  )
}

export function PitchingNinjaTweet() {
  const [mounted, setMounted] = useState(false)
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
