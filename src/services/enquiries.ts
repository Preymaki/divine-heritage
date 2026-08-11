/**
 * Enquiries Service
 *
 * Handles contact form submissions — writes to the `enquiries` Firestore
 * collection and provides a real-time subscription for the admin dashboard.
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
import { addDocument, updateDocument } from '@services/firebase/firestore'
import type { Enquiry, EnquiryInput, EnquiryStatus } from '@appTypes/enquiry'

export const ENQUIRIES_COLLECTION = 'enquiries'

// ---------------------------------------------------------------------------
// Submit — called from the public contact form (no auth required)
// ---------------------------------------------------------------------------

/**
 * Saves a contact form submission to Firestore.
 * Returns the new document ID.
 */
export async function submitEnquiry(input: EnquiryInput): Promise<string> {
  return addDocument<Omit<Enquiry, 'id' | 'createdAt' | 'updatedAt'>>(
    ENQUIRIES_COLLECTION,
    input,
  )
}

// ---------------------------------------------------------------------------
// Subscribe — real-time feed for admin (requires auth)
// ---------------------------------------------------------------------------

/**
 * Subscribes to all enquiries ordered by newest first.
 * Returns the unsubscribe function.
 */
export function subscribeToEnquiries(
  onData: (enquiries: Enquiry[]) => void,
  onError: (err: Error) => void,
): Unsubscribe {
  const q = query(
    collection(db, ENQUIRIES_COLLECTION),
    orderBy('createdAt', 'desc'),
  )
  return onSnapshot(
    q,
    (snap) => {
      const items: Enquiry[] = snap.docs.map((d) => ({
        id: d.id,
        ...(d.data() as Omit<Enquiry, 'id'>),
      }))
      onData(items)
    },
    onError,
  )
}

// ---------------------------------------------------------------------------
// Update status — mark as read / archived (requires auth)
// ---------------------------------------------------------------------------

export async function updateEnquiryStatus(
  id: string,
  status: EnquiryStatus,
): Promise<void> {
  await updateDocument<Enquiry>(ENQUIRIES_COLLECTION, id, { status })
}
