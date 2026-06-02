import { useState, useEffect, useRef } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { walletAPI, getApiErrorMessage } from '../../services/api'
import LoadingSpinner from '../../components/LoadingSpinner'
import { Wallet as WalletIcon, ArrowDownLeft, CheckCircle2, XCircle } from 'lucide-react'

const typeLabels: Record<string, string> = {
  USER_PAYMENT: 'Payment to platform',
  PLATFORM_PAYOUT: 'Payout from platform',
  MECHANIC_FEE: 'Fee paid to platform',
  REFUND: 'Refund',
}

const statusBadge: Record<string, { class: string; label: string }> = {
  PENDING: { class: 'bg-amber-100 text-amber-800', label: 'Pending' },
  SUCCESS: { class: 'bg-emerald-100 text-emerald-800', label: 'Success' },
  FAILED: { class: 'bg-red-100 text-red-800', label: 'Failed' },
}

export default function UserWallet() {
  const [searchParams, setSearchParams] = useSearchParams()
  const navigate = useNavigate()
  const verifyStarted = useRef(false)
  const [transactions, setTransactions] = useState<any[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [verifying, setVerifying] = useState(false)

  useEffect(() => {
    walletAPI
      .getTransactions({ limit: 50 })
      .then((res) => {
        setTransactions(res.data.items || [])
        setTotal(res.data.total ?? 0)
      })
      .catch(() => toast.error('Failed to load transactions'))
      .finally(() => setLoading(false))
  }, [])

  /** Paystack redirects here: `/user/wallet?bookingId=…&reference=…&trxref=…` */
  useEffect(() => {
    const reference = searchParams.get('reference') || searchParams.get('trxref')
    if (!reference) {
      verifyStarted.current = false
      return
    }
    if (verifyStarted.current) return
    verifyStarted.current = true

    const bookingId = searchParams.get('bookingId')
    setVerifying(true)

    walletAPI
      .verifyPayment(reference.trim())
      .then(() => {
        toast.success('Payment confirmed')
        return walletAPI.getTransactions({ limit: 50 })
      })
      .then((r) => {
        setTransactions(r.data.items || [])
        setTotal(r.data.total ?? 0)
        if (bookingId) {
          navigate(`/user/bookings/${encodeURIComponent(bookingId)}`, { replace: true })
        } else {
          setSearchParams({}, { replace: true })
        }
      })
      .catch((err) => {
        verifyStarted.current = false
        const msg = getApiErrorMessage(err, 'Verification failed')
        const benign =
          msg.toLowerCase().includes('already processed') ||
          msg.toLowerCase().includes('not found or already processed')
        if (!benign) toast.error(msg)
        setSearchParams({}, { replace: true })
      })
      .finally(() => setVerifying(false))
  }, [searchParams, navigate, setSearchParams])

  if (loading && !verifying) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner variant="logo" size="lg" />
      </div>
    )
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-slate-800 mb-2 flex items-center gap-2">
        <WalletIcon className="h-8 w-8 text-primary-600" />
        Wallet
      </h1>
      <p className="text-slate-600 mb-8">
        View all your payments. Pay for accepted bookings from the booking detail page.
      </p>

      {verifying && (
        <div className="mb-6 p-4 rounded-xl bg-primary-50 border border-primary-200 text-primary-800 text-sm font-medium flex items-center gap-2">
          <span className="inline-block h-4 w-4 border-2 border-primary-600 border-t-transparent rounded-full animate-spin" />
          Confirming your payment…
        </div>
      )}

      <div className="bg-white rounded-xl shadow-card border border-slate-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <h2 className="font-semibold text-slate-800">Transaction history</h2>
          <p className="text-sm text-slate-500 mt-0.5">{total} transaction{total !== 1 ? 's' : ''}</p>
        </div>
        <ul className="divide-y divide-slate-100">
          {transactions.length === 0 && !verifying && (
            <li className="px-6 py-12 text-center text-slate-500">
              No transactions yet. When you pay for a booking (via Paystack or direct to mechanic), they will appear here.
            </li>
          )}
          {transactions.map((t) => (
            <li key={t.id} className="px-6 py-4 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className={`p-2 rounded-xl ${t.type === 'USER_PAYMENT' || t.type === 'REFUND' ? 'bg-primary-100 text-primary-700' : 'bg-slate-100 text-slate-600'}`}>
                  {t.type === 'USER_PAYMENT' ? (
                    <ArrowDownLeft className="h-5 w-5" />
                  ) : t.status === 'SUCCESS' ? (
                    <CheckCircle2 className="h-5 w-5" />
                  ) : (
                    <XCircle className="h-5 w-5" />
                  )}
                </div>
                <div className="min-w-0">
                  <p className="font-medium text-slate-800">{typeLabels[t.type] || t.type}</p>
                  <p className="text-sm text-slate-500 truncate">{t.description || t.bookingId || ''}</p>
                  {t.mechanic && (
                    <p className="text-xs text-slate-500">{t.mechanic.companyName}</p>
                  )}
                  <p className="text-xs text-slate-400 mt-0.5">
                    {new Date(t.createdAt).toLocaleString()}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className={`font-semibold ${t.type === 'REFUND' ? 'text-emerald-600' : 'text-slate-800'}`}>
                  {t.type === 'REFUND' ? '+' : ''}₦{(t.amountNaira ?? t.amountMinor / 100).toLocaleString()}
                </p>
                <span className={`inline-block mt-1 px-2 py-0.5 rounded-lg text-xs font-medium ${statusBadge[t.status]?.class ?? 'bg-slate-100 text-slate-600'}`}>
                  {statusBadge[t.status]?.label ?? t.status}
                </span>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
