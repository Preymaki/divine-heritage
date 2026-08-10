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

const WHY_ITEMS = [
  {
    icon: Home,
    title: 'Safe Home Environment',
    description:
      'Our fully risk-assessed home provides the warmth and comfort of a family setting, with professional-grade safety standards.',
    colour: '#1e56d0',  // blue
  },
  {
    icon: TreePine,
    title: 'Large Playroom & Garden',
    description:
      'A dedicated playroom packed with age-appropriate resources, and a large, fully enclosed private garden for daily outdoor play.',
    colour: '#6b9e7a',  // sage
  },
  {
    icon: Heart,
    title: 'Individualised Care',
    description:
      "Every child is unique. We tailor our approach to each child's personality, interests, and developmental stage.",
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
    title: 'Fully Insured & Ofsted Registered',
    description:
      'Complete peace of mind. We hold full Public Liability Insurance and are registered and inspected by Ofsted.',
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
      "Daily updates, photos, and an open-door policy keep you connected and informed about your child's day.",
    colour: '#1e56d0',  // blue
  },
]

export default function WhyChooseUs() {
  return (
    <SectionWrapper id="why-choose-us" background="white">
      <AnimatedSection className="text-center flex justify-center">
        <SectionHeader
          eyebrow="Why Choose Us"
          title="Everything a Growing Child Needs"
          subtitle="We've thoughtfully designed every aspect of our setting to give children the best possible start in life — and give parents complete peace of mind."
          centered
          maxWidth="max-w-2xl"
        />
      </AnimatedSection>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mt-12">
        {WHY_ITEMS.map((item, i) => {
          const Icon = item.icon
          return (
            <AnimatedSection key={item.title} delay={i * 0.07}>
              <div className="group p-5 rounded-[var(--radius-lg)] bg-[var(--color-background)] border border-[var(--color-muted)] hover:border-transparent hover:shadow-[var(--shadow-card)] hover:bg-white transition-all duration-300 h-full">
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
              </div>
            </AnimatedSection>
          )
        })}
      </div>
    </SectionWrapper>
  )
}
