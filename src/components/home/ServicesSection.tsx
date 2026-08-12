import { Home, Sparkles, BookOpen, Clock, Check, ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { SERVICES } from '@data/services'
import AnimatedSection from '@components/ui/AnimatedSection'
import SectionWrapper from '@components/ui/SectionWrapper'
import SectionHeader from '@components/ui/SectionHeader'

const iconMap: Record<string, React.ComponentType<{ size?: number; className?: string }>> = {
  Home,
  Sparkles,
  BookOpen,
}

const colourMap: Record<string, string> = {
  primary: 'var(--color-primary-500)',
  accent: 'var(--color-accent-500)',
  sage: 'var(--color-sage-500)',
}

const bgMap: Record<string, string> = {
  primary: 'var(--color-primary-50)',
  accent: 'var(--color-accent-50)',
  sage: 'var(--color-sage-50)',
}

export default function ServicesSection() {
  return (
    <SectionWrapper id="services" background="muted">
      <AnimatedSection className="text-center flex justify-center">
        <SectionHeader
          eyebrow="The Services"
          title="Care Tailored to Every Stage"
          subtitle="Divine Heritage offers a range of professional childcare services from babies and preschoolers, adapted entirely to the unique, individual needs of every child."
          centered
        />
      </AnimatedSection>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-12">
        {SERVICES.map((service, i) => {
          const Icon = iconMap[service.icon] ?? Home
          const iconColour = colourMap[service.colour] ?? colourMap.primary
          const iconBg = bgMap[service.colour] ?? bgMap.primary

          return (
            <AnimatedSection key={service.id} delay={i * 0.1}>
              <article
                className="bg-white rounded-[var(--radius-xl)] p-7 shadow-[var(--shadow-soft)] border border-[var(--color-muted)] card-hover h-full flex flex-col"
                aria-label={service.title}
              >
                {/* Icon */}
                <div
                  className="rounded-2xl flex items-center justify-center mb-5 shrink-0"
                  style={{ backgroundColor: iconBg, width: 52, height: 52, color: iconColour }}
                  aria-hidden="true"
                >
                  <Icon size={24} /></div>

                {/* Title + meta */}
                <h3 className="font-[var(--font-family-heading)] font-semibold text-lg text-[var(--color-text-primary)] leading-snug">
                  {service.title}
                </h3>
                <div className="flex flex-wrap gap-2 mt-2.5 mb-4">
                  <span className="text-xs text-[var(--color-text-muted)] bg-[var(--color-muted)] rounded-full px-3 py-1">
                    {service.ageRange}
                  </span>
                  <span className="text-xs text-[var(--color-text-muted)] bg-[var(--color-muted)] rounded-full px-3 py-1 flex items-center gap-1">
                    <Clock size={11} /> {service.availability}
                  </span>
                </div>

                {/* Description */}
                <p className="text-[var(--color-text-secondary)] text-sm leading-relaxed flex-1">
                  {service.description}
                </p>

                {/* Feature list */}
                <ul className="mt-5 space-y-2" role="list">
                  {service.features.slice(0, 4).map((f) => (
                    <li key={f} className="flex items-start gap-2.5 text-sm text-[var(--color-text-secondary)]">
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

                {/* Link */}
                <Link
                  to="/services"
                  className="inline-flex items-center gap-1.5 mt-6 text-sm font-semibold group"
                  style={{ color: iconColour }}
                  aria-label={`Learn more about ${service.title}`}
                >
                  Learn More
                  <ArrowRight
                    size={14}
                    className="group-hover:translate-x-0.5 transition-transform duration-200"
                  />
                </Link>
              </article>
            </AnimatedSection>
          )
        })}
      </div>

      {/* Bottom CTA */}
      <AnimatedSection className="text-center mt-10" delay={0.3}>
        <Link
          to="/services"
          id="services-section-view-all"
          className="inline-flex items-center gap-2 px-7 py-3.5 bg-[var(--color-primary-500)] hover:bg-[var(--color-primary-600)] text-white font-semibold rounded-xl transition-all duration-200 hover:shadow-[var(--shadow-card)] hover:-translate-y-0.5 group"
        >
          View All Services
          <ArrowRight size={16} className="group-hover:translate-x-0.5 transition-transform duration-200" />
        </Link>
      </AnimatedSection>
    </SectionWrapper>
  )
}
