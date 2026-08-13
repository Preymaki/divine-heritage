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
      'Yes, Divine Heritage is fully registered with Ofsted, holding all required qualifications and insurances. Full Public Liability Insurance is maintained, and every adult in the household holds an enhanced DBS check. The Ofsted registration is publicly verifiable on the Ofsted website.',
    category: 'general',
  },
  {
    id: 'ages',
    question: 'What ages do you care for?',
    answer:
      'Care is provided for babies, toddlers, pre-school children, and school-age children (from 0 / 6 months to 11 years). After-school care is also available. Numbers are carefully managed to maintain an exceptional standard of individualised care for every child.',
    category: 'general',
  },
  {
    id: 'hours',
    question: 'What are your hours of operation?',
    answer:
      'Standard operating hours are Monday to Thursday, 8:00am to 6:00pm, and Friday 8:00am to 5:00pm. Flexible arrangements, including part-time, term-time only, and before or after school care, can be arranged based on availability. Weekend or overnight care is not currently offered.',
    category: 'general',
  },
  {
    id: 'fees',
    question: 'What are your fees?',
    answer:
      'Fees are based on age and hours required and are discussed during the initial visit. Tax-Free Childcare, childcare vouchers, and government free childcare hours for eligible 3 and 4-year-olds are accepted. Contact the setting for a personalised quote based on specific requirements.',
    category: 'fees',
  },
  {
    id: 'deposit',
    question: 'Is a deposit required to secure a place?',
    answer:
      'Yes, a deposit equivalent to two weeks\' fees is required to secure a place. This is held throughout the placement and deducted from the final invoice. Notice periods and terms are outlined clearly in the contract.',
    category: 'fees',
  },
  {
    id: 'settling-in',
    question: 'How does the settling-in process work?',
    answer:
      'A gradual, child-led settling-in programme is offered at no extra charge. Typically this begins with a stay-and-play session, followed by short sessions that gradually increase in length until confidence is established. Settling happens at each child\'s own pace.',
    category: 'settling',
  },
  {
    id: 'food',
    question: 'Do you provide meals and snacks?',
    answer:
      'Yes, nutritious home-cooked meals and snacks are provided throughout the day as part of the fee. Healthy eating guidelines are followed, accommodating allergies, dietary requirements, and cultural or religious food preferences. Specific dietary needs are confirmed prior to starting.',
    category: 'daily',
  },
  {
    id: 'eyfs',
    question: 'How do you support children\'s learning and development?',
    answer:
      'The Early Years Foundation Stage (EYFS) curriculum is followed, with activities planned around each child\'s individual interests and developmental stage. A Learning Journey is maintained for each child, documenting progress with photos and observations, and shared regularly with parents.',
    category: 'daily',
  },
  {
    id: 'outdoor',
    question: 'Do children get outdoor time every day?',
    answer:
      'Daily outdoor play is a cornerstone of the provision. Children enjoy a large, secure garden every day, alongside regular trips to local parks, playgrounds, the library, and community playgroups. Outings take place in all weather (suitably dressed), as fresh air is vital for child wellbeing.',
    category: 'daily',
  },
  {
    id: 'illness',
    question: 'What happens if my child is unwell?',
    answer:
      'If a child becomes unwell during the day, parents are contacted immediately. Public Health England exclusion guidelines for illness are followed. Children who have experienced vomiting or diarrhoea must not return for 48 hours after the last episode to protect all children in the setting.',
    category: 'safety',
  },
  {
    id: 'emergency',
    question: 'What first aid training do you hold?',
    answer:
      'A current Paediatric First Aid certificate is held, and a comprehensive first aid kit is kept on the premises. In the event of a medical emergency, emergency services (999) and parents are contacted immediately. Emergency contact forms and medical information are maintained for every child in care.',
    category: 'safety',
  },
  {
    id: 'safeguarding',
    question: 'How do you keep children safe?',
    answer:
      'Child safety is the absolute priority. A comprehensive Safeguarding policy is maintained with up-to-date Safeguarding training. All adults in the home hold enhanced DBS certificates. The setting is fully risk-assessed, with a fully enclosed and secure garden. Robust policies are in place for outings, medication, and emergency procedures.',
    category: 'safety',
  },
]
