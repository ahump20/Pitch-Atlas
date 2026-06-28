import type { HTMLAttributes } from 'react'
import { ConfidenceDot } from '../provenance/RefractorClaim'
import type { ClaimConfidence } from '../../data/types'
import { cn } from '@/lib/utils'

/**
 * Pitch Atlas SourceBadge — the provenance label a claim wears on the void: a
 * confidence dot + a mono tier label, with an optional "approx" pill. It reuses
 * the existing ConfidenceDot (which already reads its color + wording from the
 * canonical CONFIDENCE_COLOR / CONFIDENCE_META) and the existing .rfx-approx
 * pill — it invents no colors and never replaces the source-link components.
 */
export type SourceTier =
  | 'official'
  | 'reputable'
  | 'secondhand'
  | 'unverified'
  | 'pitcher-own-words'
  | 'coach-observed'
  | 'community-firsthand'

/** Short tier names (the design vocabulary) → the canonical ClaimConfidence union. */
const TIER_TO_CONFIDENCE: Record<SourceTier, ClaimConfidence> = {
  official: 'official-data',
  reputable: 'reputable-analysis',
  secondhand: 'secondhand-attributed',
  unverified: 'unverified',
  'pitcher-own-words': 'pitcher-own-words',
  'coach-observed': 'coach-observed',
  'community-firsthand': 'community-firsthand',
}

export interface SourceBadgeProps extends HTMLAttributes<HTMLSpanElement> {
  /** Confidence tier — drives the dot color + default label. @default 'official' */
  tier?: SourceTier
  /** Override the displayed label (e.g. the actual source name). Defaults to the tier's canonical name. */
  label?: string
  /** Show the "approx" pill — a real figure that is rounded or era-bound. @default false */
  approximate?: boolean
  className?: string
}

export function SourceBadge({ tier = 'official', label, approximate = false, className, ...rest }: SourceBadgeProps) {
  const confidence = TIER_TO_CONFIDENCE[tier]
  return (
    <span className={cn('inline-flex items-center gap-2', className)} {...rest}>
      <ConfidenceDot confidence={confidence} withLabel={!label} />
      {label ? (
        <span className="font-mono text-[10px] uppercase tracking-[0.1em] text-bone-2">{label}</span>
      ) : null}
      {approximate ? <span className="rfx-approx">≈ approx</span> : null}
    </span>
  )
}
