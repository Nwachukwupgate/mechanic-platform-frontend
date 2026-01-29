import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { Wrench, Home, User, Briefcase, History, LogOut } from 'lucide-react'

export default function MechanicLayout() {
  const { logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  const isActive = (path: string) => location.pathname === path || location.pathname.startsWith(path + '/')

  const navItems = [
    { path: '/mechanic', icon: Home, label: 'Dashboard' },
    { path: '/mechanic/profile', icon: User, label: 'Profile' },
    { path: '/mechanic/bookings', icon: Briefcase, label: 'Bookings' },
    { path: '/mechanic/history', icon: History, label: 'History' },
  ]

  return (
    <div className="min-h-screen bg-gray-50 pb-20 md:pb-0">
      {/* Desktop Top Navbar */}
      <nav className="hidden md:block bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center space-x-8">
              <Link to="/mechanic" className="flex items-center space-x-2">
                <Wrench className="h-6 w-6 text-blue-600" />
                <span className="font-semibold">Mechanic Platform</span>
              </Link>
              <div className="flex space-x-4">
                {navItems.map((item) => {
                  const Icon = item.icon
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      className={`flex items-center space-x-1 ${
                        isActive(item.path) ? 'text-blue-600 font-medium' : 'text-gray-700 hover:text-blue-600'
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      <span>{item.label}</span>
                    </Link>
                  )
                })}
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
            >
              Logout
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Bottom Navbar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg z-50">
        <div className="flex justify-around items-center h-16">
          {navItems.map((item) => {
            const Icon = item.icon
            const active = isActive(item.path)
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex flex-col items-center justify-center flex-1 h-full ${
                  active ? 'text-blue-600' : 'text-gray-600'
                }`}
              >
                <Icon className={`h-6 w-6 ${active ? 'text-blue-600' : ''}`} />
              </Link>
            )
          })}
          <button
            onClick={handleLogout}
            className="flex flex-col items-center justify-center flex-1 h-full text-gray-600"
          >
            <LogOut className="h-6 w-6" />
          </button>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>
    </div>
  )
}
