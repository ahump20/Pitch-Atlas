import { supabase } from './supabase'
import { ensureSession, getSessionUserId } from './community'
import { DISCUSSION_LIMITS } from '../data/discussion'

/*
  The discussion-forum data layer. Pure functions over Supabase; React lives in the
  hook. A post is a comment; a reply is a post with a parent (one level deep). Media
  is uploaded to a private bucket and served through short-lived signed URLs, so a
  hidden item stops being reachable when its row flips. Every write rides the
  signed-in account (anonymous or claimed). The database re-enforces every rule
  here (banned terms, rate limits, size/mime, the upload-terms gate); this layer is
  the friendly front of those guards, never the guard itself.
*/

const BUCKET = 'discussion-media'
const SIGN_TTL = 3600 // seconds a media URL stays valid before a reload re-signs it

export type MediaKind = 'image' | 'video'

export interface DiscussionMedia {
  id: string
  kind: MediaKind
  url: string | null // signed URL, or null if it could not be signed (hidden / expired)
  width: number | null
  height: number | null
}

export interface DiscussionPost {
  id: string
  topicKey: string
  authorId: string
  displayName: string
  body: string
  createdAt: string
  viewerIsAuthor: boolean
  media: DiscussionMedia[]
  replies: DiscussionPost[]
}

export interface NewPost {
  topicKey: string
  displayName: string
  body: string
  parentId?: string | null
}

interface PostRow {
  id: string
  topic_key: string
  author_id: string
  display_name: string
  parent_id: string | null
  body: string
  created_at: string
}

interface MediaRow {
  id: string
  post_id: string
  storage_path: string
  kind: MediaKind
  width: number | null
  height: number | null
}

interface MediaPathRow {
  storage_path: string | null
}

/** Turn a Postgres/PostgREST error into a sentence a contributor can act on. */
export function friendlyError(error: { message?: string } | null): string {
  const raw = error?.message ?? ''
  for (const tag of ['content_blocked:', 'rate_limit:', 'media_blocked:', 'too_deep:', 'invalid_parent:']) {
    if (raw.includes(tag)) return raw.split(tag)[1]?.trim() || raw
  }
  return raw || 'Could not save that just now. Try again.'
}

/* ------------------------------------------------------------------ media */

interface SniffedMediaType {
  kind: MediaKind
  mime: string
  extension: string
}

const MAGIC: { sig: number[]; offset: number; type: SniffedMediaType }[] = [
  { sig: [0xff, 0xd8, 0xff], offset: 0, type: { kind: 'image', mime: 'image/jpeg', extension: 'jpg' } },
  { sig: [0x89, 0x50, 0x4e, 0x47], offset: 0, type: { kind: 'image', mime: 'image/png', extension: 'png' } },
  { sig: [0x47, 0x49, 0x46, 0x38], offset: 0, type: { kind: 'image', mime: 'image/gif', extension: 'gif' } },
  { sig: [0x52, 0x49, 0x46, 0x46], offset: 0, type: { kind: 'image', mime: 'image/webp', extension: 'webp' } },
  { sig: [0x66, 0x74, 0x79, 0x70], offset: 4, type: { kind: 'video', mime: 'video/mp4', extension: 'mp4' } },
  { sig: [0x1a, 0x45, 0xdf, 0xa3], offset: 0, type: { kind: 'video', mime: 'video/webm', extension: 'webm' } },
]

/**
 * Sniff the real file type from its leading bytes, so a renamed .exe or an SVG
 * (an XSS vector, deliberately excluded) is rejected regardless of its extension
 * or declared type. Returns the detected kind, or null if nothing matches.
 */
export async function sniffMediaType(file: File): Promise<SniffedMediaType | null> {
  const buf = new Uint8Array(await file.slice(0, 16).arrayBuffer())
  for (const m of MAGIC) {
    if (m.sig.every((b, i) => buf[m.offset + i] === b)) {
      if (m.type.mime === 'image/webp') {
        // RIFF container: confirm it is WEBP at offset 8
        const webp = [0x57, 0x45, 0x42, 0x50]
        if (!webp.every((b, i) => buf[8 + i] === b)) continue
      }
      if (m.type.mime === 'video/mp4') {
        const brand = String.fromCharCode(...buf.slice(8, 12))
        if (brand === 'qt  ') return { kind: 'video', mime: 'video/quicktime', extension: 'mov' }
      }
      return m.type
    }
  }
  return null
}

export async function sniffMediaKind(file: File): Promise<MediaKind | null> {
  return (await sniffMediaType(file))?.kind ?? null
}

async function readImageDims(file: File): Promise<{ width: number | null; height: number | null }> {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(file)
    const img = new Image()
    img.onload = () => {
      URL.revokeObjectURL(url)
      resolve({ width: img.naturalWidth || null, height: img.naturalHeight || null })
    }
    img.onerror = () => {
      URL.revokeObjectURL(url)
      resolve({ width: null, height: null })
    }
    img.src = url
  })
}

/**
 * Validate a file against the same rules the DB enforces, then upload to the
 * owner's folder and record the row. Order matters: the storage object lands
 * first, then the row points at it; if the row insert fails, the object is
 * removed so nothing is orphaned.
 */
export async function uploadMedia(postId: string, topicKey: string, file: File): Promise<void> {
  const uid = await ensureSession()
  const mediaType = await sniffMediaType(file)
  if (!mediaType) throw new Error('That file is not an allowed image or video.')
  const { kind, mime, extension } = mediaType
  const cap = kind === 'image' ? DISCUSSION_LIMITS.imageMaxBytes : DISCUSSION_LIMITS.videoMaxBytes
  if (file.size > cap) {
    throw new Error(kind === 'image' ? 'Images must be under 8 MB.' : 'Videos must be under 50 MB.')
  }

  const path = `${uid}/${crypto.randomUUID()}.${extension}`
  const { error: upErr } = await supabase.storage
    .from(BUCKET)
    .upload(path, file, { contentType: mime, upsert: false })
  if (upErr) throw new Error(friendlyError(upErr))

  const dims = kind === 'image' ? await readImageDims(file) : { width: null, height: null }
  const { error } = await supabase.from('discussion_media').insert({
    post_id: postId,
    topic_key: topicKey,
    storage_path: path,
    mime_type: mime,
    kind,
    byte_size: file.size,
    width: dims.width,
    height: dims.height,
  })
  if (error) {
    // roll back the orphaned object so a failed row never leaves bytes behind
    await supabase.storage.from(BUCKET).remove([path])
    throw new Error(friendlyError(error))
  }
}

/* ------------------------------------------------------------------ reads */

async function signMedia(rows: MediaRow[]): Promise<Map<string, DiscussionMedia[]>> {
  const byPost = new Map<string, DiscussionMedia[]>()
  if (rows.length === 0) return byPost

  const paths = rows.map((r) => r.storage_path)
  const { data: signed } = await supabase.storage.from(BUCKET).createSignedUrls(paths, SIGN_TTL)
  const urlByPath = new Map<string, string>()
  for (const s of signed ?? []) {
    if (s.signedUrl && s.path) urlByPath.set(s.path, s.signedUrl)
  }

  for (const r of rows) {
    const item: DiscussionMedia = {
      id: r.id,
      kind: r.kind,
      url: urlByPath.get(r.storage_path) ?? null,
      width: r.width,
      height: r.height,
    }
    const list = byPost.get(r.post_id) ?? []
    list.push(item)
    byPost.set(r.post_id, list)
  }
  return byPost
}

/**
 * The full thread for one topic: top-level posts newest-first, each with its media
 * and its one level of replies (oldest-first, the natural reading order). RLS drops
 * hidden posts and hidden media, so what returns is the public set.
 */
export async function listThread(topicKey: string): Promise<DiscussionPost[]> {
  // Reading is anonymous: no session is created here. The anon role can SELECT
  // visible posts and media (and sign their URLs); with no session the viewer
  // simply owns nothing.
  const viewerId = await getSessionUserId()

  const { data: rows, error } = await supabase
    .from('discussion_posts')
    .select('id, topic_key, author_id, display_name, parent_id, body, created_at')
    .eq('topic_key', topicKey)
    .order('created_at', { ascending: true })
  if (error) throw error

  const postRows = (rows ?? []) as PostRow[]
  const ids = postRows.map((p) => p.id)

  let mediaByPost = new Map<string, DiscussionMedia[]>()
  if (ids.length > 0) {
    const { data: mediaRows } = await supabase
      .from('discussion_media')
      .select('id, post_id, storage_path, kind, width, height')
      .in('post_id', ids)
    mediaByPost = await signMedia((mediaRows ?? []) as MediaRow[])
  }

  const toPost = (r: PostRow): DiscussionPost => ({
    id: r.id,
    topicKey: r.topic_key,
    authorId: r.author_id,
    displayName: r.display_name,
    body: r.body,
    createdAt: r.created_at,
    viewerIsAuthor: viewerId !== null && r.author_id === viewerId,
    media: mediaByPost.get(r.id) ?? [],
    replies: [],
  })

  const byId = new Map<string, DiscussionPost>()
  const roots: DiscussionPost[] = []
  for (const r of postRows) byId.set(r.id, toPost(r))
  for (const r of postRows) {
    const node = byId.get(r.id)!
    if (r.parent_id && byId.has(r.parent_id)) {
      byId.get(r.parent_id)!.replies.push(node)
    } else if (!r.parent_id) {
      roots.push(node)
    }
  }
  // top-level newest first; replies kept oldest-first (already, by query order)
  roots.reverse()
  return roots
}

/* ------------------------------------------------------------------ writes */

/** Create a post or a reply. Saves the handle to the profile for next time. */
export async function createPost(input: NewPost): Promise<string> {
  const uid = await ensureSession()
  await supabase.from('profiles').update({ display_name: input.displayName }).eq('id', uid)

  const { data, error } = await supabase
    .from('discussion_posts')
    .insert({
      topic_key: input.topicKey,
      display_name: input.displayName,
      body: input.body,
      parent_id: input.parentId ?? null,
    })
    .select('id')
    .single()
  if (error) throw new Error(friendlyError(error))
  return (data as { id: string }).id
}

export async function reportPost(postId: string, reason: string): Promise<void> {
  await ensureSession()
  const { error } = await supabase.from('discussion_reports').insert({ post_id: postId, reason })
  if (error && error.code !== '23505') throw new Error(friendlyError(error))
}

export async function reportMedia(mediaId: string, reason: string): Promise<void> {
  await ensureSession()
  const { error } = await supabase.from('discussion_reports').insert({ media_id: mediaId, reason })
  if (error && error.code !== '23505') throw new Error(friendlyError(error))
}

export async function deletePost(postId: string): Promise<void> {
  const uid = await ensureSession()
  const { data: mediaRows, error: mediaErr } = await supabase
    .from('discussion_media')
    .select('storage_path')
    .eq('post_id', postId)
  if (mediaErr) throw new Error(friendlyError(mediaErr))

  const ownPaths = ((mediaRows ?? []) as MediaPathRow[])
    .map((row) => row.storage_path)
    .filter((path): path is string => typeof path === 'string' && path.startsWith(`${uid}/`))

  const { error } = await supabase.from('discussion_posts').delete().eq('id', postId)
  if (error) throw new Error(friendlyError(error))
  if (ownPaths.length > 0) {
    // The row delete is what hides the post; storage cleanup removes the now-unreferenced bytes.
    await supabase.storage.from(BUCKET).remove(ownPaths)
  }
}

/* ------------------------------------------------------------- terms gate */

/**
 * Has this account accepted the media-upload terms? Acceptance lives in its own
 * table (anonymous users cannot update their profile row, so it cannot live there).
 */
export async function hasAcceptedMediaTerms(): Promise<boolean> {
  // A read with no session is always "no": there is no account to have accepted
  // anything, and asking would either mint an account or 403 on the anon role.
  if ((await getSessionUserId()) === null) return false
  const { data } = await supabase.from('discussion_media_terms').select('user_id').maybeSingle()
  return Boolean(data)
}

/** Record the contributor's acceptance of the upload terms (timestamped, one row per account). */
export async function acceptMediaTerms(): Promise<void> {
  await ensureSession()
  const { error } = await supabase.from('discussion_media_terms').insert({})
  // 23505 = already accepted (one row per user); treat as success
  if (error && error.code !== '23505') throw new Error(friendlyError(error))
}
