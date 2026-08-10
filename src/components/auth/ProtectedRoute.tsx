/**
 * ProtectedRoute — guards all /admin/* routes requiring authentication.
 */
import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '@hooks/useAuth'

export default function ProtectedRoute() {
  const { user, loading, isAdmin } = useAuth()

  if (loading) {
    return (
      <div className="admin-page">
        <div className="page-loader" aria-label="Verifying session" />
      </div>
    )
  }

  if (!user) return <Navigate to="/admin/login" replace />
  if (!isAdmin) return <Navigate to="/admin/access-denied" replace />
  return <Outlet />
}
