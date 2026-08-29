/**
 * AdminDashboard — /admin/dashboard
 *
 * Dashboard home page. Shows a welcome header, summary stat cards
 * backed by real-time data (Gallery & Messages),
 * quick-action links to each CMS section, and recent parent enquiries.
 */

import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  Images,
  FileText,
  MessageSquare,
  Settings,
  ArrowRight,
  Sparkles,
  Calendar,
  User,
  Tag,
} from 'lucide-react'
import { useAuth } from '@hooks/useAuth'
import { useGallery } from '@hooks/useGallery'
import { subscribeToEnquiries } from '@services/enquiries'
import type { Enquiry } from '@appTypes/enquiry'
import StatCard from '@components/admin/StatCard'
import PageHeader from '@components/admin/PageHeader'

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatDate(ts: Enquiry['createdAt']): string {
  if (!ts) return 'Just now'
  try {
    let date: Date
    const raw = ts as unknown
    if (typeof raw === 'object' && raw !== null && 'toDate' in raw && typeof (raw as { toDate: () => Date }).toDate === 'function') {
      date = (raw as { toDate: () => Date }).toDate()
    } else if (raw instanceof Date) {
      date = raw
    } else if (typeof raw === 'object' && raw !== null && 'seconds' in raw) {
      date = new Date((raw as { seconds: number }).seconds * 1000)
    } else if (typeof raw === 'string' || typeof raw === 'number') {
      date = new Date(raw)
    } else {
      return '—'
    }

    if (isNaN(date.getTime())) return '—'

    return date.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    })
  } catch {
    return '—'
  }
}

// ── Quick links ──────────────────────────────────────────────────────────────

const QUICK_LINKS = [
  { href: '/admin/gallery',   icon: Images,        label: 'Manage Gallery',   desc: 'Upload and organise photos' },
  { href: '/admin/policies',  icon: FileText,      label: 'Manage Policies',  desc: 'Add, edit and reorder policies' },
  { href: '/admin/messages',  icon: MessageSquare, label: 'View Messages',    desc: 'Respond to enquiries' },
  { href: '/admin/settings',  icon: Settings,      label: 'Site Settings',    desc: 'Update contact info & content' },
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
  const recentEnquiries       = enquiries.slice(0, 4)

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

      {/* Recent Enquiries Activity */}
      <section aria-labelledby="activity-heading" className="dashboard-section">
        <div className="flex items-center justify-between mb-4">
          <h2 id="activity-heading" className="dashboard-section-title">
            Recent Enquiries
          </h2>
          {enquiries.length > 0 && (
            <Link
              to="/admin/messages"
              className="text-xs font-semibold text-[var(--color-primary-600)] hover:text-[var(--color-primary-700)] flex items-center gap-1"
            >
              View all ({enquiries.length}) <ArrowRight size={13} />
            </Link>
          )}
        </div>

        {recentEnquiries.length === 0 ? (
          <div className="activity-placeholder">
            <p>No messages received yet. Inquiries from the website contact form will appear here.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {recentEnquiries.map((e) => (
              <Link
                key={e.id}
                to="/admin/messages"
                className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-white rounded-xl border transition-all hover:border-[var(--color-primary-300)] hover:shadow-xs ${
                  e.status === 'unread'
                    ? 'border-l-4 border-l-[var(--color-primary-500)] border-slate-200 bg-[var(--color-primary-50)]/20'
                    : 'border-slate-200'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[var(--color-primary-50)] flex items-center justify-center shrink-0">
                    <User size={15} className="text-[var(--color-primary-600)]" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-slate-800 text-sm">{e.parentName}</p>
                      {e.status === 'unread' && (
                        <span className="px-2 py-0.5 text-[10px] font-bold bg-amber-100 text-amber-800 rounded-full">
                          Unread
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 line-clamp-1 mt-0.5">{e.message}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-xs text-slate-400 shrink-0">
                  <span className="flex items-center gap-1 text-slate-600">
                    <Tag size={12} className="text-slate-400" />
                    {e.serviceType}
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar size={12} />
                    {formatDate(e.createdAt)}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
