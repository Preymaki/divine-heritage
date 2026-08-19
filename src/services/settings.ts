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
  subtitle:     'Professional, nurturing home-based childcare in London. A safe, loving environment where your child is valued, inspired, and encouraged to flourish every single day.',
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
    { title: 'Belonging',   description: 'emotional safety, inclusion, and feeling at home.' },
    { title: 'Growth',      description: 'developmental progress, learning, and confidence.' },
    { title: 'Thrive',      description: 'wellbeing, joy, and flourishing.' },
    { title: 'Partnership', description: 'strong relationships with families.' },
  ],
  storyParagraphs: [
    'Divine Heritage Childcare Service was founded in 2017 with a clear vision: to create a warm, loving home-from-home where every child is seen, valued, and inspired to reach their full potential.',
    'As an Ofsted registered childminder based in South East London, Divine Heritage offers professional care in a genuine family setting. Children thrive here through rich activities, learning opportunities, and a safe, nurturing atmosphere.',
    'The approach is rooted in the Early Years Foundation Stage (EYFS) framework, guiding everything from activity planning to observation and documentation of child growth. Beyond routine documentation, key developmental milestones and friendships formed make the environment uniquely enriching.',
    'Every family joining the setting becomes part of the Divine Heritage community. Open, honest communication, regular updates, and collaborative support guide each child\'s unique journey.',
  ],
  missionQuote: 'Creating a warm, nurturing space where every child feels safe, loved, and celebrated.',
  values: [
    {
      title: 'Love & Belonging',
      description: 'A family-centred setting where warm, secure relationships inspire confidence and a true sense of belonging.',
    },
    {
      title: 'Learning Through Play',
      description: 'Following a play-based, EYFS-aligned approach ensures curiosity is celebrated and every activity is meaningful.',
    },
    {
      title: 'Partnership',
      description: "Parental Collaboration: Hand-in-hand support, daily updates, and shared celebration of every child's milestones.",
    },
    {
      title: 'Respect & Inclusion',
      description: 'Diversity is celebrated every day, guiding children to respect, appreciate, and embrace the wonderful world around them.',
    },
  ],
  bioName:       '',
  bioParagraphs: [
    'With over a decade of dedicated early years experience, I launched Divine Heritage Childcare in 2017 to create something truly special: a vibrant, home-from-home environment where children don\u2019t just stay\u2014they thrive.',
    'My journey began at sixteen, babysitting for friends and family. That early spark grew into a lifelong calling, ultimately inspiring me to step away from my previous career and pour my heart into professional childminding full-time.',
    'When I\u2019m not planning personalised learning journeys, you\u2019ll find me:',
    '\u2022 Designing mind-stimulating activities tailored to spark natural curiosity.',
    '\u2022 Setting up sensory play stations in the garden for hands-on exploration.',
    '\u2022 Curling up on the sofa reading stories that fuel young imaginations.',
    'This is a warm, loving home, which is exactly what makes the care here so extraordinary.',
  ],
  bioQuote: 'Dedicated to providing exceptional care and investing in children\'s futures.',
  updatedAt: null,
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function replaceLegacyYears<T>(val: T): T {
  if (typeof val === 'string') {
    return val
      .replace(/\b2018\b/g, '2017')
      .replace(/,\s*,/g, ', ')
      .replace(/,\s*\./g, '.') as unknown as T
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

function sanitiseAboutSettings(raw: AboutSettings): AboutSettings {
  const data = replaceLegacyYears(raw)
  let highlights = data.highlights && data.highlights.length > 0
    ? [...data.highlights]
    : [...DEFAULT_ABOUT.highlights]

  // Remove any nutritional / meal highlights
  highlights = highlights.filter(
    (h) => !/nutriti|meal/i.test(h.title) && !/nutriti|meal/i.test(h.description)
  )

  // If highlights contain old defaults or are empty, update to DEFAULT_ABOUT.highlights
  const hasLegacyHighlights = highlights.some((h) => /child-led|safe.*stimulating/i.test(h.title))
  if (hasLegacyHighlights || highlights.length === 0) {
    highlights = DEFAULT_ABOUT.highlights
  }

  let values = data.values && data.values.length > 0
    ? [...data.values]
    : [...DEFAULT_ABOUT.values]

  values = values.map((v) => {
    if (/love.*belonging/i.test(v.title)) {
      return {
        ...v,
        title: 'Love & Belonging',
        description: 'A family-centred setting where warm, secure relationships inspire confidence and a true sense of belonging.',
      }
    }
    if (/learning.*play/i.test(v.title)) {
      return {
        ...v,
        title: 'Learning Through Play',
        description: 'Following a play-based, EYFS-aligned approach ensures curiosity is celebrated and every activity is meaningful.',
      }
    }
    if (/partnership/i.test(v.title)) {
      return {
        ...v,
        title: 'Partnership',
        description: "Parental Collaboration: Hand-in-hand support, daily updates, and shared celebration of every child's milestones.",
      }
    }
    if (/respect.*inclusion/i.test(v.title)) {
      return {
        ...v,
        title: 'Respect & Inclusion',
        description: 'Diversity is celebrated every day, guiding children to respect, appreciate, and embrace the wonderful world around them.',
      }
    }
    return v
  })

  let storyParagraphs = (data.storyParagraphs && data.storyParagraphs.length > 0
    ? data.storyParagraphs
    : DEFAULT_ABOUT.storyParagraphs
  ).map((p) =>
    p
      .replace(/\s*—\s*the first independent steps,\s*the proud smile after completing a puzzle,\s*the friendships formed\s*—\s*/gi, ', like the first independent steps, the proud smile after completing a puzzle, and the friendships formed, ')
      .replace(/\s*—\s*/g, ', ')
      .replace(/,\s*,/g, ', ')
      .replace(/,\s*\./g, '.')
  )

  let bioParagraphs = (data.bioParagraphs && data.bioParagraphs.length > 0
    ? data.bioParagraphs
    : DEFAULT_ABOUT.bioParagraphs
  ).map((p) =>
    p
      .replace(/\s*—\s*/g, ', ')
      .replace(/,\s*,/g, ', ')
      .replace(/,\s*\./g, '.')
  )

  let missionQuote = data.missionQuote
  if (!missionQuote || /Every child deserves to feel/i.test(missionQuote)) {
    missionQuote = 'Creating a warm, nurturing space where every child feels safe, loved, and celebrated.'
  }

  return {
    ...data,
    highlights,
    values,
    storyParagraphs,
    bioParagraphs,
    missionQuote,
  }
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
  if (!snap.exists()) return sanitiseAboutSettings({ ...DEFAULT_ABOUT })
  return sanitiseAboutSettings({ ...DEFAULT_ABOUT, ...(snap.data() as Partial<AboutSettings>) })
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
      callback(sanitiseAboutSettings(raw))
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
