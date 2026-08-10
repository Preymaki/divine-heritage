/**
 * DashboardLayout
 *
 * Nested layout for all protected admin CMS pages.
 * Renders:  AdminSidebar | AdminTopbar + <Outlet>
 *
 * State managed here:
 *  - isSidebarOpen   — mobile off-canvas drawer
 *  - isCollapsed     — desktop icon-only collapsed sidebar
 *
 * The sidebar collapses on mobile whenever a nav link is clicked
 * (the Sidebar calls onClose, which sets isSidebarOpen → false).
 */

import { useState, useEffect } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import AdminSidebar from '@components/admin/AdminSidebar'
import AdminTopbar from '@components/admin/AdminTopbar'

export default function DashboardLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [isCollapsed, setIsCollapsed] = useState(false)
  const location = useLocation()

  // Close mobile drawer on route change
  useEffect(() => {
    setIsSidebarOpen(false)
  }, [location.pathname])

  // Lock body scroll when mobile drawer is open
  useEffect(() => {
    document.body.style.overflow = isSidebarOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [isSidebarOpen])

  // On small screens, never persist the collapsed state
  function handleToggleCollapse() {
    setIsCollapsed(prev => !prev)
  }

  return (
    <div
      className={[
        'dashboard-layout',
        isCollapsed ? 'dashboard-layout--collapsed' : '',
      ].filter(Boolean).join(' ')}
    >
      {/* ── Sidebar ── */}
      <AdminSidebar
        isOpen={isSidebarOpen}
        isCollapsed={isCollapsed}
        onClose={() => setIsSidebarOpen(false)}
        onToggleCollapse={handleToggleCollapse}
      />

      {/* ── Main column (topbar + page content) ── */}
      <div className="dashboard-main">
        <AdminTopbar
          onToggleSidebar={() => setIsSidebarOpen(prev => !prev)}
          isSidebarOpen={isSidebarOpen}
        />

        <main
          id="admin-main-content"
          className="dashboard-content"
          tabIndex={-1}
        >
          <div className="dashboard-content-inner">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}
