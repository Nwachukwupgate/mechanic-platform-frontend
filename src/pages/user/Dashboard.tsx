import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { bookingsAPI } from '../../services/api'
import { Car, MapPin, Clock } from 'lucide-react'
import LoadingSpinner from '../../components/LoadingSpinner'
import Avatar from '../../components/Avatar'
import RepairTypeIcon from '../../components/RepairTypeIcon'
import { SectionLabel } from '../../components/SectionLabel'

export default function UserDashboard() {
  const { user } = useAuth()
  const [bookings, setBookings] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const displayName = user?.firstName || user?.email?.split('@')[0] || 'there'

  useEffect(() => {
    bookingsAPI
      .getAll()
      .then((res) => {
        setBookings(res.data)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner variant="logo" size="lg" />
      </div>
    )
  }

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Welcome + CTA */}
      <div className="card p-5 sm:p-6 bg-gradient-to-br from-primary-50/80 via-white to-slate-50/50 border-primary-100/50">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <Avatar
              name={`${user?.firstName ?? ''} ${user?.lastName ?? ''}`.trim()}
              fallbackLetter={displayName[0]}
              size="lg"
              className="shrink-0"
              ring
            />
            <div className="min-w-0">
              <SectionLabel className="mb-1">Your dashboard</SectionLabel>
              <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-slate-900 tracking-tight">Hi, {displayName}</h1>
              <p className="text-sm text-slate-600 mt-0.5">Here&apos;s your booking overview.</p>
            </div>
          </div>
          <Link
            to="/user/find-mechanics"
            className="btn-gradient px-6 py-3 text-sm shrink-0 justify-center sm:w-auto w-full"
          >
            Find mechanics
          </Link>
        </div>
      </div>

      <div>
        <SectionLabel className="mb-3 sm:mb-4">At a glance</SectionLabel>
      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
        <div className="card p-5 sm:p-6 border-t-4 border-t-amber-400/90">
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="text-slate-500 text-sm font-medium">Active Bookings</p>
              <p className="text-2xl sm:text-3xl font-bold tabular-nums text-slate-800 mt-0.5">
                {bookings.filter((b) => ['REQUESTED', 'ACCEPTED', 'IN_PROGRESS'].includes(b.status)).length}
              </p>
            </div>
            <Clock className="h-9 w-9 text-primary-500/80 shrink-0" aria-hidden />
          </div>
        </div>
        <div className="card p-5 sm:p-6 border-t-4 border-t-primary-500">
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="text-slate-500 text-sm font-medium">Total Bookings</p>
              <p className="text-2xl sm:text-3xl font-bold tabular-nums text-slate-800 mt-0.5">{bookings.length}</p>
            </div>
            <Car className="h-9 w-9 text-accent-500/80 shrink-0" aria-hidden />
          </div>
        </div>
        <div className="card p-5 sm:p-6 border-t-4 border-t-emerald-500">
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="text-slate-500 text-sm font-medium">Completed</p>
              <p className="text-2xl sm:text-3xl font-bold tabular-nums text-slate-800 mt-0.5">
                {bookings.filter((b) => ['DONE', 'PAID', 'DELIVERED'].includes(b.status)).length}
              </p>
            </div>
            <MapPin className="h-9 w-9 text-primary-400/80 shrink-0" aria-hidden />
          </div>
        </div>
      </div>
      </div>

      {/* Recent Bookings */}
      <div className="card overflow-hidden p-0">
        <div className="px-4 sm:px-6 py-4 border-b border-slate-100/80 bg-slate-50/40">
          <SectionLabel className="mb-1">Activity</SectionLabel>
          <h2 className="text-lg sm:text-xl font-semibold text-slate-900">Recent bookings</h2>
        </div>
        <div className="divide-y divide-slate-100">
          {bookings.slice(0, 5).map((booking) => {
            const mechanic = booking.mechanic
            const mechanicName = mechanic?.profile?.ownerFullName || mechanic?.companyName || 'Mechanic'
            return (
              <Link
                key={booking.id}
                to={`/user/bookings/${booking.id}`}
                className="flex items-center gap-4 px-4 sm:px-6 py-4 active:bg-slate-50 hover:bg-slate-50/80 transition-colors"
              >
                <RepairTypeIcon fault={booking.fault} size="md" />
                <Avatar
                  src={mechanic?.profile?.avatar}
                  name={mechanicName}
                  size="md"
                  className="shrink-0"
                />
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-slate-800 truncate">
                    {booking.vehicle?.brand} {booking.vehicle?.model}
                  </p>
                  <p className="text-sm text-slate-500 truncate">{booking.fault?.name}</p>
                </div>
                <span
                  className={`shrink-0 px-2.5 py-1 text-xs font-medium rounded-lg ${
                    booking.status === 'REQUESTED'
                      ? 'bg-amber-100 text-amber-800'
                      : booking.status === 'ACCEPTED'
                      ? 'bg-primary-100 text-primary-800'
                      : booking.status === 'IN_PROGRESS'
                      ? 'bg-violet-100 text-violet-800'
                      : 'bg-accent-100 text-accent-800'
                  }`}
                >
                  {booking.status.replace('_', ' ')}
                </span>
              </Link>
            )
          })}
          {bookings.length === 0 && (
            <div className="px-4 sm:px-6 py-12 text-center text-slate-500">
              No bookings yet. Start by finding a mechanic!
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
