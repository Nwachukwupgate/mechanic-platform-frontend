import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { adminAPI } from '../../services/adminApi'
import { fmtShortDate, fmtNaira } from '../../lib/adminFormat'
import { AdminPageHeader, AdminTable, AdminTh, AdminTd, AdminPagination, AdminLink, AdminBadge } from '../../components/admin/AdminUi'
import { AdminExportButton } from '../../components/admin/AdminExportButton'

export default function AdminQuotes() {
  const [params, setParams] = useSearchParams()
  const page = Number(params.get('page') || 1)
  const [data, setData] = useState<any>(null)

  useEffect(() => {
    adminAPI.listQuotes({ page, limit: 25 }).then((r) => setData(r.data))
  }, [page])

  return (
    <>
      <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
        <AdminPageHeader title="Quotes" subtitle="Every mechanic bid: pending, accepted, rejected." />
        <AdminExportButton resource="quotes" />
      </div>
      <AdminTable>
        <thead><tr><AdminTh>Mechanic</AdminTh><AdminTh>Job</AdminTh><AdminTh>Type</AdminTh><AdminTh>Status</AdminTh><AdminTh>Total</AdminTh><AdminTh>When</AdminTh></tr></thead>
        <tbody>
          {data?.items?.map((q: any) => (
            <tr key={q.id}>
              <AdminTd>{q.mechanic?.companyName}</AdminTd>
              <AdminTd><AdminLink to={`/admin/bookings/${q.bookingId}`}>{q.booking?.fault?.name ?? q.bookingId.slice(0, 8)}</AdminLink></AdminTd>
              <AdminTd>{q.quoteType}</AdminTd>
              <AdminTd><AdminBadge>{q.status}</AdminBadge></AdminTd>
              <AdminTd>{fmtNaira(q.customerTotalNaira ?? q.proposedPrice)}</AdminTd>
              <AdminTd>{fmtShortDate(q.createdAt)}</AdminTd>
            </tr>
          ))}
        </tbody>
      </AdminTable>
      {data && <AdminPagination page={data.page} totalPages={data.totalPages} total={data.total} onPage={(p) => { const n = new URLSearchParams(params); n.set('page', String(p)); setParams(n) }} />}
    </>
  )
}
