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
    { path: '/mechanic', icon: Home, label: 'Home' },
    { path: '/mechanic/profile', icon: User, label: 'Profile' },
    { path: '/mechanic/bookings', icon: Briefcase, label: 'Bookings' },
    { path: '/mechanic/history', icon: History, label: 'History' },
  ]

  return (
    <div className="min-h-screen bg-slate-50 pb-24 md:pb-0">
      {/* Desktop Top Navbar */}
      <nav className="hidden md:block bg-white shadow-card border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center gap-8">
              <Link to="/mechanic" className="flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary-600 text-white">
                  <Wrench className="h-5 w-5" />
                </div>
                <span className="font-semibold text-slate-800">Mechanic Platform</span>
              </Link>
              <div className="flex gap-1">
                {navItems.map((item) => {
                  const Icon = item.icon
                  const active = isActive(item.path)
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                        active
                          ? 'bg-primary-50 text-primary-700'
                          : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
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
              className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors"
            >
              Log out
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Bottom Navbar — icons with text labels */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 shadow-[0_-4px_20px_rgba(0,0,0,0.06)] z-50 pb-safe">
        <div className="flex items-stretch justify-around h-20 px-1">
          {navItems.map((item) => {
            const Icon = item.icon
            const active = isActive(item.path)
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex flex-col items-center justify-center flex-1 min-w-0 gap-1 py-2 ${
                  active ? 'text-primary-600' : 'text-slate-500'
                }`}
              >
                <Icon className={`h-6 w-6 shrink-0 ${active ? 'text-primary-600' : ''}`} />
                <span className="text-[10px] font-medium truncate max-w-full px-0.5">{item.label}</span>
              </Link>
            )
          })}
          <button
            type="button"
            onClick={handleLogout}
            className="flex flex-col items-center justify-center flex-1 min-w-0 gap-1 py-2 text-slate-500 active:text-slate-700"
          >
            <LogOut className="h-6 w-6 shrink-0" />
            <span className="text-[10px] font-medium">Log out</span>
          </button>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
        <Outlet />
      </main>
    </div>
  )
}
