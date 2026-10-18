/**
 * HeroSection
 *
 * Home page hero banner. All copy is managed via the Admin Dashboard
 * (Settings → Hero tab) and stored in Firestore `settings/hero`.
 *
 * Falls back to DEFAULT_HERO values instantly on first render so there
 * is never a blank/flash state — the defaults exactly match the original
 * hardcoded content.
 */

import { useReducedMotion } from 'framer-motion'
import { motion } from 'framer-motion'
import { ArrowRight, ShieldCheck, Star, Clock } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useHeroSettings } from '@hooks/useHeroSettings'
import { useSiteImages } from '@hooks/useSiteImages'

const TRUST_BADGES = [
  { icon: ShieldCheck, label: 'Ofsted Registered' },
  { icon: Star,        label: 'Outstanding Care' },
  { icon: Clock,       label: 'Flexible Hours' },
]

export default function HeroSection() {
  const prefersReducedMotion = useReducedMotion()
  const { hero } = useHeroSettings()
  const siteImages = useSiteImages()

  // Coloured words: Thrives=yellow, Grows=green, Belongs=blue
  const COLOURED_WORDS: Record<string, string> = {
    Thrives: '#facc15',   // bright sunny yellow
    thrives: '#facc15',
    Grows:   '#3dba7a',   // sage/green
    grows:   '#3dba7a',
    Belongs: '#4a8ef5',   // sky blue
    belongs: '#4a8ef5',
  }

  function renderHeading(heading: string, accentWord: string) {
    const trimmedAccent = accentWord?.trim()
    const wordStyles: Record<string, { color: string; shadow: string }> = {}

    // First add standard coloured words (Thrives=yellow, Grows=green, Belongs=blue)
    for (const [w, color] of Object.entries(COLOURED_WORDS)) {
      wordStyles[w] = { color, shadow: `0 0 18px ${color}88` }
    }

    // If a custom accentWord is provided and found in heading, give it vibrant pink accent priority
    if (trimmedAccent && heading.toLowerCase().includes(trimmedAccent.toLowerCase())) {
      const escaped = trimmedAccent.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
      const match = heading.match(new RegExp(`(${escaped})`, 'i'))
      const exactWord = match ? match[1] : trimmedAccent
      wordStyles[exactWord] = {
        color: '#f054af',
        shadow: '0 0 18px rgba(240,84,175,0.85)',
      }
    }

    const matchedWords = Object.keys(wordStyles).filter((w) => heading.includes(w))
    if (matchedWords.length === 0) {
      return <>{heading}</>
    }

    // Sort by length descending so longer words match first
    matchedWords.sort((a, b) => b.length - a.length)
    const pattern = new RegExp(`(${matchedWords.map((w) => w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})`, 'g')
    const parts = heading.split(pattern)

    return (
      <>
        {parts.map((part, i) =>
          wordStyles[part] ? (
            <span
              key={i}
              style={{
                color: wordStyles[part].color,
                textShadow: wordStyles[part].shadow,
              }}
            >
              {part}
            </span>
          ) : (
            part
          )
        )}
      </>
    )
  }


  const containerVariants = prefersReducedMotion
    ? { hidden: {}, visible: {} }
    : {
        hidden: { opacity: 0 },
        visible: {
          opacity: 1,
          transition: { staggerChildren: 0.14, delayChildren: 0.2 },
        },
      }

  const itemVariants = prefersReducedMotion
    ? { hidden: {}, visible: {} }
    : {
        hidden: { opacity: 0, y: 22 },
        visible: {
          opacity: 1,
          y: 0,
          transition: { duration: 0.55, ease: 'easeOut' as const },
        },
      }

  const bgSrc = hero.bgImageUrl || siteImages.hero

  return (
    <section
      className="hero-section-height relative flex flex-col justify-center overflow-hidden"
      aria-label="Welcome to Divine Heritage Childcare Service"
    >
      {/* Background image with overlay */}
      <div className="absolute inset-0 z-0">
        <img
          src={bgSrc}
          alt=""
          aria-hidden="true"
          className="w-full h-full object-cover object-[center_40%]"
          loading="eager"
          fetchPriority="high"
          decoding="async"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[var(--color-primary-900)]/92 via-[var(--color-primary-800)]/72 to-[var(--color-primary-700)]/30" />
        <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-primary-900)]/55 via-transparent to-transparent" />
      </div>

      {/* Decorative ambient blobs */}
      <div
        className="absolute top-1/4 right-[8%] w-72 h-72 rounded-full blur-3xl pointer-events-none"
        style={{ background: 'rgba(224,40,155,0.12)' }}
        aria-hidden="true"
      />
      <div
        className="absolute bottom-1/4 left-[4%] w-56 h-56 rounded-full blur-3xl pointer-events-none"
        style={{ background: 'rgba(30,86,208,0.18)' }}
        aria-hidden="true"
      />

      {/* Content */}
      <div className="relative z-10 w-full container-site pt-24 pb-14 sm:pt-28 sm:pb-16 md:py-24 my-auto">
        <div className="max-w-2xl xl:max-w-3xl">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {/* Eyebrow pill */}
            <motion.div variants={itemVariants} className="flex items-center gap-2 mb-3.5 sm:mb-5">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 sm:px-3.5 sm:py-1.5 rounded-full bg-white/15 backdrop-blur-sm border border-white/25 shadow-xs">
                <div className="w-1.5 h-1.5 rounded-full bg-[var(--color-accent-400)] shrink-0" aria-hidden="true" />
                <span className="text-white text-[11px] sm:text-xs font-semibold tracking-wide drop-shadow-[0_1px_2px_rgba(0,0,0,0.6)]">
                  {hero.eyebrow}
                </span>
              </div>
            </motion.div>

            {/* Heading */}
            <motion.h1
              variants={itemVariants}
              className="font-[var(--font-family-heading)] font-bold text-white leading-tight tracking-tight drop-shadow-[0_2px_4px_rgba(0,0,0,0.6)]"
              style={{ fontSize: 'clamp(1.85rem, 5vw, 3.75rem)' }}
            >
              {renderHeading(hero.heading, hero.accentWord)}
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              variants={itemVariants}
              className="mt-3.5 sm:mt-4 text-white text-sm sm:text-base md:text-lg leading-relaxed max-w-xl font-normal drop-shadow-[0_1px_3px_rgba(0,0,0,0.7)]"
            >
              {hero.subtitle}
            </motion.p>

            {/* CTA buttons */}
            <motion.div
              variants={itemVariants}
              className="flex flex-wrap items-center gap-2.5 sm:gap-3 mt-6 sm:mt-7"
            >
              <Link
                to="/contact"
                id="hero-cta-book-visit"
                className="inline-flex items-center justify-center gap-2 px-5 sm:px-7 py-3 sm:py-3.5 bg-[var(--color-accent-500)] hover:bg-[var(--color-accent-400)] text-white font-semibold rounded-xl text-sm sm:text-base transition-all duration-200 hover:shadow-[0_8px_28px_rgba(224,40,155,0.40)] hover:-translate-y-0.5 group focus-visible:outline-2 focus-visible:outline-white focus-visible:outline-offset-2"
              >
                {hero.ctaPrimary}
                <ArrowRight
                  size={18}
                  className="group-hover:translate-x-0.5 transition-transform duration-200"
                  aria-hidden="true"
                />
              </Link>
              <Link
                to="/about"
                id="hero-cta-learn-more"
                className="inline-flex items-center justify-center gap-2 px-5 sm:px-7 py-3 sm:py-3.5 bg-white/15 hover:bg-white/25 backdrop-blur-sm border border-white/30 text-white font-semibold rounded-xl text-sm sm:text-base transition-all duration-200 hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-white focus-visible:outline-offset-2 shadow-xs"
              >
                {hero.ctaSecondary}
              </Link>
            </motion.div>

            {/* Trust badges */}
            <motion.div
              variants={itemVariants}
              className="flex flex-wrap items-center gap-x-4 sm:gap-x-5 gap-y-2 mt-6 sm:mt-8"
              aria-label="Key trust indicators"
            >
              {TRUST_BADGES.map(({ icon: Icon, label }) => (
                <div key={label} className="flex items-center gap-1.5 sm:gap-2">
                  <div
                    className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-white/15 backdrop-blur-sm flex items-center justify-center shrink-0 border border-white/20"
                    aria-hidden="true"
                  >
                    <Icon size={14} className="text-[var(--color-accent-300)]" />
                  </div>
                  <span className="text-white font-semibold text-xs sm:text-sm drop-shadow-[0_1px_3px_rgba(0,0,0,0.7)]">{label}</span>
                </div>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Scroll cue — tablet and desktop only */}
      {!prefersReducedMotion && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.4, duration: 0.5 }}
          className="hidden md:flex absolute bottom-7 left-1/2 -translate-x-1/2 z-10 flex-col items-center gap-1.5"
          aria-hidden="true"
        >
          <span className="text-white/80 text-[10px] tracking-widest uppercase font-semibold drop-shadow-[0_1px_2px_rgba(0,0,0,0.6)]">Scroll</span>
          <motion.div
            animate={{ y: [0, 5, 0] }}
            transition={{ repeat: Infinity, duration: 1.6, ease: 'easeInOut' }}
            className="w-0.5 h-7 bg-gradient-to-b from-white/80 to-transparent rounded-full"
          />
        </motion.div>
      )}
    </section>
  )
}
