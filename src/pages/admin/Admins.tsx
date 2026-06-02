import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { adminAPI } from '../../services/adminApi'
import { getApiErrorMessage } from '../../services/api'
import { fmtShortDate } from '../../lib/adminFormat'
import { AdminPageHeader, AdminSection, AdminTable, AdminTh, AdminTd, AdminBadge } from '../../components/admin/AdminUi'
import { ADMIN_PERMISSION_OPTIONS } from '../../components/admin/AdminExportButton'

export default function AdminAdmins() {
  const [data, setData] = useState<any>(null)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editSuperadmin, setEditSuperadmin] = useState(true)
  const [editPerms, setEditPerms] = useState<string[]>([])

  const load = () => adminAPI.listAdmins({ page: 1, limit: 50 }).then((r) => setData(r.data))

  useEffect(() => { load() }, [])

  const create = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await adminAPI.createAdmin({ email, password, superadmin: true })
      toast.success('Admin created')
      setEmail('')
      setPassword('')
      load()
    } catch (err) {
      toast.error(getApiErrorMessage(err))
    }
  }

  const startEdit = (a: any) => {
    setEditingId(a.id)
    const perms = Array.isArray(a.adminPermissions) ? a.adminPermissions : []
    setEditSuperadmin(!a.adminPermissions || perms.length === 0)
    setEditPerms(perms)
  }

  const savePermissions = async () => {
    if (!editingId) return
    try {
      await adminAPI.updateAdminPermissions(editingId, {
        superadmin: editSuperadmin,
        permissions: editSuperadmin ? undefined : editPerms,
      })
      toast.success('Permissions updated')
      setEditingId(null)
      load()
    } catch (err) {
      toast.error(getApiErrorMessage(err))
    }
  }

  const togglePerm = (key: string) => {
    setEditPerms((prev) => (prev.includes(key) ? prev.filter((p) => p !== key) : [...prev, key]))
  }

  return (
    <>
      <AdminPageHeader title="Admin users" subtitle="Manage who can access the console and what they can do." />
      <AdminSection title="Create admin (superadmin)">
        <form onSubmit={create} className="flex flex-wrap gap-2">
          <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" className="border rounded-lg px-3 py-2 text-sm" />
          <input type="password" required minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" className="border rounded-lg px-3 py-2 text-sm" />
          <button type="submit" className="px-4 py-2 bg-violet-600 text-white rounded-lg text-sm font-medium">Create</button>
        </form>
      </AdminSection>
      <AdminTable>
        <thead><tr><AdminTh>Email</AdminTh><AdminTh>Access</AdminTh><AdminTh>Created</AdminTh><AdminTh>Actions</AdminTh></tr></thead>
        <tbody>
          {data?.items?.map((a: any) => (
            <tr key={a.id}>
              <AdminTd>{a.email}</AdminTd>
              <AdminTd>
                {a.adminPermissions && Array.isArray(a.adminPermissions) && a.adminPermissions.length > 0 ? (
                  <span className="text-xs">{a.adminPermissions.join(', ')}</span>
                ) : (
                  <AdminBadge tone="green">Superadmin</AdminBadge>
                )}
              </AdminTd>
              <AdminTd>{fmtShortDate(a.createdAt)}</AdminTd>
              <AdminTd>
                <button type="button" className="text-xs text-violet-700 font-medium" onClick={() => startEdit(a)}>
                  Edit permissions
                </button>
              </AdminTd>
            </tr>
          ))}
        </tbody>
      </AdminTable>

      {editingId ? (
        <AdminSection title="Permission editor">
          <label className="flex items-center gap-2 text-sm mb-3">
            <input type="checkbox" checked={editSuperadmin} onChange={(e) => setEditSuperadmin(e.target.checked)} />
            Superadmin (full access)
          </label>
          {!editSuperadmin ? (
            <div className="grid sm:grid-cols-2 gap-2 mb-4">
              {ADMIN_PERMISSION_OPTIONS.map((p) => (
                <label key={p.key} className="flex items-center gap-2 text-sm border border-slate-200 rounded-lg px-3 py-2">
                  <input type="checkbox" checked={editPerms.includes(p.key)} onChange={() => togglePerm(p.key)} />
                  {p.label}
                </label>
              ))}
            </div>
          ) : null}
          <div className="flex gap-2">
            <button type="button" onClick={savePermissions} className="px-4 py-2 bg-violet-600 text-white rounded-lg text-sm">Save</button>
            <button type="button" onClick={() => setEditingId(null)} className="px-4 py-2 border rounded-lg text-sm">Cancel</button>
          </div>
        </AdminSection>
      ) : null}
    </>
  )
}
