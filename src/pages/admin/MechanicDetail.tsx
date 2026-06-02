import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import toast from 'react-hot-toast'
import { adminAPI } from '../../services/adminApi'
import { getApiErrorMessage } from '../../services/api'
import { fmtNairaMinor, fmtShortDate } from '../../lib/adminFormat'
import { AdminPageHeader, AdminSection, AdminLink, AdminBadge, AdminJson } from '../../components/admin/AdminUi'

export default function AdminMechanicDetail() {
  const { id } = useParams()
  const [m, setM] = useState<any>(null)
  const [suspendReason, setSuspendReason] = useState('')

  const load = () => id && adminAPI.getMechanic(id).then((r) => setM(r.data))

  useEffect(() => { load() }, [id])

  if (!m) return <p>Loading…</p>

  const toggleVerify = async () => {
    try {
      await adminAPI.setMechanicVerified(m.id, !m.isVerified)
      toast.success('Updated')
      load()
    } catch (e) {
      toast.error(getApiErrorMessage(e))
    }
  }

  const toggleSuspend = async () => {
    const suspending = !m.suspendedAt
    try {
      await adminAPI.setMechanicSuspended(m.id, {
        suspend: suspending,
        reason: suspending ? suspendReason.trim() || undefined : undefined,
      })
      toast.success(suspending ? 'Mechanic suspended' : 'Mechanic reinstated')
      setSuspendReason('')
      load()
    } catch (e) {
      toast.error(getApiErrorMessage(e))
    }
  }

  return (
    <>
      <AdminPageHeader backTo="/admin/mechanics" title={m.companyName} subtitle={m.ownerFullName} />
      <div className="grid md:grid-cols-2 gap-4">
        <AdminSection title="Status">
          <p className="text-sm">{m.email}</p>
          <p className="text-sm mt-2">Verified: <AdminBadge tone={m.isVerified ? 'green' : 'slate'}>{String(m.isVerified)}</AdminBadge></p>
          {m.suspendedAt ? (
            <p className="text-sm mt-2 text-red-700">
              Suspended {fmtShortDate(m.suspendedAt)}
              {m.suspendedReason ? `: ${m.suspendedReason}` : ''}
            </p>
          ) : null}
          <button type="button" onClick={toggleVerify} className="mt-2 text-sm px-3 py-1.5 border rounded-lg">Toggle verified</button>
        </AdminSection>
        <AdminSection title="Wallet">
          <p className="text-sm">Balance: {fmtNairaMinor(m.balance?.balanceMinor)}</p>
          <p className="text-sm">Fee owed: {fmtNairaMinor(m.owing?.totalFeeOwedMinor)}</p>
        </AdminSection>
      </div>
      <AdminSection title="Suspend / reinstate">
        {!m.suspendedAt ? (
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
          className={`text-sm px-3 py-1.5 rounded-lg text-white ${m.suspendedAt ? 'bg-emerald-600' : 'bg-red-600'}`}
        >
          {m.suspendedAt ? 'Reinstate account' : 'Suspend account'}
        </button>
      </AdminSection>
      <AdminSection title="Recent bookings">
        <ul className="text-sm space-y-1">
          {m.bookings?.map((b: any) => (
            <li key={b.id}><AdminLink to={`/admin/bookings/${b.id}`}>{b.fault?.name} · {b.status}</AdminLink></li>
          ))}
        </ul>
      </AdminSection>
      <AdminSection title="Profile"><AdminJson data={m.profile} /></AdminSection>
    </>
  )
}
