/**
 * Gallery Types
 *
 * Shared TypeScript interfaces for the Gallery CMS feature.
 * These types mirror the Firestore `gallery` collection schema exactly.
 */

import type { Timestamp } from 'firebase/firestore'

// ---------------------------------------------------------------------------
// Firestore document shape
// ---------------------------------------------------------------------------

/**
 * A gallery image document as stored in Firestore.
 * The `id` field is the Firestore document ID, attached by the service layer.
 */
export interface GalleryItem {
  id: string

  // ── Storage ──────────────────────────────────────────────────────────────
  /** Firebase Storage path, e.g. "gallery/1700000_my-photo.jpg" */
  storagePath: string
  /** Public Firebase Storage download URL */
  downloadURL: string

  // ── Metadata ─────────────────────────────────────────────────────────────
  /** Display title shown in the admin gallery grid */
  title: string
  /** Accessibility alt text (also used as SEO alt on the public page) */
  altText: string
  /** Optional caption displayed below the image on the public gallery page */
  caption: string

  // ── Visibility ────────────────────────────────────────────────────────────
  /** When true, the image appears on the public-facing /gallery page */
  isPublished: boolean

  // ── Audit ─────────────────────────────────────────────────────────────────
  /** Firestore server timestamp — set on creation */
  createdAt: Timestamp | null
  /** Firestore server timestamp — updated on every write */
  updatedAt: Timestamp | null
  /** Email of the admin who uploaded the image */
  uploadedBy: string
}

// ---------------------------------------------------------------------------
// Upload input (what the upload form collects)
// ---------------------------------------------------------------------------

/**
 * Fields collected from the upload modal before the image is uploaded.
 * Does NOT include storagePath / downloadURL (those come from Storage).
 */
export interface GalleryItemInput {
  title: string
  altText: string
  caption: string
  isPublished: boolean
}

// ---------------------------------------------------------------------------
// Upload state (drives the UploadModal UI)
// ---------------------------------------------------------------------------

export type UploadPhase =
  | 'idle'        // waiting for user input
  | 'uploading'   // upload in progress
  | 'saving'      // saving metadata to Firestore
  | 'success'     // done
  | 'error'       // failed

export interface UploadState {
  phase: UploadPhase
  progress: number  // 0–100
  error: string | null
}

// ---------------------------------------------------------------------------
// Edit / delete / toggle action state
// ---------------------------------------------------------------------------

/** Fields that can be changed via the edit modal. */
export type GalleryItemPatch = Partial<GalleryItemInput>

export type ActionPhase = 'idle' | 'pending' | 'success' | 'error'

export interface ActionState {
  phase: ActionPhase
  error: string | null
}
