import { useEffect, useState } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { adminAPI } from '../../services/adminApi'
import { fmtShortDate, fmtNairaMinor } from '../../lib/adminFormat'
import { AdminPageHeader, AdminTable, AdminTh, AdminTd, AdminPagination, AdminLink, AdminBadge } from '../../components/admin/AdminUi'
import { AdminExportButton } from '../../components/admin/AdminExportButton'

export default function AdminTransactions() {
  const [params, setParams] = useSearchParams()
  const page = Number(params.get('page') || 1)
  const [data, setData] = useState<any>(null)

  useEffect(() => {
    adminAPI.listTransactions({ page, limit: 25 }).then((r) => setData(r.data))
  }, [page])

  return (
    <>
      <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
        <AdminPageHeader title="Transactions" subtitle="Every payment, payout, refund, and ledger entry." />
        <AdminExportButton resource="transactions" />
      </div>
      <AdminTable>
        <thead><tr><AdminTh>Type</AdminTh><AdminTh>Status</AdminTh><AdminTh>Amount</AdminTh><AdminTh>Party</AdminTh><AdminTh>Booking</AdminTh><AdminTh>When</AdminTh></tr></thead>
        <tbody>
          {data?.items?.map((t: any) => (
            <tr key={t.id}>
              <AdminTd><AdminLink to={`/admin/transactions/${t.id}`}>{t.type.replace(/_/g, ' ')}</AdminLink></AdminTd>
              <AdminTd><AdminBadge tone={t.status === 'SUCCESS' ? 'green' : t.status === 'FAILED' ? 'red' : 'amber'}>{t.status}</AdminBadge></AdminTd>
              <AdminTd>{fmtNairaMinor(t.amountMinor)}</AdminTd>
              <AdminTd className="text-xs">{t.user?.email ?? t.mechanic?.companyName ?? ''}</AdminTd>
              <AdminTd>{t.bookingId ? <AdminLink to={`/admin/bookings/${t.bookingId}`}>View</AdminLink> : null}</AdminTd>
              <AdminTd>{fmtShortDate(t.createdAt)}</AdminTd>
            </tr>
          ))}
        </tbody>
      </AdminTable>
      {data && <AdminPagination page={data.page} totalPages={data.totalPages} total={data.total} onPage={(p) => { const n = new URLSearchParams(params); n.set('page', String(p)); setParams(n) }} />}
    </>
  )
}
