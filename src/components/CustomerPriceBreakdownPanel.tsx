import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { getBreakdownDisplay } from '../lib/priceBreakdownDisplay'

export type PartLineItemView = {
  name: string
  amountNaira: number
  note?: string
}

export type PriceBreakdownLines = {
  partsNaira: number
  labourNaira: number
  otherFeesNaira: number
  totalNaira: number
  partsLineItems?: PartLineItemView[]
  inspectionPaidNaira?: number
  balanceDueNaira?: number
  previouslyAgreedNaira?: number
  labourLabel?: string
  totalLabel?: string
}

export function quoteToPriceBreakdownLines(quote: {
  quoteType?: string
  customerTotalNaira?: number | null
  proposedPrice?: number | null
  partsNaira?: number | null
  labourNaira?: number | null
  otherFeesNaira?: number | null
  partsLineItems?: PartLineItemView[] | null
}): PriceBreakdownLines | null {
  const total = Number(quote.customerTotalNaira ?? quote.proposedPrice ?? 0)
  if (!total || total <= 0) return null
  const isInspection = quote.quoteType === 'INSPECTION'
  if (isInspection) {
    return {
      partsNaira: 0,
      labourNaira: total,
      otherFeesNaira: 0,
      totalNaira: total,
      labourLabel: 'Inspection / diagnosis fee',
      totalLabel: 'Inspection fee total',
    }
  }
  return {
    partsNaira: Number(quote.partsNaira ?? 0),
    labourNaira: Number(quote.labourNaira ?? 0),
    otherFeesNaira: Number(quote.otherFeesNaira ?? 0),
    totalNaira: total,
    totalLabel: 'Quote total',
    partsLineItems: quote.partsLineItems ?? undefined,
  }
}

function fmt(n: number) {
  return `₦${Number(n).toLocaleString()}`
}

type Props = {
  lines: PriceBreakdownLines
  defaultOpen?: boolean
  title?: string
  hint?: string
}

export function CustomerPriceBreakdownPanel({
  lines,
  defaultOpen = false,
  title = 'Price breakdown',
  hint,
}: Props) {
  const display = getBreakdownDisplay(lines)
  const totalLabel = lines.totalLabel ?? 'Repair total'
  const [open, setOpen] = useState(defaultOpen || !display.collapsible)
  const resolvedHint =
    hint ??
    (display.mode === 'single_total'
      ? undefined
      : 'Review each line before you accept or pay.')

  const headerSubtitle =
    display.mode === 'detailed'
      ? `${display.rows.length} cost lines · ${fmt(lines.totalNaira)}`
      : fmt(lines.totalNaira)

  const body = (
    <div className="px-4 pb-4 pt-0 border-t border-slate-100 space-y-2 text-sm">
      {resolvedHint ? <p className="text-xs text-slate-500 pt-2">{resolvedHint}</p> : null}
      {display.footnote ? <p className="text-xs text-slate-600 italic leading-relaxed">{display.footnote}</p> : null}
      {lines.previouslyAgreedNaira != null && lines.previouslyAgreedNaira > 0 ? (
        <div className="flex justify-between text-slate-600">
          <span>Previously agreed</span>
          <span className="font-medium">{fmt(lines.previouslyAgreedNaira)}</span>
        </div>
      ) : null}
      {display.rows.map((row) => (
        <div key={row.label} className="flex justify-between text-slate-600">
          <span>{row.label}</span>
          <span className={`font-medium text-slate-800 ${row.bold ? 'font-semibold' : ''}`}>
            {fmt(row.valueNaira)}
          </span>
        </div>
      ))}
      {display.mode !== 'single_total' &&
      !(
        display.rows.length === 1 &&
        Math.abs(display.rows[0].valueNaira - lines.totalNaira) < 1
      ) ? (
        <div className="flex justify-between pt-2 border-t border-slate-200 text-slate-800 font-semibold">
          <span>{totalLabel}</span>
          <span>{fmt(lines.totalNaira)}</span>
        </div>
      ) : null}
      {lines.inspectionPaidNaira != null && lines.inspectionPaidNaira > 0 ? (
        <div className="flex justify-between text-emerald-800">
          <span>Minus inspection already paid</span>
          <span className="font-medium">−{fmt(lines.inspectionPaidNaira)}</span>
        </div>
      ) : null}
      {lines.balanceDueNaira != null && lines.balanceDueNaira >= 0 ? (
        <div className="flex justify-between pt-2 border-t border-primary-200 text-primary-800 font-bold">
          <span>Amount you pay</span>
          <span>{fmt(lines.balanceDueNaira)}</span>
        </div>
      ) : null}
    </div>
  )

  if (!display.collapsible) {
    return (
      <div className="mt-3 rounded-xl border border-slate-200 bg-white overflow-hidden">
        <p className="px-4 pt-3 text-sm font-semibold text-slate-800">{title}</p>
        {body}
      </div>
    )
  }

  return (
    <div className="mt-3 rounded-xl border border-slate-200 bg-white overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between gap-2 px-4 py-3 text-left hover:bg-slate-50"
        aria-expanded={open}
      >
        <span>
          <span className="block text-sm font-semibold text-slate-800">{title}</span>
          <span className="block text-xs text-slate-500 mt-0.5">{headerSubtitle}</span>
        </span>
        <ChevronDown
          className={`h-5 w-5 text-slate-500 shrink-0 transition-transform ${open ? 'rotate-180' : ''}`}
        />
      </button>
      {open ? body : null}
    </div>
  )
}
