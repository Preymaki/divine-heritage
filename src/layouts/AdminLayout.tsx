/**
 * AdminLayout
 *
 * Bare layout for all /admin/* pages.
 * Does NOT include the public Navbar, Footer, or FloatingButtons.
 * Provides a consistent dark-mode shell for the admin dashboard.
 * Includes noindex meta tag to prevent search engines from crawling admin pages.
 */

import { Outlet } from 'react-router-dom'
import SEO from '@components/common/SEO'

export default function AdminLayout() {
  return (
    <div className="admin-shell">
      <SEO
        title="Admin Dashboard | Divine Heritage Childcare"
        description="Divine Heritage Childcare Administration"
        noindex
      />
      <Outlet />
    </div>
  )
}
