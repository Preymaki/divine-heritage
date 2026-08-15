import { Home, Sparkles, BookOpen, Clock, Check, ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { SERVICES } from '@data/services'
import AnimatedSection from '@components/ui/AnimatedSection'
import SectionWrapper from '@components/ui/SectionWrapper'
import CTASection from '@components/home/CTASection'
import { useSiteImages } from '@hooks/useSiteImages'

const iconMap: Record<string, React.ComponentType<{ size?: number }>> = {
  Home,
  Sparkles,
  BookOpen,
}

const colourMap: Record<string, string> = {
  primary: 'var(--color-primary-500)',
  accent: 'var(--color-accent-400)',
  sage: 'var(--color-sage-500)',
}

const bgMap: Record<string, string> = {
  primary: 'var(--color-primary-50)',
  accent: 'var(--color-accent-50)',
  sage: 'var(--color-sage-50)',
}

export default function Services() {
  const siteImages = useSiteImages()

  const serviceImagesMap: Record<string, { src: string; alt: string; position: string }> = {
    childminding: {
      src: siteImages.serviceChildminding,
      alt: 'A toddler absorbed in building a wooden train track in the bright welcoming living room at Divine Heritage, illustrating the cosy home environment',
      position: 'object-top',
    },
    'early-years': {
      src: siteImages.serviceEarlyYears,
      alt: 'A young child sitting independently reading a picture book, demonstrating the love of stories and early literacy encouraged at Divine Heritage',
      position: 'object-top',
    },
    'after-school': {
      src: siteImages.serviceAfterSchool,
      alt: 'A toddler building strength and coordination on foam climbing blocks at a soft play session during an active outing arranged by Divine Heritage',
      position: 'object-center',
    },
  }

  return (
    <>
      {/* Page header */}
      <div className="bg-[var(--color-primary-900)] pt-32 pb-16">
        <div className="container-site">
          <AnimatedSection>
            <p className="text-[var(--color-accent-400)] text-xs font-semibold uppercase tracking-[0.15em] mb-3 font-[var(--font-family-heading)]">
              The Services
            </p>
            <h1 className="font-[var(--font-family-heading)] font-bold text-white text-4xl md:text-5xl leading-tight tracking-tight max-w-2xl">
              Care for Every Stage of Childhood
            </h1>
            <p className="mt-4 text-white/65 text-base md:text-lg leading-relaxed max-w-2xl">
              Divine Heritage offers a range of professional childcare services from babies and preschoolers, adapted entirely to the unique, individual needs of every child.
            </p>
          </AnimatedSection>
        </div>
      </div>

      {/* Services detail */}
      <SectionWrapper background="background">
        <div className="space-y-16 md:space-y-24">
          {SERVICES.map((service, i) => {
            const Icon = iconMap[service.icon] ?? Home
            const iconColour = colourMap[service.colour] ?? colourMap.primary
            const iconBg = bgMap[service.colour] ?? bgMap.primary
            const isReversed = i % 2 !== 0

            return (
              <AnimatedSection key={service.id} delay={i * 0.08}>
                <div
                  className={`grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center ${
                    isReversed ? 'lg:[&>*:first-child]:order-2' : ''
                  }`}
                >
                  {/* Image */}
                  <div className="rounded-[var(--radius-2xl)] overflow-hidden aspect-[4/3] bg-[var(--color-muted)]">
                    <img
                      src={serviceImagesMap[service.id]?.src ?? siteImages.serviceChildminding}
                      alt={serviceImagesMap[service.id]?.alt ?? service.title}
                      className={`w-full h-full object-cover ${serviceImagesMap[service.id]?.position ?? 'object-center'}`}
                      loading="lazy"
                      decoding="async"
                    />
                  </div>

                  {/* Content */}
                  <div>
                    <div
                      className="w-14 h-14 rounded-2xl flex items-center justify-center mb-5"
                      style={{ backgroundColor: iconBg, color: iconColour }}
                      aria-hidden="true"
                    >
                      <Icon size={26} />
                    </div>

                    <h2 className="font-[var(--font-family-heading)] font-bold text-2xl md:text-3xl text-[var(--color-text-primary)] leading-tight mb-3">
                      {service.title}
                    </h2>

                    <div className="flex flex-wrap gap-2 mb-5">
                      <span className="text-xs text-[var(--color-text-muted)] bg-[var(--color-muted)] rounded-full px-3 py-1.5">
                        {service.ageRange}
                      </span>
                      <span className="text-xs text-[var(--color-text-muted)] bg-[var(--color-muted)] rounded-full px-3 py-1.5 flex items-center gap-1">
                        <Clock size={11} aria-hidden="true" /> {service.availability}
                      </span>
                    </div>

                    <p className="text-[var(--color-text-secondary)] text-base leading-relaxed mb-6">
                      {service.description}
                    </p>

                    <div className="bg-white border border-[var(--color-muted)] rounded-[var(--radius-lg)] p-5">
                      <p className="font-semibold text-sm text-[var(--color-text-primary)] mb-3 font-[var(--font-family-heading)]">
                        What's Included
                      </p>
                      <ul className="grid grid-cols-1 sm:grid-cols-2 gap-y-2.5 gap-x-4" role="list">
                        {service.features.map((f) => (
                          <li key={f} className="flex items-start gap-2 text-sm text-[var(--color-text-secondary)]">
                            <Check
                              size={14}
                              className="mt-0.5 shrink-0"
                              style={{ color: iconColour }}
                              aria-hidden="true"
                            />
                            {f}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <Link
                      to="/contact"
                      className="inline-flex items-center gap-2 mt-6 px-6 py-3 rounded-xl font-semibold text-sm text-white transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[var(--shadow-card)] group focus-visible:outline-2 focus-visible:outline-offset-2"
                      style={{ backgroundColor: iconColour }}
                      id={`service-${service.id}-enquire`}
                    >
                      Enquire About This Service
                      <ArrowRight size={15} className="group-hover:translate-x-0.5 transition-transform" aria-hidden="true" />
                    </Link>
                  </div>
                </div>
              </AnimatedSection>
            )
          })}
        </div>
      </SectionWrapper>



      <CTASection />
    </>
  )
}
