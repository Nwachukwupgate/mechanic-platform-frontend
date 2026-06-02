import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import toast from 'react-hot-toast'
import { adminAPI } from '../../services/adminApi'
import { getApiErrorMessage } from '../../services/api'
import { fmtNairaMinor, fmtShortDate } from '../../lib/adminFormat'
import { AdminPageHeader, AdminSection, AdminJson, AdminLink } from '../../components/admin/AdminUi'

export default function AdminTransactionDetail() {
  const { id } = useParams()
  const [tx, setTx] = useState<any>(null)

  const load = () => id && adminAPI.getTransaction(id).then((r) => setTx(r.data))

  useEffect(() => { load() }, [id])

  if (!tx) return <p>Loading…</p>

  const reconcile = async () => {
    try {
      const r = await adminAPI.reconcileTransaction(tx.id)
      toast.success(r.data.message ?? 'Done')
      load()
    } catch (e) {
      toast.error(getApiErrorMessage(e))
    }
  }

  return (
    <>
      <AdminPageHeader backTo="/admin/transactions" title={tx.type.replace(/_/g, ' ')} subtitle={tx.reference} />
      <AdminSection title="Summary">
        <p className="text-sm">Amount: {fmtNairaMinor(tx.amountMinor)} · {tx.status}</p>
        <p className="text-sm">{fmtShortDate(tx.createdAt)}</p>
        {tx.bookingId ? <p className="text-sm mt-1"><AdminLink to={`/admin/bookings/${tx.bookingId}`}>Open booking</AdminLink></p> : null}
        <button type="button" onClick={reconcile} className="mt-3 text-sm px-3 py-1.5 bg-violet-600 text-white rounded-lg">Reconcile with Paystack</button>
      </AdminSection>
      <AdminSection title="Full record"><AdminJson data={tx} /></AdminSection>
    </>
  )
}
