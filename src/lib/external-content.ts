import { supabase } from './supabase'
import { ensureSession } from './community'
import {
  EXTERNAL_CONTENT_ITEMS,
  externalContentFor,
  externalIdFromUrl,
  platformFromUrl,
  type ExternalContentItem,
  type ExternalContentQuery,
  type ExternalPlatform,
  type ExternalTrustLane,
} from '../data/media/external'
import type { RepertoireFamily } from '../data/types'

interface ExternalSourceRow {
  id: string
  name: string
  handle: string
  canonical_url: string
  trust_lane: ExternalTrustLane
}

interface ExternalContentRow {
  id: string
  platform: ExternalPlatform
  external_id: string
  canonical_url: string
  source_id: string
  title: string
  lede: string
  source_caption: string | null
  published_at: string
  retrieved_at: string
  pitch_slugs: string[]
  craftsman_slugs: string[]
  families: RepertoireFamily[]
  topics: string[]
  trust_lane: ExternalTrustLane
  moderation_state: ExternalContentItem['moderationState']
  availability: ExternalContentItem['availability']
  embed_mode: ExternalContentItem['embedMode']
  featured: boolean
  external_sources: ExternalSourceRow | ExternalSourceRow[] | null
}

function mapRow(row: ExternalContentRow): ExternalContentItem | null {
  const joined = Array.isArray(row.external_sources) ? row.external_sources[0] : row.external_sources
  if (!joined) return null
  return {
    id: row.id,
    platform: row.platform,
    externalId: row.external_id,
    canonicalUrl: row.canonical_url,
    sourceId: row.source_id,
    sourceName: joined.name,
    sourceHandle: joined.handle,
    sourceUrl: joined.canonical_url,
    title: row.title,
    lede: row.lede,
    sourceCaption: row.source_caption ?? undefined,
    publishedAt: row.published_at,
    retrievedAt: row.retrieved_at,
    tags: {
      pitchSlugs: row.pitch_slugs ?? [],
      craftsmanSlugs: row.craftsman_slugs ?? [],
      families: row.families ?? [],
      topics: row.topics ?? [],
    },
    trustLane: row.trust_lane,
    moderationState: row.moderation_state,
    availability: row.availability,
    embedMode: row.embed_mode,
    featured: row.featured,
  }
}

/**
 * Read the reviewed Supabase shelf when it is available. A preview whose
 * migration has not landed yet falls back to the committed, rights-led seed
 * ledger, so a backend outage never turns route content into a blank module.
 */
export async function listExternalContent(query: ExternalContentQuery): Promise<ExternalContentItem[]> {
  try {
    const result = await supabase
      .from('external_content_items')
      .select(
        'id, platform, external_id, canonical_url, source_id, title, lede, source_caption, published_at, retrieved_at, pitch_slugs, craftsman_slugs, families, topics, trust_lane, moderation_state, availability, embed_mode, featured, external_sources(id, name, handle, canonical_url, trust_lane)',
      )
      .eq('moderation_state', 'published')
      .neq('availability', 'removed')
      .order('published_at', { ascending: false })
      .limit(24)

    if (result.error) return externalContentFor(query)
    const mapped = ((result.data ?? []) as unknown as ExternalContentRow[])
      .map(mapRow)
      .filter((item): item is ExternalContentItem => item !== null)
    return externalContentFor(query, mapped.length > 0 ? mapped : EXTERNAL_CONTENT_ITEMS)
  } catch {
    return externalContentFor(query)
  }
}

export interface ExternalSuggestionInput {
  url: string
  rationale: string
  pitchSlug?: string | null
}

export function validateExternalSuggestion(input: ExternalSuggestionInput): {
  platform: ExternalPlatform
  externalId: string
  canonicalUrl: string
} {
  const canonicalUrl = input.url.trim()
  const platform = platformFromUrl(canonicalUrl)
  const externalId = externalIdFromUrl(canonicalUrl, platform)
  if (!platform || !externalId) {
    throw new Error('Paste a public X, Instagram, TikTok, or YouTube post URL.')
  }
  const rationale = input.rationale.trim()
  if (rationale.length < 10 || rationale.length > 300) {
    throw new Error('Tell us why it belongs in the atlas in 10 to 300 characters.')
  }
  return { platform, externalId, canonicalUrl }
}

export async function submitExternalSuggestion(input: ExternalSuggestionInput): Promise<void> {
  const parsed = validateExternalSuggestion(input)
  const userId = await ensureSession()
  const { error } = await supabase.from('external_content_suggestions').insert({
    submitted_by: userId,
    canonical_url: parsed.canonicalUrl,
    platform: parsed.platform,
    external_id: parsed.externalId,
    rationale: input.rationale.trim(),
    pitch_slug: input.pitchSlug?.trim() || null,
  })
  if (error) {
    if (error.message.includes('rate_limit:')) {
      throw new Error('You have filed several suggestions recently. Try again later.')
    }
    if (error.message.includes('duplicate key')) {
      throw new Error('That post is already in the review queue.')
    }
    throw new Error('Could not file that suggestion just now. Try again.')
  }
}
