import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import toast from 'react-hot-toast'
import { adminAPI } from '../../services/adminApi'
import { getApiErrorMessage } from '../../services/api'
import { fmtNaira, fmtShortDate, fmtNairaMinor } from '../../lib/adminFormat'
import {
  AdminPageHeader,
  AdminSection,
  AdminBadge,
  AdminJson,
  AdminTimeline,
} from '../../components/admin/AdminUi'

const STATUSES = ['REQUESTED', 'ACCEPTED', 'IN_PROGRESS', 'DONE', 'PAID', 'DELIVERED', 'EXPIRED']

export default function AdminBookingDetail() {
  const { id } = useParams()
  const [booking, setBooking] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [statusDraft, setStatusDraft] = useState('')
  const [disputeDraft, setDisputeDraft] = useState('')

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

  if (loading) return <p className="text-slate-600">Loading booking…</p>
  if (!booking) return <p className="text-red-600">Booking not found.</p>

  const saveStatus = async () => {
    try {
      await adminAPI.setBookingStatus(booking.id, statusDraft)
      toast.success('Status updated')
      load()
    } catch (e) {
      toast.error(getApiErrorMessage(e))
    }
  }

  const saveDispute = async () => {
    try {
      await adminAPI.setBookingDispute(booking.id, { disputeReason: disputeDraft })
      toast.success('Dispute updated')
      load()
    } catch (e) {
      toast.error(getApiErrorMessage(e))
    }
  }

  const resolveDispute = async () => {
    try {
      await adminAPI.setBookingDispute(booking.id, { resolve: true })
      toast.success('Dispute resolved')
      load()
    } catch (e) {
      toast.error(getApiErrorMessage(e))
    }
  }

  return (
    <>
      <AdminPageHeader
        backTo="/admin/bookings"
        title={`${booking.fault?.name ?? 'Booking'} · ${booking.vehicle?.brand} ${booking.vehicle?.model}`}
        subtitle={`ID ${booking.id} · ${booking.paymentPhaseLabel ?? booking.status}`}
      />

      <div className="grid lg:grid-cols-3 gap-4 mb-4">
        <AdminSection title="Status & parties">
          <p className="text-sm mb-2">
            <AdminBadge>{booking.status.replace(/_/g, ' ')}</AdminBadge>
          </p>
          <p className="text-sm"><strong>Customer:</strong> {booking.user?.email}</p>
          <p className="text-sm"><strong>Mechanic:</strong> {booking.mechanic?.companyName ?? ''}</p>
          <p className="text-sm text-slate-600 mt-2">{booking.description || 'No description'}</p>
          <div className="mt-3 flex gap-2 flex-wrap">
            <select value={statusDraft} onChange={(e) => setStatusDraft(e.target.value)} className="text-sm border rounded-lg px-2 py-1.5">
              {STATUSES.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
            <button type="button" onClick={saveStatus} className="text-sm px-3 py-1.5 bg-violet-600 text-white rounded-lg">
              Set status
            </button>
          </div>
        </AdminSection>

        <AdminSection title="Payment summary">
          {booking.paymentSummary ? (
            <ul className="text-sm space-y-1 text-slate-700">
              <li>Phase: <strong>{booking.paymentPhaseLabel ?? booking.paymentSummary.phase}</strong></li>
              {booking.paymentSummary.inspectionFeeNaira != null ? (
                <li>Inspection fee: {fmtNaira(booking.paymentSummary.inspectionFeeNaira)}</li>
              ) : null}
              {booking.paymentSummary.balanceDueNaira != null ? (
                <li>Balance due: {fmtNaira(booking.paymentSummary.balanceDueNaira)}</li>
              ) : null}
              {booking.paidAt ? <li>Paid at: {fmtShortDate(booking.paidAt)}</li> : null}
              {booking.pricingSummary ? (
                <li>
                  Total: {fmtNaira(booking.pricingSummary.customerTotalNaira)} (parts {fmtNaira(booking.pricingSummary.partsNaira)} · labour {fmtNaira(booking.pricingSummary.labourNaira)})
                </li>
              ) : null}
            </ul>
          ) : (
            <p className="text-sm text-slate-500">No payment summary</p>
          )}
        </AdminSection>

        <AdminSection title="Dispute">
          <textarea
            value={disputeDraft}
            onChange={(e) => setDisputeDraft(e.target.value)}
            rows={3}
            className="w-full text-sm border rounded-lg px-2 py-1.5 mb-2"
            placeholder="Dispute reason"
          />
          <div className="flex gap-2">
            <button type="button" onClick={saveDispute} className="text-sm px-3 py-1.5 border rounded-lg">Save reason</button>
            {!booking.disputeResolvedAt && booking.disputeReason ? (
              <button type="button" onClick={resolveDispute} className="text-sm px-3 py-1.5 bg-emerald-600 text-white rounded-lg">
                Resolve
              </button>
            ) : null}
          </div>
          {booking.disputeResolvedAt ? (
            <p className="text-xs text-emerald-700 mt-2">Resolved {fmtShortDate(booking.disputeResolvedAt)}</p>
          ) : null}
        </AdminSection>
      </div>

      {booking.quotes?.length ? (
        <AdminSection title={`Quotes (${booking.quotes.length})`}>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-slate-500">
                  <th className="pb-2 pr-4">Mechanic</th>
                  <th className="pb-2 pr-4">Type</th>
                  <th className="pb-2 pr-4">Status</th>
                  <th className="pb-2 pr-4">Parts</th>
                  <th className="pb-2 pr-4">Labour</th>
                  <th className="pb-2">Total</th>
                </tr>
              </thead>
              <tbody>
                {booking.quotes.map((q: any) => (
                  <tr key={q.id} className="border-t border-slate-100">
                    <td className="py-2 pr-4">{q.mechanic?.companyName}</td>
                    <td className="py-2 pr-4">{q.quoteType}</td>
                    <td className="py-2 pr-4">{q.status}</td>
                    <td className="py-2 pr-4">{q.partsNaira != null ? fmtNaira(q.partsNaira) : ''}</td>
                    <td className="py-2 pr-4">{q.labourNaira != null ? fmtNaira(q.labourNaira) : ''}</td>
                    <td className="py-2">{fmtNaira(q.customerTotalNaira ?? q.proposedPrice)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </AdminSection>
      ) : null}

      {booking.invoices?.length ? (
        <AdminSection title={`Invoices (${booking.invoices.length})`}>
          {booking.invoices.map((inv: any) => (
            <div key={inv.id} className="text-sm border-b border-slate-100 py-2 last:border-0">
              <p><strong>v{inv.version}</strong> · {inv.status} · {inv.source}</p>
              <p className="text-slate-600">
                Parts {fmtNaira(inv.partsNaira)} · Labour {fmtNaira(inv.labourNaira)} · Total {fmtNaira(inv.customerTotalNaira)}
              </p>
              {inv.rejectionReason ? <p className="text-red-700 text-xs">Declined: {inv.rejectionReason}</p> : null}
            </div>
          ))}
        </AdminSection>
      ) : null}

      {booking.transactions?.length ? (
        <AdminSection title={`Transactions (${booking.transactions.length})`}>
          <AdminTimeline
            items={booking.transactions.map((t: any) => ({
              at: t.createdAt,
              title: `${t.type} · ${t.status} · ${fmtNairaMinor(t.amountMinor)}`,
              detail: t.reference ?? t.description,
              href: `/admin/transactions/${t.id}`,
            }))}
          />
        </AdminSection>
      ) : null}

      {booking.messages?.length ? (
        <AdminSection title={`Chat (${booking.messages.length})`}>
          <ul className="space-y-2 max-h-64 overflow-y-auto text-sm">
            {booking.messages.map((m: any) => (
              <li key={m.id} className="border-b border-slate-50 pb-2">
                <p className="text-xs text-slate-500">{m.senderType} · {fmtShortDate(m.createdAt)}</p>
                <p>{m.content}</p>
              </li>
            ))}
          </ul>
        </AdminSection>
      ) : null}

      {booking.clarifications?.length ? (
        <AdminSection title="Clarifications">
          {booking.clarifications.map((c: any) => (
            <div key={c.id} className="text-sm mb-2">
              <p className="font-medium">Q: {c.question}</p>
              <p className="text-slate-600">A: {c.answer ?? ''}</p>
            </div>
          ))}
        </AdminSection>
      ) : null}

      {booking.ratings?.length ? (
        <AdminSection title="Ratings">
          {booking.ratings.map((r: any) => (
            <p key={r.id} className="text-sm">{'★'.repeat(r.rating)} {r.comment ?? ''}</p>
          ))}
        </AdminSection>
      ) : null}

      {booking.reports?.length ? (
        <AdminSection title="Reports">
          {booking.reports.map((r: any) => (
            <div key={r.id} className="text-sm mb-2">
              <p><strong>{r.reporterRole}</strong> · {r.reason}</p>
              <p className="text-slate-600">{r.details}</p>
            </div>
          ))}
        </AdminSection>
      ) : null}

      {booking.settlements?.length ? (
        <AdminSection title="Settlements">
          <AdminJson data={booking.settlements} />
        </AdminSection>
      ) : null}

      <AdminSection title="Raw record">
        <AdminJson data={booking} />
      </AdminSection>
    </>
  )
}
