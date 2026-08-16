export interface FAQ {
  id: string
  question: string
  answer: string
  category: 'general' | 'fees' | 'settling' | 'daily' | 'safety'
}

export const FAQS: FAQ[] = [
  {
    id: 'ofsted',
    question: 'Is Divine Heritage Ofsted registered?',
    answer:
      'Yes, Divine Heritage is fully registered with Ofsted, holding all required qualifications and insurances. Full Public Liability Insurance is maintained, and every adult in the household holds an enhanced DBS check. The Ofsted registration is publicly verifiable on the Ofsted website.',
    category: 'general',
  },
  {
    id: 'ages',
    question: 'What ages and sessions are cared for?',
    answer:
      'Full-time and part-time sessions are provided for Babies & Toddlers (5/6 months – 3 years) and Preschoolers (3 – 5 years), as well as After-School Care for children aged 5 – 11 years. Numbers are carefully managed to maintain an exceptional standard of individualised care for every child.',
    category: 'general',
  },
  {
    id: 'hours',
    question: 'What are the hours of operation?',
    answer:
      'Operating hours are Monday to Thursday 8:00am to 6:00pm, and Friday 8:00am to 5:00pm. Full-time and part-time flexible sessions are available across the week, subject to availability. Weekend or overnight care is not currently offered.',
    category: 'general',
  },
  {
    id: 'fees',
    question: 'What are the fees?',
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
    question: 'Are meals provided or do children bring their own food?',
    answer:
      'Children bring in their own food and packed meals. Healthy eating routines, individual preferences, and dietary requirements are supported and accommodated throughout the day.',
    category: 'daily',
  },
  {
    id: 'eyfs',
    question: 'How does Divine Heritage support children\'s learning and development?',
    answer:
      'The Early Years Foundation Stage (EYFS) curriculum is followed, with activities planned around each child\'s individual interests and developmental stage. A Learning Journey is maintained for each child, documenting progress with photos and observations, and shared regularly with parents.',
    category: 'daily',
  },
  {
    id: 'outdoor',
    question: 'Do children get outdoor time every day?',
    answer:
      'Indoor and outdoor play is a cornerstone of the provision. Children enjoy a large, secure garden every day alongside indoor creative learning, with trips to the local library and community groups. Fresh air and active play are vital for child wellbeing.',
    category: 'daily',
  },
  {
    id: 'illness',
    question: 'What happens if a child is unwell?',
    answer:
      'If a child becomes unwell during the day, parents are contacted immediately. Public Health England exclusion guidelines for illness are followed. Children who have experienced vomiting or diarrhoea must not return for 48 hours after the last episode to protect all children in the setting.',
    category: 'safety',
  },
  {
    id: 'emergency',
    question: 'What first aid training and certifications are held?',
    answer:
      'A current Paediatric First Aid certificate is held, and a comprehensive first aid kit is kept on the premises. In the event of a medical emergency, emergency services (999) and parents are contacted immediately. Emergency contact forms and medical information are maintained for every child in care.',
    category: 'safety',
  },
  {
    id: 'safeguarding',
    question: 'How does Divine Heritage keep children safe?',
    answer:
      'Child safety is the absolute priority. A comprehensive Safeguarding policy is maintained with up-to-date Safeguarding training. All adults in the home hold enhanced DBS certificates. The setting is fully risk-assessed, with a fully enclosed and secure garden. Robust policies are in place for outings, medication, and emergency procedures.',
    category: 'safety',
  },
]
