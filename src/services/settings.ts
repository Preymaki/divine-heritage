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
    weekdays: 'Monday – Friday, 7:30 am – 6:00 pm',
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
  previewSubtitle: 'Founded in 2018, Divine Heritage provides warm, professional home-based childminding for families across South East London.',
  highlights: [
    { title: 'Child-Led Learning',      description: 'Activities are inspired by each child\'s interests and developmental stage.' },
    { title: 'Family Partnership',      description: 'We work closely with parents to provide consistent, joined-up care.' },
    { title: 'Safe & Stimulating',      description: 'Our home environment is fully Ofsted registered and richly resourced.' },
    { title: 'Nutritious Meals',        description: 'Healthy, home-cooked meals and snacks prepared fresh every day.' },
  ],
  storyParagraphs: [
    'Divine Heritage Childcare Service was founded in 2018 with a clear vision: to create a warm, loving home-from-home where every child is seen, valued, and inspired to reach their full potential.',
    'As a registered childminder based in South East London, I offer professional care in a genuine family setting. Children thrive here not just because of the rich activities and learning opportunities, but because they feel safe, loved, and truly at home.',
    'My approach is rooted in the Early Years Foundation Stage (EYFS) framework, which guides everything from how I plan activities to how I observe and document each child\'s growth. But beyond the paperwork, it\'s the small moments — the first independent steps, the proud smile after completing a puzzle, the friendships formed — that make this work so meaningful.',
    'Every family that joins us becomes part of the Divine Heritage family. I believe in open, honest communication with parents, regular updates, and working together to support each child\'s unique journey.',
  ],
  missionQuote: 'Every child deserves to feel loved, safe, and celebrated — not just at home, but everywhere they spend their precious early years.',
  values: [
    { title: 'Love & Belonging',    description: 'Every child is welcomed as part of our family. We build warm, secure relationships that help children feel confident and loved.' },
    { title: 'Learning Through Play', description: 'We follow a play-based approach aligned with EYFS, where curiosity is celebrated and every activity has a purpose.' },
    { title: 'Partnership',         description: 'We work hand-in-hand with parents, sharing daily updates and celebrating milestones together as a team.' },
    { title: 'Respect & Inclusion', description: 'We celebrate diversity and teach children to respect and appreciate the wonderful world around them.' },
  ],
  bioName:       'Your Childminder',
  bioParagraphs: [
    'I have been working with children for over a decade, starting as a nursery nurse before taking the step to register as a childminder and open Divine Heritage in 2018.',
    'My passion is simple: to give every child in my care the very best start in life. I hold a Level 3 qualification in Childcare and Education, a full Paediatric First Aid certificate, and I complete regular CPD training to stay current with best practices.',
    'When I\'m not planning activities or updating learning journeys, you\'ll find me in the kitchen preparing healthy meals, setting up a messy play station in the garden, or curled up on the sofa reading stories. This is a real home — and that\'s exactly what makes it special.',
  ],
  bioQuote: 'I don\'t just look after children — I invest in their futures.',
  updatedAt: null,
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function settingsRef(docId: string) {
  return doc(db, SETTINGS_COLLECTION, docId)
}

// ---------------------------------------------------------------------------
// Contact — read (one-shot) and subscribe
// ---------------------------------------------------------------------------

export async function getContactSettings(): Promise<ContactSettings> {
  const snap = await getDoc(settingsRef(DOC_CONTACT))
  if (!snap.exists()) return { ...DEFAULT_CONTACT }
  return { ...DEFAULT_CONTACT, ...(snap.data() as Partial<ContactSettings>) }
}

export function subscribeToContact(
  callback: (data: ContactSettings) => void,
  onError?: (err: Error) => void,
): Unsubscribe {
  return onSnapshot(
    settingsRef(DOC_CONTACT),
    (snap) => {
      const data: ContactSettings = snap.exists()
        ? { ...DEFAULT_CONTACT, ...(snap.data() as Partial<ContactSettings>) }
        : { ...DEFAULT_CONTACT }
      callback(data)
    },
    (err) => { console.error('[settings/contact]', err); onError?.(err) },
  )
}

// ---------------------------------------------------------------------------
// Hero — read and subscribe
// ---------------------------------------------------------------------------

export async function getHeroSettings(): Promise<HeroSettings> {
  const snap = await getDoc(settingsRef(DOC_HERO))
  if (!snap.exists()) return { ...DEFAULT_HERO }
  return { ...DEFAULT_HERO, ...(snap.data() as Partial<HeroSettings>) }
}

export function subscribeToHero(
  callback: (data: HeroSettings) => void,
  onError?: (err: Error) => void,
): Unsubscribe {
  return onSnapshot(
    settingsRef(DOC_HERO),
    (snap) => {
      const data: HeroSettings = snap.exists()
        ? { ...DEFAULT_HERO, ...(snap.data() as Partial<HeroSettings>) }
        : { ...DEFAULT_HERO }
      callback(data)
    },
    (err) => { console.error('[settings/hero]', err); onError?.(err) },
  )
}

// ---------------------------------------------------------------------------
// About — read and subscribe
// ---------------------------------------------------------------------------

export async function getAboutSettings(): Promise<AboutSettings> {
  const snap = await getDoc(settingsRef(DOC_ABOUT))
  if (!snap.exists()) return { ...DEFAULT_ABOUT }
  return { ...DEFAULT_ABOUT, ...(snap.data() as Partial<AboutSettings>) }
}

export function subscribeToAbout(
  callback: (data: AboutSettings) => void,
  onError?: (err: Error) => void,
): Unsubscribe {
  return onSnapshot(
    settingsRef(DOC_ABOUT),
    (snap) => {
      const data: AboutSettings = snap.exists()
        ? { ...DEFAULT_ABOUT, ...(snap.data() as Partial<AboutSettings>) }
        : { ...DEFAULT_ABOUT }
      callback(data)
    },
    (err) => { console.error('[settings/about]', err); onError?.(err) },
  )
}

// ---------------------------------------------------------------------------
// Admin save (merge write — never overwrites fields not included in patch)
// ---------------------------------------------------------------------------

export async function saveContactSettings(patch: ContactPatch): Promise<void> {
  await setDoc(
    settingsRef(DOC_CONTACT),
    { ...patch, updatedAt: serverTimestamp() },
    { merge: true },
  )
}

export async function saveHeroSettings(patch: HeroPatch): Promise<void> {
  await setDoc(
    settingsRef(DOC_HERO),
    { ...patch, updatedAt: serverTimestamp() },
    { merge: true },
  )
}

export async function saveAboutSettings(patch: AboutPatch): Promise<void> {
  await setDoc(
    settingsRef(DOC_ABOUT),
    { ...patch, updatedAt: serverTimestamp() },
    { merge: true },
  )
}
