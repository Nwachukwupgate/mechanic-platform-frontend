import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'

// Public pages
import Home from '../pages/public/Home'
import ForUsers from '../pages/public/ForUsers'
import ForMechanics from '../pages/public/ForMechanics'

// Auth pages
import Login from '../pages/auth/Login'
import Register from '../pages/auth/Register'
import VerifyEmail from '../pages/auth/VerifyEmail'

// User pages
import UserDashboard from '../pages/user/Dashboard'
import UserProfile from '../pages/user/Profile'
import UserVehicles from '../pages/user/Vehicles'
import FindMechanics from '../pages/user/FindMechanics'
import BookingDetail from '../pages/user/BookingDetail'
import JobHistory from '../pages/user/JobHistory'

// Mechanic pages
import MechanicDashboard from '../pages/mechanic/Dashboard'
import MechanicProfile from '../pages/mechanic/Profile'
import MechanicBookings from '../pages/mechanic/Bookings'
import MechanicBookingDetail from '../pages/mechanic/BookingDetail'
import MechanicJobHistory from '../pages/mechanic/JobHistory'

// Layouts
import PublicLayout from '../layouts/PublicLayout'
import UserLayout from '../layouts/UserLayout'
import MechanicLayout from '../layouts/MechanicLayout'

function ProtectedRoute({ children, requiredRole }: { children: React.ReactNode; requiredRole?: 'USER' | 'MECHANIC' }) {
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
    // Redirect to appropriate dashboard if already logged in
    return <Navigate to={user.role === 'USER' ? '/user' : '/mechanic'} replace />
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
        <Route path="history" element={<JobHistory />} />
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
      </Route>

      {/* Catch all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
