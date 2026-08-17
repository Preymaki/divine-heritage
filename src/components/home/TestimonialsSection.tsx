import { Star, Quote, ExternalLink } from 'lucide-react'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Autoplay, Pagination } from 'swiper/modules'
import 'swiper/css'
import 'swiper/css/pagination'
import { TESTIMONIALS } from '@data/testimonials'
import AnimatedSection from '@components/ui/AnimatedSection'
import SectionWrapper from '@components/ui/SectionWrapper'
import SectionHeader from '@components/ui/SectionHeader'
import Button from '@components/ui/Button'
import { SITE } from '@constants/site'

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5" aria-label={`${rating} out of 5 stars`} role="img">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          size={14}
          className={i < rating ? 'text-[var(--color-accent-400)] fill-[var(--color-accent-400)]' : 'text-gray-200'}
          aria-hidden="true"
        />
      ))}
    </div>
  )
}

export default function TestimonialsSection() {
  return (
    <SectionWrapper id="testimonials" background="muted">
      <AnimatedSection className="text-center flex justify-center">
        <SectionHeader
          eyebrow="Google Reviews · 4.9 ★"
          title="What Families Say About Divine Heritage"
          subtitle="Real, verified reviews from parents on Google Maps, reflecting the high standard of care provided."
          centered
          maxWidth="max-w-2xl"
        />
      </AnimatedSection>

      <AnimatedSection delay={0.2} className="mt-12">
        <Swiper
          modules={[Autoplay, Pagination]}
          spaceBetween={20}
          slidesPerView={1}
          breakpoints={{
            640: { slidesPerView: 1.2 },
            768: { slidesPerView: 2 },
            1024: { slidesPerView: 3 },
          }}
          autoplay={{ delay: 5000, disableOnInteraction: false, pauseOnMouseEnter: true }}
          pagination={{ clickable: true }}
          loop
          className="pb-12"
          aria-label="Parent testimonials carousel"
        >
          {TESTIMONIALS.map((t) => (
            <SwiperSlide key={t.id} className="h-auto">
              <article
                className="bg-white rounded-[var(--radius-xl)] p-6 shadow-[var(--shadow-soft)] border border-[var(--color-muted)] h-full flex flex-col"
                aria-label={`Testimonial from ${t.name}`}
              >
                {/* Quote icon */}
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center mb-4 shrink-0"
                  style={{ backgroundColor: `${t.colour}15` }}
                >
                  <Quote size={18} style={{ color: t.colour }} />
                </div>

                {/* Stars */}
                <StarRating rating={t.rating} />

                {/* Text */}
                <blockquote className="mt-4 flex-1">
                  <p className="text-[var(--color-text-secondary)] text-sm leading-relaxed">
                    "{t.text}"
                  </p>
                </blockquote>

                {/* Author */}
                <div className="flex items-center gap-3 mt-5 pt-4 border-t border-[var(--color-muted)]">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0"
                    style={{ backgroundColor: t.colour }}
                    aria-hidden="true"
                  >
                    {t.initials}
                  </div>
                  <div>
                    <p className="text-[var(--color-text-primary)] font-semibold text-sm leading-none">
                      {t.name}
                    </p>
                    <p className="text-[var(--color-text-muted)] text-xs mt-0.5">
                      {t.childAge}
                    </p>
                  </div>
                </div>
              </article>
            </SwiperSlide>
          ))}
        </Swiper>
      </AnimatedSection>

      <AnimatedSection delay={0.3} className="mt-4 flex justify-center">
        <Button
          as="a"
          href={SITE.social.childcare}
          target="_blank"
          rel="noopener noreferrer"
          variant="outline"
          size="md"
          id="see-more-reviews-btn"
        >
          <span>See More Reviews</span>
          <ExternalLink size={16} aria-hidden="true" />
        </Button>
      </AnimatedSection>
    </SectionWrapper>
  )
}
