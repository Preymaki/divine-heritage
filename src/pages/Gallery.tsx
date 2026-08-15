/**
 * Gallery page — /gallery
 *
 * Public-facing gallery page.
 *
 * All gallery content is now managed through the Admin Dashboard and stored
 * in Firestore. The page renders from Firestore only — there is no longer a
 * hardcoded image list alongside the CMS data.
 *
 * Structure:
 *  1. Page hero header
 *  2. Video showcase (hardcoded — always shown)
 *  3. Firestore-driven image groups (grouped by `group` field, ordered by `sortOrder`)
 *  4. Consent notice
 *  5. CTA section
 *
 * Lightbox includes both videos and all Firestore images.
 * If Firestore is empty (e.g. before seeding), the gallery falls back gracefully.
 */

import { useState, useEffect } from 'react'
import { X, Play, ChevronLeft, ChevronRight, Images } from 'lucide-react'
import AnimatedSection from '@components/ui/AnimatedSection'
import SectionWrapper from '@components/ui/SectionWrapper'
import SectionHeader from '@components/ui/SectionHeader'
import CTASection from '@components/home/CTASection'
import { IMAGES, VIDEOS } from '@utils/images'
import { subscribeToPublishedGallery } from '@services/gallery'
import {
  PUBLIC_GALLERY_SECTIONS,
} from '@appTypes/gallery'
import type { GalleryItem, GalleryGroup } from '@appTypes/gallery'

// ─── Lightbox types ────────────────────────────────────────────────────────────

interface LightboxItem {
  src: string
  alt: string
  caption?: string
  type: 'image' | 'video'
}

// ─── Lightbox component ────────────────────────────────────────────────────────

function Lightbox({
  item, total, index, onClose, onPrev, onNext,
}: {
  item: LightboxItem
  total: number
  index: number
  onClose: () => void
  onPrev: () => void
  onNext: () => void
}) {
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Image viewer"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <button
        onClick={onClose}
        aria-label="Close lightbox"
        className="absolute top-4 right-4 z-50 w-10 h-10 rounded-full bg-white/15 hover:bg-white/25 flex items-center justify-center text-white transition-colors"
      >
        <X size={20} />
      </button>
      <button
        onClick={(e) => { e.stopPropagation(); onPrev() }}
        aria-label="Previous image"
        className="absolute left-3 top-1/2 -translate-y-1/2 z-50 w-10 h-10 rounded-full bg-white/15 hover:bg-white/25 flex items-center justify-center text-white transition-colors"
      >
        <ChevronLeft size={22} />
      </button>
      <div
        className="relative max-w-4xl w-full max-h-[85vh] flex flex-col items-center justify-center"
        onClick={(e) => e.stopPropagation()}
      >
        {item.type === 'video' ? (
          <video src={item.src} controls className="max-h-[80vh] rounded-xl object-contain" aria-label={item.alt} />
        ) : (
          <img src={item.src} alt={item.alt} className="max-h-[80vh] max-w-full rounded-xl object-contain shadow-2xl" />
        )}
        {item.caption && (
          <p className="mt-3 text-white/70 text-sm text-center max-w-lg px-4">{item.caption}</p>
        )}
        <p className="mt-2 text-white/40 text-xs">{index + 1} / {total}</p>
      </div>
      <button
        onClick={(e) => { e.stopPropagation(); onNext() }}
        aria-label="Next image"
        className="absolute right-3 top-1/2 -translate-y-1/2 z-50 w-10 h-10 rounded-full bg-white/15 hover:bg-white/25 flex items-center justify-center text-white transition-colors"
      >
        <ChevronRight size={22} />
      </button>
    </div>
  )
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function GallerySkeleton() {
  return (
    <SectionWrapper background="muted">
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 auto-rows-[220px] md:auto-rows-[260px]">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="public-gallery-skeleton rounded-[var(--radius-xl)]" />
        ))}
      </div>
    </SectionWrapper>
  )
}

// ─── Main component ────────────────────────────────────────────────────────────

export default function Gallery() {
  const PUBLIC_GALLERY_GROUPS: GalleryGroup[] = ['outings', 'library', 'learning', 'indoor', 'other']

  // ── Firestore subscription ───────────────────────────────────────────────
  const [allItems,   setAllItems]   = useState<GalleryItem[]>([])
  const [cmsLoading, setCmsLoading] = useState(true)
  const [cmsError,   setCmsError]   = useState<string | null>(null)

  useEffect(() => {
    const unsub = subscribeToPublishedGallery(
      (items) => { setAllItems(items); setCmsLoading(false) },
      (err)   => { setCmsError(err.message); setCmsLoading(false) },
    )
    return unsub
  }, [])

  // ── Group items by gallery group ──────────────────────────────────────────
  const grouped = PUBLIC_GALLERY_GROUPS.reduce<Record<string, GalleryItem[]>>(
    (acc, g) => {
      acc[g] = allItems.filter((item) => item.group === g)
      return acc
    },
    { outings: [], library: [], learning: [], indoor: [], other: [] },
  )

  // ── Build flat lightbox list ─────────────────────────────────────────────
  // Order: 2 videos → then each group in display order
  const VIDEO_ITEMS = [
    { src: VIDEOS.libraryClip1, poster: IMAGES.galleryLibrary1, alt: 'Children playing with bubbles at the library (video clip 1)', idx: 0 },
    { src: VIDEOS.libraryClip2, poster: IMAGES.galleryLibrary2, alt: 'Children enjoying a bubble play session at the library (video clip 2)', idx: 1 },
  ]
  const videoItems: LightboxItem[] = VIDEO_ITEMS.map(v => ({ src: v.src, alt: v.alt, type: 'video' }))

  const imageItems: LightboxItem[] = PUBLIC_GALLERY_GROUPS.flatMap((g) =>
    (grouped[g] || []).map((item) => ({
      src: item.downloadURL,
      alt: item.altText,
      caption: item.caption || undefined,
      type: 'image' as const,
    })),
  )
  const allLightboxItems: LightboxItem[] = [...videoItems, ...imageItems]

  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)
  const closeLightbox = () => setLightboxIndex(null)
  const goPrev = () => setLightboxIndex((i) => (i == null ? 0 : (i - 1 + allLightboxItems.length) % allLightboxItems.length))
  const goNext = () => setLightboxIndex((i) => (i == null ? 0 : (i + 1) % allLightboxItems.length))

  // Videos occupy indices 0–1; images start at 2
  const VIDEO_COUNT = 2

  // Compute the lightbox start index for each group
  let groupOffset = VIDEO_COUNT
  const groupOffsets: Record<string, number> = {
    outings: 0, library: 0, learning: 0, indoor: 0, other: 0,
  }
  for (const g of PUBLIC_GALLERY_GROUPS) {
    groupOffsets[g] = groupOffset
    groupOffset += (grouped[g] || []).length
  }

  return (
    <>
      {/* Keyboard nav */}
      {lightboxIndex !== null && (
        <div
          onKeyDown={(e) => {
            if (e.key === 'Escape') closeLightbox()
            if (e.key === 'ArrowLeft') goPrev()
            if (e.key === 'ArrowRight') goNext()
          }}
          tabIndex={-1}
          className="sr-only"
          ref={(el) => el?.focus()}
        />
      )}

      {/* Hero */}
      <div className="bg-[var(--color-primary-900)] pt-32 pb-16">
        <div className="container-site">
          <AnimatedSection>
            <p className="text-[var(--color-accent-400)] text-xs font-semibold uppercase tracking-[0.15em] mb-3 font-[var(--font-family-heading)]">
              Photo &amp; Video Gallery
            </p>
            <h1 className="font-[var(--font-family-heading)] font-bold text-white text-4xl md:text-5xl leading-tight tracking-tight max-w-2xl">
              Moments of Joy, Growth &amp; Discovery
            </h1>
            <p className="mt-4 text-white/65 text-base md:text-lg leading-relaxed max-w-xl">
              Explore daily life at Divine Heritage through library visits, creative activities, 
              sensory play, arts and crafts, and indoor and outdoor play.
            </p>
          </AnimatedSection>
        </div>
      </div>

      {/* Video Highlights Section */}
      <SectionWrapper background="white">
        <AnimatedSection className="text-center flex justify-center mb-10">
          <SectionHeader
            eyebrow="Video Highlights"
            title="Watch Divine Heritage in Action"
            subtitle="Short video clips captured during local library outings and bubble play sessions."
            centered
          />
        </AnimatedSection>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {VIDEO_ITEMS.map((v) => (
            <AnimatedSection key={v.idx} delay={v.idx * 0.1}>
              <button
                type="button"
                aria-label={`Play video: ${v.alt}`}
                onClick={() => setLightboxIndex(v.idx)}
                className="w-full relative aspect-video rounded-[var(--radius-xl)] overflow-hidden group focus-visible:ring-2 focus-visible:ring-[var(--color-primary-400)] block border border-[var(--color-muted)] shadow-[var(--shadow-card)]"
              >
                <img src={v.poster} alt="" aria-hidden="true" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" loading="lazy" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-14 h-14 rounded-full bg-[var(--color-accent-500)] text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-200">
                    <Play size={24} className="ml-1" fill="currentColor" />
                  </div>
                </div>
                <div className="absolute bottom-3 left-3 right-3 text-left">
                  <p className="text-white text-xs font-semibold drop-shadow">{v.alt}</p>
                </div>
              </button>
            </AnimatedSection>
          ))}
        </div>
      </SectionWrapper>

      {/* Loading state */}
      {cmsLoading && <GallerySkeleton />}

      {/* Error state */}
      {cmsError && !cmsLoading && (
        <SectionWrapper background="background">
          <div className="public-gallery-error" role="alert">
            Could not load gallery images. Please refresh the page.
          </div>
        </SectionWrapper>
      )}

      {/* Gallery groups — rendered from Firestore */}
      {!cmsLoading && !cmsError && (
        <>
          {PUBLIC_GALLERY_GROUPS.filter((g) => (grouped[g] || []).length > 0).map((g, gi) => {
            const images = grouped[g]
            const baseOffset = groupOffsets[g]
            const section = PUBLIC_GALLERY_SECTIONS[g]
            return (
              <SectionWrapper key={g} background={gi % 2 === 0 ? 'muted' : 'white'}>
                <AnimatedSection className="text-center flex justify-center mb-10">
                  <SectionHeader
                    eyebrow={section?.eyebrow}
                    title={section?.title || 'Gallery'}
                    subtitle={section?.subtitle}
                    centered
                  />
                </AnimatedSection>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 auto-rows-[220px] md:auto-rows-[260px]">
                  {images.map((item, imgIdx) => {
                    const globalIdx = baseOffset + imgIdx
                    return (
                      <AnimatedSection key={item.id} delay={imgIdx * 0.07}>
                        <button
                          aria-label={`Open image: ${item.altText}`}
                          onClick={() => setLightboxIndex(globalIdx)}
                          className="w-full h-full rounded-[var(--radius-xl)] overflow-hidden group focus-visible:ring-2 focus-visible:ring-[var(--color-primary-400)] block relative"
                        >
                          <img
                            src={item.downloadURL}
                            alt={item.altText}
                            className="w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
                            loading="lazy"
                            decoding="async"
                            sizes="(max-width: 640px) 50vw, 33vw"
                          />
                          {item.caption && (
                            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                              <p className="text-white text-xs leading-snug">{item.caption}</p>
                            </div>
                          )}
                        </button>
                      </AnimatedSection>
                    )
                  })}
                </div>
              </SectionWrapper>
            )
          })}

          {/* Empty state — all groups empty (pre-seed) */}
          {allItems.length === 0 && (
            <SectionWrapper background="muted">
              <AnimatedSection className="text-center">
                <div className="public-gallery-empty">
                  <Images size={32} aria-hidden="true" className="public-gallery-empty-icon" />
                  <p>Gallery photos coming soon. Check back later!</p>
                </div>
              </AnimatedSection>
            </SectionWrapper>
          )}
        </>
      )}

      {/* Consent note */}
      <SectionWrapper background="muted">
        <AnimatedSection className="text-center max-w-lg mx-auto">
          <p className="text-[var(--color-text-muted)] text-xs leading-relaxed">
            All photographs and videos are taken and shared with the full written consent of parents
            and carers. No images containing children are shared on public social media without
            explicit permission.
          </p>
        </AnimatedSection>
      </SectionWrapper>

      {/* Lightbox */}
      {lightboxIndex !== null && (
        <Lightbox
          item={allLightboxItems[lightboxIndex]}
          total={allLightboxItems.length}
          index={lightboxIndex}
          onClose={closeLightbox}
          onPrev={goPrev}
          onNext={goNext}
        />
      )}

      <CTASection />
    </>
  )
}
