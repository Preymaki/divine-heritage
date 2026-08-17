/**
 * AdminSidebar
 *
 * Persistent sidebar navigation for the admin dashboard.
 * - Desktop: always visible, optionally collapsed to icon-only width
 * - Mobile: off-canvas drawer, toggled by `isOpen` prop
 */

import { NavLink, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard,
  Images,
  MessageSquare,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  X,
} from 'lucide-react'
import { useAuth } from '@hooks/useAuth'

// ── Nav item definition ──────────────────────────────────────────────────────

interface NavItem {
  label: string
  href: string
  icon: React.ComponentType<{ size?: number; className?: string }>
  id: string
}

const NAV_ITEMS: NavItem[] = [
  { label: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard, id: 'nav-dashboard' },
  { label: 'Gallery',   href: '/admin/gallery',   icon: Images,          id: 'nav-gallery' },
  { label: 'Messages',  href: '/admin/messages',   icon: MessageSquare,   id: 'nav-messages' },
  { label: 'Settings',  href: '/admin/settings',   icon: Settings,        id: 'nav-settings' },
]

// ── Props ─────────────────────────────────────────────────────────────────────

interface SidebarProps {
  /** Whether the mobile drawer is open */
  isOpen: boolean
  /** Whether the desktop sidebar is collapsed to icon-only */
  isCollapsed: boolean
  /** Close the mobile drawer */
  onClose: () => void
  /** Toggle desktop collapsed state */
  onToggleCollapse: () => void
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function AdminSidebar({
  isOpen,
  isCollapsed,
  onClose,
  onToggleCollapse,
}: SidebarProps) {
  const navigate = useNavigate()
  const { user, logout } = useAuth()

  async function handleLogout() {
    onClose()
    await logout()
    navigate('/admin/login', { replace: true })
  }

  const sidebarClass = [
    'admin-sidebar',
    isCollapsed ? 'admin-sidebar--collapsed' : '',
    isOpen      ? 'admin-sidebar--open'      : '',
  ].filter(Boolean).join(' ')

  return (
    <>
      {/* ── Mobile backdrop ── */}
      {isOpen && (
        <div
          className="admin-sidebar-backdrop"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* ── Sidebar panel ── */}
      <aside className={sidebarClass} aria-label="Admin navigation">
        {/* Header */}
        <div className="admin-sidebar-header">
          {!isCollapsed && (
            <div className="admin-sidebar-brand">
              <img src="/logo.png" alt="Divine Heritage" className="admin-sidebar-logo" />
              <span className="admin-sidebar-brand-text">Admin</span>
            </div>
          )}
          {isCollapsed && (
            <div className="admin-sidebar-brand-icon">
              <img src="/logo.png" alt="Divine Heritage" className="admin-sidebar-logo-sm" />
            </div>
          )}

          {/* Mobile close */}
          <button
            type="button"
            onClick={onClose}
            className="admin-sidebar-close-btn"
            aria-label="Close sidebar"
          >
            <X size={18} />
          </button>

          {/* Desktop collapse toggle */}
          <button
            type="button"
            onClick={onToggleCollapse}
            className="admin-sidebar-collapse-btn"
            aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </button>
        </div>

        {/* Navigation */}
        <nav className="admin-sidebar-nav" aria-label="Admin sections">
          <ul role="list">
            {NAV_ITEMS.map(({ label, href, icon: Icon, id }) => (
              <li key={href}>
                <NavLink
                  to={href}
                  id={id}
                  onClick={onClose}
                  className={({ isActive }) =>
                    ['admin-nav-link', isActive ? 'admin-nav-link--active' : ''].filter(Boolean).join(' ')
                  }
                  title={isCollapsed ? label : undefined}
                  aria-label={isCollapsed ? label : undefined}
                >
                  <Icon size={18} className="admin-nav-link-icon" aria-hidden="true" />
                  {!isCollapsed && <span className="admin-nav-link-label">{label}</span>}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        {/* Footer — user info + logout */}
        <div className="admin-sidebar-footer">
          {!isCollapsed && (
            <div className="admin-sidebar-user">
              <div className="admin-sidebar-user-avatar" aria-hidden="true">
                {user?.email?.[0]?.toUpperCase() ?? 'A'}
              </div>
              <div className="admin-sidebar-user-info">
                <p className="admin-sidebar-user-name">Administrator</p>
                <p className="admin-sidebar-user-email" title={user?.email ?? ''}>
                  {user?.email}
                </p>
              </div>
            </div>
          )}
          <button
            type="button"
            id="admin-sidebar-logout"
            onClick={handleLogout}
            className="admin-sidebar-logout-btn"
            title="Sign out"
          >
            <LogOut size={16} aria-hidden="true" />
            {!isCollapsed && <span>Sign out</span>}
          </button>
        </div>
      </aside>
    </>
  )
}
