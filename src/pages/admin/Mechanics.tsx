import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { adminAPI } from '../../services/adminApi'
import { fmtShortDate } from '../../lib/adminFormat'
import { AdminPageHeader, AdminTable, AdminTh, AdminTd, AdminPagination, AdminLink, AdminBadge } from '../../components/admin/AdminUi'
import { AdminExportButton } from '../../components/admin/AdminExportButton'

export default function AdminMechanics() {
  const [params, setParams] = useSearchParams()
  const page = Number(params.get('page') || 1)
  const [search, setSearch] = useState('')
  const [data, setData] = useState<any>(null)

  useEffect(() => {
    adminAPI.listMechanics({ page, limit: 25, search: search || undefined }).then((r) => setData(r.data))
  }, [page, search])

  return (
    <>
      <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
        <AdminPageHeader title="Mechanics" subtitle="Workshops and verification status." />
        <AdminExportButton resource="mechanics" />
      </div>
      <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search" className="mb-4 w-full max-w-md px-3 py-2 border rounded-lg text-sm" />
      <AdminTable>
        <thead><tr><AdminTh>Company</AdminTh><AdminTh>Owner</AdminTh><AdminTh>Verified</AdminTh><AdminTh>Joined</AdminTh></tr></thead>
        <tbody>
          {data?.items?.map((m: any) => (
            <tr key={m.id}>
              <AdminTd><AdminLink to={`/admin/mechanics/${m.id}`}>{m.companyName}</AdminLink></AdminTd>
              <AdminTd>{m.ownerFullName}</AdminTd>
              <AdminTd>
                <AdminBadge tone={m.isVerified ? 'green' : 'slate'}>{m.isVerified ? 'Verified' : 'Unverified'}</AdminBadge>
                {m.suspendedAt ? <> <AdminBadge tone="red">Suspended</AdminBadge></> : null}
              </AdminTd>
              <AdminTd>{fmtShortDate(m.createdAt)}</AdminTd>
            </tr>
          ))}
        </tbody>
      </AdminTable>
      {data && <AdminPagination page={data.page} totalPages={data.totalPages} total={data.total} onPage={(p) => { const n = new URLSearchParams(params); n.set('page', String(p)); setParams(n) }} />}
    </>
  )
}
