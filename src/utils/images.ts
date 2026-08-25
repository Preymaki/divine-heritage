/**
 * Centralised image & video URL map — Divine Heritage Childcare Service.
 *
 * All photographs and videos are original client-supplied assets.
 * Every image used with parental/carer written consent.
 *
 * Naming convention: <context>-<subject>.<ext>
 */

// ─── IMAGES ─────────────────────────────────────────────────────────────────

export const IMAGES = {
  // ── Hero ────────────────────────────────────────────────────────────────
  // Two smiling children facing camera on swings — maximum joy, best outdoor shot
  hero: '/images/outdoor-spinning-ride.jpeg',

  // ── About / Setting Overview & Childminder ─────────────────────────────
  // Setting overview photo on the /about page (children playing on play mat)
  aboutSettingOverview: '/images/about-setting-overview.jpeg',
  // Childminder sitting on floor with four children doing sensory/veg play
  aboutChildminder: '/images/about-childminder-group.jpeg',
  meetChildminder:  '/images/about-childminder-group.jpeg',

  // ── CTA Section background ─────────────────────────────────────────────
  // Library outing — colourful bubbles session, warm and joyful
  ctaBg: '/images/hero-library-bubbles.jpeg',

  // ── Services ────────────────────────────────────────────────────────────
  serviceChildminding:  '/images/service-full-day-care-sensory.jpeg',      // hands-on sensory tray play
  serviceEarlyYears:    '/images/reading-book.jpeg',                        // child reading independently
  serviceAfterSchool:   '/images/service-after-school-parachute.jpeg',      // school-age group parachute play
  serviceFlexible:      '/images/arts-painting-easel.jpeg',                 // creative and flexible play
  serviceArts:          '/images/arts-painting-easel.jpeg',                 // painting at easel
  serviceOutdoor:       '/images/outdoor-nature-tree.jpeg',                 // nature exploration

  // ── Gallery preview carousel (6 images, curated for impact) ─────────────
  gallery1: '/images/outdoor-spinning-ride.jpeg',  // two smiling children on swings — outing
  gallery2: '/images/arts-painting-easel.jpeg',    // arts & crafts
  gallery3: '/images/reading-book.jpeg',           // reading / literacy
  gallery4: '/images/about-childminder-group.jpeg',// childminder nurturing
  gallery5: '/images/outdoor-nature-tree.jpeg',    // outdoor exploration
  gallery6: '/images/outing-library-bubbles-1.jpeg',// library outing

  // ── Full gallery — all 19 client images, themed ─────────────────────────

  // Outings & adventures
  galleryOutings1: '/images/outdoor-spinning-ride.jpeg',
  galleryOutings2: '/images/outdoor-nature-tree.jpeg',
  galleryOutings3: '/images/hero-swings.jpeg',
  galleryOutings4: '/images/outdoor-rope-climb.jpeg',
  galleryOutings5: '/images/outdoor-rocking-horse.jpeg',
  galleryOutings6: '/images/outing-softplay-blocks.jpeg',

  // Library sessions
  galleryLibrary1: '/images/outing-library-bubbles-1.jpeg',
  galleryLibrary2: '/images/hero-library-bubbles.jpeg',
  galleryLibrary3: '/images/outing-library-tumble.jpeg',

  // Indoor play & home environment
  galleryIndoor1: '/images/indoor-train-track.jpeg',
  galleryIndoor2: '/images/indoor-kitchen-play.jpeg',
  galleryIndoor3: '/images/indoor-animal-figures.jpeg',
  galleryIndoor4: '/images/indoor-baby-tummy-time.jpeg',
  galleryIndoor5: '/images/gallery-kitchen-hallway.jpeg',
  galleryIndoor6: '/images/gallery-animal-play.jpeg',

  // Learning & development
  galleryLearning1: '/images/reading-book.jpeg',
  galleryLearning2: '/images/arts-painting-easel.jpeg',
  galleryLearning3: '/images/about-childminder-group.jpeg',
} as const

// ─── VIDEOS ─────────────────────────────────────────────────────────────────

export const VIDEOS = {
  // Library bubble play session — clip 1 (use as homepage promo loop)
  libraryClip1: '/videos/library-bubbles-clip1.mp4',
  // Library bubble play session — clip 2 (use in gallery lightbox)
  libraryClip2: '/videos/library-bubbles-clip2.mp4',
} as const

export type ImageKey = keyof typeof IMAGES
export type VideoKey = keyof typeof VIDEOS
