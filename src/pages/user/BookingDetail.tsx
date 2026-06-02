import { useState, useEffect, useRef, useMemo } from 'react'
import { useParams, Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import { bookingsAPI, ratingsAPI, walletAPI, getApiErrorMessage, configAPI, usersAPI } from '../../services/api'
import { connectSocket, getSocket, onQuoteEvents, onBookingStatusChanged } from '../../services/socket'
import { useAuthStore } from '../../store/authStore'
import { BookingChat } from '../../components/BookingChat'
import LoadingSpinner from '../../components/LoadingSpinner'
import RepairTypeIcon from '../../components/RepairTypeIcon'
import { userBookingGuidance, quoteStatusLabel } from '../../lib/bookingStatusCopy'
import { isQuoteInspection, quoteTypeLabel } from '../../lib/jobPostingValidation'
import { canShowBookingContactPhone, mechanicPhone } from '../../lib/bookingContact'
import { PricingBreakdownSummary } from '../../components/PricingBreakdownSummary'
import {
  CustomerPriceBreakdownPanel,
  quoteToPriceBreakdownLines,
} from '../../components/CustomerPriceBreakdownPanel'
import { BookingWhatsNextCard } from '../../components/BookingWhatsNextCard'
import { buildCustomerWhatsNext } from '../../lib/bookingWhatsNext'
import {
  ArrowLeft,
  CheckCircle2,
  CreditCard,
  Banknote,
  MapPin,
  MessageCircle,
  Star,
  Wrench,
  X,
  ImagePlus,
  Flag,
  AlertTriangle,
  Ban,
} from 'lucide-react'

const statusStyles: Record<string, string> = {
  REQUESTED: 'bg-amber-100 text-amber-800',
  EXPIRED: 'bg-slate-200 text-slate-700',
  ACCEPTED: 'bg-primary-100 text-primary-800',
  IN_PROGRESS: 'bg-violet-100 text-violet-800',
  DONE: 'bg-emerald-100 text-emerald-800',
  PAID: 'bg-slate-100 text-slate-800',
  DELIVERED: 'bg-emerald-100 text-emerald-800',
}

const MAX_BOOKING_PHOTOS = 3
const MAX_PHOTO_BYTES = 5 * 1024 * 1024

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
  const [acceptingInvoice, setAcceptingInvoice] = useState(false)
  const [rejectingInvoice, setRejectingInvoice] = useState(false)
  const [rejectReason, setRejectReason] = useState('')
  const [publicFlags, setPublicFlags] = useState<Record<string, boolean | number | string> | null>(null)
  const [photoUploading, setPhotoUploading] = useState(false)
  const [reportOpen, setReportOpen] = useState(false)
  const [disputeOpen, setDisputeOpen] = useState(false)
  const [reportReason, setReportReason] = useState('')
  const [reportDetails, setReportDetails] = useState('')
  const [disputeReason, setDisputeReason] = useState('')
  const [reportSubmitting, setReportSubmitting] = useState(false)
  const [disputeSubmitting, setDisputeSubmitting] = useState(false)
  const [blockSubmitting, setBlockSubmitting] = useState(false)
  const loadBookingRef = useRef<() => Promise<void>>(() => Promise.resolve())

  const paymentsEnabled = publicFlags?.paymentsEnabled !== false

  useEffect(() => {
    configAPI
      .getPublic()
      .then((r) => {
        const d = r.data as Record<string, unknown> & { flags?: Record<string, boolean | number | string> }
        setPublicFlags(d?.flags ?? (d as Record<string, boolean | number | string>))
      })
      .catch(() => setPublicFlags({}))
  }, [])

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
      toast.success('Quote accepted')
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

  const guidanceLine = useMemo(() => {
    if (!booking) return ''
    const paid = Boolean(booking.paidAt || booking.status === 'PAID' || booking.status === 'DELIVERED')
    return userBookingGuidance(booking.status, {
      hasMechanic: Boolean(booking.mechanicId),
      paid,
    })
  }, [booking])

  const whatsNext = useMemo(() => {
    if (!booking) return null
    const pending = (booking.quotes ?? []).filter((q: any) => q.status === 'PENDING').length
    return buildCustomerWhatsNext({
      status: booking.status,
      pendingQuoteCount: pending,
      hasAssignedMechanic: Boolean(booking.mechanicId),
      assignedMechanicName: booking.mechanic?.companyName,
      paymentSummary: booking.paymentSummary,
      showAcceptRepairInvoice: booking.paymentSummary?.phase === 'review_repair_invoice',
      paidAt: booking.paidAt,
    })
  }, [booking])

  const historicalQuotes = useMemo(() => {
    if (!booking?.quotes?.length) return []
    return [...booking.quotes]
      .filter((q: any) => q.status && q.status !== 'PENDING')
      .sort(
        (a: any, b: any) =>
          new Date(b.updatedAt || b.createdAt).getTime() - new Date(a.updatedAt || a.createdAt).getTime()
      )
  }, [booking?.quotes])

  const directRequestNoQuote24h = useMemo(() => {
    if (!booking || booking.status !== 'REQUESTED' || !booking.mechanicId) return false
    const created = new Date(booking.createdAt).getTime()
    const hasQuoteFromAssigned = booking.quotes?.some(
      (q: any) => (q.mechanicId === booking.mechanicId || q.mechanic?.id === booking.mechanicId) &&
        ['PENDING', 'ACCEPTED'].includes(q.status)
    )
    if (hasQuoteFromAssigned) return false
    return Date.now() - created >= 24 * 60 * 60 * 1000
  }, [booking])

  const photoUrls: string[] = Array.isArray(booking?.photoUrls) ? booking.photoUrls : []
  const showMechanicPhone = booking ? canShowBookingContactPhone(booking) : false
  const mechanicPhoneNumber = showMechanicPhone ? mechanicPhone(booking?.mechanic) : undefined

  const handlePhotoFiles = async (files: FileList | null) => {
    if (!id || !files?.length) return
    const next: File[] = []
    for (let i = 0; i < files.length; i++) {
      const f = files[i]
      if (!f.type.startsWith('image/')) {
        toast.error('Please choose image files only')
        return
      }
      if (f.size > MAX_PHOTO_BYTES) {
        toast.error('Each photo must be under 5MB')
        return
      }
      next.push(f)
    }
    const room = MAX_BOOKING_PHOTOS - photoUrls.length
    if (room <= 0) {
      toast.error(`You can add up to ${MAX_BOOKING_PHOTOS} photos`)
      return
    }
    const toUpload = next.slice(0, room)
    setPhotoUploading(true)
    try {
      await bookingsAPI.uploadBookingPhotos(id, toUpload)
      toast.success('Photos uploaded')
      loadBooking()
    } catch (e) {
      toast.error(getApiErrorMessage(e, 'Upload failed. Check your connection and try again'))
    } finally {
      setPhotoUploading(false)
    }
  }

  const submitReport = async () => {
    if (!id || !reportReason.trim()) {
      toast.error('Please choose or enter a reason')
      return
    }
    setReportSubmitting(true)
    try {
      await bookingsAPI.reportBooking(id, reportReason.trim(), reportDetails.trim() || undefined)
      toast.success('Report submitted')
      setReportOpen(false)
      setReportReason('')
      setReportDetails('')
    } catch (e) {
      toast.error(getApiErrorMessage(e, 'Could not submit report'))
    } finally {
      setReportSubmitting(false)
    }
  }

  const submitDispute = async () => {
    if (!id || !disputeReason.trim()) {
      toast.error('Please describe what went wrong')
      return
    }
    setDisputeSubmitting(true)
    try {
      await bookingsAPI.disputeBooking(id, disputeReason.trim())
      toast.success('We recorded your dispute')
      setDisputeOpen(false)
      setDisputeReason('')
      loadBooking()
    } catch (e) {
      toast.error(getApiErrorMessage(e, 'Could not submit dispute'))
    } finally {
      setDisputeSubmitting(false)
    }
  }

  const blockMechanic = async () => {
    if (!booking?.mechanic?.id) return
    if (!window.confirm('Block this mechanic? They will not appear in your searches.')) return
    setBlockSubmitting(true)
    try {
      await usersAPI.blockMechanic(booking.mechanic.id)
      toast.success('Mechanic blocked')
    } catch (e) {
      toast.error(getApiErrorMessage(e, 'Could not block'))
    } finally {
      setBlockSubmitting(false)
    }
  }

  const acceptInvoice = async () => {
    if (!id) return
    setAcceptingInvoice(true)
    try {
      await bookingsAPI.acceptInvoice(id)
      toast.success('Repair quote accepted')
      loadBooking()
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Failed to accept repair quote'))
    } finally {
      setAcceptingInvoice(false)
    }
  }

  const rejectInvoice = async () => {
    if (!id) return
    const reason = rejectReason.trim()
    if (reason.length < 3) {
      toast.error('Please tell the mechanic why you are declining (at least a few words).')
      return
    }
    setRejectingInvoice(true)
    try {
      await bookingsAPI.rejectInvoice(id, reason)
      toast.success('Quote declined. The mechanic can send an updated quote')
      setRejectReason('')
      loadBooking()
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Failed to decline repair quote'))
    } finally {
      setRejectingInvoice(false)
    }
  }

  const payWithPaystack = async () => {
    if (!booking) return
    setPaymentLoading('paystack')
    const run = async () => {
      const { data } = await walletAPI.initializePayment(booking.id)
      if (data?.authorizationUrl) {
        window.location.href = data.authorizationUrl
        return true
      }
      return false
    }
    try {
      const ok = await run()
      if (!ok) toast.error('Could not start payment')
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Failed to start payment'))
      toast((t) => (
        <span className="flex flex-wrap items-center gap-2">
          Payment could not start.
          <button
            type="button"
            className="font-semibold text-primary-600 underline"
            onClick={() => {
              toast.dismiss(t.id)
              void payWithPaystack()
            }}
          >
            Retry
          </button>
        </span>
      ))
    } finally {
      setPaymentLoading(null)
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
  const showAcceptRepairInvoice = booking.paymentSummary?.phase === 'review_repair_invoice'
  const showActivePayment =
    paymentsEnabled &&
    booking.paymentSummary &&
    (booking.paymentSummary.canPayInspection ||
      booking.paymentSummary.canPayRepairBalance ||
      booking.paymentSummary.canPayStandard) &&
    ['ACCEPTED', 'IN_PROGRESS', 'DONE'].includes(booking.status)
  const reviewQuoteTotalNaira =
    booking.paymentSummary?.pendingRepairTotalNaira ??
    booking.activeInvoice?.customerTotalNaira ??
    null

  const invForBreakdown = booking.activeInvoice
  const psForBreakdown = booking.paymentSummary
  const summaryForBreakdown = booking.pricingSummary
  const breakdownTotalNaira =
    reviewQuoteTotalNaira ??
    invForBreakdown?.customerTotalNaira ??
    summaryForBreakdown?.customerTotalNaira ??
    null
  const customerBreakdownLines =
    breakdownTotalNaira != null
      ? {
          partsNaira: Number(invForBreakdown?.partsNaira ?? summaryForBreakdown?.partsNaira ?? 0),
          labourNaira: Number(invForBreakdown?.labourNaira ?? summaryForBreakdown?.labourNaira ?? 0),
          otherFeesNaira: Number(invForBreakdown?.otherFeesNaira ?? summaryForBreakdown?.otherFeesNaira ?? 0),
          totalNaira: Number(breakdownTotalNaira),
          inspectionPaidNaira:
            psForBreakdown?.inspectionPaidNaira > 0 ? Number(psForBreakdown.inspectionPaidNaira) : undefined,
          balanceDueNaira:
            psForBreakdown?.balanceDueNaira != null ? Number(psForBreakdown.balanceDueNaira) : undefined,
          previouslyAgreedNaira:
            booking.pricingBaseline?.totalNaira != null
              ? Number(booking.pricingBaseline.totalNaira)
              : undefined,
        }
      : null

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
          <div className="flex items-start gap-3">
            <RepairTypeIcon fault={booking.fault} size="lg" />
            <div>
              <h1 className="text-xl font-semibold text-slate-800">
                {booking.vehicle?.brand} {booking.vehicle?.model}
              </h1>
              <p className="text-slate-600 mt-0.5">{booking.fault?.name}</p>
            {booking.mechanic && (
              <div className="flex flex-wrap items-center gap-3 mt-3">
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
                {mechanicPhoneNumber ? (
                  <a
                    href={`tel:${mechanicPhoneNumber.replace(/\s/g, '')}`}
                    className="text-sm font-medium text-primary-600 hover:text-primary-700"
                  >
                    Call mechanic
                  </a>
                ) : null}
              </div>
            )}
            </div>
          </div>
          <span
            className={`px-3 py-1.5 rounded-xl text-sm font-medium ${
              statusStyles[booking.status] ?? 'bg-slate-100 text-slate-700'
            }`}
          >
            {booking.status.replace('_', ' ')}
          </span>
        </div>
        {whatsNext ? (
          <BookingWhatsNextCard step={whatsNext} />
        ) : guidanceLine ? (
          <p className="mt-3 text-sm text-slate-700 leading-relaxed border-l-4 border-primary-200 pl-3">
            {guidanceLine}
          </p>
        ) : null}
        {booking.openRequestExpiresAt && booking.status === 'REQUESTED' && !booking.mechanicId && (
          <p className="mt-2 text-xs text-slate-500">
            Open requests close after{' '}
            {new Date(booking.openRequestExpiresAt).toLocaleString()}
            {new Date(booking.openRequestExpiresAt) < new Date()
              ? ' (expired. Refresh if status has not updated).'
              : '.'}
          </p>
        )}
        {booking.mechanic?.profile?.typicalResponseHours != null &&
          Number(booking.mechanic.profile.typicalResponseHours) > 0 &&
          booking.status === 'REQUESTED' &&
          booking.mechanicId && (
            <p className="mt-2 text-xs text-slate-600">
              Usually replies within {booking.mechanic.profile.typicalResponseHours} hour
              {Number(booking.mechanic.profile.typicalResponseHours) === 1 ? '' : 's'}.
            </p>
          )}
        {directRequestNoQuote24h && (
          <div className="mt-3 p-3 rounded-xl bg-slate-100 border border-slate-200 text-sm text-slate-700">
            It has been over 24 hours with no quote yet. You can wait a bit longer, message support, or post an open
            job for more mechanics.
          </div>
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
        {(booking.paidAt || booking.status === 'PAID' || booking.status === 'DELIVERED') && (
          <Link
            to={`/user/bookings/${booking.id}/receipt`}
            className="mt-3 inline-flex text-sm font-medium text-primary-600 hover:text-primary-700"
          >
            View payment summary / receipt
          </Link>
        )}
        {booking.pricingSummary ? (
          <div className="mt-3">
            <PricingBreakdownSummary summary={booking.pricingSummary} />
          </div>
        ) : booking.estimatedCost != null ? (
          <p className="mt-3 text-slate-700 font-medium">
            Estimated cost: ₦{Number(booking.estimatedCost).toLocaleString()}
          </p>
        ) : null}
        {showAcceptRepairInvoice && booking.activeInvoice ? (
          <div className="mt-4 p-4 rounded-xl bg-amber-50 border border-amber-200">
            {customerBreakdownLines ? (
              <CustomerPriceBreakdownPanel
                lines={customerBreakdownLines}
                title="Updated price breakdown"
                defaultOpen
              />
            ) : null}
            <div className="mt-3 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => void acceptInvoice()}
                disabled={acceptingInvoice || rejectingInvoice}
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-amber-600 text-white rounded-xl text-sm font-medium hover:bg-amber-700 disabled:opacity-70"
              >
                {acceptingInvoice ? (
                  <span className="inline-block h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <CheckCircle2 className="h-4 w-4" />
                )}
                Accept quote
              </button>
            </div>
            <div className="mt-4 pt-4 border-t border-amber-200">
              <p className="text-sm font-medium text-amber-900 mb-2">Decline this quote</p>
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="e.g. Price is higher than we discussed. Please revise labour."
                rows={3}
                className="w-full px-3 py-2 border border-amber-200 rounded-lg text-sm"
              />
              <button
                type="button"
                onClick={() => void rejectInvoice()}
                disabled={rejectingInvoice || acceptingInvoice}
                className="mt-2 inline-flex items-center gap-2 px-4 py-2.5 border border-amber-400 text-amber-900 rounded-xl text-sm font-medium hover:bg-amber-100 disabled:opacity-70"
              >
                {rejectingInvoice ? (
                  <span className="inline-block h-4 w-4 border-2 border-amber-700 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <X className="h-4 w-4" />
                )}
                Decline quote
              </button>
            </div>
          </div>
        ) : null}
        {showActivePayment && customerBreakdownLines && (
          <CustomerPriceBreakdownPanel
            lines={customerBreakdownLines}
            title="What you are paying for"
            defaultOpen
          />
        )}
        {showActivePayment && (
          <div className="mt-4 p-4 rounded-xl bg-slate-50 border border-slate-200">
            <p className="text-sm font-medium text-slate-700 mb-3">
              {booking.paymentSummary!.canPayInspection
                ? `Pay inspection fee: ₦${Number(booking.paymentSummary!.inspectionFeeNaira).toLocaleString()}`
                : booking.paymentSummary!.canPayRepairBalance
                  ? `Pay repair balance: ₦${Number(booking.paymentSummary!.balanceDueNaira).toLocaleString()}`
                  : 'Pay for this job'}
            </p>
            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => void payWithPaystack()}
                disabled={paymentLoading != null}
                className="inline-flex items-center gap-2 px-4 py-2.5 min-h-[48px] bg-primary-600 text-white rounded-xl text-sm font-medium hover:bg-primary-700 disabled:opacity-70"
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
                    toast((t) => (
                      <span className="flex flex-wrap items-center gap-2">
                        Could not update payment.
                        <button
                          type="button"
                          className="font-semibold text-primary-600 underline"
                          onClick={() => {
                            toast.dismiss(t.id)
                            void (async () => {
                              setPaymentLoading('direct')
                              try {
                                await walletAPI.markDirectPaid(booking.id)
                                toast.success('Marked as paid directly to mechanic')
                                loadBooking()
                              } catch (e2) {
                                toast.error(getApiErrorMessage(e2, 'Failed to update'))
                              } finally {
                                setPaymentLoading(null)
                              }
                            })()
                          }}
                        >
                          Retry
                        </button>
                      </span>
                    ))
                  } finally {
                    setPaymentLoading(null)
                  }
                }}
                disabled={paymentLoading != null}
                className="inline-flex items-center gap-2 px-4 py-2.5 min-h-[48px] border border-slate-300 text-slate-700 rounded-xl text-sm font-medium hover:bg-slate-50 disabled:opacity-70"
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
        {!paymentsEnabled &&
          ['ACCEPTED', 'IN_PROGRESS', 'DONE'].includes(booking.status) &&
          !booking.paidAt &&
          booking.estimatedCost != null &&
          booking.estimatedCost > 0 && (
            <p className="mt-3 text-sm text-slate-600">Online payments are not available in your region yet.</p>
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
          {booking.mechanicId && booking.status !== 'REQUESTED'
            ? 'Summary of what you shared before accepting a quote. The mechanic uses this for the job.'
            : 'Add or edit details so mechanics can give you a better price. They can also ask a few short questions.'}
        </p>
        {booking.status === 'REQUESTED' ? (
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
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Photos of the issue (optional, up to {MAX_BOOKING_PHOTOS}, max 5MB each)
              </label>
              {photoUrls.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-2">
                  {photoUrls.map((url: string) => (
                    <a key={url} href={url} target="_blank" rel="noopener noreferrer" className="block">
                      <img src={url} alt="" className="h-24 w-24 object-cover rounded-lg border border-slate-200" />
                    </a>
                  ))}
                </div>
              )}
              <label className="inline-flex items-center gap-2 px-4 py-2.5 min-h-[48px] rounded-xl border border-slate-200 bg-white text-sm font-medium text-slate-700 cursor-pointer hover:bg-slate-50">
                <ImagePlus className="h-4 w-4 text-primary-600" />
                {photoUploading ? 'Uploading…' : 'Add photos'}
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  multiple
                  className="sr-only"
                  disabled={photoUploading || photoUrls.length >= MAX_BOOKING_PHOTOS}
                  onChange={(e) => void handlePhotoFiles(e.target.files)}
                />
              </label>
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
        ) : booking.status !== 'REQUESTED' &&
          (booking.description ||
            (Array.isArray(booking.clarifications) && booking.clarifications.length > 0) ||
            photoUrls.length > 0) ? (
          <div className="space-y-4">
            {booking.description && (
              <div>
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Your description</p>
                <p className="text-slate-700 mt-0.5 whitespace-pre-wrap">{booking.description}</p>
              </div>
            )}
            {photoUrls.length > 0 && (
              <div>
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-2">Photos you shared</p>
                <div className="flex flex-wrap gap-2">
                  {photoUrls.map((url: string) => (
                    <a key={url} href={url} target="_blank" rel="noopener noreferrer">
                      <img src={url} alt="" className="h-28 w-28 object-cover rounded-lg border border-slate-200" />
                    </a>
                  ))}
                </div>
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

      {booking.status === 'REQUESTED' &&
        booking.mechanicId &&
        Array.isArray(booking.quotes) &&
        booking.quotes.filter((q: any) => q.status === 'PENDING').length === 0 && (
          <div className="card p-4 mb-6 border-amber-100 bg-amber-50/80">
            <p className="text-sm font-medium text-amber-900">
              Waiting for {booking.mechanic?.companyName ?? 'the mechanic'} to send a quote
            </p>
            <p className="text-sm text-amber-800/90 mt-1">
              You’ll be able to chat once you accept their price.
            </p>
          </div>
        )}

      {/* Quotes from mechanics (when still REQUESTED) — real-time updates */}
      {booking.status === 'REQUESTED' && Array.isArray(booking.quotes) && booking.quotes.length > 0 && (
        <div className="card p-5 mb-6">
          <h2 className="text-lg font-semibold text-slate-800 mb-3">Quotes from mechanics</h2>
          <p className="text-sm text-slate-600 mb-2">Accept one or reject any you don’t want.</p>
          <p className="text-xs text-slate-500 mb-4">
            Mechanics can update their price a limited number of times after your answers or new details. Check back
            if a quote changes.
          </p>
          <ul className="space-y-3">
            {booking.quotes
              .filter((q: any) => q.status === 'PENDING')
              .map((q: any) => {
                const quoteMechPhone = mechanicPhone(q.mechanic)
                const quoteBreakdown = quoteToPriceBreakdownLines(q)
                return (
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
                      {isQuoteInspection(q) ? (
                        <span className="inline-block mt-1 text-xs font-semibold text-primary-700 bg-primary-50 px-2 py-0.5 rounded-md">
                          {quoteTypeLabel(q)}
                        </span>
                      ) : null}
                    <p className="text-sm font-semibold text-primary-600">
                        ₦{Number(q.customerTotalNaira ?? q.proposedPrice).toLocaleString()}
                        {isQuoteInspection(q) ? ' inspection fee' : ' total'}
                      </p>
                      {isQuoteInspection(q) ? (
                        <p className="text-xs text-slate-500 mt-1">
                          Full repair quote after the mechanic checks your vehicle on site.
                        </p>
                      ) : null}
                      {quoteBreakdown ? (
                        <CustomerPriceBreakdownPanel
                          lines={quoteBreakdown}
                          title="Quote breakdown"
                          defaultOpen={
                            booking.quotes.filter((x: any) => x.status === 'PENDING').length === 1
                          }
                        />
                      ) : null}
                      {q.message && (
                        <p className="text-sm text-slate-600 mt-1">{q.message}</p>
                      )}
                      {quoteMechPhone ? (
                        <a
                          href={`tel:${quoteMechPhone.replace(/\s/g, '')}`}
                          className="inline-flex items-center gap-1 text-sm font-medium text-primary-600 hover:text-primary-700 mt-2"
                        >
                          Call mechanic
                        </a>
                      ) : null}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => rejectQuote(q.id)}
                      disabled={quoteActionLoading != null}
                      className="px-4 py-2.5 min-h-[48px] text-sm font-medium text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-100 disabled:opacity-60"
                    >
                      Reject
                    </button>
                    <button
                      type="button"
                      onClick={() => acceptQuote(q.id)}
                      disabled={quoteActionLoading != null}
                      className="inline-flex items-center gap-1.5 px-4 py-2.5 min-h-[48px] text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 disabled:opacity-60"
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
                )
              })}
          </ul>
          {booking.quotes.filter((q: any) => q.status === 'PENDING').length === 0 && (
            <p className="text-sm text-slate-500">No pending quotes. Accept one above or wait for more.</p>
          )}
        </div>
      )}

      {historicalQuotes.length > 0 && (
        <div className="card p-5 mb-6 border-slate-200 bg-slate-50/50">
          <h2 className="text-lg font-semibold text-slate-800 mb-2">Earlier quotes (read-only)</h2>
          <p className="text-sm text-slate-600 mb-3">Withdrawn or rejected quotes stay visible for your records.</p>
          <ul className="space-y-2 text-sm">
            {historicalQuotes.map((q: any) => (
              <li
                key={q.id}
                className="flex flex-wrap justify-between gap-2 py-2 border-b border-slate-200 last:border-0"
              >
                <span className="text-slate-700">
                  {q.mechanic?.companyName ?? 'Mechanic'} · {'\u20A6'}
                  {Number(q.proposedPrice).toLocaleString()}
                </span>
                <span className="text-slate-500 font-medium">{quoteStatusLabel(q.status)}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {booking.status !== 'EXPIRED' && (
        <div className="card p-5 mb-6 border-slate-200">
          <h2 className="text-lg font-semibold text-slate-800 mb-2">Safety &amp; support</h2>
          <p className="text-sm text-slate-600 mb-4">
            Report problems with this job or user. For payment or quality issues, you can open a dispute.
          </p>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setReportOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 min-h-[48px] rounded-xl border border-slate-200 text-slate-700 text-sm font-medium hover:bg-slate-50"
            >
              <Flag className="h-4 w-4" />
              Report
            </button>
            {['ACCEPTED', 'IN_PROGRESS', 'DONE', 'PAID', 'DELIVERED'].includes(booking.status) && (
              <button
                type="button"
                onClick={() => setDisputeOpen(true)}
                className="inline-flex items-center gap-2 px-4 py-2.5 min-h-[48px] rounded-xl border border-amber-200 bg-amber-50 text-amber-900 text-sm font-medium hover:bg-amber-100"
              >
                <AlertTriangle className="h-4 w-4" />
                Something wrong with this job?
              </button>
            )}
            {booking.mechanic?.id && (
              <button
                type="button"
                onClick={() => void blockMechanic()}
                disabled={blockSubmitting}
                className="inline-flex items-center gap-2 px-4 py-2.5 min-h-[48px] rounded-xl border border-red-200 text-red-800 text-sm font-medium hover:bg-red-50 disabled:opacity-60"
              >
                <Ban className="h-4 w-4" />
                {blockSubmitting ? 'Blocking…' : 'Block mechanic'}
              </button>
            )}
          </div>
          {booking.disputeReason && (
            <p className="mt-3 text-xs text-amber-800 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2">
              Dispute recorded: {booking.disputeReason}
            </p>
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
        {booking.mechanicId && booking.status !== 'REQUESTED' ? (
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
            <p className="mt-1 text-sm">
              {booking.mechanicId
                ? 'Accept the mechanic’s quote above to start messaging about this job.'
                : 'Accept one of the quotes above to start the conversation with that mechanic.'}
            </p>
          </div>
        )}
      </div>

      {/* Rating modal */}
      {reportOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
          role="dialog"
          aria-modal="true"
          aria-labelledby="report-booking-title"
        >
          <div className="card p-6 max-w-md w-full">
            <h3 id="report-booking-title" className="font-semibold text-slate-800 mb-3">
              Report this job
            </h3>
            <label className="block text-sm font-medium text-slate-700 mb-1">Reason</label>
            <select
              value={reportReason}
              onChange={(e) => setReportReason(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm mb-3"
            >
              <option value="">Choose…</option>
              <option value="HARASSMENT">Harassment or abuse</option>
              <option value="SAFETY">Safety concern</option>
              <option value="SPAM">Spam or misleading</option>
              <option value="OTHER">Other</option>
            </select>
            <label className="block text-sm font-medium text-slate-700 mb-1">Details (optional)</label>
            <textarea
              value={reportDetails}
              onChange={(e) => setReportDetails(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm mb-4"
            />
            <div className="flex gap-2 justify-end">
              <button
                type="button"
                onClick={() => setReportOpen(false)}
                className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 text-sm font-medium"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => void submitReport()}
                disabled={reportSubmitting}
                className="px-4 py-2.5 rounded-xl bg-primary-600 text-white text-sm font-medium disabled:opacity-60"
              >
                {reportSubmitting ? 'Sending…' : 'Submit report'}
              </button>
            </div>
          </div>
        </div>
      )}

      {disputeOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
          role="dialog"
          aria-modal="true"
          aria-labelledby="dispute-booking-title"
        >
          <div className="card p-6 max-w-md w-full">
            <h3 id="dispute-booking-title" className="font-semibold text-slate-800 mb-2">
              Something wrong with this job?
            </h3>
            <p className="text-sm text-slate-600 mb-3">
              Briefly describe the issue (payment, quality, or no-show). We’ll use this with your booking record.
            </p>
            <textarea
              value={disputeReason}
              onChange={(e) => setDisputeReason(e.target.value)}
              rows={4}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm mb-4"
              placeholder="What happened?"
            />
            <div className="flex gap-2 justify-end">
              <button
                type="button"
                onClick={() => setDisputeOpen(false)}
                className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 text-sm font-medium"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => void submitDispute()}
                disabled={disputeSubmitting}
                className="px-4 py-2.5 rounded-xl bg-amber-600 text-white text-sm font-medium disabled:opacity-60"
              >
                {disputeSubmitting ? 'Sending…' : 'Submit dispute'}
              </button>
            </div>
          </div>
        </div>
      )}

      {showRating && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
          role="dialog"
          aria-modal="true"
          aria-labelledby="rating-modal-title"
        >
          <div className="card p-6 max-w-sm w-full">
            <div className="flex justify-between items-center mb-4">
              <h3 id="rating-modal-title" className="font-semibold text-slate-800">
                Rate this mechanic
              </h3>
              <button
                type="button"
                onClick={() => setShowRating(false)}
                className="p-1 rounded-lg hover:bg-slate-100 text-slate-500"
                aria-label="Close"
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
