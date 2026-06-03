import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { adminAPI } from '../../services/adminApi'
import { getApiErrorMessage } from '../../services/api'
import { fmtNairaMinor } from '../../lib/adminFormat'
import { AdminPageHeader, AdminSection } from '../../components/admin/AdminUi'

export default function AdminPayouts() {
  const [list, setList] = useState<any[]>([])
  const [amounts, setAmounts] = useState<Record<string, string>>({})

  useEffect(() => {
    adminAPI.getPayoutMechanics().then((r) => setList(Array.isArray(r.data) ? r.data : []))
  }, [])

  const pay = async (mechanicId: string) => {
    const naira = parseFloat(amounts[mechanicId] || '0')
    if (!naira || naira <= 0) {
      toast.error('Enter amount in naira')
      return
    }
    try {
      await adminAPI.recordPayout({ mechanicId, amountMinor: Math.round(naira * 100) })
      toast.success('Payout recorded')
      adminAPI.getPayoutMechanics().then((r) => setList(Array.isArray(r.data) ? r.data : []))
    } catch (e) {
      toast.error(getApiErrorMessage(e))
    }
  }

  return (
    <>
      <AdminPageHeader title="Payouts" subtitle="Mechanics with balance or fees due." />
      <div className="space-y-3">
        {list.map((m) => (
          <AdminSection key={m.id} title={m.companyName}>
            <p className="text-sm">Balance: {fmtNairaMinor(m.balance?.balanceMinor)}</p>
            <p className="text-sm text-slate-600">{m.defaultBankAccount ? `${m.defaultBankAccount.bankName} · ${m.defaultBankAccount.accountNumber}` : 'No default bank'}</p>
            <div className="flex gap-2 mt-2">
              <input
                type="number"
                placeholder="Amount ₦"
                value={amounts[m.id] ?? ''}
                onChange={(e) => setAmounts((v) => ({ ...v, [m.id]: e.target.value }))}
                className="text-sm border rounded-lg px-2 py-1.5 w-32"
              />
              <button type="button" onClick={() => pay(m.id)} className="text-sm px-3 py-1.5 bg-violet-600 text-white rounded-lg">Record payout</button>
            </div>
          </AdminSection>
        ))}
        {!list.length ? <p className="text-slate-600">No mechanics awaiting payout.</p> : null}
      </div>
    </>
  )
}
