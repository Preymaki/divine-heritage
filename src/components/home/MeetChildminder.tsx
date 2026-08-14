import { ArrowRight, CheckCircle, Heart } from 'lucide-react'
import { Link } from 'react-router-dom'
import AnimatedSection from '@components/ui/AnimatedSection'
import SectionWrapper from '@components/ui/SectionWrapper'
import SectionHeader from '@components/ui/SectionHeader'
import { IMAGES } from '@utils/images'
import { useAboutSettings } from '@hooks/useAboutSettings'

const CREDENTIALS = [
  'Ofsted registered childminder',
  'Paediatric First Aid certified',
  'Safeguarding & child protection trained',
  'EYFS (Early Years Foundation Stage) qualified',
  'Enhanced DBS checked',
  'Passionate advocate for play-based learning',
]

export default function MeetChildminder() {
  const { about } = useAboutSettings()
  const imageSrc = about.aboutImageUrl || IMAGES.meetChildminder

  return (
    <SectionWrapper id="meet-your-childminder" background="muted">
      {/* Decorative top accent */}
      <div className="flex justify-center mb-10">
        <div className="flex items-center gap-3">
          <div className="h-px w-16 bg-[var(--color-primary-200)]" aria-hidden="true" />
          <Heart size={16} className="text-[var(--color-accent-400)]" aria-hidden="true" />
          <div className="h-px w-16 bg-[var(--color-primary-200)]" aria-hidden="true" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
        {/* Image side */}
        <AnimatedSection direction="right" className="order-1 lg:order-2">
          <div className="relative max-w-sm mx-auto lg:max-w-full">
            {/* Main portrait */}
            <div className="rounded-[var(--radius-2xl)] overflow-hidden aspect-[3/4] shadow-[var(--shadow-elevated)]">
              <img
                src={imageSrc}
                alt="Divine Heritage childminder on the floor with four children exploring vegetables and natural materials together, demonstrating her hands-on nurturing approach"
                className="w-full h-full object-cover object-top"
                loading="lazy"
                decoding="async"
              />
            </div>

            {/* Experience badge */}
            <div
              className="absolute -bottom-4 -left-4 sm:-left-6 bg-white rounded-2xl p-4 shadow-[var(--shadow-elevated)] border border-[var(--color-muted)] flex items-center gap-3 max-w-[190px]"
              aria-hidden="true"
            >
              <div className="w-11 h-11 rounded-xl bg-[var(--color-accent-100)] flex items-center justify-center shrink-0">
                <span className="text-[var(--color-accent-500)] font-bold text-lg font-[var(--font-family-heading)]">
                  9+
                </span>
              </div>
              <div>
                <p className="text-[var(--color-text-primary)] font-semibold text-sm leading-tight">
                  Years of
                </p>
                <p className="text-[var(--color-text-muted)] text-xs">Trusted Experience</p>
              </div>
            </div>

            {/* "Outstanding" floating pill */}
            <div
              className="absolute -top-4 -right-3 sm:-right-5 bg-[var(--color-primary-500)] text-white rounded-2xl px-4 py-2.5 shadow-[var(--shadow-card)]"
              aria-hidden="true"
            >
              <p className="font-semibold text-sm leading-none">Home-Based</p>
              <p className="text-white/80 text-xs mt-0.5">Childminding</p>
            </div>
          </div>
        </AnimatedSection>

        {/* Text side */}
        <AnimatedSection direction="left" delay={0.12} className="order-2 lg:order-1">
          <SectionHeader
            eyebrow="Professional Childminder"
            title={about.bioName ? `Meet ${about.bioName}` : 'A Familiar Face You Can Trust'}
            maxWidth="max-w-full"
          />

          <div className="mt-5 space-y-4 text-[var(--color-text-secondary)] text-sm md:text-base leading-relaxed">
            {about.bioParagraphs && about.bioParagraphs.length > 0 ? (
              about.bioParagraphs.map((paragraph, index) => (
                <p key={index}>{paragraph}</p>
              ))
            ) : (
              <>
                <p>
                  At Divine Heritage, children are cared for by the same warm, familiar childminder 
                  every day. Consistency matters enormously to young children — and to parents.
                </p>
                <p>
                  With over 9 years of professional home childminding experience in London, the setting 
                  brings genuine passion, formal qualifications, and a deep commitment to every child's 
                  individual growth and happiness.
                </p>
                <p>
                  The home environment provides a welcoming second home for children, where safety, 
                  celebration, and inspiration are at the heart of daily care.
                </p>
              </>
            )}
          </div>

          {/* Credentials */}
          <div className="mt-7">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--color-text-muted)] mb-4">
              Qualifications & Training
            </p>
            <ul className="space-y-2.5" role="list">
              {CREDENTIALS.map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <CheckCircle
                    size={16}
                    className="text-[var(--color-primary-500)] mt-0.5 shrink-0"
                    aria-hidden="true"
                  />
                  <span className="text-[var(--color-text-secondary)] text-sm">{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Quote */}
          <blockquote className="mt-7 pl-4 border-l-2 border-[var(--color-accent-400)]">
            <p className="text-[var(--color-text-secondary)] text-sm italic leading-relaxed">
              "{about.bioQuote || 'Every child who enters Divine Heritage is welcomed into a family-centred environment where happiness, safety, and development remain the absolute priority.'}"
            </p>
          </blockquote>

          <Link
            to="/about"
            id="meet-childminder-read-more"
            className="inline-flex items-center gap-2 mt-7 text-[var(--color-primary-500)] font-semibold text-sm hover:gap-3 transition-all duration-200 group focus-visible:underline"
          >
            Read The Full Story
            <ArrowRight
              size={16}
              className="group-hover:translate-x-0.5 transition-transform duration-200"
              aria-hidden="true"
            />
          </Link>
        </AnimatedSection>
      </div>
    </SectionWrapper>
  )
}
