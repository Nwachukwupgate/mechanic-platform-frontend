type Summary = {
  partsNaira?: number | null
  labourNaira?: number | null
  otherFeesNaira?: number | null
  customerTotalNaira?: number | null
  platformFeeNaira?: number | null
  settled?: boolean
}

export function PricingBreakdownSummary({ summary }: { summary: Summary | null | undefined }) {
  if (!summary?.customerTotalNaira) return null
  const fmt = (n: number | null | undefined) =>
    n != null && n > 0 ? `₦${Number(n).toLocaleString()}` : null

  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm space-y-1">
      {fmt(summary.partsNaira) && (
        <p className="text-slate-600">
          Parts / materials: <span className="font-medium text-slate-800">{fmt(summary.partsNaira)}</span>
        </p>
      )}
      {fmt(summary.labourNaira) && (
        <p className="text-slate-600">
          Labour / service: <span className="font-medium text-slate-800">{fmt(summary.labourNaira)}</span>
        </p>
      )}
      {fmt(summary.otherFeesNaira) && (
        <p className="text-slate-600">
          Other fees: <span className="font-medium text-slate-800">{fmt(summary.otherFeesNaira)}</span>
        </p>
      )}
      <p className="text-slate-800 font-semibold pt-1 border-t border-slate-200">
        Total payable: ₦{Number(summary.customerTotalNaira).toLocaleString()}
      </p>
      {summary.settled && summary.platformFeeNaira != null && summary.platformFeeNaira > 0 && (
        <p className="text-xs text-slate-500">Platform fee (on labour): ₦{Number(summary.platformFeeNaira).toLocaleString()}</p>
      )}
    </div>
  )
}
