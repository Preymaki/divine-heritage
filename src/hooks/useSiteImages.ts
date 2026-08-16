/**
 * useSiteImages
 *
 * Custom hook for public site pages (Home, About, Services, CTA).
 * Listens to Firestore published gallery items and provides dynamic image URLs
 * for each page's image frames/slots.
 *
 * Automatically falls back to static `IMAGES` constants from `src/utils/images.ts`
 * when Firestore items have not been seeded or when offline.
 */

import { useEffect, useState } from 'react'
import { subscribeToPublishedGallery } from '@services/gallery'
import { IMAGES } from '@utils/images'
import type { GalleryItem } from '@appTypes/gallery'

export interface SiteImagesMap {
  hero: string
  homeAbout: string
  homeCta: string
  aboutPage: string
  serviceChildminding: string
  serviceEarlyYears: string
  serviceAfterSchool: string
  serviceFlexible: string
  serviceArts: string
  serviceOutdoor: string
}

export function useSiteImages(): SiteImagesMap {
  const [siteImages, setSiteImages] = useState<SiteImagesMap>({
    hero:                 IMAGES.hero,
    homeAbout:            IMAGES.aboutChildminder,
    homeCta:              IMAGES.ctaBg,
    aboutPage:            IMAGES.aboutChildminder,
    serviceChildminding:  IMAGES.serviceChildminding,
    serviceEarlyYears:    IMAGES.serviceEarlyYears,
    serviceAfterSchool:   IMAGES.serviceAfterSchool,
    serviceFlexible:      IMAGES.serviceFlexible,
    serviceArts:          IMAGES.serviceArts,
    serviceOutdoor:       IMAGES.serviceOutdoor,
  })

  useEffect(() => {
    const unsub = subscribeToPublishedGallery(
      (items: GalleryItem[]) => {
        if (!items || items.length === 0) return

        const getGroupUrl = (group: GalleryItem['group'], fallback: string) => {
          const found = items.find((i) => i.group === group)
          return found?.downloadURL || fallback
        }

        const getServiceUrl = (sortOrder: number, fallback: string) => {
          const found = items.find((i) => i.group === 'services_page' && i.sortOrder === sortOrder)
          return found?.downloadURL || fallback
        }

        setSiteImages({
          hero:                 getGroupUrl('home_hero', IMAGES.hero),
          homeAbout:            getGroupUrl('home_about', IMAGES.aboutChildminder),
          homeCta:              getGroupUrl('home_cta', IMAGES.ctaBg),
          aboutPage:            getGroupUrl('about_page', IMAGES.aboutChildminder),
          serviceChildminding:  getServiceUrl(1, IMAGES.serviceChildminding),
          serviceEarlyYears:    getServiceUrl(2, IMAGES.serviceEarlyYears),
          serviceAfterSchool:   getServiceUrl(3, IMAGES.serviceAfterSchool),
          serviceFlexible:      getServiceUrl(4, IMAGES.serviceFlexible),
          serviceArts:          getServiceUrl(4, IMAGES.serviceArts),
          serviceOutdoor:       getServiceUrl(5, IMAGES.serviceOutdoor),
        })
      },
      (err) => {
        console.warn('[useSiteImages] Firestore snapshot fallback:', err.message)
      },
    )

    return unsub
  }, [])

  return siteImages
}
