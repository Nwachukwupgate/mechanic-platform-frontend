import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { adminAPI } from '../../services/adminApi'
import { fmtShortDate } from '../../lib/adminFormat'
import { AdminPageHeader, AdminTable, AdminTh, AdminTd, AdminPagination, AdminLink } from '../../components/admin/AdminUi'

export default function AdminRatings() {
  const [params, setParams] = useSearchParams()
  const page = Number(params.get('page') || 1)
  const [data, setData] = useState<any>(null)

  useEffect(() => {
    adminAPI.listRatings({ page, limit: 25 }).then((r) => setData(r.data))
  }, [page])

  return (
    <>
      <AdminPageHeader title="Ratings" subtitle="Customer feedback after completed jobs." />
      <AdminTable>
        <thead><tr><AdminTh>Stars</AdminTh><AdminTh>Customer</AdminTh><AdminTh>Mechanic</AdminTh><AdminTh>Comment</AdminTh><AdminTh>When</AdminTh></tr></thead>
        <tbody>
          {data?.items?.map((r: any) => (
            <tr key={r.id}>
              <AdminTd>{'★'.repeat(r.rating)}</AdminTd>
              <AdminTd>{r.user?.email}</AdminTd>
              <AdminTd>{r.mechanic?.companyName}</AdminTd>
              <AdminTd className="max-w-xs truncate">{r.comment ?? ''}</AdminTd>
              <AdminTd>{fmtShortDate(r.createdAt)} · <AdminLink to={`/admin/bookings/${r.bookingId}`}>Job</AdminLink></AdminTd>
            </tr>
          ))}
        </tbody>
      </AdminTable>
      {data && <AdminPagination page={data.page} totalPages={data.totalPages} total={data.total} onPage={(p) => { const n = new URLSearchParams(params); n.set('page', String(p)); setParams(n) }} />}
    </>
  )
}
