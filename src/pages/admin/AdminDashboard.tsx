/**
 * AdminDashboard — /admin/dashboard
 *
 * Dashboard home page. Shows a welcome header, summary stat cards
 * backed by real-time Firestore data (Gallery & Messages),
 * and quick-action links to each CMS section.
 */

import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  Images,
  MessageSquare,
  Settings,
  ArrowRight,
  Sparkles,
} from 'lucide-react'
import { useAuth } from '@hooks/useAuth'
import { useGallery } from '@hooks/useGallery'
import { subscribeToEnquiries } from '@services/enquiries'
import type { Enquiry } from '@appTypes/enquiry'
import StatCard from '@components/admin/StatCard'
import PageHeader from '@components/admin/PageHeader'

// ── Quick links ──────────────────────────────────────────────────────────────

const QUICK_LINKS = [
  { href: '/admin/gallery',  icon: Images,         label: 'Manage Gallery',  desc: 'Upload and organise photos' },
  { href: '/admin/messages', icon: MessageSquare,   label: 'View Messages',   desc: 'Respond to enquiries' },
  { href: '/admin/settings', icon: Settings,        label: 'Site Settings',   desc: 'Update contact info & content' },
] as const

// ── Component ─────────────────────────────────────────────────────────────────

export default function AdminDashboard() {
  const { user } = useAuth()

  // Live Gallery data
  const { items: galleryItems, loading: galleryLoading, error: galleryError } = useGallery()

  // Live Enquiries / Messages data
  const [enquiries, setEnquiries]               = useState<Enquiry[]>([])
  const [enquiriesLoading, setEnquiriesLoading] = useState(true)
  const [enquiriesError, setEnquiriesError]     = useState<string | null>(null)

  useEffect(() => {
    const unsub = subscribeToEnquiries(
      (data) => {
        setEnquiries(data)
        setEnquiriesLoading(false)
        setEnquiriesError(null)
      },
      (err) => {
        setEnquiriesError(err.message)
        setEnquiriesLoading(false)
      },
    )
    return unsub
  }, [])

  // Derived stats
  const publishedGalleryCount = galleryItems.filter((item) => item.isPublished).length
  const unreadEnquiriesCount  = enquiries.filter((e) => e.status === 'unread').length

  const stats = [
    {
      id: 'stat-gallery',
      icon: Images,
      label: 'Gallery Images',
      value: galleryLoading ? '…' : galleryError ? '—' : galleryItems.length,
      subtext: galleryLoading
        ? 'Loading gallery count…'
        : galleryError
          ? 'Unable to load count'
          : `${publishedGalleryCount} published on website`,
      color: 'blue' as const,
    },
    {
      id: 'stat-messages',
      icon: MessageSquare,
      label: 'New Messages',
      value: enquiriesLoading ? '…' : enquiriesError ? '—' : unreadEnquiriesCount,
      subtext: enquiriesLoading
        ? 'Loading message count…'
        : enquiriesError
          ? 'Unable to load count'
          : unreadEnquiriesCount === 0
            ? 'No unread enquiries'
            : `${unreadEnquiriesCount} unread enquir${unreadEnquiriesCount === 1 ? 'y' : 'ies'} (${enquiries.length} total)`,
      color: 'amber' as const,
    },
  ]

  // Derive first name / greeting
  const displayName = user?.email?.split('@')[0] ?? 'Admin'
  const hour = new Date().getHours()
  const greeting =
    hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'

  return (
    <div className="cms-page">
      {/* Welcome header */}
      <div className="dashboard-welcome">
        <div className="dashboard-welcome-text">
          <PageHeader
            title={`${greeting}, ${displayName} 👋`}
            subtitle="Here's a snapshot of your site content, gallery images, and parent enquiries."
          />
        </div>
        <div className="dashboard-welcome-badge" aria-hidden="true">
          <Sparkles size={18} />
          <span>CMS Ready</span>
        </div>
      </div>

      {/* Stat cards */}
      <section aria-label="Summary statistics">
        <div className="stat-cards-grid">
          {stats.map(({ id, icon, label, value, subtext, color }) => (
            <StatCard
              key={id}
              id={id}
              icon={icon}
              label={label}
              value={value}
              subtext={subtext}
              color={color}
            />
          ))}
        </div>
      </section>

      {/* Quick links */}
      <section aria-labelledby="quick-actions-heading" className="dashboard-section">
        <h2 id="quick-actions-heading" className="dashboard-section-title">
          Quick Actions
        </h2>
        <div className="quick-links-grid">
          {QUICK_LINKS.map(({ href, icon: Icon, label, desc }) => (
            <Link
              key={href}
              to={href}
              className="quick-link-card"
              id={`quick-link-${label.toLowerCase().replace(/\s+/g, '-')}`}
            >
              <div className="quick-link-icon" aria-hidden="true">
                <Icon size={22} />
              </div>
              <div className="quick-link-body">
                <p className="quick-link-label">{label}</p>
                <p className="quick-link-desc">{desc}</p>
              </div>
              <ArrowRight size={16} className="quick-link-arrow" aria-hidden="true" />
            </Link>
          ))}
        </div>
      </section>

      {/* Recent activity placeholder */}
      <section aria-labelledby="activity-heading" className="dashboard-section">
        <h2 id="activity-heading" className="dashboard-section-title">
          Recent Activity
        </h2>
        <div className="activity-placeholder">
          <p>Activity feed will appear here once Firestore is connected.</p>
        </div>
      </section>
    </div>
  )
}
