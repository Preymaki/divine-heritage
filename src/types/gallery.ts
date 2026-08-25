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

export interface PublicGallerySectionInfo {
  eyebrow: string
  title: string
  subtitle: string
}

export const PUBLIC_GALLERY_SECTIONS: Record<GalleryGroup, PublicGallerySectionInfo> = {
  outings: {
    eyebrow: 'Outdoor Play',
    title: 'Outdoor Play & Garden Fun',
    subtitle: 'Active outdoor adventures, garden play, and exploring nature in a safe, engaging environment.',
  },
  library: {
    eyebrow: 'Community Trips',
    title: 'Library Visits & Bubble Play',
    subtitle: 'Interactive story time, socialising with peers, and fun sensory bubble play sessions at the local library.',
  },
  learning: {
    eyebrow: 'Play & Discovery',
    title: 'Play, Learning & Creativity',
    subtitle: 'Hands-on sensory exploration, arts and crafts, painting, and early developmental activities.',
  },
  indoor: {
    eyebrow: 'Our Setting',
    title: 'The Home Environment',
    subtitle: 'A warm, welcoming home nursery with child-accessible toys, cosy reading corners, and creative spaces.',
  },
  other: {
    eyebrow: 'More Moments',
    title: 'Extra Memories & Activities',
    subtitle: 'Special moments, seasonal activities, and everyday learning at Divine Heritage.',
  },
  home_hero: {
    eyebrow: 'Home Page',
    title: 'Hero Banner',
    subtitle: 'Main banner at the top of the homepage.',
  },
  home_about: {
    eyebrow: 'Home Page',
    title: 'About Preview',
    subtitle: 'Childminder portrait in the homepage about section.',
  },
  home_cta: {
    eyebrow: 'Home & CTA',
    title: 'Call to Action Banner',
    subtitle: 'Background banner in the booking callout section.',
  },
  about_page: {
    eyebrow: 'About Page',
    title: 'Setting Overview',
    subtitle: 'Featured photo on the About Us page.',
  },
  services_page: {
    eyebrow: 'Services Page',
    title: 'Service Covers',
    subtitle: 'Cover photos for service cards on the Services page.',
  },
}

export const GALLERY_GROUP_LABELS: Record<GalleryGroup, string> = {
  home_hero:     'Home Page (Hero Banner)',
  home_about:    'Home Page (About Preview)',
  home_cta:      'Home & Global CTA (Book a Visit Banner)',
  about_page:    'About Page (Setting Overview)',
  services_page: 'Services Page (Service Card Covers)',
  outings:       'Gallery: Outdoor Play & Garden Fun',
  library:       'Gallery: Library Trips & Bubble Play',
  learning:      'Gallery: Play, Learning & Creativity',
  indoor:        'Gallery: The Home Environment',
  other:         'Other / Extra Uploads',
}

export const GALLERY_GROUP_SUBTITLES: Record<GalleryGroup, string> = {
  home_hero:     'Controls the large top background image displayed at the very top of the website home page.',
  home_about:    'Controls the featured portrait photo of the childminder in the Home Page "About" section.',
  home_cta:      'Controls the background banner frame in the "Book a Visit" callout box on the home page and footer CTA.',
  about_page:    'Controls the primary setting overview photo of children playing on the dedicated /about page.',
  services_page: 'Controls the service card covers on the /services page (Full Day Care, Part-Time & Flexible Hours, After School Care, Holiday Care).',
  outings:       'Outdoor play, garden activities, and local exploration photos displayed on the /gallery page.',
  library:       'Local library visits, story time, and bubble play photos displayed on the /gallery page.',
  learning:      'Hands-on sensory play, painting, building, and literacy photos displayed on the /gallery page.',
  indoor:        'Warm home nursery setup, toys, and learning spaces photos displayed on the /gallery page.',
  other:         'Uncategorised photos or additional uploads.',
}

export const GALLERY_GROUP_BADGES: Record<GalleryGroup, string> = {
  home_hero:     'Home (Hero)',
  home_about:    'Home (About)',
  home_cta:      'Home & CTA',
  about_page:    'About Page',
  services_page: 'Services Page',
  outings:       'Gallery: Outings',
  library:       'Gallery: Library',
  learning:      'Gallery: Learning',
  indoor:        'Gallery: Indoor',
  other:         'General',
}

export const GALLERY_GROUP_ORDER: GalleryGroup[] = [
  'home_hero',
  'home_about',
  'home_cta',
  'about_page',
  'services_page',
  'indoor',
  'learning',
  'outings',
  'library',
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
