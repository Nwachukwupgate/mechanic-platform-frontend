import { useEffect, useState } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { adminAPI } from '../../services/adminApi'
import { fmtShortDate } from '../../lib/adminFormat'
import { AdminPageHeader, AdminTable, AdminTh, AdminTd, AdminPagination, AdminLink, AdminBadge } from '../../components/admin/AdminUi'
import { AdminExportButton } from '../../components/admin/AdminExportButton'

export default function AdminUsers() {
  const [params, setParams] = useSearchParams()
  const page = Number(params.get('page') || 1)
  const [search, setSearch] = useState(params.get('search') || '')
  const [data, setData] = useState<any>(null)

  useEffect(() => {
    adminAPI.listUsers({ page, limit: 25, search: search || undefined }).then((r) => setData(r.data))
  }, [page, search])

  return (
    <>
      <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
        <AdminPageHeader title="Users" subtitle="All customer accounts." />
        <AdminExportButton resource="users" />
      </div>
      <input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search email or name"
        className="mb-4 w-full max-w-md px-3 py-2 border rounded-lg text-sm"
      />
      <AdminTable>
        <thead><tr><AdminTh>Name</AdminTh><AdminTh>Email</AdminTh><AdminTh>Status</AdminTh><AdminTh>Joined</AdminTh></tr></thead>
        <tbody>
          {data?.items?.map((u: any) => (
            <tr key={u.id}>
              <AdminTd><AdminLink to={`/admin/users/${u.id}`}>{u.firstName} {u.lastName}</AdminLink></AdminTd>
              <AdminTd>{u.email}</AdminTd>
              <AdminTd>
                <AdminBadge tone={u.emailVerified ? 'green' : 'amber'}>{u.emailVerified ? 'Verified' : 'Unverified'}</AdminBadge>
                {u.suspendedAt ? <> <AdminBadge tone="red">Suspended</AdminBadge></> : null}
              </AdminTd>
              <AdminTd>{fmtShortDate(u.createdAt)}</AdminTd>
            </tr>
          ))}
        </tbody>
      </AdminTable>
      {data && <AdminPagination page={data.page} totalPages={data.totalPages} total={data.total} onPage={(p) => { const n = new URLSearchParams(params); n.set('page', String(p)); setParams(n) }} />}
    </>
  )
}
