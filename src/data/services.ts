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
    ageRange: 'Babies & Toddlers – Pre-school (5/6 months – 5 years)',
    availability: 'Mon – Thu 8:00am – 6:00pm, Fri 8:00am – 5:00pm',
    description:
      'The core service provides full-day care in a warm, home-from-home setting. Children benefit from a consistent routine, personalised attention, and a rich variety of activities tailored to their developmental stage.',
    features: [
      'Children bring in their own food',
      'Indoor and outdoor play',
      'Age-appropriate learning activities',
      'EYFS curriculum support',
      'Updates for parents',
    ],
    colour: 'primary',
  },
  {
    id: 'early-years',
    icon: 'Sparkles',
    title: 'Early Years Care',
    ageRange: 'Babies & Toddlers (5/6 months – 3 years)',
    availability: 'Mon – Thu 8:00am – 6:00pm, Fri 8:00am – 5:00pm',
    description:
      'Catering to babies and toddlers during their most formative years, this specialised care focuses on secure attachment, sensory exploration, language development, and building a love of learning from day one.',
    features: [
      'Secure attachment and emotional safety',
      'Sensory exploration through play',
      'Indoor and outdoor play',
      'Language development and communication skills',
      'Updates for parents',
    ],
    colour: 'accent',
  },
  {
    id: 'after-school',
    icon: 'BookOpen',
    title: 'After School Care',
    ageRange: '5 – 11 years',
    availability: 'Mon – Thu to 6:00pm, Fri to 5:00pm',
    description:
      'A relaxed, supportive after-school environment where children can unwind, have their snacks, enjoy indoor and outdoor play, and socialise before heading home. School pickups available.',
    features: [
      'School pickups',
      'Indoor and outdoor play',
      'Arts, crafts & creative play',
      'Updates for parents',
      'Calm, reassuring environment',
    ],
    colour: 'sage',
  },
]
