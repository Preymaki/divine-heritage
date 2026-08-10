/**
 * AdminSettings — /admin/settings
 *
 * Settings page placeholder. Will house account details,
 * site configuration, and logout in future milestones.
 */

import { Settings, User, Globe, Shield } from 'lucide-react'
import { useAuth } from '@hooks/useAuth'
import PageHeader from '@components/admin/PageHeader'

const SETTING_SECTIONS = [
  {
    icon: User,
    title: 'Account',
    description: 'Manage your administrator account and email preferences.',
    id: 'settings-account',
  },
  {
    icon: Globe,
    title: 'Site Configuration',
    description: 'Update contact details, business hours, and SEO metadata.',
    id: 'settings-site',
  },
  {
    icon: Shield,
    title: 'Security',
    description: 'Review active sessions and authentication settings.',
    id: 'settings-security',
  },
]

export default function AdminSettings() {
  const { user } = useAuth()

  return (
    <div className="cms-page">
      <PageHeader
        title="Settings"
        subtitle="Account and site configuration options."
      />

      {/* Account info card */}
      <div className="settings-section" aria-label="Current account">
        <div className="settings-card settings-card--account">
          <div className="settings-card-icon" aria-hidden="true">
            <Settings size={20} />
          </div>
          <div>
            <p className="settings-card-label">Signed in as</p>
            <p className="settings-card-value">{user?.email}</p>
            <p className="settings-card-meta">Administrator · Single-admin mode</p>
          </div>
        </div>
      </div>

      {/* Setting sections */}
      <div className="settings-section">
        <p className="settings-section-note">
          Full settings panels will be implemented in a future milestone.
        </p>
        <div className="settings-list">
          {SETTING_SECTIONS.map(({ icon: Icon, title, description, id }) => (
            <div key={id} id={id} className="settings-list-item settings-list-item--coming">
              <div className="settings-list-icon" aria-hidden="true">
                <Icon size={18} />
              </div>
              <div className="settings-list-body">
                <p className="settings-list-title">{title}</p>
                <p className="settings-list-desc">{description}</p>
              </div>
              <span className="settings-coming-badge">Coming soon</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
