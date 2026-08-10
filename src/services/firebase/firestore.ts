/**
 * Firestore Database Utilities
 *
 * Generic CRUD helpers built on the Firestore modular SDK.
 * These utilities are intentionally data-agnostic — they work with any
 * collection path and document shape, so they can be composed into
 * domain-specific service modules (e.g. gallery, services, enquiries).
 *
 * All functions throw FirebaseError on failure; callers should catch and
 * handle errors at the feature level.
 *
 * Collection path conventions used in this project:
 *   gallery/         → Gallery images
 *   services/        → Service offerings
 *   enquiries/       → Contact form submissions
 *   settings/        → Site-wide settings (single doc: settings/global)
 *   admins/          → Future: admin user records
 */

import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  limit,
  where,
  serverTimestamp,
  type DocumentData,
  type QueryConstraint,
  type WithFieldValue,
  type PartialWithFieldValue,
} from 'firebase/firestore'
import { db } from './config'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/** A Firestore document with its ID attached. */
export type DocWithId<T> = T & { id: string }

// ---------------------------------------------------------------------------
// Read — single document
// ---------------------------------------------------------------------------

/**
 * Fetches a single document by path.
 * Returns `null` if the document does not exist.
 *
 * @example
 * const item = await getDocument<GalleryItem>('gallery', 'abc123')
 */
export async function getDocument<T = DocumentData>(
  collectionPath: string,
  docId: string
): Promise<DocWithId<T> | null> {
  const ref = doc(db, collectionPath, docId)
  const snap = await getDoc(ref)
  if (!snap.exists()) return null
  return { id: snap.id, ...(snap.data() as T) }
}

// ---------------------------------------------------------------------------
// Read — collection
// ---------------------------------------------------------------------------

/**
 * Fetches all documents in a collection, with optional query constraints.
 *
 * @example
 * // All gallery items ordered by newest first
 * const items = await getCollection<GalleryItem>('gallery', [
 *   orderBy('createdAt', 'desc')
 * ])
 */
export async function getCollection<T = DocumentData>(
  collectionPath: string,
  constraints: QueryConstraint[] = []
): Promise<DocWithId<T>[]> {
  const ref = collection(db, collectionPath)
  const q = constraints.length > 0 ? query(ref, ...constraints) : ref
  const snap = await getDocs(q)
  return snap.docs.map((d) => ({ id: d.id, ...(d.data() as T) }))
}

// ---------------------------------------------------------------------------
// Create — auto-ID
// ---------------------------------------------------------------------------

/**
 * Adds a new document to a collection with an auto-generated ID.
 * Automatically injects `createdAt` and `updatedAt` server timestamps.
 *
 * @returns The new document's ID.
 *
 * @example
 * const id = await addDocument('gallery', { title: 'My Image', url: '...' })
 */
export async function addDocument<T extends DocumentData>(
  collectionPath: string,
  data: WithFieldValue<T>
): Promise<string> {
  const ref = collection(db, collectionPath)
  const docRef = await addDoc(ref, {
    ...data,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })
  return docRef.id
}

// ---------------------------------------------------------------------------
// Create / Replace — known ID
// ---------------------------------------------------------------------------

/**
 * Creates or fully replaces a document at a known path (upsert).
 * Automatically injects `createdAt` and `updatedAt` server timestamps.
 *
 * @example
 * await setDocument('settings', 'global', { siteName: 'Divine Heritage' })
 */
export async function setDocument<T extends DocumentData>(
  collectionPath: string,
  docId: string,
  data: WithFieldValue<T>
): Promise<void> {
  const ref = doc(db, collectionPath, docId)
  await setDoc(ref, {
    ...data,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })
}

// ---------------------------------------------------------------------------
// Update — partial
// ---------------------------------------------------------------------------

/**
 * Partially updates an existing document, merging provided fields only.
 * Automatically updates the `updatedAt` server timestamp.
 *
 * @example
 * await updateDocument('gallery', 'abc123', { title: 'New Title' })
 */
export async function updateDocument<T extends DocumentData>(
  collectionPath: string,
  docId: string,
  data: PartialWithFieldValue<T>
): Promise<void> {
  const ref = doc(db, collectionPath, docId)
  await updateDoc(ref, {
    ...data,
    updatedAt: serverTimestamp(),
  })
}

// ---------------------------------------------------------------------------
// Delete
// ---------------------------------------------------------------------------

/**
 * Permanently deletes a document from a collection.
 *
 * @example
 * await deleteDocument('gallery', 'abc123')
 */
export async function deleteDocument(
  collectionPath: string,
  docId: string
): Promise<void> {
  const ref = doc(db, collectionPath, docId)
  await deleteDoc(ref)
}

// ---------------------------------------------------------------------------
// Re-export commonly used query helpers for convenience
// ---------------------------------------------------------------------------
export { orderBy, limit, where, serverTimestamp }
