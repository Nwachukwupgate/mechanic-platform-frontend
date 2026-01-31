import { useState } from 'react'
import { Outlet, Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { Wrench, Menu, X } from 'lucide-react'

export default function PublicLayout() {
  const { isAuthenticated, user, logout } = useAuth()
  const navigate = useNavigate()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const handleLogout = () => {
    logout()
    navigate('/')
    setMobileMenuOpen(false)
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <nav className="bg-white shadow-card border-b border-slate-100 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link
                to="/"
                className="flex items-center gap-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary-600 text-white">
                  <Wrench className="h-5 w-5" />
                </div>
                <span className="text-lg font-semibold text-slate-800">Mechanic Platform</span>
              </Link>
            </div>

            {/* Desktop */}
            <div className="hidden md:flex items-center gap-2">
              <Link
                to="/for-users"
                className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors"
              >
                For Users
              </Link>
              <Link
                to="/for-mechanics"
                className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors"
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
                  <Link
                    to="/register"
                    className="px-4 py-2.5 text-sm font-medium text-white bg-primary-600 rounded-xl hover:bg-primary-700 shadow-soft"
                  >
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
                  className="block px-4 py-3 text-slate-700 hover:bg-slate-50 rounded-xl font-medium"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  For Users
                </Link>
                <Link
                  to="/for-mechanics"
                  className="block px-4 py-3 text-slate-700 hover:bg-slate-50 rounded-xl font-medium"
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
                    <Link
                      to="/register"
                      className="block px-4 py-3 text-center text-white bg-primary-600 rounded-xl font-medium mx-2 mt-2"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Sign up
                    </Link>
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
      <footer className="bg-slate-800 text-slate-200 py-10 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-600 text-white">
                <Wrench className="h-4 w-4" />
              </div>
              <span className="font-semibold text-white">Mechanic Platform</span>
            </div>
            <p className="text-sm text-slate-400">
              &copy; {new Date().getFullYear()} Mechanic Platform. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
