/**
 * Gallery Service
 *
 * Domain-specific service for the Gallery CMS feature.
 * Composes the generic firestore.ts and storage.ts utilities into
 * higher-level operations that the UI layer consumes.
 *
 * Collection: `gallery`
 * Storage folder: `gallery/`
 *
 * NOTE: `storagePath` is nullable for static public-asset images that were
 * seeded from the original hardcoded gallery. For those items, the Storage
 * deletion step is skipped on delete.
 */

import {
  collection,
  query,
  orderBy,
  onSnapshot,
  writeBatch,
  doc,
  serverTimestamp,
  type Unsubscribe,
} from 'firebase/firestore'
import { db } from '@services/firebase/config'
import { uploadFile, deleteFile, type UploadProgressCallback } from '@services/firebase/storage'
import {
  addDocument,
  updateDocument,
  deleteDocument,
} from '@services/firebase/firestore'
import type {
  GalleryItem,
  GalleryItemInput,
  GalleryItemPatch,
  GalleryGroup,
} from '@appTypes/gallery'

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
      title:       meta.title.trim(),
      altText:     meta.altText.trim(),
      caption:     meta.caption.trim(),
      group:       meta.group,
      sortOrder:   meta.sortOrder,
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
  if (patch.group       !== undefined) sanitised.group       = patch.group
  if (patch.sortOrder   !== undefined) sanitised.sortOrder   = patch.sortOrder
  if (patch.isPublished !== undefined) sanitised.isPublished = patch.isPublished

  await updateDocument(GALLERY_COLLECTION, id, sanitised)
}

// ---------------------------------------------------------------------------
// Delete — Firestore doc + Storage file (if applicable)
// ---------------------------------------------------------------------------

/**
 * Permanently removes a gallery item from Firestore and, if it has a
 * Firebase Storage path, from Storage as well.
 *
 * Static-asset images (storagePath === null) seeded from the original
 * hardcoded gallery have no Storage file — only the Firestore doc is removed.
 *
 * Firestore deletion happens first so the UI updates immediately via the
 * real-time listener. Storage deletion is best-effort.
 */
export async function deleteGalleryItem(
  id: string,
  storagePath: string | null,
): Promise<void> {
  await deleteDocument(GALLERY_COLLECTION, id)

  if (storagePath) {
    try {
      await deleteFile(storagePath)
    } catch (err) {
      console.warn('[gallery] Storage file removal failed:', storagePath, err)
    }
  }
}

// ---------------------------------------------------------------------------
// Seed — one-time initialisation of the existing hardcoded images
// ---------------------------------------------------------------------------

/**
 * Seeds the `gallery` Firestore collection with the 19 existing public-folder
 * images from the original hardcoded gallery.
 *
 * Each document gets `storagePath: null` because these images live in
 * `public/images/` — they were never uploaded to Firebase Storage.
 *
 * This operation is idempotent-safe when called via the admin UI seed button
 * (which is only shown when the collection is empty).
 */
export async function seedGallery(uploadedBy: string): Promise<void> {
  interface SeedItem {
    group: GalleryGroup
    sortOrder: number
    downloadURL: string
    title: string
    altText: string
    caption: string
  }

  const seeds: SeedItem[] = [
    // ── Outings ──────────────────────────────────────────────────────────
    {
      group: 'outings', sortOrder: 1,
      downloadURL: '/images/outdoor-spinning-ride.jpeg',
      title: 'Park Swings',
      altText: 'Two happy children smiling on swings at the park during a Divine Heritage outing',
      caption: '',
    },
    {
      group: 'outings', sortOrder: 2,
      downloadURL: '/images/outdoor-nature-tree.jpeg',
      title: 'Nature Exploration',
      altText: 'Two children exploring nature around a tree in a sunny park during a Divine Heritage outing',
      caption: '',
    },
    {
      group: 'outings', sortOrder: 3,
      downloadURL: '/images/hero-swings.jpeg',
      title: 'Spinning Ride',
      altText: 'A child enjoying a spinning ride at an outdoor playground during a Divine Heritage park outing',
      caption: '',
    },
    {
      group: 'outings', sortOrder: 4,
      downloadURL: '/images/outdoor-rope-climb.jpeg',
      title: 'Rope Climbing Frame',
      altText: 'A child confidently navigating a rope climbing frame at an adventure playground during a Divine Heritage outing',
      caption: '',
    },
    {
      group: 'outings', sortOrder: 5,
      downloadURL: '/images/outdoor-rocking-horse.jpeg',
      title: 'Garden Rocking Horse',
      altText: 'A toddler riding a red rocking horse in the garden at Divine Heritage',
      caption: '',
    },
    {
      group: 'outings', sortOrder: 6,
      downloadURL: '/images/outing-softplay-blocks.jpeg',
      title: 'Soft Play',
      altText: 'A toddler building strength on foam climbing blocks at a soft play session during a Divine Heritage outing',
      caption: '',
    },

    // ── Library ───────────────────────────────────────────────────────────
    {
      group: 'library', sortOrder: 1,
      downloadURL: '/images/outing-library-bubbles-1.jpeg',
      title: 'Library Bubbles 1',
      altText: 'Children delighting in a bubble play session at the local library during a Divine Heritage outing',
      caption: '',
    },
    {
      group: 'library', sortOrder: 2,
      downloadURL: '/images/hero-library-bubbles.jpeg',
      title: 'Library Bubbles 2',
      altText: 'Two toddlers playing together with bubbles on a colourful alphabet rug during a library visit',
      caption: '',
    },
    {
      group: 'library', sortOrder: 3,
      downloadURL: '/images/outing-library-tumble.jpeg',
      title: 'Library Tumble',
      altText: 'A toddler joyfully tumbling on a brightly coloured educational rug at the local library',
      caption: '',
    },

    // ── Learning ──────────────────────────────────────────────────────────
    {
      group: 'learning', sortOrder: 1,
      downloadURL: '/images/reading-book.jpeg',
      title: 'Story Time',
      altText: 'A young child sitting independently reading a picture book, demonstrating a love of stories at Divine Heritage',
      caption: '',
    },
    {
      group: 'learning', sortOrder: 2,
      downloadURL: '/images/arts-painting-easel.jpeg',
      title: 'Arts & Crafts',
      altText: 'A child in a painting apron creating artwork at an easel during an arts and crafts session at Divine Heritage',
      caption: '',
    },
    {
      group: 'learning', sortOrder: 3,
      downloadURL: '/images/about-childminder-group.jpeg',
      title: 'Sensory Play',
      altText: 'Divine Heritage childminder sitting on the floor with four children exploring vegetables and sensory play together',
      caption: '',
    },

    // ── Indoor ────────────────────────────────────────────────────────────
    {
      group: 'indoor', sortOrder: 1,
      downloadURL: '/images/indoor-train-track.jpeg',
      title: 'Train Track Play',
      altText: 'A toddler absorbed in building a wooden train track in the bright welcoming living room at Divine Heritage',
      caption: '',
    },
    {
      group: 'indoor', sortOrder: 2,
      downloadURL: '/images/indoor-kitchen-play.jpeg',
      title: 'Kitchen Play',
      altText: 'Three children playing with a toy kitchen and food items along the hallway of the Divine Heritage childcare home',
      caption: '',
    },
    {
      group: 'indoor', sortOrder: 3,
      downloadURL: '/images/indoor-animal-figures.jpeg',
      title: 'Animal Figures',
      altText: 'Children engaged in imaginative play with animal figures on a colourful number play mat at Divine Heritage',
      caption: '',
    },
    {
      group: 'indoor', sortOrder: 4,
      downloadURL: '/images/indoor-baby-tummy-time.jpeg',
      title: 'Tummy Time',
      altText: 'A baby enjoying tummy time and sensory exploration with a bright toy on a stimulating play mat at Divine Heritage',
      caption: '',
    },
    {
      group: 'indoor', sortOrder: 5,
      downloadURL: '/images/gallery-kitchen-hallway.jpeg',
      title: 'Hallway Play',
      altText: 'Children playing with toy kitchen food items and toys in the hallway of the Divine Heritage home',
      caption: '',
    },
    {
      group: 'indoor', sortOrder: 6,
      downloadURL: '/images/gallery-animal-play.jpeg',
      title: 'Animal Play Mat',
      altText: 'A child exploring a collection of animal figures on a play mat at Divine Heritage childcare',
      caption: '',
    },
  ]

  const batch = writeBatch(db)
  const now = serverTimestamp()

  for (const seed of seeds) {
    const ref = doc(collection(db, GALLERY_COLLECTION))
    batch.set(ref, {
      storagePath:  null,
      downloadURL:  seed.downloadURL,
      title:        seed.title,
      altText:      seed.altText,
      caption:      seed.caption,
      group:        seed.group,
      sortOrder:    seed.sortOrder,
      isPublished:  true,
      uploadedBy,
      createdAt:    now,
      updatedAt:    now,
    })
  }

  await batch.commit()
}

// ---------------------------------------------------------------------------
// Real-time subscription — all items (admin)
// ---------------------------------------------------------------------------

/**
 * Subscribes to the full `gallery` collection, ordered by group then sortOrder.
 * Admin use only — shows published AND draft items.
 *
 * Sorting is done client-side to avoid requiring a Firestore composite index.
 */
export function subscribeToGallery(
  callback: (items: GalleryItem[]) => void,
  onError?: (err: Error) => void,
): Unsubscribe {
  const q = query(
    collection(db, GALLERY_COLLECTION),
    orderBy('createdAt', 'asc'),
  )
  return onSnapshot(
    q,
    (snap) => {
      const items: GalleryItem[] = snap.docs
        .map((d) => ({ id: d.id, ...(d.data() as Omit<GalleryItem, 'id'>) }))
        .sort((a, b) => {
          if (a.group !== b.group) return a.group.localeCompare(b.group)
          return (a.sortOrder ?? 0) - (b.sortOrder ?? 0)
        })
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
 * Subscribes to PUBLISHED gallery items only, ordered by group then sortOrder.
 * Used by the public /gallery page.
 *
 * Filtering and sorting are done client-side to avoid requiring any
 * Firestore indexes (composite or single-field).
 */
export function subscribeToPublishedGallery(
  callback: (items: GalleryItem[]) => void,
  onError?: (err: Error) => void,
): Unsubscribe {
  const q = query(
    collection(db, GALLERY_COLLECTION),
  )
  return onSnapshot(
    q,
    (snap) => {
      const items: GalleryItem[] = snap.docs
        .map((d) => ({ id: d.id, ...(d.data() as Omit<GalleryItem, 'id'>) }))
        .filter((item) => item.isPublished === true)
        .sort((a, b) => {
          if (a.group !== b.group) return a.group.localeCompare(b.group)
          return (a.sortOrder ?? 0) - (b.sortOrder ?? 0)
        })
      callback(items)
    },
    (err) => {
      console.error('[gallery/public] onSnapshot error:', err)
      onError?.(err)
    },
  )
}

