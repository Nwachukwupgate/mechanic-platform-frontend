import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { bookingsAPI, ratingsAPI } from '../../services/api'
import { connectSocket, getSocket } from '../../services/socket'
import { MessageCircle, Star, CheckCircle } from 'lucide-react'
import LoadingSpinner from '../../components/LoadingSpinner'

export default function BookingDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [booking, setBooking] = useState<any>(null)
  const [messages, setMessages] = useState<any[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [rating, setRating] = useState(0)
  const [comment, setComment] = useState('')
  const [showRating, setShowRating] = useState(false)

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
      if (socket) {
        socket.off('new_message')
      }
    }
  }, [id])

  const loadBooking = async () => {
    try {
      const res = await bookingsAPI.getById(id!)
      setBooking(res.data)
      setMessages(res.data.messages || [])
    } catch (error) {
      toast.error('Failed to load booking')
    }
  }

  const sendMessage = () => {
    if (!newMessage.trim() || !booking) return

    const socket = getSocket()
    if (socket) {
      socket.emit('send_message', {
        bookingId: booking.id,
        receiverId: booking.mechanic?.id || booking.user.id,
        receiverType: booking.mechanic ? 'MECHANIC' : 'USER',
        content: newMessage,
      })
      setNewMessage('')
    }
  }

  const submitRating = async () => {
    if (!rating || !booking) return

    try {
      await ratingsAPI.create({
        bookingId: booking.id,
        mechanicId: booking.mechanic.id,
        rating,
        comment,
      })
      toast.success('Rating submitted successfully')
      setShowRating(false)
      setRating(0)
      setComment('')
      loadBooking()
    } catch (error) {
      toast.error('Failed to submit rating')
    }
  }

  if (!booking) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <div className="max-w-4xl">
      <h1 className="text-3xl font-bold mb-8">Booking Details</h1>

      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h2 className="text-xl font-semibold">
              {booking.vehicle?.brand} {booking.vehicle?.model}
            </h2>
            <p className="text-gray-600">{booking.fault?.name}</p>
          </div>
          <span
            className={`px-3 py-1 rounded text-sm ${
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

        {booking.mechanic && (
          <div className="mb-4">
            <p className="font-medium">Mechanic: {booking.mechanic.companyName}</p>
            <p className="text-sm text-gray-600">{booking.mechanic.ownerFullName}</p>
          </div>
        )}

        {booking.description && (
          <p className="text-gray-700 mb-4">{booking.description}</p>
        )}

        {booking.estimatedCost && (
          <p className="font-semibold mb-4">Estimated Cost: ${booking.estimatedCost}</p>
        )}

        {booking.status === 'DONE' && !showRating && (
          <button
            onClick={() => setShowRating(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Rate Mechanic
          </button>
        )}

        {showRating && (
          <div className="mt-4 p-4 bg-gray-50 rounded">
            <h3 className="font-semibold mb-2">Rate this mechanic</h3>
            <div className="flex space-x-1 mb-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => setRating(star)}
                  className={`text-2xl ${star <= rating ? 'text-yellow-500' : 'text-gray-300'}`}
                >
                  ★
                </button>
              ))}
            </div>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Add a comment (optional)"
              className="w-full px-3 py-2 border border-gray-300 rounded-md mb-2"
              rows={3}
            />
            <div className="flex space-x-2">
              <button
                onClick={submitRating}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Submit Rating
              </button>
              <button
                onClick={() => setShowRating(false)}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4 flex items-center space-x-2">
          <MessageCircle className="h-5 w-5" />
          <span>Chat</span>
        </h2>
        <div className="border rounded-lg p-4 mb-4 h-64 overflow-y-auto">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`mb-2 ${msg.senderId === booking.userId ? 'text-right' : ''}`}
            >
              <p className="text-sm text-gray-600">{msg.content}</p>
              <p className="text-xs text-gray-400">
                {new Date(msg.createdAt).toLocaleString()}
              </p>
            </div>
          ))}
        </div>
        <div className="flex space-x-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
            placeholder="Type a message..."
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md"
          />
          <button
            onClick={sendMessage}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  )
}
