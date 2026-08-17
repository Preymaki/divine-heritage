import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { FAQS } from '@data/faqs'
import AnimatedSection from '@components/ui/AnimatedSection'
import SectionWrapper from '@components/ui/SectionWrapper'
import CTASection from '@components/home/CTASection'

interface AccordionItemProps {
  question: string
  answer: string
  isOpen: boolean
  onToggle: () => void
  id: string
}

function AccordionItem({ question, answer, isOpen, onToggle, id }: AccordionItemProps) {
  return (
    <div className="border border-[var(--color-muted)] rounded-[var(--radius-lg)] overflow-hidden bg-white">
      <button
        type="button"
        onClick={onToggle}
        className="w-full flex items-center justify-between gap-4 p-5 text-left transition-colors duration-150 hover:bg-[var(--color-background)] group"
        aria-expanded={isOpen}
        id={`faq-page-btn-${id}`}
        aria-controls={`faq-page-panel-${id}`}
      >
        <span className="font-[var(--font-family-heading)] font-semibold text-sm md:text-base text-[var(--color-text-primary)] leading-snug">
          {question}
        </span>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className="shrink-0 w-7 h-7 rounded-lg bg-[var(--color-primary-50)] flex items-center justify-center group-hover:bg-[var(--color-primary-100)] transition-colors duration-150"
        >
          <ChevronDown size={16} className="text-[var(--color-primary-500)]" />
        </motion.div>
      </button>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            id={`faq-page-panel-${id}`}
            role="region"
            aria-labelledby={`faq-page-btn-${id}`}
            key="content"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.28, ease: [0.4, 0, 0.2, 1] }}
          >
            <div className="px-5 pb-5 border-t border-[var(--color-muted)]">
              <p className="text-[var(--color-text-secondary)] text-sm leading-relaxed pt-4">
                {answer}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

const CATEGORIES = [
  { id: 'all', label: 'All Questions' },
  { id: 'general', label: 'General' },
  { id: 'fees', label: 'Fees & Funding' },
  { id: 'settling', label: 'Settling In' },
  { id: 'daily', label: 'Daily Routine' },
  { id: 'safety', label: 'Safety' },
]

export default function FAQs() {
  const [activeCategory, setActiveCategory] = useState('all')
  const [openId, setOpenId] = useState<string | null>(FAQS[0]?.id ?? null)

  const filtered = activeCategory === 'all'
    ? FAQS
    : FAQS.filter((f) => f.category === activeCategory)

  return (
    <>
      {/* Page header */}
      <div className="bg-[var(--color-primary-900)] pt-32 pb-16">
        <div className="container-site">
          <AnimatedSection>
            <p className="text-[var(--color-accent-400)] text-xs font-semibold uppercase tracking-[0.15em] mb-3 font-[var(--font-family-heading)]">
              FAQs
            </p>
            <h1 className="font-[var(--font-family-heading)] font-bold text-white text-4xl md:text-5xl leading-tight tracking-tight max-w-2xl">
              Frequently Asked Questions
            </h1>
            <p className="mt-4 text-white/90 text-base md:text-lg leading-relaxed max-w-xl drop-shadow-[0_1px_2px_rgba(0,0,0,0.4)]">
              Everything to know about the childcare service, from settling in to fees 
              and safety.
            </p>
          </AnimatedSection>
        </div>
      </div>

      <SectionWrapper background="background">
        {/* Category filter */}
        <AnimatedSection className="mb-8">
          <div
            className="flex flex-wrap gap-2"
            role="tablist"
            aria-label="FAQ categories"
          >
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                type="button"
                role="tab"
                aria-selected={activeCategory === cat.id}
                onClick={() => { setActiveCategory(cat.id); setOpenId(null) }}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-150 ${
                  activeCategory === cat.id
                    ? 'bg-[var(--color-primary-500)] text-white shadow-[var(--shadow-soft)]'
                    : 'bg-white text-[var(--color-text-secondary)] border border-[var(--color-muted)] hover:border-[var(--color-primary-300)] hover:text-[var(--color-primary-500)]'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </AnimatedSection>

        {/* Accordion */}
        <div className="max-w-3xl space-y-3" role="list">
          {filtered.map((faq) => (
            <AnimatedSection key={faq.id} role="listitem">
              <AccordionItem
                id={faq.id}
                question={faq.question}
                answer={faq.answer}
                isOpen={openId === faq.id}
                onToggle={() => setOpenId(openId === faq.id ? null : faq.id)}
              />
            </AnimatedSection>
          ))}
        </div>

        {/* Contact prompt */}
        <AnimatedSection delay={0.3} className="mt-12">
          <div className="bg-[var(--color-primary-50)] border border-[var(--color-primary-100)] rounded-[var(--radius-xl)] p-7 max-w-2xl">
            <h3 className="font-[var(--font-family-heading)] font-semibold text-lg text-[var(--color-primary-700)] mb-2">
              Still have questions?
            </h3>
            <p className="text-[var(--color-primary-600)] text-sm leading-relaxed mb-4">
              Information and guidance are readily provided. Whether preparing to book or 
              exploring options, inquiries are always welcome.
            </p>
            <a
              href="/contact"
              id="faqs-page-contact-link"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-[var(--color-primary-500)] hover:bg-[var(--color-primary-600)] text-white font-semibold rounded-xl text-sm transition-all duration-200"
            >
              Get in Touch
            </a>
          </div>
        </AnimatedSection>
      </SectionWrapper>

      <CTASection />
    </>
  )
}
