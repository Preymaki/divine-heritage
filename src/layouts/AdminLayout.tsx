/**
 * AdminLayout
 *
 * Bare layout for all /admin/* pages.
 * Does NOT include the public Navbar, Footer, or FloatingButtons.
 * Provides a consistent dark-mode shell for the admin dashboard.
 */

import { Outlet } from 'react-router-dom'

export default function AdminLayout() {
  return (
    <div className="admin-shell">
      <Outlet />
    </div>
  )
}
