import { ArrowRight, CheckCircle } from 'lucide-react'
import { Link } from 'react-router-dom'
import AnimatedSection from '@components/ui/AnimatedSection'
import SectionWrapper from '@components/ui/SectionWrapper'
import SectionHeader from '@components/ui/SectionHeader'
import { useSiteImages } from '@hooks/useSiteImages'
import { useAboutSettings } from '@hooks/useAboutSettings'

const DEFAULT_HIGHLIGHTS = [
  { title: 'Belonging', description: 'emotional safety, inclusion, and feeling at home.' },
  { title: 'Growth', description: 'developmental progress, learning, and confidence.' },
  { title: 'Thrive', description: 'wellbeing, joy, and flourishing.' },
  { title: 'Partnership', description: 'strong relationships with families.' },
]

export default function AboutPreview() {
  const siteImages = useSiteImages()
  const { about } = useAboutSettings()

  const rawHighlights = about.highlights && about.highlights.length > 0
    ? about.highlights
    : DEFAULT_HIGHLIGHTS

  const highlightList = rawHighlights
    .filter((h) => !/nutriti|meal/i.test(h.title) && !/nutriti|meal/i.test(h.description))
    .map((h) => h.description ? `${h.title} — ${h.description}` : h.title)

  const previewImageSrc = about.aboutImageUrl || siteImages.homeAbout

  return (
    <SectionWrapper id="about-preview" background="white">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
        {/* Image side */}
        <AnimatedSection direction="left">
          <div className="relative">
            <div className="rounded-[var(--radius-2xl)] overflow-hidden aspect-[4/5] sm:aspect-[5/4] lg:aspect-[4/5] shadow-[var(--shadow-elevated)]">
              <img
                src={previewImageSrc}
                alt="Divine Heritage childminder sitting on the playroom floor with four children engaged in hands-on learning and sensory play"
                className="w-full h-full object-cover object-top"
                loading="lazy"
                decoding="async"
              />
            </div>
            {/* Floating stat card */}
            <div className="absolute -bottom-5 -right-3 sm:-right-6 bg-white rounded-2xl p-4 shadow-[var(--shadow-elevated)] border border-[var(--color-muted)] flex items-center gap-3.5 max-w-[200px]">
              <div className="w-12 h-12 rounded-xl bg-[var(--color-primary-50)] flex items-center justify-center shrink-0">
                <span className="text-[var(--color-primary-500)] font-bold text-xl font-[var(--font-family-heading)]">9+</span>
              </div>
              <div>
                <p className="text-[var(--color-text-primary)] font-semibold text-sm leading-tight">Years of</p>
                <p className="text-[var(--color-text-muted)] text-xs">Expert Childcare</p>
              </div>
            </div>
            {/* Floating badge */}
            <div className="absolute -top-4 -left-3 sm:-left-5 bg-[var(--color-accent-500)] text-white rounded-2xl px-4 py-2.5 shadow-[var(--shadow-card)]">
              <p className="font-semibold text-sm leading-none">London</p>
              <p className="text-white font-medium text-xs mt-0.5">Home-Based Care</p>
            </div>
          </div>
        </AnimatedSection>

        {/* Text side */}
        <AnimatedSection direction="right" delay={0.15}>
          <SectionHeader
            eyebrow="About Divine Heritage Childcare Services"
            title={about.previewTitle}
            subtitle={about.previewSubtitle || 'Founded in 2017, Divine Heritage provides warm, professional home-based childminding for families across South East London.'}
          />

          <ul className="mt-7 space-y-3.5" role="list">
            {highlightList.map((item) => (
              <li key={item} className="flex items-start gap-3">
                <CheckCircle
                  size={18}
                  className="text-[var(--color-primary-500)] mt-0.5 shrink-0"
                  aria-hidden="true"
                />
                <span className="text-[var(--color-text-secondary)] text-sm md:text-base">{item}</span>
              </li>
            ))}
          </ul>

          <blockquote className="mt-8 pl-4 border-l-2 border-[var(--color-accent-400)]">
            <p className="text-[var(--color-text-secondary)] text-sm md:text-base italic leading-relaxed">
              "{about.missionQuote || 'Creating a warm, nurturing space where every child feels safe, loved, and celebrated.'}"
            </p>
            <cite className="block mt-2 text-xs text-[var(--color-text-muted)] not-italic font-medium">
              Divine Heritage Childcare Service
            </cite>
          </blockquote>

          <div className="mt-8">
            <Link
              to="/about"
              id="about-preview-learn-more"
              className="inline-flex items-center gap-2 text-[var(--color-primary-500)] font-semibold text-sm hover:gap-3 transition-all duration-200 group"
            >
              Discover More About The Setting
              <ArrowRight
                size={16}
                className="group-hover:translate-x-0.5 transition-transform duration-200"
              />
            </Link>
          </div>
        </AnimatedSection>
      </div>
    </SectionWrapper>
  )
}
