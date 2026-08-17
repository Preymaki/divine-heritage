import { ArrowRight, Phone } from 'lucide-react'
import { Link } from 'react-router-dom'
import { motion, useReducedMotion } from 'framer-motion'
import AnimatedSection from '@components/ui/AnimatedSection'
import { useContactSettings } from '@hooks/useContactSettings'
import { useSiteImages } from '@hooks/useSiteImages'


export default function CTASection() {
  const prefersReducedMotion = useReducedMotion()
  const { contact } = useContactSettings()
  const siteImages = useSiteImages()

  return (
    <section
      className="relative overflow-hidden py-20 md:py-28"
      aria-label="Contact Divine Heritage and book a visit"
    >
      {/* Background */}
      <div className="absolute inset-0 z-0">
        <img
          src={siteImages.homeCta}
          alt=""
          aria-hidden="true"
          className="w-full h-full object-cover object-center"
          loading="lazy"
          decoding="async"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-primary-900)]/95 via-[var(--color-primary-800)]/90 to-[var(--color-primary-900)]/95" />
      </div>

      {/* Decorative blobs */}
      <div
        className="absolute top-0 right-0 w-96 h-96 rounded-full blur-3xl pointer-events-none"
        style={{ background: 'rgba(224,40,155,0.15)' }}
        aria-hidden="true"
      />
      <div
        className="absolute bottom-0 left-0 w-64 h-64 rounded-full blur-3xl pointer-events-none"
        style={{ background: 'rgba(30,86,208,0.22)' }}
        aria-hidden="true"
      />

      {/* Content */}
      <div className="relative z-10 container-site text-center">
        <AnimatedSection>
          <p className="text-[var(--color-accent-400)] text-xs font-semibold uppercase tracking-[0.15em] mb-4 font-[var(--font-family-heading)]">
            Ready to Get Started?
          </p>
          <h2 className="font-[var(--font-family-heading)] font-bold text-white leading-tight tracking-tight max-w-2xl mx-auto"
            style={{ fontSize: 'clamp(2rem, 4vw, 3rem)' }}>
            Give Your Child the Best Possible Start
          </h2>
          <p className="mt-4 text-white/90 text-base md:text-lg leading-relaxed max-w-xl mx-auto drop-shadow-[0_1px_2px_rgba(0,0,0,0.4)]">
            Book a free introductory visit to explore the setting and see why families 
            trust Divine Heritage Childcare Service.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-9">
            <Link
              to="/contact"
              id="cta-section-book-visit"
              className="inline-flex items-center gap-2.5 px-8 py-4 bg-[var(--color-accent-500)] hover:bg-[var(--color-accent-400)] text-white font-semibold rounded-xl text-base transition-all duration-200 hover:shadow-[0_8px_32px_rgba(224,40,155,0.40)] hover:-translate-y-0.5 group"
            >
              Book a Free Visit
              <ArrowRight size={18} className="group-hover:translate-x-0.5 transition-transform" />
            </Link>
            <a
              href={`tel:${contact.phone.replace(/\s/g, '')}`}
              id="cta-section-call"
              className="inline-flex items-center gap-2.5 px-8 py-4 bg-white/12 hover:bg-white/20 backdrop-blur-sm border border-white/25 text-white font-semibold rounded-xl text-base transition-all duration-200 hover:-translate-y-0.5 group shadow-xs"
            >
              <Phone size={18} className="group-hover:scale-110 transition-transform" />
              {contact.phone}
            </a>
          </div>

          {/* Reassurance note */}
          {!prefersReducedMotion ? (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="mt-6 text-white/80 text-sm drop-shadow-[0_1px_2px_rgba(0,0,0,0.4)]"
            >
              No obligation. All questions are welcome.
            </motion.p>
          ) : (
            <p className="mt-6 text-white/80 text-sm drop-shadow-[0_1px_2px_rgba(0,0,0,0.4)]">
              No obligation. All questions are welcome.
            </p>
          )}
        </AnimatedSection>
      </div>
    </section>
  )
}
