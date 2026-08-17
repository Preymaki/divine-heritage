/**
 * Enquiry types
 *
 * Represents a contact form submission saved to the `enquiries` Firestore collection
 * or synced with local persistence.
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
  /** Firestore Timestamp, ISO date string, or epoch timestamp */
  createdAt: Timestamp | string | number | null
  updatedAt: Timestamp | string | number | null
}

/** Shape written to Firestore / store on form submit (no id / timestamps — those are injected) */
export interface EnquiryInput {
  parentName: string
  email: string
  phone?: string
  childAge: string
  serviceType: string
  message: string
  status?: EnquiryStatus
}
