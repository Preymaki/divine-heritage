import { Link } from 'react-router-dom'
import { ArrowRight, Check, Info } from 'lucide-react'
import AnimatedSection from '@components/ui/AnimatedSection'
import SectionWrapper from '@components/ui/SectionWrapper'
import SectionHeader from '@components/ui/SectionHeader'

const FUNDING_OPTIONS = [
  {
    tag: 'Universal Entitlement',
    hours: '15 Hours',
    title: '15 Hours — 3 & 4 Year Olds',
    ageGroup: 'Children aged 3 and 4',
    description:
      'Children aged 3 and 4 may be eligible for the universal 15-hour entitlement from the term after their third birthday.',
    points: [
      'Universal entitlement starting the term after the 3rd birthday',
      'Maximum of 15 hours per week over at least 38 weeks per year',
      'Available during term-time only',
    ],
    highlight: 'Universal entitlement for all 3 & 4-year-olds',
    isAccent: false,
  },
  {
    tag: 'Working Parents',
    hours: '15 Hours',
    title: '15 Hours — Working Parents',
    ageGroup: '9 Months to 2 Years',
    description:
      'Eligible children aged 9 months to 2 years may qualify for the 15-hour working parent entitlement.',
    points: [
      'For eligible working parents with children aged 9 months to 2 years',
      'Up to 15 funded hours per week during term time',
      'Parents must provide their confirmation code when applying',
    ],
    highlight: 'Confirmation code required upon application',
    isAccent: true,
  },
  {
    tag: 'Working Parents',
    hours: '15 Hours',
    title: '15 Hours — 2 Year Olds',
    ageGroup: '2-Year-Old Children',
    description:
      'Eligible 2-year-olds may qualify for the 15-hour working parent entitlement.',
    points: [
      'For eligible working parents of 2-year-old children',
      'Up to 15 hours of funded childcare each week',
      'Parents must provide the relevant confirmation code',
    ],
    highlight: 'Confirmation code required upon application',
    isAccent: false,
  },
  {
    tag: 'Extended Entitlement',
    hours: '30 Hours',
    title: '30 Hours — 3 & 4 Year Olds',
    ageGroup: '3 & 4-Year-Old Children',
    description:
      'Eligible 3- and 4-year-olds may qualify for the 30-hour working parent entitlement.',
    points: [
      'Extended funding for eligible working parents',
      'Parents must provide their relevant confirmation code',
      'Funding can be used for up to 10 hours per day',
      'Must be reapplied for each term (enrolment is not automatic)',
    ],
    highlight: 'Reapply each term • Usable up to 10h per day',
    isAccent: true,
  },
]

const HOW_IT_WORKS_STEPS = [
  {
    num: '01',
    title: 'Eligibility',
    detail: 'Eligibility depends on the child’s age and the applicable funding entitlement.',
  },
  {
    num: '02',
    title: 'Confirmation Code',
    detail: 'Parents claiming funded hours should provide the relevant confirmation code when applying.',
  },
  {
    num: '03',
    title: 'Weekly Entitlement',
    detail: 'Funded hours are limited to the child’s eligible weekly entitlement.',
  },
  {
    num: '04',
    title: 'Termly Reapplication',
    detail: 'The 30-hour funding entitlement must be reapplied for each term, as renewal is not automatic.',
  },
  {
    num: '05',
    title: 'Daily Usage Limits',
    detail: 'Funded hours can be used for up to 10 hours per day where session times allow.',
  },
  {
    num: '06',
    title: 'Additional Hours',
    detail: 'Additional childcare hours outside the child’s funded entitlement may be charged separately.',
  },
]

const RATES = [
  { service: 'Standard Hourly Rate', price: '£12.00', note: 'per hour' },
  { service: 'Full Day Session', price: '£70.00', note: 'per day' },
  { service: 'Full-Time Care', price: '£330.00', note: 'per week' },
  { service: 'Ad Hoc Booking', price: '£18.00', note: 'per booking / hour' },
  { service: 'Babies (Under 8 Months)', price: '£14.00 / hr', note: '£80.00 full day' },
  { service: 'School Pick-ups (3pm–6pm)', price: '£30.00', note: 'per afternoon' },
  { service: 'Flexible Hours', price: 'Min. 3 hrs', note: 'minimum 3 hours & above' },
]

export default function FundedHoursSection() {
  return (
    <SectionWrapper id="funded-hours" background="white" className="border-t border-[var(--color-muted)]">
      {/* 1. Header & Lead Copy */}
      <AnimatedSection className="text-center flex flex-col items-center">
        <SectionHeader
          eyebrow="Early Years Entitlements"
          title="Funded Childcare Hours"
          centered
        />
        <div className="max-w-3xl mt-5 space-y-3 text-center">
          <p className="text-[var(--color-text-primary)] font-medium text-base md:text-lg leading-relaxed">
            Eligible families may be able to access funded childcare hours through the available early years entitlements.
          </p>
          <p className="text-[var(--color-text-secondary)] text-sm md:text-base leading-relaxed">
            Divine Heritage Childcare Service welcomes eligible families who wish to use funded childcare hours as part of their child's care. Funding availability depends on the child's age and eligibility.
          </p>
        </div>
      </AnimatedSection>

      {/* 2. Funding Options Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8 mt-12 md:mt-16">
        {FUNDING_OPTIONS.map((item, idx) => {
          const accentColor = item.isAccent ? 'var(--color-accent-500)' : 'var(--color-primary-500)'
          const accentBg = item.isAccent ? 'var(--color-accent-50)' : 'var(--color-primary-50)'
          const tagTextColor = item.isAccent ? 'text-[var(--color-accent-600)]' : 'text-[var(--color-primary-600)]'

          return (
            <AnimatedSection key={item.title} delay={idx * 0.08}>
              <div className="bg-white rounded-[var(--radius-xl)] p-7 md:p-8 border border-[var(--color-muted)] shadow-[var(--shadow-soft)] hover:shadow-[var(--shadow-card)] transition-shadow duration-300 flex flex-col h-full">
                
                {/* Header row: Natural badges */}
                <div className="flex items-center justify-between gap-3 mb-4">
                  <span
                    className={`text-xs font-semibold px-3 py-1 rounded-full ${tagTextColor}`}
                    style={{ backgroundColor: accentBg }}
                  >
                    {item.tag}
                  </span>
                  <span className="text-xs font-medium text-[var(--color-text-muted)] bg-[var(--color-muted)] rounded-full px-3 py-1">
                    {item.ageGroup}
                  </span>
                </div>

                {/* Title */}
                <h3 className="font-[var(--font-family-heading)] font-bold text-xl md:text-2xl text-[var(--color-text-primary)] mb-3">
                  {item.title}
                </h3>

                {/* Description */}
                <p className="text-[var(--color-text-secondary)] text-sm md:text-base leading-relaxed mb-6">
                  {item.description}
                </p>

                {/* Bullet points */}
                <ul className="space-y-3 mb-6 flex-1" role="list">
                  {item.points.map((pt) => (
                    <li key={pt} className="flex items-start gap-3 text-sm text-[var(--color-text-secondary)]">
                      <Check
                        size={15}
                        className="shrink-0 mt-1"
                        style={{ color: accentColor }}
                        aria-hidden="true"
                      />
                      <span>{pt}</span>
                    </li>
                  ))}
                </ul>

                {/* Footer note */}
                <div
                  className="pt-4 border-t border-[var(--color-muted)] text-xs font-medium text-[var(--color-text-secondary)] flex items-center justify-between"
                >
                  <span className="text-[var(--color-text-muted)]">Key requirement:</span>
                  <span className="font-semibold text-[var(--color-text-primary)]">{item.highlight}</span>
                </div>
              </div>
            </AnimatedSection>
          )
        })}
      </div>

      {/* 3. How Funded Hours Work */}
      <div className="mt-16 md:mt-24 pt-12 border-t border-[var(--color-muted)]">
        <AnimatedSection className="text-center flex flex-col items-center mb-10 md:mb-12">
          <p className="text-xs font-semibold uppercase tracking-[0.15em] mb-2 text-[var(--color-primary-500)] font-[var(--font-family-heading)]">
            How It Works
          </p>
          <h3 className="font-[var(--font-family-heading)] font-bold text-2xl md:text-3xl text-[var(--color-text-primary)]">
            How Funded Hours Work
          </h3>
          <p className="mt-3 text-[var(--color-text-secondary)] text-sm md:text-base max-w-xl text-center">
            Helpful guidelines to ensure a smooth application and enrolment for your funded place.
          </p>
        </AnimatedSection>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {HOW_IT_WORKS_STEPS.map((step, idx) => (
            <AnimatedSection key={step.title} delay={idx * 0.06}>
              <div className="p-5 md:p-6 rounded-[var(--radius-lg)] bg-[var(--color-muted)]/50 border border-[var(--color-muted)] h-full flex flex-col">
                <div className="flex items-center gap-3 mb-3">
                  <span className="font-[var(--font-family-heading)] font-bold text-base text-[var(--color-primary-500)]">
                    {step.num}
                  </span>
                  <h4 className="font-[var(--font-family-heading)] font-semibold text-base text-[var(--color-text-primary)]">
                    {step.title}
                  </h4>
                </div>
                <p className="text-[var(--color-text-secondary)] text-sm leading-relaxed">
                  {step.detail}
                </p>
              </div>
            </AnimatedSection>
          ))}
        </div>
      </div>

      {/* 4. Additional Childcare Hours */}
      <div className="mt-16 md:mt-24 pt-12 border-t border-[var(--color-muted)]">
        <AnimatedSection className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h3 className="font-[var(--font-family-heading)] font-bold text-2xl md:text-3xl text-[var(--color-text-primary)] mb-3">
              Additional Childcare Hours
            </h3>
            <p className="text-[var(--color-text-secondary)] text-sm md:text-base max-w-2xl mx-auto leading-relaxed">
              Funded childcare does not necessarily cover every hour of care. Standard childcare rates apply for extra hours or sessions outside your child’s funded entitlement.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 mb-6">
            {RATES.map((r) => (
              <div
                key={r.service}
                className="bg-[var(--color-background)] rounded-xl p-4 border border-[var(--color-muted)] shadow-[var(--shadow-soft)] flex flex-col justify-between"
              >
                <span className="text-xs font-medium text-[var(--color-text-muted)] mb-1">
                  {r.service}
                </span>
                <div className="flex items-baseline justify-between gap-2">
                  <span className="font-[var(--font-family-heading)] font-bold text-lg text-[var(--color-text-primary)]">
                    {r.price}
                  </span>
                  <span className="text-xs text-[var(--color-text-muted)]">
                    {r.note}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-[var(--color-primary-50)]/70 border border-[var(--color-primary-100)] rounded-xl p-4 flex items-start gap-3 text-xs md:text-sm text-[var(--color-text-secondary)] leading-relaxed">
            <Info size={18} className="text-[var(--color-primary-500)] shrink-0 mt-0.5" aria-hidden="true" />
            <p>
              <strong className="text-[var(--color-text-primary)]">Please Note: </strong>
              A separate fee may apply for childcare hours outside the child's funded entitlement. Please enquire for details based on your child's required sessions and eligibility.
            </p>
          </div>
        </AnimatedSection>
      </div>

      {/* 5. Clean CTA Card */}
      <AnimatedSection className="mt-14 md:mt-20 text-center">
        <div className="max-w-2xl mx-auto bg-[var(--color-background)] border border-[var(--color-muted)] rounded-[var(--radius-2xl)] p-8 md:p-10 shadow-[var(--shadow-soft)]">
          <h3 className="font-[var(--font-family-heading)] font-bold text-2xl md:text-3xl text-[var(--color-text-primary)] mb-3">
            Interested in Funded Childcare?
          </h3>
          <p className="text-[var(--color-text-secondary)] text-sm md:text-base leading-relaxed mb-7 max-w-lg mx-auto">
            If you think your child may be eligible for funded childcare hours, we'd be happy to discuss your requirements and available sessions.
          </p>
          <Link
            to="/contact?service=funded"
            id="funded-hours-enquire-btn"
            className="inline-flex items-center gap-2.5 px-8 py-3.5 bg-[var(--color-primary-500)] hover:bg-[var(--color-primary-600)] text-white font-semibold rounded-xl text-sm md:text-base transition-all duration-200 hover:shadow-[var(--shadow-card)] hover:-translate-y-0.5 group focus-visible:outline-2 focus-visible:outline-offset-2"
          >
            Enquire About Funded Hours
            <ArrowRight size={17} className="group-hover:translate-x-0.5 transition-transform duration-200" aria-hidden="true" />
          </Link>
        </div>
      </AnimatedSection>
    </SectionWrapper>
  )
}
