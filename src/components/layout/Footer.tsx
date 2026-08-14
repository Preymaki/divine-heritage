import { Link } from 'react-router-dom'
import { Phone, Mail, MapPin, Heart } from 'lucide-react'
import { SITE, NAV_LINKS } from '@constants/site'
import { useContactSettings } from '@hooks/useContactSettings'

const FOOTER_SERVICES = [
  { label: 'Full-Day Childminding', href: '/services' },
  { label: 'Early Years Care', href: '/services' },
  { label: 'After School Care', href: '/services' },
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
            <Link to="/" className="group w-fit block" aria-label="Divine Heritage — Home">
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
            <p className="mt-5 text-white/90 text-sm leading-relaxed max-w-sm">
              {SITE.description}
            </p>

            {/* Ofsted badge */}
            <div className="mt-5 inline-flex items-center gap-2 px-3.5 py-2 bg-white/10 rounded-xl border border-white/15">
              <div className="w-2 h-2 rounded-full bg-[var(--color-accent-400)] shrink-0" aria-hidden="true" />
              <span className="text-white text-xs font-medium">
                Ofsted Registered Childminder
              </span>
            </div>


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
                    className="text-white/90 hover:text-white text-sm transition-colors duration-150 hover:translate-x-0.5 inline-block"
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
                    className="text-white/90 hover:text-white text-sm transition-colors duration-150 hover:translate-x-0.5 inline-block"
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
                  className="flex items-start gap-3 text-white/90 hover:text-white text-sm transition-colors duration-150 group"
                >
                  <Phone size={16} className="mt-0.5 shrink-0 group-hover:text-[var(--color-accent-400)]" />
                  {contact.phone}
                </a>
              </li>
              <li>
                <a
                  href={`mailto:${contact.email}`}
                  className="flex items-start gap-3 text-white/90 hover:text-white text-sm transition-colors duration-150 group"
                >
                  <Mail size={16} className="mt-0.5 shrink-0 group-hover:text-[var(--color-accent-400)]" />
                  {contact.email}
                </a>
              </li>
              <li className="flex items-start gap-3 text-white/90 text-sm">
                <MapPin size={16} className="mt-0.5 shrink-0 text-[var(--color-accent-400)]" />
                {contact.address}
              </li>
            </ul>

            <div className="mt-7 p-4 bg-white/8 rounded-xl border border-white/12">
              <p className="text-white font-medium text-sm mb-1">Business Hours</p>
              <p className="text-white/85 text-xs leading-relaxed">
                {contact.hours.weekdays}
              </p>
              {contact.hours.notes && (
                <p className="text-white/70 text-xs mt-1.5">{contact.hours.notes}</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/10">
        <div className="container-site py-5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-white/70 text-xs text-center sm:text-left">
            © {year} {SITE.name}. All rights reserved.
          </p>
          <p className="text-white/60 text-xs flex items-center gap-1">
            Made with <Heart size={11} className="text-[var(--color-accent-400)]" aria-hidden /> in London
          </p>
        </div>
      </div>
    </footer>
  )
}
