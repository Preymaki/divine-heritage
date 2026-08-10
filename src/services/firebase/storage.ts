/**
 * Firebase Storage Utilities
 *
 * Helpers for uploading files to, retrieving download URLs from,
 * and deleting files from Firebase Cloud Storage.
 *
 * Storage folder conventions used in this project:
 *   gallery/     → Gallery images
 *   services/    → Service section images
 *   general/     → Other site assets
 *
 * All functions throw FirebaseError on failure; callers should catch and
 * handle errors at the feature level.
 */

import {
  ref,
  uploadBytesResumable,
  getDownloadURL,
  deleteObject,
  type UploadTask,
  type StorageReference,
  type UploadMetadata,
} from 'firebase/storage'
import { storage } from './config'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/** Progress callback signature for resumable uploads. */
export type UploadProgressCallback = (progress: number) => void

/** Result returned after a successful upload. */
export interface UploadResult {
  /** Full Firebase Storage path (e.g. `gallery/2024-01-01_wedding.jpg`) */
  path: string
  /** Public download URL */
  downloadURL: string
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Builds a unique storage path for an uploaded file.
 * Prepends the folder, strips unsafe characters, and appends a timestamp.
 *
 * @example
 * buildStoragePath('gallery', 'My Photo.jpg')
 * // → 'gallery/1700000000000_my-photo.jpg'
 */
export function buildStoragePath(folder: string, filename: string): string {
  const sanitised = filename
    .toLowerCase()
    .replace(/[^a-z0-9._-]/g, '-')
    .replace(/-+/g, '-')
  return `${folder}/${Date.now()}_${sanitised}`
}

// ---------------------------------------------------------------------------
// Upload
// ---------------------------------------------------------------------------

/**
 * Uploads a File to Firebase Storage.
 *
 * Supports optional progress reporting via the `onProgress` callback (0–100).
 *
 * @param folder      Storage folder (e.g. 'gallery')
 * @param file        The File object to upload
 * @param onProgress  Optional callback called with upload percentage (0–100)
 * @param metadata    Optional Firebase UploadMetadata (e.g. contentType)
 * @returns           Path and public download URL of the uploaded file
 *
 * @example
 * const { downloadURL } = await uploadFile('gallery', selectedFile, (p) => setProgress(p))
 */
export async function uploadFile(
  folder: string,
  file: File,
  onProgress?: UploadProgressCallback,
  metadata?: UploadMetadata
): Promise<UploadResult> {
  const path = buildStoragePath(folder, file.name)
  const storageRef: StorageReference = ref(storage, path)

  const uploadTask: UploadTask = uploadBytesResumable(storageRef, file, {
    contentType: file.type,
    ...metadata,
  })

  return new Promise((resolve, reject) => {
    uploadTask.on(
      'state_changed',
      (snapshot) => {
        if (onProgress) {
          const progress = Math.round(
            (snapshot.bytesTransferred / snapshot.totalBytes) * 100
          )
          onProgress(progress)
        }
      },
      (error) => reject(error),
      async () => {
        try {
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref)
          resolve({ path, downloadURL })
        } catch (err) {
          reject(err)
        }
      }
    )
  })
}

// ---------------------------------------------------------------------------
// Get Download URL
// ---------------------------------------------------------------------------

/**
 * Retrieves the public download URL for a file at a known storage path.
 *
 * @example
 * const url = await getFileURL('gallery/1700000000000_photo.jpg')
 */
export async function getFileURL(storagePath: string): Promise<string> {
  const storageRef = ref(storage, storagePath)
  return getDownloadURL(storageRef)
}

// ---------------------------------------------------------------------------
// Delete
// ---------------------------------------------------------------------------

/**
 * Permanently deletes a file from Firebase Storage.
 *
 * @example
 * await deleteFile('gallery/1700000000000_photo.jpg')
 */
export async function deleteFile(storagePath: string): Promise<void> {
  const storageRef = ref(storage, storagePath)
  await deleteObject(storageRef)
}
