import { useState, useEffect, useRef, useMemo } from 'react'
import { useParams, Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import { bookingsAPI, getApiErrorMessage } from '../../services/api'
import { connectSocket, getSocket, onQuoteEvents } from '../../services/socket'
import { useAuthStore } from '../../store/authStore'
import { BookingChat } from '../../components/BookingChat'
import LoadingSpinner from '../../components/LoadingSpinner'
import RepairTypeIcon from '../../components/RepairTypeIcon'
import { mechanicBookingGuidance, quoteStatusLabel } from '../../lib/bookingStatusCopy'
import { ArrowLeft, Banknote, MapPin, User, MessageCircle, HelpCircle, ImageIcon } from 'lucide-react'

const MAX_QUOTE_PRICE_REVISIONS = 3

const statusStyles: Record<string, string> = {
  REQUESTED: 'bg-amber-100 text-amber-800',
  EXPIRED: 'bg-slate-200 text-slate-700',
  ACCEPTED: 'bg-primary-100 text-primary-800',
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
  const [status, setStatus] = useState('')
  const [statusUpdating, setStatusUpdating] = useState(false)
  const [quotePrice, setQuotePrice] = useState('')
  const [quoteMessage, setQuoteMessage] = useState('')
  const [quoteSubmitting, setQuoteSubmitting] = useState(false)
  const [clarificationQuestion, setClarificationQuestion] = useState('')
  const [clarificationSubmitting, setClarificationSubmitting] = useState(false)
  const loadBookingRef = useRef<() => Promise<void>>(() => Promise.resolve())

  useEffect(() => {
    if (!id) return
    loadBookingRef.current = loadBooking
    loadBooking()
    connectSocket()
    const socket = getSocket()
    if (socket) {
      socket.emit('join_booking', id)
      socket.on('new_message', (message: any) => {
        setMessages((prev) => [...prev, message])
      })
    }
    const unsub = onQuoteEvents({
      onQuoteCreated: (p) => p.bookingId === id && loadBookingRef.current(),
      onQuoteUpdated: (p) => p.bookingId === id && loadBookingRef.current(),
      onQuoteRejected: (p) => p.bookingId === id && loadBookingRef.current(),
      onQuoteAccepted: (p) => p.bookingId === id && loadBookingRef.current(),
    })
    return () => {
      if (socket) socket.off('new_message')
      unsub()
    }
  }, [id])

  useEffect(() => {
    if (!id || !booking?.mechanicId || booking.status === 'REQUESTED') return
    bookingsAPI.markMessagesRead(id).catch(() => {})
  }, [id, booking?.mechanicId, booking?.status])

  const loadBooking = async () => {
    try {
      const res = await bookingsAPI.getById(id!)
      setBooking(res.data)
      setMessages(res.data.messages || [])
      setStatus(res.data.status)
      const q = res.data.quotes?.find((x: any) => x.mechanicId === currentUser?.id || x.mechanic?.id === currentUser?.id)
      if (q) {
        setQuotePrice(String(q.proposedPrice))
        setQuoteMessage(q.message || '')
      }
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

  const myQuote = booking?.quotes?.find((q: any) => q.mechanicId === currentUser?.id || q.mechanic?.id === currentUser?.id)
  /** Open job board or a job sent directly to this mechanic — quote while still REQUESTED */
  const canQuoteWhileRequested =
    booking?.status === 'REQUESTED' &&
    (!booking?.mechanicId || booking?.mechanicId === currentUser?.id)

  const submitOrUpdateQuote = async () => {
    if (!id || !quotePrice.trim()) {
      toast.error('Enter your price')
      return
    }
    const price = parseFloat(quotePrice)
    if (Number.isNaN(price) || price <= 0) {
      toast.error('Enter a valid price')
      return
    }
    setQuoteSubmitting(true)
    try {
      if (myQuote?.id) {
        await bookingsAPI.updateQuote(id, myQuote.id, { proposedPrice: price })
        toast.success('Quote updated')
      } else {
        await bookingsAPI.createQuote(id, { proposedPrice: price, message: quoteMessage.trim() || undefined })
        toast.success('Quote submitted')
      }
      setQuotePrice('')
      setQuoteMessage('')
      loadBooking()
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Failed to submit quote'))
    } finally {
      setQuoteSubmitting(false)
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

  const askClarification = async () => {
    const q = clarificationQuestion?.trim()
    if (!id || !q) return
    setClarificationSubmitting(true)
    try {
      await bookingsAPI.addClarification(id, q)
      toast.success('Question sent. The customer can answer from their booking page.')
      setClarificationQuestion('')
      loadBooking()
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Failed to send question'))
    } finally {
      setClarificationSubmitting(false)
    }
  }

  const guidanceLine = useMemo(
    () => (booking ? mechanicBookingGuidance(booking.status) : ''),
    [booking]
  )

  const photoUrls: string[] =
    booking?.photoUrls && Array.isArray(booking.photoUrls) ? booking.photoUrls : []

  const competingQuotes = useMemo(() => {
    if (!booking?.quotes?.length || !currentUser?.id) return []
    return booking.quotes.filter(
      (q: any) => q.mechanicId !== currentUser.id && q.mechanic?.id !== currentUser.id
    )
  }, [booking?.quotes, currentUser?.id])

  if (!booking) {
    return (
      <div className="flex items-center justify-center min-h-[320px]">
        <LoadingSpinner variant="logo" size="lg" />
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
          <div className="flex items-start gap-3">
            <RepairTypeIcon fault={booking.fault} size="lg" />
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
          </div>
          <span
            className={`px-3 py-1.5 rounded-xl text-sm font-medium ${
              statusStyles[status] ?? 'bg-slate-100 text-slate-700'
            }`}
          >
            {status.replace('_', ' ')}
          </span>
        </div>
        {guidanceLine && (
          <p className="mt-3 text-sm text-slate-700 leading-relaxed border-l-4 border-primary-200 pl-3">
            {guidanceLine}
          </p>
        )}
        {booking.openRequestExpiresAt && booking.status === 'REQUESTED' && !booking.mechanicId && (
          <p className="mt-2 text-xs text-slate-500">
            Open board closes {new Date(booking.openRequestExpiresAt).toLocaleString()}.
          </p>
        )}
        {Array.isArray(booking.transactions) && booking.transactions.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {booking.transactions.map((t: any) => (
              <span
                key={t.id}
                className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium ${
                  t.status === 'SUCCESS'
                    ? 'bg-emerald-100 text-emerald-800'
                    : t.status === 'PENDING'
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-slate-100 text-slate-700'
                }`}
              >
                {String(t.type || 'Payment').replace(/_/g, ' ')} · {t.status}
              </span>
            ))}
          </div>
        )}

        {/* Job details / Pre-job discussion — helps price; for records after accept */}
        <div className="mt-4 pt-4 border-t border-slate-100">
          <h3 className="font-medium text-slate-800 mb-2 flex items-center gap-2">
            {booking.mechanicId && booking.mechanicId === currentUser?.id ? (
              <>
                <MessageCircle className="h-4 w-4 text-primary-600" />
                Job sent to you — review details before quoting
              </>
            ) : (
              <>
                <HelpCircle className="h-4 w-4 text-primary-600" />
                Job details — use this to set your price
              </>
            )}
          </h3>
            {(booking.description ||
              (Array.isArray(booking.clarifications) && booking.clarifications.length > 0) ||
              photoUrls.length > 0) ? (
            <div className="space-y-3 text-sm">
              {booking.description && (
                <p className="text-slate-700"><span className="font-medium text-slate-600">Customer description:</span> {booking.description}</p>
              )}
              {photoUrls.length > 0 && (
                <div>
                  <p className="font-medium text-slate-600 mb-2 flex items-center gap-1.5">
                    <ImageIcon className="h-4 w-4 text-primary-600" />
                    Customer photos
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {photoUrls.map((url) => (
                      <a key={url} href={url} target="_blank" rel="noopener noreferrer">
                        <img src={url} alt="" className="h-24 w-24 object-cover rounded-lg border border-slate-200" />
                      </a>
                    ))}
                  </div>
                </div>
              )}
              {Array.isArray(booking.clarifications) && booking.clarifications.length > 0 && (
                <div>
                  <p className="font-medium text-slate-600 mb-1">Q&A</p>
                  <ul className="space-y-2">
                    {booking.clarifications.map((c: any) => (
                      <li key={c.id} className="pl-2 border-l-2 border-slate-200">
                        <span className="text-slate-600">Q: {c.question}</span>
                        {c.answer ? (
                          <p className="mt-0.5 text-slate-700">A: {c.answer}</p>
                        ) : (
                          <p className="mt-0.5 text-slate-500 italic">Waiting for customer answer</p>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ) : (
            <p className="text-slate-500 text-sm">No extra details from the customer yet.</p>
          )}
          {canQuoteWhileRequested && (
            <>
              <div className="mt-3 flex flex-wrap gap-2 items-end">
                <input
                  type="text"
                  value={clarificationQuestion}
                  onChange={(e) => setClarificationQuestion(e.target.value)}
                  placeholder="Ask the customer a short question (e.g. Is the check engine light on?)"
                  maxLength={500}
                  className="flex-1 min-w-[200px] px-3 py-2 border border-slate-200 rounded-lg text-sm"
                />
                <button
                  type="button"
                  onClick={askClarification}
                  disabled={clarificationSubmitting || !clarificationQuestion.trim()}
                  className="px-4 py-2 bg-slate-600 text-white rounded-lg text-sm font-medium hover:bg-slate-700 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {clarificationSubmitting ? 'Sending…' : 'Ask question'}
                </button>
              </div>
              <p className="mt-1.5 text-xs text-slate-500">
                Up to 2 questions per job (max 5 total). The customer answers from their booking page.
              </p>
            </>
          )}
        </div>

        {/* Open request: submit or update your price (real-time) */}
        {canQuoteWhileRequested && (
          <div className="mt-4 p-4 rounded-xl bg-slate-50 border border-slate-100">
            <h3 className="font-medium text-slate-800 mb-2">
              {myQuote ? 'Update your quote' : 'Submit your price for this job'}
            </h3>
            <div className="flex flex-wrap gap-3 items-end">
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1">Price (₦)</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={quotePrice}
                  onChange={(e) => setQuotePrice(e.target.value)}
                  placeholder="e.g. 50"
                  className="w-28 px-3 py-2 border border-slate-200 rounded-lg text-sm"
                />
              </div>
              <div className="flex-1 min-w-[180px]">
                <label className="block text-sm font-medium text-slate-600 mb-1">Message (optional)</label>
                <input
                  type="text"
                  value={quoteMessage}
                  onChange={(e) => setQuoteMessage(e.target.value)}
                  placeholder="e.g. Available tomorrow"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
                />
              </div>
              <button
                type="button"
                onClick={submitOrUpdateQuote}
                disabled={quoteSubmitting}
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 font-medium text-sm disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {quoteSubmitting ? (
                  <>
                    <span className="inline-block h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Submitting…
                  </>
                ) : myQuote ? (
                  'Update quote'
                ) : (
                  'Submit quote'
                )}
              </button>
            </div>
            {myQuote && (
              <p className="mt-2 text-sm text-slate-500">
                Status: {quoteStatusLabel(myQuote.status)}. User may accept or reject. You can adjust your price above
                {typeof myQuote.priceUpdateCount === 'number' && (
                  <>
                    {' '}
                    (price updates used: {myQuote.priceUpdateCount}/{MAX_QUOTE_PRICE_REVISIONS})
                  </>
                )}
                .
              </p>
            )}
            {booking.status === 'REQUESTED' && competingQuotes.length > 0 && (
              <div className="mt-4 pt-3 border-t border-slate-200">
                <p className="text-sm font-medium text-slate-700 mb-2">Other mechanics on this job (read-only)</p>
                <ul className="text-sm space-y-1 text-slate-600">
                  {competingQuotes.map((q: any) => (
                    <li key={q.id}>
                      {q.mechanic?.companyName ?? 'Mechanic'} — {'\u20A6'}
                      {Number(q.proposedPrice).toLocaleString()} · {quoteStatusLabel(q.status)}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
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

        {/* Cost comes from the accepted quote only — no separate "set cost" in the bargain */}
        {booking.estimatedCost != null && (
          <div className="mt-4 pt-4 border-t border-slate-100 flex items-center gap-2">
            <Banknote className="h-5 w-5 text-slate-400" />
            <span className="font-semibold text-slate-800">
              ₦{Number(booking.estimatedCost).toLocaleString()}
            </span>
            {booking.mechanicId && (
              <span className="text-xs text-slate-500">(from accepted quote)</span>
            )}
          </div>
        )}
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

      {/* Chat — only after the customer has accepted a quote */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-slate-800 mb-3">Conversation</h2>
        {booking.mechanicId && booking.status !== 'REQUESTED' ? (
          <BookingChat
            messages={messages}
            currentUserId={currentUser?.id ?? ''}
            otherPartyName={customerName}
            onSend={sendMessage}
            placeholder="Type a message..."
          />
        ) : (
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6 text-center text-slate-600">
            <p className="font-medium text-slate-700">Chat is available after the customer accepts a quote</p>
            <p className="mt-1 text-sm">Submit your price above. Once the customer accepts your quote, you can chat here.</p>
          </div>
        )}
      </div>
    </div>
  )
}
