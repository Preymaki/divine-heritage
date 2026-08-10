export interface Service {
  id: string
  icon: string
  title: string
  ageRange: string
  availability: string
  description: string
  features: string[]
  colour: string
}

export const SERVICES: Service[] = [
  {
    id: 'childminding',
    icon: 'Home',
    title: 'Full-Day Childminding',
    ageRange: 'Toddlers – Pre-school (1 – 5 years)',
    availability: 'Mon – Fri, flexible hours',
    description:
      'Our core service provides full-day care in a warm, home-like setting. Children benefit from a consistent routine, personalised attention, and a rich variety of activities tailored to their developmental stage.',
    features: [
      'Home-cooked nutritious meals & snacks',
      'Daily outdoor play in secure garden',
      'Age-appropriate learning activities',
      'Regular park & playground visits',
      'EYFS curriculum support',
      'Detailed daily updates for parents',
    ],
    colour: 'primary',
  },
  {
    id: 'early-years',
    icon: 'Sparkles',
    title: 'Early Years Care',
    ageRange: 'Toddlers (1 – 3 years)',
    availability: 'Flexible sessions available',
    description:
      'Specialised care for babies and toddlers during their most formative years. We focus on secure attachment, sensory exploration, language development, and building a love of learning from day one.',
    features: [
      'Secure attachment approach',
      'Sensory play & exploration',
      'Language-rich environment',
      'Baby-led weaning support',
      'Sleep routine support',
      'Regular parent progress updates',
    ],
    colour: 'accent',
  },
  {
    id: 'after-school',
    icon: 'BookOpen',
    title: 'After School Care',
    ageRange: '5 – 11 years',
    availability: 'After school to 6:00pm',
    description:
      'A relaxed, supportive after-school environment where children can unwind, have a healthy snack, complete homework, and enjoy free play before heading home. School pick-up available on request.',
    features: [
      'School collection service (on request)',
      'Homework support',
      'Healthy afternoon snack',
      'Outdoor play time',
      'Arts, crafts & creative play',
      'Calm, reassuring environment',
    ],
    colour: 'sage',
  },
]
