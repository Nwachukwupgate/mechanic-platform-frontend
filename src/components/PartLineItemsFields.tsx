import { Plus, Trash2 } from 'lucide-react'
import type { PartLineItem } from '../lib/partLineItems'
import { emptyPartLine, sumPartLines } from '../lib/partLineItems'

type Props = {
  items: PartLineItem[]
  onChange: (items: PartLineItem[]) => void
  onPartsTotalChange: (totalNaira: number) => void
}

export function PartLineItemsFields({ items, onChange, onPartsTotalChange }: Props) {
  const rows = items.length ? items : [emptyPartLine()]

  const update = (next: PartLineItem[]) => {
    onChange(next)
    onPartsTotalChange(sumPartLines(next))
  }

  const patch = (index: number, patchRow: Partial<PartLineItem>) => {
    update(rows.map((r, i) => (i === index ? { ...r, ...patchRow } : r)))
  }

  return (
    <div className="space-y-3 rounded-xl border border-slate-200 bg-slate-50 p-3">
      <div>
        <p className="text-sm font-semibold text-slate-800">Parts & materials</p>
        <p className="text-xs text-slate-600 mt-1">
          Name each part, its price, and why (brand, qty, condition). The customer sees every line; we add the total.
        </p>
      </div>
      {rows.map((row, index) => (
        <div key={index} className="rounded-lg border border-slate-200 bg-white p-3 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Part {index + 1}</span>
            {rows.length > 1 ? (
              <button type="button" className="text-red-600" onClick={() => update(rows.filter((_, i) => i !== index))}>
                <Trash2 className="h-4 w-4" />
              </button>
            ) : null}
          </div>
          <input
            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
            placeholder="e.g. Front brake pads"
            value={row.name}
            onChange={(e) => patch(index, { name: e.target.value })}
          />
          <input
            type="number"
            min={0}
            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
            placeholder="Price (₦)"
            value={row.amountNaira > 0 ? row.amountNaira : ''}
            onChange={(e) => patch(index, { amountNaira: parseFloat(e.target.value) || 0 })}
          />
          <input
            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
            placeholder="Why this part / price (optional)"
            value={row.note ?? ''}
            onChange={(e) => patch(index, { note: e.target.value })}
          />
        </div>
      ))}
      <button
        type="button"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-primary-700"
        onClick={() => update([...rows, emptyPartLine()])}
      >
        <Plus className="h-4 w-4" /> Add another part
      </button>
      <p className="text-sm text-slate-700">
        Parts subtotal: <span className="font-semibold">₦{sumPartLines(rows).toLocaleString()}</span>
      </p>
    </div>
  )
}
