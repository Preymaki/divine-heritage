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

  // Coloured words: Thrives=pink, Grows=green, Belongs=blue
  const COLOURED_WORDS: Record<string, string> = {
    Thrives: '#e0289b',   // accent pink
    Grows:   '#3dba7a',   // sage/green
    Belongs: '#4a8ef5',   // sky blue
  }

  function renderHeading(heading: string, accentWord: string) {
    // Check if any of the special coloured words exist in the heading
    const hasColouredWords = Object.keys(COLOURED_WORDS).some((w) =>
      heading.includes(w)
    )

    if (hasColouredWords) {
      // Split by all coloured words, preserving them
      const pattern = new RegExp(`(${Object.keys(COLOURED_WORDS).join('|')})`, 'g')
      const parts = heading.split(pattern)
      return (
        <>
          {parts.map((part, i) =>
            COLOURED_WORDS[part] ? (
              <span
                key={i}
                style={{
                  color: COLOURED_WORDS[part],
                  textShadow: `0 0 18px ${COLOURED_WORDS[part]}88`,
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

    // Fallback: single accentWord highlight (original behaviour)
    if (!accentWord || !heading.includes(accentWord)) {
      return <>{heading}</>
    }
    const [before, ...rest] = heading.split(accentWord)
    const after = rest.join(accentWord)
    return (
      <>
        {before}
        <span className="text-[var(--color-accent-400)] drop-shadow-[0_0_12px_rgba(224,40,155,0.5)]">
          {accentWord}
        </span>
        {after}
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
      className="relative flex items-center justify-center overflow-hidden"
      style={{ minHeight: 'min(80vh, 760px)', maxHeight: '860px', height: '78vh' }}
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
      <div className="relative z-10 w-full container-site py-20 md:py-24">
        <div className="max-w-2xl xl:max-w-3xl">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {/* Eyebrow pill */}
            <motion.div variants={itemVariants} className="flex items-center gap-2.5 mb-5">
              <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/15 backdrop-blur-sm border border-white/25 shadow-xs">
                <div className="w-1.5 h-1.5 rounded-full bg-[var(--color-accent-400)]" aria-hidden="true" />
                <span className="text-white text-xs font-semibold tracking-wide drop-shadow-[0_1px_2px_rgba(0,0,0,0.6)]">
                  {hero.eyebrow}
                </span>
              </div>
            </motion.div>

            {/* Heading */}
            <motion.h1
              variants={itemVariants}
              className="font-[var(--font-family-heading)] font-bold text-white leading-tight tracking-tight drop-shadow-[0_2px_4px_rgba(0,0,0,0.6)]"
              style={{ fontSize: 'clamp(2.1rem, 4.5vw, 3.75rem)' }}
            >
              {renderHeading(hero.heading, hero.accentWord)}
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              variants={itemVariants}
              className="mt-4 text-white text-base md:text-lg leading-relaxed max-w-xl font-normal drop-shadow-[0_1px_3px_rgba(0,0,0,0.7)]"
            >
              {hero.subtitle}
            </motion.p>

            {/* CTA buttons */}
            <motion.div
              variants={itemVariants}
              className="flex flex-wrap items-center gap-3 mt-7"
            >
              <Link
                to="/contact"
                id="hero-cta-book-visit"
                className="inline-flex items-center gap-2 px-7 py-3.5 bg-[var(--color-accent-500)] hover:bg-[var(--color-accent-400)] text-white font-semibold rounded-xl text-base transition-all duration-200 hover:shadow-[0_8px_28px_rgba(224,40,155,0.40)] hover:-translate-y-0.5 group focus-visible:outline-2 focus-visible:outline-white focus-visible:outline-offset-2"
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
                className="inline-flex items-center gap-2 px-7 py-3.5 bg-white/15 hover:bg-white/25 backdrop-blur-sm border border-white/30 text-white font-semibold rounded-xl text-base transition-all duration-200 hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-white focus-visible:outline-offset-2 shadow-xs"
              >
                {hero.ctaSecondary}
              </Link>
            </motion.div>

            {/* Trust badges */}
            <motion.div
              variants={itemVariants}
              className="flex flex-wrap items-center gap-5 mt-8"
              aria-label="Key trust indicators"
            >
              {TRUST_BADGES.map(({ icon: Icon, label }) => (
                <div key={label} className="flex items-center gap-2">
                  <div
                    className="w-7 h-7 rounded-lg bg-white/15 backdrop-blur-sm flex items-center justify-center shrink-0 border border-white/20"
                    aria-hidden="true"
                  >
                    <Icon size={14} className="text-[var(--color-accent-300)]" />
                  </div>
                  <span className="text-white font-semibold text-sm drop-shadow-[0_1px_3px_rgba(0,0,0,0.7)]">{label}</span>
                </div>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Scroll cue */}
      {!prefersReducedMotion && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.4, duration: 0.5 }}
          className="absolute bottom-7 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-1.5"
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
