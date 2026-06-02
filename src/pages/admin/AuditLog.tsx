import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { adminAPI } from '../../services/adminApi'
import { fmtShortDate } from '../../lib/adminFormat'
import { AdminPageHeader, AdminTable, AdminTh, AdminTd, AdminPagination, AdminJson } from '../../components/admin/AdminUi'
import { AdminExportButton } from '../../components/admin/AdminExportButton'

export default function AdminAuditLog() {
  const [params, setParams] = useSearchParams()
  const page = Number(params.get('page') || 1)
  const [action, setAction] = useState('')
  const [data, setData] = useState<any>(null)
  const [expanded, setExpanded] = useState<string | null>(null)

  useEffect(() => {
    adminAPI.listAudit({ page, limit: 30, action: action || undefined }).then((r) => setData(r.data))
  }, [page, action])

  return (
    <>
      <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
        <AdminPageHeader title="Audit log" subtitle="Immutable record of every admin action. Nothing is lost." />
        <AdminExportButton resource="audit" />
      </div>
      <input value={action} onChange={(e) => setAction(e.target.value)} placeholder="Filter by action" className="mb-4 w-full max-w-md px-3 py-2 border rounded-lg text-sm" />
      <AdminTable>
        <thead><tr><AdminTh>When</AdminTh><AdminTh>Admin</AdminTh><AdminTh>Action</AdminTh><AdminTh>Entity</AdminTh><AdminTh>Meta</AdminTh></tr></thead>
        <tbody>
          {data?.items?.map((a: any) => (
            <tr key={a.id}>
              <AdminTd>{fmtShortDate(a.createdAt)}</AdminTd>
              <AdminTd className="text-xs">{a.admin?.email}</AdminTd>
              <AdminTd className="font-medium">{a.action}</AdminTd>
              <AdminTd className="text-xs">{a.entityType} {a.entityId?.slice(0, 8)}</AdminTd>
              <AdminTd>
                <button type="button" className="text-xs text-violet-700" onClick={() => setExpanded(expanded === a.id ? null : a.id)}>
                  {expanded === a.id ? 'Hide' : 'View'}
                </button>
                {expanded === a.id ? <div className="mt-2"><AdminJson data={a.metadata} /></div> : null}
              </AdminTd>
            </tr>
          ))}
        </tbody>
      </AdminTable>
      {data && <AdminPagination page={data.page} totalPages={data.totalPages} total={data.total} onPage={(p) => { const n = new URLSearchParams(params); n.set('page', String(p)); setParams(n) }} />}
    </>
  )
}
