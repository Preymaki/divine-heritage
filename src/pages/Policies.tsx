/**
 * Policies — /policies
 *
 * Public-facing Policies & Procedures page.
 * Content is fetched in real-time from the Firestore `policies` collection.
 * Displays the complete official September 2026 – September 2027 handbook verbatim with NO AI MODIFICATIONS.
 *
 * Layout:
 *  - Hero banner with official EYFS & Ofsted compliance badges
 *  - Sticky "On this page" categorized sidebar (desktop) / categorized dropdown (mobile)
 *  - Categorized digital handbook layout (Learning & Development, Safeguarding, Operational, Health & Safety)
 *  - Avril Cole signed review confirmation
 */

import { useState, useEffect, useRef, useMemo } from 'react'
import {
  ChevronDown,
  ChevronUp,
  BookOpen,
  AlertCircle,
  Loader2,
  Phone,
  Mail,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import AnimatedSection from '@components/ui/AnimatedSection'
import CTASection from '@components/home/CTASection'
import { subscribeToPublishedPolicies, OFFICIAL_POLICIES } from '@services/policies'
import type { Policy } from '@appTypes/policy'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Converts a policy title into a URL-safe anchor ID */
function toAnchorId(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

/** Check if Firestore list is the legacy 29-item seed */
function isLegacySeed(items: Policy[]): boolean {
  if (items.length === 0) return true
  const titles = new Set(items.map((i) => i.title.trim().toLowerCase()))
  return titles.has('holidays') || !titles.has('prevent duty & counter-extremism policy')
}

/** Turn the static official policies into Policy interface objects */
function getOfficialPolicyFallbacks(): Policy[] {
  return OFFICIAL_POLICIES.map((p, idx) => ({
    id: `official-${idx}`,
    title: p.title,
    category: p.category,
    content: p.content,
    order: idx,
    isPublished: true,
    createdAt: null,
    updatedAt: null,
  }))
}

/**
 * Parses inline text to auto-link phone numbers, emails, and URLs while preserving exact words
 */
function formatInline(text: string): React.ReactNode {
  // Regex to match phone patterns, emails, or web urls
  const regex = /(https?:\/\/[^\s]+|www\.[^\s]+|[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}|(?:0\d{2,4}\s?\d{3,4}\s?\d{3,4}|0800\s?\d{3,4}\s?\d{3,4}|0808\s?\d{3,4}\s?\d{3,4}|0207\s?\d{3}[-\s]?\d{4}|0300\s?\d{3,4}\s?\d{4}|\b999\b|\b101\b))/g

  const parts = text.split(regex)
  if (parts.length === 1) return text

  return parts.map((part, i) => {
    if (!part) return null

    // Email
    if (/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(part)) {
      return (
        <a key={i} href={`mailto:${part}`} className="policy-link policy-link--email">
          <Mail size={13} className="policy-link-icon" aria-hidden="true" />
          {part}
        </a>
      )
    }

    // Web link
    if (/^(https?:\/\/|www\.)/i.test(part)) {
      const href = part.startsWith('http') ? part : `https://${part}`
      return (
        <a
          key={i}
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="policy-link policy-link--url"
        >
          {part}
          <ExternalLink size={12} className="policy-link-icon" aria-hidden="true" />
        </a>
      )
    }

    // Phone / Emergency number
    if (/^(?:0\d{2,4}\s?\d{3,4}\s?\d{3,4}|0800\s?\d{3,4}\s?\d{3,4}|0808\s?\d{3,4}\s?\d{3,4}|0207\s?\d{3}[-\s]?\d{4}|0300\s?\d{3,4}\s?\d{4}|999|101)$/.test(part.trim())) {
      const cleanPhone = part.replace(/[^0-9+]/g, '')
      return (
        <a key={i} href={`tel:${cleanPhone}`} className="policy-link policy-link--phone">
          <Phone size={12} className="policy-link-icon" aria-hidden="true" />
          {part}
        </a>
      )
    }

    return part
  })
}

/**
 * Renders plain-text policy content into structured JSX.
 * Recognizes subheadings, bullets, sub-bullets, numbered lists, and paragraphs.
 */
function renderContent(content: string): React.ReactNode[] {
  const paragraphs = content.split(/\n\n+/)
  return paragraphs.map((block, blockIdx) => {
    const lines = block.split('\n').filter((l) => l.trim() !== '')
    if (lines.length === 0) return null

    // Standalone subheading check (short line ending in colon or specific section header)
    if (lines.length === 1) {
      const line = lines[0].trim()
      const isSubheading =
        (line.endsWith(':') && line.length < 90) ||
        /^(How I Assess Your Child|Observations & Learning Journey|Special Educational Needs & Disability|Supporting Children with English as an Additional Language|Recognising Concerns|What Happens When a Child Discloses a Concern|Steps Taken if an Allegation is Made Against an Adult|Responding to Concerns and Disclosures|Allegations Against Myself or a Family Member|Confidentiality$|Mobile Telephones & Personal Recording Devices|Cameras, Photography & Digital Images|Screen Time & Digital Media|Online safety & Internet Access|Designated Emergency Backup Personnel & Qualifications|Data Sharing & Emergency Information|Communication & Parent Notification|1\.\s+Sickness & Infection Exclusion|Medication & Administering|Accidents & Existing Injuries|1\.\s+Accidents Occurring in My Care|2\.\s+\(Accidents at Home\)|1\.\s+Smoking and Vaping Policy|Alcohol, Drugs, and Medication Policy|Safe Collection & Parent Responsibilities|Babies \(Under 12–18 Months\):|Young Children & Toddlers:|1\.\s+Pre-Outing Assessment & Planning|En Route & Road Safety:|3\.\s+Review & Record Keeping|Useful Contact details)/i.test(line)

      if (isSubheading) {
        return (
          <h3 key={blockIdx} className="policy-content-subheading">
            {line}
          </h3>
        )
      }
    }

    const isBullet    = lines.every((l) => /^[-•*]\s/.test(l.trim()))
    const isSubBullet = lines.every((l) => /^o\s/.test(l.trim()))
    const isNumbered  = lines.every((l) => /^\d+\.\s/.test(l.trim()))

    if (isBullet) {
      return (
        <ul key={blockIdx} className="policy-content-list policy-content-list--bullet">
          {lines.map((line, i) => (
            <li key={i}>{formatInline(line.replace(/^[-•*]\s/, '').trim())}</li>
          ))}
        </ul>
      )
    }

    if (isSubBullet) {
      return (
        <ul key={blockIdx} className="policy-content-list policy-content-list--subbullet">
          {lines.map((line, i) => (
            <li key={i}>{formatInline(line.replace(/^o\s/, '').trim())}</li>
          ))}
        </ul>
      )
    }

    if (isNumbered) {
      return (
        <ol key={blockIdx} className="policy-content-list policy-content-list--numbered">
          {lines.map((line, i) => (
            <li key={i}>{formatInline(line.replace(/^\d+\.\s/, '').trim())}</li>
          ))}
        </ol>
      )
    }

    // Mixed block: render line by line handling bullet points or sub-bullets seamlessly
    return (
      <div key={blockIdx} className="policy-content-block">
        {lines.map((line, i) => {
          const trimmed = line.trim()
          if (/^[-•*]\s/.test(trimmed)) {
            return (
              <div key={i} className="policy-mixed-bullet">
                <span className="policy-bullet-dot">•</span>
                <span className="policy-bullet-text">{formatInline(trimmed.replace(/^[-•*]\s/, ''))}</span>
              </div>
            )
          }
          if (/^o\s/.test(trimmed)) {
            return (
              <div key={i} className="policy-mixed-subbullet">
                <span className="policy-subbullet-dot">○</span>
                <span className="policy-bullet-text">{formatInline(trimmed.replace(/^o\s/, ''))}</span>
              </div>
            )
          }
          if (/^\d+\.\s/.test(trimmed)) {
            const num = trimmed.match(/^(\d+\.)\s/)?.[1] || ''
            return (
              <div key={i} className="policy-mixed-numbered">
                <span className="policy-num-label">{num}</span>
                <span className="policy-bullet-text">{formatInline(trimmed.replace(/^\d+\.\s/, ''))}</span>
              </div>
            )
          }
          return (
            <p key={i} className="policy-content-para">
              {formatInline(line)}
            </p>
          )
        })}
      </div>
    )
  }).filter(Boolean) as React.ReactNode[]
}

// ---------------------------------------------------------------------------
// Animated section wrapper
// ---------------------------------------------------------------------------

function PolicyEntry({ policy, isFirst }: { policy: Policy; isFirst: boolean }) {
  const shouldReduceMotion = useReducedMotion()
  const isContactsPolicy = /Useful Contact/i.test(policy.title)

  return (
    <motion.article
      id={toAnchorId(policy.title)}
      className={`policy-entry ${isContactsPolicy ? 'policy-entry--contacts' : ''}`}
      initial={shouldReduceMotion ? false : { opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.45, ease: [0.4, 0, 0.2, 1] }}
    >
      <div className="policy-entry-header">
        {!isFirst && <div className="policy-entry-divider" aria-hidden="true" />}
        {policy.category && (
          <span className="policy-entry-category-badge">{policy.category}</span>
        )}
        <h2 className="policy-entry-title">{policy.title}</h2>
      </div>

      <div className="policy-entry-body">
        {renderContent(policy.content)}
      </div>

      {isContactsPolicy && (
        <div className="policy-official-signoff" role="note" aria-label="Policy sign-off certification">
          <div className="policy-signoff-badge">
            <ShieldCheck size={28} className="policy-signoff-icon" aria-hidden="true" />
            <div>
              <p className="policy-signoff-title">Official Setting Certification</p>
              <p className="policy-signoff-text">
                &ldquo;I confirmed that these policies have been reviewed, signed, and will be updated next year by <strong>Avril Cole</strong>.&rdquo;
              </p>
              <p className="policy-signoff-dates">
                <span>Updated September 2026</span>
                <span className="policy-signoff-dot" aria-hidden="true">·</span>
                <span>Review September 2027</span>
              </p>
            </div>
          </div>
        </div>
      )}
    </motion.article>
  )
}

// ---------------------------------------------------------------------------
// Desktop sticky sidebar
// ---------------------------------------------------------------------------

function PolicySidebar({
  grouped,
  activeId,
}: {
  grouped: { category: string; policies: Policy[] }[]
  activeId: string | null
}) {
  return (
    <nav className="policy-sidebar" aria-label="Handbook Table of Contents">
      <div className="policy-sidebar-header">
        <BookOpen size={16} aria-hidden="true" />
        <p className="policy-sidebar-heading">Contents</p>
      </div>
      <div className="policy-sidebar-groups">
        {grouped.map((group) => (
          <div key={group.category} className="policy-sidebar-group">
            <p className="policy-sidebar-group-title">{group.category}</p>
            <ul className="policy-sidebar-list" role="list">
              {group.policies.map((policy) => {
                const anchorId = toAnchorId(policy.title)
                const isActive = activeId === anchorId
                return (
                  <li key={policy.id}>
                    <a
                      href={`#${anchorId}`}
                      className={`policy-sidebar-link${isActive ? ' policy-sidebar-link--active' : ''}`}
                      aria-current={isActive ? 'location' : undefined}
                      onClick={(e) => {
                        e.preventDefault()
                        document
                          .getElementById(anchorId)
                          ?.scrollIntoView({ behavior: 'smooth', block: 'start' })
                      }}
                    >
                      {policy.title}
                    </a>
                  </li>
                )
              })}
            </ul>
          </div>
        ))}
      </div>
    </nav>
  )
}

// ---------------------------------------------------------------------------
// Mobile dropdown nav
// ---------------------------------------------------------------------------

function MobileNav({
  grouped,
}: {
  grouped: { category: string; policies: Policy[] }[]
}) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="policy-mobile-nav">
      <button
        type="button"
        className="policy-mobile-nav-btn"
        onClick={() => setIsOpen((v) => !v)}
        aria-expanded={isOpen}
        aria-controls="policy-mobile-nav-list"
      >
        <BookOpen size={16} aria-hidden="true" />
        <span>Table of Contents · Jump to policy</span>
        {isOpen ? <ChevronUp size={16} aria-hidden="true" /> : <ChevronDown size={16} aria-hidden="true" />}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            id="policy-mobile-nav-list"
            className="policy-mobile-nav-list"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.18 }}
          >
            {grouped.map((group) => (
              <div key={group.category} className="policy-mobile-nav-group">
                <p className="policy-mobile-nav-group-title">{group.category}</p>
                <ul role="list">
                  {group.policies.map((policy) => {
                    const anchorId = toAnchorId(policy.title)
                    return (
                      <li key={policy.id}>
                        <a
                          href={`#${anchorId}`}
                          className="policy-mobile-nav-link"
                          onClick={(e) => {
                            e.preventDefault()
                            setIsOpen(false)
                            document
                              .getElementById(anchorId)
                              ?.scrollIntoView({ behavior: 'smooth', block: 'start' })
                          }}
                        >
                          {policy.title}
                        </a>
                      </li>
                    )
                  })}
                </ul>
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Main page
// ---------------------------------------------------------------------------

export default function Policies() {
  const [policies, setPolicies] = useState<Policy[]>([])
  const [loading,  setLoading]  = useState(true)
  const [error,    setError]    = useState<string | null>(null)
  const [activeId, setActiveId] = useState<string | null>(null)

  // ── Firestore subscription ────────────────────────────────────────────────
  useEffect(() => {
    const unsub = subscribeToPublishedPolicies(
      (data) => {
        // If empty or still containing old legacy data, fallback to the official policies
        if (data.length === 0 || isLegacySeed(data)) {
          setPolicies(getOfficialPolicyFallbacks())
        } else {
          setPolicies(data)
        }
        setLoading(false)
      },
      () => {
        // If Firestore read fails (e.g. offline), use the official policies
        setPolicies(getOfficialPolicyFallbacks())
        setLoading(false)
      },
    )
    return unsub
  }, [])

  // ── Group by category ────────────────────────────────────────────────────
  const groupedPolicies = useMemo(() => {
    const defaultCategories = [
      'Learning & Development',
      'Safeguarding & Child Policies',
      'Operational & Staffing Policies',
      'Health & Safety Policies',
    ]

    const groups: { category: string; policies: Policy[] }[] = []
    const map = new Map<string, Policy[]>()

    policies.forEach((p) => {
      const cat = p.category?.trim() || 'General Policies'
      if (!map.has(cat)) map.set(cat, [])
      map.get(cat)!.push(p)
    })

    // Preserve the order of standard categories
    defaultCategories.forEach((cat) => {
      if (map.has(cat)) {
        groups.push({ category: cat, policies: map.get(cat)! })
        map.delete(cat)
      }
    })

    // Any other custom categories added by admin
    map.forEach((pList, cat) => {
      groups.push({ category: cat, policies: pList })
    })

    return groups
  }, [policies])

  // ── Intersection observer — track active section ──────────────────────────
  const observerRef = useRef<IntersectionObserver | null>(null)

  useEffect(() => {
    if (policies.length === 0) return

    observerRef.current?.disconnect()
    observerRef.current = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting)
        if (visible.length > 0) {
          setActiveId(visible[0].target.id)
        }
      },
      { rootMargin: '-10% 0px -80% 0px', threshold: 0 },
    )

    policies.forEach((policy) => {
      const el = document.getElementById(toAnchorId(policy.title))
      if (el) observerRef.current?.observe(el)
    })

    return () => observerRef.current?.disconnect()
  }, [policies])

  return (
    <>
      {/* ── SEO ── */}
      <title>Policies & Procedures | Divine Heritage Childcare Services</title>
      <meta
        name="description"
        content="Read the complete, official policies and procedures handbook for Divine Heritage Childcare Services (September 2026 – September 2027), covering Learning & Development, Safeguarding, Health & Safety, and Operational procedures."
      />

      {/* ─────────────────────────────────────────────────────────────────────
          HERO
          ───────────────────────────────────────────────────────────────────── */}
      <section className="policy-hero" aria-label="Policies page header">
        <div className="policy-hero-inner">
          <AnimatedSection>
            <p className="policy-hero-eyebrow">Thrive · Grow · Belong</p>
            <h1 className="policy-hero-title">Policies &amp; Procedures</h1>
            <p className="policy-hero-subtitle">
              A warm, nurturing home-away-from-home place where every child thrives, grows, and belongs.
              Complete handbook of standards, safeguarding protocols, and childcare practices.
            </p>
          </AnimatedSection>

          <AnimatedSection>
            <div className="policy-hero-badges" aria-label="Compliance badges">
              <span className="policy-hero-badge">
                <CheckCircle2 size={13} aria-hidden="true" /> EYFS Statutory Framework
              </span>
              <span className="policy-hero-badge">
                <CheckCircle2 size={13} aria-hidden="true" /> Ofsted Registered
              </span>
              <span className="policy-hero-badge">
                <CheckCircle2 size={13} aria-hidden="true" /> Southwark Safeguarding Partnership
              </span>
              <span className="policy-hero-badge policy-hero-badge--date">
                Updated September 2026 · Review September 2027
              </span>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────────────
          CONTENT
          ───────────────────────────────────────────────────────────────────── */}
      <div className="policy-page-wrap">
        <div className="policy-page-inner">

          {/* Mobile navigation */}
          {!loading && policies.length > 0 && (
            <MobileNav grouped={groupedPolicies} />
          )}

          <div className="policy-layout">
            {/* ── Sidebar ── */}
            {!loading && policies.length > 0 && (
              <aside className="policy-sidebar-col" aria-label="Policy navigation">
                <div className="policy-sidebar-sticky">
                  <PolicySidebar grouped={groupedPolicies} activeId={activeId} />
                </div>
              </aside>
            )}

            {/* ── Main content ── */}
            <main className="policy-main" id="policy-main-content">

              {/* Loading */}
              {loading && (
                <div className="policy-loading" role="status" aria-label="Loading policies">
                  <Loader2 size={28} className="policy-loading-icon" aria-hidden="true" />
                  <p>Loading policies…</p>
                </div>
              )}

              {/* Error fallback */}
              {!loading && error && (
                <div className="policy-error" role="alert">
                  <AlertCircle size={22} aria-hidden="true" />
                  <p>{error}</p>
                </div>
              )}

              {/* Policies list */}
              {!loading && policies.length > 0 && (
                <div className="policy-entries">
                  {policies.map((policy, idx) => (
                    <PolicyEntry
                      key={policy.id}
                      policy={policy}
                      isFirst={idx === 0}
                    />
                  ))}

                  {/* CTA Block */}
                  <AnimatedSection className="policy-cta-block">
                    <div className="policy-cta-inner">
                      <p className="policy-cta-eyebrow">Questions?</p>
                      <h2 className="policy-cta-title">Still have questions about our policies?</h2>
                      <p className="policy-cta-desc">
                        Don&apos;t hesitate to get in touch. We&apos;re happy to talk through any aspect of this handbook
                        and answer any questions you may have about your child&apos;s care.
                      </p>
                      <a
                        href="/contact"
                        className="policy-cta-btn"
                        id="policies-page-contact-link"
                      >
                        Get in Touch
                      </a>
                    </div>
                  </AnimatedSection>
                </div>
              )}

            </main>
          </div>
        </div>
      </div>

      <CTASection />
    </>
  )
}
