import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import toast from 'react-hot-toast'
import { AlertTriangle, CheckCircle2, Flag, RefreshCw } from 'lucide-react'
import { adminAPI } from '../../services/adminApi'
import { getApiErrorMessage } from '../../services/api'
import { fmtNaira, fmtShortDate, fmtNairaMinor } from '../../lib/adminFormat'
import {
  AdminPageHeader,
  AdminSection,
  AdminBadge,
  AdminTimeline,
  StatCard,
} from '../../components/admin/AdminUi'
import { AdminConfirmModal } from '../../components/admin/AdminConfirmModal'
import { BookingOverviewPanel } from '../../components/admin/BookingOverviewPanel'
import { BookingSettlementsPanel } from '../../components/admin/BookingSettlementsPanel'
import { PartLineItemsView } from '../../components/admin/PartLineItemsView'

const STATUSES = ['REQUESTED', 'ACCEPTED', 'IN_PROGRESS', 'DONE', 'PAID', 'DELIVERED', 'EXPIRED']

const PATHS = {
  user: (id: string) => `/admin/users/${id}`,
  mechanic: (id: string) => `/admin/mechanics/${id}`,
  transaction: (id: string) => `/admin/transactions/${id}`,
}

type ConfirmAction = 'set-status' | 'save-dispute' | 'resolve-dispute' | null

export default function AdminBookingDetail() {
  const { id } = useParams()
  const [booking, setBooking] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [statusDraft, setStatusDraft] = useState('')
  const [disputeDraft, setDisputeDraft] = useState('')
  const [confirmAction, setConfirmAction] = useState<ConfirmAction>(null)
  const [actionLoading, setActionLoading] = useState(false)

  const load = () => {
    if (!id) return
    setLoading(true)
    adminAPI
      .getBooking(id)
      .then((r) => {
        setBooking(r.data)
        setStatusDraft(r.data.status)
        setDisputeDraft(r.data.disputeReason ?? '')
      })
      .finally(() => setLoading(false))
  }

  useEffect(load, [id])

  const runSetStatus = async () => {
    setActionLoading(true)
    try {
      await adminAPI.setBookingStatus(booking.id, statusDraft)
      toast.success('Status updated')
      setConfirmAction(null)
      load()
    } catch (e) {
      toast.error(getApiErrorMessage(e))
    } finally {
      setActionLoading(false)
    }
  }

  const runSaveDispute = async () => {
    setActionLoading(true)
    try {
      await adminAPI.setBookingDispute(booking.id, { disputeReason: disputeDraft })
      toast.success('Dispute reason saved')
      setConfirmAction(null)
      load()
    } catch (e) {
      toast.error(getApiErrorMessage(e))
    } finally {
      setActionLoading(false)
    }
  }

  const runResolveDispute = async () => {
    setActionLoading(true)
    try {
      await adminAPI.setBookingDispute(booking.id, { resolve: true })
      toast.success('Dispute resolved')
      setConfirmAction(null)
      load()
    } catch (e) {
      toast.error(getApiErrorMessage(e))
    } finally {
      setActionLoading(false)
    }
  }

  const handleConfirm = () => {
    if (!confirmAction || !booking) return
    if (confirmAction === 'set-status') return runSetStatus()
    if (confirmAction === 'save-dispute') return runSaveDispute()
    if (confirmAction === 'resolve-dispute') return runResolveDispute()
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[240px] text-slate-500 text-sm">
        Loading booking…
      </div>
    )
  }
  if (!booking) return <p className="text-red-600">Booking not found.</p>

  const title = `${booking.fault?.name ?? 'Booking'} · ${booking.vehicle?.brand ?? ''} ${booking.vehicle?.model ?? ''}`.trim()
  const statusUnchanged = statusDraft === booking.status
  const totalDisplay = booking.pricingSummary
    ? fmtNaira(booking.pricingSummary.customerTotalNaira)
    : booking.paymentSummary?.balanceDueNaira != null
      ? fmtNaira(booking.paymentSummary.balanceDueNaira)
      : '—'

  const modalCopy: Record<NonNullable<ConfirmAction>, { title: string; message: string; confirmText: string; variant: 'primary' | 'danger' | 'success' }> = {
    'set-status': {
      title: 'Change booking status',
      message: `Change status from ${booking.status.replace(/_/g, ' ')} to ${statusDraft.replace(/_/g, ' ')}? This updates timestamps where applicable.`,
      confirmText: 'Update status',
      variant: 'primary',
    },
    'save-dispute': {
      title: 'Save dispute reason',
      message: 'Save this dispute reason on the booking? Any previous resolution will be cleared.',
      confirmText: 'Save dispute',
      variant: 'danger',
    },
    'resolve-dispute': {
      title: 'Resolve dispute',
      message: 'Mark this dispute as resolved? The reason will remain on record.',
      confirmText: 'Resolve dispute',
      variant: 'success',
    },
  }
  const activeModal = confirmAction ? modalCopy[confirmAction] : null

  return (
    <>
      <AdminPageHeader
        backTo="/admin/bookings"
        title={title}
        subtitle={booking.paymentPhaseLabel ?? booking.status.replace(/_/g, ' ')}
      />

      <div className="grid lg:grid-cols-3 gap-4 mb-4">
        <div className="lg:col-span-2 grid sm:grid-cols-2 gap-4">
          <StatCard
            label="Status"
            value={booking.status.replace(/_/g, ' ')}
            hint={booking.paymentPhaseLabel ?? undefined}
            tone={booking.disputeReason && !booking.disputeResolvedAt ? 'danger' : 'default'}
          />
          <StatCard label="Customer total" value={totalDisplay} hint={booking.paidAt ? `Paid ${fmtShortDate(booking.paidAt)}` : 'Not paid yet'} />
        </div>

        <AdminSection title="Admin actions">
          <p className="text-xs text-slate-500 mb-3">Confirm before applying changes.</p>

          <label className="block text-xs font-semibold uppercase tracking-wide text-slate-500 mb-1">
            Booking status
          </label>
          <select
            value={statusDraft}
            onChange={(e) => setStatusDraft(e.target.value)}
            className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 mb-2"
          >
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {s.replace(/_/g, ' ')}
              </option>
            ))}
          </select>
          <button
            type="button"
            disabled={statusUnchanged}
            onClick={() => setConfirmAction('set-status')}
            className="inline-flex items-center justify-center gap-2 w-full px-4 py-2.5 rounded-lg bg-violet-600 text-white text-sm font-medium hover:bg-violet-700 disabled:opacity-40 disabled:cursor-not-allowed mb-4"
          >
            <RefreshCw className="h-4 w-4" />
            Update status
          </button>

          <label className="block text-xs font-semibold uppercase tracking-wide text-slate-500 mb-1">
            Dispute reason
          </label>
          <textarea
            value={disputeDraft}
            onChange={(e) => setDisputeDraft(e.target.value)}
            rows={3}
            className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 mb-2"
            placeholder="Describe the dispute…"
          />
          <div className="flex flex-col gap-2">
            <button
              type="button"
              onClick={() => setConfirmAction('save-dispute')}
              className="inline-flex items-center justify-center gap-2 w-full px-4 py-2.5 rounded-lg border border-slate-200 text-sm font-medium hover:bg-slate-50"
            >
              <Flag className="h-4 w-4 text-amber-600" />
              Save dispute reason
            </button>
            {!booking.disputeResolvedAt && booking.disputeReason ? (
              <button
                type="button"
                onClick={() => setConfirmAction('resolve-dispute')}
                className="inline-flex items-center justify-center gap-2 w-full px-4 py-2.5 rounded-lg bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-700"
              >
                <CheckCircle2 className="h-4 w-4" />
                Resolve dispute
              </button>
            ) : null}
          </div>
          {booking.disputeResolvedAt ? (
            <p className="mt-3 text-xs text-emerald-700 bg-emerald-50 border border-emerald-100 rounded-lg px-3 py-2">
              Resolved {fmtShortDate(booking.disputeResolvedAt)}
            </p>
          ) : booking.disputeReason ? (
            <p className="mt-3 text-xs text-amber-800 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2 flex gap-2">
              <AlertTriangle className="h-4 w-4 shrink-0" />
              {booking.disputeReason}
            </p>
          ) : null}
        </AdminSection>
      </div>

      <AdminSection title="Booking overview">
        <BookingOverviewPanel booking={booking} paths={PATHS} />
      </AdminSection>

      <div className="grid md:grid-cols-2 gap-4">
        <AdminSection title="Payment summary">
          {booking.paymentSummary ? (
            <dl className="text-sm space-y-3">
              <div className="flex justify-between gap-4 py-2 border-b border-slate-100">
                <dt className="text-slate-500">Phase</dt>
                <dd className="font-semibold text-slate-900">
                  {booking.paymentPhaseLabel ?? booking.paymentSummary.phase}
                </dd>
              </div>
              {booking.paymentSummary.inspectionFeeNaira != null ? (
                <div className="flex justify-between gap-4">
                  <dt className="text-slate-500">Inspection fee</dt>
                  <dd>{fmtNaira(booking.paymentSummary.inspectionFeeNaira)}</dd>
                </div>
              ) : null}
              {booking.paymentSummary.balanceDueNaira != null ? (
                <div className="flex justify-between gap-4">
                  <dt className="text-slate-500">Balance due</dt>
                  <dd className="font-semibold text-amber-700">{fmtNaira(booking.paymentSummary.balanceDueNaira)}</dd>
                </div>
              ) : null}
              {booking.pricingSummary ? (
                <>
                  <div className="flex justify-between gap-4">
                    <dt className="text-slate-500">Parts</dt>
                    <dd>{fmtNaira(booking.pricingSummary.partsNaira)}</dd>
                  </div>
                  <div className="flex justify-between gap-4">
                    <dt className="text-slate-500">Labour</dt>
                    <dd>{fmtNaira(booking.pricingSummary.labourNaira)}</dd>
                  </div>
                  <div className="flex justify-between gap-4 pt-2 border-t border-slate-100">
                    <dt className="text-slate-500">Total</dt>
                    <dd className="font-bold text-slate-900">{fmtNaira(booking.pricingSummary.customerTotalNaira)}</dd>
                  </div>
                </>
              ) : null}
            </dl>
          ) : (
            <p className="text-sm text-slate-500">No payment summary available.</p>
          )}
        </AdminSection>

        {booking.activeInvoice ? (
          <AdminSection title="Active invoice">
            <div className="text-sm space-y-2">
              <div className="flex flex-wrap gap-2">
                <AdminBadge>v{booking.activeInvoice.version}</AdminBadge>
                <AdminBadge tone="slate">{booking.activeInvoice.status}</AdminBadge>
                <AdminBadge tone="blue">{booking.activeInvoice.source}</AdminBadge>
              </div>
              <p>
                Parts {fmtNaira(booking.activeInvoice.partsNaira)} · Labour{' '}
                {fmtNaira(booking.activeInvoice.labourNaira)} · Total{' '}
                {fmtNaira(booking.activeInvoice.customerTotalNaira)}
              </p>
              <PartLineItemsView items={booking.activeInvoice.partsLineItems} />
              {booking.activeInvoice.rejectionReason ? (
                <p className="text-red-700 text-xs bg-red-50 rounded-lg px-3 py-2">
                  Declined: {booking.activeInvoice.rejectionReason}
                </p>
              ) : null}
            </div>
          </AdminSection>
        ) : null}
      </div>

      {booking.quotes?.length ? (
        <AdminSection title={`Quotes (${booking.quotes.length})`}>
          <div className="space-y-4">
            {booking.quotes.map((q: any) => (
              <div key={q.id} className="rounded-lg border border-slate-200 p-4 text-sm">
                <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                  <p className="font-semibold text-slate-900">{q.mechanic?.companyName ?? 'Mechanic'}</p>
                  <div className="flex flex-wrap gap-2">
                    <AdminBadge tone="slate">{q.quoteType}</AdminBadge>
                    <AdminBadge tone={q.status === 'ACCEPTED' ? 'green' : 'amber'}>{q.status}</AdminBadge>
                  </div>
                </div>
                <p className="text-slate-600">
                  Parts {fmtNaira(q.partsNaira)} · Labour {fmtNaira(q.labourNaira)} · Other{' '}
                  {fmtNaira(q.otherFeesNaira)} ·{' '}
                  <strong className="text-slate-900">{fmtNaira(q.customerTotalNaira ?? q.proposedPrice)}</strong>
                </p>
                <PartLineItemsView items={q.partsLineItems} compact />
                {q.message ? <p className="mt-2 text-xs text-slate-500 italic">{q.message}</p> : null}
              </div>
            ))}
          </div>
        </AdminSection>
      ) : null}

      {booking.invoices?.length ? (
        <AdminSection title={`Invoices (${booking.invoices.length})`}>
          <div className="space-y-3">
            {booking.invoices.map((inv: any) => (
              <div key={inv.id} className="rounded-lg border border-slate-100 p-3 text-sm">
                <div className="flex flex-wrap gap-2 mb-1">
                  <AdminBadge>v{inv.version}</AdminBadge>
                  <AdminBadge tone="slate">{inv.status}</AdminBadge>
                  <span className="text-xs text-slate-500">{inv.source}</span>
                </div>
                <p className="text-slate-700">
                  Parts {fmtNaira(inv.partsNaira)} · Labour {fmtNaira(inv.labourNaira)} · Total{' '}
                  {fmtNaira(inv.customerTotalNaira)}
                </p>
                <PartLineItemsView items={inv.partsLineItems} compact />
                {inv.rejectionReason ? (
                  <p className="text-red-700 text-xs mt-1">Declined: {inv.rejectionReason}</p>
                ) : null}
              </div>
            ))}
          </div>
        </AdminSection>
      ) : null}

      {booking.settlements?.length ? (
        <AdminSection title={`Settlements (${booking.settlements.length})`}>
          <BookingSettlementsPanel settlements={booking.settlements} />
        </AdminSection>
      ) : null}

      {booking.transactions?.length ? (
        <AdminSection title={`Transactions (${booking.transactions.length})`}>
          <AdminTimeline
            items={booking.transactions.map((t: any) => ({
              at: t.createdAt,
              title: `${t.type.replace(/_/g, ' ')} · ${t.status} · ${fmtNairaMinor(t.amountMinor)}`,
              detail: t.reference ?? t.description,
              href: PATHS.transaction(t.id),
            }))}
          />
        </AdminSection>
      ) : null}

      <div className="grid md:grid-cols-2 gap-4">
        {booking.messages?.length ? (
          <AdminSection title={`Chat (${booking.messages.length})`}>
            <ul className="space-y-3 max-h-80 overflow-y-auto text-sm">
              {booking.messages.map((m: any) => (
                <li key={m.id} className="rounded-lg bg-slate-50 border border-slate-100 px-3 py-2">
                  <p className="text-xs text-slate-500 mb-1">
                    {m.senderType} · {fmtShortDate(m.createdAt)}
                  </p>
                  <p className="text-slate-800 whitespace-pre-wrap">{m.content}</p>
                </li>
              ))}
            </ul>
          </AdminSection>
        ) : null}

        {booking.clarifications?.length ? (
          <AdminSection title="Clarifications">
            <ul className="space-y-3 text-sm">
              {booking.clarifications.map((c: any) => (
                <li key={c.id} className="rounded-lg border border-slate-100 p-3">
                  <p className="font-medium text-slate-800">Q: {c.question}</p>
                  <p className="text-slate-600 mt-1">A: {c.answer?.trim() || '—'}</p>
                </li>
              ))}
            </ul>
          </AdminSection>
        ) : null}
      </div>

      {(booking.ratings?.length || booking.reports?.length) ? (
        <div className="grid md:grid-cols-2 gap-4">
          {booking.ratings?.length ? (
            <AdminSection title="Ratings">
              {booking.ratings.map((r: any) => (
                <div key={r.id} className="text-sm mb-3 last:mb-0">
                  <p className="text-amber-600">{'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}</p>
                  {r.comment ? <p className="text-slate-600 mt-1">{r.comment}</p> : null}
                </div>
              ))}
            </AdminSection>
          ) : null}
          {booking.reports?.length ? (
            <AdminSection title="Reports">
              {booking.reports.map((r: any) => (
                <div key={r.id} className="text-sm mb-3 rounded-lg bg-red-50 border border-red-100 p-3 last:mb-0">
                  <p className="font-medium text-red-900">
                    {r.reporterRole} · {r.reason}
                  </p>
                  {r.details ? <p className="text-red-800/80 mt-1">{r.details}</p> : null}
                </div>
              ))}
            </AdminSection>
          ) : null}
        </div>
      ) : null}

      <AdminConfirmModal
        open={confirmAction != null}
        title={activeModal?.title ?? ''}
        message={activeModal?.message ?? ''}
        confirmText={activeModal?.confirmText}
        confirmVariant={activeModal?.variant}
        loading={actionLoading}
        onCancel={() => !actionLoading && setConfirmAction(null)}
        onConfirm={handleConfirm}
      />
    </>
  )
}
