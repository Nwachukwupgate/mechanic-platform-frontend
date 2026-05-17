export type PricingBreakdownValues = {
  partsCost: string
  labourCost: string
  otherFees: string
}

export function pricingTotal(values: PricingBreakdownValues): number {
  const parts = parseFloat(values.partsCost) || 0
  const labour = parseFloat(values.labourCost) || 0
  const other = parseFloat(values.otherFees) || 0
  return parts + labour + other
}

type Props = {
  values: PricingBreakdownValues
  onChange: (values: PricingBreakdownValues) => void
  compact?: boolean
}

export function PricingBreakdownFields({ values, onChange, compact }: Props) {
  const total = pricingTotal(values)
  const fieldClass = compact
    ? 'w-24 px-2 py-1.5 border border-slate-200 rounded-lg text-sm'
    : 'w-full px-3 py-2 border border-slate-200 rounded-lg text-sm'

  return (
    <div className="space-y-3">
      <div className={compact ? 'flex flex-wrap gap-3 items-end' : 'grid sm:grid-cols-3 gap-3'}>
        <div>
          <label className="block text-sm font-medium text-slate-600 mb-1">Parts / materials (₦)</label>
          <input
            type="number"
            min="0"
            step="0.01"
            value={values.partsCost}
            onChange={(e) => onChange({ ...values, partsCost: e.target.value })}
            placeholder="0"
            className={fieldClass}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-600 mb-1">Labour / service (₦)</label>
          <input
            type="number"
            min="0"
            step="0.01"
            value={values.labourCost}
            onChange={(e) => onChange({ ...values, labourCost: e.target.value })}
            placeholder="0"
            className={fieldClass}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-600 mb-1">Other fees (₦)</label>
          <input
            type="number"
            min="0"
            step="0.01"
            value={values.otherFees}
            onChange={(e) => onChange({ ...values, otherFees: e.target.value })}
            placeholder="0"
            className={fieldClass}
          />
        </div>
      </div>
      <p className="text-sm text-slate-700">
        Customer total: <span className="font-semibold text-slate-900">₦{total.toLocaleString()}</span>
        <span className="text-slate-500 ml-2">(platform fee applies to labour only)</span>
      </p>
    </div>
  )
}
