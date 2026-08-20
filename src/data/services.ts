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
    id: 'full-day-care',
    icon: 'Home',
    title: 'Full Day Care',
    ageRange: 'Babies & Toddlers (5 months – 3 years)',
    shortAge: '5 mths – 3 yrs',
    availability: 'Mon – Thu 8:00am – 6:00pm, Fri 8:00am – 5:00pm',
    shortAvailability: 'Full-Day Care',
    shortDescription:
      'A loving home-from-home setting combining structured daily routines with joyful, EYFS-aligned learning.',
    description:
      'The core service provides full-day care in a warm, home-from-home setting. Children benefit from a consistent routine, personalised attention, and a rich variety of activities tailored to their developmental stage.',
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
    id: 'flexible-hours',
    icon: 'Clock',
    title: 'Part-Time & Flexible Hours',
    ageRange: 'Babies & Toddlers (5 months – 3 years)',
    shortAge: '5 mths – 3 yrs',
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
    colour: 'accent',
  },
  {
    id: 'after-school',
    icon: 'BookOpen',
    title: 'After School Care',
    ageRange: '4 – 10 years',
    shortAge: '4 – 10 yrs',
    availability: 'Monday – Friday during school term time',
    shortAvailability: 'Term Time',
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
    id: 'holiday-care',
    icon: 'Sun',
    title: 'Holiday Care',
    ageRange: 'Babies, Toddlers & School Age (5 months – 10 years)',
    shortAge: '5 mths – 10 yrs',
    availability: 'Available during school holidays, Monday – Friday',
    shortAvailability: 'School Holidays',
    shortDescription:
      'Fun, stimulating holiday childcare featuring themed discovery, arts, sensory exploration, and outdoor adventures.',
    description:
      'Specialised holiday childcare providing a fun, stimulating, and nurturing environment for babies, toddlers, and school-age children (5 months – 10 years) during school breaks. Children enjoy a rich variety of seasonal activities, creative arts and crafts, outdoor play in the secure garden, themed discovery days, and local outings—keeping routines consistent and enriching while schools and nurseries are on break.',
    highlights: [
      'Themed discovery & creative arts',
      'Daily outdoor garden play & trips',
      'Flexible booking for busy families',
    ],
    features: [
      'Available across all school holiday periods',
      'Indoor sensory and creative crafts',
      'Outdoor active play and nature exploration',
      'Flexible full-day and half-day options',
      'Snack and meal routines (bring own food)',
      'Regular photo updates for parents',
    ],
    colour: 'primary',
  },
]

