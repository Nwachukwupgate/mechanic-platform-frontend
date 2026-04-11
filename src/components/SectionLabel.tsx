import type { ReactNode } from 'react'

/** Eyebrow label — matches marketing / mobile section rhythm */
export function SectionLabel({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <p className={`text-xs font-semibold uppercase tracking-wider text-primary-600 ${className}`.trim()}>{children}</p>
  )
}
