/*
  Shared discussion-forum constraints. The client uses these to validate before an
  upload leaves the browser; the database re-checks every one of them in a trigger,
  so these are convenience, not the security boundary. Keep them in lockstep with
  supabase/migrations/20260606090000_discussion_forum.sql.
*/

export const DISCUSSION_LIMITS = {
  bodyMax: 4000,
  displayNameMin: 2,
  displayNameMax: 40,
  maxFilesPerPost: 4,
  imageMaxBytes: 8 * 1024 * 1024,
  videoMaxBytes: 50 * 1024 * 1024,
} as const

export const ALLOWED_IMAGE_MIME = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'] as const
export const ALLOWED_VIDEO_MIME = ['video/mp4', 'video/webm', 'video/quicktime'] as const
export const ALLOWED_MIME = [...ALLOWED_IMAGE_MIME, ...ALLOWED_VIDEO_MIME]

/** The accept attribute for the file picker. */
export const MEDIA_ACCEPT = ALLOWED_MIME.join(',')

/**
 * The upload terms the contributor accepts once per account before any media can
 * be posted. The acceptance is timestamped on the profile and re-checked in the
 * DB trigger, so it is the legal record, not just a UI nicety.
 */
export const UPLOAD_TERMS = [
  'I own this image or video, or it is mine to share.',
  'No copyrighted broadcast or footage I do not own (no MLB or network clips).',
  'Nothing depicting a minor in distress, and nothing abusive or unsafe.',
  'I accept the community standards: posts are shared experience and technique, not personal medical advice, and nothing here replaces a coach or physician.',
] as const
