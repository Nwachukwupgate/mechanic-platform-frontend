import { useEffect, useState } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { adminAPI } from '../../services/adminApi'
import { fmtShortDate, fmtNaira } from '../../lib/adminFormat'
import {
  AdminPageHeader,
  AdminTable,
  AdminTh,
  AdminTd,
  AdminPagination,
  AdminLink,
  AdminBadge,
} from '../../components/admin/AdminUi'
import { AdminExportButton } from '../../components/admin/AdminExportButton'

export default function AdminBookings() {
  const [params, setParams] = useSearchParams()
  const page = Number(params.get('page') || 1)
  const status = params.get('status') || ''
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    adminAPI
      .listBookings({ page, limit: 25, status: status || undefined, hasDispute: params.get('hasDispute') || undefined })
      .then((r) => setData(r.data))
      .finally(() => setLoading(false))
  }, [page, status, params])

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <AdminPageHeader title="Bookings" subtitle="Every job on the platform. Filter by status or dispute." />
        <AdminExportButton resource="bookings" />
      </div>
      <div className="flex flex-wrap gap-2 mb-4">
        {['', 'REQUESTED', 'ACCEPTED', 'IN_PROGRESS', 'DONE', 'PAID', 'EXPIRED'].map((s) => (
          <button
            key={s || 'all'}
            type="button"
            onClick={() => {
              const next = new URLSearchParams(params)
              if (s) next.set('status', s)
              else next.delete('status')
              next.set('page', '1')
              setParams(next)
            }}
            className={`px-3 py-1.5 rounded-full text-xs font-medium border ${
              status === s ? 'bg-violet-600 text-white border-violet-600' : 'bg-white border-slate-200'
            }`}
          >
            {s || 'All'}
          </button>
        ))}
        <button
          type="button"
          onClick={() => {
            const next = new URLSearchParams(params)
            next.set('hasDispute', 'true')
            next.set('page', '1')
            setParams(next)
          }}
          className="px-3 py-1.5 rounded-full text-xs font-medium border border-red-200 text-red-700 bg-red-50"
        >
          Has dispute
        </button>
      </div>
      {loading ? (
        <p className="text-slate-600">Loading…</p>
      ) : (
        <>
          <AdminTable>
            <thead>
              <tr>
                <AdminTh>Job</AdminTh>
                <AdminTh>Customer</AdminTh>
                <AdminTh>Mechanic</AdminTh>
                <AdminTh>Status</AdminTh>
                <AdminTh>Payment</AdminTh>
                <AdminTh>Created</AdminTh>
              </tr>
            </thead>
            <tbody>
              {data?.items?.map((b: any) => (
                <tr key={b.id} className="hover:bg-slate-50">
                  <AdminTd>
                    <AdminLink to={`/admin/bookings/${b.id}`}>
                      {b.fault?.name ?? 'Booking'}
                    </AdminLink>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {b.vehicle?.brand} {b.vehicle?.model}
                    </p>
                  </AdminTd>
                  <AdminTd>{b.user?.email ?? ''}</AdminTd>
                  <AdminTd>{b.mechanic?.companyName ?? ''}</AdminTd>
                  <AdminTd>
                    <AdminBadge tone={b.disputeReason && !b.disputeResolvedAt ? 'red' : 'slate'}>
                      {b.status.replace(/_/g, ' ')}
                    </AdminBadge>
                  </AdminTd>
                  <AdminTd>
                    <p className="text-xs">{b.paymentHint ?? (b.paidAt ? 'Paid' : '')}</p>
                    {b.estimatedCost != null ? (
                      <p className="text-xs text-slate-500">{fmtNaira(b.estimatedCost)}</p>
                    ) : null}
                  </AdminTd>
                  <AdminTd>{fmtShortDate(b.createdAt)}</AdminTd>
                </tr>
              ))}
            </tbody>
          </AdminTable>
          {data ? (
            <AdminPagination page={data.page} totalPages={data.totalPages} total={data.total} onPage={(p) => {
              const next = new URLSearchParams(params)
              next.set('page', String(p))
              setParams(next)
            }} />
          ) : null}
        </>
      )}
    </>
  )
}
