import { Link } from 'react-router-dom'
import {
  Clock,
  Sparkles,
  Calendar,
  CheckCircle2,
  FileCheck,
  ShieldCheck,
  RefreshCw,
  Coins,
  ArrowRight,
  Info,
  BadgeCheck,
} from 'lucide-react'
import AnimatedSection from '@components/ui/AnimatedSection'
import SectionWrapper from '@components/ui/SectionWrapper'
import SectionHeader from '@components/ui/SectionHeader'

interface FundingOption {
  hoursBadge: string
  title: string
  entitlement: string
  description: string
  bulletPoints: string[]
  highlightNote?: string
  accentColor: 'primary' | 'accent'
}

const FUNDING_OPTIONS: FundingOption[] = [
  {
    hoursBadge: '15 Hours',
    title: '15 Hours — 3 & 4 Year Olds',
    entitlement: '15-hour universal entitlement',
    description:
      'Children aged 3 and 4 may be eligible for the universal 15-hour entitlement from the term after their third birthday.',
    bulletPoints: [
      'Universal entitlement for 3 & 4-year-olds',
      'Starts the term after the child’s third birthday',
      'Maximum of 15 hours per week',
      'Over no fewer than 38 weeks per year (term-time only)',
    ],
    accentColor: 'primary',
  },
  {
    hoursBadge: '15 Hours',
    title: '15 Hours — Working Parents',
    entitlement: '9 Months to 2 Years',
    description:
      'Eligible children aged 9 months to 2 years may qualify for the 15-hour working parent entitlement.',
    bulletPoints: [
      'For eligible working families with children aged 9 months to 2 years',
      'Up to 15 hours of funded early education each week',
      'Parents must provide their confirmation code when applying for a funded place',
    ],
    highlightNote: 'Confirmation code required upon application',
    accentColor: 'accent',
  },
  {
    hoursBadge: '15 Hours',
    title: '15 Hours — 2 Year Olds',
    entitlement: 'Working Parent Entitlement',
    description:
      'Eligible 2-year-olds may qualify for the 15-hour working parent entitlement.',
    bulletPoints: [
      'For eligible 2-year-old children of working parents',
      'Up to 15 funded hours per week',
      'Parents must provide the relevant confirmation code when applying for a funded place',
    ],
    highlightNote: 'Confirmation code required upon application',
    accentColor: 'primary',
  },
  {
    hoursBadge: '30 Hours',
    title: '30 Hours — 3 & 4 Year Olds',
    entitlement: 'Working Parent Entitlement',
    description:
      'Eligible 3- and 4-year-olds may qualify for the 30-hour working parent entitlement.',
    bulletPoints: [
      'Extended entitlement for eligible working parents',
      'Parents must provide their relevant confirmation code',
      'The funding can be used for up to 10 hours per day',
      'Parents must reapply for the 30-hour funding each term, as this is not automatic enrolment',
    ],
    highlightNote: 'Termly reapplication required • Up to 10h per day',
    accentColor: 'accent',
  },
]

const HOW_IT_WORKS = [
  {
    icon: ShieldCheck,
    title: 'Eligibility & Entitlements',
    description:
      'Eligibility depends on the child’s age and the applicable funding entitlement.',
  },
  {
    icon: FileCheck,
    title: 'Confirmation Code',
    description:
      'Parents claiming funded hours should provide the relevant confirmation code.',
  },
  {
    icon: Clock,
    title: 'Weekly Entitlement Limit',
    description:
      'Funded hours are limited to the child’s eligible weekly entitlement.',
  },
  {
    icon: RefreshCw,
    title: 'Termly Reapplication',
    description:
      'The 30-hour funding entitlement must be reapplied for each term.',
  },
  {
    icon: Calendar,
    title: 'Daily Usage Cap',
    description:
      'Funded hours can be used for up to 10 hours per day where applicable.',
  },
  {
    icon: Coins,
    title: 'Hours Outside Entitlement',
    description:
      'Additional childcare hours outside the child’s funded entitlement may be charged separately.',
  },
]

const STANDARD_RATES = [
  { label: 'Hourly Rate', rate: '£12.00', period: 'per hour' },
  { label: 'Day Rate', rate: '£70.00', period: 'full day session' },
  { label: 'Full-Time', rate: '£330.00', period: 'per week' },
  { label: 'Ad Hoc Booking', rate: '£18.00', period: 'per session / hour' },
  {
    label: 'Babies Under 8 Months',
    rate: '£14.00 / hr',
    period: '£80.00 per day',
  },
  {
    label: 'School Pick-ups (3pm–6pm)',
    rate: '£30.00',
    period: 'per day',
  },
  {
    label: 'Flexible Hours',
    rate: 'Min. 3 hrs',
    period: 'minimum 3 hours and above',
  },
]

export default function FundedHoursSection() {
  return (
    <SectionWrapper id="funded-hours" background="white" className="border-t border-[var(--color-muted)]">
      {/* 1. Header & Introductory Copy */}
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
        {FUNDING_OPTIONS.map((opt, idx) => {
          const isPrimary = opt.accentColor === 'primary'
          const badgeBg = isPrimary ? 'bg-[var(--color-primary-50)] text-[var(--color-primary-600)] border-[var(--color-primary-200)]' : 'bg-[var(--color-accent-50)] text-[var(--color-accent-600)] border-[var(--color-accent-200)]'
          const iconColor = isPrimary ? 'text-[var(--color-primary-500)]' : 'text-[var(--color-accent-500)]'
          const borderHighlight = isPrimary ? 'hover:border-[var(--color-primary-300)]' : 'hover:border-[var(--color-accent-300)]'

          return (
            <AnimatedSection key={opt.title} delay={idx * 0.1}>
              <div
                className={`bg-white rounded-[var(--radius-xl)] p-7 md:p-8 border border-[var(--color-muted)] shadow-[var(--shadow-soft)] transition-all duration-300 ${borderHighlight} hover:shadow-[var(--shadow-card)] flex flex-col h-full relative overflow-hidden`}
              >
                {/* Top badge bar */}
                <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                  <span className={`inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider px-3.5 py-1.5 rounded-full border ${badgeBg}`}>
                    <Clock size={13} aria-hidden="true" />
                    {opt.hoursBadge}
                  </span>
                  <span className="text-xs font-semibold text-[var(--color-text-muted)] bg-[var(--color-muted)] rounded-full px-3 py-1">
                    {opt.entitlement}
                  </span>
                </div>

                {/* Card Title */}
                <h3 className="font-[var(--font-family-heading)] font-bold text-xl md:text-2xl text-[var(--color-text-primary)] leading-snug mb-3">
                  {opt.title}
                </h3>

                {/* Description */}
                <p className="text-[var(--color-text-secondary)] text-sm md:text-base leading-relaxed mb-5">
                  {opt.description}
                </p>

                {/* Features List */}
                <div className="bg-[var(--color-muted)]/60 rounded-[var(--radius-lg)] p-4 md:p-5 flex-1 mb-5">
                  <p className="font-semibold text-xs uppercase tracking-wider text-[var(--color-text-muted)] mb-3 font-[var(--font-family-heading)]">
                    Entitlement Details
                  </p>
                  <ul className="space-y-2.5" role="list">
                    {opt.bulletPoints.map((point) => (
                      <li key={point} className="flex items-start gap-2.5 text-sm text-[var(--color-text-secondary)]">
                        <CheckCircle2
                          size={15}
                          className={`mt-0.5 shrink-0 ${iconColor}`}
                          aria-hidden="true"
                        />
                        <span>{point}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Highlight Callout if available */}
                {opt.highlightNote && (
                  <div className="flex items-center gap-2 text-xs font-medium text-[var(--color-text-secondary)] bg-[var(--color-primary-50)]/60 border border-[var(--color-primary-100)] rounded-xl px-3.5 py-2.5">
                    <BadgeCheck size={16} className="text-[var(--color-primary-500)] shrink-0" aria-hidden="true" />
                    <span>{opt.highlightNote}</span>
                  </div>
                )}
              </div>
            </AnimatedSection>
          )
        })}
      </div>

      {/* 3. How Funded Hours Work */}
      <div className="mt-16 md:mt-24 pt-12 border-t border-[var(--color-muted)]">
        <AnimatedSection className="text-center flex flex-col items-center mb-10 md:mb-14">
          <p className="text-xs font-semibold uppercase tracking-[0.15em] mb-2.5 text-[var(--color-primary-500)] font-[var(--font-family-heading)]">
            Step-by-Step Guidance
          </p>
          <h3 className="font-[var(--font-family-heading)] font-bold text-2xl md:text-3xl text-[var(--color-text-primary)] leading-tight">
            How Funded Hours Work
          </h3>
          <p className="mt-3 text-[var(--color-text-secondary)] text-sm md:text-base max-w-xl text-center">
            Key points to keep in mind when planning and claiming your child’s funded childcare place.
          </p>
        </AnimatedSection>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
          {HOW_IT_WORKS.map((step, i) => {
            const Icon = step.icon
            return (
              <AnimatedSection key={step.title} delay={i * 0.08}>
                <div className="bg-[var(--color-background)] rounded-[var(--radius-lg)] p-5 md:p-6 border border-[var(--color-muted)] shadow-[var(--shadow-soft)] h-full flex flex-col transition-all duration-200 hover:-translate-y-0.5">
                  <div className="flex items-center gap-3.5 mb-3.5">
                    <div className="w-10 h-10 rounded-xl bg-[var(--color-primary-50)] flex items-center justify-center shrink-0">
                      <Icon size={20} className="text-[var(--color-primary-500)]" aria-hidden="true" />
                    </div>
                    <h4 className="font-[var(--font-family-heading)] font-semibold text-base text-[var(--color-text-primary)] leading-snug">
                      {step.title}
                    </h4>
                  </div>
                  <p className="text-[var(--color-text-secondary)] text-sm leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </AnimatedSection>
            )
          })}
        </div>
      </div>

      {/* 4. Additional Childcare Hours (Pricing outside funded hours) */}
      <div className="mt-16 md:mt-24 pt-12 border-t border-[var(--color-muted)]">
        <AnimatedSection className="max-w-4xl mx-auto">
          <div className="bg-[var(--color-muted)]/70 border border-[var(--color-muted)] rounded-[var(--radius-2xl)] p-7 md:p-10 shadow-[var(--shadow-soft)]">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-9 h-9 rounded-lg bg-[var(--color-primary-50)] flex items-center justify-center shrink-0">
                <Coins size={18} className="text-[var(--color-primary-500)]" aria-hidden="true" />
              </div>
              <h3 className="font-[var(--font-family-heading)] font-bold text-2xl text-[var(--color-text-primary)]">
                Additional Childcare Hours
              </h3>
            </div>

            <p className="text-[var(--color-text-secondary)] text-sm md:text-base leading-relaxed mb-6">
              Funded childcare does not necessarily cover every hour of care. Standard childcare rates apply for additional sessions or hours outside your child’s funded entitlement:
            </p>

            {/* Rates Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 mb-6">
              {STANDARD_RATES.map((item) => (
                <div
                  key={item.label}
                  className="bg-white rounded-xl p-4 border border-[var(--color-muted)] flex flex-col justify-between"
                >
                  <span className="text-xs font-medium text-[var(--color-text-muted)] mb-1">
                    {item.label}
                  </span>
                  <div className="flex items-baseline justify-between gap-2">
                    <span className="font-[var(--font-family-heading)] font-bold text-lg text-[var(--color-primary-600)]">
                      {item.rate}
                    </span>
                    <span className="text-xs text-[var(--color-text-muted)]">
                      {item.period}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Note box */}
            <div className="bg-white/80 border border-[var(--color-primary-100)] rounded-xl p-4 flex items-start gap-3 text-xs md:text-sm text-[var(--color-text-secondary)] leading-relaxed">
              <Info size={18} className="text-[var(--color-primary-500)] shrink-0 mt-0.5" aria-hidden="true" />
              <p>
                <strong className="text-[var(--color-text-primary)]">Please Note: </strong>
                A separate fee may apply for childcare hours outside the child's funded entitlement. Please enquire for details based on your child's required sessions and eligibility.
              </p>
            </div>
          </div>
        </AnimatedSection>
      </div>

      {/* 5. Section Call to Action */}
      <AnimatedSection className="mt-14 md:mt-20 text-center">
        <div className="max-w-2xl mx-auto bg-gradient-to-br from-[var(--color-primary-50)] to-white border border-[var(--color-primary-100)] rounded-[var(--radius-2xl)] p-8 md:p-10 shadow-[var(--shadow-card)]">
          <div className="w-12 h-12 rounded-2xl bg-[var(--color-primary-500)] text-white flex items-center justify-center mx-auto mb-4 shadow-[var(--shadow-soft)]" aria-hidden="true">
            <Sparkles size={22} />
          </div>
          <h3 className="font-[var(--font-family-heading)] font-bold text-2xl md:text-3xl text-[var(--color-text-primary)] mb-3">
            Interested in Funded Childcare?
          </h3>
          <p className="text-[var(--color-text-secondary)] text-sm md:text-base leading-relaxed mb-7 max-w-lg mx-auto">
            If you think your child may be eligible for funded childcare hours, we'd be happy to discuss your requirements and available sessions.
          </p>
          <Link
            to="/contact"
            id="funded-hours-enquire-btn"
            className="inline-flex items-center gap-2.5 px-8 py-4 bg-[var(--color-primary-500)] hover:bg-[var(--color-primary-600)] text-white font-semibold rounded-xl text-sm md:text-base transition-all duration-200 hover:shadow-[var(--shadow-card)] hover:-translate-y-0.5 group focus-visible:outline-2 focus-visible:outline-offset-2"
          >
            Enquire About Funded Hours
            <ArrowRight size={17} className="group-hover:translate-x-0.5 transition-transform duration-200" aria-hidden="true" />
          </Link>
        </div>
      </AnimatedSection>
    </SectionWrapper>
  )
}
