/**
 * Gallery Types
 *
 * Shared TypeScript interfaces for the Gallery CMS feature.
 * These types mirror the Firestore `gallery` collection schema exactly.
 */

import type { Timestamp } from 'firebase/firestore'

// ---------------------------------------------------------------------------
// Gallery groups — themed sections on the public /gallery page
// ---------------------------------------------------------------------------

export type GalleryGroup =
  | 'outings'    // Adventures Out & About
  | 'library'    // Library & Learning Trips
  | 'learning'   // Play, Learning & Creativity
  | 'indoor'     // Our Home Environment
  | 'other'      // Uncategorised / new uploads

export const GALLERY_GROUP_LABELS: Record<GalleryGroup, string> = {
  outings:  'Adventures Out & About',
  library:  'Library & Learning Trips',
  learning: 'Play, Learning & Creativity',
  indoor:   'Our Home Environment',
  other:    'Other',
}

export const GALLERY_GROUP_SUBTITLES: Record<GalleryGroup, string> = {
  outings:  'We love exploring London — parks, playgrounds, libraries, and beyond.',
  library:  'Regular library visits nurture a love of books, stories, and imagination.',
  learning: 'Every day brings rich, hands-on experiences that spark curiosity and growth.',
  indoor:   'A warm, stimulating home full of age-appropriate toys and learning resources.',
  other:    '',
}

export const GALLERY_GROUP_ORDER: GalleryGroup[] = [
  'outings',
  'library',
  'learning',
  'indoor',
  'other',
]

// ---------------------------------------------------------------------------
// Firestore document shape
// ---------------------------------------------------------------------------

/**
 * A gallery image document as stored in Firestore.
 * The `id` field is the Firestore document ID, attached by the service layer.
 *
 * `storagePath` is `null` for images that are static public assets
 * (seeded from the original hardcoded gallery). For those images, only
 * metadata can be edited — the file itself cannot be deleted from Storage
 * because it was never uploaded there.
 */
export interface GalleryItem {
  id: string

  // ── Storage ──────────────────────────────────────────────────────────────
  /**
   * Firebase Storage path, e.g. "gallery/1700000_my-photo.jpg"
   * `null` for static public-folder assets seeded at initialisation.
   */
  storagePath: string | null
  /** Public download URL — either a Firebase Storage URL or a /images/ path */
  downloadURL: string

  // ── Metadata ─────────────────────────────────────────────────────────────
  /** Display title shown in the admin gallery grid */
  title: string
  /** Accessibility alt text (also used as SEO alt on the public page) */
  altText: string
  /** Optional caption displayed below the image on the public gallery page */
  caption: string

  // ── Organisation ─────────────────────────────────────────────────────────
  /** Themed group — determines which section this image appears in on the public page */
  group: GalleryGroup
  /** Manual sort order within a group — lower numbers appear first */
  sortOrder: number

  // ── Visibility ────────────────────────────────────────────────────────────
  /** When true, the image appears on the public-facing /gallery page */
  isPublished: boolean

  // ── Audit ─────────────────────────────────────────────────────────────────
  /** Firestore server timestamp — set on creation */
  createdAt: Timestamp | null
  /** Firestore server timestamp — updated on every write */
  updatedAt: Timestamp | null
  /** Email of the admin who uploaded/seeded the image */
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
  group: GalleryGroup
  sortOrder: number
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
