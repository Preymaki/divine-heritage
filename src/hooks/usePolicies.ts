/**
 * usePolicies
 *
 * React hook for the Policies CMS feature.
 *
 * Provides:
 *  - Real-time Firestore subscription (all items for admin)
 *  - addPolicy    — create a new policy
 *  - updatePolicy — edit title / content / status
 *  - deletePolicy — remove from Firestore
 *  - togglePublish — flip isPublished
 *  - moveUp / moveDown — adjust order
 *  - seedPolicies — one-time seed of existing content
 */

import { useState, useEffect, useCallback } from 'react'
import {
  subscribeToPolicies,
  addPolicy as serviceAdd,
  updatePolicy as serviceUpdate,
  deletePolicy as serviceDelete,
  reorderPolicies,
  seedPolicies as serviceSeed,
} from '@services/policies'
import type { Policy, PolicyInput, PolicyPatch, ActionState } from '@appTypes/policy'

// ---------------------------------------------------------------------------
// Initial state
// ---------------------------------------------------------------------------

const INITIAL_ACTION: ActionState = { phase: 'idle', error: null }

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export function usePolicies() {
  const [policies,    setPolicies]    = useState<Policy[]>([])
  const [loading,     setLoading]     = useState(true)
  const [error,       setError]       = useState<string | null>(null)
  const [actionState, setActionState] = useState<ActionState>(INITIAL_ACTION)
  const [seedState,   setSeedState]   = useState<ActionState>(INITIAL_ACTION)

  // ── Real-time Firestore subscription ──────────────────────────────────────
  useEffect(() => {
    const unsub = subscribeToPolicies(
      (data) => { setPolicies(data); setLoading(false) },
      (err)  => { setError(err.message); setLoading(false) },
    )
    return unsub
  }, [])

  // ── Add ───────────────────────────────────────────────────────────────────
  const addPolicy = useCallback(async (input: PolicyInput) => {
    setActionState({ phase: 'pending', error: null })
    try {
      await serviceAdd(input)
      setActionState({ phase: 'success', error: null })
    } catch (err: unknown) {
      setActionState({
        phase: 'error',
        error: err instanceof Error ? err.message : 'Could not add policy.',
      })
    }
  }, [])

  // ── Update ────────────────────────────────────────────────────────────────
  const updatePolicy = useCallback(async (id: string, patch: PolicyPatch) => {
    setActionState({ phase: 'pending', error: null })
    try {
      await serviceUpdate(id, patch)
      setActionState({ phase: 'success', error: null })
    } catch (err: unknown) {
      setActionState({
        phase: 'error',
        error: err instanceof Error ? err.message : 'Could not update policy.',
      })
    }
  }, [])

  // ── Delete ────────────────────────────────────────────────────────────────
  const deletePolicy = useCallback(async (id: string) => {
    setActionState({ phase: 'pending', error: null })
    try {
      await serviceDelete(id)
      setActionState({ phase: 'success', error: null })
    } catch (err: unknown) {
      setActionState({
        phase: 'error',
        error: err instanceof Error ? err.message : 'Could not delete policy.',
      })
    }
  }, [])

  // ── Toggle publish ────────────────────────────────────────────────────────
  const togglePublish = useCallback(async (policy: Policy) => {
    setActionState({ phase: 'pending', error: null })
    try {
      await serviceUpdate(policy.id, { isPublished: !policy.isPublished })
      setActionState({ phase: 'success', error: null })
    } catch (err: unknown) {
      setActionState({
        phase: 'error',
        error: err instanceof Error ? err.message : 'Could not update visibility.',
      })
    }
  }, [])

  // ── Move up ───────────────────────────────────────────────────────────────
  const moveUp = useCallback(async (policy: Policy) => {
    const idx = policies.findIndex((p) => p.id === policy.id)
    if (idx <= 0) return
    const newOrder = [...policies]
    ;[newOrder[idx - 1], newOrder[idx]] = [newOrder[idx], newOrder[idx - 1]]
    try {
      await reorderPolicies(newOrder.map((p) => p.id))
    } catch (err: unknown) {
      console.error('[usePolicies] moveUp error:', err)
    }
  }, [policies])

  // ── Move down ─────────────────────────────────────────────────────────────
  const moveDown = useCallback(async (policy: Policy) => {
    const idx = policies.findIndex((p) => p.id === policy.id)
    if (idx < 0 || idx >= policies.length - 1) return
    const newOrder = [...policies]
    ;[newOrder[idx], newOrder[idx + 1]] = [newOrder[idx + 1], newOrder[idx]]
    try {
      await reorderPolicies(newOrder.map((p) => p.id))
    } catch (err: unknown) {
      console.error('[usePolicies] moveDown error:', err)
    }
  }, [policies])

  // ── Seed ──────────────────────────────────────────────────────────────────
  const seedPolicies = useCallback(async () => {
    setSeedState({ phase: 'pending', error: null })
    try {
      await serviceSeed()
      setSeedState({ phase: 'success', error: null })
    } catch (err: unknown) {
      setSeedState({
        phase: 'error',
        error: err instanceof Error ? err.message : 'Seed failed.',
      })
    }
  }, [])

  const resetAction = useCallback(() => setActionState(INITIAL_ACTION), [])

  return {
    policies,
    loading,
    error,
    actionState,
    seedState,
    addPolicy,
    updatePolicy,
    deletePolicy,
    togglePublish,
    moveUp,
    moveDown,
    seedPolicies,
    resetAction,
  }
}
