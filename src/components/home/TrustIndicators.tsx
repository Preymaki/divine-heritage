import { ShieldCheck, Award, Heart, BookOpen, Smile } from 'lucide-react'
import AnimatedSection from '@components/ui/AnimatedSection'

const TRUST_ITEMS = [
  {
    icon: ShieldCheck,
    label: 'Ofsted Registered',
    description: 'Fully registered & compliant',
    colour: '#1e56d0',  // blue
  },
  {
    icon: Award,
    label: 'DBS Checked',
    description: 'All household adults checked',
    colour: '#6b9e7a',  // sage
  },
  {
    icon: Heart,
    label: 'Paediatric First Aid',
    description: 'First aid trained & certified',
    colour: '#e0289b',  // pink
  },
  {
    icon: ShieldCheck,
    label: 'Safeguarding Trained',
    description: 'Child protection up to date',
    colour: '#3a6be7',  // mid blue
  },
  {
    icon: BookOpen,
    label: 'EYFS Qualified',
    description: 'Early years professional',
    colour: '#f054af',  // soft pink
  },
  {
    icon: Smile,
    label: 'Family-Centred',
    description: 'Warm, welcoming environment',
    colour: '#1845aa',  // dark blue
  },
]

export default function TrustIndicators() {
  return (
    <section
      className="bg-white py-10 border-b border-[var(--color-muted)]"
      aria-label="Trust credentials and qualifications"
    >
      <div className="container-site">
        <AnimatedSection>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {TRUST_ITEMS.map(({ icon: Icon, label, description, colour }, i) => (
              <AnimatedSection key={label} delay={i * 0.07} className="text-center group">
                <div
                  className="mx-auto mb-3 w-12 h-12 rounded-2xl flex items-center justify-center transition-transform duration-300 group-hover:scale-105"
                  style={{ backgroundColor: `${colour}15` }}
                  aria-hidden="true"
                >
                  <Icon size={22} style={{ color: colour }} />
                </div>
                <p className="text-[var(--color-text-primary)] font-semibold text-xs sm:text-sm font-[var(--font-family-heading)] leading-snug">
                  {label}
                </p>
                <p className="text-[var(--color-text-muted)] text-xs mt-0.5 leading-snug hidden sm:block">
                  {description}
                </p>
              </AnimatedSection>
            ))}
          </div>
        </AnimatedSection>
      </div>
    </section>
  )
}
