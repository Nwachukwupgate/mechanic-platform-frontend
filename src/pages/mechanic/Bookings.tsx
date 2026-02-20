import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { bookingsAPI } from '../../services/api'
import { useAuthStore } from '../../store/authStore'
import LoadingSpinner from '../../components/LoadingSpinner'
import RepairTypeIcon from '../../components/RepairTypeIcon'

export default function MechanicBookings() {
  const [bookings, setBookings] = useState<any[]>([])
  const [filter, setFilter] = useState<string>('ALL')
  const [loading, setLoading] = useState(true)
  const token = useAuthStore((state) => state.token)

  useEffect(() => {
    // Wait for token to be available before making request
    if (token) {
      loadBookings()
    } else {
      setLoading(false)
    }
  }, [token])

  const loadBookings = () => {
    bookingsAPI
      .getAll()
      .then((res) => {
        console.log("bookings", res.data)
        setBookings(res.data)
        setLoading(false)
      })
      .catch((err) => {
        console.error('Error loading bookings:', err)
        setLoading(false)
      })
  }

  const filteredBookings =
    filter === 'ALL'
      ? bookings
      : bookings.filter((b) => b.status === filter)

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner variant="logo" size="lg" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl sm:text-3xl font-bold text-slate-800">Bookings</h1>

      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setFilter('ALL')}
          className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${
            filter === 'ALL' ? 'bg-primary-600 text-white' : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
          }`}
        >
          All
        </button>
        <button
          onClick={() => setFilter('REQUESTED')}
          className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${
            filter === 'REQUESTED' ? 'bg-primary-600 text-white' : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
          }`}
        >
          Pending
        </button>
        <button
          onClick={() => setFilter('ACCEPTED')}
          className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${
            filter === 'ACCEPTED' ? 'bg-primary-600 text-white' : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
          }`}
        >
          Accepted
        </button>
        <button
          onClick={() => setFilter('IN_PROGRESS')}
          className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${
            filter === 'IN_PROGRESS' ? 'bg-primary-600 text-white' : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
          }`}
        >
          In Progress
        </button>
      </div>

      <div className="space-y-4">
        {filteredBookings.map((booking) => {
          const customerName = [booking.user?.firstName, booking.user?.lastName].filter(Boolean).join(' ') || 'Customer'
          return (
            <Link
              key={booking.id}
              to={`/mechanic/bookings/${booking.id}`}
              className="block rounded-xl border border-slate-200 bg-white p-4 sm:p-5 shadow-sm hover:border-slate-300 hover:bg-slate-50/50 transition-colors active:bg-slate-50"
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-start gap-3 min-w-0 flex-1">
                  <RepairTypeIcon fault={booking.fault} size="md" />
                  <div className="min-w-0 space-y-1">
                    <p className="font-semibold text-slate-800">
                      {booking.vehicle?.brand} {booking.vehicle?.model}
                    </p>
                    <p className="text-sm text-slate-600">{booking.fault?.name}</p>
                    <p className="text-sm text-slate-500">Customer: {customerName}</p>
                    {booking.estimatedCost && (
                      <p className="text-sm font-medium text-slate-700">Est. Cost: ₦{Number(booking.estimatedCost).toLocaleString()}</p>
                    )}
                  </div>
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
              </div>
            </Link>
          )
        })}
        {filteredBookings.length === 0 && (
          <div className="rounded-xl border border-slate-200 bg-white px-6 py-16 text-center text-slate-500">
            No bookings found.
          </div>
        )}
      </div>
    </div>
  )
}
