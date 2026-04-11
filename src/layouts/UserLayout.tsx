import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { Home, User, Car, MapPin, History, Wallet, LogOut } from 'lucide-react'
import { MapBackground } from '../components/MapBackground'
import Avatar from '../components/Avatar'

export default function UserLayout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const displayName = user?.firstName || user?.email?.split('@')[0] || 'User'

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  const isActive = (path: string) => location.pathname === path || location.pathname.startsWith(path + '/')

  const navItems = [
    { path: '/user', icon: Home, label: 'Home' },
    { path: '/user/profile', icon: User, label: 'Profile' },
    { path: '/user/vehicles', icon: Car, label: 'Vehicles' },
    { path: '/user/find-mechanics', icon: MapPin, label: 'Find' },
    { path: '/user/history', icon: History, label: 'History' },
    { path: '/user/wallet', icon: Wallet, label: 'Wallet' },
  ]

  return (
    <MapBackground variant="light" className="min-h-screen">
    <div className="min-h-screen pb-28 md:pb-0">
      {/* Mobile: top bar with greeting + avatar */}
      <header className="md:hidden sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200/80 shadow-sm">
        <div className="flex items-center justify-between gap-3 h-14 px-4">
          <Link to="/user" className="flex items-center gap-2.5 min-w-0">
            <img src="/logo.png" alt="" className="h-10 w-10 rounded-xl object-cover shrink-0 ring-2 ring-slate-100 shadow-sm" />
            <span className="font-bold text-slate-900 truncate">Denicksen Auto</span>
          </Link>
          <Link
            to="/user/profile"
            className="flex items-center gap-2.5 min-w-0 shrink-0 py-1.5 pr-1 rounded-xl active:bg-slate-100"
          >
            <span className="text-sm text-slate-600 truncate max-w-[120px]">Hi, {displayName}</span>
            <Avatar name={`${user?.firstName ?? ''} ${user?.lastName ?? ''}`.trim()} fallbackLetter={displayName[0]} size="sm" className="shrink-0" />
          </Link>
        </div>
      </header>
      {/* Desktop Top Navbar */}
      <nav className="hidden md:block bg-white/90 backdrop-blur-md shadow-card border-b border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center gap-8">
              <Link to="/user" className="flex items-center gap-2.5">
                <img src="/logo.png" alt="Mechanic Platform" className="h-12 w-12 rounded-xl object-cover ring-2 ring-slate-100 shadow-sm" />
                <span className="font-bold text-slate-900">Mechanic Platform</span>
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
                          ? 'bg-primary-100 text-primary-700 ring-2 ring-primary-200'
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
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-md border-t border-slate-200/80 shadow-[0_-4px_20px_rgba(0,0,0,0.06)] z-50 pb-safe">
        <div className="flex items-stretch justify-around h-16 px-2 gap-0.5">
          {navItems.map((item) => {
            const Icon = item.icon
            const active = isActive(item.path)
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex flex-col items-center justify-center flex-1 min-w-0 gap-1 py-3 rounded-xl transition-colors touch-manipulation ${
                  active
                    ? 'text-primary-600 bg-primary-50'
                    : 'text-slate-500 active:bg-slate-100'
                }`}
              >
                <Icon className="h-5 w-5 sm:h-6 sm:w-6 shrink-0" />
                <span className="text-[10px] sm:text-xs font-medium truncate max-w-full">{item.label}</span>
              </Link>
            )
          })}
          <button
            type="button"
            onClick={handleLogout}
            className="flex flex-col items-center justify-center flex-1 min-w-0 gap-1 py-3 text-slate-500 active:bg-slate-100 rounded-xl touch-manipulation"
          >
            <LogOut className="h-5 w-5 sm:h-6 sm:w-6 shrink-0" />
            <span className="text-[10px] sm:text-xs font-medium">Log out</span>
          </button>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-6 md:py-8">
        <Outlet />
      </main>
    </div>
    </MapBackground>
  )
}
