/**
 * useAboutSettings
 *
 * Subscribes to the `settings/about` Firestore document in real-time.
 * Falls back to DEFAULT_ABOUT while loading or if the document doesn't exist.
 * Used by About.tsx, AboutPreview.tsx, and MeetChildminder.tsx.
 */

import { useState, useEffect } from 'react'
import { subscribeToAbout, DEFAULT_ABOUT } from '@services/settings'
import type { AboutSettings } from '@appTypes/settings'

export function useAboutSettings(): {
  about: AboutSettings
  loading: boolean
} {
  const [about, setAbout] = useState<AboutSettings>(DEFAULT_ABOUT)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsub = subscribeToAbout(
      (data) => { setAbout(data); setLoading(false) },
      ()     => { setLoading(false) },
    )
    return unsub
  }, [])

  return { about, loading }
}
