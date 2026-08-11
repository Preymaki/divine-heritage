/**
 * Enquiry types
 *
 * Represents a contact form submission saved to the `enquiries` Firestore collection.
 */

import type { Timestamp } from 'firebase/firestore'

// ---------------------------------------------------------------------------
// Status
// ---------------------------------------------------------------------------

export type EnquiryStatus = 'unread' | 'read' | 'archived'

// ---------------------------------------------------------------------------
// Document shape
// ---------------------------------------------------------------------------

export interface Enquiry {
  id: string
  parentName: string
  email: string
  phone: string
  childAge: string
  serviceType: string
  message: string
  status: EnquiryStatus
  /** Server timestamp — set on creation */
  createdAt: Timestamp | null
  updatedAt: Timestamp | null
}

/** Shape written to Firestore on form submit (no id / timestamps — those are injected) */
export type EnquiryInput = Omit<Enquiry, 'id' | 'createdAt' | 'updatedAt'>
