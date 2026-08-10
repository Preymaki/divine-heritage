/**
 * AdminDashboard — /admin/dashboard
 *
 * Dashboard home page. Shows a welcome header, summary stat cards,
 * and quick-action links to each CMS section.
 *
 * All values are placeholders — Firestore integration is Milestone 4+.
 */

import { Link } from 'react-router-dom'
import {
  Images,
  Star,
  BookOpen,
  MessageSquare,
  ArrowRight,
  Sparkles,
} from 'lucide-react'
import { useAuth } from '@hooks/useAuth'
import StatCard from '@components/admin/StatCard'
import PageHeader from '@components/admin/PageHeader'

// ── Stat card data ───────────────────────────────────────────────────────────

const STATS = [
  {
    id:     'stat-gallery',
    icon:   Images,
    label:  'Gallery Images',
    value:  '—',
    subtext: 'Connect Firestore to see count',
    color:  'blue',
  },
  {
    id:     'stat-reviews',
    icon:   Star,
    label:  'Pending Reviews',
    value:  '—',
    subtext: 'Awaiting moderation',
    color:  'pink',
  },
  {
    id:     'stat-blog',
    icon:   BookOpen,
    label:  'Blog Posts',
    value:  '—',
    subtext: 'Published + drafts',
    color:  'sage',
  },
  {
    id:     'stat-messages',
    icon:   MessageSquare,
    label:  'New Messages',
    value:  '—',
    subtext: 'Unread contact enquiries',
    color:  'amber',
  },
] as const

// ── Quick links ──────────────────────────────────────────────────────────────

const QUICK_LINKS = [
  { href: '/admin/gallery',  icon: Images,         label: 'Manage Gallery',  desc: 'Upload and organise photos' },
  { href: '/admin/reviews',  icon: Star,            label: 'Moderate Reviews',desc: 'Approve parent reviews' },
  { href: '/admin/blog',     icon: BookOpen,        label: 'Write a Post',    desc: 'Create and edit blog content' },
  { href: '/admin/messages', icon: MessageSquare,   label: 'View Messages',   desc: 'Respond to enquiries' },
] as const

// ── Component ─────────────────────────────────────────────────────────────────

export default function AdminDashboard() {
  const { user } = useAuth()

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
            subtitle="Here's a snapshot of your site content. Connect Firestore in Milestone 4 to see live data."
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
          {STATS.map(({ id, icon, label, value, subtext, color }) => (
            <StatCard
              key={id}
              id={id}
              icon={icon}
              label={label}
              value={value}
              subtext={subtext}
              color={color as 'blue' | 'pink' | 'sage' | 'amber'}
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
