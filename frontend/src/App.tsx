import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'sonner'
import LoginPage from '@/pages/auth/LoginPage'
import RegisterPage from '@/pages/auth/RegisterPage'
import ForgotPasswordPage from '@/pages/auth/ForgotPasswordPage'
import DashboardPage from '@/pages/DashboardPage'
import ProjectsPage from '@/pages/ProjectsPage'
import ProfilePage from '@/pages/ProfilePage'
import UserProgressPage from '@/pages/UserProgressPage'
import UserPriorityScorePage from '@/pages/UserPriorityScorePage'
import UserLotteryTicketPage from '@/pages/UserLotteryTicketPage'
import UserLotteryRoomPage from '@/pages/UserLotteryRoomPage'
import UserResultsAuditPage from '@/pages/UserResultsAuditPage'
import ProtectedRoute from '@/components/common/ProtectedRoute'
import MainLayout from '@/components/layout/MainLayout'
import AdminProtectedRoute from '@/admin/components/AdminProtectedRoute'
import AdminLayout from '@/admin/layout/AdminLayout'
import AdminLoginPage from '@/admin/pages/AdminLoginPage'
import AdminApplicationsPage from '@/admin/pages/AdminApplicationsPage'
import AdminApplicationDetailPage from '@/admin/pages/AdminApplicationDetailPage'
import AdminAuditLogPage from '@/admin/pages/AdminAuditLogPage'
import AdminDashboardPage from '@/admin/pages/AdminDashboardPage'
import AdminHousingStockPage from '@/admin/pages/AdminHousingStockPage'
import AdminLotteryEventsPage from '@/admin/pages/AdminLotteryEventsPage'
import AdminResultsPage from '@/admin/pages/AdminResultsPage'
import LotteryVerificationPage from '@/pages/LotteryVerificationPage'

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 1, staleTime: 1000 * 60 * 5, gcTime: 1000 * 60 * 30 } },
})

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/admin/login" element={<AdminLoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/lottery-events/:eventId/verification" element={<LotteryVerificationPage />} />
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route element={<AdminProtectedRoute />}>
            <Route element={<AdminLayout />}>
              <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
              <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
              <Route path="/admin/applications" element={<AdminApplicationsPage />} />
              <Route path="/admin/applications/:id" element={<AdminApplicationDetailPage />} />
              <Route path="/admin/lottery-events" element={<AdminLotteryEventsPage />} />
              <Route path="/admin/results" element={<AdminResultsPage />} />
              <Route path="/admin/housing-stock" element={<AdminHousingStockPage />} />
              <Route path="/admin/audit-log" element={<AdminAuditLogPage />} />
            </Route>
          </Route>
          <Route element={<ProtectedRoute />}>
            <Route element={<MainLayout />}>
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/projects" element={<ProjectsPage />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/progress" element={<UserProgressPage />} />
              <Route path="/priority-score" element={<UserPriorityScorePage />} />
              <Route path="/lottery-ticket" element={<UserLotteryTicketPage />} />
              <Route path="/lottery-waiting-room" element={<Navigate to="/lottery-room" replace />} />
              <Route path="/lottery-room" element={<UserLotteryRoomPage />} />
              <Route path="/results-audit" element={<UserResultsAuditPage />} />
            </Route>
          </Route>
        </Routes>
      </BrowserRouter>
      <Toaster richColors position="bottom-right" />
    </QueryClientProvider>
  )
}

export default App
