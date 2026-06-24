import { supabase } from './supabase'
import { getSessionUserId } from './community'

export type MembershipTier = 'free' | 'supporter' | 'pro' | 'founder'
export type MembershipStatus =
  | 'free'
  | 'trialing'
  | 'active'
  | 'past_due'
  | 'canceled'
  | 'incomplete'
  | 'paused'
export type MembershipSource = 'system' | 'manual' | 'stripe' | 'app_store' | null

export interface ViewerMembership {
  userId: string
  tier: MembershipTier
  status: MembershipStatus
  source: MembershipSource
  currentPeriodEnd: string | null
  isMember: boolean
  updatedAt: string | null
  fetchedAt: string
  timezone: 'America/Chicago'
}

interface ViewerMembershipRow {
  user_id: string
  tier: MembershipTier
  status: MembershipStatus
  source: MembershipSource
  current_period_end: string | null
  is_member: boolean
  updated_at: string | null
}

const MEMBERSHIP_READ_ERROR = 'Could not load your member status just now. Try again.'

export function friendlyMembershipReadError(): string {
  return MEMBERSHIP_READ_ERROR
}

function mapMembership(row: ViewerMembershipRow, fetchedAt: string): ViewerMembership {
  return {
    userId: row.user_id,
    tier: row.tier,
    status: row.status,
    source: row.source,
    currentPeriodEnd: row.current_period_end,
    isMember: row.is_member,
    updatedAt: row.updated_at,
    fetchedAt,
    timezone: 'America/Chicago',
  }
}

/**
 * Read the current signed-in user's sanitized membership state. This never mints
 * an anonymous session; no account means no member row to read.
 */
export async function getViewerMembership(): Promise<ViewerMembership | null> {
  if ((await getSessionUserId()) === null) return null

  const fetchedAt = new Date().toISOString()
  const { data, error } = await supabase.rpc('viewer_membership')
  if (error) throw new Error(MEMBERSHIP_READ_ERROR)

  const row = (Array.isArray(data) ? data[0] : data) as ViewerMembershipRow | null | undefined
  return row ? mapMembership(row, fetchedAt) : null
}

export interface MembershipSubscriptionHandlers {
  onChange: (membership: ViewerMembership | null) => void
  onError?: (error: Error) => void
}

/**
 * Watch the viewer's member row for provider/webhook changes. RLS still limits
 * the stream to the signed-in owner; provider ids are not in this table.
 */
export function subscribeToViewerMembership(userId: string, handlers: MembershipSubscriptionHandlers): () => void {
  const channel = supabase
    .channel(`membership:${userId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'memberships',
        filter: `user_id=eq.${userId}`,
      },
      () => {
        void getViewerMembership()
          .then(handlers.onChange)
          .catch((error: unknown) => {
            handlers.onError?.(error instanceof Error ? error : new Error(MEMBERSHIP_READ_ERROR))
          })
      },
    )
    .subscribe((status) => {
      if (status === 'CHANNEL_ERROR') {
        handlers.onError?.(new Error(MEMBERSHIP_READ_ERROR))
      }
    })

  return () => {
    void supabase.removeChannel(channel)
  }
}
