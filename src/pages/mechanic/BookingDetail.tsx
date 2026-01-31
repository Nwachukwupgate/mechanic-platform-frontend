import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import { bookingsAPI, getApiErrorMessage } from '../../services/api'
import { connectSocket, getSocket } from '../../services/socket'
import { useAuthStore } from '../../store/authStore'
import { BookingChat } from '../../components/BookingChat'
import LoadingSpinner from '../../components/LoadingSpinner'
import { ArrowLeft, DollarSign, MapPin, User } from 'lucide-react'

const statusStyles: Record<string, string> = {
  REQUESTED: 'bg-amber-100 text-amber-800',
  ACCEPTED: 'bg-blue-100 text-blue-800',
  IN_PROGRESS: 'bg-violet-100 text-violet-800',
  DONE: 'bg-emerald-100 text-emerald-800',
  PAID: 'bg-slate-100 text-slate-800',
  DELIVERED: 'bg-emerald-100 text-emerald-800',
}

export default function MechanicBookingDetail() {
  const { id } = useParams()
  const currentUser = useAuthStore((s) => s.user)
  const [booking, setBooking] = useState<any>(null)
  const [messages, setMessages] = useState<any[]>([])
  const [cost, setCost] = useState('')
  const [status, setStatus] = useState('')
  const [accepting, setAccepting] = useState(false)
  const [statusUpdating, setStatusUpdating] = useState(false)
  const [costUpdating, setCostUpdating] = useState(false)

  useEffect(() => {
    if (!id) return
    loadBooking()
    connectSocket()
    const socket = getSocket()
    if (socket) {
      socket.emit('join_booking', id)
      socket.on('new_message', (message: any) => {
        setMessages((prev) => [...prev, message])
      })
    }
    return () => {
      if (socket) socket.off('new_message')
    }
  }, [id])

  const loadBooking = async () => {
    try {
      const res = await bookingsAPI.getById(id!)
      setBooking(res.data)
      setMessages(res.data.messages || [])
      setStatus(res.data.status)
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Failed to load booking'))
    }
  }

  const sendMessage = (content: string) => {
    if (!booking) return
    const socket = getSocket()
    if (socket) {
      socket.emit('send_message', {
        bookingId: booking.id,
        receiverId: booking.user?.id,
        receiverType: 'USER',
        content,
      })
    }
  }

  const acceptBooking = async () => {
    setAccepting(true)
    try {
      await bookingsAPI.acceptBooking(booking.id)
      toast.success('Booking accepted')
      loadBooking()
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Failed to accept booking'))
    } finally {
      setAccepting(false)
    }
  }

  const updateStatus = async (newStatus: string) => {
    try {
      await bookingsAPI.updateStatus(booking.id, newStatus)
      setStatus(newStatus)
      toast.success('Status updated')
      loadBooking()
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Failed to update status'))
    }
  }

  const updateCost = async () => {
    if (!cost) return
    setCostUpdating(true)
    try {
      await bookingsAPI.updateCost(booking.id, parseFloat(cost))
      toast.success('Cost updated')
      setCost('')
      loadBooking()
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Failed to update cost'))
    } finally {
      setCostUpdating(false)
    }
  }

  if (!booking) {
    return (
      <div className="flex items-center justify-center min-h-[320px]">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  const customerName =
    booking.user?.firstName || booking.user?.lastName
      ? [booking.user.firstName, booking.user.lastName].filter(Boolean).join(' ')
      : 'Customer'
  const hasLocation = booking.locationLat != null && booking.locationLng != null

  return (
    <div className="max-w-4xl mx-auto">
      <Link
        to="/mechanic/bookings"
        className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-900 mb-6 text-sm font-medium"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to bookings
      </Link>

      {/* Summary card */}
      <div className="card p-5 mb-6">
        <div className="flex flex-wrap justify-between items-start gap-4">
          <div>
            <h1 className="text-xl font-semibold text-slate-800">
              {booking.vehicle?.brand} {booking.vehicle?.model}
            </h1>
            <p className="text-slate-600 mt-0.5">{booking.fault?.name}</p>
            <div className="flex items-center gap-2 mt-3">
              <User className="h-4 w-4 text-slate-400" />
              <span className="text-sm font-medium text-slate-700">{customerName}</span>
            </div>
            {booking.description && (
              <p className="text-sm text-slate-600 mt-2">{booking.description}</p>
            )}
          </div>
          <span
            className={`px-3 py-1.5 rounded-xl text-sm font-medium ${
              statusStyles[status] ?? 'bg-slate-100 text-slate-700'
            }`}
          >
            {status.replace('_', ' ')}
          </span>
        </div>

        {status === 'REQUESTED' && (
          <button
            type="button"
            onClick={acceptBooking}
            disabled={accepting}
            className="mt-4 inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 font-medium text-sm disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {accepting ? (
              <>
                <span className="inline-block h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Accepting…
              </>
            ) : (
              'Accept booking'
            )}
          </button>
        )}

        {status !== 'REQUESTED' && (
          <div className="mt-4 flex flex-wrap gap-2">
            {status === 'ACCEPTED' && (
              <button
                type="button"
                onClick={() => updateStatus('IN_PROGRESS')}
                disabled={statusUpdating}
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-violet-600 text-white rounded-xl hover:bg-violet-700 text-sm font-medium disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {statusUpdating ? (
                  <>
                    <span className="inline-block h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Updating…
                  </>
                ) : (
                  'Start work'
                )}
              </button>
            )}
            {status === 'IN_PROGRESS' && (
              <button
                type="button"
                onClick={() => updateStatus('DONE')}
                disabled={statusUpdating}
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 text-sm font-medium disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {statusUpdating ? (
                  <>
                    <span className="inline-block h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Updating…
                  </>
                ) : (
                  'Mark as done'
                )}
              </button>
            )}
          </div>
        )}

        <div className="mt-4 pt-4 border-t border-slate-100 flex items-center gap-2">
          <DollarSign className="h-5 w-5 text-slate-400" />
          {booking.estimatedCost != null ? (
            <span className="font-semibold text-slate-800">
              ${Number(booking.estimatedCost).toLocaleString()}
            </span>
          ) : (
            <div className="flex gap-2 flex-wrap">
              <input
                type="number"
                value={cost}
                onChange={(e) => setCost(e.target.value)}
                placeholder="Cost estimate"
                className="px-3 py-2 border border-slate-200 rounded-xl text-sm w-32"
              />
              <button
                type="button"
                onClick={updateCost}
                disabled={costUpdating}
                className="btn-primary text-sm inline-flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {costUpdating ? (
                  <>
                    <span className="inline-block h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Saving…
                  </>
                ) : (
                  'Set cost'
                )}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Job location */}
      {hasLocation && (
        <div className="card p-4 mb-6">
          <div className="flex items-center gap-2 text-slate-700 font-medium mb-2">
            <MapPin className="h-4 w-4 text-primary-600" />
            Job location
          </div>
          {booking.locationAddress && (
            <p className="text-sm text-slate-600 mb-2">{booking.locationAddress}</p>
          )}
          <a
            href={`https://www.google.com/maps?q=${booking.locationLat},${booking.locationLng}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-sm font-medium text-primary-600 hover:text-primary-700"
          >
            <MapPin className="h-4 w-4" />
            View on map
          </a>
        </div>
      )}

      {/* Chat */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-slate-800 mb-3">Conversation</h2>
        <BookingChat
          messages={messages}
          currentUserId={currentUser?.id ?? ''}
          otherPartyName={customerName}
          onSend={sendMessage}
          placeholder="Type a message..."
        />
      </div>
    </div>
  )
}
