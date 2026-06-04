import { fmtNaira, fmtShortDate } from '../../lib/adminFormat'
import { AdminBadge } from './AdminUi'

export function BookingSettlementsPanel({ settlements }: { settlements: any[] }) {
  if (!settlements?.length) {
    return <p className="text-sm text-slate-500">No settlement records yet.</p>
  }

  return (
    <div className="space-y-3">
      {settlements.map((s: any) => (
        <div
          key={s.id}
          className="rounded-lg border border-slate-200 bg-slate-50/50 p-4 text-sm"
        >
          <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
            <AdminBadge tone="slate">{s.phase?.replace(/_/g, ' ') ?? 'Settlement'}</AdminBadge>
            <span className="text-xs text-slate-500">{fmtShortDate(s.createdAt)}</span>
          </div>
          <dl className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div>
              <dt className="text-xs text-slate-500">Customer total</dt>
              <dd className="font-semibold text-slate-900">{fmtNaira(s.customerTotalNaira)}</dd>
            </div>
            <div>
              <dt className="text-xs text-slate-500">Parts</dt>
              <dd>{fmtNaira(s.partsNaira)}</dd>
            </div>
            <div>
              <dt className="text-xs text-slate-500">Labour</dt>
              <dd>{fmtNaira(s.labourNaira)}</dd>
            </div>
            <div>
              <dt className="text-xs text-slate-500">Other fees</dt>
              <dd>{fmtNaira(s.otherFeesNaira)}</dd>
            </div>
            <div>
              <dt className="text-xs text-slate-500">Platform fee</dt>
              <dd>{fmtNaira(s.platformFeeNaira)}</dd>
            </div>
            <div>
              <dt className="text-xs text-slate-500">Mechanic earnings</dt>
              <dd className="font-medium text-emerald-700">{fmtNaira(s.mechanicEarningsNaira)}</dd>
            </div>
            {s.paymentChannel ? (
              <div>
                <dt className="text-xs text-slate-500">Payment channel</dt>
                <dd>{String(s.paymentChannel).replace(/_/g, ' ')}</dd>
              </div>
            ) : null}
          </dl>
        </div>
      ))}
    </div>
  )
}
