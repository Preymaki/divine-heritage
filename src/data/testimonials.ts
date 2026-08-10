export interface Testimonial {
  id: string
  name: string
  relationship: string
  childAge: string
  rating: number
  text: string
  initials: string
  colour: string
}

export const TESTIMONIALS: Testimonial[] = [
  {
    id: '1',
    name: 'Eunice Baguma Ball',
    relationship: 'Parent',
    childAge: 'Google Review ★★★★★',
    rating: 5,
    text: 'Our son attended Divine Heritage for 3 and a half months as we waited for a place at a nursery. Avril provided excellent care, helping him to develop through several milestones in this short time and was instrumental in preparing him for the transition to nursery. The service is run very professionally with regular feedback and updates on your child\'s progress provided through an app. Thank you Avril!',
    initials: 'EB',
    colour: '#1e56d0',
  },
  {
    id: '2',
    name: 'Y. Marie Slimani',
    relationship: 'Parent',
    childAge: 'Google Review ★★★★★',
    rating: 5,
    text: 'We have been so lucky to meet Avril and find this place. Our daughter has been having a wonderful time and learning so much. She loves going there! The location is perfect, very near the station, so easy to jump on the tube to go to the office, and the hours work very well for us. Thanks again for taking such good care of our baby daughter!',
    initials: 'YS',
    colour: '#e0289b',
  },
  {
    id: '3',
    name: 'Ousse Sankoh',
    relationship: 'Parent',
    childAge: 'Google Review ★★★★★',
    rating: 5,
    text: 'Divine childcare service is the best childcare provider that I will recommend to all parents or guardians who want their children to be looked after properly. As a mum of two, leaving my kids is an important decision to make. It is easier to know that your children are in a safe environment.',
    initials: 'OS',
    colour: '#6b9e7a',
  },
  {
    id: '4',
    name: 'Victor Smith',
    relationship: 'Parent',
    childAge: 'Google Review ★★★★★',
    rating: 5,
    text: 'Thanks for the great service. I would recommend this to anyone working around London Bridge and Central London. Very easy to pick up my daughter after work.',
    initials: 'VS',
    colour: '#3a6be7',
  },
  {
    id: '5',
    name: 'Dan Stober',
    relationship: 'Parent',
    childAge: 'Google Review ★★★★',
    rating: 4,
    text: '2nd to none service ethos & principles. Keep up the good work.',
    initials: 'DS',
    colour: '#f054af',
  },
  {
    id: '6',
    name: 'Florence Creation',
    relationship: 'Parent',
    childAge: 'Google Review ★★★★★',
    rating: 5,
    text: 'Amazing service, very professional with high standard. Really pleased.',
    initials: 'FC',
    colour: '#1845aa',
  },
  {
    id: '7',
    name: 'Janice Cole',
    relationship: 'Parent',
    childAge: 'Google Review ★★★★★',
    rating: 5,
    text: 'Excellent service and great standard, highly recommend.',
    initials: 'JC',
    colour: '#6b9e7a',
  },
]
