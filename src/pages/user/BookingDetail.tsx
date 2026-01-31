import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import { bookingsAPI, ratingsAPI, getApiErrorMessage } from '../../services/api'
import { connectSocket, getSocket } from '../../services/socket'
import { useAuthStore } from '../../store/authStore'
import { BookingChat } from '../../components/BookingChat'
import LoadingSpinner from '../../components/LoadingSpinner'
import { ArrowLeft, MapPin, Star, Wrench, X } from 'lucide-react'

const statusStyles: Record<string, string> = {
  REQUESTED: 'bg-amber-100 text-amber-800',
  ACCEPTED: 'bg-blue-100 text-blue-800',
  IN_PROGRESS: 'bg-violet-100 text-violet-800',
  DONE: 'bg-emerald-100 text-emerald-800',
  PAID: 'bg-slate-100 text-slate-800',
  DELIVERED: 'bg-emerald-100 text-emerald-800',
}

export default function BookingDetail() {
  const { id } = useParams()
  const currentUser = useAuthStore((s) => s.user)
  const [booking, setBooking] = useState<any>(null)
  const [messages, setMessages] = useState<any[]>([])
  const [showRating, setShowRating] = useState(false)
  const [rating, setRating] = useState(0)
  const [comment, setComment] = useState('')

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
        receiverId: booking.mechanic?.id || booking.user?.id,
        receiverType: booking.mechanic ? 'MECHANIC' : 'USER',
        content,
      })
    }
  }

  const submitRating = async () => {
    if (!rating || !booking?.mechanic) return
    try {
      await ratingsAPI.create({
        bookingId: booking.id,
        mechanicId: booking.mechanic.id,
        rating,
        comment,
      })
      toast.success('Rating submitted')
      setShowRating(false)
      setRating(0)
      setComment('')
      loadBooking()
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Failed to submit rating'))
    }
  }

  if (!booking) {
    return (
      <div className="flex items-center justify-center min-h-[320px]">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  const otherPartyName = booking.mechanic?.companyName ?? 'Mechanic'
  const hasLocation = booking.locationLat != null && booking.locationLng != null

  return (
    <div className="max-w-4xl mx-auto">
      <Link
        to="/user"
        className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-900 mb-6 text-sm font-medium"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to dashboard
      </Link>

      {/* Summary card */}
      <div className="card p-5 mb-6">
        <div className="flex flex-wrap justify-between items-start gap-4">
          <div>
            <h1 className="text-xl font-semibold text-slate-800">
              {booking.vehicle?.brand} {booking.vehicle?.model}
            </h1>
            <p className="text-slate-600 mt-0.5">{booking.fault?.name}</p>
            {booking.mechanic && (
              <div className="flex items-center gap-2 mt-3">
                <Wrench className="h-4 w-4 text-slate-400" />
                <span className="text-sm font-medium text-slate-700">
                  {booking.mechanic.companyName} · {booking.mechanic.ownerFullName}
                </span>
              </div>
            )}
          </div>
          <span
            className={`px-3 py-1.5 rounded-xl text-sm font-medium ${
              statusStyles[booking.status] ?? 'bg-slate-100 text-slate-700'
            }`}
          >
            {booking.status.replace('_', ' ')}
          </span>
        </div>
        {booking.estimatedCost != null && (
          <p className="mt-3 text-slate-700 font-medium">
            Estimated cost: ${Number(booking.estimatedCost).toLocaleString()}
          </p>
        )}
        {booking.status === 'DONE' && !showRating && (
          <button
            onClick={() => setShowRating(true)}
            className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-amber-500 text-white rounded-xl hover:bg-amber-600 text-sm font-medium"
          >
            <Star className="h-4 w-4" />
            Rate mechanic
          </button>
        )}
      </div>

      {/* Job location — link to map */}
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

      {/* Chat — one page, chat-first */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-slate-800 mb-3">Conversation</h2>
        <BookingChat
          messages={messages}
          currentUserId={currentUser?.id ?? ''}
          otherPartyName={otherPartyName}
          onSend={sendMessage}
          placeholder="Type a message..."
        />
      </div>

      {/* Rating modal */}
      {showRating && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="card p-6 max-w-sm w-full">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold text-slate-800">Rate this mechanic</h3>
              <button
                onClick={() => setShowRating(false)}
                className="p-1 rounded-lg hover:bg-slate-100 text-slate-500"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="flex gap-1 mb-3">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  className={`p-1 text-2xl ${star <= rating ? 'text-amber-500' : 'text-slate-300'}`}
                >
                  ★
                </button>
              ))}
            </div>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Add a comment (optional)"
              className="w-full px-3 py-2 border border-slate-200 rounded-xl mb-4 text-sm"
              rows={3}
            />
            <div className="flex gap-2">
              <button
                onClick={submitRating}
                className="btn-primary flex-1"
              >
                Submit
              </button>
              <button
                onClick={() => setShowRating(false)}
                className="px-4 py-2.5 border border-slate-200 rounded-xl text-slate-700 font-medium hover:bg-slate-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
