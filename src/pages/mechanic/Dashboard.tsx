import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { bookingsAPI } from '../../services/api'
import { Briefcase, Clock, CheckCircle } from 'lucide-react'
import LoadingSpinner from '../../components/LoadingSpinner'

export default function MechanicDashboard() {
  const [bookings, setBookings] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadBookings()
  }, [])

  const loadBookings = () => {
    bookingsAPI
      .getAll()
      .then((res) => {
        setBookings(res.data)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  const pendingBookings = bookings.filter((b) => b.status === 'REQUESTED')
  const activeBookings = bookings.filter((b) =>
    ['ACCEPTED', 'IN_PROGRESS'].includes(b.status)
  )
  const completedBookings = bookings.filter((b) =>
    ['DONE', 'PAID', 'DELIVERED'].includes(b.status)
  )

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Dashboard</h1>

      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Pending Requests</p>
              <p className="text-2xl font-bold">{pendingBookings.length}</p>
            </div>
            <Clock className="h-8 w-8 text-yellow-600" />
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Active Jobs</p>
              <p className="text-2xl font-bold">{activeBookings.length}</p>
            </div>
            <Briefcase className="h-8 w-8 text-blue-600" />
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Completed</p>
              <p className="text-2xl font-bold">{completedBookings.length}</p>
            </div>
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
        </div>
      </div>

      {pendingBookings.length > 0 && (
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="px-6 py-4 border-b">
            <h2 className="text-xl font-semibold">Pending Requests</h2>
          </div>
          <div className="divide-y">
            {pendingBookings.slice(0, 5).map((booking) => (
              <Link
                key={booking.id}
                to={`/mechanic/bookings/${booking.id}`}
                className="block px-6 py-4 hover:bg-gray-50"
              >
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-semibold">
                      {booking.vehicle?.brand} {booking.vehicle?.model}
                    </p>
                    <p className="text-sm text-gray-600">{booking.fault?.name}</p>
                    <p className="text-sm text-gray-600">
                      Customer: {booking.user?.firstName} {booking.user?.lastName}
                    </p>
                  </div>
                  <span className="px-2 py-1 text-xs rounded bg-yellow-100 text-yellow-800">
                    {booking.status}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b">
          <h2 className="text-xl font-semibold">Recent Bookings</h2>
        </div>
        <div className="divide-y">
          {bookings.slice(0, 10).map((booking) => (
            <Link
              key={booking.id}
              to={`/mechanic/bookings/${booking.id}`}
              className="block px-6 py-4 hover:bg-gray-50"
            >
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-semibold">
                    {booking.vehicle?.brand} {booking.vehicle?.model}
                  </p>
                  <p className="text-sm text-gray-600">{booking.fault?.name}</p>
                </div>
                <span
                  className={`px-2 py-1 text-xs rounded ${
                    booking.status === 'REQUESTED'
                      ? 'bg-yellow-100 text-yellow-800'
                      : booking.status === 'ACCEPTED'
                      ? 'bg-blue-100 text-blue-800'
                      : booking.status === 'IN_PROGRESS'
                      ? 'bg-purple-100 text-purple-800'
                      : 'bg-green-100 text-green-800'
                  }`}
                >
                  {booking.status}
                </span>
              </div>
            </Link>
          ))}
          {bookings.length === 0 && (
            <div className="px-6 py-12 text-center text-gray-500">
              No bookings yet.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
