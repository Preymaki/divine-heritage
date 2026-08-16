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
  Clock,
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

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-12">
        {SERVICES.map((service, i) => {
          const Icon = iconMap[service.icon] ?? Home
          const iconColour = colourMap[service.colour] ?? colourMap.primary
          const iconBg = bgMap[service.colour] ?? bgMap.primary

          return (
            <AnimatedSection key={service.id} delay={i * 0.1}>
              <article
                className="bg-white rounded-[var(--radius-xl)] p-6 shadow-[var(--shadow-soft)] border border-[var(--color-muted)] transition-all duration-300 hover:shadow-[var(--shadow-card)] hover:-translate-y-1 h-full flex flex-col group"
                aria-label={service.title}
              >
                {/* Icon */}
                <div
                  className="rounded-2xl flex items-center justify-center mb-4 shrink-0 transition-transform duration-300 group-hover:scale-105"
                  style={{ backgroundColor: iconBg, width: 48, height: 48, color: iconColour }}
                  aria-hidden="true"
                >
                  <Icon size={22} />
                </div>

                {/* Title + meta badges */}
                <h3 className="font-[var(--font-family-heading)] font-bold text-lg text-[var(--color-text-primary)] leading-snug">
                  {service.title}
                </h3>
                <div className="flex flex-wrap gap-2 mt-2 mb-3.5">
                  <span className="text-xs font-medium text-[var(--color-text-muted)] bg-[var(--color-muted)] rounded-full px-3 py-1">
                    {service.shortAge}
                  </span>
                  <span className="text-xs font-medium text-[var(--color-text-muted)] bg-[var(--color-muted)] rounded-full px-3 py-1">
                    {service.shortAvailability}
                  </span>
                </div>

                {/* Short catchy description */}
                <p className="text-[var(--color-text-secondary)] text-sm leading-relaxed mb-4">
                  {service.shortDescription}
                </p>

                {/* Top 3 highlights */}
                <ul className="mt-auto space-y-2 mb-5 pt-2" role="list">
                  {service.highlights.map((h) => (
                    <li key={h} className="flex items-center gap-2 text-xs text-[var(--color-text-secondary)]">
                      <Check
                        size={13}
                        className="shrink-0 font-bold"
                        style={{ color: iconColour }}
                        aria-hidden="true"
                      />
                      <span>{h}</span>
                    </li>
                  ))}
                </ul>

                {/* Learn More Action Link */}
                <div className="pt-3.5 border-t border-[var(--color-muted)]">
                  <Link
                    to={`/services#${service.id}`}
                    className="inline-flex items-center gap-1.5 text-sm font-semibold transition-colors duration-200 group/link"
                    style={{ color: iconColour }}
                    aria-label={`Learn more about ${service.title}`}
                  >
                    <span>Learn More</span>
                    <ArrowRight
                      size={14}
                      className="group-hover/link:translate-x-0.5 transition-transform duration-200"
                      aria-hidden="true"
                    />
                  </Link>
                </div>
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
