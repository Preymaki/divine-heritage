export const SITE = {
  name: 'Divine Heritage Childcare Service',
  shortName: 'Divine Heritage',
  tagline: 'A Safe, Nurturing Home for Every Child',
  description:
    'Professional home-based childminding in London. A safe, nurturing, family-centred environment where every child is loved, valued, and encouraged to grow.',
  phone: '07939 303144',
  email: 'Divineheritagechildcare@gmail.com',
  address: 'Pitman Building, Freda Street, SE16 4BW',
  ofsted: '', // TODO: Add Ofsted registration number before launch
  founded: '2017',
  social: {
    facebook: 'https://facebook.com/divineheritagechildcare',
    instagram: 'https://instagram.com/divineheritagechildcare',
    childcare: 'https://www.childcare.co.uk/profile/2305993',
  },
} as const

export const NAV_LINKS = [
  { label: 'Home', href: '/' },
  { label: 'About', href: '/about' },
  { label: 'Services', href: '/services' },
  { label: 'Policies', href: '/policies' },
  { label: 'FAQs', href: '/faqs' },
  { label: 'Contact', href: '/contact' },
  { label: 'Apply', href: '/apply' },
] as const

export const CTA = {
  primary: { label: 'Apply Now', href: '/apply' },
  secondary: { label: 'Book a Visit', href: '/contact' },
} as const
