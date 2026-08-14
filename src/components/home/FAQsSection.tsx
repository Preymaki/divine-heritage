import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { FAQS } from '@data/faqs'
import AnimatedSection from '@components/ui/AnimatedSection'
import SectionWrapper from '@components/ui/SectionWrapper'
import SectionHeader from '@components/ui/SectionHeader'

// Show a curated subset on the home page
const HOME_FAQ_IDS = ['ofsted', 'ages', 'hours', 'settling-in', 'food', 'outdoor']
const homeFaqs = FAQS.filter((f) => HOME_FAQ_IDS.includes(f.id))

interface AccordionItemProps {
  question: string
  answer: string
  isOpen: boolean
  onToggle: () => void
  index: number
}

function AccordionItem({ question, answer, isOpen, onToggle, index }: AccordionItemProps) {
  return (
    <div className="border border-[var(--color-muted)] rounded-[var(--radius-lg)] overflow-hidden bg-white">
      <button
        type="button"
        onClick={onToggle}
        className="w-full flex items-center justify-between gap-4 p-5 text-left transition-colors duration-150 hover:bg-[var(--color-background)] group"
        aria-expanded={isOpen}
        id={`faq-btn-${index}`}
        aria-controls={`faq-panel-${index}`}
      >
        <span className="font-[var(--font-family-heading)] font-semibold text-sm md:text-base text-[var(--color-text-primary)] leading-snug">
          {question}
        </span>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2, ease: 'easeInOut' }}
          className="shrink-0 w-7 h-7 rounded-lg bg-[var(--color-primary-50)] flex items-center justify-center group-hover:bg-[var(--color-primary-100)] transition-colors duration-150"
        >
          <ChevronDown size={16} className="text-[var(--color-primary-500)]" />
        </motion.div>
      </button>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            id={`faq-panel-${index}`}
            role="region"
            aria-labelledby={`faq-btn-${index}`}
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

export default function FAQsSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0)

  return (
    <SectionWrapper id="faqs" background="white">
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.4fr] gap-12 lg:gap-20">
        {/* Left: Header */}
        <AnimatedSection direction="left">
          <SectionHeader
            eyebrow="FAQs"
            title="Common Questions from Parents"
            subtitle="Choosing the right childcare is one of the most important decisions for any family. Here are clear answers to frequently asked questions."
            maxWidth="max-w-full"
          />
          <div className="mt-8 p-5 bg-[var(--color-primary-50)] rounded-[var(--radius-lg)] border border-[var(--color-primary-100)]">
            <p className="text-[var(--color-primary-700)] text-sm font-medium">
              Can't find your answer?
            </p>
            <p className="text-[var(--color-primary-600)] text-sm mt-1 leading-relaxed">
              The team is always happy to assist. Get in touch to discuss any questions or specific requirements.
            </p>
            <a
              href="/contact"
              className="inline-flex items-center gap-1.5 mt-3 text-[var(--color-primary-500)] font-semibold text-sm hover:underline"
            >
              Get in Touch →
            </a>
          </div>
        </AnimatedSection>

        {/* Right: Accordion */}
        <AnimatedSection direction="right" delay={0.1}>
          <div className="space-y-3" role="list">
            {homeFaqs.map((faq, i) => (
              <div key={faq.id} role="listitem">
                <AccordionItem
                  question={faq.question}
                  answer={faq.answer}
                  isOpen={openIndex === i}
                  onToggle={() => setOpenIndex(openIndex === i ? null : i)}
                  index={i}
                />
              </div>
            ))}
          </div>
        </AnimatedSection>
      </div>
    </SectionWrapper>
  )
}
