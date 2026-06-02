export function fmtNaira(n: number | null | undefined) {
  if (n == null || Number.isNaN(Number(n))) return ''
  return `₦${Number(n).toLocaleString()}`
}

export function fmtNairaMinor(minor: number | null | undefined) {
  if (minor == null) return ''
  return fmtNaira(minor / 100)
}

export function fmtDate(iso: string | Date | null | undefined) {
  if (!iso) return ''
  const d = typeof iso === 'string' ? new Date(iso) : iso
  return d.toLocaleString()
}

export function fmtShortDate(iso: string | Date | null | undefined) {
  if (!iso) return ''
  const d = typeof iso === 'string' ? new Date(iso) : iso
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}

export type Paginated<T> = {
  items: T[]
  total: number
  page: number
  limit: number
  totalPages: number
}
