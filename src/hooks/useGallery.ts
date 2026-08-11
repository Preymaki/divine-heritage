/**
 * useGallery
 *
 * React hook for the Gallery CMS feature.
 *
 * Provides:
 *  - Real-time Firestore subscription (all items for admin)
 *  - uploadImage — upload file + save metadata
 *  - updateItem  — edit title / alt / caption / group / sortOrder / publish status
 *  - deleteItem  — remove Firestore doc + Storage file (if applicable)
 *  - togglePublish — convenience flip on isPublished
 *  - seedGallery — one-time seed of the 19 original hardcoded images
 */

import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@hooks/useAuth'
import {
  uploadGalleryImage,
  updateGalleryItem,
  deleteGalleryItem,
  replaceGalleryImage,
  subscribeToGallery,
  seedGallery,
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
  seedState: ActionState

  uploadImage:   (file: File, meta: GalleryItemInput) => Promise<void>
  replaceImage:  (id: string, oldStoragePath: string | null, newFile: File) => Promise<void>
  updateItem:    (id: string, patch: GalleryItemPatch) => Promise<void>
  deleteItem:    (id: string, storagePath: string | null) => Promise<void>
  togglePublish: (item: GalleryItem) => Promise<void>
  seedItems:     () => Promise<void>

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
  const [seedState,   setSeedState]   = useState<ActionState>(INITIAL_ACTION)

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

  // ── Replace image ─────────────────────────────────────────────────────────
  const replaceImage = useCallback(async (
    id: string,
    oldStoragePath: string | null,
    newFile: File,
  ) => {
    if (!user?.email) {
      setUploadState({ phase: 'error', progress: 0, error: 'You must be signed in to replace an image.' })
      return
    }
    setUploadState({ phase: 'uploading', progress: 0, error: null })
    try {
      await replaceGalleryImage(id, oldStoragePath, newFile, (progress) => {
        setUploadState((prev) => ({ ...prev, progress }))
      })
      setUploadState({ phase: 'success', progress: 100, error: null })
    } catch (err: unknown) {
      setUploadState({
        phase: 'error',
        progress: 0,
        error: err instanceof Error ? err.message : 'Image replacement failed.',
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
  const deleteItem = useCallback(async (id: string, storagePath: string | null) => {
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

  // ── Seed ──────────────────────────────────────────────────────────────────
  const seedItems = useCallback(async () => {
    if (!user?.email) {
      setSeedState({ phase: 'error', error: 'You must be signed in to seed the gallery.' })
      return
    }
    setSeedState({ phase: 'pending', error: null })
    try {
      await seedGallery(user.email)
      setSeedState({ phase: 'success', error: null })
    } catch (err: unknown) {
      setSeedState({
        phase: 'error',
        error: err instanceof Error ? err.message : 'Seed failed.',
      })
    }
  }, [user?.email])

  const resetUpload = useCallback(() => setUploadState(INITIAL_UPLOAD), [])
  const resetAction = useCallback(() => setActionState(INITIAL_ACTION), [])

  return {
    items, loading, error,
    uploadState, actionState, seedState,
    uploadImage, replaceImage, updateItem, deleteItem, togglePublish, seedItems,
    resetUpload, resetAction,
  }
}
