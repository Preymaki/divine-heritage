import { useForm } from 'react-hook-form'
import { useState } from 'react'
import { Phone, Mail, MapPin, Clock, CheckCircle, AlertCircle } from 'lucide-react'
import AnimatedSection from '@components/ui/AnimatedSection'
import SectionWrapper from '@components/ui/SectionWrapper'
import SectionHeader from '@components/ui/SectionHeader'
import { useContactSettings } from '@hooks/useContactSettings'
import { submitEnquiry } from '@services/enquiries'

interface FormData {
  parentName: string
  email: string
  phone: string
  childAge: string
  serviceType: string
  message: string
}

const AGE_OPTIONS = [
  'Babies – Toddlers (5/6 months – 3 years)',
  'Preschoolers (3 – 5 years)',
  'School Age (5 – 11 years / After School)',
  'Full-Time Sessions (Babies – Toddlers)',
  'Part-Time Sessions (Babies – Toddlers)',
  'Full-Time Sessions (Preschoolers)',
  'Part-Time Sessions (Preschoolers)',
]

const SERVICE_OPTIONS = [
  'Full Day Care',
  'Part-Time & Flexible Hours',
  'After School Care',
  'Holiday Care (5 months – 5 years)',
  'Not sure yet',
]

function FieldError({ message }: { message?: string }) {
  if (!message) return null
  return (
    <p className="flex items-center gap-1.5 mt-1.5 text-xs text-red-600" role="alert">
      <AlertCircle size={12} aria-hidden="true" />
      {message}
    </p>
  )
}

export default function Contact() {
  const { contact } = useContactSettings()
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<FormData>()

  const onSubmit = async (data: FormData) => {
    setSubmitting(true)
    setSubmitError(null)
    try {
      await submitEnquiry({
        parentName:  data.parentName,
        email:       data.email,
        phone:       data.phone ? data.phone.trim() : '',
        childAge:    data.childAge,
        serviceType: data.serviceType,
        message:     data.message,
        status:      'unread',
      })
      setSubmitted(true)
      reset()
    } catch (err: unknown) {
      console.error('Contact form submission error:', err)
      setSubmitError('The message could not be sent. Please try again or make contact directly by phone.')
    } finally {
      setSubmitting(false)
    }
  }

  const inputClass = (hasError: boolean) =>
    `w-full px-4 py-3 rounded-[var(--radius-lg)] text-sm text-[var(--color-text-primary)] bg-[var(--color-background)] border transition-all duration-150 outline-none font-[var(--font-family-body)] ${
      hasError
        ? 'border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-100'
        : 'border-[var(--color-muted)] focus:border-[var(--color-primary-400)] focus:ring-2 focus:ring-[var(--color-primary-100)]'
    }`

  const labelClass = 'block text-sm font-medium text-[var(--color-text-primary)] mb-1.5 font-[var(--font-family-heading)]'

  return (
    <>
      {/* Page header */}
      <div className="bg-[var(--color-primary-900)] pt-32 pb-16">
        <div className="container-site">
          <AnimatedSection>
            <p className="text-[var(--color-accent-400)] text-xs font-semibold uppercase tracking-[0.15em] mb-3 font-[var(--font-family-heading)]">
              Get In Touch
            </p>
            <h1 className="font-[var(--font-family-heading)] font-bold text-white text-4xl md:text-5xl leading-tight tracking-tight max-w-2xl">
              Contact Divine Heritage
            </h1>
            <p className="mt-4 text-white/90 text-base md:text-lg leading-relaxed max-w-xl drop-shadow-[0_1px_2px_rgba(0,0,0,0.4)]">
              Complete the form below to book a free introductory visit or submit an inquiry. 
              Responses are provided within one working day.
            </p>
          </AnimatedSection>
        </div>
      </div>

      <SectionWrapper background="background">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.6fr] gap-12 lg:gap-16">
          {/* Contact info sidebar */}
          <AnimatedSection direction="left">
            <div className="space-y-6 lg:sticky lg:top-28">
              <SectionHeader
                eyebrow="Contact Details"
                title="Get in Touch"
                maxWidth="max-w-full"
              />

              <div className="space-y-4 mt-2">
                {[
                  {
                    icon: Phone,
                    label: 'Phone',
                    value: contact.phone,
                    href: `tel:${contact.phone.replace(/\s/g, '')}`,
                  },
                  {
                    icon: Mail,
                    label: 'Email',
                    value: contact.email,
                    href: `mailto:${contact.email}`,
                  },
                  {
                    icon: MapPin,
                    label: 'Location',
                    value: contact.address,
                    href: undefined,
                  },
                ].map(({ icon: Icon, label, value, href }) => (
                  <div key={label} className="flex items-start gap-4 p-4 bg-white border border-[var(--color-muted)] rounded-[var(--radius-lg)]">
                    <div className="w-10 h-10 rounded-xl bg-[var(--color-primary-50)] flex items-center justify-center shrink-0">
                      <Icon size={18} className="text-[var(--color-primary-500)]" />
                    </div>
                    <div>
                      <p className="text-xs text-[var(--color-text-muted)] mb-0.5">{label}</p>
                      {href ? (
                        <a
                          href={href}
                          className="text-[var(--color-text-primary)] font-medium text-sm hover:text-[var(--color-primary-500)] transition-colors"
                        >
                          {value}
                        </a>
                      ) : (
                        <p className="text-[var(--color-text-primary)] font-medium text-sm">{value}</p>
                      )}
                    </div>
                  </div>
                ))}

                {/* Hours */}
                <div className="flex items-start gap-4 p-4 bg-white border border-[var(--color-muted)] rounded-[var(--radius-lg)]">
                  <div className="w-10 h-10 rounded-xl bg-[var(--color-primary-50)] flex items-center justify-center shrink-0">
                    <Clock size={18} className="text-[var(--color-primary-500)]" />
                  </div>
                  <div>
                    <p className="text-xs text-[var(--color-text-muted)] mb-0.5">Business Hours</p>
                    <p className="text-[var(--color-text-primary)] font-medium text-sm">
                      {contact.hours.weekdays}
                    </p>
                    {contact.hours.notes && (
                      <p className="text-[var(--color-text-muted)] text-xs mt-0.5">
                        {contact.hours.notes}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <div className="p-5 bg-[var(--color-accent-50)] border border-[var(--color-accent-200)] rounded-[var(--radius-lg)]">
                <p className="font-semibold text-sm text-[var(--color-accent-700)] mb-1.5">
                  Free Introductory Visit
                </p>
                <p className="text-[var(--color-accent-600)] text-sm leading-relaxed">
                  A free, no-obligation introductory visit is available to view the setting and 
                  discuss any questions. Complete the form to arrange a convenient time.
                </p>
              </div>
            </div>
          </AnimatedSection>

          {/* Contact form */}
          <AnimatedSection direction="right" delay={0.1}>
            {submitted ? (
              <div className="flex flex-col items-center justify-center text-center h-full py-16 bg-white rounded-[var(--radius-2xl)] border border-[var(--color-muted)] px-8">
                <div className="w-16 h-16 rounded-full bg-[var(--color-sage-50)] flex items-center justify-center mb-5">
                  <CheckCircle size={32} className="text-[var(--color-sage-500)]" />
                </div>
                <h2 className="font-[var(--font-family-heading)] font-bold text-2xl text-[var(--color-text-primary)] mb-3">
                  Message Sent!
                </h2>
                <p className="text-[var(--color-text-secondary)] text-base max-w-sm leading-relaxed">
                  Thank you for reaching out. Inquiries are reviewed and answered within one working day.
                </p>
                <button
                  type="button"
                  onClick={() => setSubmitted(false)}
                  className="mt-7 px-6 py-3 bg-[var(--color-primary-500)] hover:bg-[var(--color-primary-600)] text-white font-semibold rounded-xl text-sm transition-all duration-200"
                >
                  Send Another Message
                </button>
              </div>
            ) : (
              <form
                onSubmit={handleSubmit(onSubmit)}
                noValidate
                className="bg-white rounded-[var(--radius-2xl)] border border-[var(--color-muted)] p-6 md:p-8 shadow-[var(--shadow-soft)] space-y-5"
                aria-label="Contact form"
              >
                <h2 className="font-[var(--font-family-heading)] font-bold text-xl text-[var(--color-text-primary)]">
                  Send a Message
                </h2>

                {/* Parent name */}
                <div>
                  <label htmlFor="parentName" className={labelClass}>
                    Your Name <span className="text-red-500" aria-hidden="true">*</span>
                  </label>
                  <input
                    id="parentName"
                    type="text"
                    autoComplete="name"
                    placeholder="e.g. Sarah Johnson"
                    className={inputClass(!!errors.parentName)}
                    aria-required="true"
                    aria-describedby={errors.parentName ? 'parentName-error' : undefined}
                    {...register('parentName', {
                      required: 'Please enter your name.',
                      minLength: { value: 2, message: 'Name must be at least 2 characters.' },
                    })}
                  />
                  <FieldError message={errors.parentName?.message} />
                </div>

                {/* Email + Phone */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label htmlFor="email" className={labelClass}>
                      Email Address <span className="text-red-500" aria-hidden="true">*</span>
                    </label>
                    <input
                      id="email"
                      type="email"
                      autoComplete="email"
                      placeholder="you@example.com"
                      className={inputClass(!!errors.email)}
                      aria-required="true"
                      {...register('email', {
                        required: 'Please enter your email address.',
                        pattern: {
                          value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                          message: 'Please enter a valid email address.',
                        },
                      })}
                    />
                    <FieldError message={errors.email?.message} />
                  </div>
                  <div>
                    <label htmlFor="phone" className={labelClass}>
                      Phone Number
                    </label>
                    <input
                      id="phone"
                      type="tel"
                      autoComplete="tel"
                      placeholder="07700 000 000"
                      className={inputClass(!!errors.phone)}
                      {...register('phone', {
                        validate: (val) =>
                          !val ||
                          val.trim() === '' ||
                          /^[\d\s+()-]{7,15}$/.test(val.trim()) ||
                          'Please enter a valid phone number (7–15 digits).',
                      })}
                    />
                    <FieldError message={errors.phone?.message} />
                  </div>
                </div>

                {/* Child's age + Service type */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label htmlFor="childAge" className={labelClass}>
                      Child's Age Range <span className="text-red-500" aria-hidden="true">*</span>
                    </label>
                    <select
                      id="childAge"
                      className={inputClass(!!errors.childAge)}
                      aria-required="true"
                      {...register('childAge', { required: "Please select your child's age range." })}
                    >
                      <option value="">Select age range</option>
                      {AGE_OPTIONS.map((a) => (
                        <option key={a} value={a}>{a}</option>
                      ))}
                    </select>
                    <FieldError message={errors.childAge?.message} />
                  </div>
                  <div>
                    <label htmlFor="serviceType" className={labelClass}>
                      Service Interested In <span className="text-red-500" aria-hidden="true">*</span>
                    </label>
                    <select
                      id="serviceType"
                      className={inputClass(!!errors.serviceType)}
                      aria-required="true"
                      {...register('serviceType', { required: 'Please select a service type.' })}
                    >
                      <option value="">Select service</option>
                      {SERVICE_OPTIONS.map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                    <FieldError message={errors.serviceType?.message} />
                  </div>
                </div>

                {/* Message */}
                <div>
                  <label htmlFor="message" className={labelClass}>
                    Your Message <span className="text-red-500" aria-hidden="true">*</span>
                  </label>
                  <textarea
                    id="message"
                    rows={5}
                    placeholder="Provide details regarding childcare requirements, questions, or preferred start date..."
                    className={`${inputClass(!!errors.message)} resize-none`}
                    aria-required="true"
                    {...register('message', {
                      required: 'Please enter a message.',
                      minLength: { value: 20, message: 'Please provide a little more detail (at least 20 characters).' },
                    })}
                  />
                  <FieldError message={errors.message?.message} />
                </div>

                {/* Privacy note */}
                <p className="text-[var(--color-text-muted)] text-xs leading-relaxed">
                  Information is handled with care and used solely to respond to the inquiry. 
                  Details are never shared with third parties.
                </p>

                {/* Submission error */}
                {submitError && (
                  <div role="alert" className="flex items-start gap-2 p-3.5 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
                    <AlertCircle size={16} className="mt-0.5 shrink-0" aria-hidden="true" />
                    {submitError}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={submitting}
                  id="contact-form-submit"
                  className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-[var(--color-primary-500)] hover:bg-[var(--color-primary-600)] text-white font-semibold rounded-xl text-base transition-all duration-200 hover:shadow-[var(--shadow-card)] disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {submitting ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" aria-hidden="true" />
                      Sending...
                    </>
                  ) : (
                    'Send Message'
                  )}
                </button>
              </form>
            )}
          </AnimatedSection>
        </div>
      </SectionWrapper>
    </>
  )
}
