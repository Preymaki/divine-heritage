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
  | 'home_hero'      // Home Page — Main Hero Banner
  | 'home_about'     // Home Page — About Childminder Preview
  | 'home_cta'       // Home Page & Global CTA — Book a Visit Banner
  | 'about_page'     // About Page — Founder & Care Environment
  | 'services_page'  // Services Page — Service Card Covers
  | 'outings'        // Public Gallery Page — Adventures Out & About
  | 'library'        // Public Gallery Page — Library Trips
  | 'learning'       // Public Gallery Page — Play & Learning
  | 'indoor'         // Public Gallery Page — Home Environment
  | 'other'          // Uncategorised / extra uploads

export const GALLERY_GROUP_LABELS: Record<GalleryGroup, string> = {
  home_hero:     'Home Page — Main Hero Banner',
  home_about:    'Home Page — About Childminder Preview',
  home_cta:      'Home Page & Global CTA — Book a Visit Banner',
  about_page:    'About Page — Founder & Care Environment',
  services_page: 'Services Page — Service Cards & Activity Covers',
  outings:       'Public Gallery Page — Section 1: Outdoor Play & Garden Fun',
  library:       'Public Gallery Page — Section 2: Library & Learning Trips',
  learning:      'Public Gallery Page — Section 3: Play, Learning & Creativity',
  indoor:        'Public Gallery Page — Section 4: The Home Environment',
  other:         'Other / Uncategorised',
}

export const GALLERY_GROUP_SUBTITLES: Record<GalleryGroup, string> = {
  home_hero:     'Controls the large top background image displayed at the very top of the website home page.',
  home_about:    'Controls the featured portrait photo of the childminder in the Home Page "About Us" section.',
  home_cta:      'Controls the background banner frame in the "Book a Visit" callout box on the home page and footer CTA.',
  about_page:    'Controls the primary photo of the childminder and home nursery setup on the dedicated /about page.',
  services_page: 'Controls the 5 service card covers on the /services page (Childminding, Early Years, After-School Care, Arts, Outdoor Play).',
  outings:       'Appears in Section 1 on the public /gallery page: Outdoor play, garden activities, and local exploration.',
  library:       'Appears in Section 2 on the public /gallery page: Local library visits, story time, and bubble play sessions.',
  learning:      'Appears in Section 3 on the public /gallery page: Hands-on sensory play, painting, building, and literacy.',
  indoor:        'Appears in Section 4 on the public /gallery page: Warm home nursery setup, toys, and learning spaces.',
  other:         'Uncategorised photos or additional uploads.',
}

export const GALLERY_GROUP_BADGES: Record<GalleryGroup, string> = {
  home_hero:     'Home Page (Hero)',
  home_about:    'Home Page (About)',
  home_cta:      'Home & Global (CTA)',
  about_page:    'About Page',
  services_page: 'Services Page',
  outings:       'Public Gallery (S1)',
  library:       'Public Gallery (S2)',
  learning:      'Public Gallery (S3)',
  indoor:        'Public Gallery (S4)',
  other:         'General',
}

export const GALLERY_GROUP_ORDER: GalleryGroup[] = [
  'home_hero',
  'home_about',
  'home_cta',
  'about_page',
  'services_page',
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
