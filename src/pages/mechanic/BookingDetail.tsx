import { useState, useEffect, useRef, useMemo } from 'react'
import { useParams, Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import { bookingsAPI, getApiErrorMessage } from '../../services/api'
import { connectSocket, getSocket, onQuoteEvents, onBookingStatusChanged } from '../../services/socket'
import { useAuthStore } from '../../store/authStore'
import { BookingChat } from '../../components/BookingChat'
import LoadingSpinner from '../../components/LoadingSpinner'
import RepairTypeIcon from '../../components/RepairTypeIcon'
import { mechanicBookingGuidance, quoteStatusLabel } from '../../lib/bookingStatusCopy'
import { ArrowLeft, MapPin, User, MessageCircle, HelpCircle, ImageIcon } from 'lucide-react'
import {
  PricingBreakdownFields,
  pricingTotal,
  type PricingBreakdownValues,
} from '../../components/PricingBreakdownFields'
import { PricingBreakdownSummary } from '../../components/PricingBreakdownSummary'
import { MechanicCostStatusBanner } from '../../components/MechanicCostStatusBanner'
import { canShowBookingContactPhone, customerPhone } from '../../lib/bookingContact'
import { isLabourMissing, LABOUR_REQUIRED_MESSAGE } from '../../lib/priceBreakdownDisplay'
import { defaultPricingBreakdown } from '../../components/PricingBreakdownFields'
import { activePartLines, partLinesFromQuote, partsPayload } from '../../lib/partLineItems'

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
  const [statusUpdating] = useState(false)
  const [quoteBreakdown, setQuoteBreakdown] = useState<PricingBreakdownValues>(defaultPricingBreakdown())
  const [invoiceBreakdown, setInvoiceBreakdown] = useState<PricingBreakdownValues>(defaultPricingBreakdown())
  const [quoteType, setQuoteType] = useState<'STANDARD' | 'INSPECTION'>('STANDARD')
  const [quoteMessage, setQuoteMessage] = useState('')
  const [invoiceSubmitting, setInvoiceSubmitting] = useState(false)
  const [submittingInvoice, setSubmittingInvoice] = useState(false)
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
    const unsubPaid = onBookingStatusChanged((p) => {
      if (p.bookingId === id) loadBookingRef.current()
    })
    return () => {
      if (socket) socket.off('new_message')
      unsub()
      unsubPaid()
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
        setQuoteType(q.quoteType === 'INSPECTION' ? 'INSPECTION' : 'STANDARD')
        const qLines = partLinesFromQuote(q)
        setQuoteBreakdown({
          partsCost: String(q.partsNaira ?? 0),
          partLineItems: qLines.length ? qLines : defaultPricingBreakdown().partLineItems,
          labourCost:
            q.labourNaira != null ? String(q.labourNaira) : String(q.proposedPrice ?? ''),
          otherFees: q.otherFeesNaira != null ? String(q.otherFeesNaira) : '0',
        })
        setQuoteMessage(q.message || '')
      }
      const inv = res.data.activeInvoice
      if (inv) {
        const iLines = partLinesFromQuote(inv)
        setInvoiceBreakdown({
          partsCost: String(inv.partsNaira ?? 0),
          partLineItems: iLines.length ? iLines : defaultPricingBreakdown().partLineItems,
          labourCost: String(inv.labourNaira ?? 0),
          otherFees: String(inv.otherFeesNaira ?? 0),
        })
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
    if (!id) return
    const isInspection = quoteType === 'INSPECTION'
    const total = isInspection
      ? parseFloat(quoteBreakdown.labourCost) || 0
      : pricingTotal(quoteBreakdown)
    if (total <= 0) {
      toast.error(isInspection ? 'Enter an inspection / diagnosis fee' : 'Enter parts, labour, or other fees')
      return
    }
    if (!isInspection && isLabourMissing(parseFloat(quoteBreakdown.labourCost) || 0)) {
      toast.error(LABOUR_REQUIRED_MESSAGE)
      return
    }
    const parts = isInspection ? { partsCost: 0, partsLineItems: [] } : partsPayload(quoteBreakdown.partLineItems)
    if (!isInspection && parts.partsCost > 0 && activePartLines(quoteBreakdown.partLineItems).length === 0) {
      toast.error('List each part with its price so the customer knows what they are paying for.')
      return
    }
    const payload = isInspection
      ? {
          quoteType: 'INSPECTION' as const,
          partsCost: 0,
          labourCost: total,
          otherFees: 0,
        }
      : {
          quoteType: 'STANDARD' as const,
          ...parts,
          labourCost: parseFloat(quoteBreakdown.labourCost) || 0,
          otherFees: parseFloat(quoteBreakdown.otherFees) || 0,
        }
    setQuoteSubmitting(true)
    try {
      if (myQuote?.id) {
        await bookingsAPI.updateQuote(id, myQuote.id, payload)
        toast.success('Quote updated')
      } else {
        await bookingsAPI.createQuote(id, {
          ...payload,
          message: quoteMessage.trim() || undefined,
        })
        toast.success(isInspection ? 'Inspection quote submitted' : 'Quote submitted')
      }
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

  const saveInvoice = async () => {
    if (!id) return
    const labour = parseFloat(invoiceBreakdown.labourCost) || 0
    const total = pricingTotal(invoiceBreakdown)
    if (isLabourMissing(labour)) {
      toast.error(LABOUR_REQUIRED_MESSAGE)
      return
    }
    if (total <= 0) {
      toast.error('Enter a valid cost breakdown')
      return
    }
    const parts = partsPayload(invoiceBreakdown.partLineItems)
    if (parts.partsCost > 0 && activePartLines(invoiceBreakdown.partLineItems).length === 0) {
      toast.error('List each part with its price so the customer knows what they are paying for.')
      return
    }
    setInvoiceSubmitting(true)
    try {
      await bookingsAPI.upsertInvoice(id, {
        ...parts,
        labourCost: parseFloat(invoiceBreakdown.labourCost) || 0,
        otherFees: parseFloat(invoiceBreakdown.otherFees) || 0,
      })
      toast.success('Draft saved')
      loadBooking()
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Failed to save costing'))
    } finally {
      setInvoiceSubmitting(false)
    }
  }

  const submitRepairInvoice = async () => {
    if (!id) return
    if (isLabourMissing(parseFloat(invoiceBreakdown.labourCost) || 0)) {
      toast.error(LABOUR_REQUIRED_MESSAGE)
      return
    }
    setSubmittingInvoice(true)
    try {
      await bookingsAPI.submitInvoice(id)
      toast.success('Repair quote sent to customer for approval')
      loadBooking()
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Failed to submit repair quote'))
    } finally {
      setSubmittingInvoice(false)
    }
  }

  const isInspectionJob = booking?.acceptedQuote?.quoteType === 'INSPECTION'
  const isOwnActiveJob =
    booking?.mechanicId === currentUser?.id &&
    ['ACCEPTED', 'IN_PROGRESS'].includes(booking?.status ?? '') &&
    !booking?.paidAt
  const inspectionPaymentPending =
    Boolean(isInspectionJob && isOwnActiveJob && !booking?.inspectionPaidAt)
  const canEditRepairCosting =
    Boolean(isOwnActiveJob && (!isInspectionJob || booking?.inspectionPaidAt))
  const repairInvoiceStatus = booking?.activeInvoice?.status
  const repairInvoiceLocked =
    repairInvoiceStatus === 'SUBMITTED' || repairInvoiceStatus === 'ACCEPTED'

  const canSetInvoice = canEditRepairCosting

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
  const showCustomerPhone = canShowBookingContactPhone(booking)
  const customerPhoneNumber = showCustomerPhone ? customerPhone(booking.user) : undefined
  const canStartWork =
    status === 'ACCEPTED' && (!isInspectionJob || Boolean(booking.inspectionPaidAt))

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
              <div className="flex flex-wrap items-center gap-2 mt-3">
              <User className="h-4 w-4 text-slate-400" />
              <span className="text-sm font-medium text-slate-700">{customerName}</span>
              {customerPhoneNumber ? (
                <a
                  href={`tel:${customerPhoneNumber.replace(/\s/g, '')}`}
                  className="text-sm font-medium text-primary-600 hover:text-primary-700"
                >
                  Call customer
                </a>
              ) : null}
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
                Job sent to you. Review details before quoting
              </>
            ) : (
              <>
                <HelpCircle className="h-4 w-4 text-primary-600" />
                Job details: use this to set your price
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
                Up to 3 questions per job (10 total on open jobs). The customer answers from their booking page.
              </p>
            </>
          )}
        </div>

        {/* Open request: submit or update your price (real-time) */}
        {canQuoteWhileRequested && (
          <div className="mt-4 p-4 rounded-xl bg-slate-50 border border-slate-100">
            <h3 className="font-medium text-slate-800 mb-2">
              {myQuote ? 'Step 1: Revise your bid' : 'Step 1: Submit your bid for this job'}
            </h3>
            <div className="flex flex-wrap gap-2 mb-3">
              <button
                type="button"
                onClick={() => setQuoteType('STANDARD')}
                className={`px-3 py-1.5 rounded-full text-sm font-medium border ${
                  quoteType === 'STANDARD'
                    ? 'bg-primary-600 text-white border-primary-600'
                    : 'bg-white text-slate-700 border-slate-200'
                }`}
              >
                Full repair quote
              </button>
              <button
                type="button"
                onClick={() => setQuoteType('INSPECTION')}
                className={`px-3 py-1.5 rounded-full text-sm font-medium border ${
                  quoteType === 'INSPECTION'
                    ? 'bg-primary-600 text-white border-primary-600'
                    : 'bg-white text-slate-700 border-slate-200'
                }`}
              >
                Inspection visit
              </button>
            </div>
            {quoteType === 'INSPECTION' ? (
              <>
                <p className="text-sm text-slate-600 mb-3">
                  Charge a diagnosis fee to visit and inspect. Submit the full repair quote after the on-site check.
                </p>
                <label className="block text-sm font-medium text-slate-600 mb-1">
                  Inspection / diagnosis fee (₦)
                </label>
                <input
                  type="number"
                  min="0"
                  value={quoteBreakdown.labourCost}
                  onChange={(e) => setQuoteBreakdown((v) => ({ ...v, labourCost: e.target.value, partsCost: '0', otherFees: '0' }))}
                  className="w-full max-w-xs px-3 py-2 border border-slate-200 rounded-lg text-sm mb-3"
                />
              </>
            ) : (
              <PricingBreakdownFields
                values={quoteBreakdown}
                onChange={setQuoteBreakdown}
                baseline={
                  myQuote
                    ? {
                        partsNaira: Number(myQuote.partsNaira ?? 0),
                        labourNaira: Number(myQuote.labourNaira ?? myQuote.proposedPrice ?? 0),
                        otherFeesNaira: Number(myQuote.otherFeesNaira ?? 0),
                        totalNaira: Number(myQuote.proposedPrice ?? 0),
                        label: 'Your current bid',
                      }
                    : null
                }
              />
            )}
            <div className="flex flex-wrap gap-3 items-end mt-3">
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
                  'Update bid price'
                ) : (
                  'Submit bid'
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
                      {q.mechanic?.companyName ?? 'Mechanic'} · {'\u20A6'}
                      {Number(q.proposedPrice).toLocaleString()} · {quoteStatusLabel(q.status)}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {status !== 'REQUESTED' && (
          <div className="mt-4 flex flex-wrap gap-2 items-center">
            {status === 'ACCEPTED' && (
              <>
                <button
                  type="button"
                  onClick={() => updateStatus('IN_PROGRESS')}
                  disabled={!canStartWork || statusUpdating}
                  title={
                    !canStartWork && isInspectionJob
                      ? 'Customer must pay the inspection fee first'
                      : undefined
                  }
                  className="inline-flex items-center gap-2 px-4 py-2.5 bg-violet-600 text-white rounded-xl hover:bg-violet-700 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
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
                {!canStartWork && isInspectionJob ? (
                  <p className="text-sm text-amber-700 w-full sm:w-auto">
                    Available after the customer pays the inspection fee.
                  </p>
                ) : null}
              </>
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

        {booking.pricingSummary && (
          <div className="mt-4 pt-4 border-t border-slate-100">
            <PricingBreakdownSummary summary={booking.pricingSummary} />
          </div>
        )}
        {inspectionPaymentPending ? (
          <div className="mt-4 pt-4 border-t border-slate-100">
            <h3 className="font-medium text-slate-800 mb-2">Full repair quote</h3>
            <p className="text-sm text-amber-800 mb-3 border-l-4 border-amber-300 pl-3">
              The customer pays the inspection fee before you can submit the full repair quote.
            </p>
            <div className="pointer-events-none opacity-50 select-none" aria-hidden>
              <PricingBreakdownFields values={invoiceBreakdown} onChange={() => {}} />
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              <button
                type="button"
                disabled
                className="px-4 py-2.5 bg-slate-200 text-slate-500 rounded-xl text-sm font-medium cursor-not-allowed"
              >
                Save draft
              </button>
              <button
                type="button"
                disabled
                className="px-4 py-2.5 border border-slate-200 text-slate-400 rounded-xl text-sm font-medium cursor-not-allowed"
              >
                Send to customer for approval
              </button>
            </div>
          </div>
        ) : null}
        {canSetInvoice && (
          <div className="mt-4 pt-4 border-t border-slate-100">
            <h3 className="font-medium text-slate-800 mb-2">
              {isInspectionJob ? 'Step 2: Full repair quote (after visit)' : 'Step 2: Job costing (customer approves changes)'}
            </h3>
            <p className="text-sm text-slate-500 mb-3">
              {isInspectionJob
                ? 'After the visit, break down the full repair cost. The customer pays only the balance after accepting. They already paid the inspection fee separately.'
                : 'If the final cost differs from your accepted bid, save a draft and send it for customer approval before they pay.'}
            </p>
            {booking.paymentSummary?.inspectionPaidNaira ? (
              <p className="text-sm text-emerald-800 mb-3 border-l-4 border-emerald-300 pl-3">
                Customer already paid ₦{Number(booking.paymentSummary.inspectionPaidNaira).toLocaleString()} for
                inspection.
              </p>
            ) : null}
            <MechanicCostStatusBanner
              status={repairInvoiceStatus}
              rejectionReason={booking.activeInvoice?.rejectionReason}
              balanceDueNaira={booking.paymentSummary?.balanceDueNaira}
            />
            <div className={repairInvoiceLocked ? 'pointer-events-none opacity-60 select-none' : undefined}>
              <PricingBreakdownFields
                values={invoiceBreakdown}
                onChange={setInvoiceBreakdown}
                baseline={booking.pricingBaseline}
              />
            </div>
            <p className="mt-2 text-sm font-medium text-slate-700">
              Total: ₦{pricingTotal(invoiceBreakdown).toLocaleString()}
            </p>
            {isInspectionJob && booking.inspectionPaidAmount ? (
              <p className="mt-1 text-sm text-slate-600">
                Customer pays after acceptance: ₦
                {Math.max(
                  0,
                  pricingTotal(invoiceBreakdown) - Number(booking.inspectionPaidAmount),
                ).toLocaleString()}{' '}
                (full repair ₦{pricingTotal(invoiceBreakdown).toLocaleString()} minus inspection paid)
              </p>
            ) : booking.pricingBaseline && !isInspectionJob ? (
              <p className="mt-1 text-sm text-slate-600">
                Previously agreed: ₦{Number(booking.pricingBaseline.totalNaira).toLocaleString()}
              </p>
            ) : null}
            <div className="mt-3 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={saveInvoice}
                disabled={invoiceSubmitting || repairInvoiceLocked}
                className="px-4 py-2.5 bg-primary-600 text-white rounded-xl text-sm font-medium hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {invoiceSubmitting ? 'Saving…' : 'Save draft'}
              </button>
              {(repairInvoiceStatus === 'DRAFT' || !repairInvoiceStatus) && (
                <button
                  type="button"
                  onClick={() => void submitRepairInvoice()}
                  disabled={submittingInvoice || invoiceSubmitting || repairInvoiceLocked}
                  className="px-4 py-2.5 border border-primary-600 text-primary-700 rounded-xl text-sm font-medium hover:bg-primary-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submittingInvoice ? 'Sending…' : 'Send to customer for approval'}
                </button>
              )}
              {repairInvoiceStatus === 'SUBMITTED' ? (
                <span className="self-center text-sm text-amber-700 font-medium">
                  Awaiting customer approval
                </span>
              ) : null}
              {repairInvoiceStatus === 'ACCEPTED' ? (
                <span className="self-center text-sm text-emerald-700 font-medium">
                  Customer accepted. Awaiting balance payment
                </span>
              ) : null}
            </div>
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
