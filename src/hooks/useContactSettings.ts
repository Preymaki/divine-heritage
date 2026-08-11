/**
 * useContactSettings
 *
 * Subscribes to the `settings/contact` Firestore document in real-time.
 * Falls back to DEFAULT_CONTACT while loading or if the document doesn't exist.
 * Used by public-facing components (Contact page, Footer, etc.).
 */

import { useState, useEffect } from 'react'
import { subscribeToContact, DEFAULT_CONTACT } from '@services/settings'
import type { ContactSettings } from '@appTypes/settings'

export function useContactSettings(): {
  contact: ContactSettings
  loading: boolean
} {
  const [contact, setContact] = useState<ContactSettings>(DEFAULT_CONTACT)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsub = subscribeToContact(
      (data) => { setContact(data); setLoading(false) },
      ()     => { setLoading(false) },    // on error, fall back to defaults
    )
    return unsub
  }, [])

  return { contact, loading }
}
