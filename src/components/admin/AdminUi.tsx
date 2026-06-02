import { Link } from 'react-router-dom'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { fmtShortDate } from '../../lib/adminFormat'

export function AdminPageHeader({
  title,
  subtitle,
  backTo,
}: {
  title: string
  subtitle?: string
  backTo?: string
}) {
  return (
    <div className="mb-6">
      {backTo ? (
        <Link to={backTo} className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-800 mb-2">
          <ChevronLeft className="h-4 w-4" /> Back
        </Link>
      ) : null}
      <h1 className="text-2xl font-bold text-slate-900">{title}</h1>
      {subtitle ? <p className="text-sm text-slate-600 mt-1">{subtitle}</p> : null}
    </div>
  )
}

export function StatCard({
  label,
  value,
  hint,
  tone = 'default',
}: {
  label: string
  value: string | number
  hint?: string
  tone?: 'default' | 'warn' | 'ok' | 'danger'
}) {
  const toneClass =
    tone === 'warn'
      ? 'border-amber-200 bg-amber-50'
      : tone === 'ok'
        ? 'border-emerald-200 bg-emerald-50'
        : tone === 'danger'
          ? 'border-red-200 bg-red-50'
          : 'border-slate-200 bg-white'
  return (
    <div className={`rounded-xl border p-4 ${toneClass}`}>
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</p>
      <p className="text-2xl font-bold text-slate-900 mt-1">{value}</p>
      {hint ? <p className="text-xs text-slate-600 mt-1">{hint}</p> : null}
    </div>
  )
}

export function AdminPagination({
  page,
  totalPages,
  total,
  onPage,
}: {
  page: number
  totalPages: number
  total: number
  onPage: (p: number) => void
}) {
  if (totalPages <= 1) return <p className="text-xs text-slate-500 mt-3">{total} record(s)</p>
  return (
    <div className="flex items-center justify-between mt-4 gap-3">
      <p className="text-xs text-slate-500">
        Page {page} of {totalPages} · {total} total
      </p>
      <div className="flex gap-2">
        <button
          type="button"
          disabled={page <= 1}
          onClick={() => onPage(page - 1)}
          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 text-sm disabled:opacity-40"
        >
          <ChevronLeft className="h-4 w-4" /> Prev
        </button>
        <button
          type="button"
          disabled={page >= totalPages}
          onClick={() => onPage(page + 1)}
          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 text-sm disabled:opacity-40"
        >
          Next <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}

export function AdminBadge({ children, tone = 'slate' }: { children: React.ReactNode; tone?: string }) {
  const cls: Record<string, string> = {
    slate: 'bg-slate-100 text-slate-700',
    amber: 'bg-amber-100 text-amber-800',
    green: 'bg-emerald-100 text-emerald-800',
    red: 'bg-red-100 text-red-800',
    blue: 'bg-blue-100 text-blue-800',
    violet: 'bg-violet-100 text-violet-800',
  }
  return (
    <span className={`inline-flex px-2 py-0.5 rounded-md text-xs font-semibold ${cls[tone] ?? cls.slate}`}>
      {children}
    </span>
  )
}

export function AdminTable({ children }: { children: React.ReactNode }) {
  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
      <table className="min-w-full text-sm">{children}</table>
    </div>
  )
}

export function AdminTh({ children }: { children: React.ReactNode }) {
  return (
    <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500 bg-slate-50 border-b border-slate-200">
      {children}
    </th>
  )
}

export function AdminTd({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <td className={`px-4 py-3 align-top border-b border-slate-100 text-slate-700 ${className}`}>{children}</td>
}

export function AdminLink({ to, children }: { to: string; children: React.ReactNode }) {
  return (
    <Link to={to} className="font-medium text-violet-700 hover:text-violet-900 hover:underline">
      {children}
    </Link>
  )
}

export function AdminSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm mb-4">
      <h2 className="text-sm font-semibold text-slate-800 mb-3">{title}</h2>
      {children}
    </section>
  )
}

export function AdminJson({ data }: { data: unknown }) {
  return (
    <pre className="text-xs bg-slate-50 border border-slate-200 rounded-lg p-3 overflow-x-auto whitespace-pre-wrap">
      {JSON.stringify(data, null, 2)}
    </pre>
  )
}

export function AdminTimeline({ items }: { items: { at: string; title: string; detail?: string; href?: string }[] }) {
  return (
    <ul className="space-y-3">
      {items.map((item) => (
        <li key={`${item.at}-${item.title}`} className="flex gap-3 text-sm">
          <span className="text-xs text-slate-400 shrink-0 w-36">{fmtShortDate(item.at)}</span>
          <div>
            {item.href ? (
              <Link to={item.href} className="font-medium text-violet-700 hover:underline">
                {item.title}
              </Link>
            ) : (
              <p className="font-medium text-slate-800">{item.title}</p>
            )}
            {item.detail ? <p className="text-slate-600 text-xs mt-0.5">{item.detail}</p> : null}
          </div>
        </li>
      ))}
    </ul>
  )
}
