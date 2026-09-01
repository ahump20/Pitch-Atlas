import type { RepertoireFamily } from '../types'
import { TEACHING_CLIPS } from './tiktok'

export type ExternalPlatform = 'tiktok' | 'x' | 'instagram' | 'youtube'
export type ExternalTrustLane = 'trusted-mind' | 'heritage' | 'community-find'
export type ExternalIngestMethod = 'api' | 'official-feed' | 'editorial' | 'community-suggestion'
export type ExternalModerationState = 'pending' | 'published' | 'rejected' | 'unavailable'
export type ExternalAvailability = 'available' | 'unknown' | 'removed'
export type ExternalEmbedMode = 'official-embed' | 'outbound-only'

export interface ExternalSource {
  id: string
  platform: ExternalPlatform
  name: string
  handle: string
  canonicalUrl: string
  trustLane: ExternalTrustLane
  ingestMethod: ExternalIngestMethod
  autoPublish: boolean
  active: boolean
}

export interface ExternalContentTags {
  pitchSlugs: string[]
  craftsmanSlugs: string[]
  families: RepertoireFamily[]
  topics: string[]
}

export interface ExternalContentItem {
  id: string
  platform: ExternalPlatform
  externalId: string
  canonicalUrl: string
  sourceId: string
  sourceName: string
  sourceHandle: string
  sourceUrl: string
  title: string
  lede: string
  sourceCaption?: string
  publishedAt: string
  retrievedAt: string
  tags: ExternalContentTags
  trustLane: ExternalTrustLane
  moderationState: ExternalModerationState
  availability: ExternalAvailability
  embedMode: ExternalEmbedMode
  featured?: boolean
}

export const EXTERNAL_SOURCES: ExternalSource[] = [
  {
    id: 'pitching-ninja-x',
    platform: 'x',
    name: 'Pitching Ninja',
    handle: '@PitchingNinja',
    canonicalUrl: 'https://x.com/PitchingNinja',
    trustLane: 'trusted-mind',
    ingestMethod: 'api',
    autoPublish: true,
    active: true,
  },
  {
    id: 'pitching-ninja-tiktok',
    platform: 'tiktok',
    name: 'Pitching Ninja',
    handle: '@pitchingninja',
    canonicalUrl: 'https://www.tiktok.com/@pitchingninja',
    trustLane: 'trusted-mind',
    ingestMethod: 'official-feed',
    autoPublish: false,
    active: true,
  },
  {
    id: 'bsf-pitching-performance',
    platform: 'tiktok',
    name: 'BSF Pitching Performance',
    handle: '@bsf_pitchingperformance',
    canonicalUrl: 'https://www.tiktok.com/@bsf_pitchingperformance',
    trustLane: 'heritage',
    ingestMethod: 'editorial',
    autoPublish: false,
    active: true,
  },
  {
    id: 'ncaa-baseball-tiktok',
    platform: 'tiktok',
    name: 'NCAA Baseball',
    handle: '@ncaabsb',
    canonicalUrl: 'https://www.tiktok.com/@ncaabsb',
    trustLane: 'trusted-mind',
    ingestMethod: 'editorial',
    autoPublish: false,
    active: true,
  },
  {
    id: 'roger-clemens-x',
    platform: 'x',
    name: 'Roger Clemens',
    handle: '@rogerclemens',
    canonicalUrl: 'https://x.com/rogerclemens',
    trustLane: 'heritage',
    ingestMethod: 'editorial',
    autoPublish: false,
    active: true,
  },
]

const TIKTOK_SOURCE_BY_AUTHOR: Record<string, string> = {
  '@pitchingninja': 'pitching-ninja-tiktok',
  '@bsf_pitchingperformance': 'bsf-pitching-performance',
  '@ncaabsb': 'ncaa-baseball-tiktok',
}

function sourceById(id: string): ExternalSource {
  const source = EXTERNAL_SOURCES.find((candidate) => candidate.id === id)
  if (!source) throw new Error(`Unknown external source: ${id}`)
  return source
}

function tags(
  pitchSlugs: string[] = [],
  craftsmanSlugs: string[] = [],
  families: RepertoireFamily[] = [],
  topics: string[] = [],
): ExternalContentTags {
  return { pitchSlugs, craftsmanSlugs, families, topics }
}

function tiktokItems(): ExternalContentItem[] {
  return TEACHING_CLIPS.map((clip, index) => {
    const source = sourceById(TIKTOK_SOURCE_BY_AUTHOR[clip.author])
    const families: RepertoireFamily[] = clip.slugs.some((slug) =>
      ['four-seam', 'two-seam'].includes(slug),
    )
      ? ['fastball']
      : clip.slugs.includes('slider')
        ? ['breaking']
        : ['offspeed']
    return {
      id: clip.id,
      platform: 'tiktok',
      externalId: clip.videoId,
      canonicalUrl: clip.url,
      sourceId: source.id,
      sourceName: source.name,
      sourceHandle: source.handle,
      sourceUrl: source.canonicalUrl,
      title: clip.title,
      lede: clip.lede,
      sourceCaption: clip.caption,
      publishedAt: clip.retrievedAt,
      retrievedAt: clip.retrievedAt,
      tags: tags(clip.slugs, clip.craftsmanSlugs ?? [], families, ['grip', 'teaching']),
      trustLane: source.trustLane,
      moderationState: 'published',
      availability: 'available',
      embedMode: 'official-embed',
      featured: index !== 1,
    }
  })
}

const PITCHING_NINJA_X = sourceById('pitching-ninja-x')

const X_ITEMS: ExternalContentItem[] = [
  {
    id: 'rivera-cutter-teaching',
    platform: 'x',
    externalId: '1061649568847269889',
    canonicalUrl: 'https://x.com/PitchingNinja/status/1061649568847269889',
    sourceId: PITCHING_NINJA_X.id,
    sourceName: PITCHING_NINJA_X.name,
    sourceHandle: PITCHING_NINJA_X.handle,
    sourceUrl: PITCHING_NINJA_X.canonicalUrl,
    title: 'Rivera passes the cutter hand to hand',
    lede:
      'Mariano Rivera walks Roy Halladay and Scott Kazmir through the cutter grip itself: pitching knowledge preserved as a lesson, not flattened into a stat line.',
    publishedAt: '2018-11-11',
    retrievedAt: '2026-06-09',
    tags: tags(['cutter'], ['mariano-rivera'], ['fastball'], ['grip', 'heritage', 'teaching']),
    trustLane: 'heritage',
    moderationState: 'published',
    availability: 'available',
    embedMode: 'official-embed',
    featured: true,
  },
  {
    id: 'verlander-four-seam-teaching',
    platform: 'x',
    externalId: '1016866886863278080',
    canonicalUrl: 'https://x.com/PitchingNinja/status/1016866886863278080',
    sourceId: PITCHING_NINJA_X.id,
    sourceName: PITCHING_NINJA_X.name,
    sourceHandle: PITCHING_NINJA_X.handle,
    sourceUrl: PITCHING_NINJA_X.canonicalUrl,
    title: 'Verlander shows the four-seam grip and release',
    lede:
      'A credited teaching clip filed beside the four-seam specimen so the grip, release, and spin-axis conversation can stay connected.',
    publishedAt: '2018-07-11',
    retrievedAt: '2026-06-09',
    tags: tags(['four-seam'], ['justin-verlander'], ['fastball'], ['grip', 'release', 'teaching']),
    trustLane: 'trusted-mind',
    moderationState: 'published',
    availability: 'available',
    embedMode: 'official-embed',
  },
  {
    id: 'pedro-cutter-grip',
    platform: 'x',
    externalId: '972128267888222209',
    canonicalUrl: 'https://x.com/PitchingNinja/status/972128267888222209',
    sourceId: PITCHING_NINJA_X.id,
    sourceName: PITCHING_NINJA_X.name,
    sourceHandle: PITCHING_NINJA_X.handle,
    sourceUrl: PITCHING_NINJA_X.canonicalUrl,
    title: 'Pedro Martínez on the cutter grip',
    lede:
      'A master explaining the hold in his own terms, kept with its original post and filed where a cutter reader can use it.',
    publishedAt: '2018-03-09',
    retrievedAt: '2026-06-09',
    tags: tags(['cutter'], ['pedro-martinez'], ['fastball'], ['grip', 'heritage', 'teaching']),
    trustLane: 'heritage',
    moderationState: 'published',
    availability: 'available',
    embedMode: 'official-embed',
  },
]

export const EXTERNAL_CONTENT_ITEMS: ExternalContentItem[] = [...tiktokItems(), ...X_ITEMS]

export interface ExternalContentQuery {
  placement?: 'home' | 'repertoire' | 'grips'
  pitchSlug?: string
  craftsmanSlug?: string
  family?: RepertoireFamily
  topics?: string[]
  limit?: number
}

export function externalContentFor(
  query: ExternalContentQuery,
  items: ExternalContentItem[] = EXTERNAL_CONTENT_ITEMS,
): ExternalContentItem[] {
  const requestedTopics = new Set(query.topics ?? [])
  const matches = items.filter((item) => {
    if (item.moderationState !== 'published' || item.availability === 'removed') return false
    if (query.placement === 'home') return item.featured === true
    if (query.placement === 'repertoire') return item.featured === true || item.tags.families.length > 0
    if (query.placement === 'grips') return item.tags.topics.includes('grip')
    if (query.pitchSlug && item.tags.pitchSlugs.includes(query.pitchSlug)) return true
    if (query.craftsmanSlug && item.tags.craftsmanSlugs.includes(query.craftsmanSlug)) return true
    if (query.family && item.tags.families.includes(query.family)) return true
    if (requestedTopics.size > 0 && item.tags.topics.some((topic) => requestedTopics.has(topic))) return true
    return false
  })

  return matches
    .sort((a, b) => Date.parse(b.publishedAt) - Date.parse(a.publishedAt))
    .slice(0, query.limit ?? matches.length)
}

export function platformLabel(platform: ExternalPlatform): string {
  if (platform === 'x') return 'X'
  if (platform === 'youtube') return 'YouTube'
  if (platform === 'instagram') return 'Instagram'
  return 'TikTok'
}

export function officialEmbedUrl(item: ExternalContentItem, autoplay = false): string | null {
  if (item.embedMode !== 'official-embed') return null
  if (item.platform === 'tiktok') {
    return `https://www.tiktok.com/player/v1/${item.externalId}?rel=0&description=0&music_info=0&autoplay=${autoplay ? 1 : 0}`
  }
  if (item.platform === 'x') {
    return `https://platform.twitter.com/embed/Tweet.html?id=${item.externalId}&dnt=true&theme=dark`
  }
  if (item.platform === 'youtube') {
    return `https://www.youtube-nocookie.com/embed/${item.externalId}?rel=0&autoplay=${autoplay ? 1 : 0}`
  }
  if (item.platform === 'instagram') {
    const kind = item.canonicalUrl.includes('/reel/') ? 'reel' : 'p'
    return `https://www.instagram.com/${kind}/${item.externalId}/embed/`
  }
  return null
}

export function platformFromUrl(value: string): ExternalPlatform | null {
  let url: URL
  try {
    url = new URL(value)
  } catch {
    return null
  }
  const host = url.hostname.replace(/^www\./, '').toLowerCase()
  if (host === 'tiktok.com' || host.endsWith('.tiktok.com')) return 'tiktok'
  if (host === 'x.com' || host === 'twitter.com') return 'x'
  if (host === 'instagram.com') return 'instagram'
  if (host === 'youtube.com' || host === 'youtu.be') return 'youtube'
  return null
}

export function externalIdFromUrl(value: string, platform = platformFromUrl(value)): string | null {
  if (!platform) return null
  const url = new URL(value)
  if (platform === 'tiktok' || platform === 'x') {
    return url.pathname.match(/\/(?:video|status)\/(\d+)/)?.[1] ?? null
  }
  if (platform === 'instagram') {
    return url.pathname.match(/\/(?:p|reel)\/([^/]+)/)?.[1] ?? null
  }
  if (url.hostname.replace(/^www\./, '') === 'youtu.be') return url.pathname.split('/').filter(Boolean)[0] ?? null
  return url.searchParams.get('v') ?? url.pathname.match(/\/shorts\/([^/]+)/)?.[1] ?? null
}
