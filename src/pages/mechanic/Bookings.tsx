import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { bookingsAPI } from '../../services/api'
import { useAuthStore } from '../../store/authStore'
import LoadingSpinner from '../../components/LoadingSpinner'

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
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Bookings</h1>

      <div className="mb-6 flex space-x-2">
        <button
          onClick={() => setFilter('ALL')}
          className={`px-4 py-2 rounded-md ${
            filter === 'ALL' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'
          }`}
        >
          All
        </button>
        <button
          onClick={() => setFilter('REQUESTED')}
          className={`px-4 py-2 rounded-md ${
            filter === 'REQUESTED' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'
          }`}
        >
          Pending
        </button>
        <button
          onClick={() => setFilter('ACCEPTED')}
          className={`px-4 py-2 rounded-md ${
            filter === 'ACCEPTED' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'
          }`}
        >
          Accepted
        </button>
        <button
          onClick={() => setFilter('IN_PROGRESS')}
          className={`px-4 py-2 rounded-md ${
            filter === 'IN_PROGRESS' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'
          }`}
        >
          In Progress
        </button>
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="divide-y">
          {filteredBookings.map((booking) => (
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
                  {booking.estimatedCost && (
                    <p className="text-sm font-medium">Est. Cost: ${booking.estimatedCost}</p>
                  )}
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
          {filteredBookings.length === 0 && (
            <div className="px-6 py-12 text-center text-gray-500">
              No bookings found.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
