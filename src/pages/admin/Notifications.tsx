import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { adminAPI } from '../../services/adminApi'
import { fmtShortDate } from '../../lib/adminFormat'
import { AdminPageHeader, AdminTable, AdminTh, AdminTd, AdminPagination, AdminBadge } from '../../components/admin/AdminUi'

export default function AdminNotifications() {
  const [params, setParams] = useSearchParams()
  const page = Number(params.get('page') || 1)
  const [data, setData] = useState<any>(null)

  useEffect(() => {
    adminAPI.listNotifications({ page, limit: 30 }).then((r) => setData(r.data))
  }, [page])

  return (
    <>
      <AdminPageHeader title="Notifications" subtitle="Push/in-app alerts sent to users and mechanics." />
      <AdminTable>
        <thead><tr><AdminTh>Title</AdminTh><AdminTh>Recipient</AdminTh><AdminTh>Type</AdminTh><AdminTh>Read</AdminTh><AdminTh>When</AdminTh></tr></thead>
        <tbody>
          {data?.items?.map((n: any) => (
            <tr key={n.id}>
              <AdminTd><p className="font-medium">{n.title}</p><p className="text-xs text-slate-500 truncate max-w-xs">{n.body}</p></AdminTd>
              <AdminTd className="text-xs">{n.recipientRole} · {n.recipientId.slice(0, 8)}…</AdminTd>
              <AdminTd>{n.type}</AdminTd>
              <AdminTd><AdminBadge tone={n.readAt ? 'green' : 'amber'}>{n.readAt ? 'Read' : 'Unread'}</AdminBadge></AdminTd>
              <AdminTd>{fmtShortDate(n.createdAt)}</AdminTd>
            </tr>
          ))}
        </tbody>
      </AdminTable>
      {data && <AdminPagination page={data.page} totalPages={data.totalPages} total={data.total} onPage={(p) => { const n = new URLSearchParams(params); n.set('page', String(p)); setParams(n) }} />}
    </>
  )
}
