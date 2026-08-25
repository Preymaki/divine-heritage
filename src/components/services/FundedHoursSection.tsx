import { Link } from 'react-router-dom'
import { ArrowRight, Check, Info } from 'lucide-react'
import AnimatedSection from '@components/ui/AnimatedSection'
import SectionWrapper from '@components/ui/SectionWrapper'
import SectionHeader from '@components/ui/SectionHeader'

const STANDARD_FEES = [
  {
    name: 'Hourly Rate',
    price: '£12.00',
    frequency: 'per hour',
    detail: 'Standard hourly childcare rate',
  },
  {
    name: 'Day Rate',
    price: '£70.00',
    frequency: 'per day',
    detail: 'Applies when care exceeds 5 hours',
  },
  {
    name: 'Full-Time Care',
    price: '£330.00',
    frequency: 'per week',
    detail: 'Full weekly placement',
  },
  {
    name: 'Ad Hoc Booking',
    price: '£18.00',
    frequency: 'per booking',
    detail: 'Payable on booking',
  },
]

const SPECIALISED_FEES = [
  {
    category: 'Babies Under 8 Months',
    items: [
      { label: 'Hourly Rate', price: '£14.00', frequency: 'per hour' },
      { label: 'Day Rate', price: '£80.00', frequency: 'per day' },
    ],
    note: 'Specialised infant care and dedicated attention',
  },
  {
    category: 'School Pick-Up',
    items: [
      { label: '3:00pm – 6:00pm', price: '£30.00', frequency: 'per day' },
    ],
    note: 'Includes school pickup, snack & supervised activities',
  },
  {
    category: 'Flexible Hours',
    items: [
      { label: 'Minimum Booking', price: '3 hrs +', frequency: 'minimum session' },
    ],
    note: 'Minimum booking of 3 hours and above',
  },
]

const FEE_POLICY_POINTS = [
  'A minimum of 2 full days or 3 part-time days is required for funded hours only.',
  'Charges are based on an hourly rate.',
  'Half-hour charges are not offered.',
]

const FUNDING_OPTIONS = [
  {
    title: '15 Hours — 3 & 4 Year Olds',
    tag: 'Universal Entitlement',
    ageGroup: '3 & 4-Year-Olds',
    intro:
      'Children aged 3 and 4 are eligible for the universal 15-hour entitlement from the term after their third birthday.',
    points: [
      'Universal entitlement starting the term after the 3rd birthday',
      'Maximum of 15 hours per week over no fewer than 38 weeks per year',
      'Available during term-time only',
    ],
    note: 'Available universally to all eligible 3 & 4-year-olds',
    isAccent: false,
  },
  {
    title: '15 Hours — Working Parent Entitlement',
    tag: 'Working Parents (9m – 2y)',
    ageGroup: '9 Months to 2 Years',
    intro:
      'Eligible children aged 9 months to 2 years can access the 15-hour working parent entitlement.',
    points: [
      'For eligible working parents of children aged 9 months to 2 years',
      'Up to 15 hours of funded early learning per week',
      'Parents must provide their confirmation code when applying',
    ],
    note: 'Confirmation code required upon application',
    isAccent: true,
  },
  {
    title: '15 Hours — Working Parent Entitlement',
    tag: 'Working Parents (2y)',
    ageGroup: '2-Year-Old Children',
    intro:
      'Eligible 2-year-olds can access the 15-hour working parent entitlement.',
    points: [
      'For eligible 2-year-old children of working parents',
      'Up to 15 funded hours per week',
      'Parents claiming this entitlement must provide the relevant confirmation code',
    ],
    note: 'Confirmation code required upon application',
    isAccent: false,
  },
  {
    title: '30 Hours — Working Parent Entitlement',
    tag: 'Extended Entitlement (3 & 4y)',
    ageGroup: '3 & 4-Year-Olds',
    intro:
      'Eligible 3- and 4-year-olds can access the 30-hour working parent entitlement.',
    points: [
      'Extended entitlement for eligible working parents',
      'Parents must provide their relevant confirmation code',
      'Funding can be used for up to 10 hours per day',
      'Must be reapplied for each term (enrolment is not automatic)',
    ],
    note: 'Reapply each term • Usable up to 10h per day',
    isAccent: true,
  },
]

export default function FundedHoursSection() {
  return (
    <SectionWrapper id="fees-funding" background="white" className="border-t border-[var(--color-muted)] scroll-mt-24">
      {/* 1. FEES & FUNDING — Introduction */}
      <AnimatedSection className="text-center flex flex-col items-center">
        <SectionHeader
          eyebrow="Fees & Funding"
          title="Fees & Funding"
          centered
        />
        <div className="max-w-3xl mt-5 space-y-3 text-center">
          <p className="text-[var(--color-text-primary)] font-medium text-base md:text-lg leading-relaxed">
            We understand that choosing childcare is an important decision for families. At Divine Heritage Childcare Service, we aim to provide clear information about our childcare sessions, fees and available funded childcare options.
          </p>
          <p className="text-[var(--color-text-secondary)] text-sm md:text-base leading-relaxed">
            If you have any questions about our services, funding options or the sessions available for your child, please feel free to get in touch.
          </p>
        </div>
      </AnimatedSection>

      {/* 2. SESSIONS & FEES */}
      <div className="mt-16 md:mt-20">
        <AnimatedSection className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 pb-4 border-b border-[var(--color-muted)]">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--color-primary-500)] mb-1 font-[var(--font-family-heading)]">
                Pricing Overview
              </p>
              <h3 className="font-[var(--font-family-heading)] font-bold text-2xl md:text-3xl text-[var(--color-text-primary)]">
                Sessions & Fees
              </h3>
            </div>
            <p className="text-xs md:text-sm text-[var(--color-text-muted)] max-w-sm">
              Clear, transparent pricing designed around your child’s care needs.
            </p>
          </div>
        </AnimatedSection>

        {/* Standard Childcare Rates Grid */}
        <AnimatedSection delay={0.05}>
          <div className="mb-6">
            <h4 className="text-sm font-semibold uppercase tracking-wider text-[var(--color-text-muted)] mb-3 font-[var(--font-family-heading)]">
              Standard Childcare Rates
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {STANDARD_FEES.map((fee) => (
                <div
                  key={fee.name}
                  className="bg-[var(--color-background)] rounded-[var(--radius-lg)] p-5 border border-[var(--color-muted)] shadow-[var(--shadow-soft)] hover:shadow-[var(--shadow-card)] transition-shadow duration-200 flex flex-col justify-between"
                >
                  <div>
                    <span className="text-xs font-medium text-[var(--color-text-muted)] block mb-1">
                      {fee.name}
                    </span>
                    <div className="flex items-baseline gap-1.5 mb-1.5">
                      <span className="font-[var(--font-family-heading)] font-bold text-2xl text-[var(--color-text-primary)]">
                        {fee.price}
                      </span>
                      <span className="text-xs text-[var(--color-text-muted)] font-medium">
                        {fee.frequency}
                      </span>
                    </div>
                  </div>
                  <p className="text-xs text-[var(--color-text-secondary)] mt-2 pt-2 border-t border-[var(--color-muted)]">
                    {fee.detail}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </AnimatedSection>

        {/* Specialised Childcare Options */}
        <AnimatedSection delay={0.1}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            {SPECIALISED_FEES.map((block) => (
              <div
                key={block.category}
                className="bg-[var(--color-muted)]/40 rounded-[var(--radius-lg)] p-5 border border-[var(--color-muted)] flex flex-col justify-between"
              >
                <div>
                  <h4 className="font-[var(--font-family-heading)] font-bold text-base text-[var(--color-text-primary)] mb-3">
                    {block.category}
                  </h4>
                  <div className="space-y-2.5">
                    {block.items.map((it) => (
                      <div key={it.label} className="flex items-baseline justify-between bg-white rounded-lg px-3 py-2 border border-[var(--color-muted)]">
                        <span className="text-xs text-[var(--color-text-secondary)] font-medium">
                          {it.label}
                        </span>
                        <div className="flex items-baseline gap-1">
                          <span className="font-[var(--font-family-heading)] font-bold text-base text-[var(--color-primary-600)]">
                            {it.price}
                          </span>
                          <span className="text-[11px] text-[var(--color-text-muted)]">
                            {it.frequency}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <p className="text-xs text-[var(--color-text-muted)] mt-4">
                  {block.note}
                </p>
              </div>
            ))}
          </div>
        </AnimatedSection>

        {/* Fee Information & Terms Callout */}
        <AnimatedSection delay={0.15}>
          <div className="bg-[var(--color-primary-50)]/70 border border-[var(--color-primary-100)] rounded-[var(--radius-xl)] p-5 md:p-6">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-white text-[var(--color-primary-500)] flex items-center justify-center shrink-0 shadow-xs mt-0.5">
                <Info size={18} aria-hidden="true" />
              </div>
              <div className="flex-1">
                <h4 className="font-[var(--font-family-heading)] font-semibold text-sm text-[var(--color-primary-900)] mb-2.5">
                  Important Fee Information & Session Policies
                </h4>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-y-2 gap-x-6" role="list">
                  {FEE_POLICY_POINTS.map((point) => (
                    <li key={point} className="flex items-start gap-2 text-xs md:text-sm text-[var(--color-text-secondary)]">
                      <Check size={14} className="text-[var(--color-primary-500)] shrink-0 mt-0.5" aria-hidden="true" />
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </AnimatedSection>
      </div>

      {/* 3. FUNDED CHILDCARE HOURS */}
      <div id="funded-hours" className="mt-20 md:mt-24 pt-16 border-t border-[var(--color-muted)] scroll-mt-24">
        <AnimatedSection className="text-center flex flex-col items-center mb-12">
          <p className="text-xs font-semibold uppercase tracking-[0.15em] mb-2 text-[var(--color-primary-500)] font-[var(--font-family-heading)]">
            Government Early Years Entitlements
          </p>
          <h3 className="font-[var(--font-family-heading)] font-bold text-2xl md:text-3xl lg:text-4xl text-[var(--color-text-primary)]">
            Funded Childcare Hours
          </h3>
          <p className="mt-4 text-[var(--color-text-secondary)] text-sm md:text-base max-w-2xl text-center leading-relaxed">
            Eligible families may be able to access funded childcare hours through the available early years entitlements. Funding availability depends on your child's age and eligibility.
          </p>
        </AnimatedSection>

        {/* 4 Funding Options Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
          {FUNDING_OPTIONS.map((opt, idx) => {
            const tagBg = opt.isAccent ? 'bg-[var(--color-accent-50)] text-[var(--color-accent-600)]' : 'bg-[var(--color-primary-50)] text-[var(--color-primary-600)]'
            const checkColor = opt.isAccent ? 'var(--color-accent-500)' : 'var(--color-primary-500)'

            return (
              <AnimatedSection key={opt.title + opt.tag} delay={idx * 0.08}>
                <div className="bg-white rounded-[var(--radius-xl)] p-7 md:p-8 border border-[var(--color-muted)] shadow-[var(--shadow-soft)] hover:shadow-[var(--shadow-card)] transition-shadow duration-300 flex flex-col h-full">
                  {/* Card top badges */}
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
                    <span className={`text-xs font-semibold px-3 py-1 rounded-full ${tagBg}`}>
                      {opt.tag}
                    </span>
                    <span className="text-xs font-medium text-[var(--color-text-muted)] bg-[var(--color-muted)] rounded-full px-3 py-1">
                      {opt.ageGroup}
                    </span>
                  </div>

                  {/* Title */}
                  <h4 className="font-[var(--font-family-heading)] font-bold text-xl md:text-2xl text-[var(--color-text-primary)] mb-3 leading-snug">
                    {opt.title}
                  </h4>

                  {/* Intro */}
                  <p className="text-[var(--color-text-secondary)] text-sm md:text-base leading-relaxed mb-5">
                    {opt.intro}
                  </p>

                  {/* Points list */}
                  <ul className="space-y-2.5 mb-6 flex-1" role="list">
                    {opt.points.map((pt) => (
                      <li key={pt} className="flex items-start gap-2.5 text-sm text-[var(--color-text-secondary)]">
                        <Check
                          size={15}
                          className="shrink-0 mt-0.5"
                          style={{ color: checkColor }}
                          aria-hidden="true"
                        />
                        <span>{pt}</span>
                      </li>
                    ))}
                  </ul>

                  {/* Note footer */}
                  <div className="pt-4 border-t border-[var(--color-muted)] text-xs flex items-center justify-between gap-2">
                    <span className="text-[var(--color-text-muted)] font-medium">Notice:</span>
                    <span className="font-semibold text-[var(--color-text-primary)] text-right">{opt.note}</span>
                  </div>
                </div>
              </AnimatedSection>
            )
          })}
        </div>
      </div>

      {/* 4. ADDITIONAL HOURS */}
      <div className="mt-16 md:mt-20 pt-12 border-t border-[var(--color-muted)]">
        <AnimatedSection className="max-w-3xl mx-auto">
          <div className="bg-[var(--color-muted)]/50 rounded-[var(--radius-2xl)] p-7 md:p-9 border border-[var(--color-muted)] text-center">
            <h4 className="font-[var(--font-family-heading)] font-bold text-2xl text-[var(--color-text-primary)] mb-3">
              Additional Childcare Hours
            </h4>
            <p className="text-[var(--color-text-secondary)] text-sm md:text-base leading-relaxed mb-4">
              Funded childcare covers eligible hours within your child's available weekly entitlement. If you require childcare hours beyond your child's funded entitlement, a separate fee will apply based on the applicable childcare rate.
            </p>
            <p className="text-xs md:text-sm text-[var(--color-text-muted)]">
              We encourage you to get in touch to discuss your individual childcare requirements and session availability.
            </p>
          </div>
        </AnimatedSection>
      </div>

      {/* 5. CALL TO ACTION */}
      <AnimatedSection className="mt-14 md:mt-20 text-center">
        <div className="max-w-2xl mx-auto bg-white border border-[var(--color-muted)] rounded-[var(--radius-2xl)] p-8 md:p-10 shadow-[var(--shadow-card)]">
          <h3 className="font-[var(--font-family-heading)] font-bold text-2xl md:text-3xl text-[var(--color-text-primary)] mb-3">
            Interested in Our Childcare or Funding Options?
          </h3>
          <p className="text-[var(--color-text-secondary)] text-sm md:text-base leading-relaxed mb-7 max-w-lg mx-auto">
            Whether you would like to discuss childcare sessions, fees or funded childcare hours, we would be happy to help you find an arrangement that suits your family's needs.
          </p>
          <Link
            to="/contact?enquiry=fees-funding"
            id="fees-funding-enquiry-btn"
            className="inline-flex items-center gap-2.5 px-8 py-3.5 bg-[var(--color-primary-500)] hover:bg-[var(--color-primary-600)] text-white font-semibold rounded-xl text-sm md:text-base transition-all duration-200 hover:shadow-[var(--shadow-card)] hover:-translate-y-0.5 group focus-visible:outline-2 focus-visible:outline-offset-2"
          >
            Make an Enquiry
            <ArrowRight size={17} className="group-hover:translate-x-0.5 transition-transform duration-200" aria-hidden="true" />
          </Link>
        </div>
      </AnimatedSection>
    </SectionWrapper>
  )
}
