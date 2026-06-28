import type { HTMLAttributes, ReactNode } from 'react'
import { cn } from '@/lib/utils'
import type { ClaimConfidence } from '../../data/types'
import { ConfidenceDot } from '../provenance/RefractorClaim'

/**
 * Pitch Atlas ScoutRow — one sourced fact row on the scout-file back. One
 * component over the app's existing `.rfx-scout-row / -k / -v` treatment, so
 * adoption preserves parity rather than reskinning: the label fills the mono
 * key column, the children fill the value column. The row is a `<div>` with two
 * `<span>` children in a 56px / 1fr grid; callers wrap a run of rows in the
 * `.rfx-scout` / `.pa-scout` container.
 *
 * When a `tier` is given, the existing ConfidenceDot trails the value inside the
 * value cell — the same `inline-flex … gap-1.5` the live Source row already uses
 * (ChromeWall), so the dot stays inline instead of dropping into the grid's
 * implicit second row. The component adds no styling of its own.
 *
 * `tier` is the four-value shorthand a scout row needs; it maps onto the full
 * ClaimConfidence vocabulary the provenance dot already speaks, so the dot's
 * color, label, and meaning remain the single source of truth.
 */
export type ScoutTier = 'official' | 'reputable' | 'secondhand' | 'unverified'

const TIER_CONFIDENCE: Record<ScoutTier, ClaimConfidence> = {
  official: 'official-data',
  reputable: 'reputable-analysis',
  secondhand: 'secondhand-attributed',
  unverified: 'unverified',
}

export interface ScoutRowProps extends HTMLAttributes<HTMLDivElement> {
  /** The fact's name, rendered in the mono key column. */
  label: string
  /** Optional source tier; when set, the provenance dot trails the value. */
  tier?: ScoutTier
  /** The sourced value. */
  children: ReactNode
}

export function ScoutRow({ label, tier, children, className, ...rest }: ScoutRowProps) {
  return (
    <div className={cn('rfx-scout-row', className)} {...rest}>
      <span className="rfx-scout-k">{label}</span>
      <span className={cn('rfx-scout-v', tier && 'inline-flex flex-wrap items-center gap-1.5')}>
        {children}
        {tier ? <ConfidenceDot confidence={TIER_CONFIDENCE[tier]} /> : null}
      </span>
    </div>
  )
}
