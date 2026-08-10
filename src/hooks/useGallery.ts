/**
 * useGallery
 *
 * React hook for the Gallery CMS feature.
 *
 * Provides:
 *  - Real-time Firestore subscription (all items for admin)
 *  - uploadImage — upload file + save metadata
 *  - updateItem  — edit title / alt / caption / publish status
 *  - deleteItem  — remove Firestore doc + Storage file
 *  - togglePublish — convenience flip on isPublished
 */

import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@hooks/useAuth'
import {
  uploadGalleryImage,
  updateGalleryItem,
  deleteGalleryItem,
  subscribeToGallery,
} from '@services/gallery'
import type {
  GalleryItem,
  GalleryItemInput,
  GalleryItemPatch,
  UploadState,
  ActionState,
} from '@appTypes/gallery'

// ---------------------------------------------------------------------------
// Hook return type
// ---------------------------------------------------------------------------

export interface UseGalleryReturn {
  items: GalleryItem[]
  loading: boolean
  error: string | null

  uploadState: UploadState
  actionState: ActionState

  uploadImage:   (file: File, meta: GalleryItemInput) => Promise<void>
  updateItem:    (id: string, patch: GalleryItemPatch) => Promise<void>
  deleteItem:    (id: string, storagePath: string) => Promise<void>
  togglePublish: (item: GalleryItem) => Promise<void>

  resetUpload: () => void
  resetAction: () => void
}

// ---------------------------------------------------------------------------
// Initial states
// ---------------------------------------------------------------------------

const INITIAL_UPLOAD: UploadState = { phase: 'idle', progress: 0, error: null }
const INITIAL_ACTION: ActionState = { phase: 'idle', error: null }

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export function useGallery(): UseGalleryReturn {
  const { user } = useAuth()

  const [items,       setItems]       = useState<GalleryItem[]>([])
  const [loading,     setLoading]     = useState(true)
  const [error,       setError]       = useState<string | null>(null)
  const [uploadState, setUploadState] = useState<UploadState>(INITIAL_UPLOAD)
  const [actionState, setActionState] = useState<ActionState>(INITIAL_ACTION)

  // ── Real-time Firestore subscription ──────────────────────────────────────
  useEffect(() => {
    const unsub = subscribeToGallery(
      (data) => { setItems(data); setLoading(false) },
      (err)  => { setError(err.message); setLoading(false) },
    )
    return unsub
  }, [])

  // ── Upload ────────────────────────────────────────────────────────────────
  const uploadImage = useCallback(async (file: File, meta: GalleryItemInput) => {
    if (!user?.email) {
      setUploadState({ phase: 'error', progress: 0, error: 'You must be signed in to upload.' })
      return
    }
    setUploadState({ phase: 'uploading', progress: 0, error: null })
    try {
      await uploadGalleryImage(file, meta, user.email, (progress) => {
        setUploadState((prev) => ({ ...prev, progress }))
      })
      setUploadState({ phase: 'saving', progress: 100, error: null })
      setTimeout(() => setUploadState({ phase: 'success', progress: 100, error: null }), 600)
    } catch (err: unknown) {
      setUploadState({
        phase: 'error',
        progress: 0,
        error: err instanceof Error ? err.message : 'Upload failed.',
      })
    }
  }, [user?.email])

  // ── Update ────────────────────────────────────────────────────────────────
  const updateItem = useCallback(async (id: string, patch: GalleryItemPatch) => {
    setActionState({ phase: 'pending', error: null })
    try {
      await updateGalleryItem(id, patch)
      setActionState({ phase: 'success', error: null })
    } catch (err: unknown) {
      setActionState({
        phase: 'error',
        error: err instanceof Error ? err.message : 'Update failed.',
      })
    }
  }, [])

  // ── Delete ────────────────────────────────────────────────────────────────
  const deleteItem = useCallback(async (id: string, storagePath: string) => {
    setActionState({ phase: 'pending', error: null })
    try {
      await deleteGalleryItem(id, storagePath)
      setActionState({ phase: 'success', error: null })
    } catch (err: unknown) {
      setActionState({
        phase: 'error',
        error: err instanceof Error ? err.message : 'Delete failed.',
      })
    }
  }, [])

  // ── Publish toggle ────────────────────────────────────────────────────────
  const togglePublish = useCallback(async (item: GalleryItem) => {
    setActionState({ phase: 'pending', error: null })
    try {
      await updateGalleryItem(item.id, { isPublished: !item.isPublished })
      setActionState({ phase: 'success', error: null })
    } catch (err: unknown) {
      setActionState({
        phase: 'error',
        error: err instanceof Error ? err.message : 'Toggle failed.',
      })
    }
  }, [])

  const resetUpload = useCallback(() => setUploadState(INITIAL_UPLOAD), [])
  const resetAction = useCallback(() => setActionState(INITIAL_ACTION), [])

  return {
    items, loading, error,
    uploadState, actionState,
    uploadImage, updateItem, deleteItem, togglePublish,
    resetUpload, resetAction,
  }
}
