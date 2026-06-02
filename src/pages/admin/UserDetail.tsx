import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import toast from 'react-hot-toast'
import { adminAPI } from '../../services/adminApi'
import { getApiErrorMessage } from '../../services/api'
import { fmtShortDate } from '../../lib/adminFormat'
import { AdminPageHeader, AdminSection, AdminLink, AdminBadge } from '../../components/admin/AdminUi'

export default function AdminUserDetail() {
  const { id } = useParams()
  const [user, setUser] = useState<any>(null)
  const [suspendReason, setSuspendReason] = useState('')

  const load = () => id && adminAPI.getUser(id).then((r) => setUser(r.data))

  useEffect(() => { load() }, [id])

  if (!user) return <p>Loading…</p>

  const toggleVerified = async () => {
    try {
      await adminAPI.setUserEmailVerified(user.id, !user.emailVerified)
      toast.success('Updated')
      load()
    } catch (e) {
      toast.error(getApiErrorMessage(e))
    }
  }

  const toggleSuspend = async () => {
    const suspending = !user.suspendedAt
    try {
      await adminAPI.setUserSuspended(user.id, {
        suspend: suspending,
        reason: suspending ? suspendReason.trim() || undefined : undefined,
      })
      toast.success(suspending ? 'User suspended' : 'User reinstated')
      setSuspendReason('')
      load()
    } catch (e) {
      toast.error(getApiErrorMessage(e))
    }
  }

  return (
    <>
      <AdminPageHeader backTo="/admin/users" title={`${user.firstName ?? ''} ${user.lastName ?? ''}`.trim() || user.email} />
      <AdminSection title="Profile">
        <p className="text-sm">{user.email}</p>
        <p className="text-sm mt-1">
          Verified: <AdminBadge tone={user.emailVerified ? 'green' : 'amber'}>{String(user.emailVerified)}</AdminBadge>
        </p>
        {user.suspendedAt ? (
          <p className="text-sm mt-2 text-red-700">
            Suspended {fmtShortDate(user.suspendedAt)}
            {user.suspendedReason ? `: ${user.suspendedReason}` : ''}
          </p>
        ) : null}
        <div className="flex flex-wrap gap-2 mt-3">
          <button type="button" onClick={toggleVerified} className="text-sm px-3 py-1.5 border rounded-lg">Toggle email verified</button>
        </div>
      </AdminSection>
      <AdminSection title="Suspend / reinstate">
        {!user.suspendedAt ? (
          <input
            value={suspendReason}
            onChange={(e) => setSuspendReason(e.target.value)}
            placeholder="Reason (optional)"
            className="w-full max-w-md border rounded-lg px-3 py-2 text-sm mb-2"
          />
        ) : null}
        <button
          type="button"
          onClick={toggleSuspend}
          className={`text-sm px-3 py-1.5 rounded-lg text-white ${user.suspendedAt ? 'bg-emerald-600' : 'bg-red-600'}`}
        >
          {user.suspendedAt ? 'Reinstate account' : 'Suspend account'}
        </button>
      </AdminSection>
      <AdminSection title={`Bookings (${user.bookings?.length ?? 0})`}>
        <ul className="text-sm space-y-2">
          {user.bookings?.map((b: any) => (
            <li key={b.id}>
              <AdminLink to={`/admin/bookings/${b.id}`}>{b.fault?.name} · {b.status}</AdminLink>
            </li>
          ))}
        </ul>
      </AdminSection>
    </>
  )
}
