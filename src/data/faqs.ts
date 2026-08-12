export interface FAQ {
  id: string
  question: string
  answer: string
  category: 'general' | 'fees' | 'settling' | 'daily' | 'safety'
}

export const FAQS: FAQ[] = [
  {
    id: 'ofsted',
    question: 'Are you Ofsted registered?',
    answer:
      'Yes, we are fully registered with Ofsted and hold all required qualifications and insurances. We carry full Public Liability Insurance and every adult in the household holds an enhanced DBS check. Our Ofsted registration is publicly verifiable on the Ofsted website.',
    category: 'general',
  },
  {
    id: 'ages',
    question: 'What ages do you care for?',
    answer:
      'We care for babies, toddlers, pre-school children, and school-age children (from 0 / 6 months to 11 years). After-school care is also available for school-age children. We carefully manage our numbers to maintain an exceptional standard of individualised care for every child.',
    category: 'general',
  },
  {
    id: 'hours',
    question: 'What are your hours of operation?',
    answer:
      'Our standard hours are Monday to Thursday, 8:00am to 6:00pm, and Friday 8:00am to 5:00pm. We can discuss flexible arrangements including part-time, term-time only, and before or after school care depending on availability. We do not currently offer weekend or overnight care.',
    category: 'general',
  },
  {
    id: 'fees',
    question: 'What are your fees?',
    answer:
      'Fees are based on age and hours required and are discussed during your initial visit. We accept Tax-Free Childcare, childcare vouchers, and the government\'s 15 and 30 hours free childcare for eligible 3 and 4-year-olds. Please contact us to discuss your specific requirements and a personalised quote.',
    category: 'fees',
  },
  {
    id: 'deposit',
    question: 'Is a deposit required to secure a place?',
    answer:
      'Yes, a deposit equivalent to two weeks\' fees is required to secure your child\'s place. This is held throughout the placement and deducted from your final invoice. Notice periods and terms are outlined clearly in our contract.',
    category: 'fees',
  },
  {
    id: 'settling-in',
    question: 'How does the settling-in process work?',
    answer:
      'We offer a gradual, child-led settling-in programme at no extra charge. Typically this begins with a stay-and-play session, followed by short sessions that gradually increase in length until your child feels confident and happy. We never rush this process — every child settles at their own pace.',
    category: 'settling',
  },
  {
    id: 'food',
    question: 'Do you provide meals and snacks?',
    answer:
      'Yes, we provide nutritious home-cooked meals and snacks throughout the day as part of our fee. We follow healthy eating guidelines and can accommodate allergies, dietary requirements, and cultural or religious food preferences. We will always discuss your child\'s needs with you before they start.',
    category: 'daily',
  },
  {
    id: 'eyfs',
    question: 'How do you support children\'s learning and development?',
    answer:
      'We follow the Early Years Foundation Stage (EYFS) curriculum and plan activities around each child\'s individual interests and developmental stage. We maintain a Learning Journey for each child, which documents their progress with photos and observations, and share this regularly with parents.',
    category: 'daily',
  },
  {
    id: 'outdoor',
    question: 'Do children get outdoor time every day?',
    answer:
      'Absolutely. Daily outdoor play is a cornerstone of our provision. Children enjoy our large, secure garden every day, and we make regular trips to local parks, playgrounds, the library, and community playgroups. We go out in all weather (suitably dressed!) as we believe fresh air is vital for children\'s wellbeing.',
    category: 'daily',
  },
  {
    id: 'illness',
    question: 'What happens if my child is unwell?',
    answer:
      'If your child becomes unwell during the day, we will contact you immediately. We follow Public Health England exclusion guidelines for illness. Children who have had vomiting or diarrhoea must not return for 48 hours after the last episode. We ask parents to keep children home when they are unwell to protect all children in our care.',
    category: 'safety',
  },
  {
    id: 'emergency',
    question: 'What first aid training do you hold?',
    answer:
      'We hold a current Paediatric First Aid certificate and keep a comprehensive first aid kit on the premises. In the event of a medical emergency, we will call 999 and contact you immediately. We also have emergency contact forms and medical information for every child in our care.',
    category: 'safety',
  },
  {
    id: 'safeguarding',
    question: 'How do you keep children safe?',
    answer:
      'Child safety is our absolute priority. We hold a comprehensive Safeguarding policy and have completed Safeguarding training. All adults in the home have enhanced DBS certificates. Our home is fully risk-assessed, and our garden is fully enclosed and secure. We also have robust policies for outings, medication, and emergency procedures.',
    category: 'safety',
  },
]
