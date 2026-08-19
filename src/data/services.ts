export interface Service {
  id: string
  icon: string
  title: string
  ageRange: string
  shortAge: string
  availability: string
  shortAvailability: string
  description: string
  shortDescription: string
  features: string[]
  highlights: string[]
  colour: string
}

export const SERVICES: Service[] = [
  {
    id: 'childminding',
    icon: 'Home',
    title: 'Full Day Care',
    ageRange: 'Babies & Toddlers – Pre-school (5/6 months – 5 years)',
    shortAge: '5 mos – 5 yrs',
    availability: 'Mon – Thu 8:00am – 6:00pm, Fri 8:00am – 5:00pm',
    shortAvailability: 'Full-Day Care',
    shortDescription:
      'A loving home-from-home setting combining structured daily routines with joyful, EYFS-aligned learning.',
    description:
      'The core service provides full-day care in a warm, home-from-home setting. Children benefit from a consistent routine, personalized attention, and a rich variety of activities tailored to their developmental stage.',
    highlights: [
      'EYFS-aligned early learning',
      'Daily indoor & garden play',
      'Personalised parent updates',
    ],
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
    shortAge: '5 mos – 3 yrs',
    availability: 'Mon – Thu 8:00am – 6:00pm, Fri 8:00am – 5:00pm',
    shortAvailability: 'Mon – Fri Sessions',
    shortDescription:
      'Specialised infant and toddler care nurturing secure bonds, sensory discovery, and early milestones.',
    description:
      'Catering to babies and toddlers during their most formative years, this specialised care focuses on secure attachment, sensory exploration, language development, and building a love of learning from day one.',
    highlights: [
      'Warm, secure attachment focus',
      'Sensory play & exploration',
      'Early speech & language growth',
    ],
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
    shortAge: '5 – 11 yrs',
    availability: 'Mon – Thu 8:00am – 6:00pm, Fri 8:00am – 5:00pm',
    shortAvailability: '3:00pm – 6:00pm',
    shortDescription:
      'A fun, calm after-school haven for children to unwind with games, creative crafts, and school pickups.',
    description:
      'A relaxed, supportive after-school environment where children can unwind, have their snacks, enjoy indoor and outdoor play, and socialise before heading home. School pickups available.',
    highlights: [
      'Local school pickup service',
      'Arts, crafts & creative play',
      'Wholesome snack & unwind time',
    ],
    features: [
      'School pickups',
      'Indoor and outdoor play',
      'Arts, crafts & creative play',
      'Updates for parents',
      'Calm, reassuring environment',
    ],
    colour: 'sage',
  },
  {
    id: 'flexible-hours',
    icon: 'Clock',
    title: 'Part-Time & Flexible Hours',
    ageRange: 'Babies, Toddlers & Pre-school – 5/6 months – 5 years',
    shortAge: '5 mos – 5 yrs',
    availability: 'Flexible sessions available Monday – Friday, subject to availability',
    shortAvailability: 'Flexible Slots',
    shortDescription:
      'Tailored morning or afternoon slots designed to seamlessly fit around your family’s busy schedule.',
    description:
      'A flexible childcare option designed around the needs of busy families. Parents can choose shorter sessions or selected days throughout the week, while children continue to enjoy a nurturing home-from-home environment with opportunities to learn, play and develop at their own pace.',
    highlights: [
      'Morning or afternoon sessions',
      'Adapts to your work routine',
      'Full access to EYFS activities',
    ],
    features: [
      'Flexible morning or afternoon sessions',
      'Personalised care and attention',
      'Indoor and outdoor play',
      'Age-appropriate learning and creative activities',
      'EYFS-aligned learning and development',
      'Regular updates for parents',
    ],
    colour: 'primary',
  },
]

