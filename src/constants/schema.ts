import { SITE } from './site'
import type { FAQ } from '@data/faqs'

/**
 * LocalBusiness / ChildCare structured data for Divine Heritage Childcare Service.
 * Follows Google's Local Business & Child Care Schema.org guidelines.
 */
export const LOCAL_BUSINESS_SCHEMA = {
  '@context': 'https://schema.org',
  '@type': ['ChildCare', 'LocalBusiness'],
  '@id': `${SITE.url}/#childcare`,
  name: SITE.name,
  alternateName: SITE.shortName,
  url: SITE.url,
  logo: `${SITE.url}/logo-512.png`,
  image: [
    `${SITE.url}/images/about-setting-overview.jpeg`,
    `${SITE.url}/images/outdoor-spinning-ride.jpeg`,
    `${SITE.url}/images/arts-painting-easel.jpeg`,
  ],
  description:
    'Ofsted registered home-based childminding and early years childcare in Bermondsey, London SE16. Early years care (5 months–3 years), after-school care, and holiday clubs.',
  telephone: '+447939303144',
  email: SITE.email,
  priceRange: '££',
  currenciesAccepted: 'GBP',
  paymentAccepted: 'Cash, Bank Transfer, Tax-Free Childcare, Childcare Vouchers',
  address: {
    '@type': 'PostalAddress',
    streetAddress: 'Pitman Building, Freda Street',
    addressLocality: 'Bermondsey, London',
    postalCode: 'SE16 4BW',
    addressRegion: 'Greater London',
    addressCountry: 'GB',
  },
  geo: {
    '@type': 'GeoCoordinates',
    latitude: 51.4939,
    longitude: -0.0652,
  },
  openingHoursSpecification: [
    {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday'],
      opens: '08:00',
      closes: '18:00',
    },
    {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: ['Friday'],
      opens: '08:00',
      closes: '17:00',
    },
  ],
  areaServed: [
    {
      '@type': 'AdministrativeArea',
      name: 'Bermondsey',
    },
    {
      '@type': 'AdministrativeArea',
      name: 'London Borough of Southwark',
    },
    {
      '@type': 'AdministrativeArea',
      name: 'Rotherhithe',
    },
    {
      '@type': 'AdministrativeArea',
      name: 'Surrey Quays',
    },
  ],
  founder: {
    '@type': 'Person',
    name: 'Avril Cole',
    jobTitle: 'Ofsted Registered Childminder & Early Years Practitioner',
  },
  sameAs: [
    SITE.social.facebook,
    SITE.social.instagram,
    SITE.social.childcare,
  ],
}

/**
 * Generates FAQPage JSON-LD schema for rich accordion snippets in Google Search.
 */
export function generateFaqSchema(faqs: FAQ[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  }
}

/**
 * Generates BreadcrumbList JSON-LD schema for clear SERP breadcrumb paths.
 */
export function generateBreadcrumbSchema(items: { name: string; path: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: `${SITE.url}${item.path.startsWith('/') ? item.path : `/${item.path}`}`,
    })),
  }
}
