/**
 * Enquiries Service
 *
 * Handles contact form submissions — writes to the `enquiries` Firestore
 * collection with resilient local persistence fallback, and provides a real-time
 * subscription for the admin messages dashboard.
 *
 * Collection path: `enquiries/`
 * Security rules: public create, authenticated read/update/delete.
 */

import {
  collection,
  query,
  orderBy,
  onSnapshot,
  type Unsubscribe,
} from 'firebase/firestore'
import { db } from '@services/firebase/config'
import { addDocument, updateDocument, deleteDocument } from '@services/firebase/firestore'
import type { Enquiry, EnquiryInput, EnquiryStatus } from '@appTypes/enquiry'

export const ENQUIRIES_COLLECTION = 'enquiries'
export const ENQUIRIES_STORAGE_KEY = 'divine_heritage_enquiries'
export const ENQUIRIES_EVENT = 'enquiries-changed'

// ---------------------------------------------------------------------------
// LocalStorage helpers
// ---------------------------------------------------------------------------

function getLocalEnquiries(): Enquiry[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = window.localStorage.getItem(ENQUIRIES_STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch (err) {
    console.warn('[enquiries] Failed to read localStorage:', err)
    return []
  }
}

function saveLocalEnquiries(items: Enquiry[]): void {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(ENQUIRIES_STORAGE_KEY, JSON.stringify(items))
    window.dispatchEvent(new Event(ENQUIRIES_EVENT))
  } catch (err) {
    console.warn('[enquiries] Failed to write localStorage:', err)
  }
}

function parseEnquiryTime(item: Enquiry): number {
  if (!item.createdAt) return 0
  const ts = item.createdAt as unknown
  if (typeof ts === 'object' && ts !== null && 'toDate' in ts && typeof (ts as { toDate: () => Date }).toDate === 'function') {
    return (ts as { toDate: () => Date }).toDate().getTime()
  }
  if (typeof ts === 'object' && ts !== null && 'seconds' in ts) {
    return (ts as { seconds: number }).seconds * 1000
  }
  if (ts instanceof Date) return ts.getTime()
  if (typeof ts === 'string' || typeof ts === 'number') {
    const parsed = new Date(ts).getTime()
    return isNaN(parsed) ? 0 : parsed
  }
  return 0
}

function mergeEnquiries(firestoreItems: Enquiry[], localItems: Enquiry[]): Enquiry[] {
  const map = new Map<string, Enquiry>()

  // Add firestore items first
  for (const item of firestoreItems) {
    map.set(item.id, item)
  }

  // Add local items if not already present or if local has newer updates
  for (const local of localItems) {
    if (!map.has(local.id)) {
      map.set(local.id, local)
    } else {
      // If local item has updated status, keep local version
      const existing = map.get(local.id)!
      if (local.status && local.status !== existing.status) {
        map.set(local.id, { ...existing, status: local.status })
      }
    }
  }

  // Sort descending by created time
  return Array.from(map.values()).sort((a, b) => parseEnquiryTime(b) - parseEnquiryTime(a))
}

// ---------------------------------------------------------------------------
// Submit — called from public contact form
// ---------------------------------------------------------------------------

/**
 * Saves a contact form submission to Firestore with automatic local backup.
 * Returns the created document ID.
 */
export async function submitEnquiry(input: EnquiryInput): Promise<string> {
  const cleanInput: Omit<Enquiry, 'id' | 'createdAt' | 'updatedAt'> = {
    parentName:  (input.parentName || '').trim(),
    email:       (input.email || '').trim().toLowerCase(),
    phone:       (input.phone || '').trim(),
    childAge:    input.childAge || '',
    serviceType: input.serviceType || '',
    message:     (input.message || '').trim(),
    status:      input.status || 'unread',
  }

  const nowIso = new Date().toISOString()
  const localId = `local_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`
  const localItem: Enquiry = {
    id: localId,
    ...cleanInput,
    createdAt: nowIso,
    updatedAt: nowIso,
  }

  // Always store locally first so submissions are never lost
  const existingLocal = getLocalEnquiries()
  saveLocalEnquiries([localItem, ...existingLocal])

  // Try to write to Firestore
  try {
    const firestoreId = await addDocument<Omit<Enquiry, 'id' | 'createdAt' | 'updatedAt'>>(
      ENQUIRIES_COLLECTION,
      cleanInput,
    )

    // Update the local record's ID to match Firestore ID
    const updated = getLocalEnquiries().map((item) =>
      item.id === localId ? { ...item, id: firestoreId } : item
    )
    saveLocalEnquiries(updated)
    return firestoreId
  } catch (firestoreErr) {
    console.warn(
      '[enquiries] Firestore write failed or permission denied; enquiry saved locally:',
      firestoreErr,
    )
    return localId
  }
}

// ---------------------------------------------------------------------------
// Subscribe — real-time feed for admin
// ---------------------------------------------------------------------------

/**
 * Subscribes to all enquiries ordered by newest first.
 * Combines Firestore live updates with local storage persistence.
 * Returns an unsubscribe function.
 */
export function subscribeToEnquiries(
  onData: (enquiries: Enquiry[]) => void,
  onError?: (err: Error) => void,
): Unsubscribe {
  let firestoreDocs: Enquiry[] = []

  const emitMerged = () => {
    const local = getLocalEnquiries()
    const merged = mergeEnquiries(firestoreDocs, local)
    onData(merged)
  }

  // Initial emit from local storage
  emitMerged()

  // Listen to local changes
  const handleLocalChange = () => emitMerged()
  if (typeof window !== 'undefined') {
    window.addEventListener('storage', handleLocalChange)
    window.addEventListener(ENQUIRIES_EVENT, handleLocalChange)
  }

  // Listen to Firestore
  let firestoreUnsub: Unsubscribe = () => {}
  try {
    const q = query(
      collection(db, ENQUIRIES_COLLECTION),
      orderBy('createdAt', 'desc'),
    )
    firestoreUnsub = onSnapshot(
      q,
      (snap) => {
        firestoreDocs = snap.docs.map((d) => ({
          id: d.id,
          ...(d.data() as Omit<Enquiry, 'id'>),
        }))
        emitMerged()
      },
      (err) => {
        console.warn('[enquiries] Firestore subscription error (using local data):', err.message)
        onError?.(err)
        emitMerged()
      },
    )
  } catch (err) {
    console.warn('[enquiries] Firestore init query error (using local data):', err)
    emitMerged()
  }

  return () => {
    firestoreUnsub()
    if (typeof window !== 'undefined') {
      window.removeEventListener('storage', handleLocalChange)
      window.removeEventListener(ENQUIRIES_EVENT, handleLocalChange)
    }
  }
}

// ---------------------------------------------------------------------------
// Update status — mark as read / archived / unread
// ---------------------------------------------------------------------------

export async function updateEnquiryStatus(
  id: string,
  status: EnquiryStatus,
): Promise<void> {
  // Update local storage
  const localItems = getLocalEnquiries()
  const updated = localItems.map((item) =>
    item.id === id ? { ...item, status, updatedAt: new Date().toISOString() } : item
  )
  saveLocalEnquiries(updated)

  // If this is a Firestore doc, update remote as well
  if (!id.startsWith('local_')) {
    try {
      await updateDocument<Enquiry>(ENQUIRIES_COLLECTION, id, { status })
    } catch (err) {
      console.warn('[enquiries] Remote status update failed (saved locally):', err)
    }
  }
}

// ---------------------------------------------------------------------------
// Delete — remove enquiry
// ---------------------------------------------------------------------------

export async function deleteEnquiry(id: string): Promise<void> {
  // Remove from local storage
  const localItems = getLocalEnquiries()
  const filtered = localItems.filter((item) => item.id !== id)
  saveLocalEnquiries(filtered)

  // If this is a Firestore doc, delete remote as well
  if (!id.startsWith('local_')) {
    try {
      await deleteDocument(ENQUIRIES_COLLECTION, id)
    } catch (err) {
      console.warn('[enquiries] Remote delete failed (removed locally):', err)
    }
  }
}
