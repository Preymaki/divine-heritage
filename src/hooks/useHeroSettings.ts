/**
 * useHeroSettings
 *
 * Subscribes to the `settings/hero` Firestore document in real-time.
 * Falls back to DEFAULT_HERO while loading or if the document doesn't exist.
 * Used by HeroSection.tsx.
 */

import { useState, useEffect } from 'react'
import { subscribeToHero, DEFAULT_HERO } from '@services/settings'
import type { HeroSettings } from '@appTypes/settings'

export function useHeroSettings(): {
  hero: HeroSettings
  loading: boolean
} {
  const [hero, setHero] = useState<HeroSettings>(DEFAULT_HERO)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsub = subscribeToHero(
      (data) => { setHero(data); setLoading(false) },
      ()     => { setLoading(false) },
    )
    return unsub
  }, [])

  return { hero, loading }
}
