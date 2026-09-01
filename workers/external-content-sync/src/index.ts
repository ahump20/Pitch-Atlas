interface Env {
  SUPABASE_URL: string
  SUPABASE_SERVICE_ROLE_KEY: string
  X_BEARER_TOKEN?: string
  YOUTUBE_API_KEY?: string
  CRON_SECRET?: string
}

type Platform = 'x' | 'youtube' | 'instagram' | 'tiktok'

interface SourceRow {
  id: string
  platform: Platform
  name: string
  handle: string
  canonical_url: string
  provider_key: string | null
  trust_lane: 'trusted-mind' | 'heritage' | 'community-find'
  auto_publish: boolean
  active: boolean
  ingest_method: 'api' | 'official-feed' | 'editorial' | 'community-suggestion'
}

interface ProviderPost {
  platform: 'x' | 'youtube'
  externalId: string
  canonicalUrl: string
  text: string
  title?: string
  publishedAt: string
}

const PITCH_TERMS: Array<[RegExp, string, string]> = [
  [/\bfour[- ]?seam\b/i, 'four-seam', 'fastball'],
  [/\b(two[- ]?seam|sinker)\b/i, 'two-seam', 'fastball'],
  [/\bcutter\b/i, 'cutter', 'fastball'],
  [/\bslider\b/i, 'slider', 'breaking'],
  [/\bsweeper\b/i, 'sweeper', 'breaking'],
  [/\b(curve|curveball|12[- ]?6)\b/i, 'twelve-six', 'breaking'],
  [/\bchange(?:up)?\b/i, 'circle-change', 'offspeed'],
  [/\bsplit(?:ter|-finger)?\b/i, 'splitter', 'offspeed'],
  [/\bfork(?:ball)?\b/i, 'forkball', 'offspeed'],
  [/\bknuckleball\b/i, 'knuckleball', 'specialty'],
  [/\beephus\b/i, 'eephus', 'specialty'],
]

function cleanText(value: string): string {
  return value.replace(/https?:\/\/\S+/g, '').replace(/\s+/g, ' ').trim()
}

function clipped(value: string, max: number): string {
  const clean = cleanText(value)
  if (clean.length <= max) return clean
  return `${clean.slice(0, Math.max(0, max - 1)).trimEnd()}…`
}

function classify(text: string): { pitchSlugs: string[]; families: string[]; topics: string[] } {
  const pitchSlugs = new Set<string>()
  const families = new Set<string>()
  for (const [pattern, pitch, family] of PITCH_TERMS) {
    if (pattern.test(text)) {
      pitchSlugs.add(pitch)
      families.add(family)
    }
  }
  const topics = new Set<string>(['conversation'])
  if (/\bgrip|hold|finger/i.test(text)) topics.add('grip')
  if (/\brelease|arm slot|spin axis/i.test(text)) topics.add('release')
  if (/\bhistory|legend|hall of fame|remember/i.test(text)) topics.add('heritage')
  return { pitchSlugs: [...pitchSlugs], families: [...families], topics: [...topics] }
}

async function supabase<T>(env: Env, path: string, init: RequestInit = {}): Promise<T> {
  const response = await fetch(`${env.SUPABASE_URL}/rest/v1/${path}`, {
    ...init,
    headers: {
      apikey: env.SUPABASE_SERVICE_ROLE_KEY,
      authorization: `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`,
      'content-type': 'application/json',
      ...(init.headers ?? {}),
    },
  })
  const body = await response.text()
  if (!response.ok) throw new Error(`Supabase ${response.status}: ${body}`)
  // A write with Prefer: return=minimal answers 201 with an EMPTY body, so parsing
  // it unconditionally turned every successful ingest into a reported failure.
  if (!body) return undefined as T
  return JSON.parse(body) as T
}

async function loadSources(env: Env): Promise<SourceRow[]> {
  return supabase<SourceRow[]>(
    env,
    'external_sources?select=id,platform,name,handle,canonical_url,provider_key,trust_lane,auto_publish,active,ingest_method&active=eq.true',
  )
}

async function fetchX(source: SourceRow, env: Env): Promise<ProviderPost[]> {
  if (!env.X_BEARER_TOKEN || !source.provider_key) return []
  const headers = { authorization: `Bearer ${env.X_BEARER_TOKEN}` }
  const userResponse = await fetch(
    `https://api.x.com/2/users/by/username/${encodeURIComponent(source.provider_key)}`,
    { headers },
  )
  if (!userResponse.ok) throw new Error(`X user lookup ${userResponse.status}`)
  const user = (await userResponse.json()) as { data?: { id: string } }
  if (!user.data?.id) return []
  const timelineResponse = await fetch(
    `https://api.x.com/2/users/${user.data.id}/tweets?max_results=10&exclude=retweets,replies&tweet.fields=created_at`,
    { headers },
  )
  if (!timelineResponse.ok) throw new Error(`X timeline ${timelineResponse.status}`)
  const timeline = (await timelineResponse.json()) as {
    data?: Array<{ id: string; text: string; created_at?: string }>
  }
  return (timeline.data ?? []).map((post) => ({
    platform: 'x',
    externalId: post.id,
    canonicalUrl: `https://x.com/${source.provider_key}/status/${post.id}`,
    text: post.text,
    publishedAt: post.created_at ?? new Date().toISOString(),
  }))
}

async function fetchYouTube(source: SourceRow, env: Env): Promise<ProviderPost[]> {
  if (!env.YOUTUBE_API_KEY || !source.provider_key) return []
  const key = encodeURIComponent(env.YOUTUBE_API_KEY)
  const channelResponse = await fetch(
    `https://www.googleapis.com/youtube/v3/channels?part=contentDetails&id=${encodeURIComponent(source.provider_key)}&key=${key}`,
  )
  if (!channelResponse.ok) throw new Error(`YouTube channel lookup ${channelResponse.status}`)
  const channel = (await channelResponse.json()) as {
    items?: Array<{ contentDetails?: { relatedPlaylists?: { uploads?: string } } }>
  }
  const uploads = channel.items?.[0]?.contentDetails?.relatedPlaylists?.uploads
  if (!uploads) return []
  const playlistResponse = await fetch(
    `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&maxResults=10&playlistId=${encodeURIComponent(uploads)}&key=${key}`,
  )
  if (!playlistResponse.ok) throw new Error(`YouTube uploads ${playlistResponse.status}`)
  const playlist = (await playlistResponse.json()) as {
    items?: Array<{
      snippet?: {
        title?: string
        description?: string
        publishedAt?: string
        resourceId?: { videoId?: string }
      }
    }>
  }
  return (playlist.items ?? []).flatMap((item) => {
    const videoId = item.snippet?.resourceId?.videoId
    if (!videoId) return []
    return [{
      platform: 'youtube' as const,
      externalId: videoId,
      canonicalUrl: `https://www.youtube.com/watch?v=${videoId}`,
      title: item.snippet?.title,
      text: item.snippet?.description || item.snippet?.title || '',
      publishedAt: item.snippet?.publishedAt ?? new Date().toISOString(),
    }]
  })
}

async function ingestSource(source: SourceRow, env: Env): Promise<number> {
  let posts: ProviderPost[] = []
  if (source.platform === 'x' && source.ingest_method === 'api') posts = await fetchX(source, env)
  if (source.platform === 'youtube' && source.ingest_method === 'api') posts = await fetchYouTube(source, env)
  if (posts.length === 0) return 0

  const rows = posts.map((post) => {
    const classification = classify(`${post.title ?? ''} ${post.text}`)
    const hasPitchTag = classification.pitchSlugs.length > 0
    return {
      source_id: source.id,
      platform: post.platform,
      external_id: post.externalId,
      canonical_url: post.canonicalUrl,
      title: clipped(post.title || post.text, 140) || `${source.name} pitching post`,
      lede: clipped(post.text, 500) || `A new pitching post from ${source.name}, filed for review.`,
      source_caption: clipped(post.text, 1000) || null,
      published_at: post.publishedAt.slice(0, 10),
      retrieved_at: new Date().toISOString().slice(0, 10),
      pitch_slugs: classification.pitchSlugs,
      craftsman_slugs: [],
      families: classification.families,
      topics: classification.topics,
      trust_lane: source.trust_lane,
      moderation_state: source.auto_publish && hasPitchTag ? 'published' : 'pending',
      availability: 'available',
      embed_mode: 'official-embed',
      featured: false,
    }
  })

  // ignore-duplicates, never merge: a row that already exists has been through
  // review. Merging would reset a moderator's state, title, lede, and featured flag
  // on the next six-hourly run and republish something a human had rejected.
  await supabase<void>(env, 'external_content_items?on_conflict=platform,external_id', {
    method: 'POST',
    headers: { prefer: 'resolution=ignore-duplicates,return=minimal' },
    body: JSON.stringify(rows),
  })
  return rows.length
}

async function run(env: Env): Promise<{ checked: number; ingested: number; errors: string[] }> {
  const sources = await loadSources(env)
  let ingested = 0
  const errors: string[] = []
  for (const source of sources) {
    try {
      ingested += await ingestSource(source, env)
    } catch (error) {
      errors.push(`${source.id}: ${error instanceof Error ? error.message : 'unknown error'}`)
    }
  }
  return { checked: sources.length, ingested, errors }
}

export default {
  async scheduled(_controller: ScheduledController, env: Env, ctx: ExecutionContext) {
    ctx.waitUntil(run(env))
  },
  async fetch(request: Request, env: Env): Promise<Response> {
    if (request.method === 'GET') {
      return Response.json({ service: 'pitch-atlas-external-content-sync', status: 'ready' })
    }
    if (request.method !== 'POST' || !env.CRON_SECRET) return new Response('Not found', { status: 404 })
    if (request.headers.get('authorization') !== `Bearer ${env.CRON_SECRET}`) {
      return new Response('Unauthorized', { status: 401 })
    }
    return Response.json(await run(env))
  },
}
