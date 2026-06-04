import { fmtNaira } from '../../lib/adminFormat'

type Line = { name: string; amountNaira: number; note?: string | null }

export function PartLineItemsView({ items, compact }: { items: Line[] | null | undefined; compact?: boolean }) {
  const lines = (items ?? []).filter((r) => r.name?.trim() && Number(r.amountNaira) > 0)
  if (!lines.length) return null

  if (compact) {
    return (
      <ul className="mt-1 space-y-0.5 text-xs text-slate-600">
        {lines.map((r, i) => (
          <li key={`${r.name}-${i}`}>
            {r.name} · {fmtNaira(r.amountNaira)}
            {r.note?.trim() ? ` (${r.note.trim()})` : ''}
          </li>
        ))}
      </ul>
    )
  }

  return (
    <div className="mt-3 rounded-lg border border-slate-100 overflow-hidden">
      <table className="min-w-full text-xs">
        <thead>
          <tr className="bg-slate-50 text-slate-500 text-left">
            <th className="px-3 py-2 font-semibold">Part / material</th>
            <th className="px-3 py-2 font-semibold">Amount</th>
            <th className="px-3 py-2 font-semibold">Note</th>
          </tr>
        </thead>
        <tbody>
          {lines.map((r, i) => (
            <tr key={`${r.name}-${i}`} className="border-t border-slate-100">
              <td className="px-3 py-2 text-slate-800">{r.name}</td>
              <td className="px-3 py-2 font-medium text-slate-900">{fmtNaira(r.amountNaira)}</td>
              <td className="px-3 py-2 text-slate-600">{r.note?.trim() || '—'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
