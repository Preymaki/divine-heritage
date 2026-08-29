/**
 * Policies — /policies
 *
 * Public-facing Policies & Procedures page.
 * Content is fetched in real-time from the Firestore `policies` collection.
 * Only published (isPublished === true) policies are shown.
 *
 * Layout:
 *  - Hero banner (same dark blue style as before)
 *  - Sticky "On this page" sidebar (desktop) / dropdown (mobile)
 *  - Policy entries rendered as a clean digital handbook
 */

import { useState, useEffect, useRef } from 'react'
import { ChevronDown, ChevronUp, BookOpen, AlertCircle, Loader2 } from 'lucide-react'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import AnimatedSection from '@components/ui/AnimatedSection'
import CTASection from '@components/home/CTASection'
import { subscribeToPublishedPolicies } from '@services/policies'
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

/**
 * Renders plain-text policy content into structured JSX.
 * - Splits on \n\n for paragraphs
 * - Lines starting with "- " become bullet list items
 * - Lines starting with N. (digit + dot) become numbered list items
 * - Other lines within a block are rendered as <p>
 */
function renderContent(content: string): React.ReactNode[] {
  const paragraphs = content.split(/\n\n+/)
  return paragraphs.map((block, blockIdx) => {
    const lines = block.split('\n').filter((l) => l.trim() !== '')
    if (lines.length === 0) return null

    const isBullet   = lines.every((l) => /^[-•] /.test(l.trim()))
    const isNumbered = lines.every((l) => /^\d+\.\s/.test(l.trim()))

    if (isBullet) {
      return (
        <ul key={blockIdx} className="policy-content-list policy-content-list--bullet">
          {lines.map((line, i) => (
            <li key={i}>{line.replace(/^[-•] /, '').trim()}</li>
          ))}
        </ul>
      )
    }

    if (isNumbered) {
      return (
        <ol key={blockIdx} className="policy-content-list policy-content-list--numbered">
          {lines.map((line, i) => (
            <li key={i}>{line.replace(/^\d+\.\s/, '').trim()}</li>
          ))}
        </ol>
      )
    }

    // Mixed block: join lines as paragraphs
    if (lines.length === 1) {
      return <p key={blockIdx} className="policy-content-para">{lines[0]}</p>
    }

    // Multi-line: each is its own paragraph
    return (
      <div key={blockIdx} className="policy-content-block">
        {lines.map((line, i) => (
          <p key={i} className="policy-content-para">{line}</p>
        ))}
      </div>
    )
  }).filter(Boolean) as React.ReactNode[]
}

// ---------------------------------------------------------------------------
// Animated section wrapper
// ---------------------------------------------------------------------------

function PolicyEntry({ policy, isFirst }: { policy: Policy; isFirst: boolean }) {
  const shouldReduceMotion = useReducedMotion()
  return (
    <motion.div
      id={toAnchorId(policy.title)}
      className="policy-entry"
      initial={shouldReduceMotion ? false : { opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.45, ease: [0.4, 0, 0.2, 1] }}
    >
      <div className="policy-entry-header">
        {!isFirst && <div className="policy-entry-divider" aria-hidden="true" />}
        <h2 className="policy-entry-title">{policy.title}</h2>
      </div>
      <div className="policy-entry-body">
        {renderContent(policy.content)}
      </div>
    </motion.div>
  )
}

// ---------------------------------------------------------------------------
// Desktop sticky sidebar
// ---------------------------------------------------------------------------

function PolicySidebar({ policies, activeId }: { policies: Policy[]; activeId: string | null }) {
  return (
    <nav
      className="policy-sidebar"
      aria-label="On this page"
    >
      <p className="policy-sidebar-heading">On this page</p>
      <ul className="policy-sidebar-list" role="list">
        {policies.map((policy) => {
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
                  document.getElementById(anchorId)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
                }}
              >
                {policy.title}
              </a>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}

// ---------------------------------------------------------------------------
// Mobile dropdown nav
// ---------------------------------------------------------------------------

function MobileNav({ policies }: { policies: Policy[] }) {
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
        <span>Jump to policy</span>
        {isOpen ? <ChevronUp size={16} aria-hidden="true" /> : <ChevronDown size={16} aria-hidden="true" />}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.ul
            id="policy-mobile-nav-list"
            className="policy-mobile-nav-list"
            role="list"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.18 }}
          >
            {policies.map((policy) => {
              const anchorId = toAnchorId(policy.title)
              return (
                <li key={policy.id}>
                  <a
                    href={`#${anchorId}`}
                    className="policy-mobile-nav-link"
                    onClick={(e) => {
                      e.preventDefault()
                      setIsOpen(false)
                      document.getElementById(anchorId)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
                    }}
                  >
                    {policy.title}
                  </a>
                </li>
              )
            })}
          </motion.ul>
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
      (data) => { setPolicies(data); setLoading(false) },
      ()     => { setError('Could not load policies. Please try again later.'); setLoading(false) },
    )
    return unsub
  }, [])

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

  // ── Last updated date ─────────────────────────────────────────────────────
  const lastUpdated = policies.reduce<Date | null>((latest, policy) => {
    if (!policy.updatedAt) return latest
    try {
      const d = typeof (policy.updatedAt as { toDate?: () => Date }).toDate === 'function'
        ? (policy.updatedAt as { toDate: () => Date }).toDate()
        : new Date(policy.updatedAt as unknown as string)
      if (!latest || d > latest) return d
      return latest
    } catch { return latest }
  }, null)

  return (
    <>
      {/* ── SEO ── */}
      <title>Policies & Procedures | Divine Heritage Childcare Services</title>
      <meta
        name="description"
        content="Read the full policies and procedures handbook for Divine Heritage Childcare Services, covering health & safety, safeguarding, equal opportunities, behaviour management, and more."
      />

      {/* ─────────────────────────────────────────────────────────────────────
          HERO
          ───────────────────────────────────────────────────────────────────── */}
      <section className="policy-hero" aria-label="Policies page header">
        <div className="policy-hero-inner">
          <AnimatedSection>
            <p className="policy-hero-eyebrow">Ofsted Registered · EYFS Compliant</p>
            <h1 className="policy-hero-title">Policies &amp; Procedures</h1>
            <p className="policy-hero-subtitle">
              A complete overview of the policies, procedures and standards that guide care at
              Divine Heritage Childcare Services.
            </p>
          </AnimatedSection>

          <AnimatedSection>
            <div className="policy-hero-badges" aria-label="Compliance badges">
              <span className="policy-hero-badge">✓ EYFS Framework</span>
              <span className="policy-hero-badge">✓ Ofsted Standards</span>
              <span className="policy-hero-badge">✓ NCMA Guidelines</span>
              {lastUpdated && (
                <span className="policy-hero-badge policy-hero-badge--date">
                  Updated {lastUpdated.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })}
                </span>
              )}
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────────────
          CONTENT
          ───────────────────────────────────────────────────────────────────── */}
      <div className="policy-page-wrap">
        <div className="policy-page-inner">

          {/* Mobile nav */}
          {!loading && policies.length > 0 && (
            <MobileNav policies={policies} />
          )}

          <div className="policy-layout">
            {/* ── Sidebar ── */}
            {!loading && policies.length > 0 && (
              <aside className="policy-sidebar-col" aria-label="Policy navigation">
                <div className="policy-sidebar-sticky">
                  <PolicySidebar policies={policies} activeId={activeId} />
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

              {/* Error */}
              {!loading && error && (
                <div className="policy-error" role="alert">
                  <AlertCircle size={22} aria-hidden="true" />
                  <p>{error}</p>
                </div>
              )}

              {/* Empty */}
              {!loading && !error && policies.length === 0 && (
                <div className="policy-empty">
                  <BookOpen size={40} aria-hidden="true" />
                  <h2>Policies being updated</h2>
                  <p>Our policies are currently being updated. Please check back shortly.</p>
                </div>
              )}

              {/* Policies */}
              {!loading && !error && policies.length > 0 && (
                <div className="policy-entries">
                  {policies.map((policy, idx) => (
                    <PolicyEntry
                      key={policy.id}
                      policy={policy}
                      isFirst={idx === 0}
                    />
                  ))}

                  {/* CTA */}
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
