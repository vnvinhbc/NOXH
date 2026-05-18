import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuthStore } from '@/stores/authStore'
import LoadingSpinner from './LoadingSpinner'

export default function ProtectedRoute() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const hasHydrated = useAuthStore((s) => s.hasHydrated)
  const location = useLocation()

  if (!hasHydrated) {
    return <div className="flex justify-center py-20"><LoadingSpinner size="lg" /></div>
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  }

  return <Outlet />
}
