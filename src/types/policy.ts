/**
 * Policy Types
 *
 * Shared TypeScript interfaces for the Policies CMS feature.
 * These types mirror the Firestore `policies` collection schema exactly.
 */

import type { Timestamp } from 'firebase/firestore'

// ---------------------------------------------------------------------------
// Firestore document shape
// ---------------------------------------------------------------------------

/**
 * A policy document as stored in Firestore.
 * The `id` field is the Firestore document ID, attached by the service layer.
 */
export interface Policy {
  id: string

  /** Display title, e.g. "Emergency Policy" */
  title: string

  /**
   * Full policy text. Plain text with paragraph breaks (\n\n).
   * Lines starting with "- " are bullet points.
   * Lines starting with "N. " (digit + dot) are numbered list items.
   */
  content: string

  /** Manual sort order — lower numbers appear first on the public page */
  order: number

  /** When true, the policy appears on the public-facing /policies page */
  isPublished: boolean

  /** Firestore server timestamp — set on creation */
  createdAt: Timestamp | null

  /** Firestore server timestamp — updated on every write */
  updatedAt: Timestamp | null
}

// ---------------------------------------------------------------------------
// Input / patch types
// ---------------------------------------------------------------------------

/** Fields required to create a new policy */
export type PolicyInput = Omit<Policy, 'id' | 'createdAt' | 'updatedAt'>

/** Fields that can be changed via the edit form (all optional) */
export type PolicyPatch = Partial<PolicyInput>

// ---------------------------------------------------------------------------
// UI action state
// ---------------------------------------------------------------------------

export type ActionPhase = 'idle' | 'pending' | 'success' | 'error'

export interface ActionState {
  phase: ActionPhase
  error: string | null
}
