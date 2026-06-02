import { Download } from 'lucide-react'
import { useAuthStore } from '../../store/authStore'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000'

type Props = {
  resource: 'bookings' | 'users' | 'mechanics' | 'transactions' | 'quotes' | 'audit' | 'webhooks'
  label?: string
}

export function AdminExportButton({ resource, label }: Props) {
  const download = async () => {
    const token = useAuthStore.getState().token
    const res = await fetch(`${API_URL}/admin/export/${resource}?limit=5000`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    })
    if (!res.ok) {
      throw new Error('Export failed')
    }
    const blob = await res.blob()
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${resource}-${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <button
      type="button"
      onClick={() => void download().catch(() => alert('Export failed'))}
      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-sm font-medium text-slate-700 hover:bg-slate-50"
    >
      <Download className="h-4 w-4" />
      {label ?? `Export ${resource} CSV`}
    </button>
  )
}

export const ADMIN_PERMISSION_OPTIONS = [
  { key: 'read', label: 'Read / CSV export' },
  { key: 'overview', label: 'Dashboard & activity' },
  { key: 'users', label: 'Users' },
  { key: 'mechanics', label: 'Mechanics' },
  { key: 'bookings', label: 'Bookings & quotes' },
  { key: 'payments', label: 'Payments & webhooks' },
  { key: 'complaints', label: 'Reports & complaints' },
  { key: 'audit', label: 'Audit log' },
  { key: 'admins', label: 'Admin accounts' },
] as const
