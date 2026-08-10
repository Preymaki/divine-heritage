import { lazy, Suspense } from 'react'
import { Navigate, Routes, Route } from 'react-router-dom'
import RootLayout from '@layouts/RootLayout'
import AdminLayout from '@layouts/AdminLayout'
import DashboardLayout from '@layouts/DashboardLayout'
import ProtectedRoute from '@components/auth/ProtectedRoute'
import ScrollToTop from '@hooks/ScrollToTop'

// ── Public pages (lazy) ─────────────────────────────────────────────────────
const Home     = lazy(() => import('@pages/Home'))
const About    = lazy(() => import('@pages/About'))
const Services = lazy(() => import('@pages/Services'))
const Gallery  = lazy(() => import('@pages/Gallery'))
const FAQs     = lazy(() => import('@pages/FAQs'))
const Contact  = lazy(() => import('@pages/Contact'))
const NotFound = lazy(() => import('@pages/NotFound'))

// ── Admin auth pages (lazy) ──────────────────────────────────────────────────
const AdminLogin   = lazy(() => import('@pages/admin/AdminLogin'))
const CheckEmail   = lazy(() => import('@pages/admin/CheckEmail'))
const AuthCallback = lazy(() => import('@pages/admin/AuthCallback'))
const AccessDenied = lazy(() => import('@pages/admin/AccessDenied'))

// ── Admin CMS pages (lazy — kept out of the public bundle) ──────────────────
const AdminDashboard = lazy(() => import('@pages/admin/AdminDashboard'))
const AdminGallery   = lazy(() => import('@pages/admin/AdminGallery'))
const AdminReviews   = lazy(() => import('@pages/admin/AdminReviews'))
const AdminBlog      = lazy(() => import('@pages/admin/AdminBlog'))
const AdminMessages  = lazy(() => import('@pages/admin/AdminMessages'))
const AdminSettings  = lazy(() => import('@pages/admin/AdminSettings'))

// ── Loaders ──────────────────────────────────────────────────────────────────

function PageLoader() {
  return (
    <div
      style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}
      aria-label="Loading page"
    >
      <div className="page-loader" />
    </div>
  )
}

function AdminLoader() {
  return (
    <div
      style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: '#0f1117' }}
      aria-label="Loading admin page"
    >
      <div className="page-loader" />
    </div>
  )
}

// ── Helper to wrap lazy admin pages ─────────────────────────────────────────

function AdminPage({ page: Page }: { page: React.ComponentType }) {
  return (
    <Suspense fallback={<AdminLoader />}>
      <Page />
    </Suspense>
  )
}

export default function App() {
  return (
    <>
      <ScrollToTop />
      <Routes>

        {/* ── Public site ─────────────────────────────────────────────── */}
        <Route element={<RootLayout />}>
          <Route index element={<Suspense fallback={<PageLoader />}><Home /></Suspense>} />
          <Route path="about"    element={<Suspense fallback={<PageLoader />}><About /></Suspense>} />
          <Route path="services" element={<Suspense fallback={<PageLoader />}><Services /></Suspense>} />
          <Route path="gallery"  element={<Suspense fallback={<PageLoader />}><Gallery /></Suspense>} />
          <Route path="faqs"     element={<Suspense fallback={<PageLoader />}><FAQs /></Suspense>} />
          <Route path="contact"  element={<Suspense fallback={<PageLoader />}><Contact /></Suspense>} />
          <Route path="*"        element={<Suspense fallback={<PageLoader />}><NotFound /></Suspense>} />
        </Route>

        {/* ── Admin shell ─────────────────────────────────────────────── */}
        <Route path="admin" element={<AdminLayout />}>

          {/* /admin → redirect to login */}
          <Route index element={<Navigate to="/admin/login" replace />} />

          {/* Public auth routes */}
          <Route path="login"         element={<AdminPage page={AdminLogin} />} />
          <Route path="check-email"   element={<AdminPage page={CheckEmail} />} />
          <Route path="auth/callback" element={<AdminPage page={AuthCallback} />} />
          <Route path="access-denied" element={<AdminPage page={AccessDenied} />} />

          {/* Protected CMS routes — wrapped by DashboardLayout */}
          <Route element={<ProtectedRoute />}>
            <Route element={<DashboardLayout />}>
              <Route path="dashboard" element={<AdminPage page={AdminDashboard} />} />
              <Route path="gallery"   element={<AdminPage page={AdminGallery} />} />
              <Route path="reviews"   element={<AdminPage page={AdminReviews} />} />
              <Route path="blog"      element={<AdminPage page={AdminBlog} />} />
              <Route path="messages"  element={<AdminPage page={AdminMessages} />} />
              <Route path="settings"  element={<AdminPage page={AdminSettings} />} />
            </Route>
          </Route>

        </Route>

      </Routes>
    </>
  )
}

