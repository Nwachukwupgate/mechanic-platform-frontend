import { Zap, Clock, FileText, Info } from 'lucide-react'
import type { CustomerWhatsNext, WhatsNextTone } from '../lib/bookingWhatsNext'

const toneClass: Record<
  WhatsNextTone,
  { wrap: string; title: string; icon: typeof Zap }
> = {
  action: {
    wrap: 'bg-primary-50 border-primary-200',
    title: 'text-primary-900',
    icon: Zap,
  },
  waiting: {
    wrap: 'bg-amber-50 border-amber-200',
    title: 'text-amber-900',
    icon: Clock,
  },
  review: {
    wrap: 'bg-orange-50 border-orange-200',
    title: 'text-orange-900',
    icon: FileText,
  },
  neutral: {
    wrap: 'bg-slate-50 border-slate-200',
    title: 'text-slate-800',
    icon: Info,
  },
}

export function BookingWhatsNextCard({ step }: { step: CustomerWhatsNext }) {
  const t = toneClass[step.tone]
  const Icon = t.icon
  return (
    <div className={`mt-4 p-4 rounded-xl border ${t.wrap}`}>
      <div className="flex gap-3">
        <Icon className={`h-5 w-5 shrink-0 mt-0.5 ${t.title}`} aria-hidden />
        <div>
          {step.stepLabel ? (
            <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500 mb-1">
              {step.stepLabel}
            </p>
          ) : null}
          <p className={`text-sm font-semibold ${t.title}`}>{step.title}</p>
          <p className="text-sm text-slate-600 mt-1 leading-relaxed">{step.body}</p>
        </div>
      </div>
    </div>
  )
}
