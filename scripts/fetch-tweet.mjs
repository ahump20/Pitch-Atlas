// Bake a tweet to local JSON so the embed needs no runtime network call, no
// third-party script, and no live dependency on X at deploy time. Run manually
// (`npm run fetch:tweet`) to refresh; deliberately NOT part of the default build,
// because the Pages build env may not reach X and a deploy must never depend on
// a live X request. On any fetch failure we keep the last-good committed JSON.
import { getTweet } from 'react-tweet/api'
import { writeFile, mkdir, access } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const TWEET_ID = process.argv[2] ?? '794874011671007232'
const here = dirname(fileURLToPath(import.meta.url))
const out = resolve(here, '..', 'src', 'data', 'tweets', `${TWEET_ID}.json`)

async function exists(p) {
  try {
    await access(p)
    return true
  } catch {
    return false
  }
}

async function main() {
  let tweet
  try {
    tweet = await getTweet(TWEET_ID)
  } catch (err) {
    console.error(`[fetch-tweet] request failed for ${TWEET_ID}:`, err?.message ?? err)
  }

  if (!tweet) {
    if (await exists(out)) {
      console.error(`[fetch-tweet] no tweet returned; keeping the last-good ${out}`)
      process.exit(1)
    }
    console.error(`[fetch-tweet] no tweet returned and no committed JSON exists at ${out}`)
    process.exit(1)
  }

  await mkdir(dirname(out), { recursive: true })
  await writeFile(out, JSON.stringify(tweet, null, 2) + '\n', 'utf8')
  console.log(`[fetch-tweet] wrote ${out} (@${tweet.user?.screen_name}, ${tweet.id_str})`)
}

main()
