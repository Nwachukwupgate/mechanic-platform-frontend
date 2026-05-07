import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import toast from 'react-hot-toast'
import { getApiErrorMessage, mechanicsAPI, walletAPI } from '../../services/api'
import LoadingSpinner from '../../components/LoadingSpinner'
import { AlertCircle, ArrowDownLeft, ArrowDownToLine, ArrowUpRight, Banknote, Building2, Plus, Star, Trash2, Wallet as WalletIcon } from 'lucide-react'

type BankAccount = {
  id: string
  bankCode: string
  bankName: string
  accountNumber: string
  accountName: string
  isDefault: boolean
}

const typeLabels: Record<string, string> = {
  USER_PAYMENT: 'User paid platform',
  PLATFORM_PAYOUT: 'Payout to you',
  MECHANIC_FEE: 'Fee paid to platform',
  PLATFORM_FEE_AUTO_SETTLEMENT: 'Auto fee settlement',
  AUTO_PLATFORM_FEE_SETTLEMENT: 'Auto fee settlement',
  FEE_SETTLEMENT: 'Auto fee settlement',
  REFUND: 'Refund',
}

const statusBadge: Record<string, string> = {
  PENDING: 'bg-amber-100 text-amber-800',
  SUCCESS: 'bg-emerald-100 text-emerald-800',
  FAILED: 'bg-red-100 text-red-800',
}

export default function MechanicWallet() {
  const [searchParams, setSearchParams] = useSearchParams()
  const feeVerifyStarted = useRef(false)
  const [summary, setSummary] = useState<{
    balance: any
    recentTransactions: any[]
    pendingPlatformFeeCheckouts?: any[]
  } | null>(null)
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([])
  const [banks, setBanks] = useState<Array<{ code: string; name: string }>>([])
  const [loading, setLoading] = useState(true)
  const [showAddBank, setShowAddBank] = useState(false)
  const [addForm, setAddForm] = useState({ bankCode: '', bankName: '', accountNumber: '', accountName: '' })
  const [submitting, setSubmitting] = useState(false)
  const [withdrawAmount, setWithdrawAmount] = useState('')
  const [withdrawing, setWithdrawing] = useState(false)
  const [payingFee, setPayingFee] = useState(false)
  const [paystackFeeRef, setPaystackFeeRef] = useState('')

  const loadData = () => {
    setLoading(true)
    Promise.all([
      walletAPI.getSummary().then((res) => setSummary(res.data)),
      mechanicsAPI.listBankAccounts().then((res) => setBankAccounts(res.data)).catch(() => setBankAccounts([])),
      walletAPI.getBanks().then((res) => setBanks(res.data)).catch(() => setBanks([])),
    ])
      .catch(() => toast.error('Failed to load wallet'))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    loadData()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner variant="logo" size="lg" />
      </div>
    )
  }

  const balance = summary?.balance ?? {}
  const pendingFeeCheckouts = summary?.pendingPlatformFeeCheckouts ?? []
  const pendingCheckoutMinor = Number(balance.pendingPlatformFeeCheckoutMinor ?? 0)
  const grossWithdrawableMinor = Number(balance.availableToWithdrawMinor ?? balance.balanceMinor ?? 0)
  const dueMinor = Number(balance.unpaidPlatformFeeMinor ?? 0)
  const autoSettledMinor = Math.max(0, Number(balance.totalAutoFeeSettledMinor ?? 0))
  const netMinor = Number(balance.netMinor ?? grossWithdrawableMinor - dueMinor)
  const canStartFeeCheckout = pendingFeeCheckouts.length === 0
  const recent = summary?.recentTransactions ?? []
  const availableToWithdrawMinor = useMemo(() => {
    if (Number.isFinite(grossWithdrawableMinor)) return grossWithdrawableMinor
    return 0
  }, [grossWithdrawableMinor])

  useEffect(() => {
    const reference = searchParams.get('reference') || searchParams.get('trxref')
    if (!reference) {
      feeVerifyStarted.current = false
      return
    }
    if (feeVerifyStarted.current) return
    feeVerifyStarted.current = true
    walletAPI
      .verifyMechanicFeePayment(reference.trim())
      .then(() => {
        toast.success('Platform fee payment confirmed')
        setSearchParams({}, { replace: true })
        loadData()
      })
      .catch((e: unknown) => {
        feeVerifyStarted.current = false
        const msg = getApiErrorMessage(e, 'Could not verify payment')
        const benign =
          msg.toLowerCase().includes('already') || msg.toLowerCase().includes('not found or already processed')
        if (!benign) toast.error(msg)
        setSearchParams({}, { replace: true })
      })
  }, [searchParams, setSearchParams])

  return (
    <div>
      <h1 className="text-3xl font-bold text-slate-800 mb-2 flex items-center gap-2">
        <WalletIcon className="h-8 w-8 text-primary-600" />
        Wallet
      </h1>
      <p className="text-slate-600 mb-8">
        Net balance, withdrawals, platform fee due, and transaction history.
      </p>

      <div className="grid gap-6 md:grid-cols-2 mb-8">
        <div className="bg-white rounded-xl shadow-card border border-slate-100 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 rounded-xl bg-emerald-100 text-emerald-700">
              <Banknote className="h-6 w-6" />
            </div>
            <div>
              <h2 className="font-semibold text-slate-800">Available to withdraw now</h2>
              <p className="text-sm text-slate-500">From platform-paid jobs after fee settlement</p>
            </div>
          </div>
          <p className="text-2xl font-bold text-emerald-700">
            ₦{(availableToWithdrawMinor / 100).toLocaleString()}
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
              <h2 className="font-semibold text-slate-800">Platform fee amount due</h2>
              <p className="text-sm text-slate-500">Remaining 20% fee from direct-paid jobs</p>
            </div>
          </div>
          <p className="text-2xl font-bold text-amber-700">
            ₦{(dueMinor / 100).toLocaleString()}
          </p>
          <p className="text-xs text-slate-500 mt-1">
            Total fee owed: ₦{((balance.totalFeeOwedMinor ?? 0) / 100).toLocaleString()} · Paid: ₦{((balance.totalFeePaidMinor ?? 0) / 100).toLocaleString()}
          </p>
          {autoSettledMinor > 0 && (
            <p className="text-xs text-slate-500 mt-1">
              Auto-settled from platform earnings: ₦{(autoSettledMinor / 100).toLocaleString()}
            </p>
          )}
        </div>
      </div>

      <div className="mb-6 rounded-xl border border-slate-200 bg-white p-4">
        <p className="text-sm text-slate-600">
          Net wallet position: <span className="font-semibold text-slate-900">₦{(netMinor / 100).toLocaleString()}</span>
        </p>
      </div>

      {/* Withdraw to bank */}
      <div className="bg-white rounded-xl shadow-card border border-slate-100 p-6 mb-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 rounded-xl bg-emerald-100 text-emerald-700">
            <ArrowDownToLine className="h-6 w-6" />
          </div>
          <div>
            <h2 className="font-semibold text-slate-800">Withdraw to bank</h2>
            <p className="text-sm text-slate-500">Send your withdrawable balance to your default bank account.</p>
          </div>
        </div>
        <div className="flex flex-wrap items-end gap-3">
          <div className="min-w-[140px]">
            <label className="block text-sm font-medium text-slate-700 mb-1">Amount (₦)</label>
            <input
              type="number"
              min="1"
              step="1"
              value={withdrawAmount}
              onChange={(e) => setWithdrawAmount(e.target.value)}
              placeholder="0"
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <button
            type="button"
            disabled={withdrawing || !withdrawAmount || availableToWithdrawMinor < 100}
            onClick={async () => {
              const naira = parseFloat(withdrawAmount)
              if (!Number.isFinite(naira) || naira < 1) {
                toast.error('Enter a valid amount (min ₦1)')
                return
              }
              const amountMinor = Math.round(naira * 100)
              if (amountMinor > availableToWithdrawMinor) {
                toast.error('Amount exceeds withdrawable balance')
                return
              }
              setWithdrawing(true)
              try {
                await walletAPI.withdraw(amountMinor)
                toast.success(`₦${naira.toLocaleString()} sent to your bank account`)
                setWithdrawAmount('')
                loadData()
              } catch (e: any) {
                toast.error(e.response?.data?.message || 'Withdrawal failed')
              } finally {
                setWithdrawing(false)
              }
            }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
          >
            {withdrawing ? (
              <>
                <span className="inline-block h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Sending…
              </>
            ) : (
              <>
                <ArrowDownToLine className="h-4 w-4" />
                Withdraw
              </>
            )}
          </button>
        </div>
        {availableToWithdrawMinor < 100 && (
          <p className="mt-2 text-sm text-slate-500">Add a default bank account below and ensure you have at least ₦1 balance.</p>
        )}
      </div>

      {dueMinor >= 100 && (
        <div className="bg-white rounded-xl shadow-card border border-slate-100 p-6 mb-8">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-3 rounded-xl bg-amber-100 text-amber-700">
              <AlertCircle className="h-6 w-6" />
            </div>
            <div>
              <h2 className="font-semibold text-slate-800">Pay platform fee</h2>
              <p className="text-sm text-slate-500">Pay remaining direct-job fee with Paystack card checkout.</p>
            </div>
          </div>
          <p className="text-sm text-slate-700 mb-3">
            Amount due: <span className="font-semibold">₦{(dueMinor / 100).toLocaleString()}</span>
          </p>
          {pendingCheckoutMinor > 0 && (
            <p className="text-xs text-slate-500 mb-3">
              ₦{(pendingCheckoutMinor / 100).toLocaleString()} is in a pending checkout.
            </p>
          )}
          {pendingFeeCheckouts.length > 0 && (
            <div className="mb-3 space-y-2">
              {pendingFeeCheckouts.map((p: any) => (
                <div key={p.id} className="rounded-lg bg-slate-50 border border-slate-200 px-3 py-2 text-sm flex flex-wrap gap-2 items-center justify-between">
                  <span>Pending checkout: ₦{(p.amountNaira ?? p.amountMinor / 100).toLocaleString()}</span>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setPaystackFeeRef(p.paystackReference || '')
                        window.location.href = p.authorizationUrl
                      }}
                      className="px-3 py-1.5 rounded-lg bg-primary-600 text-white hover:bg-primary-700 text-xs"
                    >
                      Continue
                    </button>
                    <button
                      type="button"
                      onClick={async () => {
                        try {
                          await walletAPI.cancelMechanicFeeCheckout(p.paystackReference || p.internalReference || '')
                          toast.success('Pending checkout cancelled')
                          loadData()
                        } catch (e: unknown) {
                          toast.error(getApiErrorMessage(e, 'Could not cancel checkout'))
                        }
                      }}
                      className="px-3 py-1.5 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50 text-xs"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
          <button
            type="button"
            disabled={payingFee || !canStartFeeCheckout}
            onClick={async () => {
              setPayingFee(true)
              try {
                const r = await walletAPI.initializeMechanicFeePayment({ amountMinor: dueMinor })
                setPaystackFeeRef(r.data.reference)
                window.location.href = r.data.authorizationUrl
              } catch (e: unknown) {
                toast.error(getApiErrorMessage(e, 'Could not start fee payment'))
              } finally {
                setPayingFee(false)
              }
            }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-amber-600 text-white rounded-xl hover:bg-amber-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
          >
            {payingFee ? 'Starting…' : `Pay ₦${(dueMinor / 100).toLocaleString()} with card`}
          </button>
          {paystackFeeRef && (
            <p className="text-xs text-slate-500 mt-2">Checkout reference: {paystackFeeRef}</p>
          )}
        </div>
      )}

      {/* Withdrawal bank accounts */}
      <div className="bg-white rounded-xl shadow-card border border-slate-100 p-6 mb-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-primary-100 text-primary-600">
              <Building2 className="h-6 w-6" />
            </div>
            <div>
              <h2 className="font-semibold text-slate-800">Withdrawal account</h2>
              <p className="text-sm text-slate-500">Add a bank account so we can pay you. Withdrawals go to your default account.</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setShowAddBank((v) => !v)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-xl hover:bg-primary-700 text-sm font-medium"
          >
            <Plus className="h-4 w-4" />
            {showAddBank ? 'Cancel' : 'Add account'}
          </button>
        </div>
        {showAddBank && (
          <div className="mt-4 p-4 bg-slate-50 rounded-xl border border-slate-100 space-y-3">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Bank</label>
              <select
                value={addForm.bankCode}
                onChange={(e) => {
                  const code = e.target.value
                  const bank = banks.find((b) => b.code === code)
                  setAddForm((f) => ({ ...f, bankCode: code, bankName: bank?.name ?? '' }))
                }}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500"
              >
                <option value="">Select bank</option>
                {banks.map((b) => (
                  <option key={b.code} value={b.code}>{b.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Account number</label>
              <input
                type="text"
                value={addForm.accountNumber}
                onChange={(e) => setAddForm((f) => ({ ...f, accountNumber: e.target.value.replace(/\D/g, '').slice(0, 15) }))}
                placeholder="10 digits"
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Account name</label>
              <input
                type="text"
                value={addForm.accountName}
                onChange={(e) => setAddForm((f) => ({ ...f, accountName: e.target.value }))}
                placeholder="Name on account"
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <button
              type="button"
              disabled={submitting || !addForm.bankCode || addForm.accountNumber.length < 10 || !addForm.accountName.trim()}
              onClick={async () => {
                setSubmitting(true)
                try {
                  await mechanicsAPI.addBankAccount({
                    bankCode: addForm.bankCode,
                    bankName: addForm.bankName,
                    accountNumber: addForm.accountNumber,
                    accountName: addForm.accountName.trim(),
                  })
                  toast.success('Bank account added')
                  setAddForm({ bankCode: '', bankName: '', accountNumber: '', accountName: '' })
                  setShowAddBank(false)
                  loadData()
                } catch (e: any) {
                  toast.error(e.response?.data?.message || 'Failed to add account')
                } finally {
                  setSubmitting(false)
                }
              }}
              className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
            >
              {submitting ? 'Adding…' : 'Add account'}
            </button>
          </div>
        )}
        <ul className="mt-4 space-y-2">
          {bankAccounts.length === 0 && !showAddBank && (
            <li className="text-slate-500 text-sm py-2">No bank account added yet. Add one so we can pay you.</li>
          )}
          {bankAccounts.map((acc) => (
            <li key={acc.id} className="flex items-center justify-between gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
              <div className="min-w-0">
                <p className="font-medium text-slate-800">{acc.bankName}</p>
                <p className="text-sm text-slate-600">{acc.accountName} · {acc.accountNumber.replace(/(\d{4})(\d{4})(\d+)/, '$1****$3')}</p>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                {!acc.isDefault && (
                  <button
                    type="button"
                    onClick={async () => {
                      try {
                        await mechanicsAPI.setDefaultBankAccount(acc.id)
                        toast.success('Default account updated')
                        loadData()
                      } catch {
                        toast.error('Failed to set default')
                      }
                    }}
                    className="p-2 text-slate-500 hover:text-primary-600 hover:bg-primary-50 rounded-lg"
                    title="Set as default"
                  >
                    <Star className="h-4 w-4" />
                  </button>
                )}
                {acc.isDefault && <span className="px-2 py-0.5 rounded bg-primary-100 text-primary-700 text-xs font-medium">Default</span>}
                <button
                  type="button"
                  onClick={async () => {
                    if (!confirm('Remove this bank account?')) return
                    try {
                      await mechanicsAPI.deleteBankAccount(acc.id)
                      toast.success('Account removed')
                      loadData()
                    } catch {
                      toast.error('Failed to remove')
                    }
                  }}
                  className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
                  title="Remove"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </li>
          ))}
        </ul>
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
                  <Link to={`/mechanic/wallet/transactions/${encodeURIComponent(t.id)}`} className="font-medium text-slate-800 hover:text-primary-700 hover:underline">
                    {typeLabels[t.type] || t.type}
                  </Link>
                  <p className="text-sm text-slate-500 truncate">{t.description || t.bookingId || '—'}</p>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {new Date(t.createdAt).toLocaleString()}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className={`font-semibold ${t.type === 'PLATFORM_PAYOUT' ? 'text-emerald-600' : 'text-slate-800'}`}>
                  {t.type === 'PLATFORM_PAYOUT' ? '+' : '-'}₦{(t.amountNaira ?? t.amountMinor / 100).toLocaleString()}
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
