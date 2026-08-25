import { useState, useEffect, useRef } from 'react'
import { ChevronDown, ChevronUp, Phone, AlertCircle, Info, ShieldCheck, Heart, BookOpen, Users, Home, Flame, Baby } from 'lucide-react'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import AnimatedSection from '@components/ui/AnimatedSection'
import CTASection from '@components/home/CTASection'

// ─── Types ───────────────────────────────────────────────────────────────────

interface NavGroup {
  id: string
  label: string
  icon: React.ComponentType<{ size?: number; className?: string }>
  items: { id: string; label: string }[]
}

// ─── Navigation structure ────────────────────────────────────────────────────

const NAV_GROUPS: NavGroup[] = [
  {
    id: 'about',
    label: 'About Our Setting',
    icon: BookOpen,
    items: [
      { id: 'welcome', label: 'Welcome' },
      { id: 'ethos', label: 'Ethos & Aims' },
      { id: 'areas-of-learning', label: 'Areas of Learning' },
      { id: 'assessment', label: 'Assessment' },
      { id: 'observation', label: 'Observation Policy' },
      { id: 'learning-journey', label: 'Learning Journey' },
    ],
  },
  {
    id: 'health',
    label: 'Health, Safety & Wellbeing',
    icon: Heart,
    items: [
      { id: 'accident-procedures', label: 'Accident Procedures' },
      { id: 'sick-medication', label: 'Sick & Medication Policy' },
      { id: 'home-environment', label: 'Health & Safety — Home' },
      { id: 'emergency-fire', label: 'Emergency & Fire Evacuation' },
      { id: 'smoking', label: 'Smoking Policy' },
      { id: 'alcohol-drugs', label: 'Alcohol & Drugs Policy' },
    ],
  },
  {
    id: 'equality',
    label: 'Equality, Inclusion & Behaviour',
    icon: Users,
    items: [
      { id: 'equal-opportunity', label: 'Equal Opportunity Policy' },
      { id: 'settling-in', label: 'Settling-In Policy' },
      { id: 'behaviour', label: 'Behaviour Management' },
    ],
  },
  {
    id: 'attendance',
    label: 'Attendance & Arrangements',
    icon: Home,
    items: [
      { id: 'holidays', label: 'Holidays' },
      { id: 'attendance', label: 'Attendance Policy' },
      { id: 'emergencies', label: 'Emergencies / Backup Childminder' },
      { id: 'not-collected', label: 'Procedure if Not Collected' },
    ],
  },
  {
    id: 'safeguarding',
    label: 'Safeguarding & Security',
    icon: ShieldCheck,
    items: [
      { id: 'prevent-duty', label: 'Prevent Duty' },
      { id: 'visitors', label: 'Visitors Policy' },
      { id: 'confidentiality', label: 'Confidentiality' },
      { id: 'mobile-phones', label: 'Mobile Phones & Cameras' },
      { id: 'lost-missing', label: 'Lost / Missing Child' },
      { id: 'safeguarding-policy', label: 'Safeguarding Child Policies' },
    ],
  },
  {
    id: 'complaints',
    label: 'Complaints & Contacts',
    icon: AlertCircle,
    items: [
      { id: 'complaints', label: 'Complaints Policy' },
      { id: 'useful-numbers', label: 'Useful Telephone Numbers' },
    ],
  },
  {
    id: 'risk',
    label: 'Risk Assessment',
    icon: Flame,
    items: [
      { id: 'risk-premises', label: 'Risk Assessment — Premises' },
      { id: 'risk-outing', label: 'Risk Assessment — Outing' },
    ],
  },
]

// ─── Reusable sub-components ─────────────────────────────────────────────────

function PolicySection({
  id,
  title,
  eyebrow,
  children,
}: {
  id: string
  title: string
  eyebrow?: string
  children: React.ReactNode
}) {
  return (
    <section
      id={id}
      className="scroll-mt-36 md:scroll-mt-40 lg:scroll-mt-28 py-10 md:py-14 border-b border-[var(--color-muted)] last:border-b-0"
    >
      {eyebrow && (
        <p className="text-xs font-semibold uppercase tracking-[0.15em] text-[var(--color-primary-500)] mb-2 font-[var(--font-family-heading)]">
          {eyebrow}
        </p>
      )}
      <h2 className="font-[var(--font-family-heading)] font-bold text-2xl md:text-3xl text-[var(--color-text-primary)] mb-6 leading-tight">
        {title}
      </h2>
      {children}
    </section>
  )
}

function PolicySubsection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mt-7 first:mt-0">
      <h3 className="font-[var(--font-family-heading)] font-semibold text-lg text-[var(--color-text-primary)] mb-3 pb-1.5 border-b border-[var(--color-primary-100)]">
        {title}
      </h3>
      {children}
    </div>
  )
}

function PolicyCallout({
  type = 'info',
  title,
  children,
}: {
  type?: 'info' | 'warning' | 'important' | 'safeguard'
  title?: string
  children: React.ReactNode
}) {
  const styles = {
    info: {
      wrapper: 'bg-[var(--color-primary-900)] border-l-4 border-[var(--color-primary-400)] callout-safeguard',
      icon: <Info size={16} className="text-[var(--color-primary-400)] shrink-0 mt-0.5" aria-hidden />,
      titleColor: 'text-[#ffffff] callout-title',
      textColor: '',
      textStyle: { color: 'rgba(255, 255, 255, 0.9)' } as React.CSSProperties,
    },
    warning: {
      wrapper: 'bg-[var(--color-primary-900)] border-l-4 border-amber-400 callout-safeguard',
      icon: <AlertCircle size={16} className="text-amber-400 shrink-0 mt-0.5" aria-hidden />,
      titleColor: 'text-[#ffffff] callout-title',
      textColor: '',
      textStyle: { color: 'rgba(255, 255, 255, 0.9)' } as React.CSSProperties,
    },
    important: {
      wrapper: 'bg-[var(--color-primary-900)] border-l-4 border-[var(--color-accent-400)] callout-safeguard',
      icon: <AlertCircle size={16} className="text-[var(--color-accent-400)] shrink-0 mt-0.5" aria-hidden />,
      titleColor: 'text-[#ffffff] callout-title',
      textColor: '',
      textStyle: { color: 'rgba(255, 255, 255, 0.9)' } as React.CSSProperties,
    },
    safeguard: {
      wrapper: 'bg-[var(--color-primary-900)] border-l-4 border-[var(--color-accent-400)] callout-safeguard',
      icon: <ShieldCheck size={16} className="text-[var(--color-accent-400)] shrink-0 mt-0.5" aria-hidden />,
      titleColor: 'text-[#ffffff] callout-title',
      textColor: '',
      textStyle: { color: 'rgba(255, 255, 255, 0.9)' } as React.CSSProperties,
    },
  }

  const s = styles[type]

  return (
    <div className={`rounded-[var(--radius-md)] p-4 md:p-5 my-5 ${s.wrapper}`} role="note">
      <div className="flex items-start gap-3">
        {s.icon}
        <div className="min-w-0">
          {title && (
            <p className={`font-semibold text-sm font-[var(--font-family-heading)] mb-1 ${s.titleColor}`}>{title}</p>
          )}
          <div className={`text-sm leading-relaxed ${s.textColor}`} style={s.textStyle}>{children}</div>
        </div>
      </div>
    </div>
  )
}

function PolicyList({
  items,
  ordered = false,
  className = '',
}: {
  items: React.ReactNode[]
  ordered?: boolean
  className?: string
}) {
  const Tag = ordered ? 'ol' : 'ul'
  return (
    <Tag
      className={`space-y-2.5 text-[var(--color-text-secondary)] text-sm md:text-base leading-relaxed ${
        ordered ? 'list-decimal list-inside' : 'list-disc list-inside'
      } ${className}`}
    >
      {items.map((item, i) => (
        <li key={i} className="pl-1">
          {item}
        </li>
      ))}
    </Tag>
  )
}

function ContactCard({
  name,
  lines,
  phones,
}: {
  name: string
  lines?: string[]
  phones: { label?: string; number: string }[]
}) {
  return (
    <div className="bg-white border border-[var(--color-muted)] rounded-[var(--radius-lg)] p-5 shadow-[var(--shadow-soft)]">
      <p className="font-[var(--font-family-heading)] font-semibold text-sm text-[var(--color-text-primary)] mb-3 leading-snug">
        {name}
      </p>
      {lines?.map((l, i) => (
        <p key={i} className="text-xs text-[var(--color-text-muted)] mb-0.5">
          {l}
        </p>
      ))}
      <div className={`space-y-1.5 ${lines?.length ? 'mt-3' : ''}`}>
        {phones.map(({ label, number }) => (
          <div key={number} className="flex items-center gap-2">
            {label && (
              <span className="text-xs text-[var(--color-text-muted)] min-w-[72px] shrink-0">{label}</span>
            )}
            <a
              href={`tel:${number.replace(/\s/g, '')}`}
              className="text-sm font-semibold text-[var(--color-primary-600)] hover:text-[var(--color-primary-700)] hover:underline transition-colors flex items-center gap-1.5"
            >
              <Phone size={12} className="shrink-0" aria-hidden />
              {number}
            </a>
          </div>
        ))}
      </div>
    </div>
  )
}

function ChecklistItem({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-3 py-2.5 border-b border-[var(--color-muted)] last:border-b-0 text-sm text-[var(--color-text-secondary)] leading-relaxed">
      <span
        className="mt-0.5 w-5 h-5 rounded-full bg-[var(--color-primary-50)] border border-[var(--color-primary-200)] flex items-center justify-center shrink-0"
        aria-hidden="true"
      >
        <span className="w-2 h-2 rounded-full bg-[var(--color-primary-500)]" />
      </span>
      {children}
    </li>
  )
}

// ─── Mobile nav dropdown ─────────────────────────────────────────────────────

function MobileNav({
  activeSection,
  onNavigate,
}: {
  activeSection: string
  onNavigate: (id: string) => void
}) {
  const [open, setOpen] = useState(false)
  const prefersReduced = useReducedMotion()
  const allItems = NAV_GROUPS.flatMap((g) => g.items)
  const current = allItems.find((i) => i.id === activeSection)

  return (
    <div className="lg:hidden sticky top-16 md:top-20 z-30 bg-white/95 backdrop-blur-md border-b border-[var(--color-muted)] shadow-[var(--shadow-soft)] -mx-5 px-5 py-3 md:-mx-8 md:px-8 mb-6 relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between gap-3 py-2.5 px-4 bg-[var(--color-primary-50)] border border-[var(--color-primary-200)] rounded-[var(--radius-md)] text-left shadow-xs transition-colors hover:bg-[var(--color-primary-100)]"
        aria-expanded={open}
        aria-controls="mobile-policy-nav"
      >
        <span className="text-sm font-semibold text-[var(--color-primary-700)] truncate">
          {current?.label ?? 'Jump to section…'}
        </span>
        {open ? (
          <ChevronUp size={16} className="text-[var(--color-primary-500)] shrink-0" aria-hidden />
        ) : (
          <ChevronDown size={16} className="text-[var(--color-primary-500)] shrink-0" aria-hidden />
        )}
      </button>

      <AnimatePresence>
        {open && (
          <>
            {/* Backdrop to close on tap outside */}
            <div
              className="fixed inset-0 z-40 bg-black/20 backdrop-blur-[1px]"
              onClick={() => setOpen(false)}
              aria-hidden="true"
            />

            {/* Dropdown Menu - absolute overlay so it doesn't shift document flow */}
            <motion.div
              id="mobile-policy-nav"
              key="mobile-nav"
              initial={prefersReduced ? { opacity: 1, y: 0 } : { opacity: 0, y: -6, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={prefersReduced ? { opacity: 0, y: 0 } : { opacity: 0, y: -6, scale: 0.98 }}
              transition={{ duration: 0.18, ease: [0.4, 0, 0.2, 1] }}
              className="absolute left-5 right-5 md:left-8 md:right-8 top-full mt-1.5 z-50 overflow-hidden rounded-[var(--radius-lg)] border border-[var(--color-muted)] bg-white shadow-[var(--shadow-elevated)]"
            >
              <nav aria-label="Policy sections" className="max-h-[60vh] overflow-y-auto divide-y divide-[var(--color-muted)] p-1.5">
                {NAV_GROUPS.map((group) => (
                  <div key={group.id} className="py-1 first:pt-0 last:pb-0">
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-[var(--color-primary-500)] px-3.5 pt-2 pb-1 font-[var(--font-family-heading)]">
                      {group.label}
                    </p>
                    <div className="space-y-0.5">
                      {group.items.map((item) => (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => {
                            setOpen(false)
                            onNavigate(item.id)
                          }}
                          className={`w-full text-left px-3.5 py-2 rounded-md text-sm transition-colors duration-100 flex items-center justify-between ${
                            activeSection === item.id
                              ? 'bg-[var(--color-primary-50)] text-[var(--color-primary-600)] font-semibold'
                              : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-muted)] hover:text-[var(--color-text-primary)]'
                          }`}
                        >
                          <span>{item.label}</span>
                          {activeSection === item.id && (
                            <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-primary-500)] shrink-0" aria-hidden />
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </nav>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}

// ─── Desktop sticky sidebar ──────────────────────────────────────────────────

function DesktopNav({
  activeSection,
  onNavigate,
}: {
  activeSection: string
  onNavigate: (id: string) => void
}) {
  const [expandedGroup, setExpandedGroup] = useState<string | null>('about')
  const prefersReduced = useReducedMotion()

  useEffect(() => {
    for (const group of NAV_GROUPS) {
      if (group.items.some((item) => item.id === activeSection)) {
        setExpandedGroup(group.id)
        break
      }
    }
  }, [activeSection])

  return (
    <nav
      aria-label="Policy sections navigation"
      className="hidden lg:block sticky top-24 w-64 shrink-0 max-h-[calc(100vh-8rem)] overflow-y-auto"
    >
      <div className="bg-white border border-[var(--color-muted)] rounded-[var(--radius-xl)] shadow-[var(--shadow-soft)] overflow-hidden">
        <div className="px-4 pt-4 pb-3 border-b border-[var(--color-muted)]">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--color-text-muted)] font-[var(--font-family-heading)]">
            On this page
          </p>
        </div>
        {NAV_GROUPS.map((group) => {
          const Icon = group.icon
          const isExpanded = expandedGroup === group.id

          return (
            <div key={group.id} className="border-b border-[var(--color-muted)] last:border-b-0">
              <button
                type="button"
                onClick={() => setExpandedGroup(isExpanded ? null : group.id)}
                className="w-full flex items-center gap-2.5 px-4 py-3 text-left hover:bg-[var(--color-muted)] transition-colors duration-150 group"
                aria-expanded={isExpanded}
              >
                <Icon
                  size={14}
                  className={`shrink-0 transition-colors ${isExpanded ? 'text-[var(--color-primary-500)]' : 'text-[var(--color-text-muted)] group-hover:text-[var(--color-primary-400)]'}`}
                />
                <span
                  className={`text-xs font-semibold flex-1 leading-snug font-[var(--font-family-heading)] transition-colors ${
                    isExpanded ? 'text-[var(--color-primary-600)]' : 'text-[var(--color-text-secondary)]'
                  }`}
                >
                  {group.label}
                </span>
                <ChevronDown
                  size={12}
                  className={`shrink-0 text-[var(--color-text-muted)] transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
                  aria-hidden
                />
              </button>

              <AnimatePresence initial={false}>
                {isExpanded && (
                  <motion.div
                    key="items"
                    initial={prefersReduced ? { height: 'auto', opacity: 1 } : { height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={prefersReduced ? { height: 'auto', opacity: 1 } : { height: 0, opacity: 0 }}
                    transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
                    className="overflow-hidden"
                  >
                    <div className="pb-1">
                      {group.items.map((item) => (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => onNavigate(item.id)}
                          className={`w-full text-left pl-9 pr-4 py-2 text-xs transition-all duration-100 flex items-center gap-1.5 ${
                            activeSection === item.id
                              ? 'text-[var(--color-primary-600)] font-semibold bg-[var(--color-primary-50)]'
                              : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-muted)]'
                          }`}
                        >
                          {activeSection === item.id && (
                            <span className="inline-block w-1.5 h-1.5 rounded-full bg-[var(--color-primary-500)] shrink-0" aria-hidden />
                          )}
                          {item.label}
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )
        })}
      </div>
    </nav>
  )
}

// ─── Quick contents ──────────────────────────────────────────────────────────

function QuickContents({ onNavigate }: { onNavigate: (id: string) => void }) {
  const topItems = [
    { id: 'welcome', label: 'Welcome' },
    { id: 'ethos', label: 'Ethos & Aims' },
    { id: 'areas-of-learning', label: 'Areas of Learning' },
    { id: 'assessment', label: 'Assessments' },
    { id: 'accident-procedures', label: 'Accident Procedures' },
    { id: 'holidays', label: 'Holidays' },
    { id: 'attendance', label: 'Attendance Policy' },
    { id: 'settling-in', label: 'Settling In' },
    { id: 'sick-medication', label: 'Sick / Medication Policy' },
    { id: 'safeguarding-policy', label: 'Safeguarding' },
    { id: 'complaints', label: 'Complaints Policy' },
    { id: 'risk-premises', label: 'Risk Assessments' },
  ]

  return (
    <div className="bg-white border border-slate-200/90 rounded-[var(--radius-xl)] p-5 sm:p-6 shadow-[var(--shadow-card)] mb-6">
      <div className="flex items-center justify-between gap-3 pb-3.5 mb-4 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[var(--color-primary-500)]" aria-hidden="true" />
          <h3 className="text-xs font-bold uppercase tracking-[0.12em] text-slate-800 font-[var(--font-family-heading)]">
            Contents — Quick Jump
          </h3>
        </div>
        <span className="text-[11px] font-medium text-slate-400 hidden sm:inline-block">
          Select any section to jump directly
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-x-4 gap-y-1">
        {topItems.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => onNavigate(item.id)}
            className="group flex items-center gap-2.5 py-2 px-2.5 rounded-lg text-left text-sm text-slate-600 hover:text-[var(--color-primary-600)] hover:bg-slate-50 transition-all duration-150"
          >
            <span
              className="w-1.5 h-1.5 rounded-full bg-slate-300 group-hover:bg-[var(--color-primary-500)] group-hover:scale-125 transition-all shrink-0"
              aria-hidden="true"
            />
            <span className="font-medium truncate">{item.label}</span>
          </button>
        ))}
      </div>
    </div>
  )
}

// ─── Main page component ─────────────────────────────────────────────────────

export default function Policies() {
  const [activeSection, setActiveSection] = useState('welcome')
  const mainRef = useRef<HTMLDivElement>(null)
  const isNavigatingRef = useRef(false)
  const navTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const navigateTo = (id: string) => {
    const el = document.getElementById(id)
    if (!el) return

    setActiveSection(id)

    isNavigatingRef.current = true
    if (navTimerRef.current) clearTimeout(navTimerRef.current)
    navTimerRef.current = setTimeout(() => {
      isNavigatingRef.current = false
    }, 1400)

    el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  // Set page title on mount
  useEffect(() => {
    const prev = document.title
    document.title = 'Policies & Procedures | Divine Heritage Childcare Services'
    return () => { document.title = prev }
  }, [])

  useEffect(() => {
    const allIds = NAV_GROUPS.flatMap((g) => g.items.map((i) => i.id))

    const handleScroll = () => {
      if (isNavigatingRef.current) return

      // If scrolled close to the bottom of the page, activate the last section
      const isAtBottom =
        window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 80
      if (isAtBottom && allIds.length > 0) {
        setActiveSection(allIds[allIds.length - 1])
        return
      }

      const threshold = window.innerHeight * 0.35
      let current = allIds[0]
      for (const id of allIds) {
        const el = document.getElementById(id)
        if (el && el.getBoundingClientRect().top <= threshold) {
          current = id
        }
      }
      setActiveSection(current)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll()
    return () => {
      window.removeEventListener('scroll', handleScroll)
      if (navTimerRef.current) clearTimeout(navTimerRef.current)
    }
  }, [])

  return (
    <>
      {/* ── Hero / Page Header ────────────────────────────────────────── */}
      <div className="bg-[var(--color-primary-900)] pt-32 pb-16">
        <div className="container-site">
          <AnimatedSection>
            <p className="text-[var(--color-accent-300)] text-xs font-bold uppercase tracking-[0.15em] mb-3 font-[var(--font-family-heading)] drop-shadow-[0_1px_2px_rgba(0,0,0,0.6)]">
              Parent Handbook
            </p>
            <h1 className="font-[var(--font-family-heading)] font-bold text-white text-4xl md:text-5xl leading-tight tracking-tight max-w-2xl drop-shadow-[0_2px_4px_rgba(0,0,0,0.6)]">
              Policies &amp; Procedures
            </h1>
            <p className="mt-4 text-white text-base md:text-lg leading-relaxed max-w-2xl drop-shadow-[0_1px_3px_rgba(0,0,0,0.6)] font-normal">
              This handbook provides information about my settings and what Ofsted requires.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              {[
                { icon: Baby, label: 'EYFS Aligned' },
                { icon: ShieldCheck, label: 'Ofsted Registered' },
                { icon: Heart, label: 'Safeguarding Committed' },
              ].map(({ icon: Icon, label }) => (
                <div
                  key={label}
                  className="flex items-center gap-2 px-3.5 py-2 bg-white/12 rounded-xl border border-white/20 text-sm text-white font-medium shadow-xs"
                >
                  <Icon size={14} className="text-[var(--color-accent-300)]" aria-hidden />
                  {label}
                </div>
              ))}
            </div>
          </AnimatedSection>
        </div>
      </div>

      {/* ── Body ─────────────────────────────────────────────────────── */}
      <div className="bg-[var(--color-background)]">
        <div className="container-site py-10 md:py-14">

          {/* Mobile nav */}
          <MobileNav activeSection={activeSection} onNavigate={navigateTo} />

          <div className="flex gap-10 xl:gap-14" ref={mainRef}>
            {/* Desktop sidebar */}
            <DesktopNav activeSection={activeSection} onNavigate={navigateTo} />

            {/* Main content */}
            <div className="flex-1 min-w-0">

              <AnimatedSection>
                <QuickContents onNavigate={navigateTo} />
              </AnimatedSection>

              {/* ══ 01 WELCOME ═══════════════════════════════════════════ */}
              <AnimatedSection>
                <PolicySection id="welcome" title="Welcome" eyebrow="01 — About Our Setting">
                  <p className="text-[var(--color-text-secondary)] text-base md:text-lg leading-relaxed">
                    Welcome to Divine Heritage. This handbook provides information about my settings and what Ofsted requires.
                  </p>
                </PolicySection>
              </AnimatedSection>

              {/* ══ 02 ETHOS ═════════════════════════════════════════════ */}
              <AnimatedSection>
                <PolicySection id="ethos" title="Ethos & Aims" eyebrow="02 — About Our Setting">
                  <div className="bg-[var(--color-primary-900)] rounded-[var(--radius-xl)] p-6 md:p-8 mb-8 shadow-[var(--shadow-card)]">
                    <p className="text-xs font-semibold uppercase tracking-[0.15em] text-[var(--color-accent-400)] mb-3 font-[var(--font-family-heading)]">
                      Ethos
                    </p>
                    <p className="text-white text-base md:text-lg leading-relaxed italic font-[var(--font-family-heading)]">
                      &ldquo;I believe in creating a nurturing environment where the children in my care feel happy, comfortable, and secure. I encourage them to learn through play, helping them to reach their full potential. Each child is treated as an individual with unique ideas and needs. I provide flexibility and continuity in care, allowing their routines to closely mirror those at home, which makes it easier for the children to settle in.&rdquo;
                    </p>
                  </div>

                  <h3 className="font-[var(--font-family-heading)] font-semibold text-lg text-[var(--color-text-primary)] mb-4">
                    My Aims:
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {[
                      'To encourage children to be happy and confident',
                      'To work with you (parent) to provide the best possible care for your child.',
                      'To promote a caring, safe and stimulating learning environment',
                      'To provide free-flow play in a safe environment',
                      'Building a positive relationship',
                      'To make sure children are competent and creative.',
                      'I listen and encourage children to share their views and ideas constructively.',
                      'I promote outdoor activities in my garden where children can learn and play. We also go to playgroups, parks, libraries and local farms.',
                    ].map((aim, i) => (
                      <div
                        key={i}
                        className="flex items-start gap-3 p-4 bg-white border border-[var(--color-muted)] rounded-[var(--radius-lg)] shadow-[var(--shadow-soft)]"
                      >
                        <div className="w-6 h-6 rounded-full bg-[var(--color-primary-50)] border border-[var(--color-primary-200)] flex items-center justify-center shrink-0 mt-0.5">
                          <span className="text-xs font-bold text-[var(--color-primary-600)] font-[var(--font-family-heading)]">
                            {i + 1}
                          </span>
                        </div>
                        <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed">{aim}</p>
                      </div>
                    ))}
                  </div>
                </PolicySection>
              </AnimatedSection>

              {/* ══ 03 AREAS OF LEARNING ══════════════════════════════════ */}
              <AnimatedSection>
                <PolicySection id="areas-of-learning" title="Areas of Learning" eyebrow="03 — About Our Setting">
                  <p className="text-[var(--color-text-secondary)] text-base leading-relaxed mb-4">
                    The Early Years stage of learning and development covers three areas, which your child will mostly learn through games and play.
                  </p>
                  <p className="text-[var(--color-text-secondary)] text-base leading-relaxed mb-6">
                    The 7 areas of learning and development and the educational programmes consist of 3 prime areas: communication and language, physical development, and personal, social, and emotional development. The 4 areas are literacy, mathematics, understanding the world and expressive arts &amp; design.
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
                    {/* 3 Prime Areas */}
                    <div className="bg-white border border-slate-200/90 rounded-[var(--radius-xl)] p-5 sm:p-6 shadow-[var(--shadow-card)]">
                      <div className="flex items-center justify-between gap-2 pb-3 mb-3.5 border-b border-slate-100">
                        <h3 className="font-[var(--font-family-heading)] font-bold text-base text-slate-800 flex items-center gap-2.5">
                          <span className="w-2 h-2 rounded-full bg-[var(--color-primary-500)]" aria-hidden="true" />
                          3 Prime Areas
                        </h3>
                        <span className="text-[11px] font-semibold uppercase tracking-wider text-[var(--color-primary-600)] bg-[var(--color-primary-50)] px-2 py-0.5 rounded-full border border-[var(--color-primary-100)]">
                          Core Foundation
                        </span>
                      </div>
                      <ul className="space-y-1.5">
                        {[
                          'Communication and language',
                          'Physical development',
                          'Personal, social, and emotional development',
                        ].map((area) => (
                          <li
                            key={area}
                            className="flex items-center gap-2.5 py-1 px-2 rounded-md text-sm text-slate-700 font-medium hover:bg-slate-50 transition-colors"
                          >
                            <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-primary-400)] shrink-0" aria-hidden="true" />
                            <span>{area}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* 4 Specific Areas */}
                    <div className="bg-white border border-slate-200/90 rounded-[var(--radius-xl)] p-5 sm:p-6 shadow-[var(--shadow-card)]">
                      <div className="flex items-center justify-between gap-2 pb-3 mb-3.5 border-b border-slate-100">
                        <h3 className="font-[var(--font-family-heading)] font-bold text-base text-slate-800 flex items-center gap-2.5">
                          <span className="w-2 h-2 rounded-full bg-[var(--color-accent-500)]" aria-hidden="true" />
                          4 Specific Areas
                        </h3>
                        <span className="text-[11px] font-semibold uppercase tracking-wider text-[var(--color-accent-600)] bg-[var(--color-accent-50)] px-2 py-0.5 rounded-full border border-[var(--color-accent-100)]">
                          Applied Skills
                        </span>
                      </div>
                      <ul className="space-y-1.5">
                        {[
                          'Literacy',
                          'Mathematics',
                          'Understanding the world',
                          'Expressive arts & design',
                        ].map((area) => (
                          <li
                            key={area}
                            className="flex items-center gap-2.5 py-1 px-2 rounded-md text-sm text-slate-700 font-medium hover:bg-slate-50 transition-colors"
                          >
                            <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-accent-400)] shrink-0" aria-hidden="true" />
                            <span>{area}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </PolicySection>
              </AnimatedSection>

              {/* ══ 04 ASSESSMENT ═════════════════════════════════════════ */}
              <AnimatedSection>
                <PolicySection id="assessment" title="Assessments" eyebrow="04 — About Our Setting">
                  <p className="text-[var(--color-text-secondary)] text-base leading-relaxed mb-4">
                    I do two types of assessments based on the Early Years Foundation Stage (EYFS).
                  </p>
                  <p className="text-[var(--color-text-secondary)] text-base leading-relaxed mb-6">
                    The Early Years Foundation Stage requires early years practitioners to review children’s progress and share a summary with parents at two points:
                  </p>

                  <div className="space-y-4">
                    <div className="bg-white border border-[var(--color-muted)] rounded-[var(--radius-lg)] p-5 shadow-[var(--shadow-soft)]">
                      <h3 className="font-[var(--font-family-heading)] font-semibold text-base text-[var(--color-text-primary)] mb-2 flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-[var(--color-primary-50)] text-[var(--color-primary-600)] text-xs font-bold flex items-center justify-center">1</span>
                        Ongoing Assessment
                      </h3>
                      <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed">
                        Ongoing assessments are conducted regularly during pick-up to provide feedback on what the child has learned and what can be done to support their continued learning. This type of assessment is known as a &ldquo;formative&rdquo; assessment, as it informs the next steps in the child&apos;s development in collaboration with the parent.
                      </p>
                    </div>

                    <div className="bg-white border border-[var(--color-muted)] rounded-[var(--radius-lg)] p-5 shadow-[var(--shadow-soft)]">
                      <h3 className="font-[var(--font-family-heading)] font-semibold text-base text-[var(--color-text-primary)] mb-2 flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-[var(--color-primary-50)] text-[var(--color-primary-600)] text-xs font-bold flex items-center justify-center">2</span>
                        Summative Assessment
                      </h3>
                      <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed">
                        Between the ages of 24 and 36 months via the progress check.
                      </p>
                    </div>
                  </div>
                </PolicySection>
              </AnimatedSection>

              {/* ══ 05 OBSERVATION POLICY ══════════════════════════════════ */}
              <AnimatedSection>
                <PolicySection id="observation" title="Observation Policy" eyebrow="05 — About Our Setting">
                  <div className="bg-[var(--color-primary-50)] border-l-4 border-[var(--color-primary-500)] p-4 rounded-r-[var(--radius-md)] mb-6">
                    <p className="text-sm font-medium text-[var(--color-primary-900)] italic">
                      Guidance to the Foundation Stage Curriculum states: &lsquo;Practitioners must be able to observe and respond appropriately to children&rsquo;.
                    </p>
                  </div>
                  <p className="text-[var(--color-text-secondary)] text-base leading-relaxed mb-4">
                    This principle requires childminders to observe the children and respond appropriately to help them progress. This is demonstrated when childminders:
                  </p>
                  <PolicyList
                    ordered
                    items={[
                      'Make systematic observations and assessments of each child’s achievements, interests and learning styles,',
                      'Use these observations and assessments to identify learning priorities and plan relevant and motivating learning experiences for each child',
                      'Match their observations to the expectations of the early learning goals',
                      'I will follow the Early Years Foundation Stage guidance to assist me in my work.',
                      'I will make regular observations on your child, using different media, for example, photographs, written observations and video recordings.',
                    ]}
                  />
                </PolicySection>
              </AnimatedSection>

              {/* ══ 06 LEARNING JOURNEY ════════════════════════════════════ */}
              <AnimatedSection>
                <PolicySection id="learning-journey" title="Learning Journey" eyebrow="06 — About Our Setting">
                  <p className="text-[var(--color-text-secondary)] text-base leading-relaxed">
                    This records your child&apos;s learning during their time with me. Observations of your child playing and interacting with others are added alongside photographs and videos. These observations are used to inform planning and assessments. You can add your comments whenever you wish.
                  </p>
                </PolicySection>
              </AnimatedSection>

              {/* ══ 07 ACCIDENT PROCEDURES ═════════════════════════════════ */}
              <AnimatedSection>
                <PolicySection id="accident-procedures" title="Accident Procedures" eyebrow="07 — Health, Safety & Wellbeing">
                  <PolicySubsection title="Accident Procedures">
                    <p className="text-[var(--color-text-secondary)] text-sm md:text-base leading-relaxed mb-4">
                      If a child is injured in my care and the injury is minor (such as a scratch or graze), it will be handled by myself/assistance. An accident form will be completed, and on collection of the child at the end of the day, parents/ carers will be required to read and sign the form. A copy will be given to the parent/ carer. If a child has an accident and it’s a major injury, I will administer first aid and consult the parents/carers, and an accident form will be completed above.
                    </p>
                  </PolicySubsection>

                  <PolicySubsection title="Accident at Home">
                    <p className="text-[var(--color-text-secondary)] text-sm md:text-base leading-relaxed">
                      If a child has an accident at home, parents or carers must inform me and complete an accident form. A copy of this form will be provided to the parents or carers.
                    </p>
                  </PolicySubsection>
                </PolicySection>
              </AnimatedSection>

              {/* ══ 08 EQUAL OPPORTUNITY ═══════════════════════════════════ */}
              <AnimatedSection>
                <PolicySection id="equal-opportunity" title="Equal Opportunity Policy Statement" eyebrow="08 — Equality, Inclusion & Behaviour">
                  <div className="bg-[var(--color-primary-50)] border border-[var(--color-primary-100)] rounded-[var(--radius-lg)] p-5 mb-7">
                    <p className="text-sm md:text-base text-[var(--color-primary-800)] leading-relaxed italic">
                      &ldquo;I actively promote equal opportunities and anti-discriminatory practices for all children in my care. I recognise the importance of ensuring that no child or parent is discriminated against based on race, gender, class, culture, age, religion, disability, sexual orientation, or family status. I am committed to treating all children according to their individual needs and abilities with respect.&rdquo;
                    </p>
                  </div>

                  <PolicySubsection title="Procedure (How I put the statement into practice)">
                    <div className="space-y-3 text-[var(--color-text-secondary)] text-sm md:text-base leading-relaxed">
                      <p>
                        I value and respect the different racial origins, religions, cultures, and languages in a multi-ethnic society so that each child is valued as an individual without racial or gender stereotyping.
                      </p>
                      <p>
                        I will also not discriminate against anyone on the grounds of race, gender, disability, sexual orientation, age, or religious beliefs.
                      </p>
                      <p>
                        I will do my best to use toys, books, etc., to provide positive images of different cultures, racial groups, genders, religions, and disabilities.
                      </p>
                      <p>
                        I will recognise each child as an individual, treat them fairly and give them opportunities to develop to their full potential.
                      </p>
                      <p>
                        I will always help children feel good about themselves by celebrating the differences that make us all unique. I will not stereotype any children. I encourage them to play with whatever they wish. Wherever possible, I will allow children to make their own choices regarding activities, play, etc.
                      </p>
                      <p>
                        I will always encourage children to develop respect for each other’s differences and to value everyone as an individual.
                      </p>
                      <p className="font-medium text-[var(--color-text-primary)]">
                        I trust parents/carers and children will accept this Equal Opportunities Policy.
                      </p>
                    </div>
                  </PolicySubsection>
                </PolicySection>
              </AnimatedSection>

              {/* ══ 09 HOLIDAYS ════════════════════════════════════════════ */}
              <AnimatedSection>
                <PolicySection id="holidays" title="Holidays" eyebrow="09 — Attendance & Childcare Arrangements">
                  <div className="space-y-4 text-[var(--color-text-secondary)] text-base leading-relaxed">
                    <p>
                      In every profession, workers will take time off to rejuvenate, reduce stress, and spend time with family. I take 25 days of holiday each year, not including Christmas and bank holidays. I provide four weeks&apos; notice for any holidays I plan to take.
                    </p>
                    <p>
                      My setting is closed on bank holidays in line with Southwark Council childcare providers. A full fee will still be charged if a bank holiday falls on your child&apos;s normal contracted day.
                    </p>
                    <p>
                      If minded children or parents go on holiday or take any time off, I will charge the full fee, as I need to hold your child&apos;s place open during their absence.
                    </p>
                    <p>
                      If I’m off work on a contracted day, I have backup childminders who will cover for me. These childminders are familiar with your child and the other children they care for. If you would like to meet them beforehand, please let me know. My backup childminders will charge their rates for the day(s) they cover.
                    </p>
                  </div>
                </PolicySection>
              </AnimatedSection>

              {/* ══ 10 ATTENDANCE POLICY ═══════════════════════════════════ */}
              <AnimatedSection>
                <PolicySection id="attendance" title="Attendance Policy" eyebrow="10 — Attendance & Childcare Arrangements">
                  <div className="space-y-4 text-[var(--color-text-secondary)] text-base leading-relaxed">
                    <p>
                      Although attendance in early years settings is not compulsory, I encourage regular attendance to ensure children gain maximum benefit from their time here. If a child was expected and not brought by parents, I must consider that the absence could be related to safeguarding concerns – for example, a parent having had an accident or died at home, or a child sustaining an injury that parents are hiding from me. The need to monitor children’s attendance is also linked to female genital mutilation (FGM) and the Prevent Duty.
                    </p>
                    <p>
                      Absences will be followed up promptly, including those that occur for a prolonged period or without prior notification from parents. If a child is absent, I will make every effort to contact their parents or emergency contacts. I aim to have up to two or more emergency contacts for each child, in addition to the parents, to help me meet this requirement. However, if parents cannot provide two additional emergency contacts, I will record that I will contact children’s social care in an emergency.
                    </p>
                    <p>
                      When deciding whether an absence is prolonged, I must consider patterns and trends in the child’s absences, the child’s personal circumstances, the child’s vulnerability, and the vulnerabilities and home life of the parent or carer. If I am concerned about a child’s absence and the parents, carers, or the child’s emergency contacts are unavailable, I will follow our Safeguarding Procedures and contact local children’s social care services and/or the police to request a welfare check.
                    </p>
                  </div>
                  <PolicyCallout type="info" title="Note">
                    <p>If the child’s family live out of the area, I will also record the contact details for their social care services.</p>
                  </PolicyCallout>
                </PolicySection>
              </AnimatedSection>

              {/* ══ 11 EMERGENCIES / BACKUP CHILDMINDER ═══════════════════ */}
              <AnimatedSection>
                <PolicySection id="emergencies" title="Emergencies / Back-up Childminder" eyebrow="11 — Attendance & Childcare Arrangements">
                  <div className="space-y-4 text-[var(--color-text-secondary)] text-base leading-relaxed">
                    <p>
                      In an emergency where I can’t provide childcare, I will contact my backup/colleague to temporarily care for the children until their parents can collect them. There may be occasions when I entrust the children in my care to another reputable, registered childminder.
                    </p>
                    <p>
                      It is best practice in our profession to have backup plans to ensure the children&apos;s safety, especially during unexpected situations. This could involve a trusted family member or another registered childminder who can assist.
                    </p>
                  </div>
                </PolicySection>
              </AnimatedSection>

              {/* ══ 12 SETTLING-IN POLICY ══════════════════════════════════ */}
              <AnimatedSection>
                <PolicySection id="settling-in" title="Settling In" eyebrow="12 — Equality, Inclusion & Behaviour">
                  <p className="text-[var(--color-text-secondary)] text-base leading-relaxed mb-4">
                    Settling-in sessions for parents and children allow us to get to know each other.
                  </p>
                  <PolicyList
                    ordered
                    items={[
                      'It gives you a chance to provide me with lots of information about your child: their likes and dislikes, routines, favourite activities, how to comfort them if they become upset, and how they have reacted when left with others. I can build a relationship with you and your child and better understand your needs and wishes.',
                      'I may visit your home to spend time with you and your child as a good way to get to know each other. It is a great opportunity to spend time in a relaxed atmosphere, exchanging information and planning your child’s start as the settling. You will also have the chance to ask questions and express any concerns.',
                      'Offer staggered admissions.',
                      'Encourage children to bring a familiar object from home i.e., a teddy or toy.',
                      'Invite parents to stay with the child as they adjust to the new environment.',
                    ]}
                  />
                  <div className="mt-5 space-y-4 text-[var(--color-text-secondary)] text-base leading-relaxed">
                    <p>
                      I understand that some children may take longer to settle in than others, while some may adjust quickly and become upset a few weeks later. I am here to support you and your child during this transition period to ensure it goes as smoothly as possible. It is important for both you and your child to feel relaxed and happy in my home and with the care I provide.
                    </p>
                    <p>
                      Parents are welcome to contact me daily to check their child&apos;s health. If I cannot answer your call right away, please don&apos;t worry; I may be assisting another child. I will return your call as soon as possible within a reasonable timeframe.
                    </p>
                  </div>
                </PolicySection>
              </AnimatedSection>

              {/* ══ 13 SICK / MEDICATION POLICY ════════════════════════════ */}
              <AnimatedSection>
                <PolicySection id="sick-medication" title="Sick / Medication Policy" eyebrow="13 — Health, Safety & Wellbeing">
                  <div className="bg-[var(--color-primary-50)] border-l-4 border-[var(--color-primary-500)] p-4 rounded-r-[var(--radius-md)] mb-6">
                    <p className="text-sm font-semibold text-[var(--color-primary-900)] mb-1">
                      (This forms part of my Health and Safety Policy)
                    </p>
                    <p className="text-sm text-[var(--color-text-secondary)]">
                      Whilst I understand that it is difficult for you to take time off from work to look after a sick child, I must protect other children in my care and myself, from infection.
                    </p>
                  </div>

                  <PolicyList
                    ordered
                    items={[
                      'Parents will be informed of any accidents. An accident that requires ice packs, marks, bruises, or bumps will be logged & parents will have to sign. Any bumps or bruises that your child arrives with will also be recorded with a brief explanation, and your signature will again be required.',
                      'You will be required to fill in a medicine record should your child require any medication whilst in my care.',
                      'You must provide the medication/treatment you wish me to administer in its original packaging and you must have signed a “Non-prescription Medicine Permission Form” in advance.',
                      'It is vital that you inform me of any medication you have given your child within 24 hours before they arrive at my care. I need to know what medicine they have had, the dose and the time given.',
                      'I will ensure that all medication I receive is stored properly and that I check that it is still within its expiry date. Under no circumstances will I administer expired medication.',
                      'I will keep a written record, and I’ll inform parents of when and what times medications administered.',
                    ]}
                  />

                  <div className="mt-6 space-y-4 text-[var(--color-text-secondary)] text-base leading-relaxed">
                    <p>
                      I reserve the right to follow NHS Public Health England&apos;s guidance regarding infectious diseases. To minimise the risk of infection to other children, myself, and my household members, I will not accept children with contagious diseases. Any child excluded due to an illness or infectious disease will not be allowed to return until they have been symptom-free for 48 hours.
                    </p>
                    <p>
                      If your child is unwell, I will advise you to keep them at home until they have fully recovered, depending on the nature of their illness.
                    </p>
                  </div>

                  <div className="my-5 p-5 bg-amber-50/80 border border-amber-200 rounded-[var(--radius-lg)]">
                    <h4 className="font-[var(--font-family-heading)] font-bold text-amber-900 text-sm mb-3">
                      Exclusion Guidelines:
                    </h4>
                    <PolicyList
                      ordered
                      items={[
                        'Children who have shown signs of vomiting or have diarrhoea. They must be kept away for 48 hours after the vomiting or diarrhoea have ceased.',
                        'Children with chicken pox must be kept at home until all scabs are dry.',
                        'Children with conjunctivitis must stay home for at least 48 hours or until their eyes are no longer watering, as it is contagious, despite public health guidance from England.',
                        'Hand, Foot & Mouth Disease, Ringworm, Scabies, Scarlet fever, Threadworms',
                        'Hepatitis A, Impetigo, Measles, Mumps, Rubella (German Measles) Tuberculosis etc.',
                      ]}
                    />
                  </div>

                  <div className="space-y-4 text-[var(--color-text-secondary)] text-base leading-relaxed">
                    <p>
                      Children who are unwell or have had a fever in the last 24 hours must stay home. If a child becomes ill during the day, a parent or another designated person must pick them up.
                    </p>
                    <p>
                      Parents must notify me if their child is unwell or has displayed any signs of illness in the last 2 hours before drop-off.
                    </p>
                    <p>
                      For children who become ill during the day, I will immediately telephone their parents and inform them and if necessary, arrange the collection of the child by the parents or other agreed persons at the earliest opportunity.
                    </p>
                    <p className="font-semibold text-[var(--color-text-primary)]">
                      Head Lice must be reported to me so that I can inform other parents. Please treat your child if you discover head lice!
                    </p>
                  </div>
                </PolicySection>
              </AnimatedSection>

              {/* ══ 14 PREVENT DUTY ════════════════════════════════════════ */}
              <AnimatedSection>
                <PolicySection id="prevent-duty" title="Prevent Duty" eyebrow="14 — Safeguarding & Security">
                  <p className="text-[var(--color-text-secondary)] text-base leading-relaxed mb-4">
                    As a Childcare provider, I must comply with the Prevent Duty Guidance requirement to protect children within my setting from radicalisation, extremism, and being drawn into terrorism. I am aware of the Government&apos;s prevention strategy, which aims to protect children from terrorism and radicalisation, and I have incorporated the strategy into my safeguarding procedures.
                  </p>
                  <PolicyList
                    ordered
                    items={[
                      'To protect children in my care, I will be alert to any reason for concern in the child’s life at home or elsewhere. This includes awareness of the expression of extremist views.',
                      'Assessing the risk of children being drawn into terrorism.',
                      'Demonstrate that children are protected from being drawn into terrorism by having robust safeguarding policies.',
                      'Ensure that safeguarding arrangements are included in the policies and procedures of the Local Safeguarding Children Board',
                      'Keeping myself abreast and having training that gives me the knowledge and confidence to identify children at risk of being drawn into terrorism, and to challenge extremist ideas which can be used to legitimise terrorism.',
                      'Committed to teaching the children British Values, i.e. democracy, the rule of law, individual liberty and personal responsibility, mutual respect and tolerance of those of different cultures, faiths and beliefs.',
                    ]}
                  />
                </PolicySection>
              </AnimatedSection>

              {/* ══ 15 VISITORS POLICY ══════════════════════════════════════ */}
              <AnimatedSection>
                <PolicySection id="visitors" title="Visitors Policy" eyebrow="15 — Safeguarding & Security">
                  <p className="text-[var(--color-text-secondary)] text-base leading-relaxed mb-4">
                    As an Ofsted-registered Childminder, I know my role in keeping your child safe. While children need to mix with other children and adults, my responsibility is to ensure the suitability of the people they meet during busy hours. I have, therefore, written the following policy regarding visitors in my setting during busy hours.
                  </p>
                  <PolicyList
                    ordered
                    items={[
                      'Any regular visitors to my setting will need to complete a DBS',
                      'I will not leave a minded child in a room alone with a visitor, unless I know they have been DBS cleared, for example, another Ofsted Registered Childminder.',
                      'I will not allow any visitors or my children to take children to the toilet or change them',
                      'I will check the identification of any visitors unknown to me and refuse entry to anyone whose identification I cannot verify.',
                      'If possible, I will arrange for workmen and maintenance to my property outside of working hours.',
                      'I will maintain written records / have a visitor’s book available for you to look at.',
                    ]}
                  />
                  <p className="text-[var(--color-text-secondary)] text-sm md:text-base leading-relaxed mt-5">
                    If you have any concerns regarding this matter, please do not hesitate to contact me.
                  </p>
                </PolicySection>
              </AnimatedSection>

              {/* ══ 16 CONFIDENTIALITY ══════════════════════════════════════ */}
              <AnimatedSection>
                <PolicySection id="confidentiality" title="Confidentiality" eyebrow="16 — Safeguarding & Security">
                  <div className="space-y-4 text-[var(--color-text-secondary)] text-base leading-relaxed">
                    <p>
                      I endeavour to take a professional approach to confidentiality. I will not share confidential or sensitive information about children or their families without the family&apos;s permission. Information on children and families I work with will be kept secure and treated in confidence.
                    </p>
                    <p>
                      I will only break this rule in the interest of protecting a child. There may be circumstances when the parents’ permission is not appropriate or able to be sought, as would be the case if the child required urgent medical attention or if there appeared to be a safeguarding issue.
                    </p>
                    <p>
                      Ofsted may ask to see my records at any time.
                    </p>
                    <p>
                      I will not use any photographs of the minded children other than for the Learning journey.
                    </p>
                    <p>
                      Wow factor moment or for inclusion in their portfolio. The children’s names will not be used in the portfolio. No photographs will be taken without signed authorisation from the parents, and it will be in line with the Data Protection Policy. Parental permissions are in place for each child. Information on children and families I work with will be kept securely and treated in confidence.
                    </p>
                    <p>
                      Parents have the right to inspect all records about their child at any time, except in exceptional cases where data protection laws stipulate that it is against the child&apos;s best interests to do so.
                    </p>
                  </div>
                </PolicySection>
              </AnimatedSection>

              {/* ══ 17 MOBILE PHONES & CAMERAS ══════════════════════════════ */}
              <AnimatedSection>
                <PolicySection id="mobile-phones" title="Use of Mobile Telephones and Cameras" eyebrow="17 — Safeguarding & Security">
                  <PolicyCallout type="important" title="Mobile Phones & Cameras Policy">
                    <p>
                      When children are present in the setting, parents or visitors are prohibited from using mobile phones, video recording devices, or cameras. This measure is intended to prevent unauthorised photographs, videos, and recordings.
                    </p>
                  </PolicyCallout>
                </PolicySection>
              </AnimatedSection>

              {/* ══ 18 EMERGENCY PLAN & FIRE EVACUATION ═══════════════════ */}
              <AnimatedSection>
                <PolicySection id="emergency-fire" title="Emergency Plan & Fire Evacuation Procedure" eyebrow="18 — Health, Safety & Wellbeing">
                  <p className="text-[var(--color-text-secondary)] text-base leading-relaxed">
                    In an emergency, I will strive to remain calm and handle the situation to the best of my ability. I will always ensure that all children are safe and, if necessary, removed from the immediate area. I will assess the situation and decide if there is a need to call the emergency services. If the emergency involves a fire in the kitchen or main room, I will exit the flat by the front door. I grab my phone and call emergency services or shout for help. I will assemble the children outside by the side of Tesco. Any child who is unable to walk, I’ll carry. I will contact the parents of all the children and inform them of the situation. If the parents are not available, I will leave a message and a contact number, and try to contact another “emergency contact”, who is on the child’s registration form.
                  </p>
                </PolicySection>
              </AnimatedSection>

              {/* ══ 19 SMOKING POLICY ══════════════════════════════════════ */}
              <AnimatedSection>
                <PolicySection id="smoking" title="Smoking Policy" eyebrow="19 — Health, Safety & Wellbeing">
                  <PolicyCallout type="important" title="Strict No-Smoking Policy">
                    <div className="space-y-2">
                      <p>I apply a strict No Smoking policy to my home.</p>
                      <p>I shall not take minded children to any private dwelling where smoking is permitted.</p>
                      <p>Smoking is prohibited by law in all enclosed public spaces.</p>
                      <p>I will not take the children into smoky environments and will avoid places that permit smoking wherever possible.</p>
                    </div>
                  </PolicyCallout>
                  <p className="text-xs text-[var(--color-text-muted)] mt-3">
                    This policy supports the Early Years Foundation Stage Safeguarding and Welfare Requirements 2014 requirements and standards.
                  </p>
                </PolicySection>
              </AnimatedSection>

              {/* ══ 20 PROCEDURE IF A CHILD IS NOT COLLECTED ══════════════ */}
              <AnimatedSection>
                <PolicySection id="not-collected" title="Procedure if a Child Is Not Collected" eyebrow="20 — Attendance & Childcare Arrangements">
                  <PolicyList
                    ordered
                    items={[
                      'It is crucial to arrive at the scheduled time to collect your child. Even young children learn routines and know when their parents are expected. They can become anxious if you are late.',
                      'Please inform me by telephone, at the earliest opportunity, if you expect to be late or if your child will not be attending for any reason.',
                      'If a child is not collected within 15 minutes of their agreed collection time, and I have not been informed of their late collection, I will try calling the parents’ contact numbers. Then I will try the emergency contact numbers.',
                      'During this time, I will continue to care for the child safely and will keep attempting to contact the parents and their emergency contacts. However, if a reasonable amount of time passes after the originally agreed-upon pickup time, or if I cannot make satisfactory arrangements with the parents or emergency contacts, I will take appropriate action.',
                      'If the child is not collected after 30 minutes, I will then contact my local authority duty social worker and follow their advice.',
                      'This follows the Ofsted National Childminding Standards concerning child safety',
                    ]}
                  />
                </PolicySection>
              </AnimatedSection>

              {/* ══ 21 LOST / MISSING CHILD ════════════════════════════════ */}
              <AnimatedSection>
                <PolicySection id="lost-missing" title="Lost / Missing Child" eyebrow="21 — Safeguarding & Security">
                  <div className="space-y-4 text-[var(--color-text-secondary)] text-base leading-relaxed mb-6">
                    <p>
                      The care of your child is paramount, and I will always try to ensure that they remain with me and are safe. However, sometimes children can become ‘lost’ in busy places, and as a responsible childminder, I have written a procedure that will be followed in the unlikely event of this happening.
                    </p>
                    <p>
                      I will immediately raise the alarm to all around me that I have lost a child and enlist the help of everyone to look for them.
                    </p>
                    <p>
                      If it is a secure area such as a shopping centre, I will quickly alert the security staff, so they can seal off exits and monitor the situation on any CCTV. I will provide everyone involved in the search with a description of the child. I will reassure the other children, as they may be distressed.
                    </p>
                    <p>
                      I will then alert the police and provide a full description.
                    </p>
                    <p>
                      I will then alert the parents of the situation.
                    </p>
                  </div>

                  <h3 className="font-[var(--font-family-heading)] font-semibold text-base text-[var(--color-text-primary)] mb-3">
                    I take precautions to avoid situations like this from happening by implementing the following measures:
                  </h3>
                  <PolicyList
                    ordered
                    items={[
                      'Ensuring children are on reins or holding my hand or the pushchair when we are out.',
                      'Avoid going to overcrowded places.',
                      'I will ensure the children wear wristbands with my mobile number when going on outings outside the local area.',
                      'I will teach the children the dangers of wandering off and talking to strangers.',
                    ]}
                  />
                </PolicySection>
              </AnimatedSection>

              {/* ══ 22 BEHAVIOUR MANAGEMENT ════════════════════════════════ */}
              <AnimatedSection>
                <PolicySection id="behaviour" title="Behaviour Management" eyebrow="22 — Equality, Inclusion & Behaviour">
                  <p className="text-[var(--color-text-secondary)] text-base leading-relaxed mb-4">
                    I aim to set good behaviour by setting a good example to the children.
                  </p>
                  <PolicyList
                    items={[
                      'I will not smack or shake any child.',
                      'I will not humiliate any child.',
                      'I will encourage children to share and reward good behaviour.',
                      'I will praise and approve of good behaviour.',
                      'I will attempt to distract and redirect a child who is misbehaving.',
                      'If the misbehaviour continues, I will remove the child from the situation. If the child is old enough to understand, I will take them to a calm-down area for five minutes to reflect on their behaviour.',
                      'I will explain to the children why I feel their behaviour is unacceptable.',
                      'I will only consider physical intervention if a child is in danger, e.g. if they are about to run into the road or are about to hurt another child.',
                    ]}
                  />
                  <div className="mt-5 space-y-4 text-[var(--color-text-secondary)] text-base leading-relaxed">
                    <p>
                      I expect the children to abide by the house rules (as appropriate for their age and stage of development). I will discuss and agree on behaviour management methods with the parents.
                    </p>
                    <p>
                      Suppose a child continues to act unacceptably and is a danger to other children and myself. In that case, I will try to gain support from different services to address their behaviour before their contract is terminated. For example, I will contact Southwark’s early help service and complete a Common Assessment Record form. This would only be if all possible steps to improve the behaviour had failed or if the child caused severe injury to another person.
                    </p>
                  </div>
                </PolicySection>
              </AnimatedSection>

              {/* ══ 23 ALCOHOL, DRUGS & SMOKING ══════════════════════════════ */}
              <AnimatedSection>
                <PolicySection id="alcohol-drugs" title="Alcohol, Drugs & Smoking Policy" eyebrow="23 — Health, Safety & Wellbeing">
                  <p className="text-[var(--color-text-secondary)] text-base leading-relaxed mb-4">
                    As an Ofsted registered Childminder, I work alone and will have sole responsibility for your child whilst they are in my care. I must be alert to any dangers and able to protect him/her. To do this effectively, I must not be under the influence of any form of drugs (including some prescription medications). If I am prescribed medication, other than routine antibiotics, I must inform Ofsted, who will decide as to whether I can continue to mind whilst taking them every day. I do not drink or smoke at all.
                  </p>
                  <PolicyCallout type="info" title="Collection & Special Occasions">
                    <p>
                      If you have been drinking, perhaps at a work Christmas party, whilst entertaining clients, I would prefer if you arranged for another responsible adult to collect your child, especially if you plan to drive home. Alternatively, you may call me, and I can delay the pickup time if possible.
                    </p>
                  </PolicyCallout>
                </PolicySection>
              </AnimatedSection>

              {/* ══ 24 COMPLAINTS POLICY ════════════════════════════════════ */}
              <AnimatedSection>
                <PolicySection id="complaints" title="Complaints Policy" eyebrow="24 — Complaints & Contacts">
                  <div className="space-y-4 text-[var(--color-text-secondary)] text-base leading-relaxed mb-6">
                    <p>
                      As a registered childminder, I aim to work closely with all parents to meet their children&apos;s needs. If you have a complaint about any aspect of my care of your child, please bring it to my attention, and hopefully, we can resolve it amicably.
                    </p>
                    <p>
                      I prefer to deal with complaints informally wherever possible and would hope to be able to resolve any issues through open discussion.
                    </p>
                    <p>
                      If a parent feels unable to discuss an area of concern directly with me or has previously discussed their problem with me but remains unhappy, they should contact Ofsted.
                    </p>
                    <p>
                      Depending on the nature of the complaint, I will investigate it myself or pass it on to Ofsted. I will record the complaint on an Ofsted-approved form.
                    </p>
                  </div>

                  <h3 className="font-[var(--font-family-heading)] font-semibold text-base text-[var(--color-text-primary)] mb-3">
                    The complaints record will include information on the following:
                  </h3>
                  <PolicyList
                    ordered
                    items={[
                      'The nature of the complaint.',
                      'How I dealt with the complaint',
                      'Any actions taken or proposed because of my findings.',
                      'Whether the parent has been provided with an account of the findings and any action taken within 28 days after the complaint was made.',
                      'I aim to deal with any complaint swiftly and reasonably.',
                      'I will keep a written record of all complaints, including verbal complaints, and a subsequent investigation, recording the following:',
                    ]}
                  />

                  <div className="ml-6 my-4 pl-4 border-l-2 border-[var(--color-primary-200)]">
                    <p className="text-xs font-semibold uppercase tracking-wider text-[var(--color-primary-700)] mb-2 font-[var(--font-family-heading)]">
                      Investigation Record Details:
                    </p>
                    <PolicyList
                      ordered
                      items={[
                        'Name of the person making the complaint',
                        'The nature of the complaint',
                        'Date and time of complaint',
                        'The outcome of the complaint investigation (for example, ways the service has improved)',
                        'Details of the information and findings given to the person making the complaint, and any action taken.',
                      ]}
                    />
                  </div>

                  <div className="space-y-4 text-[var(--color-text-secondary)] text-base leading-relaxed my-6">
                    <p>
                      I will provide a summary of the complaint on request to any parent of a child for whom I act as a childminder or to Ofsted.
                    </p>
                    <p>
                      I shall be required to make available to Ofsted on request all complaints made about the Childcare Register requirement during the past three years and the action taken. If you would like to file a formal complaint against me, you can contact OFSTED, the organisation responsible for my registration as a childminder. This will be referred to me to investigate unless there are exceptional circumstances such as a child protection issue, which Ofsted will refer to the appropriate agency.
                    </p>
                  </div>

                  <div className="bg-white border border-[var(--color-muted)] rounded-[var(--radius-lg)] p-5 shadow-[var(--shadow-soft)]">
                    <p className="font-[var(--font-family-heading)] font-semibold text-sm text-[var(--color-text-primary)] mb-2">
                      OFSTED Contact:
                    </p>
                    <p className="text-xs text-[var(--color-text-muted)] mb-1">
                      OFSTED, Piccadilly Gate, Store Street, Manchester, M1 2WD
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <a
                        href="tel:03001231231"
                        className="text-sm font-semibold text-[var(--color-primary-600)] hover:text-[var(--color-primary-700)] hover:underline flex items-center gap-1.5"
                      >
                        <Phone size={12} className="shrink-0" aria-hidden />
                        0300 123 1231
                      </a>
                    </div>
                  </div>
                </PolicySection>
              </AnimatedSection>

              {/* ══ 25 SAFEGUARDING ═════════════════════════════════════════ */}
              <AnimatedSection>
                <PolicySection id="safeguarding-policy" title="Safeguarding Child Policies" eyebrow="25 — Safeguarding & Security">
                  <div className="space-y-4 text-[var(--color-text-secondary)] text-base leading-relaxed mb-6">
                    <p>
                      As a registered childminder and the designated officer for my childminding setting, I have always considered the safety and protection of children in my care to be of utmost importance.
                    </p>
                    <p>
                      I understand that abuse can be emotional, physical, sexual or neglect. Parents must notify me of any concerns about their child and any accidents, incidents or injuries affecting the child, which will be recorded.
                    </p>
                  </div>

                  <h3 className="font-[var(--font-family-heading)] font-semibold text-base text-[var(--color-text-primary)] mb-3">
                    If I notice anything that gives me cause for concern, such as:
                  </h3>
                  <PolicyList
                    ordered
                    items={[
                      'Significant changes in the child’s behaviour',
                      'Unexpected bruising or marks',
                      'Report comments that cause concern',
                      'Play and language that indicate sexual knowledge beyond a child\'s years',
                      'Deterioration in general well-being, which causes concern in any way',
                    ]}
                  />

                  <h3 className="font-[var(--font-family-heading)] font-semibold text-base text-[var(--color-text-primary)] mt-6 mb-3">
                    I will:
                  </h3>
                  <ul className="space-y-3 text-[var(--color-text-secondary)] text-sm md:text-base leading-relaxed list-disc list-inside mb-6">
                    <li className="pl-1">
                      Refer a child, if there are concerns about possible abuse, to the Children and Young People Service Multi-Agency Safeguarding Hub (MASH). Referrals will be made in writing, following a telephone call. Under these circumstances, I will share information about your child with MASH and the Police if requested. If the concern relates to me, any member of my family or any other adult or child that relates to the children in my care, I will follow my ‘Allegations of Abuse’ procedure.
                    </li>
                    <li className="pl-1">
                      Keep written records of concerns about a child, even if there is no need to make an immediate referral. I will ensure that all such records are kept confidential and securely, separate from a child’s records.
                    </li>
                    <li className="pl-1">
                      Liaise with other agencies and professionals.
                    </li>
                    <li className="pl-1">
                      Attend case conferences, or other multi-agency planning meetings, as necessary.
                    </li>
                    <li className="pl-1">
                      Any child with a child protection plan absent without explanation is referred to their Social Worker and Social Care Team.
                    </li>
                    <li className="pl-1">
                      I will inform my local child protection agency (MASH) and Ofsted of any serious accident, illness, or injury involving any child under my care. Ofsted will be notified within 14 days.
                    </li>
                  </ul>

                  <div className="bg-[var(--color-primary-50)] border border-[var(--color-primary-200)] rounded-[var(--radius-lg)] p-5 mt-6">
                    <h4 className="font-[var(--font-family-heading)] font-bold text-[var(--color-primary-900)] text-sm mb-2">
                      Procedure if an allegation is made against me:
                    </h4>
                    <p className="text-sm text-[var(--color-text-secondary)] mb-3">
                      However, if an allegation is made against me, I will follow the procedure detailed below to gain support and professional advice.
                    </p>
                    <ul className="space-y-2 text-sm text-[var(--color-text-secondary)] list-disc list-inside">
                      <li className="pl-1">
                        I will contact the Local Authority Designated Officer (LADO) immediately to discuss the nature of the allegation and the appropriate action to be taken:
                      </li>
                      <li className="pl-1">
                        I will write a detailed record of all related incidents, including what was said and by whom, with times and dates.
                      </li>
                      <li className="pl-1">
                        After seeking advice/approval from LADO, I will ask witnesses (if there were any) to write a statement detailing the incident they witnessed and give their contact details in case the authorities need to follow up.
                      </li>
                      <li className="pl-1">
                        If an allegation is made against me or anyone within my setting, I will report it to Ofsted and LADO within fourteen days, following the local Safeguarding Children Board procedures.
                      </li>
                    </ul>
                  </div>
                </PolicySection>
              </AnimatedSection>

              {/* ══ 26 USEFUL TELEPHONE NUMBERS ═════════════════════════════ */}
              <AnimatedSection>
                <PolicySection id="useful-numbers" title="Useful Telephone Numbers" eyebrow="26 — Complaints & Contacts">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <ContactCard
                      name="MASH Team (Multi-Agency Safeguarding Hub)"
                      phones={[
                        { label: 'Daytime', number: '0207 525 1921' },
                        { label: 'Out of hours', number: '0207 525 5000' },
                      ]}
                    />
                    <ContactCard
                      name="Quality Assurance Unit Service Manager (LADO)"
                      phones={[{ number: '0207 525 3295' }]}
                    />
                    <ContactCard
                      name="Quality Assurance Unit Duty Number"
                      phones={[{ number: '0207 525 3297' }]}
                    />
                    <ContactCard
                      name="Head of Social Work Improvement & Quality Assurance"
                      phones={[{ number: '020 7525 0387' }]}
                    />
                    <ContactCard
                      name="NSPCC 24-hour Child Protection Helpline"
                      phones={[{ number: '0808 800 5000' }]}
                    />
                    <ContactCard
                      name="Ofsted"
                      phones={[{ number: '0300 123 1231' }]}
                      lines={['Piccadilly Gate, Store Street', 'Manchester M1 2WD']}
                    />
                  </div>
                </PolicySection>
              </AnimatedSection>

              {/* ══ 27 HEALTH & SAFETY — HOME ENVIRONMENT ══════════════════ */}
              <AnimatedSection>
                <PolicySection id="home-environment" title="Health & Safety - Home Environment" eyebrow="27 — Health, Safety & Wellbeing">
                  <p className="text-[var(--color-text-secondary)] text-base leading-relaxed mb-6">
                    The Health and Safety of your child is important. These are some of the procedures in place to support this:
                  </p>
                  <ul className="bg-white border border-[var(--color-muted)] rounded-[var(--radius-xl)] overflow-hidden shadow-[var(--shadow-soft)]" role="list">
                    {[
                      'All unused electrical sockets accessible to young children have appropriate safety covers fitted. Toys are regularly inspected and cleaned to ensure they are safe for use.',
                      'Cleaning products and materials are kept in a cupboard and out of reach of small children.',
                      'Medicines are kept out of reach of small children.',
                      'A safety gate is fitted in the kitchen.',
                      'I use appropriate safety equipment for the children in my care, such as cupboard locks.',
                      'All glass cabinets have a glass protection film.',
                      'The kitchen has a fire blanket in case there is a fire.',
                      'I will ensure the first aid box is up to date.',
                      'I maintain a clean kitchen and adhere to food hygiene guidelines, such as ensuring the fridge is at the correct temperature.',
                      'Waste bins are emptied regularly.',
                      'I encourage good hygiene skills in the children and myself, such as washing hands after going to the toilet and before touching food.',
                      'I will teach children safety skills, such as how to cross the road safely.',
                      'I will encourage the children to make healthy food choices and to do physical exercise.',
                      'I have smoke detectors which are routinely tested to be in working order.',
                      'I will remove toys or equipment found to be faulty from areas where children can access them. Any toy or equipment that is beyond repair will be disposed of immediately.',
                    ].map((item, i) => (
                      <ChecklistItem key={i}>{item}</ChecklistItem>
                    ))}
                  </ul>
                </PolicySection>
              </AnimatedSection>

              {/* ══ 28 RISK ASSESSMENT: MY PREMISES ════════════════════════ */}
              <AnimatedSection>
                <PolicySection id="risk-premises" title="Risk Assessment - My Premises" eyebrow="28 — Risk Assessment">
                  <div className="space-y-4 text-[var(--color-text-secondary)] text-base leading-relaxed mb-6">
                    <p>
                      As a registered childminder, my home is clean and checked before the minded children arrive to ensure the environment is safe for them to play. I also risk assessing any environment I take the children into, such as walking to school, shops, parks, playgroups, etc.
                    </p>
                    <p>
                      If I’m taking the children into unknown environments, I will try to do a risk assessment in advance, so I am aware of any potential hazards, although this may not always be possible.
                    </p>
                    <p>
                      I will keep records of my assessments, which will be stored in a file. These documents are available for parents and Ofsted upon request.
                    </p>
                  </div>

                  <h3 className="font-[var(--font-family-heading)] font-semibold text-base text-[var(--color-text-primary)] mb-3">
                    Each day before I commence minding I shall:
                  </h3>
                  <ul className="bg-white border border-[var(--color-muted)] rounded-[var(--radius-xl)] overflow-hidden mb-5 shadow-[var(--shadow-soft)]" role="list">
                    {[
                      'Check that the door slams are in position',
                      'Ensure that the wall unit cabinet is locked and sealed with a child lock',
                      'Check that the socket covers are in place',
                      'Check that bins are emptied',
                      'Check that knives and sharp objects are out of reach in the kitchen',
                      'Check that the toilet is clean, and all chemicals are out of reach.',
                      'Ensure that enough soap, towels, toilet rolls and tissues are available.',
                      'Ensure that the living room is clean and tidy.',
                      'Check the temperature of the fridge',
                      'Check that the wires are not trailing anywhere',
                    ].map((item, i) => (
                      <ChecklistItem key={i}>{item}</ChecklistItem>
                    ))}
                  </ul>
                  <p className="text-[var(--color-text-secondary)] text-sm md:text-base leading-relaxed">
                    I will carry out visual checks before children arrive, and review as necessary throughout the day.
                  </p>
                </PolicySection>
              </AnimatedSection>

              {/* ══ 29 RISK ASSESSMENT: OUTING ══════════════════════════════ */}
              <AnimatedSection>
                <PolicySection id="risk-outing" title="Risk Assessment – Outing" eyebrow="29 — Risk Assessment">
                  <p className="text-[var(--color-text-secondary)] text-base leading-relaxed mb-6">
                    This is reviewed before each outing, and any incidents are recorded in my accident/incident book. I will remember to take my mobile telephone, emergency contact numbers and a first aid kit.
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-7">
                    <div className="bg-white border border-[var(--color-muted)] rounded-[var(--radius-lg)] p-4 shadow-[var(--shadow-soft)]">
                      <p className="text-xs text-[var(--color-text-muted)] font-medium uppercase tracking-wide mb-1">Type of Outing</p>
                      <p className="text-sm font-semibold text-[var(--color-text-primary)] font-[var(--font-family-heading)]">Park</p>
                    </div>
                    <div className="bg-white border border-[var(--color-muted)] rounded-[var(--radius-lg)] p-4 shadow-[var(--shadow-soft)]">
                      <p className="text-xs text-[var(--color-text-muted)] font-medium uppercase tracking-wide mb-1">How We Will Get There</p>
                      <p className="text-sm font-semibold text-[var(--color-text-primary)] font-[var(--font-family-heading)]">Walking</p>
                    </div>
                  </div>

                  <PolicySubsection title="Potential risks on the journey and how I will minimise these risks:">
                    <PolicyList
                      ordered
                      items={[
                        'I will look for animal faeces and broken glass on the path to ensure that no one steps on it.',
                        'I will check for overhanging bushes and branches to ensure they will not scratch a child’s face or go into their eyes.',
                        'If we encounter a dog, I will teach the children to stay calm and ask the owner if the dog is friendly. I will also encourage them to ask for the dog\'s name before allowing the child to approach, in order to avoid the risk of a bite.',
                        'I will teach the children about road safety by ensuring we cross at a visible stop; look left, right and left again before crossing; use pedestrian crossings where available; and always set a good example. I will teach the children to walk quickly but sensibly across roads.',
                        'I will harness the child while the others will be in a pushchair to avoid anyone getting lost.',
                      ]}
                    />
                  </PolicySubsection>

                  <div className="mt-8">
                    <PolicySubsection title="Potential risks once we arrive and how I will minimise these risks:">
                      <PolicyList
                        ordered
                        items={[
                          'To stop a child from getting lost, I’ll ensure we’re always together and constantly keeping an eye on them. If a child persists in running off, I will harness the child until I can trust them not to run off or strap them into a pushchair if necessary.',
                          'To prevent a child from getting hurt, I will teach them to avoid going behind and in front of swings.',
                          'I will ensure that the child is using play equipment appropriate for their stage of development/age.',
                          'To avoid a child going with someone they don’t know, I will teach them basic ‘Stranger Danger’ rules never accept gifts or sweets from a stranger; never get in a car with a stranger; never go anywhere with a stranger, and never go off on your own without telling me, your parents or a trusted adult.',
                          'I will check for broken glass and animal faeces; if found, I will remove it using plastic gloves and paper tissues. I will clean my hands using wipes and sanitiser.',
                        ]}
                      />
                    </PolicySubsection>
                  </div>
                </PolicySection>
              </AnimatedSection>

              {/* ── End of content CTA ──────────────────────────────────── */}
              <AnimatedSection className="mt-6 pb-6">
                <div className="bg-[var(--color-primary-50)] border border-[var(--color-primary-100)] rounded-[var(--radius-xl)] p-6 md:p-8 text-center shadow-[var(--shadow-soft)]">
                  <p className="text-xs font-semibold uppercase tracking-[0.15em] text-[var(--color-primary-500)] mb-3 font-[var(--font-family-heading)]">
                    Questions?
                  </p>
                  <h2 className="font-[var(--font-family-heading)] font-bold text-xl md:text-2xl text-[var(--color-text-primary)] mb-3">
                    Still have questions about our policies?
                  </h2>
                  <p className="text-[var(--color-text-secondary)] text-sm md:text-base leading-relaxed mb-6 max-w-lg mx-auto">
                    Don&apos;t hesitate to get in touch. We&apos;re happy to talk through any aspect of this handbook and answer any questions you may have about your child&apos;s care.
                  </p>
                  <a
                    href="/contact"
                    className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-[var(--color-primary-500)] hover:bg-[var(--color-primary-600)] text-white font-semibold rounded-xl text-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[var(--shadow-card)]"
                    id="policies-page-contact-link"
                  >
                    Get in Touch
                  </a>
                </div>
              </AnimatedSection>

            </div>
          </div>
        </div>
      </div>

      <CTASection />
    </>
  )
}
