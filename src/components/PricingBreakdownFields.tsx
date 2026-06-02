import { isLabourMissing, LABOUR_REQUIRED_MESSAGE } from '../lib/priceBreakdownDisplay'

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

export type PricingBaseline = {
  partsNaira: number
  labourNaira: number
  otherFeesNaira: number
  totalNaira: number
  label: string
}

type Props = {
  values: PricingBreakdownValues
  onChange: (values: PricingBreakdownValues) => void
  compact?: boolean
  /** Shown as hints so the mechanic can keep or change each line */
  baseline?: PricingBaseline | null
}

function baselineHint(
  field: keyof Pick<PricingBaseline, 'partsNaira' | 'labourNaira' | 'otherFeesNaira'>,
  baseline: PricingBaseline | null | undefined,
): string | undefined {
  if (!baseline) return undefined
  const n = baseline[field]
  return `Previous ${field === 'partsNaira' ? 'parts' : field === 'labourNaira' ? 'labour' : 'other'}: ₦${Number(n).toLocaleString()}`
}

export function PricingBreakdownFields({ values, onChange, compact, baseline }: Props) {
  const total = pricingTotal(values)
  const parts = parseFloat(values.partsCost) || 0
  const labour = parseFloat(values.labourCost) || 0
  const other = parseFloat(values.otherFees) || 0
  const labourMissing = total > 0 && isLabourMissing(labour)
  const fieldClass = compact
    ? 'w-24 px-2 py-1.5 border border-slate-200 rounded-lg text-sm'
    : 'w-full px-3 py-2 border border-slate-200 rounded-lg text-sm'

  return (
    <div className="space-y-3">
      {baseline ? (
        <p className="text-sm text-slate-600 border-l-4 border-primary-200 pl-3">
          <span className="font-medium text-slate-800">{baseline.label}</span>
          {' · '}
          total ₦{Number(baseline.totalNaira).toLocaleString()}. Adjust only the lines that changed.
        </p>
      ) : (
        <p className="text-sm text-slate-600">
          Labour is required (platform fee applies to labour only). Add parts and other fees if needed.
        </p>
      )}
      <div className={compact ? 'flex flex-wrap gap-3 items-end' : 'grid sm:grid-cols-3 gap-3'}>
        <div>
          <label className="block text-sm font-medium text-slate-600 mb-1">Parts / materials (₦)</label>
          <input
            type="number"
            min="0"
            step="0.01"
            value={values.partsCost}
            onChange={(e) => onChange({ ...values, partsCost: e.target.value })}
            placeholder={baseline ? String(baseline.partsNaira) : '0'}
            className={fieldClass}
          />
          {baselineHint('partsNaira', baseline) ? (
            <p className="text-xs text-slate-500 mt-1">{baselineHint('partsNaira', baseline)}</p>
          ) : null}
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-600 mb-1">
            Labour / workmanship (₦) <span className="text-red-600">*</span>
          </label>
          <input
            type="number"
            min="0"
            step="0.01"
            value={values.labourCost}
            onChange={(e) => onChange({ ...values, labourCost: e.target.value })}
            placeholder={baseline ? String(baseline.labourNaira) : '0'}
            className={fieldClass}
          />
          {baselineHint('labourNaira', baseline) ? (
            <p className="text-xs text-slate-500 mt-1">{baselineHint('labourNaira', baseline)}</p>
          ) : null}
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-600 mb-1">Other fees (₦)</label>
          <input
            type="number"
            min="0"
            step="0.01"
            value={values.otherFees}
            onChange={(e) => onChange({ ...values, otherFees: e.target.value })}
            placeholder={baseline ? String(baseline.otherFeesNaira) : '0'}
            className={fieldClass}
          />
          {baselineHint('otherFeesNaira', baseline) ? (
            <p className="text-xs text-slate-500 mt-1">{baselineHint('otherFeesNaira', baseline)}</p>
          ) : null}
        </div>
      </div>
      {labourMissing ? (
        <p className="text-sm text-amber-800 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
          {LABOUR_REQUIRED_MESSAGE}
        </p>
      ) : null}
      <p className="text-sm text-slate-700">
        Customer total: <span className="font-semibold text-slate-900">₦{total.toLocaleString()}</span>
        <span className="text-slate-500 ml-2">(platform fee applies to labour only)</span>
      </p>
    </div>
  )
}
