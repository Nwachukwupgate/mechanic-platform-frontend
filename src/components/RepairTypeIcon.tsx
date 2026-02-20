import { Wrench, Zap, ThermometerSnowflake, Car } from 'lucide-react'

type FaultCategory = 'MECHANICAL' | 'ELECTRICAL' | 'AC' | 'OTHER'

function inferCategory(name?: string | null, category?: string | null): FaultCategory {
  const c = (category ?? '').toUpperCase()
  if (c === 'MECHANICAL' || c === 'ELECTRICAL' || c === 'AC' || c === 'OTHER') return c as FaultCategory
  const n = (name ?? '').toLowerCase()
  if (/electr|battery|wiring|alternator|starter/.test(n)) return 'ELECTRICAL'
  if (/ac|air.?cond|climate|cooling|a\/c/.test(n)) return 'AC'
  if (/engine|brake|transmission|suspension|oil|mechanical/.test(n)) return 'MECHANICAL'
  return 'OTHER'
}

const config: Record<
  FaultCategory,
  { Icon: typeof Wrench; bg: string; text: string; rounded: string }
> = {
  MECHANICAL: {
    Icon: Wrench,
    bg: 'bg-amber-100',
    text: 'text-amber-700',
    rounded: 'rounded-xl',
  },
  ELECTRICAL: {
    Icon: Zap,
    bg: 'bg-amber-50',
    text: 'text-amber-800',
    rounded: 'rounded-xl',
  },
  AC: {
    Icon: ThermometerSnowflake,
    bg: 'bg-sky-100',
    text: 'text-sky-700',
    rounded: 'rounded-xl',
  },
  OTHER: {
    Icon: Car,
    bg: 'bg-slate-100',
    text: 'text-slate-700',
    rounded: 'rounded-xl',
  },
}

interface RepairTypeIconProps {
  fault?: { name?: string | null; category?: string | null } | null
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const sizeClasses = {
  sm: 'h-8 w-8',
  md: 'h-10 w-10',
  lg: 'h-12 w-12',
}
const iconSizes = {
  sm: 'h-4 w-4',
  md: 'h-5 w-5',
  lg: 'h-6 w-6',
}

export default function RepairTypeIcon({
  fault,
  size = 'md',
  className = '',
}: RepairTypeIconProps) {
  const category = inferCategory(fault?.name, fault?.category)
  const { Icon, bg, text, rounded } = config[category]
  return (
    <span
      className={`inline-flex items-center justify-center shrink-0 ${sizeClasses[size]} ${bg} ${text} ${rounded} ${className}`}
      aria-hidden
    >
      <Icon className={iconSizes[size]} />
    </span>
  )
}
