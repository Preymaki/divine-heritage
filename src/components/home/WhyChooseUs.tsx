import {
  Home,
  TreePine,
  Heart,
  BookOpen,
  Users,
  ShieldCheck,
  Star,
  MessageSquare,
} from 'lucide-react'
import AnimatedSection from '@components/ui/AnimatedSection'
import SectionWrapper from '@components/ui/SectionWrapper'
import SectionHeader from '@components/ui/SectionHeader'

interface WhyItem {
  icon: React.ComponentType<{ size?: number; style?: React.CSSProperties }>
  title: string
  description: string
  bullets?: { label: string; text: string }[]
  colour: string
}

const WHY_ITEMS: WhyItem[] = [
  {
    icon: Home,
    title: 'Safe Home Environment',
    description:
      'This fully risk-assessed home provides the warmth and comfort of a family setting alongside professional-grade safety standards.',
    colour: '#1e56d0',  // blue
  },
  {
    icon: TreePine,
    title: 'The Setting',
    description:
      'The childcare environment is designed for independence and exploration, featuring:',
    bullets: [
      { label: 'Accessible Resources', text: 'Age-appropriate toys positioned at child height for independent selection.' },
      { label: 'Outdoor Exploration', text: 'The setting features a spacious, secure garden, allowing for daily outdoor play and physical development.' },
    ],
    colour: '#6b9e7a',  // sage
  },
  {
    icon: Heart,
    title: 'Individualised Care',
    description:
      'Recognising that every child is unique, daily care and learning experiences are carefully tailored to align with each child’s specific personality, interests, and developmental stage.',
    colour: '#e0289b',  // pink
  },
  {
    icon: BookOpen,
    title: 'EYFS Curriculum',
    description:
      "All activities are planned around the Early Years Foundation Stage, supporting children's learning and development holistically.",
    colour: '#3a6be7',  // mid blue
  },
  {
    icon: Users,
    title: 'Community & Socialisation',
    description:
      'Regular visits to playgroups, the library, and local parks give children rich social experiences outside the home.',
    colour: '#f054af',  // soft pink
  },
  {
    icon: ShieldCheck,
    title: 'Professional Credentials & Safety Standards',
    description:
      'Complete peace of mind is assured through full compliance and up-to-date professional qualifications, including:',
    bullets: [
      { label: 'Ofsted Inspected', text: 'Fully registered and regularly inspected.' },
      { label: 'Enhanced DBS Checked', text: 'Cleared for working safely with children.' },
      { label: 'Paediatric First Aid', text: 'Certified to handle medical situations confidently.' },
      { label: 'Safeguarding Trained', text: 'Up-to-date certification in child protection.' },
      { label: 'Fully Insured', text: 'Comprehensive public liability insurance in place.' },
    ],
    colour: '#1845aa',  // dark blue
  },
  {
    icon: Star,
    title: 'Consistent Routine',
    description:
      'Predictable daily routines help children feel secure and settled, supporting emotional wellbeing and development.',
    colour: '#e0289b',  // pink
  },
  {
    icon: MessageSquare,
    title: 'Open Parent Communication',
    description:
      "Daily updates, photos, and an open communication policy keep parents connected and informed about the child's day.",
    colour: '#1e56d0',  // blue
  },
]

export default function WhyChooseUs() {
  return (
    <SectionWrapper id="why-choose-us" background="white">
      <AnimatedSection className="text-center flex justify-center">
        <SectionHeader
          eyebrow="Why Divine Heritage"
          title="Everything a Growing Child Needs"
          subtitle="Thoughtfully designed to give children the best possible start in life, and parents complete peace of mind."
          centered
          maxWidth="max-w-2xl"
        />
      </AnimatedSection>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mt-12">
        {WHY_ITEMS.map((item, i) => {
          const Icon = item.icon
          return (
            <AnimatedSection key={item.title} delay={i * 0.07}>
              <div className="group p-5 rounded-[var(--radius-lg)] bg-[var(--color-background)] border border-[var(--color-muted)] hover:border-transparent hover:shadow-[var(--shadow-card)] hover:bg-white transition-all duration-300 h-full flex flex-col justify-between">
                <div>
                  <div
                    className="w-11 h-11 rounded-xl flex items-center justify-center mb-4 transition-transform duration-300 group-hover:scale-110"
                    style={{ backgroundColor: `${item.colour}18` }}
                  >
                    <Icon size={20} style={{ color: item.colour }} />
                  </div>
                  <h3 className="font-[var(--font-family-heading)] font-semibold text-sm text-[var(--color-text-primary)] leading-snug mb-2">
                    {item.title}
                  </h3>
                  <p className="text-[var(--color-text-muted)] text-xs leading-relaxed">
                    {item.description}
                  </p>
                  {item.bullets && (
                    <ul className="mt-2.5 space-y-1.5" role="list">
                      {item.bullets.map((b) => (
                        <li key={b.label} className="text-xs text-[var(--color-text-muted)] leading-relaxed">
                          <span className="font-semibold text-[var(--color-text-primary)]">• {b.label}:</span> {b.text}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            </AnimatedSection>
          )
        })}
      </div>
    </SectionWrapper>
  )
}
