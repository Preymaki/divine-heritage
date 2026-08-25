import React from 'react'
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

/** Renders a flat string[] into paragraphs, grouping consecutive '• '-prefixed items into a <ul>. */
function renderBio(paragraphs: string[]) {
  const elements: React.ReactNode[] = []
  let i = 0
  while (i < paragraphs.length) {
    if (paragraphs[i].startsWith('\u2022 ') || paragraphs[i].startsWith('• ')) {
      const bullets: string[] = []
      while (i < paragraphs.length && (paragraphs[i].startsWith('\u2022 ') || paragraphs[i].startsWith('• '))) {
        bullets.push(paragraphs[i].replace(/^[•\u2022]\s*/, ''))
        i++
      }
      elements.push(
        <ul key={`list-${i}`} className="space-y-1.5 pl-1" role="list">
          {bullets.map((b, bi) => (
            <li key={bi} className="flex items-start gap-2">
              <span className="mt-2 w-1.5 h-1.5 rounded-full bg-[var(--color-accent-400)] shrink-0" aria-hidden="true" />
              <span>{b}</span>
            </li>
          ))}
        </ul>
      )
    } else {
      elements.push(<p key={i}>{paragraphs[i]}</p>)
      i++
    }
  }
  return elements
}

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
              <p className="text-white font-medium text-xs mt-0.5">Childminding</p>
            </div>
          </div>
        </AnimatedSection>

        {/* Text side */}
        <AnimatedSection direction="left" delay={0.12} className="order-2 lg:order-1">
          <SectionHeader
            eyebrow="Professional Childminder"
            title="Welcome to Divine Heritage Childcare"
            maxWidth="max-w-full"
          />

          <div className="mt-5 space-y-4 text-[var(--color-text-secondary)] text-sm md:text-base leading-relaxed">
            {about.bioParagraphs && about.bioParagraphs.length > 0 ? (
              renderBio(about.bioParagraphs)
            ) : (
              <>
                <p>
                  With over a decade of dedicated early years experience, I launched Divine Heritage Childcare in 2017 to create something truly special: a vibrant, home-from-home environment where children don’t just stay—they thrive.
                </p>
                <p>
                  My journey began at sixteen, babysitting for friends and family. That early spark grew into a lifelong calling, ultimately inspiring me to step away from my previous career and pour my heart into professional childminding full-time.
                </p>
                <p>When I’m not planning personalised learning journeys, you’ll find me:</p>
                <ul className="space-y-1.5 pl-1" role="list">
                  {[
                    'Designing mind-stimulating activities tailored to spark natural curiosity.',
                    'Setting up sensory play stations in the garden for hands-on exploration.',
                    'Curling up on the sofa reading stories that fuel young imaginations.',
                  ].map((b, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="mt-2 w-1.5 h-1.5 rounded-full bg-[var(--color-accent-400)] shrink-0" aria-hidden="true" />
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>
                <p>This is a warm, loving home, which is exactly what makes the care here so extraordinary.</p>
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
