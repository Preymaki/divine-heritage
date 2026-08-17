/**
 * AdminTopbar
 *
 * Sticky top bar for the admin dashboard.
 * Shows: mobile hamburger, current page title, notification bell with unread count, user chip.
 */

import { useState, useEffect } from 'react'
import { Menu, Bell } from 'lucide-react'
import { useLocation, Link } from 'react-router-dom'
import { useAuth } from '@hooks/useAuth'
import { subscribeToEnquiries } from '@services/enquiries'

// Derive a human-readable page title from the pathname
function usePageTitle(): string {
  const { pathname } = useLocation()
  const segment = pathname.split('/').filter(Boolean).pop() ?? 'dashboard'
  const titleMap: Record<string, string> = {
    dashboard: 'Dashboard',
    gallery:   'Gallery',
    messages:  'Messages & Enquiries',
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
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    const unsub = subscribeToEnquiries((items) => {
      setUnreadCount(items.filter((i) => i.status === 'unread').length)
    })
    return unsub
  }, [])

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
        {/* Notification bell linking to messages */}
        <Link
          to="/admin/messages"
          id="admin-topbar-notifications"
          className="admin-topbar-icon-btn relative"
          aria-label={unreadCount > 0 ? `${unreadCount} unread messages` : 'Messages'}
          title={unreadCount > 0 ? `${unreadCount} unread messages` : 'Messages'}
        >
          <Bell size={18} />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-amber-500 text-slate-900 font-bold text-[10px] rounded-full flex items-center justify-center border-2 border-white leading-none">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </Link>

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
