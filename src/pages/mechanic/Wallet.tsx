import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import { walletAPI } from '../../services/api'
import LoadingSpinner from '../../components/LoadingSpinner'
import { Wallet as WalletIcon, ArrowDownLeft, ArrowUpRight, Banknote, AlertCircle } from 'lucide-react'

const typeLabels: Record<string, string> = {
  USER_PAYMENT: 'User paid platform',
  PLATFORM_PAYOUT: 'Payout to you',
  MECHANIC_FEE: 'Fee paid to platform',
  REFUND: 'Refund',
}

const statusBadge: Record<string, string> = {
  PENDING: 'bg-amber-100 text-amber-800',
  SUCCESS: 'bg-emerald-100 text-emerald-800',
  FAILED: 'bg-red-100 text-red-800',
}

export default function MechanicWallet() {
  const [summary, setSummary] = useState<{
    balance: any
    owing: any
    recentTransactions: any[]
  } | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    walletAPI
      .getSummary()
      .then((res) => setSummary(res.data))
      .catch(() => toast.error('Failed to load wallet'))
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  const balance = summary?.balance ?? {}
  const owing = summary?.owing ?? {}
  const recent = summary?.recentTransactions ?? []

  return (
    <div>
      <h1 className="text-3xl font-bold text-slate-800 mb-2 flex items-center gap-2">
        <WalletIcon className="h-8 w-8 text-primary-600" />
        Wallet
      </h1>
      <p className="text-slate-600 mb-8">
        Your balance, what you owe the platform, and transaction history.
      </p>

      <div className="grid gap-6 md:grid-cols-2 mb-8">
        <div className="bg-white rounded-xl shadow-card border border-slate-100 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 rounded-xl bg-emerald-100 text-emerald-700">
              <Banknote className="h-6 w-6" />
            </div>
            <div>
              <h2 className="font-semibold text-slate-800">Platform owes you</h2>
              <p className="text-sm text-slate-500">80% of platform-paid jobs, minus payouts</p>
            </div>
          </div>
          <p className="text-2xl font-bold text-emerald-700">
            ₦{(balance.balanceNaira ?? 0).toLocaleString()}
          </p>
          <p className="text-xs text-slate-500 mt-1">
            Total earned from platform: ₦{((balance.totalEarnedFromPlatformMinor ?? 0) / 100).toLocaleString()} · Payouts: ₦{((balance.totalPayoutsMinor ?? 0) / 100).toLocaleString()}
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-card border border-slate-100 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 rounded-xl bg-amber-100 text-amber-700">
              <AlertCircle className="h-6 w-6" />
            </div>
            <div>
              <h2 className="font-semibold text-slate-800">You owe platform</h2>
              <p className="text-sm text-slate-500">20% fee on jobs paid directly to you</p>
            </div>
          </div>
          <p className="text-2xl font-bold text-amber-700">
            ₦{(owing.owingNaira ?? 0).toLocaleString()}
          </p>
          <p className="text-xs text-slate-500 mt-1">
            Total fee owed: ₦{((owing.totalFeeOwedMinor ?? 0) / 100).toLocaleString()} · Paid: ₦{((owing.totalFeePaidMinor ?? 0) / 100).toLocaleString()}
          </p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-card border border-slate-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <h2 className="font-semibold text-slate-800">Recent transactions</h2>
          <p className="text-sm text-slate-500 mt-0.5">Payouts, fees, and related activity</p>
        </div>
        <ul className="divide-y divide-slate-100">
          {recent.length === 0 && (
            <li className="px-6 py-12 text-center text-slate-500">
              No transactions yet. When users pay via the platform you’ll see payouts here; when they pay you directly, your fee to us will show here.
            </li>
          )}
          {recent.map((t: any) => (
            <li key={t.id} className="px-6 py-4 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className={`p-2 rounded-xl ${t.type === 'PLATFORM_PAYOUT' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>
                  {t.type === 'PLATFORM_PAYOUT' ? (
                    <ArrowDownLeft className="h-5 w-5" />
                  ) : (
                    <ArrowUpRight className="h-5 w-5" />
                  )}
                </div>
                <div className="min-w-0">
                  <p className="font-medium text-slate-800">{typeLabels[t.type] || t.type}</p>
                  <p className="text-sm text-slate-500 truncate">{t.description || t.bookingId || '—'}</p>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {new Date(t.createdAt).toLocaleString()}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className={`font-semibold ${t.type === 'PLATFORM_PAYOUT' ? 'text-emerald-600' : 'text-slate-800'}`}>
                  {t.type === 'PLATFORM_PAYOUT' ? '+' : ''}₦{(t.amountNaira ?? t.amountMinor / 100).toLocaleString()}
                </p>
                <span className={`inline-block mt-1 px-2 py-0.5 rounded-lg text-xs font-medium ${statusBadge[t.status] ?? 'bg-slate-100 text-slate-600'}`}>
                  {t.status}
                </span>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
