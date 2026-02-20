import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { bookingsAPI } from '../../services/api'
import LoadingSpinner from '../../components/LoadingSpinner'
import RepairTypeIcon from '../../components/RepairTypeIcon'

export default function JobHistory() {
  const [bookings, setBookings] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    bookingsAPI
      .getAll()
      .then((res) => {
        setBookings(res.data.filter((b: any) => ['DONE', 'PAID', 'DELIVERED'].includes(b.status)))
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
    <div className="space-y-6">
      <h1 className="text-2xl sm:text-3xl font-bold text-slate-800">Job History</h1>
      <div className="space-y-4">
        {bookings.map((booking) => (
          <Link
            key={booking.id}
            to={`/user/bookings/${booking.id}`}
            className="block rounded-xl border border-slate-200 bg-white p-4 sm:p-5 shadow-sm hover:border-slate-300 hover:bg-slate-50/50 transition-colors active:bg-slate-50"
          >
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-start gap-3 min-w-0">
                <RepairTypeIcon fault={booking.fault} size="md" />
                {booking.mechanic && (
                  booking.mechanic.profile?.avatar ? (
                    <img src={booking.mechanic.profile.avatar} alt="" className="h-12 w-12 rounded-full object-cover border border-slate-200 shrink-0" />
                  ) : (
                    <div className="h-12 w-12 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center shrink-0 font-semibold">
                      {booking.mechanic.companyName?.charAt(0) ?? 'M'}
                    </div>
                  )
                )}
                <div className="min-w-0 space-y-1">
                  <p className="font-semibold text-slate-800">
                    {booking.vehicle?.brand} {booking.vehicle?.model}
                  </p>
                  <p className="text-sm text-slate-600">{booking.fault?.name}</p>
                  {booking.mechanic && (
                    <p className="text-sm text-slate-500">
                      Mechanic: {booking.mechanic.companyName}
                    </p>
                  )}
                  {booking.actualCost && (
                    <p className="text-sm font-medium text-slate-700">Cost: ₦{Number(booking.actualCost).toLocaleString()}</p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-3 sm:flex-col sm:items-end sm:shrink-0">
                <span className="px-2.5 py-1 text-xs font-medium rounded-lg bg-primary-100 text-primary-800">
                  {booking.status}
                </span>
                <p className="text-xs text-slate-500">
                  {new Date(booking.completedAt || booking.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          </Link>
        ))}
        {bookings.length === 0 && (
          <div className="rounded-xl border border-slate-200 bg-white px-6 py-16 text-center text-slate-500">
            No completed jobs yet.
          </div>
        )}
      </div>
    </div>
  )
}
