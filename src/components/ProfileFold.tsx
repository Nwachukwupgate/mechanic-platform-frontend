import { type ReactNode } from 'react'
import { ChevronDown, ChevronUp, type LucideIcon } from 'lucide-react'

type Props = {
  title: string
  icon: LucideIcon
  open: boolean
  onToggle: () => void
  badge?: string
  children: ReactNode
}

export function ProfileFold({ title, icon: Icon, open, onToggle, badge, children }: Props) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white overflow-hidden mb-4 shadow-sm">
      <button
        type="button"
        onClick={onToggle}
        className="w-full flex items-center justify-between gap-3 px-4 py-3.5 bg-gradient-to-r from-slate-50/90 to-white hover:from-slate-50 transition-colors text-left"
      >
        <span className="flex items-center gap-3 min-w-0">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary-50 text-primary-700 ring-1 ring-primary-100">
            <Icon className="h-4 w-4" aria-hidden />
          </span>
          <span className="font-semibold text-slate-800 truncate">{title}</span>
          {badge ? (
            <span className="shrink-0 text-[11px] font-bold uppercase tracking-wide text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
              {badge}
            </span>
          ) : null}
        </span>
        {open ? <ChevronUp className="h-5 w-5 text-slate-400 shrink-0" /> : <ChevronDown className="h-5 w-5 text-slate-400 shrink-0" />}
      </button>
      {open ? <div className="px-4 pb-4 pt-1 border-t border-slate-100 space-y-4">{children}</div> : null}
    </div>
  )
}
