import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { walletAPI, getApiErrorMessage } from '../../services/api'
import LoadingSpinner from '../../components/LoadingSpinner'

export default function MechanicTransactionDetail() {
  const { id } = useParams()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [detail, setDetail] = useState<any>(null)

  useEffect(() => {
    if (!id) return
    setLoading(true)
    setError('')
    walletAPI
      .getTransaction(id)
      .then((r) => setDetail(r.data))
      .catch((e) => setError(getApiErrorMessage(e, 'Could not load transaction')))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner variant="logo" size="lg" />
      </div>
    )
  }

  if (error || !detail) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-red-800">
        {error || 'Transaction not found'}
      </div>
    )
  }

  const amount = detail.amountNaira ?? (detail.amountMinor ?? 0) / 100
  const type =
    detail.type === 'AUTO_PLATFORM_FEE_SETTLEMENT' || detail.type === 'PLATFORM_FEE_AUTO_SETTLEMENT'
      ? 'Auto fee settlement'
      : String(detail.type || '').replace(/_/g, ' ')
  const rows = detail.detailLines ?? []
  const feeSplit = detail.feeSplit

  return (
    <div className="max-w-3xl">
      <Link to="/mechanic/wallet" className="text-sm text-primary-600 hover:underline">
        ← Back to wallet
      </Link>
      <div className="mt-3 bg-white rounded-xl shadow-card border border-slate-100 p-6">
        <p className="text-xs font-semibold tracking-wide uppercase text-primary-700">{type}</p>
        <p className="mt-1 text-3xl font-bold text-slate-900">₦{amount.toLocaleString()}</p>
        <p className="mt-2 text-sm text-slate-500">
          Status: <span className="font-medium text-slate-700">{detail.status}</span> ·{' '}
          {new Date(detail.createdAt).toLocaleString()}
        </p>
        {detail.description && <p className="mt-3 text-sm text-slate-700">{detail.description}</p>}
      </div>

      {feeSplit && (
        <div className="mt-4 bg-white rounded-xl shadow-card border border-slate-100 p-6">
          <h2 className="font-semibold text-slate-900 mb-3">How this payment splits</h2>
          <p className="text-sm text-slate-700">Customer job total: ₦{(feeSplit.grossNaira ?? 0).toLocaleString()}</p>
          <p className="text-sm text-slate-700 mt-1">
            Platform fee: {feeSplit.platformFeePercent}% · Your share: {feeSplit.mechanicSharePercent}%
          </p>
          {feeSplit.platformKeepsNaira != null && (
            <p className="text-sm text-slate-700 mt-1">Platform retains ₦{feeSplit.platformKeepsNaira.toLocaleString()}</p>
          )}
          {feeSplit.directFeeOwedNaira != null && (
            <p className="text-sm text-slate-700 mt-1">
              Direct-payment platform fee for this job: ₦{feeSplit.directFeeOwedNaira.toLocaleString()}
            </p>
          )}
        </div>
      )}

      <div className="mt-4 bg-white rounded-xl shadow-card border border-slate-100 p-6">
        <h2 className="font-semibold text-slate-900 mb-3">Details</h2>
        <div className="divide-y divide-slate-100">
          {rows.map((row: { label: string; value: string }, idx: number) => (
            <div key={`${row.label}-${idx}`} className="py-2 flex items-center justify-between gap-4 text-sm">
              <span className="text-slate-500">{row.label}</span>
              <span className="font-medium text-slate-800 text-right">{row.value}</span>
            </div>
          ))}
        </div>
        {(detail.reference || detail.paystackReference) && (
          <div className="mt-4 pt-4 border-t border-slate-100 text-xs text-slate-500 space-y-1">
            {detail.reference && <p>Reference: {detail.reference}</p>}
            {detail.paystackReference && <p>Paystack: {detail.paystackReference}</p>}
          </div>
        )}
      </div>
    </div>
  )
}
