import { EmbeddedTweet } from 'react-tweet'
import type { Tweet } from 'react-tweet/api'
import tweetData from '../../data/tweets/794874011671007232.json'
import { EmbedFallback } from './EmbedFallback'

/*
  The legal, sanctioned way to show the PitchingNinja clip: the whole embedded
  tweet, crediting @PitchingNinja, NOT the raw video file. Rendered from local
  baked JSON, so there is no runtime fetch, no SWR, no third-party script, and no
  CSP script-src change. If the JSON is ever missing or malformed, it degrades to
  a credited link out instead of a blank panel.
*/

const TWEET_URL = 'https://x.com/PitchingNinja/status/794874011671007232'

const tweet = tweetData as unknown as Tweet

export function PitchingNinjaTweet() {
  if (!tweet || !tweet.id_str) {
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

  return (
    <div className="react-tweet-theme light" data-theme="light">
      <EmbeddedTweet tweet={tweet} />
    </div>
  )
}
