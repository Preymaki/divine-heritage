import {
  TreePine,
  Palette,
  BookOpen,
  Users,
  Music,
  Sparkles,
  Moon,
  Apple,
  Library,
  Shapes,
} from 'lucide-react'
import { ACTIVITIES } from '@data/activities'
import AnimatedSection from '@components/ui/AnimatedSection'
import SectionWrapper from '@components/ui/SectionWrapper'
import SectionHeader from '@components/ui/SectionHeader'

type LucideIcon = React.ComponentType<{ size?: number }>

const iconMap: Record<string, LucideIcon> = {
  TreePine,
  Shapes,
  Palette,
  BookOpen,
  Music,
  Library,
  Users,
  Sparkles,
  Apple,
  Moon,
}

const DAILY_SCHEDULE = [
  { time: '8:00 – 9:30am', activity: 'Welcome, breakfast & free play' },
  { time: '9:30 – 10:00am', activity: 'Circle time — register, stories, songs & rhymes' },
  { time: '10:00am – 12:00pm', activity: 'Outdoor play & EYFS-linked learning activities' },
  { time: '12:00 – 1:00pm', activity: 'Lunch — packed meals' },
  { time: '1:00 – 3:00pm', activity: 'Rest / quiet time' },
  { time: '3:00 – 3:45pm', activity: 'School pick-ups' },
  { time: '3:45 – 4:30pm', activity: 'Tea time' },
  { time: '4:30 – 6:00pm', activity: 'Adult-led activities, free play & wind-down' },
]

export default function DailyActivities() {
  return (
    <SectionWrapper id="daily-activities" background="muted">
      {/* Section header */}
      <AnimatedSection className="text-center flex justify-center mb-12">
        <SectionHeader
          eyebrow="A Typical Day"
          title="Rich Experiences, Every Day"
          subtitle="The daily programme balances structured learning with free play, outdoor time, creative activities, and essential rest, keeping every day exciting, varied, and developmentally rich."
          centered
          maxWidth="max-w-2xl"
        />
      </AnimatedSection>

      {/* Main two-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
        {/* Daily schedule */}
        <AnimatedSection direction="left">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--color-primary-500)] mb-5 font-[var(--font-family-heading)]">
            Sample Daily Routine
          </p>
          <div className="space-y-2.5">
            {DAILY_SCHEDULE.map(({ time, activity }) => (
              <div
                key={time}
                className="flex items-start gap-4 p-3.5 rounded-xl bg-white border border-[var(--color-muted)] group hover:border-[var(--color-primary-200)] hover:shadow-[var(--shadow-soft)] transition-all duration-200 focus-within:border-[var(--color-primary-300)]"
              >
                <time
                  className="text-[11px] font-semibold text-[var(--color-primary-500)] shrink-0 w-32 sm:w-36 leading-snug pt-0.5 font-[var(--font-family-heading)]"
                  aria-label={time}
                >
                  {time}
                </time>
                <span className="text-sm text-[var(--color-text-secondary)] leading-snug">
                  {activity}
                </span>
              </div>
            ))}
          </div>
          <p className="text-xs text-[var(--color-text-muted)] mt-3 italic">
            Routines are flexible and adapted to each child's individual needs, age and interests.
          </p>
        </AnimatedSection>

        {/* Activities grid */}
        <AnimatedSection direction="right" delay={0.12}>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--color-primary-500)] mb-5 font-[var(--font-family-heading)]">
            Activities Provided
          </p>
          <div className="grid grid-cols-2 gap-3">
            {ACTIVITIES.map((activity, i) => {
              const Icon = iconMap[activity.icon] ?? TreePine
              return (
                <AnimatedSection key={activity.id} delay={0.18 + i * 0.06}>
                  <div
                    className="group flex items-start gap-3 p-3.5 rounded-[var(--radius-lg)] bg-white border border-[var(--color-muted)] hover:shadow-[var(--shadow-card)] hover:border-transparent transition-all duration-250 focus-within:border-[var(--color-primary-300)]"
                  >
                    <div
                      className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-transform duration-200 group-hover:scale-110"
                      style={{ backgroundColor: `${activity.colour}18`, color: activity.colour }}
                      aria-hidden="true"
                    >
                      <Icon size={16} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[var(--color-text-primary)] font-semibold text-xs font-[var(--font-family-heading)] leading-snug">
                        {activity.title}
                      </p>
                      <p className="text-[var(--color-text-muted)] text-[11px] leading-snug mt-0.5 hidden sm:block line-clamp-2">
                        {activity.description}
                      </p>
                    </div>
                  </div>
                </AnimatedSection>
              )
            })}
          </div>
        </AnimatedSection>
      </div>
    </SectionWrapper>
  )
}
