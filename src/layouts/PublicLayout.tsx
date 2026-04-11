import { useState } from 'react'
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { Menu, X } from 'lucide-react'
import ChatSupport from '../components/ChatSupport'

export default function PublicLayout() {
  const { isAuthenticated, user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const isActive = (path: string) => location.pathname === path || location.pathname.startsWith(path + '/')

  const handleLogout = () => {
    logout()
    navigate('/')
    setMobileMenuOpen(false)
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#f2f7f4]">
      <nav className="sticky top-0 z-40 border-b border-slate-200/60 bg-white/80 backdrop-blur-md supports-[backdrop-filter]:bg-white/70 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-20">
            <div className="flex items-center">
              <Link
                to="/"
                className="flex items-center gap-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                <img src="/logo.png" alt="Denicksen Auto" className="h-20 w-20 rounded-xl object-cover" />
                <span className="text-lg font-semibold text-slate-800">Denicksen Auto</span>
              </Link>
            </div>

            {/* Desktop */}
            <div className="hidden md:flex items-center gap-2">
              <Link
                to="/for-users"
                className={`px-4 py-2 text-sm font-medium rounded-xl transition-colors ${
                  isActive('/for-users') ? 'bg-primary-100 text-primary-700 ring-2 ring-primary-200' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                For Users
              </Link>
              <Link
                to="/for-mechanics"
                className={`px-4 py-2 text-sm font-medium rounded-xl transition-colors ${
                  isActive('/for-mechanics') ? 'bg-primary-100 text-primary-700 ring-2 ring-primary-200' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                For Mechanics
              </Link>
              {isAuthenticated ? (
                <>
                  <Link
                    to={user?.role === 'USER' ? '/user' : '/mechanic'}
                    className="px-4 py-2 text-sm font-medium text-primary-600 bg-primary-50 rounded-xl hover:bg-primary-100"
                  >
                    Dashboard
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-xl"
                  >
                    Log out
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-xl"
                  >
                    Log in
                  </Link>
                  <Link to="/register" className="btn-gradient px-4 py-2.5 text-sm">
                    Sign up
                  </Link>
                </>
              )}
            </div>

            {/* Mobile hamburger */}
            <div className="md:hidden flex items-center">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2.5 text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
                aria-label="Toggle menu"
              >
                {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>

          {/* Mobile menu */}
          {mobileMenuOpen && (
            <div className="md:hidden border-t border-slate-100 bg-white py-3">
              <div className="px-2 space-y-0.5">
                <Link
                  to="/for-users"
                  className={`block px-4 py-3 rounded-xl font-medium ${
                    isActive('/for-users') ? 'bg-primary-50 text-primary-700' : 'text-slate-700 hover:bg-slate-50'
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  For Users
                </Link>
                <Link
                  to="/for-mechanics"
                  className={`block px-4 py-3 rounded-xl font-medium ${
                    isActive('/for-mechanics') ? 'bg-primary-50 text-primary-700' : 'text-slate-700 hover:bg-slate-50'
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  For Mechanics
                </Link>
                {isAuthenticated ? (
                  <>
                    <Link
                      to={user?.role === 'USER' ? '/user' : '/mechanic'}
                      className="block px-4 py-3 text-primary-600 bg-primary-50 rounded-xl font-medium"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Dashboard
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-3 text-slate-700 hover:bg-slate-50 rounded-xl font-medium"
                    >
                      Log out
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      to="/login"
                      className="block px-4 py-3 text-slate-700 hover:bg-slate-50 rounded-xl font-medium"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Log in
                    </Link>
                    <div className="px-2 pt-2">
                      <Link
                        to="/register"
                        className="btn-gradient w-full justify-center"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        Sign up
                      </Link>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </nav>
      <main className="flex-grow">
        <Outlet />
      </main>
      <footer className="mt-auto border-t border-slate-200/80 bg-gradient-to-b from-slate-100 to-slate-200/90 text-slate-800 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-8">
            <div className="flex items-center gap-2">
              <Link to="/" className="flex items-center gap-2">
                <img src="/logo.png" alt="Denicksen Auto" className="h-12 w-12 rounded-xl object-cover ring-2 ring-white/80 shadow-sm" />
                <span className="font-bold text-slate-900">Denicksen Auto</span>
              </Link>
            </div>
            <nav className="flex flex-wrap gap-6 text-sm font-medium" aria-label="Footer">
              <Link to="/for-users" className="text-slate-700 hover:text-slate-900 transition-colors">For Users</Link>
              <Link to="/for-mechanics" className="text-slate-700 hover:text-slate-900 transition-colors">For Mechanics</Link>
              <Link to="/about" className="text-slate-700 hover:text-slate-900 transition-colors">About</Link>
              <Link to="/faq" className="text-slate-700 hover:text-slate-900 transition-colors">FAQ</Link>
              <Link to="/privacy" className="text-slate-700 hover:text-slate-900 transition-colors">Privacy</Link>
            </nav>
          </div>
          <div className="mt-8 pt-8 border-t border-slate-300/80">
            <p className="text-sm text-slate-600">
              &copy; {new Date().getFullYear()} Mechanic Platform. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
      <ChatSupport />
    </div>
  )
}
