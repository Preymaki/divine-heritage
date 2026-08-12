import { CheckCircle, Award, Heart, BookOpen, Users } from 'lucide-react'
import AnimatedSection from '@components/ui/AnimatedSection'
import SectionWrapper from '@components/ui/SectionWrapper'
import SectionHeader from '@components/ui/SectionHeader'
import CTASection from '@components/home/CTASection'
import { IMAGES } from '@utils/images'


const QUALIFICATIONS = [
  { icon: Award, label: 'Ofsted Registered', detail: 'Fully registered childminder' },
  { icon: BookOpen, label: 'EYFS Qualified', detail: 'Early Years Foundation Stage' },
  { icon: Heart, label: 'Paediatric First Aid', detail: 'Current certification held' },
  { icon: Users, label: 'Safeguarding Trained', detail: 'Up-to-date child protection' },
  { icon: CheckCircle, label: 'Enhanced DBS Checked', detail: 'All household adults checked' },
  { icon: Award, label: 'Public Liability Insurance', detail: 'Full professional cover' },
]

const VALUES = [
  {
    title: 'Safety First',
    description:
      'Our home is fully risk-assessed and equipped to the highest safety standards. Every corner, every outing, and every activity is planned with your child\'s safety as the absolute priority.',
  },
  {
    title: 'Nurturing Environment',
    description:
      'We create a warm, loving, and consistent environment that helps children develop secure attachments, emotional resilience, and a deep sense of belonging.',
  },
  {
    title: 'Individualised Attention',
    description:
      'With a small, carefully managed number of children, we ensure every child receives the personalised attention and care they deserve.',
  },
  {
    title: 'Family Partnership',
    description:
      'We work closely with parents and carers, sharing daily updates, photos, and progress reports. Your family is our partner in your child\'s development.',
  },
]

export default function About() {
  return (
    <>
      {/* Page Header */}
      <div className="bg-[var(--color-primary-900)] pt-32 pb-16">
        <div className="container-site">
          <AnimatedSection>
            <p className="text-[var(--color-accent-400)] text-xs font-semibold uppercase tracking-[0.15em] mb-3 font-[var(--font-family-heading)]">
              About Us
            </p>
            <h1 className="font-[var(--font-family-heading)] font-bold text-white text-4xl md:text-5xl leading-tight tracking-tight max-w-2xl">
              A Childminder Who Truly Cares
            </h1>
            <p className="mt-4 text-white/65 text-base md:text-lg leading-relaxed max-w-xl">
              Learn about our philosophy, qualifications, and the values that make Divine Heritage a 
              setting parents trust completely.
            </p>
          </AnimatedSection>
        </div>
      </div>

      {/* About story */}
      <SectionWrapper background="white">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-start">
          <AnimatedSection direction="left">
            <div className="rounded-[var(--radius-2xl)] overflow-hidden aspect-[4/5]">
              <img
                src={IMAGES.aboutChildminder}
                alt="Divine Heritage childminder sitting on the floor with four children doing hands-on sensory and vegetable play, illustrating the nurturing and interactive approach at Divine Heritage"
                className="w-full h-full object-cover object-top"
                loading="lazy"
                decoding="async"
              />
            </div>
          </AnimatedSection>

          <AnimatedSection direction="right" delay={0.15}>
            <SectionHeader
              eyebrow="Our Story"
              title="Welcome to Divine Heritage"
              maxWidth="max-w-full"
            />
            <div className="space-y-4 mt-5 text-[var(--color-text-secondary)] text-sm md:text-base leading-relaxed">
              <p>
                Divine Heritage Childcare Service is a professional home-based childminding service 
                where children can learn, play, and grow safely. We believe that a loving, familiar 
                home environment is the very best foundation for a child's early years.
              </p>
              <p>
                We welcome children from birth to 5 years old, as well as school-age children for 
                after-school care — covering toddlers, pre-schoolers, and school-age groups. 
                Every child is treated as an individual and cared for at their own pace.
              </p>
              <p>
                Our large playroom is thoughtfully equipped with age-appropriate resources to spark 
                curiosity and creativity. Children also have access to our enclosed garden for daily 
                fresh air and outdoor play, whatever the season.
              </p>
              <p>
                We make regular outings to the local playground, library, and community playgroups — 
                giving children rich social experiences and a connection to their local community. 
                We work in true partnership with families, maintaining open and honest communication 
                every step of the way.
              </p>
            </div>

            {/* Qualifications grid */}
            <div className="mt-8">
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--color-text-muted)] mb-4">
                Qualifications & Certifications
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {QUALIFICATIONS.map(({ icon: Icon, label, detail }) => (
                  <div
                    key={label}
                    className="flex items-start gap-3 p-3.5 bg-[var(--color-background)] border border-[var(--color-muted)] rounded-[var(--radius-lg)]"
                  >
                    <div className="w-8 h-8 rounded-lg bg-[var(--color-primary-50)] flex items-center justify-center shrink-0">
                      <Icon size={15} className="text-[var(--color-primary-500)]" />
                    </div>
                    <div>
                      <p className="text-[var(--color-text-primary)] font-semibold text-xs leading-snug">
                        {label}
                      </p>
                      <p className="text-[var(--color-text-muted)] text-xs mt-0.5">{detail}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </AnimatedSection>
        </div>
      </SectionWrapper>

      {/* Our Values */}
      <SectionWrapper id="our-values" background="muted">
        <AnimatedSection className="text-center flex justify-center mb-12">
          <SectionHeader
            eyebrow="Our Values"
            title="What We Stand For"
            subtitle="Everything we do flows from four core values that guide our approach to childcare."
            centered
          />
        </AnimatedSection>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {VALUES.map((v, i) => (
            <AnimatedSection key={v.title} delay={i * 0.1}>
              <div className="bg-white p-7 rounded-[var(--radius-xl)] border border-[var(--color-muted)] shadow-[var(--shadow-soft)] h-full">
                <div className="w-8 h-1 bg-[var(--color-primary-500)] rounded-full mb-4" />
                <h3 className="font-[var(--font-family-heading)] font-semibold text-lg text-[var(--color-text-primary)] mb-3">
                  {v.title}
                </h3>
                <p className="text-[var(--color-text-secondary)] text-sm leading-relaxed">
                  {v.description}
                </p>
              </div>
            </AnimatedSection>
          ))}
        </div>
      </SectionWrapper>

      {/* Mission statement */}
      <SectionWrapper background="white">
        <AnimatedSection>
          <div className="max-w-3xl mx-auto text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.15em] text-[var(--color-primary-500)] mb-5 font-[var(--font-family-heading)]">
              Our Mission
            </p>
            <blockquote>
              <p className="text-2xl md:text-3xl font-[var(--font-family-heading)] font-medium text-[var(--color-text-primary)] leading-relaxed italic">
                "Every child deserves to feel safe, loved, and celebrated. Divine Heritage provides a warm, nurturing space where children can explore, discover, and grow with confidence."
              </p>
              <cite className="block mt-6 text-sm text-[var(--color-text-muted)] not-italic font-medium">
                — Divine Heritage Childcare Service
              </cite>
            </blockquote>
          </div>
        </AnimatedSection>
      </SectionWrapper>

      <CTASection />
    </>
  )
}
