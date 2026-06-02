import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'

// Public pages
import Home from '../pages/public/Home'
import ForUsers from '../pages/public/ForUsers'
import ForMechanics from '../pages/public/ForMechanics'
import About from '../pages/public/About'
import FAQ from '../pages/public/FAQ'
import PrivacyPolicy from '../pages/public/PrivacyPolicy'
import NotFound from '../pages/public/NotFound'

// Auth pages
import Login from '../pages/auth/Login'
import Register from '../pages/auth/Register'
import VerifyEmail from '../pages/auth/VerifyEmail'
import ForgotPassword from '../pages/auth/ForgotPassword'
import ResetPassword from '../pages/auth/ResetPassword'

// User pages
import UserDashboard from '../pages/user/Dashboard'
import UserProfile from '../pages/user/Profile'
import UserVehicles from '../pages/user/Vehicles'
import FindMechanics from '../pages/user/FindMechanics'
import BookingDetail from '../pages/user/BookingDetail'
import BookingReceipt from '../pages/user/BookingReceipt'
import JobHistory from '../pages/user/JobHistory'
import UserWallet from '../pages/user/Wallet'

// Mechanic pages
import MechanicDashboard from '../pages/mechanic/Dashboard'
import MechanicProfile from '../pages/mechanic/Profile'
import MechanicBookings from '../pages/mechanic/Bookings'
import MechanicBookingDetail from '../pages/mechanic/BookingDetail'
import MechanicJobHistory from '../pages/mechanic/JobHistory'
import MechanicWallet from '../pages/mechanic/Wallet'
import MechanicTransactionDetail from '../pages/mechanic/TransactionDetail'

// Admin
import AdminLayout from '../layouts/AdminLayout'
import AdminLogin from '../pages/admin/AdminLogin'
import AdminDashboard from '../pages/admin/Dashboard'
import AdminBookings from '../pages/admin/Bookings'
import AdminBookingDetail from '../pages/admin/BookingDetail'
import AdminUsers from '../pages/admin/Users'
import AdminUserDetail from '../pages/admin/UserDetail'
import AdminMechanics from '../pages/admin/Mechanics'
import AdminMechanicDetail from '../pages/admin/MechanicDetail'
import AdminTransactions from '../pages/admin/Transactions'
import AdminTransactionDetail from '../pages/admin/TransactionDetail'
import AdminQuotes from '../pages/admin/Quotes'
import AdminReports from '../pages/admin/Reports'
import AdminRatings from '../pages/admin/Ratings'
import AdminNotifications from '../pages/admin/Notifications'
import AdminAuditLog from '../pages/admin/AuditLog'
import AdminPayouts from '../pages/admin/Payouts'
import AdminAdmins from '../pages/admin/Admins'
import AdminWebhooks from '../pages/admin/Webhooks'

// Layouts
import PublicLayout from '../layouts/PublicLayout'
import UserLayout from '../layouts/UserLayout'
import MechanicLayout from '../layouts/MechanicLayout'

function ProtectedRoute({ children, requiredRole }: { children: React.ReactNode; requiredRole?: 'USER' | 'MECHANIC' | 'ADMIN' }) {
  // Use store directly to ensure we get the latest state
  const user = useAuthStore((state) => state.user)
  const token = useAuthStore((state) => state.token)

  if (!token || !user) {
    return <Navigate to="/login" replace />
  }

  if (requiredRole && user.role !== requiredRole) {
    return <Navigate to="/" replace />
  }

  return <>{children}</>
}

function LoginRedirect({ children }: { children: React.ReactNode }) {
  const user = useAuthStore((state) => state.user)
  const token = useAuthStore((state) => state.token)

  if (token && user) {
    const dest = user.role === 'ADMIN' ? '/admin' : user.role === 'USER' ? '/user' : '/mechanic'
    return <Navigate to={dest} replace />
  }

  return <>{children}</>
}

export function AppRoutes() {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<PublicLayout />}>
        <Route index element={<Home />} />
        <Route path="for-users" element={<ForUsers />} />
        <Route path="for-mechanics" element={<ForMechanics />} />
        <Route path="about" element={<About />} />
        <Route path="faq" element={<FAQ />} />
        <Route path="privacy" element={<PrivacyPolicy />} />
        <Route
          path="login"
          element={
            <LoginRedirect>
              <Login />
            </LoginRedirect>
          }
        />
        <Route path="register" element={<Register />} />
        <Route path="verify-email" element={<VerifyEmail />} />
        <Route path="forgot-password" element={<ForgotPassword />} />
        <Route path="reset-password" element={<ResetPassword />} />
      </Route>

      {/* User routes */}
      <Route
        path="/user"
        element={
          <ProtectedRoute requiredRole="USER">
            <UserLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<UserDashboard />} />
        <Route path="profile" element={<UserProfile />} />
        <Route path="vehicles" element={<UserVehicles />} />
        <Route path="find-mechanics" element={<FindMechanics />} />
        <Route path="bookings/:id" element={<BookingDetail />} />
        <Route path="bookings/:id/receipt" element={<BookingReceipt />} />
        <Route path="history" element={<JobHistory />} />
        <Route path="wallet" element={<UserWallet />} />
      </Route>

      {/* Mechanic routes */}
      <Route
        path="/mechanic"
        element={
          <ProtectedRoute requiredRole="MECHANIC">
            <MechanicLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<MechanicDashboard />} />
        <Route path="profile" element={<MechanicProfile />} />
        <Route path="bookings" element={<MechanicBookings />} />
        <Route path="bookings/:id" element={<MechanicBookingDetail />} />
        <Route path="history" element={<MechanicJobHistory />} />
        <Route path="wallet" element={<MechanicWallet />} />
        <Route path="wallet/transactions/:id" element={<MechanicTransactionDetail />} />
      </Route>

      <Route path="/admin/login" element={<AdminLogin />} />
      <Route
        path="/admin"
        element={
          <ProtectedRoute requiredRole="ADMIN">
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<AdminDashboard />} />
        <Route path="bookings" element={<AdminBookings />} />
        <Route path="bookings/:id" element={<AdminBookingDetail />} />
        <Route path="users" element={<AdminUsers />} />
        <Route path="users/:id" element={<AdminUserDetail />} />
        <Route path="mechanics" element={<AdminMechanics />} />
        <Route path="mechanics/:id" element={<AdminMechanicDetail />} />
        <Route path="transactions" element={<AdminTransactions />} />
        <Route path="transactions/:id" element={<AdminTransactionDetail />} />
        <Route path="webhooks" element={<AdminWebhooks />} />
        <Route path="quotes" element={<AdminQuotes />} />
        <Route path="reports" element={<AdminReports />} />
        <Route path="ratings" element={<AdminRatings />} />
        <Route path="notifications" element={<AdminNotifications />} />
        <Route path="audit" element={<AdminAuditLog />} />
        <Route path="payouts" element={<AdminPayouts />} />
        <Route path="admins" element={<AdminAdmins />} />
      </Route>

      {/* 404 — must be last; uses public layout (nav + footer) */}
      <Route path="*" element={<PublicLayout />}>
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  )
}
