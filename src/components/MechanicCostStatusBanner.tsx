import { Clock, CheckCircle2, AlertCircle } from 'lucide-react'

type Props = {
  status: string | undefined
  rejectionReason?: string | null
  balanceDueNaira?: number | null
}

export function MechanicCostStatusBanner({ status, rejectionReason, balanceDueNaira }: Props) {
  if (rejectionReason) {
    return (
      <div className="mb-3 flex gap-3 rounded-xl border border-red-200 bg-red-50 p-4">
        <AlertCircle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-semibold text-red-900">Customer declined your quote</p>
          <p className="text-sm text-red-800 mt-1">{rejectionReason}</p>
          <p className="text-xs text-red-700 mt-2">Adjust the breakdown below and send again.</p>
        </div>
      </div>
    )
  }

  if (status === 'SUBMITTED') {
    return (
      <div className="mb-3 flex gap-3 rounded-xl border border-amber-300 bg-amber-50 p-4">
        <Clock className="h-5 w-5 text-amber-700 shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-semibold text-amber-900">Customer has not accepted this price yet</p>
          <p className="text-sm text-amber-800 mt-1">
            Your cost breakdown was sent for approval. They can accept or decline from their booking page.
            You cannot edit these figures until they respond.
          </p>
        </div>
      </div>
    )
  }

  if (status === 'ACCEPTED') {
    return (
      <div className="mb-3 flex gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4">
        <CheckCircle2 className="h-5 w-5 text-emerald-700 shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-semibold text-emerald-900">Customer accepted your quote</p>
          <p className="text-sm text-emerald-800 mt-1">
            {balanceDueNaira != null && balanceDueNaira > 0
              ? `They can now pay the balance of ₦${Number(balanceDueNaira).toLocaleString()} in the app.`
              : 'No further balance is due from the customer for this job.'}
          </p>
        </div>
      </div>
    )
  }

  return null
}
