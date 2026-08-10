/**
 * AdminTopbar
 *
 * Sticky top bar for the admin dashboard.
 * Shows: mobile hamburger, current page title, user chip.
 */

import { Menu, Bell } from 'lucide-react'
import { useLocation } from 'react-router-dom'
import { useAuth } from '@hooks/useAuth'

// Derive a human-readable page title from the pathname
function usePageTitle(): string {
  const { pathname } = useLocation()
  const segment = pathname.split('/').filter(Boolean).pop() ?? 'dashboard'
  const titleMap: Record<string, string> = {
    dashboard: 'Dashboard',
    gallery:   'Gallery',
    reviews:   'Reviews',
    blog:      'Blog',
    messages:  'Messages',
    settings:  'Settings',
  }
  return titleMap[segment] ?? 'Admin'
}

interface TopbarProps {
  onToggleSidebar: () => void
  isSidebarOpen: boolean
}

export default function AdminTopbar({ onToggleSidebar, isSidebarOpen }: TopbarProps) {
  const { user } = useAuth()
  const pageTitle = usePageTitle()

  return (
    <header className="admin-topbar-bar" role="banner">
      {/* Left — hamburger (mobile only) + page title */}
      <div className="admin-topbar-left">
        <button
          type="button"
          id="admin-topbar-menu-btn"
          onClick={onToggleSidebar}
          className="admin-topbar-menu-btn"
          aria-label={isSidebarOpen ? 'Close navigation' : 'Open navigation'}
          aria-expanded={isSidebarOpen}
          aria-controls="admin-sidebar"
        >
          <Menu size={20} />
        </button>
        <h1 className="admin-topbar-title">{pageTitle}</h1>
      </div>

      {/* Right — actions */}
      <div className="admin-topbar-right">
        {/* Notification bell — placeholder */}
        <button
          type="button"
          id="admin-topbar-notifications"
          className="admin-topbar-icon-btn"
          aria-label="Notifications"
          title="Notifications (coming soon)"
        >
          <Bell size={18} />
        </button>

        {/* User chip */}
        <div className="admin-topbar-user-chip" aria-label={`Signed in as ${user?.email}`}>
          <div className="admin-topbar-avatar" aria-hidden="true">
            {user?.email?.[0]?.toUpperCase() ?? 'A'}
          </div>
          <span className="admin-topbar-email">{user?.email}</span>
        </div>
      </div>
    </header>
  )
}
