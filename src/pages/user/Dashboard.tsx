import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { bookingsAPI } from '../../services/api'
import { Car, MapPin, Clock } from 'lucide-react'
import LoadingSpinner from '../../components/LoadingSpinner'

export default function UserDashboard() {
  const [bookings, setBookings] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

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
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <Link
          to="/user/find-mechanics"
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Find Mechanics
        </Link>
      </div>

      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Active Bookings</p>
              <p className="text-2xl font-bold">
                {bookings.filter((b) => ['REQUESTED', 'ACCEPTED', 'IN_PROGRESS'].includes(b.status)).length}
              </p>
            </div>
            <Clock className="h-8 w-8 text-blue-600" />
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Total Bookings</p>
              <p className="text-2xl font-bold">{bookings.length}</p>
            </div>
            <Car className="h-8 w-8 text-green-600" />
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Completed</p>
              <p className="text-2xl font-bold">
                {bookings.filter((b) => ['DONE', 'PAID', 'DELIVERED'].includes(b.status)).length}
              </p>
            </div>
            <MapPin className="h-8 w-8 text-purple-600" />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b">
          <h2 className="text-xl font-semibold">Recent Bookings</h2>
        </div>
        <div className="divide-y">
          {bookings.slice(0, 5).map((booking) => (
            <Link
              key={booking.id}
              to={`/user/bookings/${booking.id}`}
              className="block px-6 py-4 hover:bg-gray-50"
            >
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-semibold">{booking.vehicle?.brand} {booking.vehicle?.model}</p>
                  <p className="text-sm text-gray-600">{booking.fault?.name}</p>
                </div>
                <div className="text-right">
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
              </div>
            </Link>
          ))}
          {bookings.length === 0 && (
            <div className="px-6 py-12 text-center text-gray-500">
              No bookings yet. Start by finding a mechanic!
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
