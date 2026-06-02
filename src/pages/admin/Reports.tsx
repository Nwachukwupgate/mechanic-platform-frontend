import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import toast from 'react-hot-toast'
import { adminAPI } from '../../services/adminApi'
import { getApiErrorMessage } from '../../services/api'
import { fmtShortDate } from '../../lib/adminFormat'
import { AdminPageHeader, AdminTable, AdminTh, AdminTd, AdminPagination, AdminLink, AdminBadge } from '../../components/admin/AdminUi'

export default function AdminReports() {
  const [params, setParams] = useSearchParams()
  const page = Number(params.get('page') || 1)
  const [data, setData] = useState<any>(null)

  useEffect(() => {
    adminAPI.listReports({ page, limit: 25 }).then((r) => setData(r.data))
  }, [page])

  const resolve = async (id: string) => {
    try {
      await adminAPI.resolveReport(id)
      toast.success('Resolved')
      adminAPI.listReports({ page, limit: 25 }).then((r) => setData(r.data))
    } catch (e) {
      toast.error(getApiErrorMessage(e))
    }
  }

  return (
    <>
      <AdminPageHeader title="Reports & complaints" subtitle="Safety and behaviour reports from users and mechanics." />
      <AdminTable>
        <thead><tr><AdminTh>Reason</AdminTh><AdminTh>Reporter</AdminTh><AdminTh>Booking</AdminTh><AdminTh>Status</AdminTh><AdminTh>When</AdminTh><AdminTh>Actions</AdminTh></tr></thead>
        <tbody>
          {data?.items?.map((r: any) => (
            <tr key={r.id}>
              <AdminTd>{r.reason}</AdminTd>
              <AdminTd>{r.reporterRole}</AdminTd>
              <AdminTd><AdminLink to={`/admin/bookings/${r.bookingId}`}>{r.booking?.status ?? 'View'}</AdminLink></AdminTd>
              <AdminTd><AdminBadge tone={r.booking?.disputeResolvedAt ? 'green' : 'red'}>{r.booking?.disputeResolvedAt ? 'Resolved' : 'Open'}</AdminBadge></AdminTd>
              <AdminTd>{fmtShortDate(r.createdAt)}</AdminTd>
              <AdminTd>{!r.booking?.disputeResolvedAt ? <button type="button" className="text-xs text-violet-700" onClick={() => resolve(r.id)}>Resolve</button> : null}</AdminTd>
            </tr>
          ))}
        </tbody>
      </AdminTable>
      {data && <AdminPagination page={data.page} totalPages={data.totalPages} total={data.total} onPage={(p) => { const n = new URLSearchParams(params); n.set('page', String(p)); setParams(n) }} />}
    </>
  )
}
