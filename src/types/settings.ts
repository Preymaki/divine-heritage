/**
 * Settings Types
 *
 * Shared TypeScript interfaces for the site-wide Settings CMS feature.
 * Three Firestore singleton documents under the `settings` collection:
 *
 *   settings/contact  ← phone, email, address, hours, socials, ofsted, tagline
 *   settings/hero     ← heading, eyebrow, subtitle, bg image URL, CTA labels
 *   settings/about    ← story text, bio text, images, values, highlights
 *
 * Each document falls back to the hardcoded SITE constants if the Firestore
 * document doesn't exist yet — so the public site always looks correct even
 * before the admin configures anything.
 */

import type { Timestamp } from 'firebase/firestore'

// ---------------------------------------------------------------------------
// Contact settings — settings/contact
// ---------------------------------------------------------------------------

export interface ContactSettings {
  phone:   string
  email:   string
  address: string
  tagline: string
  ofsted:  string
  hours: {
    weekdays: string   // e.g. "Monday – Friday, 7:30 am – 6:00 pm"
    notes:    string   // e.g. "School holiday care available on request"
  }
  social: {
    facebook:  string
    instagram: string
  }
  updatedAt: Timestamp | null
}

// ---------------------------------------------------------------------------
// Hero settings — settings/hero
// ---------------------------------------------------------------------------

export interface HeroSettings {
  eyebrow:      string   // "London-Based Childminding"
  heading:      string   // "Where Every Child Thrives, Grows, and Belongs"
  accentWord:   string   // "Thrives" (the highlighted word within the heading)
  subtitle:     string   // paragraph below the heading
  bgImageUrl:   string   // URL to the hero background image
  ctaPrimary:   string   // "Book a Visit"
  ctaSecondary: string   // "Learn More"
  updatedAt: Timestamp | null
}

// ---------------------------------------------------------------------------
// About settings — settings/about
// ---------------------------------------------------------------------------

export interface AboutSettings {
  // Hero image used on the About page and the About Preview section
  aboutImageUrl: string

  // About Preview (home page teaser)
  previewTitle:    string
  previewSubtitle: string
  highlights: Array<{
    title: string
    description: string
  }>

  // Full About page — story section
  storyParagraphs: string[]   // array of paragraphs (rendered as <p> tags)
  missionQuote:    string     // blockquote text

  // Values section (4 cards)
  values: Array<{
    title:       string
    description: string
  }>

  // Meet Your Childminder section
  bioName:        string
  bioParagraphs:  string[]   // intro paragraphs
  bioQuote:       string     // blockquote

  updatedAt: Timestamp | null
}

// ---------------------------------------------------------------------------
// Union for admin update payloads (Partial of each type, minus updatedAt)
// ---------------------------------------------------------------------------

export type ContactPatch = Partial<Omit<ContactSettings, 'updatedAt'>>
export type HeroPatch    = Partial<Omit<HeroSettings,    'updatedAt'>>
export type AboutPatch   = Partial<Omit<AboutSettings,   'updatedAt'>>

// ---------------------------------------------------------------------------
// Save state (drives admin form UI)
// ---------------------------------------------------------------------------

export type SavePhase = 'idle' | 'saving' | 'success' | 'error'

export interface SaveState {
  phase: SavePhase
  error: string | null
}
