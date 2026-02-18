import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { bookingsAPI } from '../../services/api'
import LoadingSpinner from '../../components/LoadingSpinner'

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
    <div>
      <h1 className="text-3xl font-bold mb-8">Job History</h1>
      <div className="bg-white rounded-lg shadow">
        <div className="divide-y">
          {bookings.map((booking) => (
            <Link
              key={booking.id}
              to={`/user/bookings/${booking.id}`}
              className="block px-6 py-4 hover:bg-gray-50"
            >
              <div className="flex justify-between items-center gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  {booking.mechanic && (
                    booking.mechanic.profile?.avatar ? (
                      <img src={booking.mechanic.profile.avatar} alt="" className="h-12 w-12 rounded-full object-cover border border-gray-200 shrink-0" />
                    ) : (
                      <div className="h-12 w-12 rounded-full bg-gray-200 flex items-center justify-center shrink-0">
                        <span className="text-gray-500 text-lg font-semibold">
                          {booking.mechanic.companyName?.charAt(0) ?? 'M'}
                        </span>
                      </div>
                    )
                  )}
                  <div className="min-w-0">
                    <p className="font-semibold">
                      {booking.vehicle?.brand} {booking.vehicle?.model}
                    </p>
                    <p className="text-sm text-gray-600">{booking.fault?.name}</p>
                    {booking.mechanic && (
                      <p className="text-sm text-gray-600">
                        Mechanic: {booking.mechanic.companyName}
                      </p>
                    )}
                    {booking.actualCost && (
                      <p className="text-sm font-medium">Cost: ₦{Number(booking.actualCost).toLocaleString()}</p>
                    )}
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <span className="px-2 py-1 text-xs rounded bg-green-100 text-green-800">
                    {booking.status}
                  </span>
                  <p className="text-xs text-gray-500 mt-1">
                    {new Date(booking.completedAt || booking.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </Link>
          ))}
          {bookings.length === 0 && (
            <div className="px-6 py-12 text-center text-gray-500">
              No completed jobs yet.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
