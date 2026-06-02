import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard,
  Users,
  Wrench,
  Calendar,
  CreditCard,
  Flag,
  ScrollText,
  Banknote,
  Star,
  Bell,
  Tag,
  Shield,
  Webhook,
  LogOut,
} from 'lucide-react'
import { useAuthStore } from '../store/authStore'

const nav = [
  { path: '/admin', icon: LayoutDashboard, label: 'Overview', end: true },
  { path: '/admin/bookings', icon: Calendar, label: 'Bookings' },
  { path: '/admin/quotes', icon: Tag, label: 'Quotes' },
  { path: '/admin/transactions', icon: CreditCard, label: 'Payments' },
  { path: '/admin/webhooks', icon: Webhook, label: 'Webhooks' },
  { path: '/admin/users', icon: Users, label: 'Users' },
  { path: '/admin/mechanics', icon: Wrench, label: 'Mechanics' },
  { path: '/admin/reports', icon: Flag, label: 'Reports' },
  { path: '/admin/ratings', icon: Star, label: 'Ratings' },
  { path: '/admin/notifications', icon: Bell, label: 'Notifications' },
  { path: '/admin/payouts', icon: Banknote, label: 'Payouts' },
  { path: '/admin/audit', icon: ScrollText, label: 'Audit log' },
  { path: '/admin/admins', icon: Shield, label: 'Admins' },
]

export default function AdminLayout() {
  const location = useLocation()
  const navigate = useNavigate()
  const user = useAuthStore((s) => s.user)
  const logout = useAuthStore((s) => s.logout)

  const isActive = (path: string, end?: boolean) =>
    end ? location.pathname === path : location.pathname === path || location.pathname.startsWith(`${path}/`)

  return (
    <div className="min-h-screen bg-slate-100 flex">
      <aside className="hidden lg:flex w-64 flex-col bg-slate-900 text-slate-200 shrink-0">
        <div className="px-5 py-5 border-b border-slate-800">
          <p className="text-xs uppercase tracking-widest text-slate-500">Operations</p>
          <p className="font-bold text-white text-lg mt-1">Admin Console</p>
          <p className="text-xs text-slate-400 mt-1 truncate">{user?.email}</p>
        </div>
        <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
          {nav.map(({ path, icon: Icon, label, end }) => {
            const active = isActive(path, end)
            return (
              <Link
                key={path}
                to={path}
                className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  active ? 'bg-violet-600 text-white' : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <Icon className="h-4 w-4 shrink-0" />
                {label}
              </Link>
            )
          })}
        </nav>
        <button
          type="button"
          onClick={() => {
            logout()
            navigate('/admin/login')
          }}
          className="m-3 flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm text-slate-400 hover:bg-slate-800 hover:text-white"
        >
          <LogOut className="h-4 w-4" /> Sign out
        </button>
      </aside>

      <div className="flex-1 min-w-0">
        <header className="lg:hidden sticky top-0 z-30 bg-slate-900 text-white px-4 py-3 flex items-center justify-between">
          <span className="font-semibold">Admin Console</span>
          <button type="button" onClick={() => { logout(); navigate('/admin/login') }} className="text-sm text-slate-300">
            Sign out
          </button>
        </header>
        <div className="lg:hidden overflow-x-auto border-b border-slate-200 bg-white px-2 py-2 flex gap-1">
          {nav.map(({ path, label, end }) => (
            <Link
              key={path}
              to={path}
              className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-medium ${
                isActive(path, end) ? 'bg-violet-600 text-white' : 'bg-slate-100 text-slate-700'
              }`}
            >
              {label}
            </Link>
          ))}
        </div>
        <main className="p-4 sm:p-6 lg:p-8 max-w-[1400px]">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
