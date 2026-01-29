import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import toast from 'react-hot-toast'
import { bookingsAPI } from '../../services/api'
import { connectSocket, getSocket } from '../../services/socket'
import { MessageCircle, DollarSign } from 'lucide-react'
import LoadingSpinner from '../../components/LoadingSpinner'

export default function MechanicBookingDetail() {
  const { id } = useParams()
  const [booking, setBooking] = useState<any>(null)
  const [messages, setMessages] = useState<any[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [cost, setCost] = useState('')
  const [status, setStatus] = useState('')

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
      setStatus(res.data.status)
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
        receiverId: booking.user.id,
        receiverType: 'USER',
        content: newMessage,
      })
      setNewMessage('')
    }
  }

  const acceptBooking = async () => {
    try {
      await bookingsAPI.acceptBooking(booking.id)
      toast.success('Booking accepted')
      loadBooking()
    } catch (error) {
      toast.error('Failed to accept booking')
    }
  }

  const updateStatus = async (newStatus: string) => {
    try {
      await bookingsAPI.updateStatus(booking.id, newStatus)
      setStatus(newStatus)
      toast.success('Status updated')
      loadBooking()
    } catch (error) {
      toast.error('Failed to update status')
    }
  }

  const updateCost = async () => {
    if (!cost) return
    try {
      await bookingsAPI.updateCost(booking.id, parseFloat(cost))
      toast.success('Cost updated')
      setCost('')
      loadBooking()
    } catch (error) {
      toast.error('Failed to update cost')
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
            <p className="text-sm text-gray-600 mt-2">
              Customer: {booking.user?.firstName} {booking.user?.lastName}
            </p>
            {booking.description && (
              <p className="text-gray-700 mt-2">{booking.description}</p>
            )}
          </div>
          <span
            className={`px-3 py-1 rounded text-sm ${
              status === 'REQUESTED'
                ? 'bg-yellow-100 text-yellow-800'
                : status === 'ACCEPTED'
                ? 'bg-blue-100 text-blue-800'
                : status === 'IN_PROGRESS'
                ? 'bg-purple-100 text-purple-800'
                : 'bg-green-100 text-green-800'
            }`}
          >
            {status}
          </span>
        </div>

        {status === 'REQUESTED' && (
          <button
            onClick={acceptBooking}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 mb-4"
          >
            Accept Booking
          </button>
        )}

        {status !== 'REQUESTED' && (
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Update Status
            </label>
            <div className="flex space-x-2">
              {status === 'ACCEPTED' && (
                <button
                  onClick={() => updateStatus('IN_PROGRESS')}
                  className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
                >
                  Start Work
                </button>
              )}
              {status === 'IN_PROGRESS' && (
                <button
                  onClick={() => updateStatus('DONE')}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                >
                  Mark as Done
                </button>
              )}
            </div>
          </div>
        )}

        <div className="border-t pt-4">
          <div className="flex items-center space-x-2 mb-2">
            <DollarSign className="h-5 w-5" />
            <span className="font-semibold">Cost Estimate</span>
          </div>
          {booking.estimatedCost ? (
            <p className="text-lg font-semibold">${booking.estimatedCost}</p>
          ) : (
            <div className="flex space-x-2">
              <input
                type="number"
                value={cost}
                onChange={(e) => setCost(e.target.value)}
                placeholder="Enter cost estimate"
                className="px-3 py-2 border border-gray-300 rounded-md"
              />
              <button
                onClick={updateCost}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Set Cost
              </button>
            </div>
          )}
        </div>
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
              className={`mb-2 ${msg.senderType === 'MECHANIC' ? 'text-right' : ''}`}
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
