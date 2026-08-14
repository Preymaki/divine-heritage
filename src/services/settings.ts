/**
 * Settings Service
 *
 * Reads and writes the three Firestore singleton documents under
 * the `settings` collection:
 *
 *   settings/contact
 *   settings/hero
 *   settings/about
 *
 * Each getter falls back to the hardcoded SITE defaults if the document
 * doesn't exist yet. This means the public site always renders correctly
 * even before the admin has configured anything.
 *
 * Firestore security rules for `settings/{doc}`:
 *   allow read:  if true;             ← public pages need to read these
 *   allow write: if request.auth != null;
 */

import {
  doc,
  getDoc,
  setDoc,
  onSnapshot,
  serverTimestamp,
  type Unsubscribe,
} from 'firebase/firestore'
import { db } from '@services/firebase/config'
import type {
  ContactSettings,
  HeroSettings,
  AboutSettings,
  ContactPatch,
  HeroPatch,
  AboutPatch,
} from '@appTypes/settings'

// ---------------------------------------------------------------------------
// Collection / document IDs
// ---------------------------------------------------------------------------

const SETTINGS_COLLECTION = 'settings'
const DOC_CONTACT = 'contact'
const DOC_HERO    = 'hero'
const DOC_ABOUT   = 'about'

// ---------------------------------------------------------------------------
// Default values — mirror the existing hardcoded site constants exactly.
// These are returned whenever the Firestore document doesn't exist yet.
// ---------------------------------------------------------------------------

export const DEFAULT_CONTACT: ContactSettings = {
  phone:   '07939 303144',
  email:   'Divineheritagechildcare@gmail.com',
  address: 'Pitman Building, Freda Street, SE16 4BW',
  tagline: 'A Safe, Nurturing Home for Every Child',
  ofsted:  '',
  hours: {
    weekdays: 'Monday – Thursday 8:00 am – 6:00 pm, Friday 8:00 am – 5:00 pm',
    notes:    'School holiday care available on request',
  },
  social: {
    facebook:  'https://facebook.com/divineheritagechildcare',
    instagram: 'https://instagram.com/divineheritagechildcare',
  },
  updatedAt: null,
}

export const DEFAULT_HERO: HeroSettings = {
  eyebrow:      'London-Based Childminding',
  heading:      'Where Every Child Thrives, Grows, and Belongs',
  accentWord:   'Thrives',
  subtitle:     'Professional, nurturing home-based childcare in London. A safe, loving environment where your child is valued, inspired, and encouraged to flourish — every single day.',
  bgImageUrl:   '',
  ctaPrimary:   'Book a Visit',
  ctaSecondary: 'Learn More',
  updatedAt:    null,
}

export const DEFAULT_ABOUT: AboutSettings = {
  aboutImageUrl: '',
  previewTitle:    'A Childcare Service Built on Love & Trust',
  previewSubtitle: 'Founded in 2017, Divine Heritage provides warm, professional home-based childminding for families across South East London.',
  highlights: [
    { title: 'Child-Led Learning',      description: 'Activities are inspired by each child\'s interests and developmental stage.' },
    { title: 'Family Partnership',      description: 'Close collaboration is maintained with parents with regular updates.' },
    { title: 'Safe & Stimulating',      description: 'The home environment is fully Ofsted registered and richly resourced.' },
    { title: 'Indoor & Outdoor Play',   description: 'Spacious indoor learning areas and secure outdoor play.' },
  ],
  storyParagraphs: [
    'Divine Heritage Childcare Service was founded in 2017 with a clear vision: to create a warm, loving home-from-home where every child is seen, valued, and inspired to reach their full potential.',
    'As an Ofsted registered childminder based in South East London, Divine Heritage offers professional care in a genuine family setting. Children thrive here through rich activities, learning opportunities, and a safe, nurturing atmosphere.',
    'The approach is rooted in the Early Years Foundation Stage (EYFS) framework, guiding everything from activity planning to observation and documentation of child growth. Beyond routine documentation, key developmental milestones and friendships formed make the environment uniquely enriching.',
    'Every family joining the setting becomes part of the Divine Heritage community. Open, honest communication, regular updates, and collaborative support guide each child\'s unique journey.',
  ],
  missionQuote: 'Every child deserves to feel safe, loved, and celebrated. Divine Heritage provides a warm, nurturing space where children can explore, discover, and grow with confidence.',
  values: [
    { title: 'Love & Belonging',    description: 'Every child is welcomed as part of the family environment. Warm, secure relationships help children feel confident and valued.' },
    { title: 'Learning Through Play', description: 'A play-based approach aligned with EYFS is followed, where curiosity is celebrated and every activity serves a developmental purpose.' },
    { title: 'Partnership',         description: 'Collaboration with parents is central, with updates and milestones shared together as a team.' },
    { title: 'Respect & Inclusion', description: 'Diversity is celebrated, guiding children to respect and appreciate the world around them.' },
  ],
  bioName:       '',
  bioParagraphs: [
    'Divine Heritage offers young children the consistency of seeing the same warm, familiar childminder every day.',
    'With over 9 years of qualified home childminding experience in London, the setting delivers dedicated, individualised care designed to foster growth and happiness. It provides a safe, welcoming second home where children are celebrated and inspired daily.',
  ],
  bioQuote: 'Dedicated to providing exceptional care and investing in children\'s futures.',
  updatedAt: null,
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function replaceLegacyYears<T>(val: T): T {
  if (typeof val === 'string') {
    return val.replace(/\b2018\b/g, '2017') as unknown as T
  }
  if (Array.isArray(val)) {
    return val.map(replaceLegacyYears) as unknown as T
  }
  if (val !== null && typeof val === 'object') {
    const res: Record<string, unknown> = {}
    for (const [k, v] of Object.entries(val as Record<string, unknown>)) {
      res[k] = replaceLegacyYears(v)
    }
    return res as T
  }
  return val
}

function settingsRef(docId: string) {
  return doc(db, SETTINGS_COLLECTION, docId)
}

// ---------------------------------------------------------------------------
// Contact — read (one-shot) and subscribe
// ---------------------------------------------------------------------------

export async function getContactSettings(): Promise<ContactSettings> {
  const snap = await getDoc(settingsRef(DOC_CONTACT))
  if (!snap.exists()) return replaceLegacyYears({ ...DEFAULT_CONTACT })
  return replaceLegacyYears({ ...DEFAULT_CONTACT, ...(snap.data() as Partial<ContactSettings>) })
}

export function subscribeToContact(
  callback: (data: ContactSettings) => void,
  onError?: (err: Error) => void,
): Unsubscribe {
  return onSnapshot(
    settingsRef(DOC_CONTACT),
    (snap) => {
      const raw: ContactSettings = snap.exists()
        ? { ...DEFAULT_CONTACT, ...(snap.data() as Partial<ContactSettings>) }
        : { ...DEFAULT_CONTACT }
      callback(replaceLegacyYears(raw))
    },
    (err) => { console.error('[settings/contact]', err); onError?.(err) },
  )
}

// ---------------------------------------------------------------------------
// Hero — read and subscribe
// ---------------------------------------------------------------------------

export async function getHeroSettings(): Promise<HeroSettings> {
  const snap = await getDoc(settingsRef(DOC_HERO))
  if (!snap.exists()) return replaceLegacyYears({ ...DEFAULT_HERO })
  return replaceLegacyYears({ ...DEFAULT_HERO, ...(snap.data() as Partial<HeroSettings>) })
}

export function subscribeToHero(
  callback: (data: HeroSettings) => void,
  onError?: (err: Error) => void,
): Unsubscribe {
  return onSnapshot(
    settingsRef(DOC_HERO),
    (snap) => {
      const raw: HeroSettings = snap.exists()
        ? { ...DEFAULT_HERO, ...(snap.data() as Partial<HeroSettings>) }
        : { ...DEFAULT_HERO }
      callback(replaceLegacyYears(raw))
    },
    (err) => { console.error('[settings/hero]', err); onError?.(err) },
  )
}

// ---------------------------------------------------------------------------
// About — read and subscribe
// ---------------------------------------------------------------------------

export async function getAboutSettings(): Promise<AboutSettings> {
  const snap = await getDoc(settingsRef(DOC_ABOUT))
  if (!snap.exists()) return replaceLegacyYears({ ...DEFAULT_ABOUT })
  return replaceLegacyYears({ ...DEFAULT_ABOUT, ...(snap.data() as Partial<AboutSettings>) })
}

export function subscribeToAbout(
  callback: (data: AboutSettings) => void,
  onError?: (err: Error) => void,
): Unsubscribe {
  return onSnapshot(
    settingsRef(DOC_ABOUT),
    (snap) => {
      const raw: AboutSettings = snap.exists()
        ? { ...DEFAULT_ABOUT, ...(snap.data() as Partial<AboutSettings>) }
        : { ...DEFAULT_ABOUT }
      callback(replaceLegacyYears(raw))
    },
    (err) => { console.error('[settings/about]', err); onError?.(err) },
  )
}

// ---------------------------------------------------------------------------
// Admin save (merge write — never overwrites fields not included in patch)
// ---------------------------------------------------------------------------

export async function saveContactSettings(patch: ContactPatch): Promise<void> {
  const sanitised = replaceLegacyYears(patch)
  await setDoc(
    settingsRef(DOC_CONTACT),
    { ...sanitised, updatedAt: serverTimestamp() },
    { merge: true },
  )
}

export async function saveHeroSettings(patch: HeroPatch): Promise<void> {
  const sanitised = replaceLegacyYears(patch)
  await setDoc(
    settingsRef(DOC_HERO),
    { ...sanitised, updatedAt: serverTimestamp() },
    { merge: true },
  )
}

export async function saveAboutSettings(patch: AboutPatch): Promise<void> {
  const sanitised = replaceLegacyYears(patch)
  await setDoc(
    settingsRef(DOC_ABOUT),
    { ...sanitised, updatedAt: serverTimestamp() },
    { merge: true },
  )
}
