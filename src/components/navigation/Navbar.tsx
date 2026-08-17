import { useState, useEffect } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X } from 'lucide-react'
import { NAV_LINKS, SITE, CTA } from '@constants/site'
import { useContactSettings } from '@hooks/useContactSettings'

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const { contact } = useContactSettings()

  // Scroll detection for frosted glass effect
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Close menu on escape key
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false)
    }
    document.addEventListener('keydown', handleEsc)
    return () => document.removeEventListener('keydown', handleEsc)
  }, [])

  // Lock body scroll when menu is open
  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [isOpen])

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    `relative text-sm font-semibold transition-colors duration-200 py-1 ${
      isActive
        ? isScrolled
          ? 'text-[var(--color-primary-600)]'
          : 'text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]'
        : isScrolled
          ? 'text-slate-700 hover:text-[var(--color-primary-600)]'
          : 'text-white/95 hover:text-white drop-shadow-[0_1px_3px_rgba(0,0,0,0.7)]'
    }`

  return (
    <>
      {/* Skip to content - accessibility */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:bg-[var(--color-primary-500)] focus:text-white focus:rounded-lg focus:text-sm focus:font-medium"
      >
        Skip to main content
      </a>

      {/* Logo — fixed upper-left, independent of navbar */}
      <Link
        to="/"
        className="fixed top-3 left-4 z-50 flex items-center group"
        aria-label={`${SITE.name} Home`}
      >
        <img
          src="/logo.png"
          alt={SITE.name}
          className="h-14 md:h-16 w-auto object-contain transition-transform duration-200 group-hover:scale-105 rounded-2xl overflow-hidden"
          style={{ maxWidth: 190 }}
        />
      </Link>

      <header
        className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
          isScrolled
            ? 'bg-white/90 backdrop-blur-md shadow-[var(--shadow-soft)] border-b border-[var(--color-primary-50)]'
            : 'bg-transparent'
        }`}
        role="banner"
      >
        <div className="container-site">
          <div className="relative flex items-center h-16 md:h-20">

            {/* Desktop Nav — absolutely centred */}
            <nav
              className="hidden lg:flex absolute left-1/2 -translate-x-1/2 items-center gap-7"
              aria-label="Main navigation"
            >
              {NAV_LINKS.map((link) => (
                <NavLink key={link.href} to={link.href} end={link.href === '/'} className={navLinkClass}>
                  {({ isActive }) => (
                    <>
                      {link.label}
                      {isActive && (
                        <motion.span
                          layoutId="nav-underline"
                          className="absolute -bottom-0.5 left-0 right-0 h-0.5 bg-[var(--color-primary-500)] rounded-full"
                        />
                      )}
                    </>
                  )}
                </NavLink>
              ))}
            </nav>

            {/* Desktop CTA */}
            <div className="hidden lg:flex items-center gap-3 ml-auto">
              <Link
                to={CTA.primary.href}
                className="px-5 py-2.5 bg-[var(--color-primary-500)] hover:bg-[var(--color-primary-600)] text-white text-sm font-medium rounded-xl transition-all duration-200 hover:shadow-[var(--shadow-card)] hover:-translate-y-0.5"
                id="nav-cta-book-visit"
              >
                {CTA.primary.label}
              </Link>
            </div>

            {/* Mobile hamburger */}
            <button
              type="button"
              onClick={() => setIsOpen(!isOpen)}
              className={`lg:hidden ml-auto w-10 h-10 flex items-center justify-center rounded-xl transition-colors duration-200 ${
                isScrolled
                  ? 'text-[var(--color-text-primary)] hover:bg-[var(--color-muted)]'
                  : 'text-white bg-black/20 hover:bg-black/30'
              }`}
              aria-label={isOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={isOpen}
              aria-controls="mobile-menu"
            >
              {isOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm lg:hidden"
              onClick={() => setIsOpen(false)}
              aria-hidden="true"
            />

            {/* Drawer */}
            <motion.div
              key="mobile-menu"
              id="mobile-menu"
              role="dialog"
              aria-modal="true"
              aria-label="Navigation menu"
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="fixed top-0 right-0 bottom-0 z-50 w-[min(85vw,340px)] bg-white shadow-[var(--shadow-elevated)] flex flex-col lg:hidden"
            >
              {/* Mobile menu header */}
              <div className="flex items-center justify-between p-4 border-b border-[var(--color-muted)]">
                <Link
                  to="/"
                  onClick={() => setIsOpen(false)}
                  aria-label={`${SITE.name} Home`}
                >
                  <img
                    src="/logo.png"
                    alt={SITE.name}
                    className="h-11 w-auto object-contain"
                    style={{ maxWidth: 160 }}
                  />
                </Link>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="w-9 h-9 flex items-center justify-center rounded-xl text-[var(--color-text-muted)] hover:bg-[var(--color-muted)] transition-colors"
                  aria-label="Close menu"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Nav links */}
              <nav className="flex-1 px-4 py-6 space-y-1" aria-label="Mobile navigation">
                {NAV_LINKS.map((link, i) => (
                  <motion.div
                    key={link.href}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.06, duration: 0.25 }}
                  >
                    <NavLink
                      to={link.href}
                      end={link.href === '/'}
                      onClick={() => setIsOpen(false)}
                      className={({ isActive }) =>
                        `flex items-center gap-3 px-4 py-3.5 rounded-xl text-base font-medium transition-all duration-150 ${
                          isActive
                            ? 'bg-[var(--color-primary-50)] text-[var(--color-primary-600)]'
                            : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-muted)] hover:text-[var(--color-text-primary)]'
                        }`
                      }
                    >
                      {link.label}
                    </NavLink>
                  </motion.div>
                ))}
              </nav>

              {/* CTA */}
              <div className="p-5 border-t border-[var(--color-muted)]">
                <Link
                  to={CTA.primary.href}
                  onClick={() => setIsOpen(false)}
                  className="flex items-center justify-center w-full px-5 py-3.5 bg-[var(--color-primary-500)] hover:bg-[var(--color-primary-600)] text-white font-semibold rounded-xl transition-colors duration-200"
                  id="mobile-nav-cta-book-visit"
                >
                  {CTA.primary.label}
                </Link>
                <p className="text-center text-xs text-[var(--color-text-muted)] mt-3">
                  or call directly on{' '}
                  <a
                    href={`tel:${contact.phone.replace(/\s/g, '')}`}
                    className="text-[var(--color-primary-500)] font-medium hover:underline"
                  >
                    {contact.phone}
                  </a>
                </p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
