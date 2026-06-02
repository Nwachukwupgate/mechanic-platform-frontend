import { useEffect, useState, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { adminAPI, type AdminStats, type ActivityItem } from '../../services/adminApi'
import { onAdminLive, disconnectAdminSocket, type AdminLiveEvent } from '../../services/adminSocket'
import { fmtNaira, fmtShortDate } from '../../lib/adminFormat'
import { AdminPageHeader, StatCard, AdminBadge } from '../../components/admin/AdminUi'
import { AdminExportButton } from '../../components/admin/AdminExportButton'

function activityHref(item: { kind: string; entityType?: string; entityId?: string }): string | undefined {
  if (item.kind === 'booking' || item.kind === 'quote' || item.kind === 'invoice')
    return item.entityId ? `/admin/bookings/${item.entityId}` : undefined
  if (item.kind === 'transaction') return item.entityId ? `/admin/transactions/${item.entityId}` : undefined
  if (item.kind === 'report') return item.entityId ? `/admin/reports/${item.entityId}` : undefined
  if (item.kind === 'paystack') return item.entityId ? `/admin/webhooks` : undefined
  if (item.kind === 'audit') return `/admin/audit`
  return undefined
}

function toActivityItem(e: AdminLiveEvent): ActivityItem {
  return {
    id: `live-${e.at}-${e.title}`,
    kind: e.kind,
    title: e.title,
    detail: e.detail ?? '',
    entityType: e.entityType ?? e.kind,
    entityId: e.entityId ?? '',
    at: e.at,
  }
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [activity, setActivity] = useState<ActivityItem[]>([])
  const [liveEvents, setLiveEvents] = useState<AdminLiveEvent[]>([])
  const [liveConnected, setLiveConnected] = useState(false)
  const [loading, setLoading] = useState(true)

  const refreshStats = useCallback(() => {
    adminAPI.getStats().then((s) => setStats(s.data))
  }, [])

  useEffect(() => {
    Promise.all([adminAPI.getStats(), adminAPI.getActivity(80)])
      .then(([s, a]) => {
        setStats(s.data)
        setActivity(a.data.items)
      })
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    const unsub = onAdminLive((event) => {
      setLiveConnected(true)
      setLiveEvents((prev) => [event, ...prev].slice(0, 40))
      refreshStats()
    })
    const t = window.setTimeout(() => setLiveConnected(true), 1500)
    return () => {
      unsub()
      clearTimeout(t)
      disconnectAdminSocket()
    }
  }, [refreshStats])

  if (loading) return <p className="text-slate-600">Loading dashboard…</p>
  if (!stats) return <p className="text-red-600">Could not load stats.</p>

  const mergedFeed = [
    ...liveEvents.map(toActivityItem),
    ...activity.filter((a) => !liveEvents.some((l) => l.entityId && l.entityId === a.entityId && l.title === a.title)),
  ].slice(0, 80)

  return (
    <>
      <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
        <AdminPageHeader
          title="Platform overview"
          subtitle="Live websocket feed plus historical activity for full system visibility."
        />
        <div className="flex flex-wrap gap-2">
          <AdminExportButton resource="bookings" label="Export bookings" />
          <AdminExportButton resource="transactions" label="Export payments" />
        </div>
      </div>

      <div className="flex items-center gap-2 mb-4">
        <span
          className={`inline-flex h-2.5 w-2.5 rounded-full ${liveConnected ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300'}`}
        />
        <span className="text-xs font-medium text-slate-600">
          {liveConnected ? 'Live updates connected' : 'Connecting to live feed…'}
        </span>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        <StatCard label="Customers" value={stats.usersCount} hint={`${stats.bookingsLast24h} bookings (24h)`} />
        <StatCard label="Mechanics" value={stats.mechanicsCount} hint={`${stats.verifiedMechanics} verified`} />
        <StatCard label="Bookings" value={stats.bookingsCount} />
        <StatCard label="Gross payments" value={fmtNaira(stats.revenueNaira)} tone="ok" />
        <StatCard label="Open disputes" value={stats.disputedCount} tone={stats.disputedCount ? 'danger' : 'default'} />
        <StatCard label="Open reports" value={stats.openReportsCount} tone={stats.openReportsCount ? 'warn' : 'default'} />
        <StatCard label="Pending quotes" value={stats.pendingQuotesCount} />
        <StatCard label="Failed payments" value={stats.failedTransactionsCount} tone={stats.failedTransactionsCount ? 'warn' : 'default'} />
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-slate-800">Activity feed</h2>
          <Link to="/admin/audit" className="text-xs font-medium text-violet-700 hover:underline">
            Audit log →
          </Link>
        </div>
        <ul className="divide-y divide-slate-100 max-h-[520px] overflow-y-auto">
          {mergedFeed.map((item) => {
            const href = activityHref(item)
            const isLive = liveEvents.some((l) => l.at === item.at && l.title === item.title)
            return (
              <li key={item.id} className="py-3 flex gap-3 text-sm">
                <span className="text-xs text-slate-400 shrink-0 w-32">{fmtShortDate(item.at)}</span>
                <AdminBadge tone={isLive ? 'green' : item.kind === 'paystack' ? 'violet' : 'slate'}>
                  {isLive ? 'live' : item.kind}
                </AdminBadge>
                <div className="min-w-0 flex-1">
                  {href ? (
                    <Link to={href} className="font-medium text-violet-700 hover:underline">
                      {item.title}
                    </Link>
                  ) : (
                    <p className="font-medium text-slate-800">{item.title}</p>
                  )}
                  {item.detail ? <p className="text-slate-600 text-xs mt-0.5 truncate">{item.detail}</p> : null}
                </div>
              </li>
            )
          })}
        </ul>
      </div>
    </>
  )
}
