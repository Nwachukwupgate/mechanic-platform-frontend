import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import toast from 'react-hot-toast'
import { Ban, CheckCircle2, ShieldCheck, ShieldOff, Wallet } from 'lucide-react'
import { adminAPI } from '../../services/adminApi'
import { getApiErrorMessage } from '../../services/api'
import { fmtNairaMinor, fmtShortDate } from '../../lib/adminFormat'
import {
  AdminPageHeader,
  AdminSection,
  AdminLink,
  AdminBadge,
  StatCard,
} from '../../components/admin/AdminUi'
import { MechanicProfilePanel } from '../../components/admin/MechanicProfilePanel'
import { AdminConfirmModal } from '../../components/admin/AdminConfirmModal'

type ConfirmAction = 'verify-on' | 'verify-off' | 'suspend' | 'reinstate' | null

export default function AdminMechanicDetail() {
  const { id } = useParams()
  const [m, setM] = useState<any>(null)
  const [suspendReason, setSuspendReason] = useState('')
  const [confirmAction, setConfirmAction] = useState<ConfirmAction>(null)
  const [actionLoading, setActionLoading] = useState(false)

  const load = () => id && adminAPI.getMechanic(id).then((r) => setM(r.data))

  useEffect(() => {
    load()
  }, [id])

  const runVerify = async (verified: boolean) => {
    setActionLoading(true)
    try {
      await adminAPI.setMechanicVerified(m.id, verified)
      toast.success(verified ? 'Mechanic marked as verified' : 'Verification removed')
      setConfirmAction(null)
      load()
    } catch (e) {
      toast.error(getApiErrorMessage(e))
    } finally {
      setActionLoading(false)
    }
  }

  const runSuspend = async (suspend: boolean) => {
    setActionLoading(true)
    try {
      await adminAPI.setMechanicSuspended(m.id, {
        suspend,
        reason: suspend ? suspendReason.trim() || undefined : undefined,
      })
      toast.success(suspend ? 'Mechanic suspended' : 'Mechanic reinstated')
      setSuspendReason('')
      setConfirmAction(null)
      load()
    } catch (e) {
      toast.error(getApiErrorMessage(e))
    } finally {
      setActionLoading(false)
    }
  }

  const handleConfirm = () => {
    if (!confirmAction || !m) return
    if (confirmAction === 'verify-on') return runVerify(true)
    if (confirmAction === 'verify-off') return runVerify(false)
    if (confirmAction === 'suspend') return runSuspend(true)
    if (confirmAction === 'reinstate') return runSuspend(false)
  }

  if (!m) {
    return (
      <div className="flex items-center justify-center min-h-[240px] text-slate-500 text-sm">
        Loading mechanic…
      </div>
    )
  }

  const modalCopy: Record<NonNullable<ConfirmAction>, { title: string; message: string; confirmText: string; variant: 'primary' | 'danger' | 'success' }> = {
    'verify-on': {
      title: 'Verify mechanic',
      message: `Mark ${m.companyName} as verified? They will appear as a trusted mechanic on the platform.`,
      confirmText: 'Verify',
      variant: 'primary',
    },
    'verify-off': {
      title: 'Remove verification',
      message: `Remove verified status from ${m.companyName}? This does not suspend their account.`,
      confirmText: 'Remove verification',
      variant: 'danger',
    },
    suspend: {
      title: 'Suspend mechanic',
      message: `Suspend ${m.companyName}? They will not be able to use the app until reinstated.`,
      confirmText: 'Suspend account',
      variant: 'danger',
    },
    reinstate: {
      title: 'Reinstate mechanic',
      message: `Restore access for ${m.companyName}?`,
      confirmText: 'Reinstate',
      variant: 'success',
    },
  }

  const activeModal = confirmAction ? modalCopy[confirmAction] : null

  return (
    <>
      <AdminPageHeader backTo="/admin/mechanics" title={m.companyName} subtitle={m.ownerFullName} />

      <div className="grid lg:grid-cols-3 gap-4 mb-4">
        <div className="lg:col-span-2 grid sm:grid-cols-2 gap-4">
          <StatCard
            label="Account"
            value={m.isVerified ? 'Verified' : 'Unverified'}
            hint={m.email}
            tone={m.suspendedAt ? 'danger' : m.isVerified ? 'ok' : 'warn'}
          />
          <StatCard
            label="Wallet balance"
            value={fmtNairaMinor(m.balance?.balanceMinor)}
            hint={`Platform fee owed: ${fmtNairaMinor(m.owing?.totalFeeOwedMinor)}`}
          />
        </div>

        <AdminSection title="Admin actions">
          <p className="text-xs text-slate-500 mb-4">
            Changes take effect immediately. Confirm before applying.
          </p>
          <div className="flex flex-col gap-2">
            {m.isVerified ? (
              <button
                type="button"
                onClick={() => setConfirmAction('verify-off')}
                className="inline-flex items-center justify-center gap-2 w-full px-4 py-2.5 rounded-lg border border-slate-200 text-sm font-medium text-slate-800 hover:bg-slate-50"
              >
                <ShieldOff className="h-4 w-4 text-slate-500" />
                Remove verification
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setConfirmAction('verify-on')}
                className="inline-flex items-center justify-center gap-2 w-full px-4 py-2.5 rounded-lg bg-violet-600 text-white text-sm font-medium hover:bg-violet-700"
              >
                <ShieldCheck className="h-4 w-4" />
                Mark as verified
              </button>
            )}
            {m.suspendedAt ? (
              <button
                type="button"
                onClick={() => setConfirmAction('reinstate')}
                className="inline-flex items-center justify-center gap-2 w-full px-4 py-2.5 rounded-lg bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-700"
              >
                <CheckCircle2 className="h-4 w-4" />
                Reinstate account
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setConfirmAction('suspend')}
                className="inline-flex items-center justify-center gap-2 w-full px-4 py-2.5 rounded-lg bg-red-600 text-white text-sm font-medium hover:bg-red-700"
              >
                <Ban className="h-4 w-4" />
                Suspend account
              </button>
            )}
          </div>
          {m.suspendedAt ? (
            <p className="mt-4 text-sm text-red-700 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
              Suspended {fmtShortDate(m.suspendedAt)}
              {m.suspendedReason ? ` · ${m.suspendedReason}` : ''}
            </p>
          ) : null}
        </AdminSection>
      </div>

      <AdminSection title="Mechanic profile">
        <MechanicProfilePanel profile={m.profile} ownerName={m.ownerFullName} />
      </AdminSection>

      <div className="grid md:grid-cols-2 gap-4">
        <AdminSection title="Wallet details">
          <div className="flex items-start gap-3">
            <Wallet className="h-5 w-5 text-slate-400 mt-0.5" />
            <dl className="text-sm space-y-2 flex-1">
              <div className="flex justify-between gap-4">
                <dt className="text-slate-500">Balance</dt>
                <dd className="font-semibold text-slate-900">{fmtNairaMinor(m.balance?.balanceMinor)}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-slate-500">Fee owed</dt>
                <dd className="font-semibold text-amber-700">{fmtNairaMinor(m.owing?.totalFeeOwedMinor)}</dd>
              </div>
            </dl>
          </div>
        </AdminSection>

        <AdminSection title={`Recent bookings (${m.bookings?.length ?? 0})`}>
          {m.bookings?.length ? (
            <ul className="text-sm space-y-2">
              {m.bookings.map((b: any) => (
                <li
                  key={b.id}
                  className="flex items-center justify-between gap-2 py-2 border-b border-slate-100 last:border-0"
                >
                  <AdminLink to={`/admin/bookings/${b.id}`}>{b.fault?.name ?? 'Booking'}</AdminLink>
                  <AdminBadge tone="slate">{b.status}</AdminBadge>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-slate-500">No bookings yet.</p>
          )}
        </AdminSection>
      </div>

      <AdminConfirmModal
        open={confirmAction != null}
        title={activeModal?.title ?? ''}
        message={activeModal?.message ?? ''}
        confirmText={activeModal?.confirmText}
        confirmVariant={activeModal?.variant}
        loading={actionLoading}
        onCancel={() => {
          if (!actionLoading) {
            setConfirmAction(null)
            setSuspendReason('')
          }
        }}
        onConfirm={handleConfirm}
      >
        {confirmAction === 'suspend' ? (
          <label className="block">
            <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Reason (optional)
            </span>
            <textarea
              value={suspendReason}
              onChange={(e) => setSuspendReason(e.target.value)}
              rows={3}
              placeholder="Why is this account being suspended?"
              className="mt-1.5 w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-violet-500 focus:border-violet-500"
            />
          </label>
        ) : null}
      </AdminConfirmModal>
    </>
  )
}
