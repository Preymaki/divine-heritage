export const SITE = {
  name: 'Divine Heritage Childcare Service',
  shortName: 'Divine Heritage',
  tagline: 'A Safe, Nurturing Home for Every Child',
  description:
    'Professional home-based childminding in London. We provide a safe, nurturing, family-centred environment where every child is loved, valued, and encouraged to grow.',
  phone: '07939 303144',
  email: 'Divineheritagechildcare@gmail.com',
  address: 'Pitman Building, Freda Street, SE16 4BW',
  ofsted: '', // TODO: Add Ofsted registration number before launch
  founded: '2018',
  social: {
    facebook: 'https://facebook.com/divineheritagechildcare',
    instagram: 'https://instagram.com/divineheritagechildcare',
  },
} as const

export const NAV_LINKS = [
  { label: 'Home', href: '/' },
  { label: 'About', href: '/about' },
  { label: 'Services', href: '/services' },
  { label: 'Gallery', href: '/gallery' },
  { label: 'FAQs', href: '/faqs' },
  { label: 'Contact', href: '/contact' },
] as const

export const CTA = {
  primary: { label: 'Book a Visit', href: '/contact' },
  secondary: { label: 'Learn More', href: '/about' },
} as const
