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
    <div className="min-h-screen flex flex-col">
      <nav className="bg-white shadow-sm border-b relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link to="/" className="flex items-center space-x-2" onClick={() => setMobileMenuOpen(false)}>
                <Wrench className="h-8 w-8 text-blue-600" />
                <span className="text-xl font-bold text-gray-900">Mechanic Platform</span>
              </Link>
            </div>
            
            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-4">
              <Link to="/for-users" className="text-gray-700 hover:text-blue-600">
                For Users
              </Link>
              <Link to="/for-mechanics" className="text-gray-700 hover:text-blue-600">
                For Mechanics
              </Link>
              {isAuthenticated ? (
                <>
                  <Link
                    to={user?.role === 'USER' ? '/user' : '/mechanic'}
                    className="text-gray-700 hover:text-blue-600"
                  >
                    Dashboard
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="text-gray-700 hover:text-blue-600"
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
                  >
                    Sign Up
                  </Link>
                </>
              )}
            </div>

            {/* Mobile Hamburger Button */}
            <div className="md:hidden flex items-center">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 text-gray-700 hover:text-blue-600 focus:outline-none"
                aria-label="Toggle menu"
              >
                {mobileMenuOpen ? (
                  <X className="h-6 w-6" />
                ) : (
                  <Menu className="h-6 w-6" />
                )}
              </button>
            </div>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden border-t bg-white">
              <div className="px-2 pt-2 pb-3 space-y-1">
                <Link
                  to="/for-users"
                  className="block px-3 py-2 text-gray-700 hover:bg-gray-100 hover:text-blue-600 rounded-md"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  For Users
                </Link>
                <Link
                  to="/for-mechanics"
                  className="block px-3 py-2 text-gray-700 hover:bg-gray-100 hover:text-blue-600 rounded-md"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  For Mechanics
                </Link>
                {isAuthenticated ? (
                  <>
                    <Link
                      to={user?.role === 'USER' ? '/user' : '/mechanic'}
                      className="block px-3 py-2 text-gray-700 hover:bg-gray-100 hover:text-blue-600 rounded-md"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Dashboard
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-3 py-2 text-gray-700 hover:bg-gray-100 hover:text-blue-600 rounded-md"
                    >
                      Logout
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      to="/login"
                      className="block px-3 py-2 text-gray-700 hover:bg-gray-100 hover:text-blue-600 rounded-md"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Login
                    </Link>
                    <Link
                      to="/register"
                      className="block px-3 py-2 text-white bg-blue-600 hover:bg-blue-700 rounded-md text-center"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Sign Up
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
      <footer className="bg-gray-800 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p>&copy; 2026 Mechanic Platform. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
