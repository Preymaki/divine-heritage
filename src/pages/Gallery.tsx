/**
 * Gallery page — /gallery
 *
 * Public-facing gallery page.
 *
 * Structure:
 *  1. Page hero header
 *  2. Video showcase (hardcoded — always shown)
 *  3. CMS-managed section — Firestore published images (dynamic, newest first)
 *  4. Themed hardcoded image groups (existing curated content)
 *  5. Consent notice
 *  6. CTA section
 *
 * Lightbox includes both videos, CMS images, and hardcoded images.
 */

import { useState, useEffect } from 'react'
import { X, Play, ChevronLeft, ChevronRight, Images } from 'lucide-react'
import AnimatedSection from '@components/ui/AnimatedSection'
import SectionWrapper from '@components/ui/SectionWrapper'
import SectionHeader from '@components/ui/SectionHeader'
import CTASection from '@components/home/CTASection'
import { IMAGES, VIDEOS } from '@utils/images'
import { subscribeToPublishedGallery } from '@services/gallery'
import type { GalleryItem } from '@appTypes/gallery'

// ─── Hardcoded gallery groups (curated content) ───────────────────────────────

const GALLERY_GROUPS: Array<{
  title: string
  subtitle: string
  images: Array<{ src: string; alt: string; wide?: boolean }>
}> = [
  {
    title: 'Adventures Out & About',
    subtitle: 'We love exploring London — parks, playgrounds, libraries, and beyond.',
    images: [
      { src: IMAGES.galleryOutings1, alt: 'Two happy children smiling on swings at the park during a Divine Heritage outing', wide: true },
      { src: IMAGES.galleryOutings2, alt: 'Two children exploring nature around a tree in a sunny park during a Divine Heritage outing' },
      { src: IMAGES.galleryOutings3, alt: 'A child enjoying a spinning ride at an outdoor playground during a Divine Heritage park outing' },
      { src: IMAGES.galleryOutings4, alt: 'A child confidently navigating a rope climbing frame at an adventure playground during a Divine Heritage outing' },
      { src: IMAGES.galleryOutings5, alt: 'A toddler riding a red rocking horse in the garden at Divine Heritage' },
      { src: IMAGES.galleryOutings6, alt: 'A toddler building strength on foam climbing blocks at a soft play session during a Divine Heritage outing' },
    ],
  },
  {
    title: 'Library & Learning Trips',
    subtitle: 'Regular library visits nurture a love of books, stories, and imagination.',
    images: [
      { src: IMAGES.galleryLibrary1, alt: 'Children delighting in a bubble play session at the local library during a Divine Heritage outing' },
      { src: IMAGES.galleryLibrary2, alt: 'Two toddlers playing together with bubbles on a colourful alphabet rug during a library visit', wide: true },
      { src: IMAGES.galleryLibrary3, alt: 'A toddler joyfully tumbling on a brightly coloured educational rug at the local library' },
    ],
  },
  {
    title: 'Play, Learning & Creativity',
    subtitle: 'Every day brings rich, hands-on experiences that spark curiosity and growth.',
    images: [
      { src: IMAGES.galleryLearning1, alt: 'A young child sitting independently reading a picture book, demonstrating a love of stories at Divine Heritage', wide: true },
      { src: IMAGES.galleryLearning2, alt: 'A child in a painting apron creating artwork at an easel during an arts and crafts session at Divine Heritage' },
      { src: IMAGES.galleryLearning3, alt: 'Divine Heritage childminder sitting on the floor with four children exploring vegetables and sensory play together', wide: true },
    ],
  },
  {
    title: 'Our Home Environment',
    subtitle: 'A warm, stimulating home full of age-appropriate toys and learning resources.',
    images: [
      { src: IMAGES.galleryIndoor1, alt: 'A toddler absorbed in building a wooden train track in the bright welcoming living room at Divine Heritage' },
      { src: IMAGES.galleryIndoor2, alt: 'Three children playing with a toy kitchen and food items along the hallway of the Divine Heritage childcare home' },
      { src: IMAGES.galleryIndoor3, alt: 'Children engaged in imaginative play with animal figures on a colourful number play mat at Divine Heritage' },
      { src: IMAGES.galleryIndoor4, alt: 'A baby enjoying tummy time and sensory exploration with a bright toy on a stimulating play mat at Divine Heritage' },
      { src: IMAGES.galleryIndoor5, alt: 'Children playing with toy kitchen food items and toys in the hallway of the Divine Heritage home' },
      { src: IMAGES.galleryIndoor6, alt: 'A child exploring a collection of animal figures on a play mat at Divine Heritage childcare' },
    ],
  },
]

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

// ─── CMS image grid skeleton ───────────────────────────────────────────────────

function CmsGallerySkeleton() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 auto-rows-[220px] md:auto-rows-[260px]">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="public-gallery-skeleton rounded-[var(--radius-xl)]" />
      ))}
    </div>
  )
}

// ─── Main component ────────────────────────────────────────────────────────────

export default function Gallery() {
  // ── Firestore CMS images ─────────────────────────────────────────────────
  const [cmsItems,   setCmsItems]   = useState<GalleryItem[]>([])
  const [cmsLoading, setCmsLoading] = useState(true)
  const [cmsError,   setCmsError]   = useState<string | null>(null)

  useEffect(() => {
    const unsub = subscribeToPublishedGallery(
      (items) => { setCmsItems(items); setCmsLoading(false) },
      (err)   => { setCmsError(err.message); setCmsLoading(false) },
    )
    return unsub
  }, [])

  // ── Build flat lightbox list ──────────────────────────────────────────────
  // Order: 2 videos → CMS images → hardcoded groups
  const allImages: LightboxItem[] = [
    { src: VIDEOS.libraryClip1, alt: 'Children playing with bubbles at the library — video clip 1', type: 'video' },
    { src: VIDEOS.libraryClip2, alt: 'Children enjoying a bubble play session at the local library', type: 'video' },
    ...cmsItems.map((item) => ({
      src: item.downloadURL,
      alt: item.altText,
      caption: item.caption || undefined,
      type: 'image' as const,
    })),
    ...GALLERY_GROUPS.flatMap((g) => g.images.map((img) => ({ src: img.src, alt: img.alt, type: 'image' as const }))),
  ]

  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)
  const closeLightbox = () => setLightboxIndex(null)
  const goPrev = () => setLightboxIndex((i) => (i == null ? 0 : (i - 1 + allImages.length) % allImages.length))
  const goNext = () => setLightboxIndex((i) => (i == null ? 0 : (i + 1) % allImages.length))

  // CMS section starts at index 2 (after 2 videos)
  const CMS_OFFSET = 2

  // Hardcoded groups start after videos + CMS images
  let imageOffset = CMS_OFFSET + cmsItems.length

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

      {/* Page hero */}
      <div className="bg-[var(--color-primary-900)] pt-32 pb-16">
        <div className="container-site">
          <AnimatedSection>
            <p className="text-[var(--color-accent-400)] text-xs font-semibold uppercase tracking-[0.15em] mb-3 font-[var(--font-family-heading)]">
              Gallery
            </p>
            <h1 className="font-[var(--font-family-heading)] font-bold text-white text-4xl md:text-5xl leading-tight tracking-tight max-w-2xl">
              A Glimpse Into Our World
            </h1>
            <p className="mt-4 text-white/65 text-base md:text-lg leading-relaxed max-w-xl">
              Real moments from a typical week at Divine Heritage — happy children, enriching
              activities, and a warm, welcoming home environment.
            </p>
          </AnimatedSection>
        </div>
      </div>

      {/* Videos */}
      <SectionWrapper background="muted">
        <AnimatedSection className="text-center flex justify-center mb-10">
          <SectionHeader
            eyebrow="In Motion"
            title="See the Joy for Yourself"
            subtitle="Short clips from our library outing — click to watch."
            centered
          />
        </AnimatedSection>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-3xl mx-auto">
          {[
            { src: VIDEOS.libraryClip1, poster: IMAGES.galleryLibrary1, alt: 'Children playing with bubbles at the library — video clip 1', idx: 0 },
            { src: VIDEOS.libraryClip2, poster: IMAGES.galleryLibrary2, alt: 'Children enjoying a bubble play session at the library — video clip 2', idx: 1 },
          ].map((v) => (
            <AnimatedSection key={v.src} delay={v.idx * 0.1}>
              <button
                aria-label={v.alt}
                onClick={() => setLightboxIndex(v.idx)}
                className="relative w-full rounded-[var(--radius-xl)] overflow-hidden aspect-[9/16] sm:aspect-[4/3] group focus-visible:ring-2 focus-visible:ring-[var(--color-primary-400)]"
              >
                <img src={v.poster} alt="" aria-hidden="true" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" loading="lazy" />
                <div className="absolute inset-0 bg-black/35 flex items-center justify-center transition-colors duration-200 group-hover:bg-black/20">
                  <div className="w-14 h-14 rounded-full bg-white/90 flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform duration-200">
                    <Play size={22} className="text-[var(--color-primary-600)] ml-1" aria-hidden="true" />
                  </div>
                </div>
                <span className="sr-only">{v.alt}</span>
              </button>
            </AnimatedSection>
          ))}
        </div>
      </SectionWrapper>

      {/* ── CMS-managed images section ── */}
      {(cmsLoading || cmsError || cmsItems.length > 0) && (
        <SectionWrapper background="background">
          <AnimatedSection className="text-center flex justify-center mb-10">
            <SectionHeader
              eyebrow="Latest"
              title="Fresh from the Childminder"
              subtitle="Newly uploaded moments, added directly by Divine Heritage."
              centered
            />
          </AnimatedSection>

          {/* Error state */}
          {cmsError && !cmsLoading && (
            <div className="public-gallery-error" role="alert">
              Could not load latest images. Please refresh the page.
            </div>
          )}

          {/* Loading state */}
          {cmsLoading && <CmsGallerySkeleton />}

          {/* Images */}
          {!cmsLoading && !cmsError && cmsItems.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 auto-rows-[220px] md:auto-rows-[260px]">
              {cmsItems.map((item, imgIdx) => {
                const globalIdx = CMS_OFFSET + imgIdx
                return (
                  <AnimatedSection key={item.id} delay={imgIdx * 0.06}>
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
          )}

          {/* Empty state — only show if not loading and no CMS error */}
          {!cmsLoading && !cmsError && cmsItems.length === 0 && (
            <div className="public-gallery-empty">
              <Images size={32} aria-hidden="true" className="public-gallery-empty-icon" />
              <p>New photos coming soon. Check back later!</p>
            </div>
          )}
        </SectionWrapper>
      )}

      {/* Themed hardcoded groups */}
      {GALLERY_GROUPS.map((group, gi) => {
        const groupOffset = imageOffset
        imageOffset += group.images.length
        return (
          <SectionWrapper key={group.title} background={gi % 2 === 0 ? 'muted' : 'white'}>
            <AnimatedSection className="text-center flex justify-center mb-10">
              <SectionHeader
                eyebrow={`${gi + 1} of ${GALLERY_GROUPS.length}`}
                title={group.title}
                subtitle={group.subtitle}
                centered
              />
            </AnimatedSection>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 auto-rows-[220px] md:auto-rows-[260px]">
              {group.images.map((image, imgIdx) => {
                const globalIdx = groupOffset + imgIdx
                return (
                  <AnimatedSection key={image.src} delay={imgIdx * 0.07} className={image.wide ? 'col-span-2 md:col-span-2' : ''}>
                    <button
                      aria-label={`Open image: ${image.alt}`}
                      onClick={() => setLightboxIndex(globalIdx)}
                      className="w-full h-full rounded-[var(--radius-xl)] overflow-hidden group focus-visible:ring-2 focus-visible:ring-[var(--color-primary-400)] block"
                    >
                      <img
                        src={image.src}
                        alt={image.alt}
                        className="w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
                        loading="lazy"
                        decoding="async"
                      />
                    </button>
                  </AnimatedSection>
                )
              })}
            </div>
          </SectionWrapper>
        )
      })}

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
          item={allImages[lightboxIndex]}
          total={allImages.length}
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
