import { useState, useEffect, useRef } from 'react'
import { useParams, Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import { bookingsAPI, ratingsAPI, walletAPI, getApiErrorMessage } from '../../services/api'
import { connectSocket, getSocket, onQuoteEvents } from '../../services/socket'
import { useAuthStore } from '../../store/authStore'
import { BookingChat } from '../../components/BookingChat'
import LoadingSpinner from '../../components/LoadingSpinner'
import { ArrowLeft, CheckCircle2, CreditCard, Banknote, MapPin, MessageCircle, Star, Wrench, X } from 'lucide-react'

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
  const [ratingSubmitting, setRatingSubmitting] = useState(false)
  const [quoteActionLoading, setQuoteActionLoading] = useState<string | null>(null)
  const [descDraft, setDescDraft] = useState('')
  const [descSaving, setDescSaving] = useState(false)
  const [answerDrafts, setAnswerDrafts] = useState<Record<string, string>>({})
  const [answerSaving, setAnswerSaving] = useState<string | null>(null)
  const [paymentLoading, setPaymentLoading] = useState<'paystack' | 'direct' | null>(null)
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
      onQuoteAccepted: (p) => p.bookingId === id && loadBookingRef.current(),
    })
    return () => {
      if (socket) socket.off('new_message')
      unsub()
    }
  }, [id])

  const loadBooking = async () => {
    try {
      const res = await bookingsAPI.getById(id!)
      setBooking(res.data)
      setMessages(res.data.messages || [])
      setDescDraft(res.data.description ?? '')
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

  const acceptQuote = async (quoteId: string) => {
    if (!id) return
    setQuoteActionLoading(quoteId)
    try {
      await bookingsAPI.acceptQuote(id, quoteId)
      toast.success('Mechanic accepted')
      loadBooking()
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Failed to accept quote'))
    } finally {
      setQuoteActionLoading(null)
    }
  }

  const rejectQuote = async (quoteId: string) => {
    if (!id) return
    setQuoteActionLoading(quoteId)
    try {
      await bookingsAPI.rejectQuote(id, quoteId)
      toast.success('Quote removed')
      loadBooking()
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Failed to reject quote'))
    } finally {
      setQuoteActionLoading(null)
    }
  }

  const saveDescription = async () => {
    if (!id) return
    setDescSaving(true)
    try {
      await bookingsAPI.updateDescription(id, descDraft.trim() || null)
      toast.success('Details updated')
      setBooking((b: any) => (b ? { ...b, description: descDraft.trim() || null } : b))
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Failed to update details'))
    } finally {
      setDescSaving(false)
    }
  }

  const answerClarification = async (clarificationId: string) => {
    const answer = answerDrafts[clarificationId]?.trim()
    if (!answer) return
    setAnswerSaving(clarificationId)
    try {
      await bookingsAPI.answerClarification(clarificationId, answer)
      toast.success('Answer sent')
      setAnswerDrafts((prev) => ({ ...prev, [clarificationId]: '' }))
      loadBooking()
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Failed to send answer'))
    } finally {
      setAnswerSaving(null)
    }
  }

  const submitRating = async () => {
    if (!rating || !booking?.mechanic) return
    setRatingSubmitting(true)
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
    } finally {
      setRatingSubmitting(false)
    }
  }

  if (!booking) {
    return (
      <div className="flex items-center justify-center min-h-[320px]">
        <LoadingSpinner variant="logo" size="lg" />
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
              <div className="flex items-center gap-3 mt-3">
                {booking.mechanic.profile?.avatar ? (
                  <img src={booking.mechanic.profile.avatar} alt="" className="h-10 w-10 rounded-full object-cover border border-slate-200" />
                ) : (
                  <div className="h-10 w-10 rounded-full bg-slate-200 flex items-center justify-center shrink-0">
                    <Wrench className="h-5 w-5 text-slate-500" />
                  </div>
                )}
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
            Estimated cost: ₦{Number(booking.estimatedCost).toLocaleString()}
          </p>
        )}
        {/* Payment: show when accepted and not yet paid */}
        {['ACCEPTED', 'IN_PROGRESS', 'DONE'].includes(booking.status) && !booking.paidAt && booking.estimatedCost != null && booking.estimatedCost > 0 && (
          <div className="mt-4 p-4 rounded-xl bg-slate-50 border border-slate-200">
            <p className="text-sm font-medium text-slate-700 mb-3">Pay for this job</p>
            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={async () => {
                  setPaymentLoading('paystack')
                  try {
                    const { data } = await walletAPI.initializePayment(booking.id)
                    if (data?.authorizationUrl) {
                      window.location.href = data.authorizationUrl
                      return
                    }
                    toast.error('Could not start payment')
                  } catch (err) {
                    toast.error(getApiErrorMessage(err, 'Failed to start payment'))
                  } finally {
                    setPaymentLoading(null)
                  }
                }}
                disabled={paymentLoading != null}
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary-600 text-white rounded-xl text-sm font-medium hover:bg-primary-700 disabled:opacity-70"
              >
                {paymentLoading === 'paystack' ? (
                  <span className="inline-block h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <CreditCard className="h-4 w-4" />
                )}
                Pay with Paystack (card/bank)
              </button>
              <button
                type="button"
                onClick={async () => {
                  setPaymentLoading('direct')
                  try {
                    await walletAPI.markDirectPaid(booking.id)
                    toast.success('Marked as paid directly to mechanic')
                    loadBooking()
                  } catch (err) {
                    toast.error(getApiErrorMessage(err, 'Failed to update'))
                  } finally {
                    setPaymentLoading(null)
                  }
                }}
                disabled={paymentLoading != null}
                className="inline-flex items-center gap-2 px-4 py-2.5 border border-slate-300 text-slate-700 rounded-xl text-sm font-medium hover:bg-slate-50 disabled:opacity-70"
              >
                {paymentLoading === 'direct' ? (
                  <span className="inline-block h-4 w-4 border-2 border-slate-500 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Banknote className="h-4 w-4" />
                )}
                I paid the mechanic directly
              </button>
            </div>
            {/* <p className="text-xs text-slate-500 mt-2">
              Pay us via Paystack and we pay the mechanic (80%). Or pay the mechanic yourself and they settle our fee (20%).
            </p> */}
          </div>
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

      {/* Diagnostic & pre-job info — helps mechanics price; visible for records after accept */}
      <div className="card p-5 mb-6">
        <h2 className="text-lg font-semibold text-slate-800 mb-3 flex items-center gap-2">
          <MessageCircle className="h-5 w-5 text-primary-600" />
          {booking.mechanicId ? 'Pre-job discussion (for records)' : 'Job details for mechanics'}
        </h2>
        <p className="text-sm text-slate-600 mb-4">
          {booking.mechanicId
            ? 'Summary of what you shared before accepting a quote. The mechanic uses this for the job.'
            : 'Add or edit details so mechanics can give you a better price. They can also ask a few short questions.'}
        </p>
        {booking.status === 'REQUESTED' && !booking.mechanicId ? (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Your description</label>
              <textarea
                value={descDraft}
                onChange={(e) => setDescDraft(e.target.value)}
                placeholder="What's wrong, when it started, any sounds or warning lights?"
                rows={3}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm"
              />
              <button
                type="button"
                onClick={saveDescription}
                disabled={descSaving}
                className="mt-2 text-sm font-medium text-primary-600 hover:text-primary-700 disabled:opacity-60"
              >
                {descSaving ? 'Saving…' : 'Save'}
              </button>
            </div>
            {Array.isArray(booking.clarifications) && booking.clarifications.length > 0 &&
              booking.clarifications.map((c: any) => (
                <div key={c.id} className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <p className="text-sm font-medium text-slate-800">
                    {c.mechanic?.companyName} asked:
                  </p>
                  <p className="text-slate-700 mt-0.5">{c.question}</p>
                  {c.answer ? (
                    <p className="mt-2 text-sm text-slate-600 border-l-2 border-primary-200 pl-2">
                      Your answer: {c.answer}
                    </p>
                  ) : (
                    <div className="mt-2 flex gap-2 flex-wrap">
                      <input
                        type="text"
                        value={answerDrafts[c.id] ?? ''}
                        onChange={(e) =>
                          setAnswerDrafts((prev) => ({ ...prev, [c.id]: e.target.value }))
                        }
                        placeholder="Type your answer..."
                        className="flex-1 min-w-[160px] px-3 py-2 border border-slate-200 rounded-lg text-sm"
                      />
                      <button
                        type="button"
                        onClick={() => answerClarification(c.id)}
                        disabled={answerSaving === c.id || !(answerDrafts[c.id]?.trim())}
                        className="px-3 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 disabled:opacity-60"
                      >
                        {answerSaving === c.id ? 'Sending…' : 'Send'}
                      </button>
                    </div>
                  )}
                </div>
              ))}
          </div>
        ) : (booking.description || (Array.isArray(booking.clarifications) && booking.clarifications.length > 0)) ? (
          <div className="space-y-4">
            {booking.description && (
              <div>
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Your description</p>
                <p className="text-slate-700 mt-0.5 whitespace-pre-wrap">{booking.description}</p>
              </div>
            )}
            {Array.isArray(booking.clarifications) && booking.clarifications.length > 0 && (
              <div>
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-2">
                  Q&A with mechanics
                </p>
                <ul className="space-y-2">
                  {booking.clarifications.map((c: any) => (
                    <li key={c.id} className="p-2 rounded-lg bg-slate-50 text-sm flex items-start gap-2">
                      {c.mechanic?.profile?.avatar ? (
                        <img src={c.mechanic.profile.avatar} alt="" className="h-8 w-8 rounded-full object-cover border border-slate-200 shrink-0 mt-0.5" />
                      ) : (
                        <div className="h-8 w-8 rounded-full bg-slate-200 flex items-center justify-center shrink-0 mt-0.5">
                          <Wrench className="h-4 w-4 text-slate-500" />
                        </div>
                      )}
                      <span><span className="font-medium text-slate-700">{c.mechanic?.companyName}:</span> {c.question}
                      {c.answer && (
                        <>
                          <br />
                          <span className="text-slate-600">Your answer: {c.answer}</span>
                        </>
                      )}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ) : (
          <p className="text-slate-500 text-sm">No extra details were added for this job.</p>
        )}
      </div>

      {/* Quotes from mechanics (when still REQUESTED) — real-time updates */}
      {booking.status === 'REQUESTED' && Array.isArray(booking.quotes) && booking.quotes.length > 0 && (
        <div className="card p-5 mb-6">
          <h2 className="text-lg font-semibold text-slate-800 mb-3">Quotes from mechanics</h2>
          <p className="text-sm text-slate-600 mb-4">Accept one or reject any you don’t want.</p>
          <ul className="space-y-3">
            {booking.quotes
              .filter((q: any) => q.status === 'PENDING')
              .map((q: any) => (
                <li
                  key={q.id}
                  className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100"
                >
                  <div className="flex items-center gap-3">
                    {q.mechanic?.profile?.avatar ? (
                      <img src={q.mechanic.profile.avatar} alt="" className="h-10 w-10 rounded-full object-cover border border-slate-200 shrink-0" />
                    ) : (
                      <div className="h-10 w-10 rounded-full bg-slate-200 flex items-center justify-center shrink-0">
                        <Wrench className="h-5 w-5 text-slate-500" />
                      </div>
                    )}
                    <div>
                      <p className="font-medium text-slate-800">
                        {q.mechanic?.companyName} · {q.mechanic?.ownerFullName}
                      </p>
                    <p className="text-sm font-semibold text-primary-600">
                        ₦{Number(q.proposedPrice).toLocaleString()}
                      </p>
                      {q.message && (
                        <p className="text-sm text-slate-600 mt-1">{q.message}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => rejectQuote(q.id)}
                      disabled={quoteActionLoading != null}
                      className="px-3 py-1.5 text-sm font-medium text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-100 disabled:opacity-60"
                    >
                      Reject
                    </button>
                    <button
                      type="button"
                      onClick={() => acceptQuote(q.id)}
                      disabled={quoteActionLoading != null}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 disabled:opacity-60"
                    >
                      {quoteActionLoading === q.id ? (
                        <span className="inline-block h-3.5 w-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <CheckCircle2 className="h-4 w-4" />
                      )}
                      Accept
                    </button>
                  </div>
                </li>
              ))}
          </ul>
          {booking.quotes.filter((q: any) => q.status === 'PENDING').length === 0 && (
            <p className="text-sm text-slate-500">No pending quotes. Accept one above or wait for more.</p>
          )}
        </div>
      )}

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

      {/* Chat — only after a quote has been accepted */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-slate-800 mb-3">Conversation</h2>
        {booking.mechanicId ? (
          <BookingChat
            messages={messages}
            currentUserId={currentUser?.id ?? ''}
            otherPartyName={otherPartyName}
            onSend={sendMessage}
            placeholder="Type a message..."
          />
        ) : (
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6 text-center text-slate-600">
            <p className="font-medium text-slate-700">Chat is available after you accept a quote</p>
            <p className="mt-1 text-sm">Accept one of the quotes above to start the conversation with that mechanic.</p>
          </div>
        )}
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
                type="button"
                onClick={submitRating}
                disabled={ratingSubmitting}
                className="btn-primary flex-1 inline-flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {ratingSubmitting ? (
                  <>
                    <span className="inline-block h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Submitting…
                  </>
                ) : (
                  'Submit'
                )}
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
