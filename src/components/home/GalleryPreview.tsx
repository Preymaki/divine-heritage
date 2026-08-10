import { ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Autoplay, Pagination } from 'swiper/modules'
import 'swiper/css'
import 'swiper/css/pagination'
import AnimatedSection from '@components/ui/AnimatedSection'
import SectionWrapper from '@components/ui/SectionWrapper'
import SectionHeader from '@components/ui/SectionHeader'
import { IMAGES } from '@utils/images'

const GALLERY_PREVIEW = [
  { src: IMAGES.gallery1, alt: 'Two happy children smiling on swings at the park during a Divine Heritage outing' },
  { src: IMAGES.gallery2, alt: 'A child in a painting apron creating artwork at an easel during an arts and crafts session' },
  { src: IMAGES.gallery3, alt: 'A young child sitting independently reading a picture book at Divine Heritage' },
  { src: IMAGES.gallery4, alt: 'Divine Heritage childminder sitting on the floor with four children in hands-on sensory play' },
  { src: IMAGES.gallery5, alt: 'Two children exploring nature around a tree in a sunny park during an outdoor outing' },
  { src: IMAGES.gallery6, alt: 'Children delighting in a bubble play session at the local library during a Divine Heritage outing' },
]

export default function GalleryPreview() {
  return (
    <SectionWrapper id="gallery-preview" background="white">
      <AnimatedSection className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-10">
        <SectionHeader
          eyebrow="Our Space"
          title="See Our World"
          subtitle="A glimpse into the wonderful days we share at Divine Heritage."
          maxWidth="max-w-lg"
        />
        <Link
          to="/gallery"
          id="gallery-preview-view-all"
          className="inline-flex items-center gap-2 text-[var(--color-primary-500)] font-semibold text-sm shrink-0 hover:gap-3 transition-all duration-200 group focus-visible:underline"
        >
          View Full Gallery
          <ArrowRight
            size={16}
            className="group-hover:translate-x-0.5 transition-transform duration-200"
            aria-hidden="true"
          />
        </Link>
      </AnimatedSection>

      <AnimatedSection delay={0.15}>
        <Swiper
          modules={[Autoplay, Pagination]}
          spaceBetween={16}
          slidesPerView={1}
          breakpoints={{
            480: { slidesPerView: 1.5 },
            640: { slidesPerView: 2 },
            1024: { slidesPerView: 3 },
          }}
          autoplay={{ delay: 3500, disableOnInteraction: false, pauseOnMouseEnter: true }}
          pagination={{ clickable: true }}
          loop
          className="pb-10"
          aria-label="Gallery preview — a selection of our activities and environment"
          a11y={{
            prevSlideMessage: 'Previous image',
            nextSlideMessage: 'Next image',
          }}
        >
          {GALLERY_PREVIEW.map((image, i) => (
            <SwiperSlide key={i}>
              <div className="rounded-[var(--radius-xl)] overflow-hidden aspect-[4/3] group">
                <img
                  src={image.src}
                  alt={image.alt}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  loading="lazy"
                  decoding="async"
                />
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </AnimatedSection>
    </SectionWrapper>
  )
}
