/**
 * Gallery Service
 *
 * Domain-specific service for the Gallery CMS feature.
 * Composes the generic firestore.ts and storage.ts utilities into
 * higher-level operations that the UI layer consumes.
 *
 * Collection: `gallery`
 * Storage folder: `gallery/`
 */

import {
  collection,
  query,
  orderBy,
  where,
  onSnapshot,
  type Unsubscribe,
} from 'firebase/firestore'
import { db } from '@services/firebase/config'
import { uploadFile, deleteFile, type UploadProgressCallback } from '@services/firebase/storage'
import {
  addDocument,
  updateDocument,
  deleteDocument,
} from '@services/firebase/firestore'
import type { GalleryItem, GalleryItemInput, GalleryItemPatch } from '@appTypes/gallery'

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

export const GALLERY_COLLECTION = 'gallery'
export const GALLERY_STORAGE_FOLDER = 'gallery'

// ---------------------------------------------------------------------------
// Upload — Storage + Firestore in one call
// ---------------------------------------------------------------------------

/**
 * Uploads an image file to Firebase Storage, then saves its metadata
 * to the `gallery` Firestore collection.
 */
export async function uploadGalleryImage(
  file: File,
  meta: GalleryItemInput,
  uploadedBy: string,
  onProgress?: UploadProgressCallback,
): Promise<string> {
  const { path: storagePath, downloadURL } = await uploadFile(
    GALLERY_STORAGE_FOLDER,
    file,
    onProgress,
  )

  const docId = await addDocument<Omit<GalleryItem, 'id' | 'createdAt' | 'updatedAt'>>(
    GALLERY_COLLECTION,
    {
      storagePath,
      downloadURL,
      title: meta.title.trim(),
      altText: meta.altText.trim(),
      caption: meta.caption.trim(),
      isPublished: meta.isPublished,
      uploadedBy,
    },
  )

  return docId
}

// ---------------------------------------------------------------------------
// Update — metadata only (Storage file is immutable)
// ---------------------------------------------------------------------------

/**
 * Partially updates a gallery item's metadata in Firestore.
 * The Storage file is never touched by an edit operation.
 */
export async function updateGalleryItem(
  id: string,
  patch: GalleryItemPatch,
): Promise<void> {
  const sanitised: GalleryItemPatch = {}
  if (patch.title       !== undefined) sanitised.title       = patch.title.trim()
  if (patch.altText     !== undefined) sanitised.altText     = patch.altText.trim()
  if (patch.caption     !== undefined) sanitised.caption     = patch.caption.trim()
  if (patch.isPublished !== undefined) sanitised.isPublished = patch.isPublished

  await updateDocument(GALLERY_COLLECTION, id, sanitised)
}

// ---------------------------------------------------------------------------
// Delete — Firestore doc + Storage file
// ---------------------------------------------------------------------------

/**
 * Permanently removes a gallery item from both Firestore and Firebase Storage.
 *
 * Firestore deletion happens first so the UI updates immediately via the
 * real-time listener. Storage deletion is best-effort.
 */
export async function deleteGalleryItem(
  id: string,
  storagePath: string,
): Promise<void> {
  await deleteDocument(GALLERY_COLLECTION, id)

  try {
    await deleteFile(storagePath)
  } catch (err) {
    console.warn('[gallery] Storage file removal failed:', storagePath, err)
  }
}

// ---------------------------------------------------------------------------
// Real-time subscription — all items (admin)
// ---------------------------------------------------------------------------

/**
 * Subscribes to the full `gallery` collection, ordered by newest first.
 * Admin use only — shows published AND draft items.
 */
export function subscribeToGallery(
  callback: (items: GalleryItem[]) => void,
  onError?: (err: Error) => void,
): Unsubscribe {
  const q = query(
    collection(db, GALLERY_COLLECTION),
    orderBy('createdAt', 'desc'),
  )
  return onSnapshot(
    q,
    (snap) => {
      const items: GalleryItem[] = snap.docs.map((d) => ({
        id: d.id,
        ...(d.data() as Omit<GalleryItem, 'id'>),
      }))
      callback(items)
    },
    (err) => {
      console.error('[gallery] onSnapshot error:', err)
      onError?.(err)
    },
  )
}

// ---------------------------------------------------------------------------
// Real-time subscription — published only (public page)
// ---------------------------------------------------------------------------

/**
 * Subscribes to PUBLISHED gallery items only, ordered by newest first.
 * Used by the public /gallery page.
 *
 * Requires a Firestore composite index: isPublished ASC + createdAt DESC
 * Firebase will log a direct link to create the index the first time this runs.
 */
export function subscribeToPublishedGallery(
  callback: (items: GalleryItem[]) => void,
  onError?: (err: Error) => void,
): Unsubscribe {
  const q = query(
    collection(db, GALLERY_COLLECTION),
    where('isPublished', '==', true),
    orderBy('createdAt', 'desc'),
  )
  return onSnapshot(
    q,
    (snap) => {
      const items: GalleryItem[] = snap.docs.map((d) => ({
        id: d.id,
        ...(d.data() as Omit<GalleryItem, 'id'>),
      }))
      callback(items)
    },
    (err) => {
      console.error('[gallery/public] onSnapshot error:', err)
      onError?.(err)
    },
  )
}
