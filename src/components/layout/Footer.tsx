import { Link } from 'react-router-dom'
import { Phone, Mail, MapPin, Heart } from 'lucide-react'
import { SITE, NAV_LINKS } from '@constants/site'
import { useContactSettings } from '@hooks/useContactSettings'

const FOOTER_SERVICES = [
  { label: 'Full Day Care', href: '/services#full-day-care' },
  { label: 'Part-Time & Flexible Hours', href: '/services#flexible-hours' },
  { label: 'After School Care', href: '/services#after-school' },
  { label: 'Holiday Care', href: '/services#holiday-care' },
]

export default function Footer() {
  const year = new Date().getFullYear()
  const { contact } = useContactSettings()

  return (
    <footer
      className="bg-[var(--color-primary-900)] text-white"
      role="contentinfo"
      aria-label="Site footer"
    >
      {/* Main footer content */}
      <div className="container-site py-14 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-8">
          {/* Brand column */}
          <div className="lg:col-span-2">
            <Link to="/" className="group w-fit block" aria-label="Divine Heritage Home">
              <div className="bg-white rounded-2xl px-4 py-3 inline-flex items-center transition-transform duration-200 group-hover:scale-[1.02] shadow-[0_2px_12px_rgba(0,0,0,0.12)]">
                <img
                  src="/logo.png"
                  alt={SITE.name}
                  className="h-16 w-auto object-contain"
                  style={{ maxWidth: 220 }}
                  loading="lazy"
                />
              </div>
            </Link>
            <p className="mt-5 text-white text-sm leading-relaxed max-w-sm">
              {contact.tagline || SITE.description}
            </p>

            {/* Ofsted badge */}
            <div className="mt-5 inline-flex items-center gap-2 px-3.5 py-2 bg-white/10 rounded-xl border border-white/15">
              <div className="w-2 h-2 rounded-full bg-[var(--color-accent-400)] shrink-0" aria-hidden="true" />
              <span className="text-white text-xs font-medium">
                {contact.ofsted ? `Ofsted Registered Childminder · ${contact.ofsted}` : 'Ofsted Registered Childminder'}
              </span>
            </div>

            {/* Social media links from Admin Settings */}
            {(Boolean(contact.social?.facebook) || Boolean(contact.social?.instagram)) && (
              <div className="mt-5 flex items-center gap-2.5">
                {contact.social?.facebook && (
                  <a
                    href={contact.social.facebook}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 flex items-center justify-center text-white transition-all duration-150 hover:-translate-y-0.5"
                    aria-label="Follow us on Facebook"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                    </svg>
                  </a>
                )}
                {contact.social?.instagram && (
                  <a
                    href={contact.social.instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 flex items-center justify-center text-white transition-all duration-150 hover:-translate-y-0.5"
                    aria-label="Follow us on Instagram"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                    </svg>
                  </a>
                )}
              </div>
            )}


          </div>

          {/* Navigation column */}
          <div>
            <h3 className="text-white font-semibold text-sm uppercase tracking-wider mb-4 font-[var(--font-family-heading)]">
              Navigation
            </h3>
            <ul className="space-y-2.5" role="list">
              {NAV_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    to={link.href}
                    className="text-white/95 hover:text-white text-sm font-medium transition-colors duration-150 hover:translate-x-0.5 inline-block"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
            <h3 className="text-white font-semibold text-sm uppercase tracking-wider mt-7 mb-4 font-[var(--font-family-heading)]">
              Services
            </h3>
            <ul className="space-y-2.5" role="list">
              {FOOTER_SERVICES.map((s) => (
                <li key={s.label}>
                  <Link
                    to={s.href}
                    className="text-white/95 hover:text-white text-sm font-medium transition-colors duration-150 hover:translate-x-0.5 inline-block"
                  >
                    {s.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact column */}
          <div>
            <h3 className="text-white font-semibold text-sm uppercase tracking-wider mb-4 font-[var(--font-family-heading)]">
              Contact
            </h3>
            <ul className="space-y-3.5" role="list">
              <li>
                <a
                  href={`tel:${contact.phone.replace(/\s/g, '')}`}
                  className="flex items-start gap-3 text-white/95 hover:text-white text-sm font-medium transition-colors duration-150 group"
                >
                  <Phone size={16} className="mt-0.5 shrink-0 group-hover:text-[var(--color-accent-400)]" />
                  {contact.phone}
                </a>
              </li>
              <li>
                <a
                  href={`mailto:${contact.email}`}
                  className="flex items-start gap-3 text-white/95 hover:text-white text-sm font-medium transition-colors duration-150 group"
                >
                  <Mail size={16} className="mt-0.5 shrink-0 group-hover:text-[var(--color-accent-400)]" />
                  {contact.email}
                </a>
              </li>
              <li className="flex items-start gap-3 text-white/95 text-sm font-medium">
                <MapPin size={16} className="mt-0.5 shrink-0 text-[var(--color-accent-400)]" />
                {contact.address}
              </li>
            </ul>

            <div className="mt-7 p-4 bg-white/8 rounded-xl border border-white/12">
              <p className="text-white font-medium text-sm mb-1">Business Hours</p>
              <p className="text-white text-xs leading-relaxed font-normal">
                {contact.hours.weekdays}
              </p>
              {contact.hours.notes && (
                <p className="text-white/90 text-xs mt-1.5 font-normal">{contact.hours.notes}</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/10">
        <div className="container-site py-5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-white/90 text-xs text-center sm:text-left font-normal">
            © {year} {SITE.name}. All rights reserved.
          </p>
          <p className="text-white/80 text-xs flex items-center gap-1 font-normal">
            Made with <Heart size={11} className="text-[var(--color-accent-400)]" aria-hidden /> in London
          </p>
        </div>
      </div>
    </footer>
  )
}
